#!/usr/bin/env node
/**
 * NEVO-online 2025/9.0 → gestructureerde voedingsmiddelen + reviewrapport.
 *
 * Leest het officiële databestand (`NEVO2025_v9.0_Details.csv`, handmatig
 * gedownload na akkoord met de RIVM-voorwaarden) en legt het naast wat de
 * code nu heeft: `food-sources.ts` (de vijf kernstoffen) en `food-catalog.ts`
 * (de generieke dagboekregels). Schrijft een rapport; **patcht niets** — zelfde
 * regel als `usda-extract.mjs`. De matchbeoordeling is het werk, niet het
 * ophalen: "Melk halfvolle" is geen "Melk halfvolle verrijkt m calcium".
 *
 * ## Wat de voorwaarden dwingen (RIVM, versie 2025/9.0)
 *
 *   - Gebruik "alleen in ongewijzigde vorm" en met bron en versienummer. Dit
 *     script bewaart de waarden daarom exact: de decimale komma wordt een punt
 *     (representatie), er wordt niets afgerond, omgerekend of gemiddeld.
 *   - Aanvullingen mogen, mits direct duidelijk is dat het aanvullingen zijn.
 *     Afgeleide waarden (portie-omrekening, EPA+DHA-som) blijven daarom buiten
 *     de brondata en staan in het rapport expliciet als "afgeleid".
 *   - Geen kosten voor (eind)gebruikers voor het gebruik van NEVO-online.
 *
 * ## Het bestandsformaat
 *
 * Lang formaat, `|`-gescheiden, UTF-8, CRLF: één regel per voedingsmiddel én
 * stof. Waarden hebben soms een decimale komma ("1,8"). De kolom
 * "Spoor / Verrijkt" draagt `TR` (spoor: de waarde is 0 als plaatshouder) of
 * `+` (de waarde van die stof is het gevolg van verrijking).
 *
 * ## Gebruik
 *
 *   node scripts/nevo-extract.mjs
 *   node scripts/nevo-extract.mjs --csv=/pad/naar/NEVO2025_v9.0_Details.csv
 *   node scripts/nevo-extract.mjs --zoek=cashewnoten      (zoekt een term op, schrijft niets)
 *   NEVO_CSV=/pad/naar/bestand node scripts/nevo-extract.mjs
 *
 * Uitvoer:
 *   scripts/out/nevo-voedingsmiddelen.json            (gitignored, alle 2.328 voedingsmiddelen)
 *   docs/plan/STEEKPROEF_NEVO_IMPORT_2026-10.md       (ter beoordeling, deterministisch)
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { leesCatalogus } from "./usda-extract.mjs";

const OUT_DIR = path.join("scripts", "out");
const OUT_JSON = path.join(OUT_DIR, "nevo-voedingsmiddelen.json");
const OUT_RAPPORT = path.join("docs", "plan", "STEEKPROEF_NEVO_IMPORT_2026-10.md");
const FOOD_SOURCES_FILE = path.join("src", "data", "nutrition", "food-sources.ts");
const FOOD_CATALOG_FILE = path.join("src", "data", "nutrition", "food-catalog.ts");

export const NEVO_CITATION = "NEVO-online versie 2025/9.0, RIVM, Bilthoven";

const argCsv = (process.argv.find((a) => a.startsWith("--csv=")) ?? "").slice(6);
const CSV_PAD =
  argCsv || process.env.NEVO_CSV || path.join(os.homedir(), "Downloads", "NEVO2025_v9.0_Details.csv");

/** Stoffen waar dagboek en kernstoffen op leunen, met de code zoals NEVO ze noemt. */
export const GEVOLGDE_STOFFEN = [
  ["ENERCC", "Energie (kcal)"],
  ["PROT", "Eiwit"],
  ["FAT", "Vet"],
  ["FASAT", "Verzadigd vet"],
  ["CHO", "Koolhydraten (beschikbaar)"],
  ["SUGAR", "Suikers (mono + di)"],
  ["FIBT", "Voedingsvezel"],
  ["NA", "Natrium"],
  ["K", "Kalium"],
  ["CA", "Calcium"],
  ["MG", "Magnesium"],
  ["FE", "IJzer"],
  ["ZN", "Zink"],
  ["VITD", "Vitamine D"],
  ["VITB12", "Vitamine B12"],
  ["VITC", "Vitamine C"],
  ["F20:5CN3", "EPA"],
  ["F22:6CN3", "DHA"],
];

