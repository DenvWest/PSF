#!/usr/bin/env node
/**
 * Supermarkt-CSV's → verificatierapport voor de dagboek-catalogus.
 *
 * ## Wat dit script doet
 *
 * Leest de vier CSV's uit de `pljwissink/supermarkets`-dataset (AH, Jumbo,
 * Lidl, Plus — eenmalige snapshot van 14 maart 2026, géén live feed) en
 * parst per rij het vrije-tekst `nutrients`-veld naar vaste velden:
 * calorieën, macro's (vet/koolhydraten/eiwit/zout/vezels) en waar aanwezig
 * een handvol micronutriënten. Het schrijft een rapport; het **patcht
 * niets** — zelfde regel als `usda-extract.mjs`: de beoordeling is het werk,
 * niet het parsen.
 *
 * Zie BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md §0/§1 (Laag 0) en
 * §5/§6 voor waarom dit vóór de USDA-aanvulling (Laag 0b) komt.
 *
 * ## Waarom vier aparte parsers, geen gedeelde regex
 *
 * Elke supermarkt gebruikt een eigen exportformaat, niet vier varianten van
 * hetzelfde format:
 *
 *   - **AH**: consistent, backslash-gescheiden — `Per 100 Gram\Energie290 kJ
 *     (69 kcal)\Vet0 g\...`. Decimalen met komma.
 *   - **Jumbo**: losse doorlopende tekst, wisselende spatiëring, decimalen
 *     met punt ÓF komma door elkaar in dezelfde kolom, labels wijken af
 *     ("Vetten" i.p.v. "Vet", "Vezels" i.p.v. "Voedingsvezel").
 *   - **Lidl**: **Duitse labels** (`Nährwertangaben`, `Fett`,
 *     `Kohlenhydrate`, `Eiweiß`), puntkomma-gescheiden, en de tekst is
 *     dubbel UTF-8-gecodeerd (mojibake: `NÃ¤hrwertangaben`) — moet eerst
 *     terug-gedecodeerd worden (latin1 → utf8) voor er iets uit te halen
 *     valt. Bevat vaak ook een vergelijking met een categorie-gemiddelde,
 *     die genegeerd wordt (alleen de eerste waarde per label telt).
 *   - **Plus**: weer een eigen format — `Energie KJ737 kilojoule`,
 *     `Energie KC177 KC`, labels voluit ("Vet12 gram" i.p.v. "Vet12 g").
 *
 * Eén generieke regex over deze vier zou stilzwijgend rijen missen of
 * verkeerd matchen — dezelfde val als het USDA-script beschrijft voor
 * automatische matches. Vandaar: per supermarkt een eigen `parse*`-functie,
 * elk met zijn eigen labeltabel, allemaal uitkomend op dezelfde
 * `NormalizedNutrients`-vorm.
 *
 * ## Databronfouten worden gemarkeerd, niet gecorrigeerd
 *
 * De brondata zelf bevat foute rijen — niet iets wat deze parser kan
 * repareren zonder te gokken. Twee voorbeelden uit de eerste run: Jumbo's
 * "Bella Italia Pinsa" heeft kJ en kcal verwisseld in de bron (263 kJ maar
 * 1112 kcal — fysiek onmogelijk, kcal is altijd kleiner dan kJ); Lidl's
 * "Emmentaler kaas" heeft een kapotte hoofdkolom (2900 g vet per 100 g),
 * terwijl de ernaast liggende vergelijkingskolom wél plausibel oogt — maar
 * die kolom wordt bewust nooit gelezen (zie Lidl-parser hierboven), dus is
 * er geen twee-na-de-vergelijking-fallback. Zulke rijen krijgen een
 * `verdacht`-array (zie `plausibiliteitswaarschuwingen`) en blijven gewoon
 * in het rapport staan — de beoordelaar beslist, het script gokt niet.
 *
 * ## Wat er NIET uitkomt
 *
 * Geen `NutrientId`, geen `bewijsbaar`-vlag, geen claim. Dit zijn
 * informatieve velden (zie BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md
 * §3) — calorieën/macro's/brede micronutriënten, nooit de vijf claim-dragende
 * kernstoffen. Geen NEVO-bronvermeldingsplicht; bron in de UI is
 * "supermarkt.nl-dataset" per rij.
 *
 * ## Gebruik
 *
 *   node scripts/supermarkt-extract.mjs
 *   node scripts/supermarkt-extract.mjs --dir=/pad/naar/csv-map
 *   node scripts/supermarkt-extract.mjs --only=AH,Lidl
 *   node scripts/supermarkt-extract.mjs --sample=20   (alleen eerste N per bestand, voor snel testen)
 *
 * Uitvoer: scripts/out/supermarkt-rapport.json + een samenvatting op stdout.
 * Prijs-/datumkolommen (D2022_11_12 etc.) worden genegeerd — dit script gaat
 * over voedingswaarde, niet over prijshistorie.
 */

