import { intakeStatementFor } from "@/lib/nutrition-intake-statements";
import { buildNutritionAdvice, type NutritionAdviceItem } from "@/lib/nutrition-advice";
import { withContextualEstimateLabels } from "@/lib/nutrition-estimate-labels";
import {
  estimateNutritionIntake,
  type IntakeEstimate,
} from "@/lib/nutrition-intake-estimate";
import { buildNutritionLifestyleExtras, type LifestyleExtra } from "@/lib/nutrition-lifestyle-extras";
import { compareNutritionEstimates, type NutrientDelta } from "@/lib/nutrition-delta";
import {
  computeNutritionScore,
  nutritionReportFromAnswers,
} from "@/lib/nutrition-score";
import { getVitalityBand } from "@/lib/vitality-gauge";

export type NutritionPreference = "none" | "pescatarian" | "vegetarian" | "vegan";

export type NutritionAnswers = {
  sliders: Record<string, number>;
  allergies: string[];
  preference: NutritionPreference;
};

export type NutritionLogResponse = {
  score: number;
  band: ReturnType<typeof getVitalityBand>;
  estimate: IntakeEstimate[];
  statements: string[];
  advice: NutritionAdviceItem[];
  lifestyleExtras: LifestyleExtra[];
  delta: NutrientDelta[] | null;
  proteinMealsPerDay?: number;
};

export function buildNutritionLogResponse(
  answers: NutritionAnswers,
  previousEstimate: IntakeEstimate[] | null,
  adviceDate: Date = new Date(),
): NutritionLogResponse {
  const report = nutritionReportFromAnswers(answers.sliders);
  const score = computeNutritionScore(answers.sliders);
  const band = getVitalityBand(score);
  const estimate = withContextualEstimateLabels(
    estimateNutritionIntake(report),
    answers.preference,
    answers.allergies,
  );
  const delta = previousEstimate
    ? compareNutritionEstimates(previousEstimate, estimate)
    : null;
  const statements = estimate.map(intakeStatementFor);
  const advice = buildNutritionAdvice(estimate, {
    adviceDate,
    preference: answers.preference,
    allergies: answers.allergies,
  });
  const lifestyleExtras = buildNutritionLifestyleExtras(
    answers.sliders,
    answers.preference,
  );

  return {
    score,
    band,
    estimate,
    statements,
    advice,
    lifestyleExtras,
    delta,
    proteinMealsPerDay: report.proteinMealsPerDay,
  };
}
