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
import {
  NUTRITION_EVIDENCE_BY_ID,
  type NutritionQuestionId,
} from "@/data/nutrition/nutrition-question-evidence";

/** In flow-volgorde: de reeks leest zoals de check hem stelde. */
const SLIDER_QUESTIONS = NUTRITION_QUESTIONS.filter(
  (question): question is SliderQuestion => question.kind === "slider",
);

const SLIDER_BY_ID = new Map(
  SLIDER_QUESTIONS.map((question) => [question.id, question]),
);

/**
 * Korte vraagnaam voor vragen zonder onderbouwings-titel. De overige negen
 * lenen die titel, zodat er maar één plek is waar een vraag zijn korte naam
 * krijgt.
 */
const EXTRA_SLIDER_LABEL: Record<string, string> = {
  fruit: "Fruit",
  berries: "Bessen",
};

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

/** Korte naam van de vraag zelf — nooit die van een nutriënt. */
export function nutritionSliderShortLabel(id: string): string | null {
  const evidence = NUTRITION_EVIDENCE_BY_ID[id as NutritionQuestionId];
  return evidence?.title ?? EXTRA_SLIDER_LABEL[id] ?? null;
}

export type NutritionAnswerRow = {
  key: string;
  label: string;
  answerLabel: string;
};

/**
 * Wat hij bij deze voedingscheck koos, per vraag, in de volgorde van de
 * vragenset — niet in de opslagvolgorde van de JSON. Een vraag die deze log
 * niet stelde levert geen rij; dat is een gat in de reeks, geen oordeel.
 */
export function buildNutritionAnswerRows(raw: unknown): NutritionAnswerRow[] {
  const sliders = parseNutritionLogSliders(raw);
  if (!sliders) {
    return [];
  }
  const rows: NutritionAnswerRow[] = [];
  for (const question of SLIDER_QUESTIONS) {
    const rawIndex = sliders[question.id];
    if (rawIndex === undefined) {
      continue;
    }
    const label = nutritionSliderShortLabel(question.id);
    const answerLabel = question.stops[clampStopIndex(question, rawIndex)]?.label;
    if (!label || !answerLabel) {
      continue;
    }
    rows.push({ key: question.id, label, answerLabel });
  }
  return rows;
}
