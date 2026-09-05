import { alleArtikelen } from "@/data/blog";
import { CATEGORIE_CONFIG } from "@/data/blog/categorieen";
import { PUBLIEK_PIJLERS, type PubliekPijler } from "@/data/blog/publiek-pijlers";
import { blogArtikelPad } from "@/lib/blog-artikel-pad";
import { blogCover, categorieCover } from "@/lib/blog-cover";
import {
  normalizeSearch,
  type LibraryItem,
} from "@/lib/library/library-item";
import type { BlogArtikel } from "@/types/blog";

function samenvattingVoorKaart(artikel: BlogArtikel): string {
  const bron = artikel.samenvatting?.trim() || artikel.heroIntro;
  const zinnen = bron.split(". ").slice(0, 2).join(". ");
  return zinnen.endsWith(".") ? zinnen : `${zinnen}.`;
}

/** "6 min" → 6; onbekende notatie levert Infinity zodat het nooit als kort telt. */
export function leestijdInMinuten(leestijd: string): number {
  const match = leestijd.match(/\d+/);
  return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
}

export function toLibraryItem(artikel: BlogArtikel): LibraryItem {
  const config = CATEGORIE_CONFIG[artikel.categorie];
  const samenvatting = samenvattingVoorKaart(artikel);

  return {
    id: artikel.slug,
    href: blogArtikelPad(artikel),
    title: artikel.titel,
    summary: samenvatting,
    groupKey: artikel.categorie,
    groupLabel: config.naam,
    accentClass: config.kleur.rail,
    image: blogCover(artikel),
    audience: artikel.audience,
    metaLabel: `${artikel.leestijd} leestijd`,
    sourceCount: artikel.referenties.length,
    badge: artikel.pad ? "Vergelijking" : undefined,
    publishedAt: artikel.gepubliceerdOp,
    searchText: normalizeSearch(
      [
        artikel.titel,
        samenvatting,
        config.naam,
        ...(artikel.keywords ?? []),
      ].join(" "),
    ),
  };
}

function pijlerNaarItem(pijler: PubliekPijler): LibraryItem {
  const config = CATEGORIE_CONFIG[pijler.categorie];

  return {
    id: pijler.slug,
    href: pijler.href,
    title: pijler.titel,
    summary: pijler.samenvatting,
    groupKey: pijler.categorie,
    groupLabel: config.naam,
    accentClass: config.kleur.rail,
    image: categorieCover(pijler.categorie),
    audience: pijler.audience,
    metaLabel: `${pijler.leestijd} leestijd`,
    sourceCount: pijler.bronnen,
    badge: "Pijler",
    publishedAt: pijler.gepubliceerdOp,
    searchText: normalizeSearch(
      [pijler.titel, pijler.samenvatting, config.naam, ...pijler.trefwoorden].join(" "),
    ),
  };
}

export function getBlogLibraryItems(): LibraryItem[] {
  return [...alleArtikelen.map(toLibraryItem), ...PUBLIEK_PIJLERS.map(pijlerNaarItem)];
}