import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.join("scripts", "out");
const OUT_FILE = path.join(OUT_DIR, "supermarkt-rapport.json");

const DEFAULT_DIR = path.join(
  process.env.HOME ?? "",
  "Downloads",
  "supermarkets-supermarket_prices",
  "pljwissink-supermarkets-b488ead",
);

const argDir = (process.argv.find((a) => a.startsWith("--dir=")) ?? "").slice(6);
const CSV_DIR = argDir || process.env.SUPERMARKT_CSV_DIR || DEFAULT_DIR;

const argOnly = (process.argv.find((a) => a.startsWith("--only=")) ?? "").slice(7);
const argSample = (process.argv.find((a) => a.startsWith("--sample=")) ?? "").slice(9);
const SAMPLE = argSample ? Number(argSample) : null;

const SUPERMARKTEN = ["AH", "Jumbo", "Lidl", "Plus"];
const teVerwerken = argOnly ? argOnly.split(",") : SUPERMARKTEN;

/**
 * Minimale RFC4180-parser: geen dependency voor een eenmalig script. Wel
 * degelijk embedded newlines binnen `"..."`-velden (het `ingredients`-veld
 * bevat vaak regeleinden) — een simpele split-op-newline zou de Lidl-CSV
 * bijvoorbeeld op 19.451 in plaats van de werkelijke 19.450 records laten
 * uitkomen (`wc -l` telt newlines, niet records).
 *
 * Een strikt RFC4180-einde-van-quote (elke `"` binnen quotes die niet
 * verdubbeld is, sluit het veld) breekt op deze data: Lidl's
 * "Vivobook 15.6'"-0385022" heeft een losse `"` middenin de tekst (bedoeld
 * als aanduiding voor inch) die niet volgens RFC4180 verdubbeld is. Een
 * strikte parser sluit het veld daar, ziet de rest van het bestand als één
 * doorlopend gequote veld, en verliest zo bijna alle rijen erna. Daarom:
 * een `"` binnen quotes sluit het veld alleen als er direct een
 * veld-/regelscheidingsteken op volgt (`,`, `\r`, `\n`, einde bestand) —
 * anders is het literale tekst. Dat is de tolerantie die de meeste
 * praktijk-CSV-parsers (incl. Python's `csv`-module) ook toepassen.
 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const n = text.length;
  while (i < n) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        const volgend = text[i + 1];
        const isEchteSluiting =
          volgend === undefined || volgend === "," || volgend === "\r" || volgend === "\n";
        if (isEchteSluiting) {
          inQuotes = false;
          i += 1;
          continue;
        }
        // Losse `"` middenin gequote tekst, niet verdubbeld — literale quote.
        field += ch;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (ch === "\r") {
      i += 1;
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }
    field += ch;
    i += 1;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function readCsvRecords(filePath) {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^﻿/, "");
  const rows = parseCsv(raw);
  const header = rows[0];
  const records = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length === 1 && row[0] === "") continue;
    const record = {};
    for (let c = 0; c < header.length; c++) {
      record[header[c]] = row[c] ?? "";
    }
    records.push(record);
  }
  return records;
}

/**
 * Nederlands of internationaal decimaal ("1,7" / "1.7") → number.
 *
 * Geen duizendtal-punt-heuristiek: die is voor de macro/micro-velden hier
 * onbetrouwbaar — "0.122" (gram natrium) en "1.609" (kJ, duizendtal) hebben
 * exact dezelfde vorm (punt gevolgd door drie cijfers), dus een regex kan ze
 * niet uit elkaar houden. De enige plek waar AH een duizendtal-punt gebruikt
 * is de kJ-waarde, en die wordt nergens overgenomen (alleen kcal telt) —
 * dus hoeft dit geval niet apart afgevangen te worden.
 */
