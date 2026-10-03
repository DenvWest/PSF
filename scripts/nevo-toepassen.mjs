#!/usr/bin/env node
/**
 * Past de beslissingen over NEVO toe op `src/data/nutrition/food-sources.ts`.
 *
 * `docs/plan/BESLISSINGEN_NEVO_KERNSTOFFEN_2026-10.json` zegt per rij welk
 * NEVO-voedingsmiddel de bron wordt. Dit script leest die beslissingen en het
 * NEVO-bestand, en schrijft per rij `source`, `nutrientValue`, `amount` en
 * `verified` om. Het beslist zelf niets: wat niet in `toepassen` staat, blijft
 * ongemoeid, en elke afwijking van wat het verwacht is een fout, geen gok.
 *
 * ## Wat een omgezette rij krijgt
 *
 *   - `nutrientValue`: het NEVO-getal per 100 g, exact zoals het bestand het
 *     geeft, met de NEVO-code en editie. Geen `observed`: NEVO publiceert geen
 *     spreiding, dat veld hoorde bij USDA.
 *   - `amount`: dat getal omgerekend naar de portie, met dezelfde formule als
 *     `amountForPortion()`. De portiegrootte komt uit `portionNl` ("150 g
 *     gekookt"), en bij "2 stuks" uit de verhouding tussen de oude `amount` en
 *     `nutrientValue`, afgerond op 5 g.
 *   - `verified: true`: het gehalte is naast het brondbestand gelegd. Dat slaat
 *     alleen op `nutrientValue`, niet op de literatuuroordelen in dezelfde rij.
 *
 * ## Wat het weigert
 *
 *   - een NEVO-stof met een andere eenheid dan de rij verwacht
 *   - een waarde die NEVO als spoor (TR) markeert: een 0 als plaatshouder is
 *     geen gehalte
 *   - een voedingsmiddel dat NEVO per 100 ml geeft, want `per` kent alleen 100 g
 *   - een rij waarvan de portiegrootte niet te bepalen is
 *
 * ## Gebruik
 *
 *   node scripts/nevo-toepassen.mjs            (schrijft food-sources.ts en een overzicht)
 *   node scripts/nevo-toepassen.mjs --droog    (toont alleen wat er zou veranderen)
 *
 * Uitvoer: `src/data/nutrition/food-sources.ts` en
 * `docs/plan/STEEKPROEF_NEVO_TOEPASSING_2026-10.md` (deterministisch).
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ARRAY_NAAR_STOF, bouwVoedingsmiddelen, parseDelimited } from "./nevo-extract.mjs";

const FOOD_SOURCES_FILE = path.join("src", "data", "nutrition", "food-sources.ts");
const BESLISSINGEN_FILE = path.join("docs", "plan", "BESLISSINGEN_NEVO_KERNSTOFFEN_2026-10.json");
const OVERZICHT_FILE = path.join("docs", "plan", "STEEKPROEF_NEVO_TOEPASSING_2026-10.md");
const NEVO_EDITIE = "2025/9.0";

const argCsv = (process.argv.find((a) => a.startsWith("--csv=")) ?? "").slice(6);
const CSV_PAD = argCsv || process.env.NEVO_CSV || path.join(os.homedir(), "Downloads", "NEVO2025_v9.0_Details.csv");

/** NEVO-code per kernstof waar deze rijen op leunen. Omega-3 ontbreekt bewust: zie het beslissingenbestand. */
const STOF_NAAR_NEVO = {
  protein: { code: "PROT", eenheid: "g" },
  magnesium: { code: "MG", eenheid: "mg" },
  vitamin_d: { code: "VITD", eenheid: "µg" },
  zinc: { code: "ZN", eenheid: "mg" },
};

/** Zelfde formule als `amountForPortion()` in food-sources.ts. */
export function portieBedrag(waarde, grams) {
  return Math.round(((waarde * grams) / 100) * 10) / 10;
}

