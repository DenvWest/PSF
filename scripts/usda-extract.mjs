#!/usr/bin/env node
/**
 * USDA FoodData Central → verificatierapport voor food-sources.ts
 *
 * ## Wat dit script doet
 *
 * Voor elke fetchbare identiteit in de catalogus haalt het de beste FDC-match
 * op en legt het de gevonden gehaltes naast wat er in `food-sources.ts` staat.
 * Het schrijft een rapport; het **patcht niets**. Dat is dezelfde regel die
 * SPEC_VOEDINGSBRONNEN_VERIFICATIE.md al hanteert, en hij staat er om één
 * reden: de matchbeoordeling is het werk, niet het ophalen.
 *
 * "Bread, whole-wheat, commercially prepared" is niet hetzelfde als Nederlands
 * volkorenbrood — andere uitmaalgraad, ander recept, ander zoutgehalte. Een
 * script dat die match automatisch overneemt, produceert een getal dat er
 * precies zo uitziet als een goed getal.
 *
 * ## De lijst komt uit de catalogus, niet uit dit bestand
 *
 * De vorige zoeklijst stond hardgecodeerd op 54 rijen — een momentopname uit
 * een tijd dat de catalogus 61 gevulde regels had. Inmiddels is hij losgeraakt:
 * queries die naar niets meer wijzen, en tientallen gevulde bronnen zonder
 * audit-query. Daarom leest het script nu `food-catalog.ts` en bouwt de
 * werklijst dááruit:
 *
 *   - elke regel zónder `geenBron` levert een fetchbare identiteit
 *     (`bron` bij een gevulde regel — dan is het een audit; anders de
 *     catalogus-key — dan is het nieuw werk uit `zonderBron()`);
 *   - regels met `geenBron` doen niet mee: die krijgen nooit een USDA-getal
 *     (verwaarloosbaar, verrijkt/etiket, of samengesteld);
 *   - identiteiten uit `NIET_UIT_USDA` worden overgeslagen: nationaal geregeld.
 *
 * Voor de zoekterm zelf blijft een curated `QUERIES`-map nodig: een Engelse
 * query met de val erbij. Een identiteit zónder query komt als
 * `query-ontbreekt` in het rapport — een eerlijk gat, geen blinde zoekopdracht
 * op een Nederlands label (dat zou juist de foute-match-val zijn). Zo dekt de
 * run de hele catalogus en zegt hij precies welke queries nog geschreven moeten.
 *
 * ## Waarom Foundation Foods voorgaat
 *
 * Alleen dat datatype draagt per nutriënt de waargenomen `min`, `max`,
 * `median` en `dataPoints` — de spreiding van de werkelijke monsters. Dat is
 * precies wat de klassenband uit ONDERZOEK_SPREIDING_EN_USDA §1.7 moet
 * vervangen. SR Legacy is de terugval; Branded levert geen micronutriënten
 * (een etiket vermeldt ze wettelijk niet) en wordt overgeslagen.
 *
 * ## Gebruik
 *
 *   FDC_API_KEY=<sleutel van api.data.gov> node scripts/usda-extract.mjs
 *   FDC_API_KEY=... node scripts/usda-extract.mjs --only=amandelen,quinoa
 *   node scripts/usda-extract.mjs --plan   (geen API — toont alleen de dekking)
 *
 * Uitvoer: scripts/out/usda-rapport.json + een samenvatting op stdout.
 *
 * ## Nutriëntnummers — geverifieerd (sep 2026)
 *
 * De nummers hieronder zijn tegen USDA-documentatie gelegd: de 4-cijferige
 * FDC-nutriënt-ID's en hun 3-cijferige SR-Legacy-equivalenten (de FNDDS
 * Appendix K-crosswalk mapt die twee op elkaar). Alle zes bevestigd:
 *
 *   Protein            203 / 1003
 *   Magnesium, Mg      304 / 1090
 *   Zinc, Zn           309 / 1095
 *   Vitamin D (D2+D3)  328 / 1114
 *   EPA 20:5 n-3       629 / 1278
 *   DHA 22:6 n-3       621 / 1272
 *
 * Bronnen: FDC OpenAPI-nutriëntdocumentatie (fdc.nal.usda.gov/api-spec) en de
 * FNDDS-documentatie (Appendix K, ars.usda.gov). Het script matcht bovendien op
 * naampatroon (`namePat`), zodat een editie die een afwijkend nummer voert
 * alsnog aanslaat, en het logt per stof welke sleutel aansloeg — lees die regel
 * bij de eerste echte API-run als extra controle.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const API = "https://api.nal.usda.gov/fdc/v1";
const KEY = process.env.FDC_API_KEY;
const OUT_DIR = path.join("scripts", "out");
const OUT_FILE = path.join(OUT_DIR, "usda-rapport.json");
const CATALOG_FILE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "data",
  "nutrition",
  "food-catalog.ts",
);

const PLAN = process.argv.includes("--plan");

/**
 * De vijf stoffen, elk met de USDA-nummers en de naampatronen waarop we
 * matchen. Omega-3 is de uitzondering: EPA en DHA zijn aparte velden en
 * worden opgeteld — dat is de reden dat USDA hier voorgaat op NEVO, dat de
 * vetzuren vaak niet uitsplitst.
 */