function num(str) {
  if (str == null) return null;
  const cleaned = String(str).replace(/\s/g, "").replace(",", ".");
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? value : null;
}

/**
 * Doelvorm — dezelfde as als `INFO_FIELDS` in usda-extract.mjs, zodat de twee
 * databronnen (supermarkt + USDA-aanvulling) op dezelfde velden landen.
 * `null` betekent: dit label kwam niet voor in de brontekst.
 */
function leegResultaat() {
  return {
    energyKcal: null,
    fatG: null,
    saturatedFatG: null,
    carbohydrateG: null,
    sugarsG: null,
    fiberG: null,
    proteinG: null,
    saltG: null,
    sodiumMg: null,
    calciumMg: null,
    ironMg: null,
    vitaminCMg: null,
    vitaminDµg: null,
  };
}

/**
 * AH: meestal `Per 100 Gram\Energie290 kJ (69 kcal)\Vet0 g\...`, maar een
 * kleiner deel van de rijen (vloeibare producten, "Per 100 Milliliter")
 * draait de volgorde om: `Energie75 kcal (302 kJ)`. Beide varianten komen
 * voor binnen hetzelfde bestand, dus het label alleen ("Energie...") bepaalt
 * niet welke kant het getal staat — vandaar twee patronen, kcal-eerst
 * geprobeerd vóór kJ-eerst omdat "(...)" in kcal-eerst altijd kJ bevat.
 */
function parseAh(tekst) {
  const out = leegResultaat();
  if (!tekst) return out;
  const segmenten = tekst.split("\\");
  for (const seg of segmenten) {
    let m;
    if ((m = seg.match(/^Energie[\d.,\s]+kcal\s*\(([\d.,]+)\s*kJ\)/i))) {
      // kcal-eerst: het getal buiten de haakjes is kcal.
      out.energyKcal = num(seg.match(/^Energie([\d.,]+)\s*kcal/i)?.[1] ?? null);
    } else if ((m = seg.match(/^Energie[\d.,\s]+kJ\s*\(([\d.,]+)\s*kcal\)/i))) {
      out.energyKcal = num(m[1]);
    } else if ((m = seg.match(/^waarvan verzadigd([\d.,]+)\s*g/i))) {
      out.saturatedFatG = num(m[1]);
    } else if ((m = seg.match(/^Vet([\d.,]+)\s*g/i))) {
      out.fatG = num(m[1]);
    } else if ((m = seg.match(/^waarvan suikers([\d.,]+)\s*g/i))) {
      out.sugarsG = num(m[1]);
    } else if ((m = seg.match(/^Koolhydraten([\d.,]+)\s*g/i))) {
      out.carbohydrateG = num(m[1]);
    } else if ((m = seg.match(/^Voedingsvezel([\d.,]+)\s*g/i))) {
      out.fiberG = num(m[1]);
    } else if ((m = seg.match(/^Eiwitten([\d.,]+)\s*g/i))) {
      out.proteinG = num(m[1]);
    } else if ((m = seg.match(/^Zout([\d.,]+)\s*g/i))) {
      out.saltG = num(m[1]);
    } else if ((m = seg.match(/^Natrium([\d.,]+)\s*mg/i))) {
      out.sodiumMg = num(m[1]);
    } else if ((m = seg.match(/^Calcium([\d.,]+)\s*mg/i))) {
      out.calciumMg = num(m[1]);
    } else if ((m = seg.match(/^Ijzer([\d.,]+)\s*mg/i))) {
      out.ironMg = num(m[1]);
    } else if ((m = seg.match(/^Vitamine C([\d.,]+)\s*mg/i))) {
      out.vitaminCMg = num(m[1]);
    } else if ((m = seg.match(/^Vitamine D([\d.,]+)\s*µg/i))) {
      out.vitaminDµg = num(m[1]);
    }
  }
  return out;
}

