#!/usr/bin/env node
/**
 * Koppelt de regels van `FOOD_CATALOG` aan een NEVO-code.
 *
 * Schrijft `src/data/nutrition/food-catalog-nevo.ts` (alleen de koppelingen die
 * zeker genoeg zijn) en een reviewrapport met wat Dennis moet beoordelen. Een
 * koppeling zegt: "dit voedingsmiddel is in NEVO dit record". Er worden hier
 * geen waarden gekopieerd; het gehalte komt uit `nevo_foods` via de code.
 *
 * ## Wanneer een koppeling zeker is
 *
 *   - `bron`: de catalogusregel wijst naar een `FOOD_SOURCES`-rij die al uit NEVO
 *     komt (`origin: "nevo"`, met `ref`). Die code is al beoordeeld; alle rijen
 *     met dezelfde `bron` moeten dezelfde code noemen, anders is het onzeker.
 *   - `naam`: de naammatching van `nevo-extract.mjs` geeft één sterke kandidaat
 *     (score ≥ 1,0, hooguit één woord in de NEVO-naam dat het label niet noemt) die duidelijk boven de tweede ligt (marge ≥ 0,15), met een
 *     bereiding die niet botst met die van de regel, en de regel is niet
 *     `samengesteld` of `verrijkt` (die hebben van nature geen één-op-één-record).
 *
 * Al het andere is `onzeker` (met de beste kandidaten) of `geen` (geen kandidaat).
 * Dat is de lijst die beoordeeld wordt; zeker-op-`naam` staat ook in het
 * rapport, zodat een steekproef kan.
 *
 * ## Gebruik
 *
 *   node scripts/nevo-koppel.mjs [--csv=...] [--food-sources=pad/naar/food-sources.ts]
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  STERKE_SCORE,
  bouwVoedingsmiddelen,
  doelTokens,
  kandidaten,
  parseDelimited,
  parseFoodSources,
  tokens,
} from "./nevo-extract.mjs";

const CATALOG_FILE = path.join("src", "data", "nutrition", "food-catalog.ts");
const OUT_TS = path.join("src", "data", "nutrition", "food-catalog-nevo.ts");
const OUT_RAPPORT = path.join("docs", "plan", "STEEKPROEF_NEVO_KOPPELING_2026-10.md");

export const MARGE = 0.15;
export const MIN_SCORE_NAAM = 1.0;
export const MAX_OVERBODIGE_WOORDEN = 1;

/** NEVO-woorden die het label niet noemt: elk is een kenmerk (verpakking, vulling, soort) dat het label niet draagt. */
export function overbodigeWoorden(label, nevoNaam) {
  const gebruikt = new Set(doelTokens(label).tokens);
  return tokens(nevoNaam).filter((t) => !gebruikt.has(t));
}

/** Woorden in een NEVO-naam die een bereiding aanduiden, per `Bereiding` van de catalogus. */
const BEREIDING_WOORDEN = {
  rauw: ["rauw", "rauwe"],
  gekookt: ["gekookt", "gekookte", "gestoofd", "gestoomd", "gaar"],
  gestoomd: ["gestoomd", "gekookt", "gaar"],
  gebakken: ["gebakken", "bak"],
  gegrild: ["gegrild", "gebakken", "gebraden"],
  gefrituurd: ["gefrituurd", "gebakken"],
  geroosterd: ["geroosterd", "gebrand", "gebakken"],
  diepvries: ["diepvries", "bevroren"],
  blik: ["blik", "conserven", "ingeblikt", "op sap", "in olie"],
  gedroogd: ["gedroogd", "droog", "gedroogde"],
  gerookt: ["gerookt", "gerookte"],
  gefermenteerd: ["gefermenteerd", "zuur"],
};
const ANDERE_BEREIDING = Object.values(BEREIDING_WOORDEN).flat();