const NUTRIENTS = {
  protein:   { nbrs: ["203", "1003"], namePat: /^protein$/i,                          unit: "g"  },
  magnesium: { nbrs: ["304", "1090"], namePat: /^magnesium,\s*mg$/i,                  unit: "mg" },
  zinc:      { nbrs: ["309", "1095"], namePat: /^zinc,\s*zn$/i,                       unit: "mg" },
  vitamin_d: { nbrs: ["328", "1114"], namePat: /^vitamin d \(d2 \+ d3\)$/i,           unit: "µg" },
  epa:       { nbrs: ["629", "1278"], namePat: /20:5\s*n-3/i,                         unit: "mg" },
  dha:       { nbrs: ["621", "1272"], namePat: /22:6\s*n-3/i,                         unit: "mg" },
};

/**
 * De curated zoektermen, gekozen per identiteit in de catalogus (een
 * `bron`-sleutel bij een gevulde regel, of de catalogus-key bij een open
 * regel). `q` is de Engelse zoekterm; `let` is waar de beoordelaar op moet
 * letten — geen documentatie maar werkinstructie: de val waar een automatische
 * match in trapt. Een ★ markeert een rij die een expliciet oordeel vraagt.
 *
 * `kern` is de vangrail, en hij is er niet theoretisch: in de eerste echte
 * API-run (17 sep 2026) zat 13 van de 53 rijen ernaast doordat het script
 * `treffers[0]` blind overnam. "herring atlantic raw" gaf kabeljauw — er is
 * geen haring in de Foundation-tak, dus FDC gaf het populairste record dat
 * "atlantic" of "raw" deelde. "black beans cooked boiled" gaf boerenkool, dat
 * "cooked, boiled, drained" in zijn naam draagt. "tofu raw firm" gaf bieten,
 * "leverpastei" gaf tomatenpuree, "sardines" gaf ansjovis.
 *
 * Elk van die getallen zag er precies zo uit als een goed getal. Daarom moet
 * de beschrijving van het gekozen record minstens één `kern`-term bevatten,
 * anders telt de treffer niet. Voeg je een query toe, dan hoort er een kern
 * bij; zonder kern slaat het script de rij over in plaats van te gokken.
 *
 * Deze map is bewust NIET de werklijst — die komt uit de catalogus. Staat een
 * fetchbare identiteit hier niet in, dan meldt het rapport `query-ontbreekt`
 * in plaats van blind op het Nederlandse label te zoeken.
 */
