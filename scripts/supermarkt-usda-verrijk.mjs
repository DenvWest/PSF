#!/usr/bin/env node
/**
 * Supermarktproducten (Laag 0) → USDA-aanvulling (Laag 0b).
 *
 * Zie BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md §0b/§5/§6. Vult de
 * micronutriënten aan die de supermarkt-CSV's niet noemen (cholesterol,
 * kalium, vitamine A/C, calcium, ijzer) door elk product uit
 * `scripts/out/supermarkt-rapport.json` tegen USDA FoodData Central te
 * matchen. Schrijft een rapport; **patcht niets** — zelfde regel als
 * `usda-extract.mjs` en `supermarkt-extract.mjs`.
 *
 * ## Waarom dit script geen curated QUERIES-map gebruikt
 *
 * `usda-extract.mjs` matcht via een handgeschreven Engelse zoekterm + een
 * `kern`-controlewoord per identiteit — haalbaar voor ~120 losse
 * voedingsmiddelen, niet voor 35.517 merkproducten. Besloten (27 sep, na
 * voorleggen): automatisch matchen op productnaam, **lage zekerheid
 * geaccepteerd**. Dat is een bewuste afwijking van de kern-regel elders in
 * dit project — vandaar dat elke match hier een `confidence`-classificatie
 * draagt (zie `classificeerZekerheid`) in plaats van een keurig ogend getal
 * zonder voorbehoud. Niets hieruit mag automatisch een `bewijsbaar`-vlag of
 * claim krijgen (§3 van het besluit): dit blijft informatie, geen tekort-stof.
 *
 * ## De vertaalstap
 *
 * FDC's zoekindex is Engelstalig; productnamen hier zijn Nederlands en vol
 * merknamen ("Jumbo Tortilla Sweet Chili Chips 170 g"). De aanpak:
 *
 *   1. Merknamen strippen (`MERKEN` — supermarkt-eigen labels + bekende
 *      A-merken uit de dataset).
 *   2. Maat-/aantalaanduidingen strippen ("170 g", "4 x 125 ml", "36stuks").
 *   3. Resterende Nederlandse woorden vertalen via `VERTAALWOORDEN` — een
 *      deterministische woordenlijst, geen AI-vertaalstap (die zou zijn
 *      eigen, onnavolgbare foutbron toevoegen boven op het matchrisico dat
 *      hier al bewust geaccepteerd is).
 *   4. Woorden zonder vertaling worden weggelaten, niet gegokt. Blijft er na
 *      vertaling niets over, dan is de rij `geen-vertaling` — een eerlijk
 *      gat, geen zoekopdracht op de kale merknaam.
 *
 * Dit dekt een deel van de catalogus goed (generieke producten: "Witte
 * Bonen", "Volkoren brood") en een deel matig tot niet (samengestelde
 * kant-en-klaarmaaltijden, merkspecifieke chips-smaken) — dat is de
 * afruil die met de gekozen strategie is geaccepteerd.
 *
 * ## Gebruik
 *
 *   FDC_API_KEY=<sleutel> node scripts/supermarkt-usda-verrijk.mjs
 *   node scripts/supermarkt-usda-verrijk.mjs --sample=200
 *   node scripts/supermarkt-usda-verrijk.mjs --only=AH,Lidl
 *   node scripts/supermarkt-usda-verrijk.mjs --plan   (geen API — toont alleen vertaaldekking)
 *
 * Uitvoer: scripts/out/supermarkt-usda-rapport.json
 */

import fs from "node:fs";
import path from "node:path";
import { fdc, infoVeldenUit } from "./usda-extract.mjs";

const IN_FILE = path.join("scripts", "out", "supermarkt-rapport.json");
const OUT_DIR = path.join("scripts", "out");
const OUT_FILE = path.join(OUT_DIR, "supermarkt-usda-rapport.json");

