import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { DagboekSupplementProduct } from "@/lib/nutrition-dagboek-items";
import { NUTRIENT_HUB_CATEGORY } from "@/lib/nutrition-result-rows";
import type { KeuzeProduct } from "@/lib/supplement-hub/ps-score-per-stof";

const STOF_VAN_CATEGORIE = new Map(
  (Object.entries(NUTRIENT_HUB_CATEGORY) as [NutrientId, string][]).map(([stof, categorie]) => [categorie, stof]),
);

const EENHEDEN = new Set<string>(["g", "mg", "µg"]);

/**
 * Het etiket per dag van een Keuze-product, zoals het dagboek het vastlegt.
 * Null als de dosis of eenheid niet vast te stellen is: dan valt er niets te
 * loggen.
 */
export function dagboekProductVan(product: KeuzeProduct): DagboekSupplementProduct | null {
  const nutrient = STOF_VAN_CATEGORIE.get(product.category);
  if (!nutrient || product.dosisPerDag === null || product.dosisPerDag <= 0) return null;
  if (!product.eenheid || !EENHEDEN.has(product.eenheid)) return null;
  return {
    naam: product.naam,
    nutrient,
    dosis: product.dosisPerDag,
    unit: product.eenheid as DagboekSupplementProduct["unit"],
  };
}

/** Per slug het etiket zoals het nu in de hub staat; waartegen de server een dagboekregel toetst. */
export function actueleDagboekProducten(products: readonly KeuzeProduct[]): Map<string, DagboekSupplementProduct> {
  const uit = new Map<string, DagboekSupplementProduct>();
  for (const product of products) {
    const dagboek = dagboekProductVan(product);
    if (dagboek) uit.set(product.slug, dagboek);
  }
  return uit;
}
