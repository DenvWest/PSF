#!/usr/bin/env node
/**
 * USDA FoodData Central → verificatierapport voor food-sources.ts
 *
 * ## Wat dit script doet
 *
 * Voor elk voedingsmiddel in de zoeklijst haalt het de beste FDC-match op en
 * legt het de gevonden gehaltes naast wat er in `food-sources.ts` staat. Het
 * schrijft een rapport; het **patcht niets**. Dat is dezelfde regel die
 * SPEC_VOEDINGSBRONNEN_VERIFICATIE.md al hanteert, en hij staat er om één
 * reden: de matchbeoordeling is het werk, niet het ophalen.
 *
 * "Bread, whole-wheat, commercially prepared" is niet hetzelfde als Nederlands
 * volkorenbrood — andere uitmaalgraad, ander recept, ander zoutgehalte. Een
 * script dat die match automatisch overneemt, produceert een getal dat er
 * precies zo uitziet als een goed getal.
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
 *
 * Uitvoer: scripts/out/usda-rapport.json + een samenvatting op stdout.
 *
 * ## Let op bij de eerste run
 *
 * De nutriëntnummers hieronder zijn op naam én nummer gematcht. Alleen 328
 * (vitamine D) is geverifieerd tegen USDA-documentatie; de rest komt uit de
 * gangbare SR-nummering en is niet nageslagen. Het script logt per stof welke
 * sleutel daadwerkelijk aansloeg — controleer die regel op de eerste run
 * voordat je het rapport vertrouwt.
 */

import fs from "node:fs";
import path from "node:path";

const API = "https://api.nal.usda.gov/fdc/v1";
const KEY = process.env.FDC_API_KEY;
const OUT_DIR = path.join("scripts", "out");
const OUT_FILE = path.join(OUT_DIR, "usda-rapport.json");

if (!KEY) {
  console.error("Zet FDC_API_KEY. Gratis sleutel: https://fdc.nal.usda.gov/api-key-signup");
  process.exit(1);
}

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
 * Wat we zoeken, per rij in food-sources.ts.
 *
 * `q` is de Engelse zoekterm; `let` is waar de beoordelaar op moet letten.
 * Die tweede kolom is geen documentatie maar werkinstructie: hij noemt per
 * rij de val waar een automatische match in trapt.
 */
const ZOEK = [
  { key: "amandelen",        q: "almonds raw",                         let: "ongezouten, ongeroosterd" },
  { key: "walnoten",         q: "walnuts english raw",                 let: "ALA, telt niet mee voor EPA/DHA" },
  { key: "cashewnoten",      q: "cashew nuts raw",                     let: "rauw, niet geroosterd/gezouten" },
  { key: "pompoenzaden",     q: "pumpkin seeds kernels dried",         let: "gepeld; ongepeld scheelt fors" },
  { key: "zonnebloempitten", q: "sunflower seed kernels dried",        let: "ongezouten" },
  { key: "hennepzaad",       q: "hemp seed hulled",                    let: "gepeld" },
  { key: "lijnzaad",         q: "flaxseed",                            let: "gemalen vs heel; ALA-bron" },
  { key: "tahin",            q: "sesame butter tahini",                let: "van geroosterd of rauw zaad" },

  { key: "havermout",        q: "oats rolled dry",                     let: "droog gewicht, niet bereid" },
  { key: "volkorenbrood",    q: "bread whole-wheat commercially prepared", let: "★ NL-volkoren wijkt af — andere uitmaalgraad en zout. Twijfel = geen match" },
  { key: "volkoren-pasta",   q: "pasta whole wheat dry",               let: "droog" },
  { key: "quinoa",           q: "quinoa cooked",                       let: "gekookt, niet droog" },
  { key: "zilvervliesrijst", q: "rice brown long-grain cooked",        let: "gekookt" },
  { key: "witte-rijst",      q: "rice white long-grain cooked enriched", let: "★ VS verrijkt witte rijst; NL niet" },
  { key: "aardappelen",      q: "potatoes boiled without skin",        let: "gekookt zonder schil" },

  { key: "linzen",           q: "lentils cooked boiled",               let: "gekookt zonder zout" },
  { key: "kikkererwten",     q: "chickpeas garbanzo cooked",           let: "gekookt, niet uit blik" },
  { key: "zwarte-bonen",     q: "black beans cooked boiled",           let: "gekookt" },
  { key: "kidneybonen",      q: "kidney beans red cooked boiled",      let: "gekookt" },
  { key: "witte-bonen",      q: "white beans cooked boiled",           let: "gekookt" },
  { key: "erwten-diepvries", q: "peas green frozen",                   let: "diepvries, onbereid" },
  { key: "tofu",             q: "tofu raw firm",                       let: "★ calciumsulfaat vs nigari scheelt in mineralen" },
  { key: "tempe",            q: "tempeh",                              let: "onbereid" },

  { key: "spinazie",         q: "spinach cooked boiled drained",       let: "gekookt en uitgelekt" },
  { key: "boerenkool",       q: "kale cooked boiled drained",          let: "gekookt" },
  { key: "snijbiet",         q: "swiss chard cooked boiled",           let: "gekookt" },
  { key: "broccoli",         q: "broccoli cooked boiled drained",      let: "gekookt" },
  { key: "paprika",          q: "peppers sweet red raw",               let: "rauw" },
  { key: "paddenstoelen-uv", q: "mushrooms white exposed to ultraviolet light", let: "★ alleen UV-behandeld draagt vitamine D" },
  { key: "banaan",           q: "bananas raw",                         let: "rauw" },
  { key: "avocado",          q: "avocados raw",                        let: "rauw" },
  { key: "blauwe-bessen",    q: "blueberries raw",                     let: "rauw" },
  { key: "gedroogde-vijgen", q: "figs dried uncooked",                 let: "gedroogd" },

  { key: "zalm-gekweekt",    q: "salmon atlantic farmed raw",          let: "★ gekweekt ≠ wild; vitamine D en EPA/DHA verschillen factor 2–4" },
  { key: "zalm-wild",        q: "salmon atlantic wild raw",            let: "★ vangstgebied telt: Oostzee ≈ 2× Noordzee" },
  { key: "makreel",          q: "mackerel atlantic raw",               let: "★ soort telt: Atlantic ≠ King ≠ Spanish" },
  { key: "haring",           q: "herring atlantic raw",                let: "rauw, niet gerookt of gemarineerd" },
  { key: "sardines",         q: "sardines atlantic canned in oil drained", let: "uitgelekt; op olie vs water scheelt" },
  { key: "tonijn-blik",      q: "tuna light canned in water drained",  let: "op water, uitgelekt" },
  { key: "kabeljauw",        q: "cod atlantic raw",                    let: "rauw" },
  { key: "garnalen",         q: "shrimp raw",                          let: "rauw" },
  { key: "oesters",          q: "oysters eastern raw",                 let: "★ zink varieert extreem per soort en seizoen" },

  { key: "kipfilet",         q: "chicken breast skinless boneless raw", let: "zonder vel, rauw" },
  { key: "rundvlees-mager",  q: "beef loin lean raw",                  let: "mager, rauw" },
  { key: "varkenshaas",      q: "pork tenderloin lean raw",            let: "rauw" },
  { key: "kalfsvlees",       q: "veal loin lean raw",                  let: "rauw" },
  { key: "lamsvlees",        q: "lamb loin lean raw",                  let: "rauw" },
  { key: "leverpastei",      q: "liver pate chicken canned",           let: "★ leverproducten verschillen sterk per recept" },

  { key: "eieren",           q: "egg whole raw fresh",                 let: "★ vitamine D volgt het legvoer; NL-waarde kan afwijken" },
  { key: "magere-kwark",     q: "cheese cottage lowfat",               let: "★ kwark bestaat niet in de VS — beste benadering is magere kwark uit NEVO of etiket" },
  { key: "skyr",             q: "yogurt greek plain nonfat",           let: "★ skyr ≠ Griekse yoghurt; eiwit ligt hoger" },
  { key: "griekse-yoghurt",  q: "yogurt greek plain whole milk",       let: "vetgehalte bepaalt eiwit per 100 g" },
  { key: "huttenkase",       q: "cheese cottage creamed large curd",   let: "vetgehalte" },
  { key: "belegen-kaas",     q: "cheese gouda",                        let: "★ rijping bepaalt vocht en dus eiwit per 100 g" },
];