const KEY = process.env.FDC_API_KEY;
const PLAN = process.argv.includes("--plan");
const argOnly = (process.argv.find((a) => a.startsWith("--only=")) ?? "").slice(7);
const argSample = (process.argv.find((a) => a.startsWith("--sample=")) ?? "").slice(9);
const SAMPLE = argSample ? Number(argSample) : null;

const SUPERMARKTEN = ["AH", "Jumbo", "Lidl", "Plus"];
const teVerwerken = argOnly ? argOnly.split(",") : SUPERMARKTEN;

/**
 * Merknamen die uit de productnaam worden gestript vóór vertaling — anders
 * verschijnt "jumbo" of "ah" als (onvertaalbaar) zoekwoord in elke query.
 * Supermarkt-eigen labels plus de meest voorkomende A-merken uit de dataset
 * (zie de woordfrequentie-analyse: ah/jumbo/plus/knorr/unox/hak/olvarit/
 * campina/verstegen/oetker/lidl behoren tot de meest voorkomende woorden).
 */
const MERKEN = new Set([
  "ah", "albert", "heijn", "jumbo", "plus", "lidl",
  "knorr", "unox", "hak", "olvarit", "campina", "verstegen", "oetker",
  "dr", "arla", "danone", "melkunie", "friesland", "campina",
  "m&m's", "ritter", "sport", "pringles", "lu", "bertolli", "maggi",
  "heinz", "calve", "conimex", "honig", "de", "ruijter", "bonne", "maman",
  "biotoday", "terra", "smint", "lassie",
  "alpro", "remia", "koopmans", "iglo", "bonduelle", "damhert", "mora",
  "grand'italia", "fairtrade", "boerentrots",
]);

/**
 * Nederlandse stopwoorden zonder eigen betekenis voor een zoekterm.
 * Bevat ook een paar woorden die wél betekenis dragen maar de FDC-zoekterm
 * eerder vernauwen dan verbeteren ("glutenvrij", "suikervrij", "gezouten",
 * "gesneden", "vet") — bewust weglaten is hier beter dan een halfslachtige
 * vertaling die de match onnodig specifiek maakt.
 */
const STOPWOORDEN = new Set([
  "met", "en", "de", "het", "een", "van", "voor", "in", "op", "zonder",
  "extra", "stuk", "stuks", "pack", "voordeel", "voordeelverpakking",
  "duopack", "multipack", "navulling", "hersluitbaar", "vers", "verse",
  "naturel", "original", "classic", "family", "mini", "maxi", "plakken",
  "zak", "pot", "fles", "blik", "doos", "bak", "krat",
  "smaak", "smaakt", "stijl", "maanden", "xxl", "gr", "look",
  "biologische", "glutenvrij", "suikervrij", "gezouten", "gesneden", "vet",
]);

/**
 * Kernwoorden-woordenboek NL → EN. Bewust geen volledig woordenboek maar een
 * gerichte lijst op de meest voorkomende voedingswoorden in deze dataset
 * (zie de frequentie-analyse bij het opzetten van dit script). Wordt
 * uitgebreid zodra het rapport laat zien welke veelvoorkomende woorden nog
 * ontbreken (`onvertaaldeWoorden` in de output).
 */
