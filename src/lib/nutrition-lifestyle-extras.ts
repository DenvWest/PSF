import {
  LIFESTYLE_EXTRA_COPY,
  type LifestyleExtraId,
  SUGARY_DRINKS_HIGH_MAX_INDEX,
  WHOLEGRAIN_LOW_MAX_INDEX,
} from "@/data/nutrition/nutrition-lifestyle-extras";
import { nutritionSliderQuestion } from "@/data/nutrition/lifescore-questions";

export type LifestyleExtraReason = "score_signal" | "preference";

export type LifestyleExtra = {
  id: LifestyleExtraId;
  priority: 0;
  text: string;
  reason: LifestyleExtraReason;
};

function sliderIndex(sliders: Record<string, number>, id: string): number {
  const question = nutritionSliderQuestion(id);
  if (!question) {
    return Number.MAX_SAFE_INTEGER;
  }
  const raw = sliders[id] ?? question.defaultIndex;
  return Math.min(Math.max(0, raw), question.stops.length - 1);
}

/**
 * Leefstijl-only extras — geen nutriënt-band, geen supplement-gate.
 * Volgorde: fiber → suiker/energie → B12 (voorkeur).
 */
export function buildNutritionLifestyleExtras(
  sliders: Record<string, number>,
  preference: string,
): LifestyleExtra[] {
  const items: LifestyleExtra[] = [];

  if (sliderIndex(sliders, "wholegrain") <= WHOLEGRAIN_LOW_MAX_INDEX) {
    items.push({
      id: "fiber_low_wholegrain",
      priority: 0,
      text: LIFESTYLE_EXTRA_COPY.fiber_low_wholegrain,
      reason: "score_signal",
    });
  }

  if (sliderIndex(sliders, "sugaryDrinks") <= SUGARY_DRINKS_HIGH_MAX_INDEX) {
    items.push({
      id: "sugar_high_signal",
      priority: 0,
      text: LIFESTYLE_EXTRA_COPY.sugar_high_signal,
      reason: "score_signal",
    });
  }

  if (preference === "vegan") {
    items.push({
      id: "b12_vegan",
      priority: 0,
      text: LIFESTYLE_EXTRA_COPY.b12_vegan,
      reason: "preference",
    });
  }

  return items;
}