// ── parsen ──────────────────────────────────────────────────────────────

/**
 * Splitst gescheiden tekst in rijen en velden, met aanhalingstekens en CRLF.
 * Eigen parser omdat het bestand 88 MB is en één regel per stof draagt.
 */
export function parseDelimited(tekst, scheiding = "|") {
  const rijen = [];
  let rij = [];
  let veld = "";
  let inAanhaling = false;
  for (let i = 0; i < tekst.length; i++) {
    const teken = tekst[i];
    if (inAanhaling) {
      if (teken === '"') {
        if (tekst[i + 1] === '"') {
          veld += '"';
          i++;
        } else {
          inAanhaling = false;
        }
      } else {
        veld += teken;
      }
    } else if (teken === '"') {
      inAanhaling = true;
    } else if (teken === scheiding) {
      rij.push(veld);
      veld = "";
    } else if (teken === "\n") {
      rij.push(veld.endsWith("\r") ? veld.slice(0, -1) : veld);
      rijen.push(rij);
      rij = [];
      veld = "";
    } else {
      veld += teken;
    }
  }
  if (veld !== "" || rij.length > 0) {
    rij.push(veld);
    rijen.push(rij);
  }
  return rijen;
}

/** "1,8" → 1.8 en "371" → 371. `null` bij alles wat geen getal is — nooit een gok. */
export function parseWaarde(ruw) {
  const schoon = String(ruw ?? "").trim().replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(schoon)) return null;
  const waarde = Number(schoon);
  return Number.isFinite(waarde) ? waarde : null;
}

const KOLOMMEN = {
  versie: "NEVO-versie",
  groep: "Voedingsmiddelgroep",
  code: "NEVO-code",
  naam: "Voedingsmiddelnaam",
  engels: "Engelse naam",
  hoeveelheid: "Hoeveelheid",
  stofCode: "Nutrient-code",
  stofNaam: "Voedingsstof",
  waarde: "Gehalte",
  eenheid: "Eenheid",
  vlag: "Spoor / Verrijkt",
  bron: "Broncode",
};

function kolomIndex(kop) {
  const idx = {};
  for (const [sleutel, begin] of Object.entries(KOLOMMEN)) {
    const i = kop.findIndex((k) => k.startsWith(begin));
    if (i === -1) throw new Error(`Kolom "${begin}" ontbreekt in het NEVO-bestand.`);
    idx[sleutel] = i;
  }
  return idx;
}

/**
 * Rijen (met kopregel) → voedingsmiddelen. Bewaart per stof alleen het getal,
 * de eenheid en of het een spoor of verrijking is; de lange referentietekst
 * blijft in het brondbestand.
 *
 * `spoor: true` betekent dat NEVO "TR" meldt en de waarde 0 een plaatshouder
 * is. `verrijkt: true` is NEVO's "+". `waarde: null` komt niet voor: een regel
 * zonder leesbaar getal gaat naar `problemen`, niet als verzonnen 0 de data in.
 */
export function bouwVoedingsmiddelen(rijen) {
  const [kop, ...regels] = rijen;
  const idx = kolomIndex(kop);
  const voedingsmiddelen = new Map();
  const stoffen = new Map();
  const problemen = [];
  const versies = new Set();
  let herhalingen = 0;

  for (const [n, r] of regels.entries()) {
    if (r.length < kop.length - 1) {
      problemen.push({ regel: n + 2, probleem: "te weinig velden" });
      continue;
    }
    versies.add(r[idx.versie]);
    const code = r[idx.code];
    let voedingsmiddel = voedingsmiddelen.get(code);
    if (!voedingsmiddel) {
      voedingsmiddel = {
        code,
        naam: r[idx.naam],
        engelseNaam: r[idx.engels],
        groep: r[idx.groep],
        per: r[idx.hoeveelheid] === "per 100ml" ? "100ml" : "100g",
        stoffen: {},
      };
      voedingsmiddelen.set(code, voedingsmiddel);
    }
    const stofCode = r[idx.stofCode];
    const waarde = parseWaarde(r[idx.waarde]);
    if (waarde === null) {
      problemen.push({ regel: n + 2, probleem: `waarde "${r[idx.waarde]}" is geen getal (${code} ${stofCode})` });
      continue;
    }
    const vlag = r[idx.vlag].trim();
    const eerder = voedingsmiddel.stoffen[stofCode];
    if (eerder) {
      // NEVO noemt dezelfde stof soms onder twee stofgroepen (eiwit staat onder
      // "Energie en macronutriënten" én "Eiwitten"). Identiek is een herhaling;
      // alleen een afwijkende waarde is een probleem.
      const gelijk = eerder.w === waarde && Boolean(eerder.spoor) === (vlag === "TR") && Boolean(eerder.verrijkt) === (vlag === "+");
      if (gelijk) herhalingen++;
      else problemen.push({ regel: n + 2, probleem: `${code} ${stofCode} staat tweemaal met verschillende waarden` });
      continue;
    }
    const stof = { w: waarde };
    if (vlag === "TR") stof.spoor = true;
    if (vlag === "+") stof.verrijkt = true;
    if (r[idx.bron]) stof.b = r[idx.bron];
    voedingsmiddel.stoffen[stofCode] = stof;

    const eenheid = r[idx.eenheid].trim();
    const bekend = stoffen.get(stofCode);
    if (!bekend) {
      stoffen.set(stofCode, { code: stofCode, naam: r[idx.stofNaam].trim(), eenheid });
    } else if (bekend.eenheid !== eenheid) {
      problemen.push({ regel: n + 2, probleem: `eenheid van ${stofCode} wisselt: ${bekend.eenheid} en ${eenheid}` });
    }
  }

  return {
    versies: [...versies],
    voedingsmiddelen: [...voedingsmiddelen.values()],
    stoffen: Object.fromEntries(stoffen),
    problemen,
    herhalingen,
  };
}