const VERTAALWOORDEN = {
  kaas: "cheese", jong: "young", belegen: "aged", oud: "old", geraspt: "grated",
  kip: "chicken", kipfilet: "chicken breast", kalkoen: "turkey",
  rundvlees: "beef", varkensvlees: "pork", gehakt: "ground meat",
  melk: "milk", volle: "whole", halfvolle: "semi-skimmed", magere: "skimmed",
  yoghurt: "yogurt", kwark: "quark", roomboter: "butter", boter: "butter",
  room: "cream", slagroom: "whipping cream", zure: "sour",
  appel: "apple", aardbei: "strawberry", banaan: "banana", mango: "mango",
  sinaasappel: "orange", peer: "pear", druiven: "grapes", ananas: "pineapple",
  citroen: "lemon", limoen: "lime", framboos: "raspberry", bosbes: "blueberry",
  brood: "bread", volkoren: "whole wheat", wit: "white", bruin: "brown",
  rogge: "rye", spelt: "spelt", stokbrood: "baguette",
  rijst: "rice", pasta: "pasta", spaghetti: "spaghetti", macaroni: "macaroni",
  aardappel: "potato", aardappelen: "potatoes", puree: "mashed", friet: "french fries",
  groente: "vegetable", groenten: "vegetables", sla: "lettuce", spinazie: "spinach",
  wortel: "carrot", wortelen: "carrots", ui: "onion", uien: "onions",
  tomaat: "tomato", tomaten: "tomatoes", paprika: "bell pepper", komkommer: "cucumber",
  bonen: "beans", witte: "white", zwarte: "black", kidneybonen: "kidney beans",
  linzen: "lentils", kikkererwten: "chickpeas", erwten: "peas",
  vis: "fish", zalm: "salmon", tonijn: "tuna", haring: "herring", garnalen: "shrimp",
  ei: "egg", eieren: "eggs",
  noten: "nuts", amandelen: "almonds", walnoten: "walnuts", pinda: "peanut",
  pindakaas: "peanut butter", cashewnoten: "cashews", hazelnoten: "hazelnuts",
  chocolade: "chocolate", puur: "dark chocolate", melkchocolade: "milk chocolate",
  suiker: "sugar", honing: "honey", jam: "jam", confituur: "jam",
  olie: "oil", olijfolie: "olive oil", zonnebloemolie: "sunflower oil",
  bier: "beer", wijn: "wine", water: "water", sap: "juice", frisdrank: "soda",
  soep: "soup", saus: "sauce", ketchup: "ketchup", mayonaise: "mayonnaise",
  chips: "chips", crackers: "crackers", koek: "cookie", koekjes: "cookies",
  pizza: "pizza", lasagne: "lasagna",
  havermout: "oats", muesli: "muesli", cornflakes: "cornflakes",
  tofu: "tofu", tempeh: "tempeh", quinoa: "quinoa",
  biologisch: "organic", bio: "organic",
  vanille: "vanilla", caramel: "caramel", karamel: "caramel",
  geitenkaas: "goat cheese", mozzarella: "mozzarella", feta: "feta",
  rode: "red", groene: "green", gele: "yellow", oranje: "orange",
  plantaardig: "plant-based", plantaardige: "plant-based",
  kruiden: "herbs", kruid: "herb", siroop: "syrup", perzik: "peach",
  salade: "salad", goudse: "gouda", pruim: "plum", kers: "cherry",
  kersen: "cherries", meloen: "melon", kokos: "coconut",
  pindasaus: "peanut sauce", zoet: "sweet", zoete: "sweet", zuur: "sour",
  pittig: "spicy", knoflook: "garlic", gember: "ginger",
  courgette: "zucchini", broccoli: "broccoli", bloemkool: "cauliflower",
  prei: "leek", venkel: "fennel", asperges: "asparagus", champignons: "mushrooms",
  paddenstoelen: "mushrooms", avocado: "avocado", peulvruchten: "legumes",
  worst: "sausage", spek: "bacon", ham: "ham", salami: "salami",
  eend: "duck", lam: "lamb", lamsvlees: "lamb",
  garnaal: "shrimp", mossel: "mussel", mosselen: "mussels", inktvis: "squid",
  crackers: "crackers", beschuit: "rusk", ontbijtkoek: "gingerbread",
  boterham: "bread slice", toast: "toast",
  drop: "licorice", zuurtjes: "candy", snoep: "candy", gum: "gum",
  ijs: "ice cream", roomijs: "ice cream",
  curry: "curry", noedels: "noodles", tortilla: "tortilla",
  hazelnoot: "hazelnut", pure: "dark chocolate",
  mais: "corn", maiswafel: "corn cake", rijstwafel: "rice cake",
  zeewier: "seaweed", tofoe: "tofu",
};

