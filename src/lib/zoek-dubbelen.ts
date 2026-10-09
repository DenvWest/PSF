import type { CatalogEntry } from "@/data/nutrition/food-catalog";
import { nevoKoppelingVoor } from "@/data/nutrition/food-catalog-nevo";
import type { SupermarktProduct } from "@/types/supermarkt-product";

/**
 * Haalt NEVO-treffers weg die al als catalogusregel in de lijst staan.
 *
 * Alleen een koppeling die hetzelfde voedingsmiddel aanwijst telt; een
 * `benadering` is een vergelijkbaar record en blijft dus als eigen treffer staan.
 * Vergeleken wordt met de catalogusregels die daadwerkelijk getoond worden,
 * zodat een treffer nooit verdwijnt zonder dat zijn tegenhanger zichtbaar is.
 */
export function zonderCatalogusDubbelen(
  producten: readonly SupermarktProduct[],
  getoondeCatalogus: readonly CatalogEntry[],
): SupermarktProduct[] {
  const gedekt = new Set<string>();
  for (const entry of getoondeCatalogus) {
    const koppeling = nevoKoppelingVoor(entry.key);
    if (koppeling && koppeling.basis !== "benadering") gedekt.add(koppeling.code);
  }
  return producten.filter((p) => !(p.bron === "nevo" && gedekt.has(p.bronId)));
}
