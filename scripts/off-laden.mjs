#!/usr/bin/env node
/**
 * Open Food Facts-NDJSON (uitvoer van `off-extract.py`) → tabel `sm_products`.
 *
 * Zonder `--schrijf` is dit een droogloop: het valideert en telt, en schrijft
 * niets. Rijen worden geüpsert op `prod_id`, nooit verwijderd (een dagboeklog
 * verwijst naar `prod_id`; een product dat uit een nieuwe dump verdwijnt mag die
 * regel niet meenemen — zie ONTWERP_SUPERMARKT_PRODUCTTABEL_2026-10.md §3).
 *
 * De validatie herhaalt de grenzen van `isPlausibelSupermarktProduct`
 * (src/lib/supermarkt-products.ts) en de check-constraints van de migratie, zodat
 * één kapotte rij geen hele batch laat falen.
 *
 * ## Gebruik
 *
 *   node scripts/off-laden.mjs
 *   node scripts/off-laden.mjs --bestand=/pad/off-nl.ndjson
 *   node scripts/off-laden.mjs --schrijf     (vereist NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY, bv. uit .env.local)
 *
 * Laad pas productiedata nadat de bronnenpagina en de ODbL-dump-route er zijn
 * (ONTWERP §6): dit script zet de producten direct in de zoekfunctie van het dagboek.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const STANDAARD_BESTAND = "scripts/out/off-nl.ndjson";

const KOLOM_GRENZEN = {
  energy_kcal: [0, 900],
  fat_g: [0, 100],
  saturated_fat_g: [0, 100],
  carbohydrate_g: [0, 100],
  sugars_g: [0, 100],
  fiber_g: [0, 100],
  protein_g: [0, 100],
  salt_g: [0, 100],
  sodium_mg: [0, Infinity],
  calcium_mg: [0, Infinity],
  iron_mg: [0, Infinity],
  vitamin_c_mg: [0, Infinity],
  vitamin_d_ug: [0, Infinity],
};

const TEKSTKOLOMMEN = ["prod_id", "bron", "bron_id", "snapshot_datum", "naam", "merk", "categorie", "zoek_tekst"];

/** Geeft de reden waarom een rij niet geladen mag worden, of `null` als hij goed is. */
export function afwijzing(rij) {
  if (rij.bron !== "off") return "bron_niet_off";
  if (typeof rij.bron_id !== "string" || rij.bron_id.length < 1 || rij.bron_id.length > 64) return "bron_id";
  if (rij.prod_id !== `${rij.bron}:${rij.bron_id}`) return "prod_id";
  if (typeof rij.naam !== "string" || rij.naam.length < 1 || rij.naam.length > 300) return "naam";
  if (rij.merk != null && rij.merk.length > 200) return "merk";
  if (rij.categorie != null && rij.categorie.length > 300) return "categorie";
  if (typeof rij.zoek_tekst !== "string" || rij.zoek_tekst.length < 1) return "zoek_tekst";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(rij.snapshot_datum ?? "")) return "snapshot_datum";
  for (const [kolom, [min, max]] of Object.entries(KOLOM_GRENZEN)) {
    const waarde = rij[kolom];
    if (waarde == null) continue;
    if (typeof waarde !== "number" || !Number.isFinite(waarde) || waarde < min || waarde > max) return `waarde_${kolom}`;
  }
  return null;
}

export function leesRijen(bestand) {
  const rijen = [];
  const afgewezen = {};
  for (const regel of fs.readFileSync(bestand, "utf8").split("\n")) {
    if (!regel.trim()) continue;
    const rij = JSON.parse(regel);
    const reden = afwijzing(rij);
    if (reden) afgewezen[reden] = (afgewezen[reden] ?? 0) + 1;
    else rijen.push(rij);
  }
  return { rijen, afgewezen };
}

/** Alleen de tabelkolommen; een onbekend veld in het bestand komt nooit in de database. */
export function naarTabelRij(rij, nu = new Date().toISOString()) {
  const uit = { updated_at: nu };
  for (const kolom of [...TEKSTKOLOMMEN, ...Object.keys(KOLOM_GRENZEN)]) uit[kolom] = rij[kolom] ?? null;
  return uit;
}

function laadEnv() {
  const pad = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(pad)) return;
  for (const regel of fs.readFileSync(pad, "utf8").split("\n")) {
    const m = regel.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

async function main() {
  const argBestand = (process.argv.find((a) => a.startsWith("--bestand=")) ?? "").slice(10);
  const bestand = argBestand || STANDAARD_BESTAND;
  const schrijf = process.argv.includes("--schrijf");

  const { rijen, afgewezen } = leesRijen(bestand);
  const ids = new Set(rijen.map((r) => r.prod_id));
  if (ids.size !== rijen.length) throw new Error(`Het bestand bevat ${rijen.length - ids.size} dubbele prod_id's.`);
  console.error(`${rijen.length} geldige rijen uit ${bestand}; afgewezen: ${JSON.stringify(afgewezen)}.`);

  if (!schrijf) {
    console.error("Droogloop: niets geschreven. Gebruik --schrijf om te laden.");
    return;
  }

  laadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY zijn nodig voor --schrijf.");
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const BATCH = 500;
  const nu = new Date().toISOString();
  for (let start = 0; start < rijen.length; start += BATCH) {
    const batch = rijen.slice(start, start + BATCH).map((r) => naarTabelRij(r, nu));
    const { error } = await supabase.from("sm_products").upsert(batch, { onConflict: "prod_id" });
    if (error) throw new Error(`Batch vanaf ${start}: ${error.message}`);
  }
  console.error(`Geschreven: ${rijen.length} rijen in sm_products.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((fout) => {
    console.error(fout.message);
    process.exit(1);
  });
}