export const QUERIES = {
  amandelen:            { q: "almonds raw",                          kern: ["almond"], let: "ongezouten, ongeroosterd" },
  walnoten:             { q: "walnuts english raw",                  kern: ["walnut"], let: "ALA, telt niet mee voor EPA/DHA" },
  cashewnoten:          { q: "cashew nuts raw",                      kern: ["cashew"], let: "rauw, niet geroosterd/gezouten" },
  pompoenzaden:         { q: "pumpkin seeds kernels dried",          kern: ["pumpkin"], let: "gepeld; ongepeld scheelt fors" },
  zonnebloempitten:     { q: "sunflower seed kernels dried",         kern: ["sunflower"], let: "ongezouten" },
  hennepzaad:           { q: "hemp seed hulled",                     kern: ["hemp"], let: "gepeld" },
  lijnzaad:             { q: "flaxseed",                             kern: ["flaxseed", "flax seed", "linseed"], let: "gemalen vs heel; ALA-bron" },
  tahin:                { q: "sesame butter tahini",                 kern: ["tahini", "sesame"], let: "van geroosterd of rauw zaad" },

  havermout:            { q: "oats whole grain rolled",                                 kern: ["oats,"], let: "★ eerste treffer was havermeel (Flour, oat) — kern op \"oats,\" dwingt de vlokken af" },
  volkorenbrood:        { q: "bread whole-wheat commercially prepared", kern: ["bread"], let: "★ NL-volkoren wijkt af — andere uitmaalgraad en zout. Twijfel = geen match" },
  "volkoren-pasta":     { q: "pasta whole-wheat dry",                kern: ["pasta", "spaghetti", "macaroni"], let: "droog" },
  quinoa:               { q: "quinoa cooked",                        kern: ["quinoa"], let: "gekookt, niet droog" },
  zilvervliesrijst:     { q: "rice brown long-grain cooked",         kern: ["rice"], let: "gekookt" },
  "rijst-wit-gekookt":  { q: "rice white long-grain regular enriched cooked", kern: ["rice"], let: "★ VS verrijkt witte rijst; NL niet. Regular, niet parboiled (dat scheelt in mineralen)" },
  "aardappel-gekookt":  { q: "potatoes boiled cooked without skin flesh",         kern: ["potato"], let: "★ gekookt zonder schil, vruchtvlees — niet het schil-record" },

  linzen:               { q: "lentils mature seeds cooked boiled without salt",                kern: ["lentil"], let: "gekookt zonder zout" },
  kikkererwten:         { q: "chickpeas mature seeds cooked boiled without salt",            kern: ["chickpea", "garbanzo"], let: "gekookt, niet uit blik" },
  "zwarte-bonen":       { q: "beans black mature seeds cooked boiled without salt",            kern: ["black"], let: "gekookt" },
  kidneybonen:          { q: "beans kidney red mature seeds cooked boiled without salt",       kern: ["kidney"], let: "gekookt" },
  "witte-bonen":        { q: "beans white mature seeds cooked boiled without salt",             kern: ["bean"], let: "gekookt; ★ USDA schrijft \"Beans, white\" — kern op \"white bean\" mist dat" },
  "erwten-diepvries":   { q: "peas green frozen cooked boiled drained without salt",                    kern: ["pea"], let: "diepvries, onbereid" },
  tofu:                 { q: "tofu raw firm",                        kern: ["tofu"], let: "★ calciumsulfaat vs nigari scheelt in mineralen" },
  tempe:                { q: "tempeh",                               kern: ["tempeh"], let: "onbereid" },

  spinazie:             { q: "spinach cooked boiled drained without salt",        kern: ["spinach"], let: "gekookt en uitgelekt" },
  boerenkool:           { q: "kale cooked boiled drained",           kern: ["kale"], let: "gekookt" },
  snijbiet:             { q: "chard swiss cooked boiled drained without salt",            kern: ["chard"], let: "gekookt" },
  "broccoli-gekookt":   { q: "broccoli cooked boiled drained without salt",       kern: ["broccoli"], let: "gekookt" },
  "paprika-rauw":       { q: "peppers sweet red raw",                kern: ["pepper"], let: "rauw" },
  "paddenstoelen-uv":   { q: "mushrooms white exposed to ultraviolet light", kern: ["mushroom"], let: "★ alleen UV-behandeld draagt vitamine D" },
  banaan:               { q: "bananas ripe raw",                          kern: ["banana"], let: "★ overrijp scheelt in suiker; \"ripe and slightly ripe\" is de normale banaan" },
  avocado:              { q: "avocados raw",                         kern: ["avocado"], let: "rauw" },
  "gedroogde-vijgen":   { q: "figs dried uncooked",                  kern: ["fig"], let: "gedroogd" },

  "zalm-gekweekt":      { q: "salmon atlantic farmed raw",           kern: ["salmon"], let: "★ gekweekt ≠ wild; vitamine D en EPA/DHA verschillen factor 2–4" },
  "zalm-wild":          { q: "salmon atlantic wild raw",             kern: ["salmon"], let: "★ vangstgebied telt: Oostzee ≈ 2× Noordzee" },
  makreel:              { q: "mackerel atlantic raw",                kern: ["mackerel"], let: "★ soort telt: Atlantic ≠ King ≠ Spanish" },
  haring:               { q: "herring atlantic raw",                 kern: ["herring"], let: "rauw, niet gerookt of gemarineerd" },
  sardines:             { q: "sardines atlantic canned in oil drained", kern: ["sardine"], let: "uitgelekt; op olie vs water scheelt" },
  "tonijn-blik":        { q: "tuna light canned in water drained",   kern: ["tuna"], let: "op water, uitgelekt" },
  kabeljauw:            { q: "cod atlantic raw",                     kern: ["cod"], let: "rauw" },
  garnalen:             { q: "shrimp raw",                           kern: ["shrimp", "prawn"], let: "rauw" },
  oesters:              { q: "oysters eastern raw",                  kern: ["oyster"], let: "★ zink varieert extreem per soort en seizoen" },

  kipfilet:             { q: "chicken breast skinless boneless raw", kern: ["chicken"], let: "zonder vel, rauw" },
  "rundvlees-mager":    { q: "beef loin lean raw",                   kern: ["beef"], let: "mager, rauw" },
  varkenshaas:          { q: "pork tenderloin lean raw",             kern: ["pork"], let: "rauw" },
  kalfsvlees:           { q: "veal loin lean raw",                   kern: ["veal"], let: "rauw" },
  lamsvlees:            { q: "lamb loin lean raw",                   kern: ["lamb"], let: "rauw" },
  leverpastei:          { q: "liver pate chicken canned",            kern: ["pate", "liver"], let: "★ leverproducten verschillen sterk per recept" },

  eieren:               { q: "egg whole raw fresh",                  kern: ["egg"], let: "★ vitamine D volgt het legvoer; NL-waarde kan afwijken" },
  "magere-kwark":       { q: "cheese cottage lowfat",                kern: ["cottage"], let: "★ kwark bestaat niet in de VS — beste benadering is magere kwark uit NEVO of etiket" },
  skyr:                 { q: "yogurt greek plain nonfat",            kern: ["yogurt", "skyr"], let: "★ skyr ≠ Griekse yoghurt; eiwit ligt hoger" },
  "griekse-yoghurt":    { q: "yogurt greek plain whole milk",        kern: ["yogurt"], let: "vetgehalte bepaalt eiwit per 100 g" },
  huttenkase:           { q: "cheese cottage creamed large curd",    kern: ["cottage"], let: "vetgehalte" },
  "belegen-kaas":       { q: "cheese gouda",                         kern: ["gouda", "cheese"], let: "★ rijping bepaalt vocht en dus eiwit per 100 g" },
};