/**
 * Hoeveel gram een portie is: eerst uit `portionNl` ("100 g", "1 stuk (120 g)",
 * "200 ml (glas)"), anders uit de verhouding tussen de oude `amount` en
 * `nutrientValue`, afgerond op 5 g ("2 stuks", "2 sneden"). `null` als geen van
 * beide lukt: dan weigert het script de rij.
 */
export function gramsVoorPortie({ portie, oudeWaarde, oudBedrag }) {
  const m = (portie ?? "").match(/(\d+(?:[.,]\d+)?)\s*(?:g|ml)\b/);
  if (m) return Number(m[1].replace(",", "."));
  if (typeof oudeWaarde === "number" && oudeWaarde > 0 && typeof oudBedrag === "number" && oudBedrag > 0) {
    return Math.round(((oudBedrag / oudeWaarde) * 100) / 5) * 5;
  }
  return null;
}

function getal(tekst) {
  const n = Number(tekst);
  return Number.isFinite(n) ? n : null;
}

/**
 * Zet één rij (de tekst tussen `{` en `}` van een FoodSource) om naar NEVO.
 * Geeft `{ fout }` terug als de rij niet veilig om te zetten is.
 */
export function zetRijOm(rij, { code, naam, waarde, eenheid }) {
  const tekst = `\n${rij}`;
  const bronRegel = tekst.match(/\n {4}source: (usda\([^)]*\)|\{[^}]*\}|[A-Z][A-Z_]*),/);
  const verified = tekst.match(/\n {4}verified: (true|false),/);
  const amountRegel = tekst.match(/\n {4}amount: (null|[\d.]+),/);
  if (!bronRegel || !verified || !amountRegel) return { fout: "rij heeft niet de verwachte velden (source, amount, verified)" };

  const portie = tekst.match(/portionNl:\s*"([^"]+)"/)?.[1] ?? null;
  const oudeBlok = tekst.match(/\n {4}nutrientValue: \{[\s\S]*?\n {4}\},/);
  const oudeWaarde = oudeBlok ? getal(oudeBlok[0].match(/value:\s*([\d.]+)/)?.[1]) : null;
  const oudBedrag = amountRegel[1] === "null" ? null : getal(amountRegel[1]);
  const grams = gramsVoorPortie({ portie, oudeWaarde, oudBedrag });
  if (grams === null) return { fout: `portiegrootte niet te bepalen uit "${portie}"` };

  // `UNVERIFIED` is de constante voor een rij zonder brondwaarde: een indicatieve literatuurwaarde.
  const oudeBron = bronRegel[1].startsWith("usda(")
    ? `usda ${bronRegel[1].match(/usda\("(\d+)"/)?.[1]}`
    : bronRegel[1] === "UNVERIFIED"
      ? "geen bron"
      : (bronRegel[1].match(/origin:\s*"(\w+)"/)?.[1] ?? "onbekend");

  const nieuweBron = `{ origin: "nevo", ref: "${code}", edition: "${NEVO_EDITIE}" }`;
  const nieuwBlok = [
    "\n    nutrientValue: {",
    `      value: ${waarde},`,
    `      unit: "${eenheid}",`,
    '      per: "100g",',
    `      source: ${nieuweBron},`,
    `      sourceNameNl: ${JSON.stringify(naam)},`,
    "    },",
  ].join("\n");

  let uit = tekst.replace(bronRegel[0], `\n    source: ${nieuweBron},`);
  uit = oudeBlok
    ? uit.replace(oudeBlok[0], nieuwBlok)
    : uit.replace(`\n    source: ${nieuweBron},`, `\n    source: ${nieuweBron},${nieuwBlok}`);
  uit = uit.replace(amountRegel[0], `\n    amount: ${portieBedrag(waarde, grams)},`);
  uit = uit.replace(verified[0], "\n    verified: true,");

  return {
    rij: uit.slice(1),
    grams,
    oud: { waarde: oudeWaarde, bedrag: oudBedrag, bron: oudeBron, verified: verified[1] === "true" },
    nieuw: { waarde, bedrag: portieBedrag(waarde, grams) },
  };
}

