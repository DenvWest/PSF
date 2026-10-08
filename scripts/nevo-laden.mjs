#!/usr/bin/env node
/**
 * NEVO-online 2025/9.0 → tabel `nevo_foods`.
 *
 * Leest het officiële databestand (`NEVO2025_v9.0_Details.csv`, niet in git) en
 * laadt alle voedingsmiddelen, ongewijzigd, per 100 g/ml. Zonder `--schrijf`
 * is dit een droogloop: het toont wat er geschreven zou worden en schrijft niets.
 *
 * ## Regels uit de RIVM-voorwaarden (versie 2025/9.0)
 *
 *   - Waarden ongewijzigd: geen afronding, geen omrekening. De loader weigert een
 *     stof waarvan de eenheid in het bestand afwijkt van wat de kolom verwacht,
 *     in plaats van stil om te rekenen.
 *   - Versie per rij (`nevo_versie`): een nieuwe NEVO-versie is dezelfde import
 *     opnieuw (upsert op `nevo_code`).
 *   - Spoor (`TR`): de waarde is een plaatshouder en wordt `null`; de kolom staat
 *     in `spoor`. Verrijking (`+`) staat in `verrijkt`.
 *   - Geen omega-3: EPA/DHA staan niet in de kolommen. Onze EPA+DHA-som is een
 *     bewerking van de brondata.
 *
 * ## Gebruik
 *
 *   node scripts/nevo-laden.mjs
 *   node scripts/nevo-laden.mjs --csv=/pad/naar/NEVO2025_v9.0_Details.csv
 *   node scripts/nevo-laden.mjs --schrijf        (vereist NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY, bv. uit .env.local)
 *   node scripts/nevo-laden.mjs --schrijf --vanaf=1000   (hervatten na een afgebroken load)
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bouwVoedingsmiddelen, parseDelimited } from "./nevo-extract.mjs";
import { leesVanaf, maakSupabaseClient, upsertInBatches } from "./laad-supabase.mjs";

export const NEVO_EDITIE = "2025/9.0";

/** Tabelkolom → NEVO-stofcode en de eenheid waarin NEVO die stof publiceert. */
export const KOLOM_NAAR_NEVO = {
  energy_kcal: { code: "ENERCC", eenheid: "kcal" },
  protein_g: { code: "PROT", eenheid: "g" },
  fat_g: { code: "FAT", eenheid: "g" },
  saturated_fat_g: { code: "FASAT", eenheid: "g" },
  carbohydrate_g: { code: "CHO", eenheid: "g" },
  sugars_g: { code: "SUGAR", eenheid: "g" },
  fiber_g: { code: "FIBT", eenheid: "g" },
  sodium_mg: { code: "NA", eenheid: "mg" },
  potassium_mg: { code: "K", eenheid: "mg" },
  calcium_mg: { code: "CA", eenheid: "mg" },
  magnesium_mg: { code: "MG", eenheid: "mg" },
  iron_mg: { code: "FE", eenheid: "mg" },
  zinc_mg: { code: "ZN", eenheid: "mg" },
  vitamin_d_ug: { code: "VITD", eenheid: "µg" },
  vitamin_b12_ug: { code: "VITB12", eenheid: "µg" },
  vitamin_c_mg: { code: "VITC", eenheid: "mg" },
};

/** Controleert dat NEVO elke gevolgde stof in de verwachte eenheid publiceert. */
export function controleerEenheden(stoffen) {
  const fouten = [];
  for (const [kolom, { code, eenheid }] of Object.entries(KOLOM_NAAR_NEVO)) {
    const info = stoffen[code];
    if (!info) fouten.push(`${kolom}: stof ${code} ontbreekt in het bestand`);
    else if (info.eenheid !== eenheid) fouten.push(`${kolom}: NEVO geeft ${code} in ${info.eenheid}, verwacht ${eenheid}`);
  }
  return fouten;
}