/** Producten die nooit uit USDA komen — verrijking is nationaal geregeld. */
export const NIET_UIT_USDA = {
  halvarine: "NL-kader: 7,5 µg vitamine D per 100 g (25 µg voor ouderenvarianten)",
  "sojadrink-verrijkt": "verrijking is fabrikantkeuze binnen NL-kader — etiket is de bron",
  "plantaardige-drank-verrijkt": "idem",
  melk: "verplicht verrijkt sinds 2021: 1,5 µg per 100 ml",
  algenolie: "productspecificatie van de fabrikant",
  zonlicht: "geen voedingsmiddel",
};

/**
 * Lees de catalogus en leid de fetchbare identiteiten af. Puur tekstueel, want
 * dit script draait op `node` zonder TS-loader. Per `f("key", …, bron, {…})`:
 * de key, de `bron` (null of een sleutel) en een eventueel `geenBron`.
 */
export function leesCatalogus() {
  const src = fs.readFileSync(CATALOG_FILE, "utf8");
  const regels = src.split("\n");
  const entries = [];
  let buffer = "";

  const verwerk = (blok) => {
    const key = blok.match(/f\("([^"]+)"/);
    if (!key) return;
    const geenBron = (blok.match(/geenBron:\s*"(\w+)"/) ?? [])[1] ?? null;
    // `bron` staat na de porties (die eindigen op `]` of `P.xxx`): een komma,
    // dan null of "sleutel", dan `, {` (extra volgt) of `)` (einde call).
    const bron = blok.match(/(?:\]|P\.\w+)\s*,\s*(null|"[^"]+")\s*(?:,\s*\{|\))/);
    const bronWaarde = !bron || bron[1] === "null" ? null : bron[1].slice(1, -1);
    entries.push({ key: key[1], bron: bronWaarde, geenBron });
  };

  for (const regel of regels) {
    if (/^\s*f\("/.test(regel)) {
      if (buffer) verwerk(buffer);
      buffer = regel;
    } else if (buffer) {
      buffer += " " + regel.trim();
      if (/\}\),?\s*$|null\),?\s*$|"\),?\s*$/.test(regel)) {
        verwerk(buffer);
        buffer = "";
      }
    }
  }
  if (buffer) verwerk(buffer);
  return entries;
}

