import { describe, expect, it } from "vitest";
import {
  buildCheckinMeasurementValues,
  buildNutritionMeasurementValues,
} from "@/lib/domain-measurements";

describe("buildCheckinMeasurementValues — stress", () => {
  it("maps stored answers back to the label he actually picked", () => {
    const values = buildCheckinMeasurementValues("stress", {
      STR_FREQ: 2,
      STR_RCV: 2,
      STR_CHARGE: 3,
    });

    expect(values).toEqual([
      {
        key: "STR_FREQ",
        label: "Spanning",
        answerLabel: "Regelmatig",
        benchmarkLabel: null,
        level: 2,
        levelMax: 4,
        scale: "zelfrapportage",
      },
      {
        key: "STR_RCV",
        label: "Tot rust komen",
        answerLabel: "Stress stapelt op of herstel blijft achterwege",
        benchmarkLabel: null,
        level: 2,
        levelMax: 4,
        scale: "zelfrapportage",
      },
      {
        key: "STR_CHARGE",
        label: "Laatst opgeladen",
        answerLabel: "Afgelopen week",
        benchmarkLabel: null,
        level: 3,
        levelMax: 4,
        scale: "zelfrapportage",
      },
    ]);
  });

  it("keeps the check order, not the storage order", () => {
    const values = buildCheckinMeasurementValues("stress", {
      STR_CHARGE: 4,
      STR_FREQ: 4,
    });
    expect(values.map((value) => value.key)).toEqual(["STR_FREQ", "STR_CHARGE"]);
  });

  it("drops a field the check never wrote instead of inventing a row", () => {
    const values = buildCheckinMeasurementValues("stress", { STR_FREQ: 3 });
    expect(values).toHaveLength(1);
  });

  it("returns nothing for a row without any stress answer", () => {
    expect(buildCheckinMeasurementValues("stress", { grip: 4 })).toEqual([]);
    expect(buildCheckinMeasurementValues("stress", null)).toEqual([]);
  });
});

describe("buildCheckinMeasurementValues — domains without own values", () => {
  it("returns nothing for verbinding, energie and herstel", () => {
    expect(buildCheckinMeasurementValues("verbinding", { anything: 1 })).toEqual([]);
    expect(buildCheckinMeasurementValues("energie", { anything: 1 })).toEqual([]);
    expect(buildCheckinMeasurementValues("herstel", { anything: 1 })).toEqual([]);
  });
});

describe("buildNutritionMeasurementValues", () => {
  const raw = {
    sliders: { vegetables: 2, oilyFish: 1, proteinMeals: 1, daylight: 3 },
  };

  it("names the question he answered, never the nutrient", () => {
    const values = buildNutritionMeasurementValues(raw);
    expect(values.map((value) => value.label)).toEqual([
      "Magnesiumrijke voeding",
      "Vette vis",
      "Eiwitrijke eetmomenten",
      "Buiten in daglicht",
    ]);
    expect(
      values.some((value) => /magnesium$|omega-3|vitamine d|zink|^eiwit$/i.test(value.label)),
    ).toBe(false);
  });

  it("carries his own answer as the cell", () => {
    const values = buildNutritionMeasurementValues(raw);
    expect(values.map((value) => value.answerLabel)).toEqual([
      "2× per dag",
      "1× per week",
      "1× per dag",
      "4–5× per week",
    ]);
  });

  it("gives no position, because the thresholds underneath are proposals", () => {
    const values = buildNutritionMeasurementValues(raw);
    expect(values.every((value) => value.level === null)).toBe(true);
    expect(values.every((value) => value.scale === "zelfrapportage")).toBe(true);
    expect(values.some((value) => /richtlijn|norm|laag|aandachtspunt/i.test(value.answerLabel))).toBe(
      false,
    );
  });

  it("keeps the order of the check, not of the stored JSON", () => {
    const values = buildNutritionMeasurementValues({
      sliders: { daylight: 1, vegetables: 0 },
    });
    expect(values.map((value) => value.key)).toEqual(["vegetables", "daylight"]);
  });

  it("leaves a gap for a question this log never asked", () => {
    const values = buildNutritionMeasurementValues({ sliders: { vegetables: 1 } });
    expect(values).toHaveLength(1);
    expect(values[0].key).toBe("vegetables");
  });

  it("returns nothing when the log carries no answers", () => {
    expect(buildNutritionMeasurementValues(null)).toEqual([]);
    expect(buildNutritionMeasurementValues(undefined)).toEqual([]);
    expect(buildNutritionMeasurementValues({ sliders: {} })).toEqual([]);
    expect(buildNutritionMeasurementValues({ estimate: [{ nutrient: "magnesium", band: "below" }] })).toEqual([]);
  });
});
