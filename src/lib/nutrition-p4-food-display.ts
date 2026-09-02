import type { FoodSource } from "@/data/nutrition/food-sources";

/** P4-weergave: NEVO-portie alleen wanneer de bron geverifieerd is. */
export function formatVerifiedFoodPortionNl(source: FoodSource): string | null {
  if (!source.verified || !source.nutrientValue) {
    return null;
  }
  if (source.amount == null) {
    return null;
  }
  return `${source.portionNl}: circa ${source.amount} ${source.nutrientValue.unit}`;
}