/**
 * Van catalogusregels naar de te doorzoeken identiteiten. Eén identiteit kan
 * meerdere catalogusregels dragen (linzen-rood/groen/bruin → "linzen"): dan is
 * het één zoekopdracht. `geenBron`-regels en `NIET_UIT_USDA`-identiteiten
 * vallen af.
 */
export function bouwDoelen(entries) {
  const doelen = new Map();
  for (const e of entries) {
    if (e.geenBron) continue;
    const identiteit = e.bron ?? e.key;
    if (identiteit in NIET_UIT_USDA) continue;
    const bestaand = doelen.get(identiteit);
    if (bestaand) {
      bestaand.catalogusKeys.push(e.key);
    } else {
      doelen.set(identiteit, {
        key: identiteit,
        soort: e.bron ? "audit" : "open",
        catalogusKeys: [e.key],
      });
    }
  }
  return [...doelen.values()];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fdc(pad, params) {
  const url = new URL(API + pad);
  url.searchParams.set("api_key", KEY);
  for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`FDC ${res.status} op ${pad}: ${await res.text()}`);
  return res.json();
}

/**
 * Staat dit FDC-record werkelijk voor het gevraagde voedingsmiddel?
 *
 * De reden dat deze functie bestaat: FDC's relevantie-sortering zet bij een
 * zoekterm zonder treffers gewoon het populairste record bovenaan dat één
 * woord deelt. "herring atlantic raw" leverde zo kabeljauw, "black beans
 * cooked boiled" leverde boerenkool (die draagt "cooked, boiled, drained" in
 * zijn naam), en "tofu raw firm" leverde bieten. Dertien van de 53 rijen in de
 * eerste run zaten er zo naast — allemaal met een keurig ogend getal.
 *
 * `kern` is daarom geen zoekterm maar een controle: het woord dat in de
 * beschrijving móét staan, anders is het een ander voedingsmiddel. Een
 * afgewezen match is het gewenste resultaat, geen mislukking.
 */
function naamDekt(beschrijving, kern) {
  const naam = String(beschrijving ?? "").toLowerCase();
  return kern.some((k) => naam.includes(k.toLowerCase()));
}