/** Botst de bereiding van het NEVO-record met die van de catalogusregel? */
export function bereidingBotst(bereiding, nevoNaam) {
  const naam = ` ${nevoNaam.toLowerCase()} `;
  const heeft = (w) => naam.includes(` ${w} `) || naam.includes(`${w},`) || naam.includes(` ${w}`);
  if (!bereiding) return false;
  const eigen = BEREIDING_WOORDEN[bereiding] ?? [];
  if (eigen.some(heeft)) return false;
  // De regel noemt een bereiding en NEVO noemt een andere: botsing.
  if (bereiding === "rauw") return ANDERE_BEREIDING.filter((w) => !BEREIDING_WOORDEN.rauw.includes(w)).some(heeft);
  return ANDERE_BEREIDING.some(heeft);
}

/** Leest `f("key", "Label", …, bron, { bereiding, geenBron })` per regel uit de catalogus. */
export function leesCatalogusRegels(tekst) {
  const regels = [];
  let buffer = "";
  const verwerk = (blok) => {
    const m = blok.match(/f\("([^"]+)",\s*"([^"]+)"/);
    if (!m) return;
    const bron = blok.match(/(?:\]|P\.\w+)\s*,\s*(null|"[^"]+")\s*(?:,\s*\{|\))/);
    regels.push({
      key: m[1],
      label: m[2],
      bron: !bron || bron[1] === "null" ? null : bron[1].slice(1, -1),
      geenBron: (blok.match(/geenBron:\s*"(\w+)"/) ?? [])[1] ?? null,
      bereiding: (blok.match(/bereiding:\s*"(\w+)"/) ?? [])[1] ?? null,
    });
  };
  for (const regel of tekst.split("\n")) {
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
  return regels;
}

/** Bepaalt per catalogusregel de koppeling. Puur: krijgt alles aangeleverd. */
export function koppel({ regels, foodSources, voedingsmiddelen }) {
  const perCode = new Map(voedingsmiddelen.map((v) => [v.code, v]));
  const nevoCodesPerBron = new Map();
  for (const rij of foodSources) {
    if (rij.huidig?.origin !== "nevo" || !rij.huidig.ref) continue;
    if (!nevoCodesPerBron.has(rij.key)) nevoCodesPerBron.set(rij.key, new Set());
    nevoCodesPerBron.get(rij.key).add(rij.huidig.ref);
  }

  return regels.map((regel) => {
    const codes = regel.bron ? nevoCodesPerBron.get(regel.bron) : undefined;
    if (codes && codes.size === 1) {
      const code = [...codes][0];
      if (perCode.has(code)) return { ...regel, status: "zeker", basis: "bron", code };
    }
    const lijst = kandidaten(regel.label, voedingsmiddelen, 3, 0.5);
    const top = lijst[0];
    const tweede = lijst[1];
    const kandidatenTekst = lijst.map(({ v, score }) => ({ code: v.code, naam: v.naam, score }));
    if (codes && codes.size > 1) {
      return { ...regel, status: "onzeker", reden: `meerdere NEVO-codes via bron: ${[...codes].join(", ")}`, kandidaten: kandidatenTekst };
    }
    if (!top) return { ...regel, status: "geen", kandidaten: [] };
    if (regel.geenBron === "samengesteld" || regel.geenBron === "verrijkt") {
      return { ...regel, status: "onzeker", reden: `geenBron: ${regel.geenBron}`, kandidaten: kandidatenTekst };
    }
    if (top.score >= STERKE_SCORE && (top.score < MIN_SCORE_NAAM || overbodigeWoorden(regel.label, top.v.naam).length > MAX_OVERBODIGE_WOORDEN)) {
      return {
        ...regel,
        status: "onzeker",
        reden: `NEVO-naam draagt extra kenmerken: ${overbodigeWoorden(regel.label, top.v.naam).join(", ") || "score " + top.score.toFixed(2)}`,
        kandidaten: kandidatenTekst,
      };
    }
    if (top.score < STERKE_SCORE) {
      return { ...regel, status: "onzeker", reden: `beste score ${top.score.toFixed(2)} < ${STERKE_SCORE}`, kandidaten: kandidatenTekst };
    }
    if (tweede && top.score - tweede.score < MARGE) {
      return { ...regel, status: "onzeker", reden: `marge ${(top.score - tweede.score).toFixed(2)} < ${MARGE}`, kandidaten: kandidatenTekst };
    }
    if (bereidingBotst(regel.bereiding, top.v.naam)) {
      return { ...regel, status: "onzeker", reden: `bereiding ${regel.bereiding} botst met "${top.v.naam}"`, kandidaten: kandidatenTekst };
    }
    return { ...regel, status: "zeker", basis: "naam", code: top.v.code, score: top.score, kandidaten: kandidatenTekst };
  });
}

export function bouwTs(koppelingen) {
  const zeker = koppelingen.filter((k) => k.status === "zeker").sort((a, b) => a.key.localeCompare(b.key));
  const regels = zeker.map((k) => `  ${JSON.stringify(k.key)}: { code: ${JSON.stringify(k.code)}, basis: ${JSON.stringify(k.basis)} },`);
  return `/**
 * Koppeling van \`FOOD_CATALOG\`-regels aan een NEVO-code (NEVO-online 2025/9.0).
 *
 * Gegenereerd door \`scripts/nevo-koppel.mjs\` — niet met de hand aanpassen;
 * draai het script opnieuw. Een koppeling zegt alleen "dit voedingsmiddel is in
 * NEVO dit record"; het gehalte staat nooit hier maar in \`nevo_foods\`, bij die
 * code, ongewijzigd en met versie.
 *
 * \`basis\`:
 *   - \`bron\`: de catalogusregel wijst naar een \`FOOD_SOURCES\`-rij die al uit NEVO komt.
 *   - \`naam\`: één sterke naamkandidaat, bereiding niet in strijd (zie het script).
 *
 * Regels die hier ontbreken zijn onzeker of hebben geen tegenhanger in NEVO;
 * ze staan met kandidaten in \`docs/plan/STEEKPROEF_NEVO_KOPPELING_2026-10.md\`.
 */
export type NevoKoppelingBasis = "bron" | "naam";

export interface NevoKoppeling {
  /** NEVO-code, de sleutel in \`nevo_foods\`. */
  code: string;
  basis: NevoKoppelingBasis;
}

export const FOOD_CATALOG_NEVO: Readonly<Record<string, NevoKoppeling>> = {
${regels.join("\n")}
};

/** NEVO-koppeling van een catalogusregel, of \`null\` als die (nog) niet zeker is. */
export function nevoKoppelingVoor(catalogKey: string): NevoKoppeling | null {
  return FOOD_CATALOG_NEVO[catalogKey] ?? null;
}
`;
}

function pijp(t) {
  return String(t).replaceAll("|", "/");
}

export function bouwRapport(koppelingen, voedingsmiddelen) {
  const perCode = new Map(voedingsmiddelen.map((v) => [v.code, v]));
  const tel = (f) => koppelingen.filter(f).length;
  const r = [];
  r.push("# Steekproef: koppeling FOOD_CATALOG ↔ NEVO 2025/9.0");
  r.push("");
  r.push("Gegenereerd door `scripts/nevo-koppel.mjs` (deterministisch). Voorstellen op naam; de beoordeling is aan Dennis. Zekere koppelingen staan in `src/data/nutrition/food-catalog-nevo.ts`.");
  r.push("");
  r.push(`- Catalogusregels: ${koppelingen.length}`);
  r.push(`- Zeker via \`bron\` (FOOD_SOURCES-rij uit NEVO): ${tel((k) => k.basis === "bron")}`);
  r.push(`- Zeker via \`naam\` (één sterke kandidaat): ${tel((k) => k.basis === "naam")}`);
  r.push(`- **Onzeker (te beoordelen): ${tel((k) => k.status === "onzeker")}**`);
  r.push(`- Geen kandidaat: ${tel((k) => k.status === "geen")}`);
  r.push("");
  r.push("## Onzeker: beoordelen");
  r.push("");
  r.push("Kies per regel de code, of laat de regel zonder NEVO-koppeling. Een goede koppeling kan in `scripts/nevo-koppel.mjs` als handmatige uitzondering of direct in het TS-bestand worden vastgelegd (en overleeft dan niet een nieuwe run: zet hem dan in `HANDMATIG`).");
  r.push("");
  r.push("| Sleutel | Label | Reden | Kandidaten (code · naam · score) |");
  r.push("|---|---|---|---|");
  for (const k of koppelingen.filter((x) => x.status === "onzeker")) {
    const lijst = k.kandidaten.map((c) => `${c.code} · ${pijp(c.naam)} · ${c.score.toFixed(2)}`).join("<br>");
    r.push(`| ${k.key} | ${pijp(k.label)} | ${pijp(k.reden)} | ${lijst || "—"} |`);
  }
  r.push("");
  r.push("## Geen kandidaat");
  r.push("");
  r.push("| Sleutel | Label |");
  r.push("|---|---|");
  for (const k of koppelingen.filter((x) => x.status === "geen")) r.push(`| ${k.key} | ${pijp(k.label)} |`);
  r.push("");
  r.push("## Zeker op naam (steekproef)");
  r.push("");
  r.push("| Sleutel | Label | NEVO-code | NEVO-naam | Score |");
  r.push("|---|---|---|---|---|");
  for (const k of koppelingen.filter((x) => x.basis === "naam")) {
    r.push(`| ${k.key} | ${pijp(k.label)} | ${k.code} | ${pijp(perCode.get(k.code)?.naam ?? "?")} | ${k.score.toFixed(2)} |`);
  }
  r.push("");
  r.push("## Zeker via bron");
  r.push("");
  r.push("| Sleutel | Label | NEVO-code | NEVO-naam |");
  r.push("|---|---|---|---|");
  for (const k of koppelingen.filter((x) => x.basis === "bron")) {
    r.push(`| ${k.key} | ${pijp(k.label)} | ${k.code} | ${pijp(perCode.get(k.code)?.naam ?? "?")} |`);
  }
  r.push("");
  return r.join("\n");
}

function main() {
  const arg = (naam) => (process.argv.find((a) => a.startsWith(`--${naam}=`)) ?? "").slice(naam.length + 3);
  const csv = arg("csv") || process.env.NEVO_CSV || path.join(os.homedir(), "Downloads", "NEVO2025_v9.0_Details.csv");
  const foodSourcesPad = arg("food-sources") || path.join("src", "data", "nutrition", "food-sources.ts");
  if (!fs.existsSync(csv)) {
    console.error(`NEVO-bestand niet gevonden: ${csv}`);
    process.exit(1);
  }
  const data = bouwVoedingsmiddelen(parseDelimited(fs.readFileSync(csv, "utf8")));
  for (const v of data.voedingsmiddelen) v._tokens = tokens(v.naam);
  const koppelingen = koppel({
    regels: leesCatalogusRegels(fs.readFileSync(CATALOG_FILE, "utf8")),
    foodSources: parseFoodSources(fs.readFileSync(foodSourcesPad, "utf8")),
    voedingsmiddelen: data.voedingsmiddelen,
  });
  fs.writeFileSync(OUT_TS, bouwTs(koppelingen));
  fs.writeFileSync(OUT_RAPPORT, bouwRapport(koppelingen, data.voedingsmiddelen));
  const tel = (s) => koppelingen.filter((k) => k.status === s).length;
  console.log(`${koppelingen.length} regels: ${tel("zeker")} zeker, ${tel("onzeker")} onzeker, ${tel("geen")} geen kandidaat`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