/** Rekent tussen g, mg en µg om. Alleen voor vergelijken in het rapport, nooit voor opslag. */
export function naarEenheid(waarde, van, naar) {
  const inGram = { g: 1, mg: 1e-3, "µg": 1e-6, ug: 1e-6 };
  if (!(van in inGram) || !(naar in inGram)) return null;
  return (waarde * inGram[van]) / inGram[naar];
}

// ── matchen ─────────────────────────────────────────────────────────────

const STOPWOORDEN = new Set(["en", "of", "met", "m", "z", "zonder", "van", "de", "het", "een", "in", "op"]);

/**
 * NEVO noemt de kop eerst en splitst samenstellingen: "Noten cashew- gezouten",
 * "Bonen kidney- rode gekookt", "Ei kippen- rauw gem". Wij schrijven
 * "Cashewnoten", "Kidneybonen", "Eieren". Deze lijst en de aliassen hieronder
 * overbruggen dat verschil.
 *
 * Het is een zoekhulp om de beoordeling te versnellen, geen mapping: wat hier
 * als kandidaat uitkomt, beoordeelt een mens.
 */
const KOPWOORDEN = ["noten", "bonen", "kaas", "brood", "vlees", "worst", "olie", "zaad", "zaden", "pitten", "melk", "drank", "drink", "yoghurt", "vlokken", "meel", "pasta", "rijst", "saus", "soep", "sap", "koek"];

/** Eigen woord → de woorden waarmee NEVO het noemt. */
const ALIASSEN = {
  eier: ["ei"],
  eieren: ["ei"],
  tempe: ["tempeh"],
  tempeh: ["tempeh"],
  havermout: ["vlokken", "haver"],
  rundergehakt: ["gehakt", "rund"],
  mozzarella: ["kaas", "mozzarella"],
  gekweekte: ["kweek"],
  wilde: ["wild"],
  havermelk: ["drink", "haver"],
  sojamelk: ["drink", "soja"],
  amandelmelk: ["drink", "amandel"],
  rijstmelk: ["drink", "rijst"],
  proteinereep: ["eiwitreep"],
  ontbijtgranen: ["ontbijtproduct"],
  sojayoghurt: ["plantaardig", "alternatief", "yoghurt", "soja"],
};

/**
 * Woorden die in een NEVO-naam wijzen op een bereid gerecht of bewerkt product.
 * Staan ze niet in het label, dan is zo'n kandidaat zelden wat bedoeld wordt
 * ("Havermout" is niet "Pap havermout- bereid m volle melk"), dus er gaat een
 * afslag af.
 */
const GERECHTWOORDEN = new Set(["pap", "pizza", "salade", "stamppot", "pannenkoek", "koek", "gebak", "saus", "soep", "broodje", "maaltijd", "tosti", "beignet", "geroosterd", "gebrand", "gefrituurd", "gepaneerd", "omhuld", "suiker", "chocolade", "snack"].map((w) => w));

