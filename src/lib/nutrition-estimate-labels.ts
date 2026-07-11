import type { IntakeEstimate } from "@/lib/nutrition-intake-estimate";

const PLANT_OMEGA3_REFERENCE = "2–3× plantaardige omega-3-bron per week";

export function isFishFreeNutritionContext(
  preference: string,
  allergies: string[],
): boolean {
  if (preference === "vegetarian" || preference === "vegan") {
    return true;
  }
  return allergies.includes("vis") || allergies.includes("zeevruchten");
}

export function withContextualEstimateLabels(
  estimate: IntakeEstimate[],
  preference: string,
  allergies: string[],
): IntakeEstimate[] {
  if (!isFishFreeNutritionContext(preference, allergies)) {
    return estimate;
  }
  return estimate.map((entry) =>
    entry.nutrient === "omega3"
      ? { ...entry, referenceLabel: PLANT_OMEGA3_REFERENCE }
      : entry,
  );
}