/** Producten die nooit uit USDA komen — verrijking is nationaal geregeld. */
const NIET_UIT_USDA = {
  halvarine: "NL-kader: 7,5 µg vitamine D per 100 g (25 µg voor ouderenvarianten)",
  "sojadrink-verrijkt": "verrijking is fabrikantkeuze binnen NL-kader — etiket is de bron",
  "plantaardige-drank-verrijkt": "idem",
  melk: "verplicht verrijkt sinds 2021: 1,5 µg per 100 ml",
  algenolie: "productspecificatie van de fabrikant",
  zonlicht: "geen voedingsmiddel",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fdc(pad, params) {
  const url = new URL(API + pad);
  url.searchParams.set("api_key", KEY);
  for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`FDC ${res.status} op ${pad}: ${await res.text()}`);
  return res.json();
}

/** De beste match: Foundation Foods gaat voor, SR Legacy is de terugval. */
async function zoekVoedingsmiddel(query) {
  for (const dataType of ["Foundation", "SR Legacy"]) {
    const r = await fdc("/foods/search", {
      query,
      dataType,
      pageSize: "5",
      requireAllWords: "false",
    });
    if (r.foods?.length) return { dataType, treffers: r.foods };
  }
  return null;
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
  const only = (process.argv.find((a) => a.startsWith("--only=")) ?? "").slice(7);
  const lijst = only ? ZOEK.filter((z) => only.split(",").includes(z.key)) : ZOEK;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const rapport = { gedraaid: new Date().toISOString(), nietUitUsda: NIET_UIT_USDA, rijen: [] };
  let nutriëntsleutelsGelogd = false;

  for (const [i, item] of lijst.entries()) {
    process.stderr.write(`[${i + 1}/${lijst.length}] ${item.key} … `);
    try {
      const treffer = await zoekVoedingsmiddel(item.q);
      if (!treffer) {
        rapport.rijen.push({ ...item, status: "geen-treffer" });
        process.stderr.write("geen treffer\n");
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
  console.log(`  fouten:            ${rapport.rijen.filter((r) => r.status === "fout").length}`);
  console.log(`  mét waargenomen spreiding (min/max): ${metSpreiding}`);
  console.log("\nNiets is automatisch overgenomen. Elke rij met ★ in `let` vraagt");
  console.log("een expliciet oordeel voordat hij `verified: true` mag dragen.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
