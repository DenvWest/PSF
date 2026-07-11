import { describe, expect, it } from "vitest";
import {
  isFishFreeNutritionContext,
  withContextualEstimateLabels,
} from "@/lib/nutrition-estimate-labels";
import type { IntakeEstimate } from "@/lib/nutrition-intake-estimate";

const baseEstimate: IntakeEstimate[] = [
  {
    nutrient: "omega3",
    band: "below",
    referenceLabel: "2–3× vette vis per week",
  },
  {
    nutrient: "protein",
    band: "around",
    referenceLabel: "eiwit verspreid over de dag",
  },
];

describe("isFishFreeNutritionContext", () => {
  it("vegetariër en veganist zijn fish-free", () => {
    expect(isFishFreeNutritionContext("vegetarian", [])).toBe(true);
    expect(isFishFreeNutritionContext("vegan", [])).toBe(true);
  });

  it("vis-allergie is fish-free", () => {
    expect(isFishFreeNutritionContext("none", ["vis"])).toBe(true);
  });

  it("pescotariër zonder allergie niet", () => {
    expect(isFishFreeNutritionContext("pescatarian", [])).toBe(false);
  });
});

describe("withContextualEstimateLabels", () => {
  it("past omega-3 referenceLabel aan in fish-free context", () => {
    const result = withContextualEstimateLabels(baseEstimate, "vegan", []);
    expect(result[0].referenceLabel).toBe("2–3× plantaardige omega-3-bron per week");
    expect(result[1].referenceLabel).toBe(baseEstimate[1].referenceLabel);
  });

  it("laat labels ongewijzigd zonder fish-free context", () => {
    expect(withContextualEstimateLabels(baseEstimate, "none", [])).toEqual(baseEstimate);
  });
});
