import { describe, expect, it } from "vitest";
import {
  buildRecommendationsEligibility,
  canShowSupplementRecommendation,
  canShowSupplementStrip,
  isNutritionLogCompleted,
} from "@/lib/supplement-eligibility";

describe("supplement-eligibility", () => {
  it("isNutritionLogCompleted is false without intake", () => {
    expect(isNutritionLogCompleted(null)).toBe(false);
    expect(isNutritionLogCompleted(undefined)).toBe(false);
    expect(isNutritionLogCompleted({ items: [] })).toBe(false);
  });

  it("isNutritionLogCompleted is true with items", () => {
    expect(isNutritionLogCompleted({ items: [{ label: "Eiwit" }] })).toBe(true);
  });

  it("canShowSupplementStrip requires explicit nutritionLogCompleted", () => {
    expect(canShowSupplementStrip()).toBe(false);
    expect(canShowSupplementStrip({ nutritionLogCompleted: false })).toBe(false);
    expect(canShowSupplementStrip({ nutritionLogCompleted: true })).toBe(true);
  });

  it("canShowSupplementRecommendation gates on log before nutrient gate", () => {
    expect(
      canShowSupplementRecommendation("magnesium", { nutritionLogCompleted: false }),
    ).toBe(false);
    expect(
      canShowSupplementRecommendation("magnesium", { nutritionLogCompleted: true }),
    ).toBe(true);
    expect(
      canShowSupplementRecommendation("protein", { nutritionLogCompleted: true }),
    ).toBe(false);
  });

  it("buildRecommendationsEligibility maps intake snapshot", () => {
    expect(buildRecommendationsEligibility(null)).toEqual({
      nutritionLogCompleted: false,
    });
    expect(
      buildRecommendationsEligibility({ items: [{ label: "Omega-3" }] }),
    ).toEqual({ nutritionLogCompleted: true });
  });
});
