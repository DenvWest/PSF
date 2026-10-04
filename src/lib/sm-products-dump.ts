import type { SupabaseClient } from "@supabase/supabase-js";
import { SM_PRODUCTS_KOLOMMEN } from "@/lib/supermarkt-products";

/**
 * De ODbL-dump van `sm_products`: de hele tabel als CSV, voor wie de
 * afgeleide database van ons wil hebben (ODbL §4.6). De tabel bevat uitsluitend
 * Open Food Facts-rijen, dus de dump bevat geen NEVO-gegevens en geen
 * gebruikersdata. Zie `docs/plan/ONTWERP_SUPERMARKT_PRODUCTTABEL_2026-10.md` §6.
 */

const TABLE = "sm_products";
const PAGINA_GROOTTE = 1000;

/** Kolomvolgorde van de dump; staat ook uitgelegd op /bronnen. */
export const DUMP_KOLOMMEN = SM_PRODUCTS_KOLOMMEN;

const FORMULE_START = /^[=+\-@\t\r]/;

/**
 * Eén CSV-cel. Tekst die met een formuleteken begint krijgt een apostrof
 * ervoor, zodat een spreadsheet er geen formule van maakt; getallen blijven
 * ongewijzigd. `null` is een lege cel (onbekend, nooit een verzonnen 0).
 */
export function csvCel(waarde: unknown): string {
  if (waarde === null || waarde === undefined) return "";
  if (typeof waarde === "number") return Number.isFinite(waarde) ? String(waarde) : "";
  let tekst = String(waarde);
  if (FORMULE_START.test(tekst)) tekst = `'${tekst}`;
  return /[",\r\n]/.test(tekst) ? `"${tekst.replace(/"/g, '""')}"` : tekst;
}

export function csvRegel(rij: Record<string, unknown>): string {
  return `${DUMP_KOLOMMEN.map((kolom) => csvCel(rij[kolom])).join(",")}\r\n`;
}

export function csvKop(): string {
  return `${DUMP_KOLOMMEN.join(",")}\r\n`;
}

/**
 * Levert de dump regel voor regel, met keyset-paginering op `prod_id` zodat
 * een grote tabel nooit in één keer in het geheugen komt. Gooit bij een
 * databasefout.
 */
export async function* dumpRegels(
  supabase: SupabaseClient,
  paginaGrootte: number = PAGINA_GROOTTE,
): AsyncGenerator<string> {
  yield csvKop();
  let laatste: string | null = null;
  for (;;) {
    let aanvraag = supabase
      .from(TABLE)
      .select(DUMP_KOLOMMEN.join(","))
      .order("prod_id", { ascending: true })
      .limit(paginaGrootte);
    if (laatste !== null) aanvraag = aanvraag.gt("prod_id", laatste);

    const { data, error } = await aanvraag;
    if (error) throw new Error(error.message);
    const rijen = (data ?? []) as unknown as Record<string, unknown>[];
    for (const rij of rijen) yield csvRegel(rij);
    if (rijen.length < paginaGrootte) return;
    laatste = String(rijen[rijen.length - 1].prod_id);
  }
}