/**
 * Jumbo: doorlopende tekst, labels los van hun getal ("Vetten1.1 g" of
 * "Vetten 2,8 g"). Geen vast scheidingsteken — matcht op label direct
 * gevolgd door een getal, met optionele spatie ertussen.
 */
function parseJumbo(tekst) {
  const out = leegResultaat();
  if (!tekst) return out;
  const t = tekst;
  let m;
  if ((m = t.match(/Energie\s*[\d.,]+\s*k[JC]?al?\s*\/?\s*([\d.,]+)\s*k?[Cc]al/i))) {
    out.energyKcal = num(m[1]);
  } else if ((m = t.match(/Energie[\s\d.,]*kJ\s*([\d.,]+)\s*k[Cc]al/i))) {
    out.energyKcal = num(m[1]);
  }
  if ((m = t.match(/Vetten\s*([\d.,]+)\s*g/i))) out.fatG = num(m[1]);
  if ((m = t.match(/verzadigde\s*vetzuren\s*([\d.,]+)\s*g/i))) out.saturatedFatG = num(m[1]);
  if ((m = t.match(/Koolhydraten\s*([\d.,]+)\s*g/i))) out.carbohydrateG = num(m[1]);
  if ((m = t.match(/suikers\s*([\d.,]+)\s*g/i))) out.sugarsG = num(m[1]);
  if ((m = t.match(/Vezels\s*([\d.,]+)\s*g/i))) out.fiberG = num(m[1]);
  if ((m = t.match(/Eiwitten\s*([\d.,]+)\s*g/i))) out.proteinG = num(m[1]);
  if ((m = t.match(/Zout\s*([\d.,]+)\s*g/i))) out.saltG = num(m[1]);
  if ((m = t.match(/calcium\s*([\d.,]+)\s*mg/i))) out.calciumMg = num(m[1]);
  if ((m = t.match(/(?:Ergocalciferol|Cholecalciferol|Vitamine\s*D)[^0-9]{0,20}([\d.,]+)\s*[Âµµ]?g/i))) {
    out.vitaminDµg = num(m[1]);
  }
  return out;
}

/**
 * Lidl: dubbel UTF-8-gecodeerd (mojibake) + Duitse labels + puntkomma's.
 * Terugcoderen (latin1 → utf8) herstelt "NÃ¤hrwertangaben" naar
 * "Nährwertangaben"; daarna matcht op de Duitse termen. De "Verglichen
 * met"-vergelijkingskolom (een percentage t.o.v. een categoriegemiddelde)
 * wordt genegeerd — alleen de eerste waarde na elk label telt.
 */
function herstelMojibake(tekst) {
  try {
    return Buffer.from(tekst, "utf8").toString("latin1") === tekst
      ? tekst
      : Buffer.from(tekst, "latin1").toString("utf8");
  } catch {
    return tekst;
  }
}

