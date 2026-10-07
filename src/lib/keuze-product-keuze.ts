import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import { isEetmomentId, type EetmomentId } from "@/lib/nutrition-eetmomenten";

/**
 * Het supplement dat je in Keuze → Vergelijken voor één stof koos — één
 * product per stof, bewaard als favoriet in `account_favorites` (domein
 * voeding), naast de routekeuze `voeding-route-<stof>-<bord|potje|beide>`.
 *
 * Het id draagt de productslug, zodat Keuze → Favorieten zonder extra opslag
 * de link naar de productpagina kan tonen. Daar staat de koopknop; in het
 * dashboard zelf staat geen affiliate-link (cockpit-besluit, juli 2026).
 */

const PREFIX = "voeding-product-";

const STOFFEN = Object.keys(nutrientReferences) as NutrientId[];

export function productKeuzeId(nutrient: NutrientId, slug: string): string {
  return `${PREFIX}${nutrient}-${slug}`;
}

export function parseProductKeuze(id: string): { nutrient: NutrientId; slug: string } | null {
  if (!id.startsWith(PREFIX)) return null;
  const rest = id.slice(PREFIX.length);
  const nutrient = STOFFEN.find((stof) => rest.startsWith(`${stof}-`));
  if (!nutrient) return null;
  const slug = rest.slice(nutrient.length + 1);
  return slug ? { nutrient, slug } : null;
}

/** De slug van het gekozen product voor deze stof, of null. */
export function productKeuzeVoorStof(nutrient: NutrientId, items: readonly { id: string }[]): string | null {
  for (const item of items) {
    const keuze = parseProductKeuze(item.id);
    if (keuze?.nutrient === nutrient) return keuze.slug;
  }
  return null;
}

/** Alle bewaarde productkeuzes van deze stof — om er bij een wissel precies één over te laten. */
export function productKeuzeIdsVoorStof(nutrient: NutrientId, items: readonly { id: string }[]): string[] {
  return items.filter((item) => parseProductKeuze(item.id)?.nutrient === nutrient).map((item) => item.id);
}

export function productKeuzeTitel(nutrient: NutrientId, naam: string): string {
  return `${nutrientReferences[nutrient].label}: ${naam}`;
}

/** De regel onder een bewaarde productkeuze op Keuze → Favorieten. */
export function productKeuzeContext(id: string): string | null {
  const keuze = parseProductKeuze(id);
  if (!keuze) return null;
  const label = nutrientReferences[keuze.nutrient].label;
  return `Jouw supplement voor ${label.charAt(0).toLowerCase()}${label.slice(1)}, gekozen in Vergelijken.`;
}

export function productKeuzeHref(id: string): string | null {
  const keuze = parseProductKeuze(id);
  return keuze ? `/product/${keuze.slug}` : null;
}

/**
 * Herkomst op een productlink vanuit Keuze: de productpagina toont dan
 * "← Terug naar je keuze", en die link opent in het dashboard dezelfde stof.
 */
export type KeuzeDeel = "logboek" | "favorieten";

/**
 * @param deel het onderdeel van Keuze waar je vandaan kwam — Vergelijken
 *   (`logboek`, standaard) of Mijn keuzes (`favorieten`) — zodat de terugknop
 *   je daar weer neerzet.
 */
export function metKeuzeHerkomst(href: string, nutrient: NutrientId, deel: KeuzeDeel = "logboek"): string {
  const url = new URL(href, "https://www.perfectsupplement.nl");
  url.searchParams.set("van", "keuze");
  url.searchParams.set("stof", nutrient);
  if (deel !== "logboek") url.searchParams.set("deel", deel);
  return `${url.pathname}${url.search}${url.hash}`;
}

/** De stof uit een herkomst-query, of null als die niet uit Keuze komt of onbekend is. */
export function leesKeuzeHerkomst(search: URLSearchParams): NutrientId | null {
  if (search.get("van") !== "keuze") return null;
  const stof = search.get("stof");
  return STOFFEN.find((kandidaat) => kandidaat === stof) ?? null;
}

export function leesKeuzeDeel(search: URLSearchParams): KeuzeDeel {
  return search.get("deel") === "favorieten" ? "favorieten" : "logboek";
}

export function keuzeTerugHref(nutrient: NutrientId, deel: KeuzeDeel = "logboek"): string {
  const params = new URLSearchParams({ tab: "keuze", stof: nutrient });
  if (deel !== "logboek") params.set("deel", deel);
  return `/dashboard?${params.toString()}`;
}