/**
 * Past alle beslissingen uit `toepassen` toe op de tekst van food-sources.ts.
 * Geeft de nieuwe tekst, de wijzigingen en de fouten terug; bij een fout blijft
 * die rij ongemoeid en gaat het script door met de rest.
 */
export function pasToe(tekst, beslissingen, nevo) {
  const perCode = new Map(nevo.voedingsmiddelen.map((v) => [v.code, v]));
  const wijzigingen = [];
  const fouten = [];
  const gevonden = new Set();

  const arrays = [...tekst.matchAll(/^const ([A-Z0-9_]+_SOURCES): readonly FoodSource\[\] = \[/gm)];
  let uit = "";
  let positie = 0;
  for (let a = 0; a < arrays.length; a++) {
    const stof = ARRAY_NAAR_STOF[arrays[a][1]]?.nutrient;
    const begin = arrays[a].index;
    const eind = a + 1 < arrays.length ? arrays[a + 1].index : tekst.length;
    uit += tekst.slice(positie, begin);
    let blok = tekst.slice(begin, eind);
    positie = eind;
    const verwacht = STOF_NAAR_NEVO[stof];
    if (!verwacht) {
      uit += blok;
      continue;
    }

    blok = blok.replace(/\n {2}\{\n([\s\S]*?)\n {2}\},/g, (heel, rij) => {
      const key = rij.match(/\n? {4}key:\s*"([^"]+)"/)?.[1];
      const beslissing = beslissingen.toepassen.find((b) => b.stof === stof && b.key === key);
      if (!beslissing) return heel;
      gevonden.add(`${stof}/${key}`);

      const v = perCode.get(beslissing.code);
      const gegeven = v?.stoffen[verwacht.code];
      const fout = (reden) => {
        fouten.push({ stof, key, code: beslissing.code, reden });
        return heel;
      };
      if (!v) return fout("NEVO-code niet in het bestand");
      if (!gegeven) return fout(`${verwacht.code} ontbreekt bij dit voedingsmiddel`);
      if (gegeven.spoor) return fout("NEVO markeert deze waarde als spoor (TR)");
      if (v.per !== "100g") return fout(`NEVO geeft dit per ${v.per}, ons model kent alleen 100 g`);
      if (nevo.stoffen[verwacht.code]?.eenheid !== verwacht.eenheid) {
        return fout(`eenheid ${nevo.stoffen[verwacht.code]?.eenheid} is niet ${verwacht.eenheid}`);
      }

      const omgezet = zetRijOm(rij, { code: v.code, naam: v.naam, waarde: gegeven.w, eenheid: verwacht.eenheid });
      if (omgezet.fout) return fout(omgezet.fout);
      wijzigingen.push({ stof, key, code: v.code, naam: v.naam, grams: omgezet.grams, oud: omgezet.oud, nieuw: omgezet.nieuw, opm: beslissing.opm ?? null });
      return `\n  {\n${omgezet.rij}\n  },`;
    });
    uit += blok;
  }
  uit += tekst.slice(positie);

  for (const b of beslissingen.toepassen) {
    if (!gevonden.has(`${b.stof}/${b.key}`)) fouten.push({ stof: b.stof, key: b.key, code: b.code, reden: "rij niet gevonden in food-sources.ts" });
  }
  return { tekst: uit, wijzigingen, fouten };
}

function fmt(getal, cijfers = 2) {
  if (getal === null || getal === undefined) return "—";
  return String(Math.round(getal * 10 ** cijfers) / 10 ** cijfers).replace(".", ",");
}

