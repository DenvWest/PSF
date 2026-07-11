import { describe, it, expect } from "vitest";
import { buildNutritionLifestyleExtras } from "@/lib/nutrition-lifestyle-extras";
import {
  LIFESTYLE_EXTRA_COPY,
  SUGARY_DRINKS_HIGH_MAX_INDEX,
  WHOLEGRAIN_LOW_MAX_INDEX,
} from "@/data/nutrition/nutrition-lifestyle-extras";
import { statementHasForbiddenPhrase, FORBIDDEN_STATUS_PHRASES } from "@/lib/nutrition-intake-statements";

describe("buildNutritionLifestyleExtras — fiber trigger", () => {
  it(`wholegrain index ${WHOLEGRAIN_LOW_MAX_INDEX} → fiber extra`, () => {
    const result = buildNutritionLifestyleExtras({ wholegrain: WHOLEGRAIN_LOW_MAX_INDEX }, "none");
    expect(result.some((item) => item.id === "fiber_low_wholegrain")).toBe(true);
  });

  it("wholegrain index 3 → geen fiber extra", () => {
    const result = buildNutritionLifestyleExtras({ wholegrain: 3 }, "none");
    expect(result.some((item) => item.id === "fiber_low_wholegrain")).toBe(false);
  });
});

describe("buildNutritionLifestyleExtras — B12 vegan trigger", () => {
  it("preference vegan → b12 extra", () => {
    const result = buildNutritionLifestyleExtras({ wholegrain: 4 }, "vegan");
    expect(result.some((item) => item.id === "b12_vegan")).toBe(true);
  });

  it("preference none → geen b12 extra", () => {
    const result = buildNutritionLifestyleExtras({ wholegrain: 4 }, "none");
    expect(result.some((item) => item.id === "b12_vegan")).toBe(false);
  });

  it("vegetariër → geen b12 extra (alleen vegan)", () => {
    const result = buildNutritionLifestyleExtras({ wholegrain: 4 }, "vegetarian");
    expect(result.some((item) => item.id === "b12_vegan")).toBe(false);
  });
});

describe("buildNutritionLifestyleExtras — sugar trigger", () => {
  it(`sugaryDrinks index ${SUGARY_DRINKS_HIGH_MAX_INDEX} → sugar extra`, () => {
    const result = buildNutritionLifestyleExtras(
      { sugaryDrinks: SUGARY_DRINKS_HIGH_MAX_INDEX },
      "none",
    );
    expect(result.some((item) => item.id === "sugar_high_signal")).toBe(true);
  });

  it("sugaryDrinks index 5 → geen sugar extra", () => {
    const result = buildNutritionLifestyleExtras({ sugaryDrinks: 5 }, "none");
    expect(result.some((item) => item.id === "sugar_high_signal")).toBe(false);
  });
});

describe("buildNutritionLifestyleExtras — volgorde", () => {
  it("fiber → suiker → b12 bij alle triggers", () => {
    const result = buildNutritionLifestyleExtras(
      { wholegrain: 0, sugaryDrinks: 0 },
      "vegan",
    );
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe("fiber_low_wholegrain");
    expect(result[1].id).toBe("sugar_high_signal");
    expect(result[2].id).toBe("b12_vegan");
  });

  it("fiber vóór b12 bij beide triggers", () => {
    const result = buildNutritionLifestyleExtras({ wholegrain: 0 }, "vegan");
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("fiber_low_wholegrain");
    expect(result[1].id).toBe("b12_vegan");
  });
});

describe("COMPLIANCE: lifestyle extra copy", () => {
  it("geen verboden status-frase in fiber en B12 copy", () => {
    for (const text of Object.values(LIFESTYLE_EXTRA_COPY)) {
      expect(statementHasForbiddenPhrase(text), `"${text}"`).toBe(false);
      const lower = text.toLowerCase();
      for (const phrase of FORBIDDEN_STATUS_PHRASES) {
        expect(lower.includes(phrase.toLowerCase()), `'${phrase}' in "${text}"`).toBe(false);
      }
    }
  });
});
