import { describe, expect, it } from "vitest";
import { buildNutritionSufficiency } from "@/lib/nutrition-sufficiency";

describe("buildNutritionSufficiency", () => {
  it("markeert winst bij een insufficient band en eiwitcontext bij training", () => {
    const summary = buildNutritionSufficiency({
      intakeItems: [
        { nutrient: "protein", band: "below" },
        { nutrient: "omega3", band: "meets" },
        { nutrient: "magnesium", band: "around" },
        { nutrient: "vitamin_d", band: "meets" },
        { nutrient: "zinc", band: "meets" },
      ],
      routes: [],
      contribution: [],
      personalization: {
        weightKg: 80,
        trainingLoad: 4,
        proteinTarget: { gramsLow: 100, gramsHigh: 120 },
        ageRange: "45-54",
      },
    });

    expect(summary.layerState).toBe("winst");
    expect(summary.focusNutrients).toContain("protein");
    expect(summary.trainingLoadLabel).toMatch(/hoge trainingsbelasting/i);
    const protein = summary.nutrients.find((item) => item.nutrient === "protein");
    expect(protein?.contextLine).toMatch(/100–120 g eiwit/i);
  });

  it("zet laag op ok als alle banden meets zijn", () => {
    const summary = buildNutritionSufficiency({
      intakeItems: [
        { nutrient: "protein", band: "meets" },
        { nutrient: "omega3", band: "meets" },
        { nutrient: "magnesium", band: "meets" },
        { nutrient: "vitamin_d", band: "meets" },
        { nutrient: "zinc", band: "meets" },
      ],
      routes: [],
      contribution: [],
      personalization: {
        weightKg: null,
        trainingLoad: undefined,
        proteinTarget: null,
        ageRange: null,
      },
    });
    expect(summary.layerState).toBe("ok");
    expect(summary.focusNutrients).toEqual([]);
  });
});
