import { kennisbankTerms, themeLabels, type KennisbankTerm } from "@/data/kennisbank";
import { kennisbankCover } from "@/lib/kennisbank-cover";
import {
  normalizeSearch,
  type LibraryItem,
} from "@/lib/library/library-item";

/** Tier 2+ zit achter de verdiepingspoort, behalve de publieke uitzonderingen. */
export function isVerdieping(term: KennisbankTerm): boolean {
  return term.insightTier >= 2 && !term.publicFullContent;
}

export function toLibraryItem(term: KennisbankTerm): LibraryItem {
  const config = themeLabels[term.theme];
  const cover = kennisbankCover(term);

  return {
    id: term.slug,
    href: `/kennisbank/${term.slug}`,
    title: term.term,
    summary: term.shortDefinition,
    groupKey: term.theme,
    groupLabel: config.title,
    accentClass: config.colorClasses.rail,
    audience: term.audience,
    image: cover,
    sourceCount: term.referenties.length,
    badge: isVerdieping(term) ? "Verdieping" : undefined,
    publishedAt: term.laatstBijgewerktOp,
    searchText: normalizeSearch(
      [term.term, term.shortDefinition, config.title].join(" "),
    ),
    ...(cover ? { image: cover } : {}),
  };
}

export function getKennisbankLibraryItems(): LibraryItem[] {
  return kennisbankTerms.map(toLibraryItem);
}