export function stofLabel(nutrient: NutrientId): string {
  return nutrientReferences[nutrient].label;
}

/**
 * Wanneer je het gekozen supplement inneemt, of wanneer je je gekozen eten
 * eet: ontbijt, lunch, avondeten of tussendoor — dezelfde vier momenten als
 * het dagboek. Per stof en per kant één moment. Bewaard zoals de routekeuze
 * (`voeding-route-…`): als eigen favoriet met het moment in het id, zodat er
 * geen migratie nodig is.
 *
 * Eten: de ＋ in Mijn keuzes zet een bron meteen op dat moment in het
 * dagboek. Supplement: straks met één tik loggen, en timing in "Jouw stack"
 * (premium).
 */
export type MomentKant = "supplement" | "eten";

const MOMENT_PREFIX: Record<MomentKant, string> = {
  supplement: "voeding-moment-",
  eten: "voeding-eetmoment-",
};

export function momentKeuzeId(nutrient: NutrientId, moment: EetmomentId, kant: MomentKant = "supplement"): string {
  return `${MOMENT_PREFIX[kant]}${nutrient}-${moment}`;
}

export function parseMomentKeuze(
  id: string,
): { nutrient: NutrientId; moment: EetmomentId; kant: MomentKant } | null {
  const kant = (Object.keys(MOMENT_PREFIX) as MomentKant[]).find((k) => id.startsWith(MOMENT_PREFIX[k]));
  if (!kant) return null;
  const rest = id.slice(MOMENT_PREFIX[kant].length);
  const nutrient = STOFFEN.find((stof) => rest.startsWith(`${stof}-`));
  if (!nutrient) return null;
  const moment = rest.slice(nutrient.length + 1);
  return isEetmomentId(moment) ? { nutrient, moment, kant } : null;
}

export function momentVoorStof(
  nutrient: NutrientId,
  items: readonly { id: string }[],
  kant: MomentKant = "supplement",
): EetmomentId | null {
  for (const item of items) {
    const keuze = parseMomentKeuze(item.id);
    if (keuze?.nutrient === nutrient && keuze.kant === kant) return keuze.moment;
  }
  return null;
}

export function momentKeuzeIdsVoorStof(
  nutrient: NutrientId,
  items: readonly { id: string }[],
  kant: MomentKant = "supplement",
): string[] {
  return items
    .filter((item) => {
      const keuze = parseMomentKeuze(item.id);
      return keuze?.nutrient === nutrient && keuze.kant === kant;
    })
    .map((item) => item.id);
}

/**
 * Een voedingsmiddel dat je in Vergelijken bij één stof koos. Naast de ☆ in
 * het dagboek (die bovenaan zet bij het toevoegen) onthoudt dit bij wélke
 * stof je hem koos: een gebakken ei levert per stuk 13,5 % van de
 * eiwitreferentie en haalt de "bron van"-drempel niet, maar wie het bij eiwit
 * kiest, wil het in Mijn keuzes bij eiwit zien.
 */
const ETEN_PREFIX = "voeding-eten-";

export function etenKeuzeId(nutrient: NutrientId, key: string): string {
  return `${ETEN_PREFIX}${nutrient}-${key}`;
}

export function parseEtenKeuze(id: string): { nutrient: NutrientId; key: string } | null {
  if (!id.startsWith(ETEN_PREFIX)) return null;
  const rest = id.slice(ETEN_PREFIX.length);
  const nutrient = STOFFEN.find((stof) => rest.startsWith(`${stof}-`));
  if (!nutrient) return null;
  const key = rest.slice(nutrient.length + 1);
  return key ? { nutrient, key } : null;
}

/** De voedingsmiddelen die je bij deze stof koos, in de volgorde waarin ze bewaard zijn. */
export function etenKeuzesVoorStof(nutrient: NutrientId, items: readonly { id: string }[]): string[] {
  return items.flatMap((item) => {
    const keuze = parseEtenKeuze(item.id);
    return keuze?.nutrient === nutrient ? [keuze.key] : [];
  });
}

/** Of een favoriet bij de stofkeuzes hoort (route, product of moment) en dus in de stofkaart van Mijn keuzes staat. */
export function isStofKeuzeFavoriet(id: string): boolean {
  return (
    id.startsWith("voeding-route-") ||
    parseProductKeuze(id) !== null ||
    parseMomentKeuze(id) !== null ||
    parseEtenKeuze(id) !== null
  );
}
