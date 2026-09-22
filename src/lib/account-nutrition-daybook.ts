import type { OrgScopedClient } from "@/lib/db/scoped";
import {
  portiesUitItems,
  sanitizeItems,
  type DagboekItem,
} from "@/lib/nutrition-dagboek-items";
import {
  isEetmomentId,
  normaliseerWaterMl,
  portiesUitMomenten,
  type DagMomenten,
  type MomentInhoud,
} from "@/lib/nutrition-eetmomenten";
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

/**
 * Maakt van ruwe momenten-invoer een geldige structuur.
 *
 * Zelfde filosofie als {@link sanitizePortions}: onbekende sleutels vallen
 * eraf zonder de rest weg te gooien. Een moment dat na het schoonmaken leeg is,
 * verdwijnt helemaal — een lege bak is hetzelfde als geen bak, en een
 * `{"lunch": {}}` in de opslag zou "lunch overgeslagen" en "lunch vergeten in
 * te vullen" ononderscheidbaar maken.
 */
export function sanitizeMeals(raw: unknown): DagMomenten {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const result: DagMomenten = {};
  for (const [momentId, inhoud] of Object.entries(raw as Record<string, unknown>)) {
    if (!isEetmomentId(momentId)) continue;
    const schoon = sanitizePortions(inhoud) as MomentInhoud;
    if (Object.keys(schoon).length === 0) continue;
    result[momentId] = schoon;
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
    .select("entry_date, day_kind, portions, meals, water_ml, items")
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
      momenten: sanitizeMeals(row.meals),
      // Ontbreekt de kolom nog (migratie niet gedraaid), dan leest dit als een
      // dag uit de groepenperiode: een lege lijst, geen fout.
      items: sanitizeItems(row.items),
      waterMl: normaliseerWaterMl(row.water_ml),
    };
  });
}

/**
 * Schrijft één dag weg, en laat staan wat de aanroeper niet noemde.
 *
 * ## Waarom dit samenvoegt en niet overschrijft
 *
 * Een dag draagt vier invoervormen naast elkaar: `items` (product per
 * eetmoment), `meals` (groep per eetmoment), `portions` (platte lijst) en
 * `water_ml`. Ze worden door verschillende schermen geschreven — de dagboek-UI
 * stuurt vandaag alléén `{ date, items }`.
 *
 * Tot september 2026 schreef deze functie de hele rij onvoorwaardelijk weg,
 * ook de velden waar niets over gezegd was. Een POST met alleen items zette
 * daarmee `meals` op `{}` en `water_ml` op `null`: wie 's ochtends zijn water
 * registreerde en 's avonds een product toevoegde, was dat water stil kwijt.
 * Geen foutmelding, geen zichtbaar spoor — de UI leest die velden niet meer,
 * dus het verdween onopgemerkt.
 *
 * Een veld dat de aanroeper niet noemt, blijft daarom staan. `undefined`
 * betekent "hier zeg ik niets over"; een expliciete lege waarde (`[]`, `{}`,
 * `null`) betekent "maak dit leeg" en wist wél. Dat onderscheid is de hele
 * reden dat de velden optioneel zijn in plaats van met een default gevuld.
 *
 * ## Waarom eerst lezen en dan schrijven
 *
 * Een `upsert` stuurt altijd een hele rij; welke kolommen bij een conflict
 * worden bijgewerkt, hangt af van wat er in de body zit. Die regel klopt wel,
 * maar hij staat in PostgREST en niet in dit bestand — en een stille
 * gedragsverandering daar zou hier weer dataverlies opleveren. Door de
 * bestaande rij expliciet te lezen en de samenvoeging zelf te doen, staat de
 * bedoeling in onze eigen code en is hij te testen.
 */
export async function upsertDaybookDay(
  supabase: OrgScopedClient,
  accountId: string,
  input: {
    date: string;
    /** Optioneel: wordt afgeleid uit `items` of `momenten` wanneer die er zijn. */
    porties?: Partial<Record<VoedselgroepId, number>>;
    momenten?: DagMomenten;
    items?: readonly DagboekItem[];
    waterMl?: number | null;
  },
): Promise<boolean> {
  const bestaand = await leesDag(supabase, accountId, input.date);

  // Niet genoemd = laten staan. Zie de doc hierboven: dit is het verschil
  // tussen "ik zeg hier niets over" en "maak dit leeg".
  const momenten = input.momenten ?? bestaand?.momenten ?? {};
  const items = input.items ?? bestaand?.items ?? [];
  const waterMl = input.waterMl !== undefined ? input.waterMl : (bestaand?.waterMl ?? null);

  // De momenten zijn de invoervorm; `portions` blijft de bron waar alle
  // analyse op rekent. Afleiden in plaats van allebei laten aanleveren, zodat
  // ze niet uit elkaar kunnen lopen.
  // Volgorde: items winnen van momenten, momenten van losse porties. Elke laag
  // is fijner dan de vorige, dus de fijnste die er is beschrijft de dag het best.
  const porties = items.length > 0
    ? portiesUitItems(items)
    : Object.keys(momenten).length > 0
      ? portiesUitMomenten(momenten)
      : (input.porties ?? bestaand?.porties ?? {});

  const { error } = await supabase.from("account_nutrition_daybook").upsert(
    {
      account_id: accountId,
      entry_date: input.date,
      day_kind: dagSoortVoor(input.date),
      portions: porties,
      meals: momenten,
      items,
      water_ml: waterMl,
    },
    { onConflict: "account_id,entry_date" },
  );

  return !error;
}

/**
 * De dag zoals hij nu opgeslagen staat, of null als hij er nog niet is.
 *
 * Faalt de lezing (kolom bestaat nog niet, netwerk weg), dan levert dit `null`
 * en gedraagt de schrijving zich als vanouds: een nieuwe dag wegschrijven.
 * Dat is de veilige kant om op te falen — een mislukte lezing mag een
 * registratie niet blokkeren.
 */
type BestaandeDag = {
  porties: Partial<Record<VoedselgroepId, number>>;
  momenten: DagMomenten;
  items: DagboekItem[];
  waterMl: number | null;
};

/**
 * De minimale vorm van de select-keten die deze functie gebruikt.
 *
 * De PostgREST-builder draagt zijn hele generieke typeboom mee; die hier
 * uitschrijven levert alleen diepte-fouten op en zegt niets over wat we nodig
 * hebben. Dit beschrijft precies de drie stappen die we aanroepen.
 */
type DagQuery = {
  eq: (kolom: string, waarde: string) => DagQuery;
  maybeSingle: () => Promise<{ data: unknown; error: unknown }>;
};

async function leesDag(
  supabase: OrgScopedClient,
  accountId: string,
  date: string,
): Promise<BestaandeDag | null> {
  try {
    const query = supabase
      .from("account_nutrition_daybook")
      .select("portions, meals, water_ml, items") as unknown as DagQuery;

    const { data, error } = await query
      .eq("account_id", accountId)
      .eq("entry_date", date)
      .maybeSingle();

    if (error || !data || typeof data !== "object") return null;

    const row = data as Record<string, unknown>;
    return {
      porties: sanitizePortions(row.portions),
      momenten: sanitizeMeals(row.meals),
      items: sanitizeItems(row.items),
      waterMl: normaliseerWaterMl(row.water_ml),
    };
  } catch {
    return null;
  }
}
