/**
 * Vertaal voedingscheck-antwoorden naar neutrale UI-labels (wat hij koos),
 * zonder band-oordeel ("Aan de lage kant").
 */

import {
  NUTRITION_QUESTIONS,
  type SliderQuestion,
} from "@/data/nutrition/lifescore-questions";
import {
  NUTRIENT_IDS,
  type NutrientId,
} from "@/data/nutrition/intake-reference";
import { evidenceForGap } from "@/data/nutrition/nutrient-evidence-map";

const SLIDER_BY_ID = new Map(
  NUTRITION_QUESTIONS.filter(
    (question): question is SliderQuestion => question.kind === "slider",
  ).map((question) => [question.id, question]),
);

function isNutrientId(value: string): value is NutrientId {
  return (NUTRIENT_IDS as readonly string[]).includes(value);
}

function clampStopIndex(question: SliderQuestion, index: number): number {
  if (!Number.isInteger(index) || index < 0) {
    return question.defaultIndex;
  }
  return Math.min(index, question.stops.length - 1);
}

/** Slider-indices uit `intake_nutrition_log.raw_inputs`. */
export function parseNutritionLogSliders(
  raw: unknown,
): Record<string, number> | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const sliders = (raw as { sliders?: unknown }).sliders;
  if (!sliders || typeof sliders !== "object" || Array.isArray(sliders)) {
    return null;
  }
  const out: Record<string, number> = {};
  for (const [id, value] of Object.entries(sliders as Record<string, unknown>)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      out[id] = value;
    }
  }
  return Object.keys(out).length > 0 ? out : null;
}

/**
 * Primair antwoordlabel voor één nutriënt — het stop-label van de
 * voedingscheck-vraag die bij dit nutriënt hoort (evidence-map).
 */
export function nutritionAnswerLabelForNutrient(
  nutrient: string,
  raw: unknown,
): string | null {
  if (!isNutrientId(nutrient)) {
    return null;
  }
  const sliders = parseNutritionLogSliders(raw);
  if (!sliders) {
    return null;
  }
  const questionId = evidenceForGap(nutrient).primary.questionId;
  const question = SLIDER_BY_ID.get(questionId);
  if (!question) {
    return null;
  }
  const rawIndex = sliders[question.id];
  if (rawIndex === undefined) {
    return null;
  }
  return question.stops[clampStopIndex(question, rawIndex)]?.label ?? null;
}
