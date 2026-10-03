#!/usr/bin/env node
/**
 * Laag 0 + Laag 0b → `SupermarktProduct[]` (stap 3 van de restlijst).
 *
 * Zie VOORBEREIDING_LAAG_A_MACRO_MICRO_2026-09.md §2.3 (velddefinitie) en
 * §2.4 (filterregels). Voegt `scripts/out/supermarkt-rapport.json` (Laag 0)
 * en `scripts/out/supermarkt-usda-rapport.json` (Laag 0b) samen. Schrijft
 * een kandidaat-catalogus + een steekproef ter beoordeling; **patcht niets in
 * `src/`** — Dennis beoordeelt eerst (besluit: "niets automatisch overnemen").
 *
 * ## Filterregels
 *
 *   - Laag 0-rijen met een `verdacht`-array worden overgeslagen, niet
 *     gecorrigeerd (fysiek onmogelijke waarden, bijv. kJ/kcal verwisseld).
 *   - USDA-aanvulling staat standaard **uit** (Dennis, 3 okt): 65% van de
 *     matches spreekt het etiket van hetzelfde product tegen, zie
 *     VOORBEREIDING_LAAG_A_MACRO_MICRO_2026-09.md §5.2/§5.4. Met `--met-usda`
 *     geldt de oorspronkelijke §2.4-regel (alleen "sterk"/"zwak"). De
 *     aanvul-logica blijft staan voor een toekomstige betrouwbare bron (§6).
 *   - Aanvullen, nooit overschrijven: een USDA-waarde vult alleen een veld
 *     dat Laag 0 leeg liet (`null`).
 *   - Natrium uit USDA alleen als het etiket óók geen zout noemt — zout en
 *     natrium zijn dezelfde grootheid, en het etiket is de bron.
 *   - Een USDA-waarde met een onverwachte eenheid wordt genegeerd.
 *
 * `bron` wordt pas "supermarkt+usda" als er daadwerkelijk minstens één veld
 * uit USDA is ingevuld; alleen dan staat `usdaZekerheid` erop.
 *
 * ## Macro-controle (alleen gerapporteerd, niet gefilterd)
 *
 * De etiketmacro's van het product en de USDA-macro's van zijn match maken
 * een objectieve plausibiliteitstoets mogelijk: wijken kcal/vet/koolhydraten
 * van de USDA-match sterk af van het etiket, dan is de match vrijwel zeker
 * een ander product. Dit script telt dat per product (`macroOvereenstemming`)
 * en toont het in de steekproef, maar filtert er niet op — dat is een
 * beslissing voor de beoordeling, geen regel uit §2.4.
 *
 * ## Gebruik
 *
 *   node scripts/supermarkt-import.mjs
 *   node scripts/supermarkt-import.mjs --steekproef=60
 *   node scripts/supermarkt-import.mjs --met-usda   (alleen om de afgewezen USDA-meting te reproduceren)
 *
 * Uitvoer:
 *   scripts/out/supermarkt-catalog.json                 (SupermarktProduct[], gitignored)
 *   docs/plan/STEEKPROEF_SUPERMARKT_IMPORT_2026-10.md   (ter beoordeling, deterministisch)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = path.join("scripts", "out");
const LAAG0_FILE = path.join(OUT_DIR, "supermarkt-rapport.json");
const LAAG0B_FILE = path.join(OUT_DIR, "supermarkt-usda-rapport.json");
const CATALOG_FILE = path.join(OUT_DIR, "supermarkt-catalog.json");
const STEEKPROEF_FILE = path.join("docs", "plan", "STEEKPROEF_SUPERMARKT_IMPORT_2026-10.md");

export const SUPERMARKTEN = ["AH", "Jumbo", "Lidl", "Plus"];
export const BRUIKBARE_ZEKERHEID = new Set(["sterk", "zwak"]);

/** USDA-infoveld → `SupermarktProduct`-veld, met de verwachte eenheid. */
export const USDA_AANVULLING = {
  sodium: { veld: "sodiumMg", eenheid: "mg" },
  calcium: { veld: "calciumMg", eenheid: "mg" },
  iron: { veld: "ironMg", eenheid: "mg" },
  vitamin_c: { veld: "vitaminCMg", eenheid: "mg" },
};

const LAAG0_VELDEN = [
  "energyKcal",
  "fatG",
  "saturatedFatG",
  "carbohydrateG",
  "sugarsG",
  "fiberG",
  "proteinG",
  "saltG",
  "sodiumMg",
  "calciumMg",
  "ironMg",
  "vitaminCMg",
  "vitaminDµg",
];

function getal(waarde) {
  return typeof waarde === "number" && Number.isFinite(waarde) ? waarde : null;
}

function eenheidKlopt(gevonden, verwacht) {
  return typeof gevonden === "string" && gevonden.toLowerCase() === verwacht;
}

