import type { NutrientId } from "@/data/nutrition/intake-reference";
import { NUTRIENT_HUB_CATEGORY } from "@/lib/nutrition-result-rows";
import { buildSupplementHubHref } from "@/lib/supplement-hub/hub-link";
import { formatScore, getHubProducts } from "@/lib/supplement-hub/product-catalog";
import { getScoreBand } from "@/lib/supplement-hub/score-presentation";

/**
 * De hoogst scorende supplementen van één stof, compact genoeg voor Keuze →
 * Vergelijken. De PS-Score is een productscore (0–100, kwaliteit van het
 * product), nooit een score voor iemands voeding
 * (`docs/plan/BESLUIT_KEUZE_VERGELIJKEN_2026-10.md` §3).
 *
 * Geen affiliate-link: de link gaat naar de eigen productpagina en de
 * catalogus op `/supplementen`, waar de koopknop pas staat.
 */

export type PsScoreProduct = {
  slug: string;
  naam: string;
  /** "93,4" */
  score: string;
  bandLabel: string;
  vorm: string;
  href: string;
};

export function psScoreTopVoorStof(nutrient: NutrientId, limiet = 3): PsScoreProduct[] {
  const categorie = NUTRIENT_HUB_CATEGORY[nutrient];
  return getHubProducts()
    .filter((product) => product.category === categorie)
    .sort((a, b) => b.score.total - a.score.total)
    .slice(0, limiet)
    .map((product) => ({
      slug: product.slug,
      naam: product.volledigeNaam,
      score: formatScore(product.score.total),
      bandLabel: getScoreBand(product.score.total).label,
      vorm: product.vormLabel,
      href: product.href,
    }));
}

/** De catalogus op `/supplementen`, gefilterd op deze stof. */
export function psScoreCatalogusHref(nutrient: NutrientId): string {
  return buildSupplementHubHref(NUTRIENT_HUB_CATEGORY[nutrient]);
}

/** Hoeveel producten de catalogus voor deze stof heeft. */
export function psScoreAantalVoorStof(nutrient: NutrientId): number {
  const categorie = NUTRIENT_HUB_CATEGORY[nutrient];
  return getHubProducts().filter((product) => product.category === categorie).length;
}
