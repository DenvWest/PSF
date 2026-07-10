import type { NutrientId } from "@/data/nutrition/intake-reference";
import { nutritionSupplementGate } from "@/lib/nutrition-advice";

export type SupplementEligibilityOptions = {
  nutritionLogCompleted?: boolean;
};

export type NutritionIntakeSnapshot = {
  items: unknown[];
} | null;

export function isNutritionLogCompleted(
  nutritionIntake: NutritionIntakeSnapshot | undefined,
): boolean {
  return Boolean(nutritionIntake && nutritionIntake.items.length > 0);
}

export function canShowSupplementStrip(
  options?: SupplementEligibilityOptions,
): boolean {
  return options?.nutritionLogCompleted === true;
}

export function canShowSupplementRecommendation(
  nutrient: NutrientId,
  options?: SupplementEligibilityOptions,
): boolean {
  if (!canShowSupplementStrip(options)) {
    return false;
  }
  return nutritionSupplementGate(nutrient).allowed;
}

export function buildRecommendationsEligibility(
  nutritionIntake: NutritionIntakeSnapshot | undefined,
): SupplementEligibilityOptions {
  return { nutritionLogCompleted: isNutritionLogCompleted(nutritionIntake) };
}
