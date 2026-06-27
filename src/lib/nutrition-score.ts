/**
 * Punt-gebaseerde voeding-score uit de Lifesum-stijl slider-antwoorden.
 *
 * - score (0–100): gewogen gemiddelde van de wenselijkheid (`weight`) van elke
 *   gekozen slider-stop. Puur en deterministisch — dezelfde input, dezelfde score.
 * - report: vult de bestaande NutritionSelfReport zodat de nutriënten-inname-engine
 *   (estimateNutritionIntake) ongewijzigd blijft werken als detail-laag.
 *
 * Geen medische claims; de score is een reflectie van zelf-gerapporteerde frequentie.
 */

import {
  NUTRITION_QUESTIONS,
  type SliderQuestion,
} from "@/data/nutrition/lifescore-questions";
import type { NutritionSelfReport } from "@/lib/nutrition-intake-estimate";
import { getVitalityBand, type VitalityBand } from "@/lib/vitality-gauge";

const SLIDER_QUESTIONS: SliderQuestion[] = NUTRITION_QUESTIONS.filter(
  (question): question is SliderQuestion => question.kind === "slider",
);

export interface NutritionScoreResult {
  score: number;
  band: VitalityBand;
}

function clampIndex(question: SliderQuestion, index: number): number {
  if (!Number.isInteger(index) || index < 0) {
    return question.defaultIndex;
  }
  return Math.min(index, question.stops.length - 1);
}

/** Voeding-score 0–100 uit slider-indices (id → gekozen stop-index). */
export function computeNutritionScore(sliders: Record<string, number>): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const question of SLIDER_QUESTIONS) {
    const raw = sliders[question.id];
    if (raw === undefined) {
      continue;
    }
    const stop = question.stops[clampIndex(question, raw)];
    const questionWeight = question.weight ?? 1;
    weightedSum += stop.weight * questionWeight;
    totalWeight += questionWeight;
  }

  if (totalWeight === 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((weightedSum / totalWeight) * 100)));
}

export function nutritionScoreResult(
  sliders: Record<string, number>,
): NutritionScoreResult {
  const score = computeNutritionScore(sliders);
  return { score, band: getVitalityBand(score) };
}

/** Bouw een NutritionSelfReport uit de slider-antwoorden voor de nutriënten-engine. */
export function nutritionReportFromAnswers(
  sliders: Record<string, number>,
): NutritionSelfReport {
  const report: NutritionSelfReport = {};

  for (const question of SLIDER_QUESTIONS) {
    const raw = sliders[question.id];
    if (raw === undefined) {
      continue;
    }
    const stop = question.stops[clampIndex(question, raw)];
    if (stop.report) {
      Object.assign(report, stop.report);
    }
  }

  return report;
}