export function bouwOverzicht({ wijzigingen, fouten, beslissingen }) {
  const r = [];
  r.push("# Toepassing NEVO-beslissingen (overzicht)");
  r.push("");
  r.push("Gegenereerd door `node scripts/nevo-toepassen.mjs` — niet met de hand bewerken.");
  r.push(`Bron: NEVO-online versie ${NEVO_EDITIE}, RIVM, Bilthoven. Beslissingen: \`BESLISSINGEN_NEVO_KERNSTOFFEN_2026-10.json\`.`);
  r.push("");
  r.push(`**Regel:** ${beslissingen.regel}`);
  r.push("");
  r.push(`- Omgezet naar NEVO: **${wijzigingen.length}** rijen`);
  r.push(`- Waarvan voorheen zonder waarde ingevuld: ${wijzigingen.filter((w) => w.oud.waarde === null).length}`);
  r.push(`- Geweigerd door het script: ${fouten.length}`);
  r.push(`- Voorgelegd aan Dennis (niet toegepast): ${beslissingen.voorleggen.length}`);
  r.push("");
  r.push("## 1. Omgezet");
  r.push("");
  r.push("| Stof | Rij | Was | Wordt | Δ | Portie | Bedrag per portie | NEVO-voedingsmiddel (code) | Opmerking |");
  r.push("|---|---|---|---|---|---|---|---|---|");
  for (const w of wijzigingen) {
    const delta = w.oud.waarde ? `${w.nieuw.waarde >= w.oud.waarde ? "+" : ""}${Math.round(((w.nieuw.waarde - w.oud.waarde) / w.oud.waarde) * 100)}%` : "—";
    r.push(
      `| ${w.stof} | ${w.key} | ${fmt(w.oud.waarde)} (${w.oud.bron}) | ${fmt(w.nieuw.waarde)} | ${delta} | ${w.grams} g | ${fmt(w.oud.bedrag, 1)} → ${fmt(w.nieuw.bedrag, 1)} | ${w.naam.replaceAll("|", "/")} (${w.code}) | ${(w.opm ?? "").replaceAll("|", "/")} |`,
    );
  }
  r.push("");
  if (fouten.length > 0) {
    r.push("## 2. Geweigerd");
    r.push("");
    r.push("| Stof | Rij | Code | Reden |");
    r.push("|---|---|---|---|");
    for (const f of fouten) r.push(`| ${f.stof} | ${f.key} | ${f.code} | ${f.reden} |`);
    r.push("");
  }
  r.push("## 3. Voorgelegd: de bronnen verschillen meer dan 50%");
  r.push("");
  r.push("Niet toegepast. Per rij mijn advies; een rij blijft op USDA staan tot je kiest.");
  r.push("");
  r.push("| Stof | Rij | NEVO-code | Advies | Toelichting |");
  r.push("|---|---|---|---|---|");
  for (const v of beslissingen.voorleggen) r.push(`| ${v.stof} | ${v.key} | ${v.code} | ${v.advies} | ${v.opm.replaceAll("|", "/")} |`);
  r.push("");
  r.push("## 4. Blijft zoals het is");
  r.push("");
  r.push("| Stof | Rij | Reden |");
  r.push("|---|---|---|");
  for (const b of beslissingen.blijft) r.push(`| ${b.stof} | ${b.key} | ${b.reden.replaceAll("|", "/")} |`);
  r.push("");
  return r.join("\n");
}

function main() {
  if (!fs.existsSync(CSV_PAD)) {
    console.error(`NEVO-bestand niet gevonden: ${CSV_PAD}`);
    process.exit(1);
  }
  const droog = process.argv.includes("--droog");
  const beslissingen = JSON.parse(fs.readFileSync(BESLISSINGEN_FILE, "utf8"));
  const nevo = bouwVoedingsmiddelen(parseDelimited(fs.readFileSync(CSV_PAD, "utf8")));
  const resultaat = pasToe(fs.readFileSync(FOOD_SOURCES_FILE, "utf8"), beslissingen, nevo);

  console.log(`Omgezet: ${resultaat.wijzigingen.length}, geweigerd: ${resultaat.fouten.length}`);
  for (const f of resultaat.fouten) console.log(`  GEWEIGERD ${f.stof}/${f.key} (${f.code}): ${f.reden}`);
  if (droog) return;
  fs.writeFileSync(FOOD_SOURCES_FILE, resultaat.tekst);
  fs.writeFileSync(OVERZICHT_FILE, bouwOverzicht({ ...resultaat, beslissingen }));
  console.log(`Geschreven: ${FOOD_SOURCES_FILE}, ${OVERZICHT_FILE}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
