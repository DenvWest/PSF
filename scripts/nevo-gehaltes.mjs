#!/usr/bin/env node
/**
 * Schrijft de NEVO-gehaltes van de vijf dagboekstoffen, plus energie en vezels
 * (voor de rijkste-bronnenlijst: per 100 kcal en als context), per catalogusregel naar
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
 *   - Alleen koppelingen met `basis` ongelijk aan `benadering`: een benadering
 *     is een vergelijkbaar record, geen brongetal, en mag niet in een som.
 *   - Alleen voedingsmiddelen per 100 g (de dagboekportie rekent in gram).
 *   - EPA en DHA alleen voor vis en zeevruchten ({@link OMEGA3_CATEGORIEEN}). NEVO
 *     meldt bij o.a. havermout, koek en pindakaas een DHA-waarde (laboratoriumruis
 *     van de vetzuuranalyse); die als omega-3-bron presenteren zou verkeerd lezen.
 *   - Een spoor (TR) of een 0 wordt weggelaten, niet als 0 geschreven: "niet
 *     gemeten" en "niets erin" zijn niet te onderscheiden in het bestand.
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

/** Eén catalogusregel → zijn gehaltes, of `null` als er niets te schrijven valt. */
export function gehaltesVoor(voedingsmiddel, categorie) {
  if (voedingsmiddel.per !== "100g") return null;
  const gehaltes = {};
  for (const [stofCode, veld] of STOFFEN) {
    if ((veld === "epa_g" || veld === "dha_g") && !OMEGA3_CATEGORIEEN.has(categorie)) continue;
    const stof = voedingsmiddel.stoffen[stofCode];
    if (!stof || stof.spoor || !(stof.w > 0)) continue;
    gehaltes[veld] = stof.w;
  }
  return Object.keys(gehaltes).length > 0 ? gehaltes : null;
}

export function bouwBestand(regels) {
  const body = regels
    .map(([key, code, gehaltes]) => {
      const velden = Object.entries(gehaltes)
        .map(([veld, waarde]) => `${veld}: ${waarde}`)
        .join(", ");
      return `  ${JSON.stringify(key)}: { code: ${JSON.stringify(code)}, ${velden} },`;
    })
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
 * Een stof die hier ontbreekt is niet gemeten, spoor of nul in NEVO: dat is
 * \`n.o.\`, nooit 0. Regels met \`basis: "benadering"\` staan hier niet.
 */
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
}

export const NEVO_GEHALTES_EDITIE = "${NEVO_EDITIE}";

export const FOOD_CATALOG_NEVO_GEHALTES: Readonly<Record<string, NevoGehaltes>> = {
${body}
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

  const regels = [];
  const zonder = [];
  let benadering = 0;
  for (const [key, { code, basis }] of Object.entries(koppelingen).sort(([a], [b]) => a.localeCompare(b))) {
    if (basis === "benadering") {
      benadering++;
      continue;
    }
    const voedingsmiddel = perCode.get(code);
    const gehaltes = voedingsmiddel ? gehaltesVoor(voedingsmiddel, categorieen[key]) : null;
    if (!gehaltes) {
      zonder.push(key);
      continue;
    }
    regels.push([key, code, gehaltes]);
  }

  console.log(`Koppelingen: ${Object.keys(koppelingen).length}`);
  console.log(`Geschreven: ${regels.length}`);
  console.log(`Overgeslagen als benadering: ${benadering}`);
  console.log(`Zonder bruikbaar gehalte (of per 100 ml): ${zonder.length}${zonder.length ? ` — ${zonder.join(", ")}` : ""}`);
  if (droog) return;
  fs.writeFileSync(OUT_FILE, bouwBestand(regels));
  console.log(`Geschreven naar ${OUT_FILE}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