function parseLidl(ruweTekst) {
  const out = leegResultaat();
  if (!ruweTekst) return out;
  const tekst = /Ã[¤¶¼ŸÂ]/.test(ruweTekst) ? herstelMojibake(ruweTekst) : ruweTekst;
  const segmenten = tekst.split(";");
  const waarde = (label) => {
    const idx = segmenten.findIndex((s) => s.trim().toLowerCase() === label.toLowerCase());
    if (idx === -1 || idx + 1 >= segmenten.length) return null;
    // Direct na het label kan een "?" staan (geen bekende waarde) of de
    // waarde zelf; sla "?" over en pak het eerste segment met een getal.
    for (let i = idx + 1; i < Math.min(idx + 3, segmenten.length); i++) {
      const s = segmenten[i].trim();
      if (s === "?" || s === "") continue;
      return s;
    }
    return null;
  };
  const energie = waarde("Energie");
  if (energie) {
    const m = energie.match(/\(([\d.,]+)\s*kcal\)/i) ?? energie.match(/([\d.,]+)\s*kcal/i);
    if (m) out.energyKcal = num(m[1]);
  }
  const grams = (label) => {
    const v = waarde(label);
    if (!v) return null;
    const m = v.match(/([\d.,]+)\s*g/i);
    return m ? num(m[1]) : null;
  };
  out.fatG = grams("Fett");
  out.saturatedFatG = grams("Gesättigte Fettsäuren") ?? grams("GesÃ¤ttigte FettsÃ¤uren");
  out.carbohydrateG = grams("Kohlenhydrate");
  out.sugarsG = grams("Zucker");
  out.fiberG = grams("Ballaststoffe");
  out.proteinG = grams("Eiweiß") ?? grams("EiweiÃ\u009f");
  const salz = waarde("Salz");
  if (salz) {
    const m = salz.match(/([\d.,]+)\s*g/i);
    if (m) out.saltG = num(m[1]);
  }
  // Lidl geeft Natrium altijd in gram ("0.122 g"), nooit in mg — geverifieerd
  // over de hele kolom (zie git-geschiedenis van dit bestand voor de steekproef).
  const natrium = waarde("Natrium");
  if (natrium) {
    const mG = natrium.match(/^~?\s*([\d.,]+)\s*g/i);
    if (mG) out.sodiumMg = num(mG[1]) * 1000;
  }
  return out;
}

/**
 * Plus: labels voluit ("gram" i.p.v. "g"), Energie in twee losse regels
 * (KJ en KC). Geen vast scheidingsteken — zelfde label-gevolgd-door-getal
 * aanpak als Jumbo, met de eigen woordvolgorde van Plus.
 */
function parsePlus(tekst) {
  const out = leegResultaat();
  if (!tekst) return out;
  let m;
  if ((m = tekst.match(/Energie\s*KC\s*([\d.,]+)\s*KC/i))) out.energyKcal = num(m[1]);
  if ((m = tekst.match(/(?<!verzadigd |onverzadigd )Vet([\d.,]+)\s*gram/i))) out.fatG = num(m[1]);
  if ((m = tekst.match(/Waarvan verzadigd vet([\d.,]+)\s*gram/i))) out.saturatedFatG = num(m[1]);
  if ((m = tekst.match(/Koolhydraten([\d.,]+)\s*gram/i))) out.carbohydrateG = num(m[1]);
  if ((m = tekst.match(/Waarvan suikers([\d.,]+)\s*gram/i))) out.sugarsG = num(m[1]);
  if ((m = tekst.match(/Vezels([\d.,]+)\s*gram/i))) out.fiberG = num(m[1]);
  if ((m = tekst.match(/Eiwitten([\d.,]+)\s*gram/i))) out.proteinG = num(m[1]);
  if ((m = tekst.match(/Zout([\d.,]+)\s*gram/i))) out.saltG = num(m[1]);
  return out;
}

const PARSERS = { AH: parseAh, Jumbo: parseJumbo, Lidl: parseLidl, Plus: parsePlus };

function heeftMinstensEenWaarde(res) {
  return Object.values(res).some((v) => v != null);
}

