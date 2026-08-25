import { describe, expect, it } from "vitest";
import {
  nutritionAnswerLabelForNutrient,
  parseNutritionLogSliders,
} from "@/lib/nutrition-answer-labels";

describe("parseNutritionLogSliders", () => {
  it("reads slider indices from raw_inputs", () => {
    expect(
      parseNutritionLogSliders({
        sliders: { proteinMeals: 1, oilyFish: 2 },
        report: { proteinMealsPerDay: 1 },
      }),
    ).toEqual({ proteinMeals: 1, oilyFish: 2 });
  });

  it("returns null without usable sliders", () => {
    expect(parseNutritionLogSliders(null)).toBeNull();
    expect(parseNutritionLogSliders({})).toBeNull();
    expect(parseNutritionLogSliders({ sliders: {} })).toBeNull();
  });
});

describe("nutritionAnswerLabelForNutrient", () => {
  const raw = {
    sliders: {
      proteinMeals: 1,
      oilyFish: 0,
      vegetables: 2,
      daylight: 3,
      meatLegumes: 2,
    },
  };

  it("maps protein to the proteinMeals stop label", () => {
    expect(nutritionAnswerLabelForNutrient("protein", raw)).toBe("1× per dag");
  });

  it("maps omega3 to the oilyFish stop label", () => {
    expect(nutritionAnswerLabelForNutrient("omega3", raw)).toBe("Nooit");
  });

  it("maps magnesium to vegetables", () => {
    expect(nutritionAnswerLabelForNutrient("magnesium", raw)).toBe("2× per dag");
  });

  it("maps vitamin_d to daylight", () => {
    expect(nutritionAnswerLabelForNutrient("vitamin_d", raw)).toBe("4–5× per week");
  });

  it("maps zinc to meatLegumes", () => {
    expect(nutritionAnswerLabelForNutrient("zinc", raw)).toBe("2× per dag");
  });

  it("returns null for unknown nutrient or missing slider", () => {
    expect(nutritionAnswerLabelForNutrient("eiwit", raw)).toBeNull();
    expect(nutritionAnswerLabelForNutrient("protein", { sliders: {} })).toBeNull();
    expect(nutritionAnswerLabelForNutrient("protein", null)).toBeNull();
  });
});