/**
 * Woorden die al Engels zijn (veel voorkomend in merkomschrijvingen als
 * "Zero Sugar", "Sweet Chili", "Plant Based") — géén vertaling nodig, direct
 * bruikbaar als FDC-zoekwoord. Losstaand van `VERTAALWOORDEN` omdat het geen
 * NL→EN-paar is maar een passthrough-lijst.
 */
const AL_ENGELS = new Set([
  "sugar", "zero", "protein", "drink", "fruit", "tea", "chocolate", "vegan",
  "oven", "cola", "ice", "chili", "sweet", "chicken", "lemon", "cream",
  "cheese", "milk", "butter", "yogurt", "juice", "soda", "beans", "rice",
  "bread", "cookie", "cookies", "cake", "nuts", "salad", "spicy", "smoked",
  "grilled", "roasted", "fresh", "light", "classic",
]);

/** Splits productnaam in kandidaat-woorden, laagdrempelig (letters + apostrof). */
function woordenUit(naam) {
  return naam
    .replace(/\d+[.,]?\d*\s*(g|kg|ml|cl|l|stuks?|x|pers\.?|mnd)\b/gi, " ")
    .split(/[^A-Za-zÀ-ÿ']+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

/**
 * Productnaam → Engelse zoekterm + welke woorden vertaald werden. `null`
 * betekent: na strippen en vertalen bleef er niets bruikbaars over.
 */
function vertaalProductnaam(naam) {
  const woorden = woordenUit(naam).map((w) => w.toLowerCase());
  const vertaald = [];
  const onvertaald = [];
  for (const w of woorden) {
    if (MERKEN.has(w) || STOPWOORDEN.has(w)) continue;
    if (AL_ENGELS.has(w)) {
      if (!vertaald.includes(w)) vertaald.push(w);
      continue;
    }
    const en = VERTAALWOORDEN[w];
    if (en) {
      if (!vertaald.includes(en)) vertaald.push(en);
    } else if (!/^\d+$/.test(w)) {
      onvertaald.push(w);
    }
  }
  if (!vertaald.length) return { query: null, vertaald, onvertaald };
  return { query: vertaald.join(" "), vertaald, onvertaald };
}

/**
 * Zekerheidsclassificatie — geen garantie, alleen een signaal voor de
 * beoordelaar. "sterk": minstens twee vertaalde kernwoorden matchen de
 * FDC-omschrijving. "zwak": één woord matcht, of maar één kernwoord kon
 * vertaald worden. Nooit "geverifieerd" — dat woord is voorbehouden aan de
 * curated `usda-extract.mjs`-flow.
 *
 * "Sterk" is een frequentiesignaal, geen garantie: "Duyvis Oven roasted
 * pinda's" (query "oven roasted") matcht "Lunchmeat, turkey, oven roasted,
 * sliced" met twee woorden — en is toch een compleet verkeerd product
 * (kalkoenvlees, geen pinda's), omdat "pinda" zelf niet vertaald kon worden
 * en dus geen deel van de query was. Behandel "sterk" als "waarschijnlijker
 * dan zwak", niet als bevestigd.
 */
// Losse kleurwoorden zijn te generiek om als bewijs van een goede match te
// tellen: "zwarte thee" vertaalt naar "black" en matcht dan toevallig tegen
// "Plum, black, with skin" — een compleet ander product. Ze mogen wél in de
// zoekquery zitten (nuttig als onderdeel van "black beans"), maar tellen
// zelf niet mee in `classificeerZekerheid`.
const KLEURWOORDEN = new Set(["red", "green", "yellow", "orange", "black", "white", "brown"]);

function classificeerZekerheid(vertaaldeWoorden, fdcNaam) {
  // FDC-omschrijvingen scheiden samengestelde termen vaak met een komma
  // ("Peppers, bell, green, raw" voor "bell pepper") — een letterlijke
  // substring-check op "bell pepper" zou dat mislabelen als geen match.
  // Losse woorden vergelijken (niet-lettertekens als scheiding) dekt dat af.
  const teControleren = vertaaldeWoorden.filter((term) => !KLEURWOORDEN.has(term.toLowerCase()));
  const naamWoorden = String(fdcNaam ?? "").toLowerCase().split(/[^a-z]+/).filter(Boolean);
  // Woord-prefix i.p.v. exacte gelijkheid: "sugar" moet "sugars" dekken
  // (FDC gebruikt meervoud), maar mag niet op willekeurige substrings matchen
  // zoals de oude `includes()`-aanpak deed (die zag "bell pepper" niet in
  // "Peppers, bell, green" omdat de komma de substring brak — nu per woord).
  const dektWoord = (deelwoord) =>
    naamWoorden.some((nw) => nw.startsWith(deelwoord) || deelwoord.startsWith(nw));
  const treffers = teControleren.filter((term) =>
    term
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter(Boolean)
      .every(dektWoord),
  );
  if (treffers.length >= 2) return "sterk";
  if (treffers.length === 1) return "zwak";
  return "ongeverifieerd";
}

/** Losse zoekfunctie zonder kern-eis — dit script accepteert bewust lagere zekerheid. */
async function zoekAutomatisch(query) {
  for (const dataType of ["Foundation", "SR Legacy"]) {
    const r = await fdc("/foods/search", {
      query,
      dataType,
      pageSize: "5",
      requireAllWords: "false",
    });
    const foods = r.foods ?? [];
    if (foods.length) return { dataType, foods };
  }
  return { dataType: null, foods: [] };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function leesSupermarktRapport() {
  if (!fs.existsSync(IN_FILE)) {
    console.error(`${IN_FILE} niet gevonden — draai eerst scripts/supermarkt-extract.mjs`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(IN_FILE, "utf8"));
}

async function main() {
  const bron = leesSupermarktRapport();

  let producten = [];
  for (const naam of teVerwerken) {
    const groep = bron.supermarkten[naam];
    if (!groep) continue;
    for (const p of groep.producten) {
      if (p.verdacht) continue; // al gemarkeerd als onbetrouwbaar in Laag 0
      producten.push({ ...p, supermarkt: naam });
    }
  }
  if (SAMPLE) producten = producten.slice(0, SAMPLE);

  // Vertaling is gratis (geen API) — altijd volledig uitvoeren, ook in --plan.
  const metVertaling = [];
  const zonderVertaling = [];
  const onvertaaldeWoordenTelling = {};
  for (const p of producten) {
    const { query, vertaald, onvertaald } = vertaalProductnaam(p.naam);
    for (const w of onvertaald) {
      onvertaaldeWoordenTelling[w] = (onvertaaldeWoordenTelling[w] ?? 0) + 1;
    }
    if (query) metVertaling.push({ ...p, query, vertaald });
    else zonderVertaling.push(p);
  }

  const topOnvertaald = Object.entries(onvertaaldeWoordenTelling)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40);

  console.log(`Producten (excl. verdacht-gemarkeerd uit Laag 0): ${producten.length}`);
  console.log(`  met bruikbare vertaling: ${metVertaling.length}`);
  console.log(`  geen vertaling mogelijk: ${zonderVertaling.length}`);
  console.log(`\nMeest voorkomende onvertaalde woorden (kandidaten voor VERTAALWOORDEN):`);
  for (const [w, c] of topOnvertaald) console.log(`  ${c.toString().padStart(4)}  ${w}`);

  if (PLAN) {
    console.log(`\n--plan: geen API-verzoeken gedaan.`);
    return;
  }
  if (!KEY) {
    console.error("\nZet FDC_API_KEY. Gratis sleutel: https://fdc.nal.usda.gov/api-key-signup");
    console.error("Of draai zonder API: node scripts/supermarkt-usda-verrijk.mjs --plan");
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const rapport = {
    gedraaid: new Date().toISOString(),
    strategie: "automatisch-matchen-lage-zekerheid",
    besluit: "BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md §0b",
    totaalProducten: producten.length,
    geenVertaling: zonderVertaling.length,
    onvertaaldeWoorden: topOnvertaald,
    rijen: [],
  };

  for (const [i, p] of metVertaling.entries()) {
    process.stderr.write(`[${i + 1}/${metVertaling.length}] ${p.naam} → "${p.query}" … `);
    try {
      const { dataType, foods } = await zoekAutomatisch(p.query);
      if (!foods.length) {
        rapport.rijen.push({
          prodId: p.prodId,
          naam: p.naam,
          supermarkt: p.supermarkt,
          query: p.query,
          status: "geen-treffer",
        });
        process.stderr.write("geen treffer\n");
        continue;
      }
      const best = foods[0];
      const detail = await fdc(`/food/${best.fdcId}`, { format: "full" });
      const { infoVelden } = infoVeldenUit(detail);
      const zekerheid = classificeerZekerheid(p.vertaald, best.description);

      rapport.rijen.push({
        prodId: p.prodId,
        naam: p.naam,
        supermarkt: p.supermarkt,
        query: p.query,
        status: "te-beoordelen",
        zekerheid,
        dataType,
        fdcId: best.fdcId,
        fdcNaam: best.description,
        alternatieven: foods.slice(1, 3).map((f) => ({ fdcId: f.fdcId, naam: f.description })),
        infoVelden,
        // Wat de supermarktbron zelf al had (Laag 0) — ter vergelijking, niet
        // om te overschrijven. Grote afwijkingen zijn een reden voor
        // wantrouwen in de match, niet in Laag 0's eigen extractie.
        supermarktMacros: {
          energyKcal: p.energyKcal,
          fatG: p.fatG,
          carbohydrateG: p.carbohydrateG,
          proteinG: p.proteinG,
        },
      });
      process.stderr.write(`${zekerheid} — ${dataType} #${best.fdcId}\n`);
    } catch (err) {
      rapport.rijen.push({
        prodId: p.prodId,
        naam: p.naam,
        supermarkt: p.supermarkt,
        query: p.query,
        status: "fout",
        fout: String(err.message ?? err),
      });
      process.stderr.write(`FOUT: ${err.message}\n`);
    }
    // api.data.gov: 1.000 verzoeken/uur; twee per rij (search + detail).
    await sleep(400);
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(rapport, null, 2));

  const sterk = rapport.rijen.filter((r) => r.zekerheid === "sterk").length;
  const zwak = rapport.rijen.filter((r) => r.zekerheid === "zwak").length;
  const ongeverifieerd = rapport.rijen.filter((r) => r.zekerheid === "ongeverifieerd").length;
  const geenTreffer = rapport.rijen.filter((r) => r.status === "geen-treffer").length;
  const fouten = rapport.rijen.filter((r) => r.status === "fout").length;

  console.log(`\nRapport: ${OUT_FILE}`);
  console.log(`  rijen verwerkt:     ${rapport.rijen.length}`);
  console.log(`  zekerheid sterk:    ${sterk}`);
  console.log(`  zekerheid zwak:     ${zwak}`);
  console.log(`  ongeverifieerd:     ${ongeverifieerd}`);
  console.log(`  geen treffer:       ${geenTreffer}`);
  console.log(`  fouten:             ${fouten}`);
  console.log("\nNiets is automatisch overgenomen. 'ongeverifieerd' betekent geen");
  console.log("enkel woord van de vertaling terug in de FDC-omschrijving — behandel");
  console.log("die rijen als ruis tenzij een beoordelaar ze bevestigt.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
