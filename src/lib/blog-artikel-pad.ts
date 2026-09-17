import { resolveOmega3RootHref } from "@/lib/seo/omega3-root-consolidation";

/** Het pad zoals het in de data staat — ongevoelig voor consolidatie. */
export function blogArtikelPadRaw(artikel: { slug: string; pad?: string }): string {
  return artikel.pad ?? `/blog/${artikel.slug}`;
}

/**
 * Het pad waar een artikel daadwerkelijk te vinden is: links én canonical.
 * Zodra de omega-3-rootconsolidatie leeft, wijzen beide naar de gids in plaats
 * van naar een URL die meteen doorstuurt.
 */
export function blogArtikelPad(artikel: { slug: string; pad?: string }): string {
  return resolveOmega3RootHref(blogArtikelPadRaw(artikel));
}