/**
 * Hoeveel van kcal/vet/koolhydraten tussen USDA-match en etiket overeenkomen
 * (binnen 25% of een absolute marge). `{ getoetst: 0 }` als er niets te
 * vergelijken viel.
 */
export function macroOvereenstemming(infoVelden, etiket) {
  const paren = [
    ["energy", "energyKcal", 40],
    ["fat", "fatG", 5],
    ["carbohydrate", "carbohydrateG", 8],
  ];
  let getoetst = 0;
  let klopt = 0;
  for (const [usdaKey, etiketKey, marge] of paren) {
    const usda = getal(infoVelden?.[usdaKey]?.amount);
    const label = getal(etiket?.[etiketKey]);
    if (usda === null || label === null) continue;
    getoetst++;
    if (Math.abs(usda - label) <= Math.max(marge, 0.25 * label)) klopt++;
  }
  return { getoetst, klopt };
}

/**
 * Eén Laag 0-product (+ optionele Laag 0b-rij) → `SupermarktProduct`, of
 * `null` als de rij volgens §2.4 niet mee mag.
 */
export function naarSupermarktProduct(laag0, supermarkt, usdaRij) {
  if (Array.isArray(laag0.verdacht) && laag0.verdacht.length > 0) return null;

  const product = {
    prodId: laag0.prodId,
    naam: laag0.naam.replaceAll("\\%", "%"),
    supermarkt,
    categorie: laag0.categorie ?? null,
  };
  for (const veld of LAAG0_VELDEN) product[veld] = getal(laag0[veld]);

  let aangevuld = false;
  if (usdaRij && BRUIKBARE_ZEKERHEID.has(usdaRij.zekerheid)) {
    for (const [usdaKey, { veld, eenheid }] of Object.entries(USDA_AANVULLING)) {
      if (product[veld] !== null) continue;
      if (veld === "sodiumMg" && product.saltG !== null) continue;
      const info = usdaRij.infoVelden?.[usdaKey];
      const waarde = getal(info?.amount);
      if (waarde === null || !eenheidKlopt(info?.unit, eenheid)) continue;
      product[veld] = Math.round(waarde * 10) / 10;
      aangevuld = true;
    }
  }

  product.bron = aangevuld ? "supermarkt+usda" : "supermarkt";
  if (aangevuld) product.usdaZekerheid = usdaRij.zekerheid;
  return product;
}

/** Voegt beide rapporten samen; geeft catalogus + tellingen terug. */
export function importeer(laag0Rapport, laag0bRapport, { metUsda = false } = {}) {
  const usdaPerId = new Map();
  if (metUsda) for (const rij of laag0bRapport.rijen ?? []) usdaPerId.set(rij.prodId, rij);

  const catalogus = [];
  const telling = {
    laag0Totaal: 0,
    verdachtOvergeslagen: 0,
    usdaRijen: usdaPerId.size,
    usdaBruikbaar: 0,
    usdaAangevuld: { sterk: 0, zwak: 0 },
    usdaAangevuldMacroTegen: 0,
    veldDekking: {},
  };

  for (const supermarkt of SUPERMARKTEN) {
    for (const laag0 of laag0Rapport.supermarkten?.[supermarkt]?.producten ?? []) {
      telling.laag0Totaal++;
      const usdaRij = usdaPerId.get(laag0.prodId);
      if (usdaRij && BRUIKBARE_ZEKERHEID.has(usdaRij.zekerheid)) telling.usdaBruikbaar++;
      const product = naarSupermarktProduct(laag0, supermarkt, usdaRij);
      if (!product) {
        telling.verdachtOvergeslagen++;
        continue;
      }
      if (product.bron === "supermarkt+usda") {
        telling.usdaAangevuld[product.usdaZekerheid]++;
        const { getoetst, klopt } = macroOvereenstemming(usdaRij.infoVelden, product);
        if (getoetst > 0 && klopt < getoetst) telling.usdaAangevuldMacroTegen++;
      }
      catalogus.push(product);
    }
  }

  for (const veld of LAAG0_VELDEN) {
    telling.veldDekking[veld] = catalogus.filter((p) => p[veld] !== null).length;
  }
  return { catalogus, telling, usdaPerId };
}

/** Deterministische steekproef: elke n-de rij, zodat een herhaalde run dezelfde set geeft. */
export function steekproef(lijst, aantal) {
  if (lijst.length <= aantal) return [...lijst];
  const stap = lijst.length / aantal;
  return Array.from({ length: aantal }, (_, i) => lijst[Math.floor(i * stap)]);
}

function fmt(waarde) {
  return waarde === null || waarde === undefined ? "n.o." : String(waarde);
}