/** NEVO-voedingsmiddel → {@link NevoFood}-vorm (camelCase), waarden ongewijzigd. */
export function naarNevoFood(voedingsmiddel, editie = NEVO_EDITIE) {
  const waarden = {};
  const spoor = [];
  const verrijkt = [];
  for (const [kolom, { code }] of Object.entries(KOLOM_NAAR_NEVO)) {
    const stof = voedingsmiddel.stoffen[code];
    if (!stof) {
      waarden[kolom] = null;
    } else if (stof.spoor) {
      waarden[kolom] = null;
      spoor.push(kolom);
    } else {
      waarden[kolom] = stof.w;
      if (stof.verrijkt) verrijkt.push(kolom);
    }
  }
  return {
    prodId: `nevo:${voedingsmiddel.code}`,
    nevoCode: voedingsmiddel.code,
    nevoVersie: editie,
    groep: voedingsmiddel.groep,
    naamNl: voedingsmiddel.naam,
    naamEn: voedingsmiddel.engelseNaam || null,
    per: voedingsmiddel.per,
    waarden,
    spoor,
    verrijkt,
  };
}

export function leesNevoFoods(csvPad) {
  const tekst = fs.readFileSync(csvPad, "utf8").replace(/^﻿/, "");
  const data = bouwVoedingsmiddelen(parseDelimited(tekst));
  if (data.problemen.length > 0) {
    throw new Error(`Het NEVO-bestand heeft ${data.problemen.length} problemen, bijv. ${JSON.stringify(data.problemen[0])}`);
  }
  if (data.versies.length !== 1 || data.versies[0].replace(/\D+/g, "") !== NEVO_EDITIE.replace(/\D+/g, "")) {
    throw new Error(`Verwacht NEVO-versie ${NEVO_EDITIE}, bestand meldt ${JSON.stringify(data.versies)}`);
  }
  const eenheidsfouten = controleerEenheden(data.stoffen);
  if (eenheidsfouten.length > 0) throw new Error(`Eenheden kloppen niet:\n  ${eenheidsfouten.join("\n  ")}`);
  return data.voedingsmiddelen.map((v) => naarNevoFood(v));
}

async function main() {
  const argCsv = (process.argv.find((a) => a.startsWith("--csv=")) ?? "").slice(6);
  const csv = argCsv || process.env.NEVO_CSV || path.join(os.homedir(), "Downloads", "NEVO2025_v9.0_Details.csv");
  const schrijf = process.argv.includes("--schrijf");

  const foods = leesNevoFoods(csv);
  const metSpoor = foods.filter((f) => f.spoor.length > 0).length;
  const metVerrijking = foods.filter((f) => f.verrijkt.length > 0).length;
  console.error(`${foods.length} voedingsmiddelen (NEVO ${NEVO_EDITIE}); ${metSpoor} met een spoorwaarde, ${metVerrijking} met verrijking.`);

  if (!schrijf) {
    console.error("Droogloop: niets geschreven. Gebruik --schrijf om te laden.");
    return;
  }

  const supabase = await maakSupabaseClient();
  const nu = new Date().toISOString();
  const rijen = foods.map((f) => ({
    nevo_code: f.nevoCode,
    nevo_versie: f.nevoVersie,
    groep: f.groep,
    naam_nl: f.naamNl,
    naam_en: f.naamEn,
    per: f.per,
    zoek_tekst: f.naamNl.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/g, " ").trim(),
    ...f.waarden,
    spoor: f.spoor,
    verrijkt: f.verrijkt,
    updated_at: nu,
  }));
  await upsertInBatches({ supabase, tabel: "nevo_foods", rijen, onConflict: "nevo_code", vanaf: leesVanaf() });
  console.error(`Geschreven: ${foods.length} rijen in nevo_foods.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((fout) => {
    console.error(fout.message);
    process.exit(1);
  });
}
