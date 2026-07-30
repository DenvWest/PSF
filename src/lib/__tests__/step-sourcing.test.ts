import { describe, expect, it } from "vitest";
import { FOOD_SOURCES } from "@/data/nutrition/food-sources";
import { NUTRIENT_IDS } from "@/data/nutrition/intake-reference";
import { PORTION_DEFINITIONS } from "@/data/nutrition/portion-dictionary";
import {
  isOrderable,
  nutrientFromActionKey,
  resolveStepSourcing,
} from "@/lib/step-sourcing";
import type { PlanStep, StepSourcing } from "@/types/lifestyle-plan";

const baseStep: PlanStep = {
  id: "voeding-noten",
  title: "Een handvol noten bij de lunch",
};

describe("resolveStepSourcing", () => {
  it("falls back to self when a step has no sourcing", () => {
    expect(resolveStepSourcing(baseStep)).toEqual({ kind: "self" });
  });

  it("returns the declared sourcing unchanged", () => {
    const sourcing: StepSourcing = {
      kind: "food",
      nutrient: "magnesium",
      sourceKey: "amandelen",
    };
    expect(resolveStepSourcing({ ...baseStep, sourcing })).toEqual(sourcing);
  });
});

describe("isOrderable", () => {
  const cases: StepSourcing[] = [
    { kind: "self" },
    { kind: "food", nutrient: "magnesium", sourceKey: "amandelen" },
    {
      kind: "product",
      nutrient: "magnesium",
      form: "supplement",
      productKey: "voorbeeld-magnesium",
    },
  ];

  it.each(cases)("is false while ORDERING_ENABLED is false (%o)", (sourcing) => {
    expect(isOrderable(sourcing)).toBe(false);
  });
});

describe("nutrientFromActionKey", () => {
  it("derives the nutrient from a voeding:<nutrient>:<slug> key", () => {
    expect(nutrientFromActionKey("voeding:magnesium:spinazie")).toBe("magnesium");
  });

  it("returns null for a key without a nutrient", () => {
    expect(nutrientFromActionKey("noten")).toBeNull();
  });

  it("returns null for other domains, unknown nutrients and missing slugs", () => {
    expect(nutrientFromActionKey("slaap:magnesium:spinazie")).toBeNull();
    expect(nutrientFromActionKey("voeding:vitamine-d:zalm")).toBeNull();
    expect(nutrientFromActionKey("voeding:magnesium:")).toBeNull();
    expect(nutrientFromActionKey("voeding:magnesium")).toBeNull();
  });

  it("accepts every known nutrient id", () => {
    for (const id of NUTRIENT_IDS) {
      expect(nutrientFromActionKey(`voeding:${id}:bron`)).toBe(id);
    }
  });
});

describe("FOOD_SOURCES", () => {
  it("covers every nutrient with at least one source", () => {
    for (const id of NUTRIENT_IDS) {
      expect(FOOD_SOURCES[id].length).toBeGreaterThan(0);
    }
  });

  it("only uses portion groups that exist in PORTION_DEFINITIONS", () => {
    for (const id of NUTRIENT_IDS) {
      for (const source of FOOD_SOURCES[id]) {
        expect(PORTION_DEFINITIONS[source.portionGroup]).toBeDefined();
      }
    }
  });

  it("keeps every key unique within one nutrient", () => {
    for (const id of NUTRIENT_IDS) {
      const keys = FOOD_SOURCES[id].map((source) => source.key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("orders every list by descending amount with nulls last", () => {
    for (const id of NUTRIENT_IDS) {
      const amounts = FOOD_SOURCES[id].map((source) => source.amount);
      const firstNull = amounts.indexOf(null);
      const numeric = firstNull === -1 ? amounts : amounts.slice(0, firstNull);
      expect(numeric).not.toContain(null);
      for (let i = 1; i < numeric.length; i += 1) {
        expect(numeric[i]).toBeLessThanOrEqual(numeric[i - 1] as number);
      }
    }
  });

  it("has no productKey filled yet", () => {
    for (const id of NUTRIENT_IDS) {
      for (const source of FOOD_SOURCES[id]) {
        expect(source.productKey).toBeUndefined();
      }
    }
  });
});
