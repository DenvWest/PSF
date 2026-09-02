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
import { isRulesVersionBefore } from "@/lib/rules-version";
import { getVitalityBand, type VitalityBand } from "@/lib/vitality-gauge";

const SLIDER_QUESTIONS: SliderQuestion[] = NUTRITION_QUESTIONS.filter(
  (question): question is SliderQuestion => question.kind === "slider",
);

/**
 * Semver van de **voedingsscore**, los van ESTIMATE_VERSION (die hoort bij de
 * nutriënt-schatting) en los van RULES_VERSION (die hoort bij de
 * Leefstijlcheck-engine). Drie versies omdat het drie engines zijn: dezelfde
 * antwoorden kunnen door de één anders gewogen worden dan door de ander.
 *
 * Bump deze zodra de set sliders of hun gewichten verandert — de score is een
 * gewogen gemiddelde, dus een vraag erbij verandert de noemer en daarmee de
 * uitkomst bij ongewijzigd eetgedrag.
 *
 * 1.0.0: 11 kernsliders (de oorspronkelijke Lifesum-stijl set).
 * 1.1.0: `ultraProcessed` erbij (12 sliders) — scores over deze grens heen
 *        zijn niet vergelijkbaar, zie NUTRITION_SCORE_COMPARABLE_FROM.
 */
export const NUTRITION_SCORE_VERSION = "1.1.0";

/**
 * Vanaf welke versie voedingsscores onderling vergelijkbaar zijn.
 *
 * Staat op 1.1.0 en niet lager: bij de sprong van 11 naar 12 sliders zakt of
 * stijgt de score van iemand die niets aan zijn eten veranderde, puur doordat
 * er een vraag bij kwam. Een meetreeks die daar overheen loopt zou een trend
 * tonen die niet bestaat — precies de deltabug die bij de item-herschaling
 * (RULES_VERSION 1.4.0) drie keer terugkwam.
 */
export const NUTRITION_SCORE_COMPARABLE_FROM = "1.1.0";

/**
 * Zijn twee voedingsscores met elkaar te vergelijken?
 *
 * Een score zonder versie (`null`) komt uit een log van vóór deze versionering
 * en is per definitie op de oude noemer berekend — dus niet vergelijkbaar met
 * een score van nu.
 */
export function isNutritionScoreComparable(
  baselineVersion: string | null,
  currentVersion: string | null,
): boolean {
  if (baselineVersion === null || currentVersion === null) {
    return false;
  }
  if (baselineVersion === currentVersion) {
    return true;
  }
  return (
    !isRulesVersionBefore(baselineVersion, NUTRITION_SCORE_COMPARABLE_FROM) &&
    !isRulesVersionBefore(currentVersion, NUTRITION_SCORE_COMPARABLE_FROM)
  );
}

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
