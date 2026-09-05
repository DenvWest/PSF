import type { AudienceTag, ContentAudience } from "@/lib/content-audience";
import { AUDIENCE_BAND_ORDER, audienceBand } from "@/lib/content-audience";

/**
 * Eén rij in de bibliotheek. Blog-artikelen en kennisbank-begrippen worden
 * hierop platgeslagen zodat beide oppervlakken dezelfde browser, dezelfde
 * kaart en dezelfde meetpunten delen.
 */
export type LibraryItem = {
  id: string;
  href: string;
  title: string;
  summary: string;
  /** Categorie (blog) of thema (kennisbank). */
  groupKey: string;
  groupLabel: string;
  /** Tailwind-klasse voor het kleurstaafje links op de kaart. */
  accentClass: string;
  audience?: AudienceTag;
  /** Coverbeeld; blog en kennisbank leveren dit via hun cover-resolvers. */
  image?: { src: string; alt: string };
  /** Bijv. "6 min leestijd" — links in de metaregel. */
  metaLabel?: string;
  /** Aantal referenties; het na-te-rekenen-signaal van PS. */
  sourceCount?: number;
  /** Bijv. "Verdieping" bij tier 2+ begrippen. */
  badge?: string;
  /** ISO-datum voor sorteren op nieuwste. */
  publishedAt?: string;
  /** Genormaliseerde zoektekst (titel + samenvatting + trefwoorden). */
  searchText: string;
};

export type LibraryGroup = {
  key: string;
  label: string;
  count: number;
};

export function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function matchesSearch(item: LibraryItem, query: string): boolean {
  const normalized = normalizeSearch(query);
  if (normalized.length === 0) return true;
  return normalized
    .split(/\s+/)
    .every((token) => item.searchText.includes(token));
}

/** Zonder datum achteraan in plaats van door de sortering heen. */
function tijdstempel(item: LibraryItem): number {
  return item.publishedAt ? new Date(item.publishedAt).getTime() : 0;
}

export type LibrarySort = "relevantie" | "nieuwste" | "alfabet" | "bronnen";

/**
 * Sorteert binnen de audience-banden: de lens bepaalt de blokvolgorde, de
 * gekozen sortering bepaalt de volgorde binnen een blok.
 */
export function sortLibraryItems(
  items: LibraryItem[],
  sort: LibrarySort,
  audience: ContentAudience,
): LibraryItem[] {
  return [...items].sort((a, b) => {
    const bandDelta =
      AUDIENCE_BAND_ORDER[audienceBand(a.audience, audience)] -
      AUDIENCE_BAND_ORDER[audienceBand(b.audience, audience)];
    if (bandDelta !== 0) return bandDelta;

    switch (sort) {
      case "alfabet":
        return a.title.localeCompare(b.title, "nl");
      case "bronnen":
        return (b.sourceCount ?? 0) - (a.sourceCount ?? 0);
      case "nieuwste":
      case "relevantie":
      default: {
        const delta = tijdstempel(b) - tijdstempel(a);
        return delta !== 0 ? delta : a.title.localeCompare(b.title, "nl");
      }
    }
  });
}

export function countByGroup(items: LibraryItem[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.groupKey, (counts.get(item.groupKey) ?? 0) + 1);
  }
  return counts;
}

export function countByAudience(
  items: LibraryItem[],
  audience: ContentAudience,
): number {
  if (audience === "alle") return items.length;
  return items.filter((item) => item.audience === audience).length;
}