export function normaliseer(tekst) {
  return tekst
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function stam(woord) {
  return woord.length > 4 ? woord.replace(/(en|s|e)$/, "") : woord;
}

/** "cashewnoten" → ["cashew", "noten"]; een woord zonder bekende kop blijft heel. */
function splitSamenstelling(woord) {
  for (const kop of KOPWOORDEN) {
    if (woord.endsWith(kop) && woord.length >= kop.length + 3) {
      return { delen: [woord.slice(0, -kop.length), kop], kop };
    }
  }
  return { delen: [woord], kop: null };
}

/** Tokens van een NEVO-naam of een label: kleine letters, zonder accenten en stopwoorden, gestemd. */
export function tokens(tekst) {
  return normaliseer(tekst)
    .split(" ")
    .filter((t) => t && !STOPWOORDEN.has(t))
    .map(stam);
}

/**
 * Tokens van een zoeklabel als groepen: elk labelwoord is één groep, en een
 * groep telt als geraakt als NEVO het woord heel noemt OF alle delen ervan.
 * NEVO splitst niet overal: "Noten cashew-" maar ook "Zonnebloempitten" en
 * "Sesamzaad". Daarnaast de woorden die de kop van het label zijn (waar NEVO
 * mee begint).
 */
export function doelTokens(label) {
  const groepen = [];
  const koppen = new Set();
  const woorden = normaliseer(label).split(" ").filter((t) => t && !STOPWOORDEN.has(t));
  woorden.forEach((woord, i) => {
    if (ALIASSEN[woord]) {
      // Een alias is een vervanging, geen alternatief: alle woorden ervan moeten kloppen.
      groepen.push({ opties: [{ t: ALIASSEN[woord].map(stam), kop: null }] });
      koppen.add(stam(ALIASSEN[woord][0]));
      return;
    }
    const { delen, kop } = splitSamenstelling(woord);
    const opties = [{ t: [stam(woord)], kop: null }];
    if (delen.length > 1) opties.push({ t: delen.map(stam), kop: stam(kop) });
    groepen.push({ opties });
    if (kop) {
      koppen.add(stam(kop));
    } else if (i === 0) {
      koppen.add(stam(woord));
    }
  });
  const tokens = [...new Set(groepen.flatMap((g) => g.opties.flatMap((o) => o.t)))];
  return { groepen, tokens, koppen };
}

/**
 * Hoe goed past een NEVO-naam bij een label. Dekking van de labelwoorden (een
 * woord dat een NEVO-woord afsluit telt voor 0,8: "biefstuk" in
 * "runderbiefstuk", maar "haver" niet in "havermout"), min een kleine straf per overbodig NEVO-woord, plus een
 * bonus als NEVO begint met de kop van het label.
 */
export function scoreKandidaat(doel, nevoTokens) {
  const groepen = Array.isArray(doel) ? doel.map((t) => ({ opties: [{ t: [t], kop: null }] })) : doel.groepen;
  const koppen = Array.isArray(doel) ? new Set([doel[0]]) : doel.koppen;
  if (groepen.length === 0 || nevoTokens.length === 0) return 0;
  const set = new Set(nevoTokens);
  const raakToken = (t) => {
    if (set.has(t)) return 1;
    if (t.length >= 5 && nevoTokens.some((n) => n.length > t.length && n.endsWith(t))) return 0.8;
    return 0;
  };
  // Per groep het beste alternatief: het woord heel, of de delen ervan. Bij een
  // samenstelling telt de deelvariant alleen als het onderscheidende deel
  // klopt: "kokos" in "kokosmelk", niet alleen de kop "melk".
  const raakOptie = (o) => {
    const onderscheidend = o.kop ? o.t.filter((t) => t !== o.kop) : o.t;
    if (o.kop && onderscheidend.some((t) => raakToken(t) === 0)) return 0;
    return o.t.reduce((som, t) => som + raakToken(t), 0) / o.t.length;
  };
  const raakGroep = (g) => Math.max(...g.opties.map(raakOptie));
  const scores = groepen.map(raakGroep);
  const geraakt = scores.reduce((a, b) => a + b, 0);

  // Een kandidaat die alleen de kop raakt ("melk", "noten") en het onderscheidende
  // woord mist, is een ander product: "Havermelk" is niet "Melk rauwe".
  const isKopGroep = (g) => g.opties.length === 1 && g.opties[0].t.length === 1 && koppen.has(g.opties[0].t[0]);
  const onderscheidend = groepen.filter((g) => !isKopGroep(g) || groepen.length === 1);
  if (onderscheidend.length > 0 && onderscheidend.every((g) => raakGroep(g) === 0)) return 0;

  const dekking = geraakt / groepen.length;
  const gebruikt = new Set(groepen.flatMap((g) => g.opties.flatMap((o) => o.t)));
  const overbodig = nevoTokens.filter((t) => !gebruikt.has(t));
  const straf = Math.min(0.3, 0.03 * overbodig.length);
  const gerechtStraf = overbodig.some((t) => GERECHTWOORDEN.has(t)) ? 0.35 : 0;
  const kopBonus = koppen.has(nevoTokens[0]) ? 0.2 : 0;
  return Math.max(0, dekking - straf - gerechtStraf + kopBonus);
}

/** Vanaf deze score noemen we een kandidaat "sterk"; eronder moet de beoordelaar extra opletten. */
export const STERKE_SCORE = 0.9;

/** De beste `n` NEVO-voedingsmiddelen voor een label, met score ≥ `minimum`. */
export function kandidaten(label, voedingsmiddelen, n = 3, minimum = 0.5) {
  const doel = doelTokens(label);
  return voedingsmiddelen
    .map((v) => ({ v, score: scoreKandidaat(doel, v._tokens ?? tokens(v.naam)) }))
    .filter((k) => k.score >= minimum)
    .sort((a, b) => b.score - a.score || a.v.naam.length - b.v.naam.length)
    .slice(0, n);
}

// ── de bestaande code lezen ─────────────────────────────────────────────

export const ARRAY_NAAR_STOF = {
  PROTEIN_SOURCES: { nutrient: "protein", nevo: ["PROT"], eenheid: "g" },
  MAGNESIUM_SOURCES: { nutrient: "magnesium", nevo: ["MG"], eenheid: "mg" },
  OMEGA3_SOURCES: { nutrient: "omega3", nevo: ["F20:5CN3", "F22:6CN3"], eenheid: "mg", somVanTwee: true },
  VITAMIN_D_SOURCES: { nutrient: "vitamin_d", nevo: ["VITD"], eenheid: "µg" },
  ZINC_SOURCES: { nutrient: "zinc", nevo: ["ZN"], eenheid: "mg" },
};

/** Leest `food-sources.ts` tekstueel: per rij label, huidige waarde en bron. */
export function parseFoodSources(tekst) {
  const rijen = [];
  const arrays = [...tekst.matchAll(/^const ([A-Z0-9_]+_SOURCES): readonly FoodSource\[\] = \[/gm)];
  for (let a = 0; a < arrays.length; a++) {
    const stof = ARRAY_NAAR_STOF[arrays[a][1]];
    if (!stof) continue;
    const begin = arrays[a].index;
    const eind = a + 1 < arrays.length ? arrays[a + 1].index : tekst.length;
    const blok = tekst.slice(begin, eind);
    for (const m of blok.matchAll(/\n  \{\n([\s\S]*?)\n  \},/g)) {
      const entry = m[1];
      const key = entry.match(/\n?\s{4}key:\s*"([^"]+)"/)?.[1];
      const label = entry.match(/labelNl:\s*"([^"]+)"/)?.[1];
      if (!key || !label) continue;
      const nv = entry.match(/nutrientValue:\s*\{([\s\S]*?)\n    \},/)?.[1] ?? null;
      let huidig = null;
      if (nv) {
        const value = Number(nv.match(/value:\s*([\d.]+)/)?.[1]);
        const unit = nv.match(/unit:\s*"([^"]+)"/)?.[1];
        const nevoRef = nv.match(/origin:\s*"nevo",\s*ref:\s*"([^"]+)"/)?.[1];
        const usdaRef = nv.match(/usda\("(\d+)"/)?.[1];
        const bronNaam = nv.match(/sourceNameNl:\s*"([^"]+)"/)?.[1] ?? null;
        huidig = {
          waarde: Number.isFinite(value) ? value : null,
          eenheid: unit ?? null,
          origin: nevoRef ? "nevo" : usdaRef ? "usda" : "onbekend",
          ref: nevoRef ?? usdaRef ?? null,
          bronNaam,
        };
      }
      rijen.push({
        stof: stof.nutrient,
        key,
        label,
        portie: entry.match(/portionNl:\s*"([^"]+)"/)?.[1] ?? null,
        omega3Kind: entry.match(/omega3Kind:\s*"(\w+)"/)?.[1] ?? null,
        verified: /verified:\s*true/.test(entry),
        huidig,
        _stof: stof,
      });
    }
  }
  return rijen;
}