/**
 * Fysieke plausibiliteit per 100 g/ml — vangt databronfouten, geen
 * parserfouten. Twee voorbeelden uit de eerste run: Jumbo "Bella Italia
 * Pinsa" heeft kJ/kcal verwisseld in de bron zelf (263 kJ, 1112 kcal — moet
 * andersom); Lidl "Emmentaler kaas" heeft een kapotte hoofdkolom (2900 g vet
 * per 100 g). Beide zijn brongegevens, niet iets wat deze parser kan
 * repareren — de rij wordt gemarkeerd, niet gecorrigeerd of weggelaten, zodat
 * de beoordelaar zelf beslist.
 */
function plausibiliteitswaarschuwingen(res) {
  const waarschuwingen = [];
  if (res.energyKcal != null && res.energyKcal > 900) {
    waarschuwingen.push(`energyKcal onwaarschijnlijk hoog voor 100 g/ml: ${res.energyKcal}`);
  }
  if (res.saltG != null && res.saltG > 100) {
    waarschuwingen.push(`saltG boven 100 g per 100 g: ${res.saltG}`);
  }
  if (res.sodiumMg != null && res.sodiumMg > 40000) {
    waarschuwingen.push(`sodiumMg onwaarschijnlijk hoog: ${res.sodiumMg}`);
  }
  const macroSom = [res.fatG, res.carbohydrateG, res.proteinG].reduce(
    (acc, v) => (v != null ? acc + v : acc),
    0,
  );
  if (macroSom > 105) {
    waarschuwingen.push(`vet+koolhydraten+eiwit samen boven 105 g per 100 g: ${macroSom.toFixed(1)}`);
  }
  return waarschuwingen;
}

function main() {
  if (!fs.existsSync(CSV_DIR)) {
    console.error(`Map niet gevonden: ${CSV_DIR}`);
    console.error("Geef --dir=/pad/naar/csv-map of zet SUPERMARKT_CSV_DIR.");
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const rapport = { gedraaid: new Date().toISOString(), bronMap: CSV_DIR, supermarkten: {} };

  for (const naam of teVerwerken) {
    const bestand = path.join(CSV_DIR, `${naam}.csv`);
    if (!fs.existsSync(bestand)) {
      console.error(`Overgeslagen (niet gevonden): ${bestand}`);
      continue;
    }
    const parser = PARSERS[naam];
    let records = readCsvRecords(bestand);
    if (SAMPLE) records = records.slice(0, SAMPLE);

    const rijen = [];
    let metNutrients = 0;
    let geparsed = 0;
    let verdacht = 0;

    for (const rec of records) {
      const nutrients = rec.nutrients ?? "";
      if (!nutrients) continue;
      metNutrients += 1;
      const resultaat = parser(nutrients);
      if (!heeftMinstensEenWaarde(resultaat)) continue;
      geparsed += 1;
      const waarschuwingen = plausibiliteitswaarschuwingen(resultaat);
      if (waarschuwingen.length) verdacht += 1;
      rijen.push({
        prodId: rec.prod_id,
        naam: rec.prod_desc,
        categorie: rec.cat,
        eenheid: rec.quantity,
        ...resultaat,
        ...(waarschuwingen.length ? { verdacht: waarschuwingen } : {}),
      });
    }

    rapport.supermarkten[naam] = {
      totaalRijen: records.length,
      metNutrientsVeld: metNutrients,
      succesvolGeparsed: geparsed,
      verdachtGemarkeerd: verdacht,
      dekking: metNutrients ? `${((geparsed / metNutrients) * 100).toFixed(1)}%` : "0%",
      producten: rijen,
    };

    console.log(
      `${naam}: ${records.length} rijen, ${metNutrients} met nutrients-tekst, ${geparsed} geparsed (${rapport.supermarkten[naam].dekking}), ${verdacht} verdacht`,
    );
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(rapport, null, 2));
  console.log(`\nRapport: ${OUT_FILE}`);
  console.log("Niets is automatisch overgenomen in de dagboek-catalogus.");
  console.log("Beoordeel het rapport (steekproef per supermarkt) voordat");
  console.log("producten naar food-catalog.ts overgaan.");
}

main();