function schrijfSteekproef({ catalogus, telling, usdaPerId }, aantal) {
  const metUsda = catalogus.filter((p) => p.bron === "supermarkt+usda");
  const zonderUsda = catalogus.filter((p) => p.bron === "supermarkt");
  const regels = [
    "# Steekproef supermarkt-import (ter beoordeling)",
    "",
    "Gegenereerd door `node scripts/supermarkt-import.mjs` — niet met de hand bewerken.",
    "Zie `VOORBEREIDING_LAAG_A_MACRO_MICRO_2026-09.md` §5 voor de bevindingen en open beslissingen.",
    "",
    "## Tellingen",
    "",
    `- Laag 0-producten: ${telling.laag0Totaal}`,
    `- Overgeslagen (verdacht): ${telling.verdachtOvergeslagen}`,
    `- In catalogus: ${catalogus.length}`,
    `- Laag 0b-rijen: ${telling.usdaRijen}, waarvan bruikbaar (sterk/zwak): ${telling.usdaBruikbaar}`,
    `- Daadwerkelijk aangevuld uit USDA: sterk ${telling.usdaAangevuld.sterk}, zwak ${telling.usdaAangevuld.zwak}`,
    `- Waarvan USDA-macro's het etiket tegenspreken (≥1 van kcal/vet/koolhydraten >25% af): ${telling.usdaAangevuldMacroTegen}`,
    "",
    "Velddekking (niet-null):",
    "",
    ...Object.entries(telling.veldDekking).map(([veld, n]) => `- ${veld}: ${n}`),
    "",
    `## A. ${aantal} producten zonder USDA-aanvulling (alleen etiket)`,
    "",
    "| Supermarkt | Product | kcal | vet | verz. | koolh. | suikers | vezels | eiwit | zout |",
    "|---|---|---|---|---|---|---|---|---|---|",
    ...steekproef(zonderUsda, aantal).map(
      (p) =>
        `| ${p.supermarkt} | ${p.naam} | ${fmt(p.energyKcal)} | ${fmt(p.fatG)} | ${fmt(p.saturatedFatG)} | ${fmt(p.carbohydrateG)} | ${fmt(p.sugarsG)} | ${fmt(p.fiberG)} | ${fmt(p.proteinG)} | ${fmt(p.saltG)} |`,
    ),
    "",
    ...(metUsda.length === 0 ? ["_Geen USDA-aanvulling (standaard sinds 3 okt, zie VOORBEREIDING §5.4). Draai met `--met-usda` om de afgewezen meting te reproduceren._", ""] : []),
    `## B. ${aantal} producten mét USDA-aanvulling`,
    "",
    "Macro-check = hoeveel van kcal/vet/koolhydraten de USDA-match met het etiket deelt.",
    "",
    "| Supermarkt | Product | USDA-match | zekerheid | macro-check | Na mg | Ca mg | Fe mg | vit C mg |",
    "|---|---|---|---|---|---|---|---|---|",
    ...steekproef(metUsda, aantal).map((p) => {
      const rij = usdaPerId.get(p.prodId);
      const { getoetst, klopt } = macroOvereenstemming(rij.infoVelden, p);
      return `| ${p.supermarkt} | ${p.naam} | ${rij.fdcNaam} | ${p.usdaZekerheid} | ${klopt}/${getoetst} | ${fmt(p.sodiumMg)} | ${fmt(p.calciumMg)} | ${fmt(p.ironMg)} | ${fmt(p.vitaminCMg)} |`;
    }),
    "",
  ];
  fs.writeFileSync(STEEKPROEF_FILE, regels.join("\n").replaceAll("\\", "/"));
}

function main() {
  const aantalArg = process.argv.find((a) => a.startsWith("--steekproef="));
  const aantal = aantalArg ? Number(aantalArg.slice(13)) : 40;

  const laag0 = JSON.parse(fs.readFileSync(LAAG0_FILE, "utf8"));
  const laag0b = JSON.parse(fs.readFileSync(LAAG0B_FILE, "utf8"));
  const resultaat = importeer(laag0, laag0b, { metUsda: process.argv.includes("--met-usda") });

  fs.writeFileSync(CATALOG_FILE, JSON.stringify(resultaat.catalogus));
  schrijfSteekproef(resultaat, aantal);

  const { telling, catalogus } = resultaat;
  console.log(`Laag 0-producten:          ${telling.laag0Totaal}`);
  console.log(`  verdacht overgeslagen:   ${telling.verdachtOvergeslagen}`);
  console.log(`  in catalogus:            ${catalogus.length}`);
  console.log(`USDA bruikbaar (sterk/zwak): ${telling.usdaBruikbaar}`);
  console.log(`  aangevuld sterk:         ${telling.usdaAangevuld.sterk}`);
  console.log(`  aangevuld zwak:          ${telling.usdaAangevuld.zwak}`);
  console.log(`  macro's spreken etiket tegen: ${telling.usdaAangevuldMacroTegen}`);
  console.log(`Uitvoer: ${CATALOG_FILE} (${(fs.statSync(CATALOG_FILE).size / 1e6).toFixed(1)} MB), ${STEEKPROEF_FILE}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
