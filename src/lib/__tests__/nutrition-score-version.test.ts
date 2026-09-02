import { describe, expect, it } from "vitest";
import { NUTRITION_CORE_SLIDER_IDS } from "@/data/nutrition/lifescore-questions";
import {
  computeNutritionScore,
  isNutritionScoreComparable,
  NUTRITION_SCORE_COMPARABLE_FROM,
  NUTRITION_SCORE_VERSION,
} from "@/lib/nutrition-score";

describe("voedingsscore-versionering", () => {
  it("staat op de versie waarin ultraProcessed erbij kwam", () => {
    expect(NUTRITION_SCORE_VERSION).toBe("1.1.0");
    expect(NUTRITION_SCORE_COMPARABLE_FROM).toBe("1.1.0");
  });

  it("telt 12 kernsliders (11 + ultraProcessed)", () => {
    expect(NUTRITION_CORE_SLIDER_IDS).toHaveLength(12);
  });

  it("noemt scores zonder versie niet vergelijkbaar", () => {
    // Logs van vóór de versionering draaiden op 11 sliders; hun noemer verschilt.
    expect(isNutritionScoreComparable(null, NUTRITION_SCORE_VERSION)).toBe(false);
    expect(isNutritionScoreComparable(NUTRITION_SCORE_VERSION, null)).toBe(false);
    expect(isNutritionScoreComparable(null, null)).toBe(false);
  });

  it("noemt scores van vóór de grens niet vergelijkbaar", () => {
    expect(isNutritionScoreComparable("1.0.0", "1.1.0")).toBe(false);
    expect(isNutritionScoreComparable("1.1.0", "1.0.0")).toBe(false);
  });

  it("noemt scores vanaf de grens wel vergelijkbaar", () => {
    expect(isNutritionScoreComparable("1.1.0", "1.1.0")).toBe(true);
    expect(isNutritionScoreComparable("1.1.0", "1.2.0")).toBe(true);
  });

  it("blijft binnen 0-100 en negeert onbekende sliders", () => {
    const alles = Object.fromEntries(NUTRITION_CORE_SLIDER_IDS.map((id) => [id, 0]));
    const score = computeNutritionScore({ ...alles, bestaatNiet: 3 });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("laat de nieuwe vraag de score echt bewegen", () => {
    // Zonder dit zou de bump onnodig zijn — en mét een score die niet beweegt
    // zou de vraag geen effect hebben op wat de gebruiker ziet.
    const basis = Object.fromEntries(NUTRITION_CORE_SLIDER_IDS.map((id) => [id, 2]));
    const zonder = { ...basis };
    delete (zonder as Record<string, number>).ultraProcessed;
    expect(computeNutritionScore({ ...basis, ultraProcessed: 0 })).not.toBe(
      computeNutritionScore({ ...basis, ultraProcessed: 7 }),
    );
    expect(computeNutritionScore(zonder)).not.toBe(computeNutritionScore(basis));
  });
});
