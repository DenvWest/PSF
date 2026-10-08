/**
 * Gedeelde stukken voor de loaders (`off-laden.mjs`, `nevo-laden.mjs`): env uit
 * `.env.local`, en upserten in batches met opnieuw proberen bij tijdelijke fouten
 * en hervatten met `--vanaf=<n>` (REVIEW_OFF_IMPORT_2026-10.md #7).
 */

import fs from "node:fs";
import path from "node:path";

export function laadEnv() {
  const pad = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(pad)) return;
  for (const regel of fs.readFileSync(pad, "utf8").split("\n")) {
    const m = regel.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

export async function maakSupabaseClient() {
  laadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY zijn nodig voor --schrijf.");
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(url, key, { auth: { persistSession: false } });
}

/** `--vanaf=<n>` uit de argumenten; 0 als hij ontbreekt. */
export function leesVanaf(argv = process.argv) {
  const arg = argv.find((a) => a.startsWith("--vanaf="));
  if (!arg) return 0;
  const n = Number(arg.slice(8));
  if (!Number.isInteger(n) || n < 0) throw new Error(`--vanaf moet een geheel getal ≥ 0 zijn, kreeg "${arg.slice(8)}".`);
  return n;
}

/** Netwerkfout, 429 of 5xx: opnieuw proberen heeft zin. Een 4xx-fout of een constraint niet. */
export function isTijdelijkeFout({ status, message } = {}) {
  if (status === 429 || (typeof status === "number" && status >= 500)) return true;
  return /fetch failed|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|socket hang up|network/i.test(message ?? "");
}

const wachtMs = (ms) => new Promise((klaar) => setTimeout(klaar, ms));

/**
 * Upsert `rijen` in batches vanaf index `vanaf`. Een tijdelijke fout wordt tot
 * `pogingen` keer opnieuw geprobeerd, met 1 s × poging wachttijd. Faalt een batch
 * definitief, dan noemt de fout de `--vanaf` om mee te hervatten.
 */
export async function upsertInBatches({ supabase, tabel, rijen, onConflict, batch = 500, vanaf = 0, pogingen = 6, wacht = wachtMs, log = console.error }) {
  if (vanaf > rijen.length) throw new Error(`--vanaf=${vanaf} ligt voorbij het einde (${rijen.length} rijen).`);
  let geschreven = 0;
  for (let start = vanaf; start < rijen.length; start += batch) {
    const deel = rijen.slice(start, start + batch);
    for (let poging = 1; ; poging++) {
      let fout;
      try {
        const { error, status } = await supabase.from(tabel).upsert(deel, { onConflict });
        fout = error ? { status: status ?? error.status, message: error.message } : null;
      } catch (e) {
        fout = { message: e instanceof Error ? e.message : String(e) };
      }
      if (!fout) break;
      if (!isTijdelijkeFout(fout) || poging >= pogingen) {
        throw new Error(`Batch vanaf ${start} faalde (poging ${poging}): ${fout.message}. Hervat met --vanaf=${start}.`);
      }
      log(`Batch vanaf ${start}: ${fout.message}; poging ${poging + 1} van ${pogingen} over ${poging} s.`);
      await wacht(1000 * poging);
    }
    geschreven += deel.length;
  }
  return geschreven;
}
