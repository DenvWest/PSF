#!/usr/bin/env node
/**
 * Schrijft de NEVO-gehaltes van de vijf dagboekstoffen, plus energie, vezels en
 * de informatieve mineralen/vitamines (voor de rijkste-bronnenlijst), per catalogusregel naar
 * `src/data/nutrition/food-catalog-nevo-gehaltes.ts`.
 *
 * Waarom: `FOOD_CATALOG.bron` wijst naar `FOOD_SOURCES`, en dat dekt maar een
 * deel van de catalogus. Een regel als "Zalm, gerookt" had geen bron en toonde
 * daardoor `n.o.` voor eiwit en omega-3, terwijl NEVO ze gewoon kent. Dit
 * script haalt voor elke regel met een NEVO-koppeling de waarden op.
 *
 * ## Regels
 *
 *   - Waarden staan ongewijzigd en in de eenheid van het bestand (RIVM-voorwaarde).
 *     Geen afronding, geen omrekening. EPA en DHA blijven twee losse getallen;
 *     de som voor de omega-3-uitlezing wordt pas in de app gemaakt en daar als
 *     afgeleid gelabeld.
 *   - `FOOD_CATALOG_NEVO_GEHALTES` bevat alleen koppelingen met `basis` ongelijk
 *     aan `benadering`: een benadering is een vergelijkbaar record, geen
 *     brongetal, en mag niet in een som.
 *   - Alleen voedingsmiddelen per 100 g (de dagboekportie rekent in gram).
 *   - EPA en DHA alleen voor vis en zeevruchten ({@link OMEGA3_CATEGORIEEN}). NEVO
 *     meldt bij o.a. havermout, koek en pindakaas een DHA-waarde (laboratoriumruis
 *     van de vetzuuranalyse); die als omega-3-bron presenteren zou verkeerd lezen.
 *   - Een spoor (TR) of een gemeten 0 van een kernstof wordt niet als getal
 *     geschreven maar in `nul` of `spoor` vermeld: "niets erin" is iets anders
 *     dan "niet gemeten" (een stof die NEVO niet kent, staat nergens). Ze tellen
 *     nooit mee in een som; ze zijn er alleen voor de weergave.
 *   - Benaderingen die in `nevo-benadering-micros.json` onder `toon` staan,
 *     krijgen hun gehaltes in een apart blok (`FOOD_CATALOG_NEVO_BENADERINGEN`),
 *     met de NEVO-naam erbij. Alleen ter weergave, met label; nooit in een som.
 *
 * ## Gebruik
 *
 *   node scripts/nevo-gehaltes.mjs [--csv=/pad/naar/NEVO2025_v9.0_Details.csv]
 *   node scripts/nevo-gehaltes.mjs --droog     (schrijft niets, toont tellingen)
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bouwVoedingsmiddelen, parseDelimited } from "./nevo-extract.mjs";

const CATALOG_FILE = path.join("src", "data", "nutrition", "food-catalog.ts");
const KOPPELING_FILE = path.join("src", "data", "nutrition", "food-catalog-nevo.ts");
const BENADERING_FILE = path.join("scripts", "nevo-benadering-micros.json");
const OUT_FILE = path.join("src", "data", "nutrition", "food-catalog-nevo-gehaltes.ts");
const NEVO_EDITIE = "2025/9.0";

const argCsv = (process.argv.find((a) => a.startsWith("--csv=")) ?? "").slice(6);
const CSV_PAD = argCsv || process.env.NEVO_CSV || path.join(os.homedir(), "Downloads", "NEVO2025_v9.0_Details.csv");

/** Catalogus-categorieën waar EPA en DHA een echte bijdrage kunnen zijn. */
export const OMEGA3_CATEGORIEEN = new Set(["vis", "zeevruchten"]);

/** NEVO-stofcode → veld in het uitvoerbestand (eenheid zit in de veldnaam). */
const STOFFEN = [
  ["PROT", "protein_g"],
  ["MG", "magnesium_mg"],
  ["ZN", "zinc_mg"],
  ["VITD", "vitamin_d_ug"],
  ["F20:5CN3", "epa_g"],
  ["F22:6CN3", "dha_g"],
  ["ENERCC", "energy_kcal"],
  ["FIBT", "fiber_g"],
  ["K", "potassium_mg"],
  ["CA", "calcium_mg"],
  ["FE", "iron_mg"],
  ["VITB12", "vitamin_b12_ug"],
  ["VITC", "vitamin_c_mg"],
];

