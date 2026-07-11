import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { LifestyleExtraId } from "@/data/nutrition/nutrition-lifestyle-extras";
import {
  NUTRITION_EVIDENCE_BY_ID,
  type NutritionQuestionEvidence,
  type NutritionQuestionId,
} from "@/data/nutrition/nutrition-question-evidence";

export type GapEvidenceBundle = {
  primary: NutritionQuestionEvidence;
  secondaryIds: NutritionQuestionId[];
};

const GAP_EVIDENCE_MAP: Record<
  NutrientId,
  { primaryId: NutritionQuestionId; secondaryIds: NutritionQuestionId[] }
> = {
  protein: { primaryId: "proteinMeals", secondaryIds: ["meatLegumes"] },
  omega3: { primaryId: "oilyFish", secondaryIds: [] },
  magnesium: { primaryId: "vegetables", secondaryIds: ["meatLegumes", "nutsSeedsLegumes"] },
  vitamin_d: { primaryId: "daylight", secondaryIds: [] },
  zinc: { primaryId: "meatLegumes", secondaryIds: ["dairy"] },
};

const EXTRA_EVIDENCE_MAP: Record<LifestyleExtraId, NutritionQuestionId> = {
  fiber_low_wholegrain: "wholegrain",
  b12_vegan: "b12_vegan",
  sugar_high_signal: "sugaryDrinks",
};

export function evidenceForGap(nutrient: NutrientId): GapEvidenceBundle {
  const mapping = GAP_EVIDENCE_MAP[nutrient];
  return {
    primary: NUTRITION_EVIDENCE_BY_ID[mapping.primaryId],
    secondaryIds: mapping.secondaryIds,
  };
}

export function evidenceForExtra(id: LifestyleExtraId): NutritionQuestionEvidence {
  return NUTRITION_EVIDENCE_BY_ID[EXTRA_EVIDENCE_MAP[id]];
}

export function secondaryEvidenceLabels(ids: NutritionQuestionId[]): string[] {
  return ids.map((id) => NUTRITION_EVIDENCE_BY_ID[id].title);
}
