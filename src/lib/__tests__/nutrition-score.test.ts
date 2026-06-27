import { describe, expect, it } from "vitest";
import {
  computeNutritionScore,
  nutritionReportFromAnswers,
  nutritionScoreResult,
} from "@/lib/nutrition-score";
import { NUTRITION_QUESTIONS } from "@/data/nutrition/lifescore-questions";

function defaultSliders(): Record<string, number> {
  const sliders: Record<string, number> = {};
  for (const question of NUTRITION_QUESTIONS) {
    if (question.kind === "slider") {
      sliders[question.id] = question.defaultIndex;
    }
  }
  return sliders;
}

describe("computeNutritionScore", () => {
  it("returns 0–100 for default slider positions", () => {
    const score = computeNutritionScore(defaultSliders());
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("scores higher when positive habits move to max stops", () => {
    const baseline = computeNutritionScore(defaultSliders());
    const sliders = defaultSliders();
    sliders.fruit = 7;
    sliders.berries = 7;
    sliders.oilyFish = 5;
    const improved = computeNutritionScore(sliders);
    expect(improved).toBeGreaterThan(baseline);
  });

  it("scores lower when sugary drinks increase", () => {
    const baseline = computeNutritionScore(defaultSliders());
    const sliders = defaultSliders();
    sliders.sugaryDrinks = 7;
    const worse = computeNutritionScore(sliders);
    expect(worse).toBeLessThan(baseline);
  });
});

describe("nutritionReportFromAnswers", () => {
  it("maps slider stops to NutritionSelfReport fields", () => {
    const sliders = defaultSliders();
    sliders.oilyFish = 3;
    sliders.proteinMeals = 2;
    const report = nutritionReportFromAnswers(sliders);
    expect(report.oilyFishPerWeek).toBe(3);
    expect(report.proteinMealsPerDay).toBe(2);
  });
});

describe("nutritionScoreResult", () => {
  it("returns a vitality band for the score", () => {
    const result = nutritionScoreResult(defaultSliders());
    expect(result.band.id).toBeTruthy();
    expect(result.band.label.length).toBeGreaterThan(0);
  });
});