/**
 * De beste match: Foundation Foods gaat voor, SR Legacy is de terugval.
 *
 * Twee harde regels boven op de vorige versie: `requireAllWords` staat aan, en
 * alleen records waarvan de naam de `kern` draagt komen in aanmerking. Levert
 * dat niets op, dan is "geen treffer" het eerlijke antwoord.
 */
async function zoekVoedingsmiddel(query, kern) {
  const afgewezen = [];
  for (const dataType of ["Foundation", "SR Legacy"]) {
    const r = await fdc("/foods/search", {
      query,
      dataType,
      pageSize: "10",
      requireAllWords: "true",
    });
    const treffers = (r.foods ?? []).filter((f) => {
      if (naamDekt(f.description, kern)) return true;
      afgewezen.push({ fdcId: f.fdcId, naam: f.description, dataType });
      return false;
    });
    if (treffers.length) return { dataType, treffers, afgewezen };
  }
  return { dataType: null, treffers: [], afgewezen };
}

/** Haal onze vijf stoffen uit een FDC-detailrecord, met spreiding waar aanwezig. */
function stoffenUit(detail) {
  const out = {};
  const gevonden = [];
  for (const [id, spec] of Object.entries(NUTRIENTS)) {
    const fn = (detail.foodNutrients ?? []).find((n) => {
      const nr = String(n.nutrient?.number ?? n.nutrientNumber ?? "");
      const nm = String(n.nutrient?.name ?? n.nutrientName ?? "");
      return spec.nbrs.includes(nr) || spec.namePat.test(nm);
    });
    if (!fn) continue;
    gevonden.push(`${id}=${fn.nutrient?.number ?? fn.nutrientNumber}:${fn.nutrient?.name ?? fn.nutrientName}`);
    out[id] = {
      amount: fn.amount ?? fn.value ?? null,
      unit: fn.nutrient?.unitName ?? fn.unitName ?? null,
      // Alleen Foundation Foods vult deze; leeg betekent: één monster, geen spreiding.
      min: fn.min ?? null,
      max: fn.max ?? null,
      median: fn.median ?? null,
      dataPoints: fn.dataPoints ?? null,
    };
  }
  return { stoffen: out, gevonden };
}

