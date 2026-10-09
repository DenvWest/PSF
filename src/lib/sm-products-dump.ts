import type { SupabaseClient } from "@supabase/supabase-js";
import { DBCL_URL, ODBL_URL, OFF_WIJZIGINGEN } from "@/lib/supermarkt-bron";
import { SM_PRODUCTS_KOLOMMEN } from "@/lib/supermarkt-products";
import { maakZip } from "@/lib/zip-archive";

/**
 * De ODbL-dump van `sm_products`: de hele tabel als CSV in een zip met licentie
 * en leesmij, voor wie de afgeleide database van ons wil hebben (ODbL §4.6).
 * De tabel bevat uitsluitend Open Food Facts-rijen, dus de dump bevat geen
 * NEVO-gegevens en geen gebruikersdata. De zip wordt hooguit één keer per
 * `ZIP_GELDIG_MS` opgebouwd, hoeveel downloads er ook komen. Zie
 * `docs/plan/ONTWERP_SUPERMARKT_PRODUCTTABEL_2026-10.md` §6 en
 * `docs/plan/REVIEW_OFF_IMPORT_2026-10.md` #3 en #4.
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
 * Levert de rijen van de tabel, met keyset-paginering op `prod_id` zodat een
 * grote tabel nooit in één keer in het geheugen komt. Stopt bij een lege
 * pagina, niet bij een korte: geeft de server minder rijen per verzoek dan
 * gevraagd, dan blijft de dump toch compleet. Gooit bij een databasefout.
 */
export async function* dumpRijen(
  supabase: SupabaseClient,
  paginaGrootte: number = PAGINA_GROOTTE,
): AsyncGenerator<Record<string, unknown>> {
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
    if (rijen.length === 0) return;
    for (const rij of rijen) yield rij;
    laatste = String(rijen[rijen.length - 1].prod_id);
  }
}

export const CSV_BESTANDSNAAM = "perfectsupplement-open-food-facts.csv";

export function licentieTekst(): string {
  return [
    "Licentie / License",
    "",
    "Open Food Facts-gegevens, © Open Food Facts contributors (https://world.openfoodfacts.org).",
    `Deze afgeleide database (${CSV_BESTANDSNAAM}) is beschikbaar onder de Open Database License (ODbL) 1.0:`,
    ODBL_URL,
    `De afzonderlijke gegevens erin zijn beschikbaar onder de Database Contents License (DbCL) 1.0:`,
    DBCL_URL,
    "",
    "Samenvatting, niet bindend: je mag de database kopiëren, verspreiden en aanpassen, ook commercieel, mits je Open Food Facts vermeldt, een bewerking onder dezelfde licentie (ODbL) aanbiedt en deze licentie of de verwijzing ernaar meegeeft. Alleen de licentietekst zelf is bindend.",
    "",
    "Open Food Facts data, © Open Food Facts contributors.",
    `This derived database (${CSV_BESTANDSNAAM}) is made available under the Open Database License (ODbL) 1.0: ${ODBL_URL}`,
    `Its individual contents are made available under the Database Contents License (DbCL) 1.0: ${DBCL_URL}`,
    "",
  ].join("\r\n");
}

export type DumpStatistiek = { aantal: number; perSnapshot: ReadonlyMap<string, number> };

export function leesmijTekst(statistiek: DumpStatistiek, samengesteldOp: Date): string {
  const snapshots = [...statistiek.perSnapshot]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([datum, aantal]) => `- ${datum}: ${aantal} rijen`);
  return [
    "Open Food Facts-gegevens van PerfectSupplement",
    "",
    "Bron: Open Food Facts (https://world.openfoodfacts.org), © Open Food Facts contributors.",
    `Licentie: ODbL 1.0 (${ODBL_URL}); zie LICENTIE.txt.`,
    "Dit bestand bevat geen NEVO-gegevens en geen gegevens van gebruikers.",
    "",
    `Samengesteld op: ${samengesteldOp.toISOString().slice(0, 10)}`,
    `Aantal producten: ${statistiek.aantal}`,
    "Snapshotdatum per rij (de datum van de Open Food Facts-dump waaruit de rij komt), kolom snapshot_datum:",
    ...snapshots,
    "",
    "Wat wij ten opzichte van de bron hebben aangepast:",
    ...OFF_WIJZIGINGEN.map((wijziging) => `- ${wijziging}`),
    "",
    `Kolommen: ${DUMP_KOLOMMEN.join(", ")}.`,
    "Alle voedingswaarden zijn per 100 g of ml. Een lege cel betekent onbekend, nooit nul.",
    "",
    "Meer uitleg: https://perfectsupplement.nl/bronnen",
    "",
  ].join("\r\n");
}

export async function bouwDumpZip(supabase: SupabaseClient, nu: Date): Promise<Buffer> {
  const regels: string[] = [csvKop()];
  const perSnapshot = new Map<string, number>();
  let aantal = 0;
  for await (const rij of dumpRijen(supabase)) {
    regels.push(csvRegel(rij));
    const snapshot = typeof rij.snapshot_datum === "string" ? rij.snapshot_datum : "onbekend";
    perSnapshot.set(snapshot, (perSnapshot.get(snapshot) ?? 0) + 1);
    aantal += 1;
  }
  const tekst = (inhoud: string) => Buffer.from(inhoud, "utf8");
  return maakZip(
    [
      { naam: CSV_BESTANDSNAAM, inhoud: tekst(regels.join("")) },
      { naam: "LICENTIE.txt", inhoud: tekst(licentieTekst()) },
      { naam: "LEESMIJ.txt", inhoud: tekst(leesmijTekst({ aantal, perSnapshot }, nu)) },
    ],
    nu,
  );
}

/**
 * Houdt het resultaat van `bouw` `geldigMs` vast. Gelijktijdige aanvragen delen
 * één bouwpoging; mislukt een nieuwe poging terwijl er een oud resultaat is,
 * dan blijft dat oude in omloop.
 */
export function maakVerseCache<T>(bouw: () => Promise<T>, geldigMs: number, klok: () => number = Date.now) {
  let bewaard: { waarde: T; sinds: number } | null = null;
  let bezig: Promise<T> | null = null;

  return async function haal(): Promise<T> {
    if (bewaard && klok() - bewaard.sinds < geldigMs) return bewaard.waarde;
    bezig ??= bouw()
      .then((waarde) => {
        bewaard = { waarde, sinds: klok() };
        return waarde;
      })
      .finally(() => {
        bezig = null;
      });
    try {
      return await bezig;
    } catch (fout) {
      if (bewaard) return bewaard.waarde;
      throw fout;
    }
  };
}

export const ZIP_GELDIG_MS = 60 * 60 * 1000;

export function maakDumpZipBron(supabase: SupabaseClient) {
  return maakVerseCache(() => bouwDumpZip(supabase, new Date()), ZIP_GELDIG_MS);
}
