import { describe, expect, it } from "vitest";
import {
  compareNutritionEstimates,
  deltaStatementFor,
  type NutrientDelta,
} from "@/lib/nutrition-delta";
import { statementHasForbiddenPhrase } from "@/lib/nutrition-intake-statements";
import type { IntakeBand, IntakeEstimate } from "@/lib/nutrition-intake-estimate";
import type { NutrientId } from "@/data/nutrition/intake-reference";

function makeEstimate(nutrient: NutrientId, band: IntakeBand): IntakeEstimate {
  return { nutrient, band, referenceLabel: "test" };
}

describe("compareNutritionEstimates", () => {
  it("below → around = improved", () => {
    const prev = [makeEstimate("omega3", "below")];
    const curr = [makeEstimate("omega3", "around")];
    const result = compareNutritionEstimates(prev, curr);
    expect(result).toHaveLength(1);
    expect(result[0].direction).toBe("improved");
    expect(result[0].from).toBe("below");
    expect(result[0].to).toBe("around");
  });

  it("below → meets = improved", () => {
    const prev = [makeEstimate("magnesium", "below")];
    const curr = [makeEstimate("magnesium", "meets")];
    const [d] = compareNutritionEstimates(prev, curr);
    expect(d.direction).toBe("improved");
  });

  it("meets → below = worsened", () => {
    const prev = [makeEstimate("vitamin_d", "meets")];
    const curr = [makeEstimate("vitamin_d", "below")];
    const [d] = compareNutritionEstimates(prev, curr);
    expect(d.direction).toBe("worsened");
  });

  it("around → below = worsened", () => {
    const prev = [makeEstimate("zinc", "around")];
    const curr = [makeEstimate("zinc", "below")];
    const [d] = compareNutritionEstimates(prev, curr);
    expect(d.direction).toBe("worsened");
  });

  it("around → around = unchanged", () => {
    const prev = [makeEstimate("protein", "around")];
    const curr = [makeEstimate("protein", "around")];
    const [d] = compareNutritionEstimates(prev, curr);
    expect(d.direction).toBe("unchanged");
  });

  it("nutriënt alleen in prev → niet in output", () => {
    const prev = [makeEstimate("omega3", "below"), makeEstimate("zinc", "meets")];
    const curr = [makeEstimate("omega3", "around")];
    const result = compareNutritionEstimates(prev, curr);
    expect(result).toHaveLength(1);
    expect(result[0].nutrient).toBe("omega3");
  });

  it("nutriënt alleen in curr → niet in output", () => {
    const prev = [makeEstimate("omega3", "below")];
    const curr = [makeEstimate("omega3", "around"), makeEstimate("zinc", "below")];
    const result = compareNutritionEstimates(prev, curr);
    expect(result).toHaveLength(1);
    expect(result[0].nutrient).toBe("omega3");
  });

  it("lege lijsten → lege output", () => {
    expect(compareNutritionEstimates([], [])).toHaveLength(0);
  });

  it("meerdere nutriënten worden alle vergeleken", () => {
    const nutrients: NutrientId[] = ["protein", "omega3", "magnesium", "vitamin_d", "zinc"];
    const prev = nutrients.map((n) => makeEstimate(n, "below"));
    const curr = nutrients.map((n) => makeEstimate(n, "meets"));
    const result = compareNutritionEstimates(prev, curr);
    expect(result).toHaveLength(5);
    expect(result.every((d) => d.direction === "improved")).toBe(true);
  });
});

describe("deltaStatementFor — compliance property", () => {
  const bands: IntakeBand[] = ["below", "around", "meets"];
  const nutrients: NutrientId[] = ["protein", "omega3", "magnesium", "vitamin_d", "zinc"];

  for (const nutrient of nutrients) {
    for (const from of bands) {
      for (const to of bands) {
        it(`${nutrient} ${from}→${to}: geen verboden statuswoorden`, () => {
          const prev = [makeEstimate(nutrient, from)];
          const curr = [makeEstimate(nutrient, to)];
          const [delta] = compareNutritionEstimates(prev, curr);

          const d: NutrientDelta = delta ?? {
            nutrient,
            from,
            to,
            direction: from === to ? "unchanged" : to > from ? "improved" : "worsened",
          };

          const statement = deltaStatementFor(d);
          expect(statement.length).toBeGreaterThan(0);
          expect(statementHasForbiddenPhrase(statement)).toBe(false);
        });
      }
    }
  }
});
