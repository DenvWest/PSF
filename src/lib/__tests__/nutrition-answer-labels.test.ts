import { describe, expect, it } from "vitest";
import {
  buildNutritionAnswerRows,
  nutritionAnswerLabelForNutrient,
  nutritionSliderShortLabel,
  parseNutritionLogSliders,
} from "@/lib/nutrition-answer-labels";
import {
  NUTRITION_QUESTIONS,
  type SliderQuestion,
} from "@/data/nutrition/lifescore-questions";

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

describe("buildNutritionAnswerRows", () => {
  it("gives every slider a short question name, so no row falls back to its id", () => {
    const sliders = NUTRITION_QUESTIONS.filter(
      (question): question is SliderQuestion => question.kind === "slider",
    );
    const zonderLabel = sliders
      .map((question) => question.id)
      .filter((id) => nutritionSliderShortLabel(id) === null);
    expect(zonderLabel).toEqual([]);
  });

  it("reads the answer he picked, per question", () => {
    expect(buildNutritionAnswerRows({ sliders: { oilyFish: 2 } })).toEqual([
      { key: "oilyFish", label: "Vette vis", answerLabel: "2× per week" },
    ]);
  });

  it("falls back to the default stop for an index the question cannot carry", () => {
    const rows = buildNutritionAnswerRows({ sliders: { oilyFish: 99 } });
    expect(rows[0].answerLabel).toBe("5× of meer");
  });

  it("returns nothing without usable sliders", () => {
    expect(buildNutritionAnswerRows(null)).toEqual([]);
    expect(buildNutritionAnswerRows({ sliders: { onbekend: 1 } })).toEqual([]);
  });
});