/** Leest de koppelingen uit het gegenereerde TypeScript-bestand. */
export function leesKoppelingen(tekst) {
  const koppelingen = {};
  const patroon = /"([^"]+)":\s*\{\s*code:\s*"([^"]+)",\s*basis:\s*"([^"]+)"\s*\}/g;
  for (const [, key, code, basis] of tekst.matchAll(patroon)) koppelingen[key] = { code, basis };
  return koppelingen;
}

/** Leest `f("key", "label", "categorie", …)` uit het catalogusbestand. */
export function leesCategorieen(tekst) {
  const categorieen = {};
  for (const [, key, categorie] of tekst.matchAll(/\bf\(\s*"([^"]+)",\s*"(?:[^"\\]|\\.)*",\s*"([^"]+)"/g)) {
    categorieen[key] = categorie;
  }
  return categorieen;
}

/** Kernstoffen waarvoor een gemeten 0 of spoor apart wordt bewaard (zie de kop). */
export const KERN_VELDEN = new Set(["protein_g", "magnesium_mg", "zinc_mg", "vitamin_d_ug", "epa_g", "dha_g"]);

/** Eén catalogusregel → zijn gehaltes, of `null` als er niets te schrijven valt. */
export function gehaltesVoor(voedingsmiddel, categorie) {
  if (voedingsmiddel.per !== "100g") return null;
  const gehaltes = {};
  const nul = [];
  const spoor = [];
  for (const [stofCode, veld] of STOFFEN) {
    const stof = voedingsmiddel.stoffen[stofCode];
    if (!stof) continue;
    if (stof.spoor || !(stof.w > 0)) {
      if (!KERN_VELDEN.has(veld)) continue;
      (stof.spoor ? spoor : nul).push(veld);
      continue;
    }
    if ((veld === "epa_g" || veld === "dha_g") && !OMEGA3_CATEGORIEEN.has(categorie)) continue;
    gehaltes[veld] = stof.w;
  }
  if (nul.length > 0) gehaltes.nul = nul;
  if (spoor.length > 0) gehaltes.spoor = spoor;
  return Object.keys(gehaltes).length > 0 ? gehaltes : null;
}

function regelVoor(key, code, gehaltes, extra = "") {
  const velden = Object.entries(gehaltes)
    .map(([veld, waarde]) => `${veld}: ${Array.isArray(waarde) ? JSON.stringify(waarde) : waarde}`)
    .join(", ");
  return `  ${JSON.stringify(key)}: { code: ${JSON.stringify(code)}, ${extra}${velden} },`;
}