async function main() {
  if (!KEY && !PLAN) {
    console.error("Zet FDC_API_KEY. Gratis sleutel: https://fdc.nal.usda.gov/api-key-signup");
    console.error("Of draai zonder API: node scripts/usda-extract.mjs --plan");
    process.exit(1);
  }

  const entries = leesCatalogus();
  const doelen = bouwDoelen(entries);

  const only = (process.argv.find((a) => a.startsWith("--only=")) ?? "").slice(7);
  const gefilterd = only
    ? doelen.filter((d) => only.split(",").includes(d.key))
    : doelen;

  // Doelen met een curated query worden gezocht; de rest is een eerlijk gat.
  const teZoeken = gefilterd.filter((d) => QUERIES[d.key]);
  const zonderQuery = gefilterd.filter((d) => !QUERIES[d.key]);
  // Queries die naar een identiteit wijzen die niet (meer) in de catalogus zit.
  const catalogusIds = new Set(doelen.map((d) => d.key));
  const verweesd = Object.keys(QUERIES).filter((k) => !catalogusIds.has(k));

  console.log(`Catalogus: ${entries.length} regels`);
  console.log(`  fetchbare identiteiten:  ${doelen.length}`);
  console.log(`    met query (te zoeken): ${teZoeken.length}`);
  console.log(`    query ontbreekt:       ${zonderQuery.length}`);
  console.log(`  audit vs open: ${doelen.filter((d) => d.soort === "audit").length} / ${doelen.filter((d) => d.soort === "open").length}`);
  if (verweesd.length) {
    console.log(`\nQueries zonder doel in de catalogus (${verweesd.length}): ${verweesd.join(", ")}`);
  }

  if (PLAN) {
    console.log(`\n--plan: geen API-verzoeken gedaan.`);
    console.log(`Identiteiten die nog een curated query nodig hebben (${zonderQuery.length}):`);
    for (const d of zonderQuery) {
      console.log(`  ${d.soort === "audit" ? "audit" : "open "} ${d.key}  (${d.catalogusKeys.join(", ")})`);
    }
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const rapport = { gedraaid: new Date().toISOString(), nietUitUsda: NIET_UIT_USDA, rijen: [] };
  let nutriëntsleutelsGelogd = false;

  // Identiteiten zonder query eerst als expliciet gat vastleggen.
  for (const d of zonderQuery) {
    rapport.rijen.push({
      key: d.key,
      soort: d.soort,
      catalogusKeys: d.catalogusKeys,
      status: "query-ontbreekt",
    });
  }

  for (const [i, doel] of teZoeken.entries()) {
    const item = { key: doel.key, soort: doel.soort, catalogusKeys: doel.catalogusKeys, ...QUERIES[doel.key] };
    process.stderr.write(`[${i + 1}/${teZoeken.length}] ${doel.key} … `);
    try {
      if (!item.kern?.length) {
        rapport.rijen.push({ ...item, status: "kern-ontbreekt" });
        process.stderr.write("kern ontbreekt — overgeslagen\n");
        continue;
      }
      const treffer = await zoekVoedingsmiddel(item.q, item.kern);
      if (!treffer.treffers.length) {
        rapport.rijen.push({
          ...item,
          status: "geen-treffer",
          afgewezen: treffer.afgewezen.slice(0, 5),
        });
        process.stderr.write(`geen treffer (${treffer.afgewezen.length} afgewezen)\n`);
        continue;
      }
      const best = treffer.treffers[0];
      const detail = await fdc(`/food/${best.fdcId}`, { format: "full" });
      const { stoffen, gevonden } = stoffenUit(detail);

      if (!nutriëntsleutelsGelogd && gevonden.length) {
        console.log("\nGevonden nutriëntsleutels (controleer deze regel op de eerste run):");
        console.log("  " + gevonden.join("\n  ") + "\n");
        nutriëntsleutelsGelogd = true;
      }

      rapport.rijen.push({
        ...item,
        status: "te-beoordelen",
        dataType: treffer.dataType,
        fdcId: best.fdcId,
        fdcNaam: best.description,
        publicatie: best.publishedDate ?? null,
        alternatieven: treffer.treffers.slice(1).map((f) => ({ fdcId: f.fdcId, naam: f.description })),
        afgewezen: treffer.afgewezen.slice(0, 5),
        stoffen,
      });
      process.stderr.write(`${treffer.dataType} #${best.fdcId}\n`);
    } catch (err) {
      rapport.rijen.push({ ...item, status: "fout", fout: String(err.message ?? err) });
      process.stderr.write(`FOUT: ${err.message}\n`);
    }
    // api.data.gov staat 1.000 verzoeken per uur toe; twee per rij.
    await sleep(400);
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(rapport, null, 2));

  const metSpreiding = rapport.rijen.filter((r) =>
    Object.values(r.stoffen ?? {}).some((s) => s.min != null && s.max != null),
  ).length;

  console.log(`\nRapport: ${OUT_FILE}`);
  console.log(`  rijen:             ${rapport.rijen.length}`);
  console.log(`  te beoordelen:     ${rapport.rijen.filter((r) => r.status === "te-beoordelen").length}`);
  console.log(`  geen treffer:      ${rapport.rijen.filter((r) => r.status === "geen-treffer").length}`);
  console.log(`  query ontbreekt:   ${rapport.rijen.filter((r) => r.status === "query-ontbreekt").length}`);
  console.log(`  fouten:            ${rapport.rijen.filter((r) => r.status === "fout").length}`);
  console.log(`  mét waargenomen spreiding (min/max): ${metSpreiding}`);
  console.log("\nNiets is automatisch overgenomen. Elke rij met ★ in `let` vraagt");
  console.log("een expliciet oordeel voordat hij `verified: true` mag dragen.");
}

// Alleen draaien wanneer direct aangeroepen — bij import (test) niet.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
