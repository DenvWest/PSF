import type { OrgScopedClient } from "@/lib/db/scoped";
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
import {
  itemsNaarMomenten,
  parseDagItems,
  serialiseerDagItems,
  type DagItems,
} from "@/lib/nutrition-dagboek-items";
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

/**
 * Ruwe items-invoer naar een geldige structuur.
 *
 * Dunne doorgeefluik naar {@link parseDagItems}: de regels wat een geldige
 * regel is, horen bij de itemsmodule zelf, zodat de tests er direct op draaien.
 * Deze naam bestaat om hem naast `sanitizePortions` en `sanitizeMeals` te
 * kunnen lezen — de route roept alle drie op dezelfde manier aan.
 */
export function sanitizeItems(raw: unknown): DagItems {
  return parseDagItems(raw);
}

/** ISO-datum (YYYY-MM-DD), en niet in de toekomst. */
export function isValidEntryDate(value: string, today: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  return value <= today;
}

const KOLOMMEN_MET_ITEMS = "entry_date, day_kind, portions, meals, items, water_ml";
const KOLOMMEN_ZONDER_ITEMS = "entry_date, day_kind, portions, meals, water_ml";

export async function listDaybookDays(
  supabase: OrgScopedClient,
  accountId: string,
  limit = 30,
): Promise<DagboekDag[]> {
  const lees = (kolommen: string) =>
    supabase
      .from("account_nutrition_daybook")
      .select(kolommen)
      .eq("account_id", accountId)
      .order("entry_date", { ascending: false })
      .limit(limit);

  // De items-kolom komt uit een migratie die op de server met de hand wordt
  // gedraaid (Supabase Dashboard, zie CLAUDE.md). Tot dat moment bestaat hij
  // niet en zou één select-fout het hele dagboek leeg maken — inclusief de
  // dagen die er wél zijn. Vandaar de tweede poging zonder die kolom: liever
  // een dag zonder producten dan geen dag.
  let { data, error } = await lees(KOLOMMEN_MET_ITEMS);
  if (error) {
    ({ data, error } = await lees(KOLOMMEN_ZONDER_ITEMS));
  }

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
      items: parseDagItems(row.items),
      waterMl: normaliseerWaterMl(row.water_ml),
    };
  });
}

/**
 * Momenten uit twee bronnen samenvoegen.
 *
 * Producten winnen niet van groepen en groepen niet van producten — ze tellen
 * op. Wie spinazie invult én daarnaast "1 portie groente" registreert omdat hij
 * niet meer weet wat het tweede was, heeft twee porties gegeten.
 */
function voegMomentenSamen(uitItems: DagMomenten, losseGroepen: DagMomenten): DagMomenten {
  const uit: DagMomenten = {};
  const momentIds = new Set([...Object.keys(uitItems), ...Object.keys(losseGroepen)]);

  for (const momentId of momentIds) {
    const id = momentId as keyof DagMomenten;
    const a = uitItems[id] ?? {};
    const b = losseGroepen[id] ?? {};
    const inhoud: MomentInhoud = { ...a };
    for (const [groep, aantal] of Object.entries(b)) {
      const key = groep as VoedselgroepId;
      inhoud[key] = (inhoud[key] ?? 0) + (aantal ?? 0);
    }
    if (Object.keys(inhoud).length > 0) {
      uit[id] = inhoud;
    }
  }

  return uit;
}

export async function upsertDaybookDay(
  supabase: OrgScopedClient,
  accountId: string,
  input: {
    date: string;
    /** Optioneel: wordt afgeleid uit `momenten` wanneer die er zijn. */
    porties?: Partial<Record<VoedselgroepId, number>>;
    momenten?: DagMomenten;
    /** Productregels per eetmoment; tellen mee naar `momenten` en `portions`. */
    items?: DagItems;
    waterMl?: number | null;
  },
): Promise<boolean> {
  // Drie vormen, één waarheid. `items` is de fijnste en `portions` de vorm waar
  // alle analyse op rekent; de tussenliggende `meals` wordt afgeleid in plaats
  // van apart aangeleverd, zodat ze niet uit elkaar kunnen lopen.
  const items = input.items ?? {};
  const momenten = voegMomentenSamen(itemsNaarMomenten(items), input.momenten ?? {});
  const heeftMomenten = Object.keys(momenten).length > 0;
  const porties = heeftMomenten ? portiesUitMomenten(momenten) : (input.porties ?? {});

  const rij = {
    account_id: accountId,
    entry_date: input.date,
    day_kind: dagSoortVoor(input.date),
    portions: porties,
    meals: momenten,
    items: serialiseerDagItems(items),
    water_ml: input.waterMl ?? null,
  };

  const { error } = await supabase
    .from("account_nutrition_daybook")
    .upsert(rij, { onConflict: "account_id,entry_date" });

  if (!error) {
    return true;
  }

  // Zelfde reden als bij het lezen: zolang de items-migratie nog niet gedraaid
  // is, mag een dag niet verloren gaan. De groepstellingen zijn er dan nog
  // steeds — alleen de productregels niet.
  const { items: _weg, ...zonderItems } = rij;
  const tweedePoging = await supabase
    .from("account_nutrition_daybook")
    .upsert(zonderItems, { onConflict: "account_id,entry_date" });

  return !tweedePoging.error;
}
