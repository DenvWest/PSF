import type { OrgScopedClient } from "@/lib/db/scoped";
import {
  dagSoortVoor,
  DAGBOEK_GROEPEN,
  type DagboekDag,
  type DagSoort,
} from "@/lib/nutrition-dagboek";
import type { VoedselgroepId } from "@/lib/nutrition-voedselgroepen";

/**
 * Opslag van het 2+2-dagboek.
 *
 * Eén rij per (account, dag): dezelfde dag opnieuw invullen overschrijft. Dat
 * is bewust — een tweede registratie van gisteren is geen tweede waarneming
 * maar een correctie, en die hoort de eerste te vervangen.
 *
 * De schoonmaak van de invoer zit hier en niet in de route, zodat er één plek
 * is waar bepaald wordt wat een geldige portie is. Alles wat geen bekende
 * voedselgroep is of geen redelijk getal, valt eraf in plaats van de hele
 * registratie af te wijzen: een onbekende sleutel is een client die voorloopt,
 * geen reden om iemands dag weg te gooien.
 */

/** Bovengrens per groep. Hoger is vrijwel altijd een typefout of een grap. */
const MAX_PORTIES = 20;

export type DaybookRow = {
  id: string;
  account_id: string;
  entry_date: string;
  day_kind: DagSoort;
  portions: Record<string, unknown>;
  created_at: string;
};

function isVoedselgroepKey(value: string): value is VoedselgroepId {
  return (DAGBOEK_GROEPEN as readonly string[]).includes(value);
}

/**
 * Maakt van ruwe invoer een geldige portie-map.
 *
 * Negatieve aantallen, oneindig, NaN en onbekende groepen vallen eraf. Halve
 * porties worden afgekapt: het dagboek kent hele porties, en een 1,5 zou
 * precisie claimen die de invoervorm niet biedt.
 */
export function sanitizePortions(raw: unknown): Partial<Record<VoedselgroepId, number>> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const result: Partial<Record<VoedselgroepId, number>> = {};
  for (const [key, value] of Object.entries(raw as unknown as Record<string, unknown>)) {
    if (!isVoedselgroepKey(key)) continue;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) continue;
    result[key] = Math.min(Math.trunc(value), MAX_PORTIES);
  }
  return result;
}

/** ISO-datum (YYYY-MM-DD), en niet in de toekomst. */
export function isValidEntryDate(value: string, today: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  return value <= today;
}

export async function listDaybookDays(
  supabase: OrgScopedClient,
  accountId: string,
  limit = 30,
): Promise<DagboekDag[]> {
  const { data, error } = await supabase
    .from("account_nutrition_daybook")
    .select("entry_date, day_kind, portions")
    .eq("account_id", accountId)
    .order("entry_date", { ascending: false })
    .limit(limit);

  if (error || !Array.isArray(data)) {
    return [];
  }

  return data.map((raw) => {
    const row = raw as unknown as Record<string, unknown>;
    const date = String(row.entry_date);
    const kind = row.day_kind;
    return {
      date,
      // De opgeslagen soort wint, met de kalender als vangnet: een rij die om
      // welke reden dan ook zonder geldige soort binnenkwam, telt alsnog mee.
      soort: kind === "weekend" || kind === "doordeweeks" ? kind : dagSoortVoor(date),
      porties: sanitizePortions(row.portions),
    };
  });
}

export async function upsertDaybookDay(
  supabase: OrgScopedClient,
  accountId: string,
  input: { date: string; porties: Partial<Record<VoedselgroepId, number>> },
): Promise<boolean> {
  const { error } = await supabase.from("account_nutrition_daybook").upsert(
    {
      account_id: accountId,
      entry_date: input.date,
      day_kind: dagSoortVoor(input.date),
      portions: input.porties,
    },
    { onConflict: "account_id,entry_date" },
  );

  return !error;
}
