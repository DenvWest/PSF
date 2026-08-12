import { describe, it, expect } from "vitest";
import {
  NUTRITION_CORE_SLIDER_IDS,
  NUTRITION_FLOW,
  NUTRITION_META_QUESTIONS,
  NUTRITION_REQUIRED_STEP_COUNT,
  nutritionSliderQuestion,
} from "@/data/nutrition/lifescore-questions";

const EXPECTED_FLOW_IDS = [
  "vegetables",
  "fruit",
  "berries",
  "allergies",
  "preference",
  "nutsSeedsLegumes",
  "oilyFish",
  "proteinMeals",
  "meatLegumes",
  "dairy",
  "daylight",
  "wholegrain",
  "sugaryDrinks",
] as const;

describe("NUTRITION_FLOW — 13 kernvragen", () => {
  it("bevat exact 13 vragen in de canon-volgorde", () => {
    expect(NUTRITION_FLOW).toHaveLength(13);
    expect(NUTRITION_FLOW.map((q) => q.id)).toEqual([...EXPECTED_FLOW_IDS]);
  });

  it("required step count = 11 sliders + 2 meta", () => {
    expect(NUTRITION_REQUIRED_STEP_COUNT).toBe(13);
    expect(NUTRITION_REQUIRED_STEP_COUNT).toBe(
      NUTRITION_CORE_SLIDER_IDS.length + NUTRITION_META_QUESTIONS.length,
    );
  });

  it("oilyFish defaultIndex is 0 (Nooit)", () => {
    expect(nutritionSliderQuestion("oilyFish")?.defaultIndex).toBe(0);
  });

  it("alle 13 kernvragen hebben een help-object", () => {
    for (const question of NUTRITION_FLOW) {
      expect(question.help).toBeDefined();
      expect(question.help?.title).toBeTruthy();
      expect(question.help?.body).toBeTruthy();
    }
  });
});