export function bouwBestand(regels, benaderingen = []) {
  const body = regels.map(([key, code, gehaltes]) => regelVoor(key, code, gehaltes)).join("\n");
  const benaderingBody = benaderingen
    .map(([key, code, naam, gehaltes]) => regelVoor(key, code, gehaltes, `naam: ${JSON.stringify(naam)}, `))
    .join("\n");
  return `/**
 * NEVO-gehaltes per 100 g voor de dagboekstoffen, per catalogusregel.
 *
 * Gegenereerd door \`scripts/nevo-gehaltes.mjs\` — niet met de hand aanpassen;
 * draai het script opnieuw. De waarden staan ongewijzigd en in de eenheid van
 * het brondbestand (${NEVO_CITATION_REGEL}). EPA en DHA zijn los gelaten; de
 * omega-3-som is een bewerking en wordt in \`nutrition-catalog-gehalte.ts\`
 * gemaakt en als afgeleid gelabeld.
 *
 * Een kernstof die NEVO als 0 of spoor (TR) meldt, staat in \`nul\` of \`spoor\`
 * en nooit als getal: alleen voor de weergave, nooit in een som. Een stof die
 * nergens staat, is niet gemeten (\`n.o.\`). Regels met \`basis: "benadering"\`
 * staan niet in \`FOOD_CATALOG_NEVO_GEHALTES\` maar, als ze getoond mogen worden
 * (\`scripts/nevo-benadering-micros.json\`), in \`FOOD_CATALOG_NEVO_BENADERINGEN\`.
 */
export type NevoKernVeld = "protein_g" | "magnesium_mg" | "zinc_mg" | "vitamin_d_ug" | "epa_g" | "dha_g";

export interface NevoGehaltes {
  /** NEVO-code, gelijk aan die in \`food-catalog-nevo.ts\`. */
  code: string;
  protein_g?: number;
  magnesium_mg?: number;
  zinc_mg?: number;
  vitamin_d_ug?: number;
  epa_g?: number;
  dha_g?: number;
  /** Alleen voor dichtheid en context (rijkste bronnen), geen dagboekstof. */
  energy_kcal?: number;
  /** Alleen als neutrale context naast een bron, zonder oordeel. */
  fiber_g?: number;
  /** Informatieve stoffen voor de rijkste-bronnenlijst; geen kernstof, geen oordeel. */
  potassium_mg?: number;
  calcium_mg?: number;
  iron_mg?: number;
  vitamin_b12_ug?: number;
  vitamin_c_mg?: number;
  /** Kernstoffen die NEVO als 0 meldt: gemeten, niets erin. */
  nul?: readonly NevoKernVeld[];
  /** Kernstoffen die NEVO als spoor (TR) meldt. */
  spoor?: readonly NevoKernVeld[];
}

/** Gehaltes van een vergelijkbaar NEVO-record, alleen ter weergave en altijd met {@link naam} erbij. */
export interface NevoBenaderingGehaltes extends NevoGehaltes {
  /** De NEVO-naam van het record waarvan de waarden komen. */
  naam: string;
}

export const NEVO_GEHALTES_EDITIE = "${NEVO_EDITIE}";

export const FOOD_CATALOG_NEVO_GEHALTES: Readonly<Record<string, NevoGehaltes>> = {
${body}
};

export const FOOD_CATALOG_NEVO_BENADERINGEN: Readonly<Record<string, NevoBenaderingGehaltes>> = {
${benaderingBody}
};
`;
}

const NEVO_CITATION_REGEL = `NEVO-online versie ${NEVO_EDITIE}, RIVM, Bilthoven`;

function main() {
  const droog = process.argv.includes("--droog");
  if (!fs.existsSync(CSV_PAD)) {
    console.error(`NEVO-bestand niet gevonden: ${CSV_PAD}`);
    process.exit(1);
  }
  const koppelingen = leesKoppelingen(fs.readFileSync(KOPPELING_FILE, "utf8"));
  const categorieen = leesCategorieen(fs.readFileSync(CATALOG_FILE, "utf8"));
  const nevo = bouwVoedingsmiddelen(parseDelimited(fs.readFileSync(CSV_PAD, "utf8")));
  const perCode = new Map(nevo.voedingsmiddelen.map((v) => [v.code, v]));

  const tonen = JSON.parse(fs.readFileSync(BENADERING_FILE, "utf8")).toon ?? {};

  const regels = [];
  const benaderingen = [];
  const zonder = [];
  let benadering = 0;
  for (const [key, { code, basis }] of Object.entries(koppelingen).sort(([a], [b]) => a.localeCompare(b))) {
    const voedingsmiddel = perCode.get(code);
    if (basis === "benadering") {
      benadering++;
      const gehaltes = key in tonen && voedingsmiddel ? gehaltesVoor(voedingsmiddel, categorieen[key]) : null;
      if (gehaltes) benaderingen.push([key, code, voedingsmiddel.naam.trim(), gehaltes]);
      continue;
    }
    const gehaltes = voedingsmiddel ? gehaltesVoor(voedingsmiddel, categorieen[key]) : null;
    if (!gehaltes) {
      zonder.push(key);
      continue;
    }
    regels.push([key, code, gehaltes]);
  }

  console.log(`Koppelingen: ${Object.keys(koppelingen).length}`);
  console.log(`Geschreven: ${regels.length}`);
  console.log(`Benaderingen: ${benadering}, waarvan getoond: ${benaderingen.length}`);
  const onbekend = Object.keys(tonen).filter((key) => koppelingen[key]?.basis !== "benadering");
  if (onbekend.length) console.warn(`Let op: geen benadering in de koppeling: ${onbekend.join(", ")}`);
  console.log(`Zonder bruikbaar gehalte (of per 100 ml): ${zonder.length}${zonder.length ? ` — ${zonder.join(", ")}` : ""}`);
  if (droog) return;
  fs.writeFileSync(OUT_FILE, bouwBestand(regels, benaderingen));
  console.log(`Geschreven naar ${OUT_FILE}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