/** Labels van `food-catalog.ts`: `f("sleutel", "Label", …)`. */
export function parseCatalogusLabels(tekst) {
  return [...tekst.matchAll(/\bf\("([a-z0-9-]+)",\s*"([^"]+)"/g)].map((m) => ({ key: m[1], label: m[2] }));
}

// ── waarden uit NEVO halen voor vergelijking ────────────────────────────

/** De waarde van een voedingsmiddel in de eenheid waarin `food-sources.ts` hem bewaart. */
export function nevoWaardeVoor(voedingsmiddel, stof, stoffenInfo) {
  let som = 0;
  for (const code of stof.nevo) {
    const gegeven = voedingsmiddel.stoffen[code];
    if (!gegeven) return null;
    const omgerekend = naarEenheid(gegeven.w, stoffenInfo[code]?.eenheid ?? "", stof.eenheid);
    if (omgerekend === null) return null;
    som += omgerekend;
  }
  return som;
}

// ── rapport ─────────────────────────────────────────────────────────────

function fmt(getal, cijfers = 1) {
  if (getal === null || getal === undefined) return "—";
  return String(Math.round(getal * 10 ** cijfers) / 10 ** cijfers).replace(".", ",");
}

function pijp(tekst) {
  return String(tekst).replaceAll("|", "/");
}

export function bouwRapport({ data, foodSources, catalogus, verrijktKeys }) {
  const { voedingsmiddelen, stoffen, problemen, versies, herhalingen } = data;
  const n = voedingsmiddelen.length;
  const r = [];
  r.push("# Steekproef NEVO-import (ter beoordeling)");
  r.push("");
  r.push("Gegenereerd door `node scripts/nevo-extract.mjs` — niet met de hand bewerken.");
  r.push(`Bron: ${NEVO_CITATION}. Het script legt NEVO naast de bestaande code en **patcht niets**.`);
  r.push("");
  r.push("## 1. Het bestand");
  r.push("");
  r.push(`- Versie in het bestand: ${versies.join(", ")}`);
  r.push(`- Voedingsmiddelen: ${n}, stoffen: ${Object.keys(stoffen).length}`);
  r.push(`- Per 100 ml in plaats van per 100 g: ${voedingsmiddelen.filter((v) => v.per === "100ml").length} voedingsmiddelen`);
  r.push(`- Regels die dezelfde waarde herhalen onder een tweede stofgroep (genegeerd): ${herhalingen}`);
  r.push(`- Regels die niet te lezen waren of een afwijkende dubbele waarde dragen: ${problemen.length}`);
  for (const p of problemen.slice(0, 10)) r.push(`  - regel ${p.regel}: ${p.probleem}`);
  const spoor = voedingsmiddelen.reduce((s, v) => s + Object.values(v.stoffen).filter((x) => x.spoor).length, 0);
  const verrijkt = voedingsmiddelen.reduce((s, v) => s + Object.values(v.stoffen).filter((x) => x.verrijkt).length, 0);
  r.push(`- Waarden die NEVO als spoor (TR) markeert: ${spoor}. Als verrijkt (+): ${verrijkt}.`);
  r.push("");
  r.push("Een spoor staat in het bestand als 0 met de vlag TR, en wordt hier ook zo bewaard (`spoor: true`). Een ontbrekende regel is iets anders dan een 0: dan heeft NEVO de stof niet gemeten.");
  r.push("");
  r.push("### Dekking van de stoffen waar het dagboek op leunt");
  r.push("");
  r.push("| Stof | Eenheid | Voedingsmiddelen met waarde | Waarvan spoor |");
  r.push("|---|---|---|---|");
  for (const [code, naam] of GEVOLGDE_STOFFEN) {
    const met = voedingsmiddelen.filter((v) => v.stoffen[code]);
    const sp = met.filter((v) => v.stoffen[code].spoor).length;
    r.push(`| ${naam} (${code}) | ${stoffen[code]?.eenheid ?? "?"} | ${met.length} van ${n} | ${sp} |`);
  }
  const volledig = voedingsmiddelen.filter((v) => ["ENERCC", "PROT", "FAT", "CHO", "FIBT"].every((c) => v.stoffen[c])).length;
  r.push("");
  r.push(`Voedingsmiddelen met kcal, eiwit, vet, koolhydraten én vezels: **${volledig} van ${n}**.`);
  r.push("");

  // 2. controle bestaande NEVO-rijen
  const perCode = new Map(voedingsmiddelen.map((v) => [v.code, v]));
  const nevoRijen = foodSources.filter((x) => x.huidig?.origin === "nevo");
  r.push("## 2. Bestaande NEVO-waarden in `food-sources.ts` nagelopen");
  r.push("");
  if (nevoRijen.length === 0) {
    r.push("Geen enkele rij draagt nu een NEVO-bron.");
  } else {
    r.push("| Stof | Rij | NEVO-code | In de code | In NEVO | Oordeel |");
    r.push("|---|---|---|---|---|---|");
    for (const x of nevoRijen) {
      const v = perCode.get(x.huidig.ref);
      const nu = x.huidig.waarde;
      const nevo = v ? nevoWaardeVoor(v, x._stof, stoffen) : null;
      const oordeel = !v ? "code niet in NEVO" : nevo === null ? "stof niet in NEVO" : Math.abs(nevo - nu) <= Math.max(0.05, nu * 0.005) ? "klopt" : "AFWIJKING";
      r.push(`| ${x.stof} | ${pijp(x.key)} | ${x.huidig.ref} | ${fmt(nu, 2)} ${x.huidig.eenheid} | ${fmt(nevo, 2)} ${x._stof.eenheid} | ${oordeel} |`);
    }
  }
  r.push("");

  // 3. kandidaten voor rijen zonder NEVO
  const zonder = foodSources.filter((x) => x.huidig?.origin !== "nevo" && !(x.stof === "omega3" && x.omega3Kind === "ala"));
  r.push("## 3. Kandidaten voor rijen zonder NEVO-bron");
  r.push("");
  r.push("Per rij de beste NEVO-voedingsmiddelen op naam. **Een kandidaat is een voorstel, geen match:** controleer vooral rauw/bereid, soort en verrijking. De kolom Δ vergelijkt met de waarde die er nu staat (vaak USDA); een groot verschil is een signaal om naar te kijken, niet per se een fout.");
  r.push("");
  r.push("| Stof | Rij | Nu | NEVO-kandidaat (code) | Zekerheid | NEVO-waarde | Δ | Ook |");
  r.push("|---|---|---|---|---|---|---|---|");
  let metKandidaat = 0;
  let sterkeKandidaten = 0;
  for (const x of zonder) {
    const k = kandidaten(x.label, voedingsmiddelen);
    const eerste = k[0];
    if (eerste) metKandidaat++;
    if (eerste && eerste.score >= STERKE_SCORE) sterkeKandidaten++;
    const nevo = eerste ? nevoWaardeVoor(eerste.v, x._stof, stoffen) : null;
    const nu = x.huidig ? `${fmt(x.huidig.waarde, 2)} ${x.huidig.eenheid} (${x.huidig.origin})` : "—";
    const delta =
      nevo !== null && x.huidig?.waarde ? `${nevo >= x.huidig.waarde ? "+" : ""}${Math.round(((nevo - x.huidig.waarde) / x.huidig.waarde) * 100)}%` : "—";
    const ook = k.slice(1).map((c) => c.v.naam).join("; ");
    r.push(
      `| ${x.stof} | ${pijp(x.label)} | ${nu} | ${eerste ? `${pijp(eerste.v.naam)} (${eerste.v.code})` : "geen kandidaat"} | ${eerste ? (eerste.score >= STERKE_SCORE ? "sterk" : "zwak") : "—"} | ${nevo === null ? "—" : `${fmt(nevo, 2)} ${x._stof.eenheid}`} | ${delta} | ${pijp(ook)} |`,
    );
  }
  r.push("");
  r.push(`Rijen met minstens één kandidaat: **${metKandidaat} van ${zonder.length}**, waarvan sterk: **${sterkeKandidaten}**.`);
  r.push("");

  // 4. catalogus
  r.push("## 4. Generieke dagboekregels (`food-catalog.ts`)");
  r.push("");
  let sterk = 0;
  const geenKandidaat = [];
  for (const c of catalogus) {
    const k = kandidaten(c.label, voedingsmiddelen, 1, 0.5);
    if (k[0] && k[0].score >= STERKE_SCORE) sterk++;
    else if (!k[0]) geenKandidaat.push(c.label);
  }
  r.push(`- Regels in de catalogus: ${catalogus.length}`);
  r.push(`- Met een sterke kandidaat in NEVO (score ≥ 0,9): **${sterk}**`);
  r.push(`- Zonder enige kandidaat: ${geenKandidaat.length}`);
  r.push("");
  r.push("### De 16 regels die wachtten op de supermarktlaag (`geenBron: \"verrijkt\"`)");
  r.push("");
  r.push("| Regel | Beste NEVO-kandidaat (code) | kcal | Ook |");
  r.push("|---|---|---|---|");
  for (const c of catalogus.filter((x) => verrijktKeys.has(x.key))) {
    const k = kandidaten(c.label, voedingsmiddelen);
    const e = k[0];
    r.push(
      `| ${pijp(c.label)} | ${e ? `${pijp(e.v.naam)} (${e.v.code})` : "geen kandidaat"} | ${e ? fmt(e.v.stoffen.ENERCC?.w ?? null, 0) : "—"} | ${pijp(k.slice(1).map((x) => x.v.naam).join("; "))} |`,
    );
  }
  r.push("");
  return r.join("\n");
}

// ── main ────────────────────────────────────────────────────────────────

/** `--zoek=<term>`: snel opzoeken wat NEVO voor een term heeft, met de stoffen waar het dagboek op leunt. */
function zoekModus(term) {
  const data = bouwVoedingsmiddelen(parseDelimited(fs.readFileSync(CSV_PAD, "utf8")));
  for (const v of data.voedingsmiddelen) v._tokens = tokens(v.naam);
  const gevonden = kandidaten(term, data.voedingsmiddelen, 12, 0.4);
  console.log(`NEVO-voedingsmiddelen voor "${term}" (${NEVO_CITATION}):`);
  for (const { v, score } of gevonden) {
    const w = (c) => (v.stoffen[c] ? String(v.stoffen[c].w).replace(".", ",") + (v.stoffen[c].spoor ? " (spoor)" : "") : "—");
    console.log(`  ${String(v.code).padStart(5)} ${v.naam}  [score ${score.toFixed(2)}, per ${v.per}]  kcal ${w("ENERCC")} · eiwit ${w("PROT")} · vet ${w("FAT")} · koolh ${w("CHO")} · Mg ${w("MG")} · Zn ${w("ZN")} · vit D ${w("VITD")}`);
  }
  if (gevonden.length === 0) console.log("  niets gevonden");
}

function main() {
  const zoek = (process.argv.find((a) => a.startsWith("--zoek=")) ?? "").slice(7);
  if (zoek && fs.existsSync(CSV_PAD)) return zoekModus(zoek);
  if (!fs.existsSync(CSV_PAD)) {
    console.error(`NEVO-bestand niet gevonden: ${CSV_PAD}`);
    console.error("Download NEVO-online en geef het pad mee: --csv=/pad/naar/NEVO2025_v9.0_Details.csv");
    process.exit(1);
  }
  const data = bouwVoedingsmiddelen(parseDelimited(fs.readFileSync(CSV_PAD, "utf8")));
  for (const v of data.voedingsmiddelen) v._tokens = tokens(v.naam);

  const foodSources = parseFoodSources(fs.readFileSync(FOOD_SOURCES_FILE, "utf8"));
  const catalogus = parseCatalogusLabels(fs.readFileSync(FOOD_CATALOG_FILE, "utf8"));
  const verrijktKeys = new Set(leesCatalogus().filter((e) => e.geenBron === "verrijkt").map((e) => e.key));

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const uit = {
    bron: NEVO_CITATION,
    versies: data.versies,
    stoffen: data.stoffen,
    voedingsmiddelen: data.voedingsmiddelen.map(({ _tokens, ...rest }) => rest),
  };
  fs.writeFileSync(OUT_JSON, JSON.stringify(uit));
  fs.writeFileSync(OUT_RAPPORT, bouwRapport({ data, foodSources, catalogus, verrijktKeys }));

  console.log(`NEVO ${data.versies.join(", ")}: ${data.voedingsmiddelen.length} voedingsmiddelen, ${Object.keys(data.stoffen).length} stoffen`);
  console.log(`Herhalingen onder een tweede stofgroep: ${data.herhalingen}, regels met problemen: ${data.problemen.length}`);
  console.log(`food-sources.ts: ${foodSources.length} rijen gelezen, catalogus: ${catalogus.length} regels`);
  console.log(`Uitvoer: ${OUT_JSON} (${(fs.statSync(OUT_JSON).size / 1e6).toFixed(1)} MB), ${OUT_RAPPORT}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
