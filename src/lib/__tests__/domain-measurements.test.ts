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
  it("never claims a guideline — the thresholds are indicative", () => {
    const values = buildNutritionMeasurementValues([
      { nutrient: "eiwit", band: "below" },
      { nutrient: "omega3", band: "around" },
      { nutrient: "vezels", band: "meets" },
    ]);
    expect(values.every((value) => value.scale === "vuistregel")).toBe(true);
    expect(values.some((value) => /richtlijn|norm/i.test(value.answerLabel))).toBe(false);
  });

  it("collapses around and meets, because the estimate cannot tell them apart", () => {
    const values = buildNutritionMeasurementValues([
      { nutrient: "eiwit", band: "below" },
      { nutrient: "omega3", band: "around" },
      { nutrient: "vezels", band: "meets" },
    ]);
    expect(values.map((value) => value.level)).toEqual([1, 2, 2]);
    expect(values.every((value) => value.levelMax === 2)).toBe(true);
    expect(values[1].answerLabel).toBe(values[2].answerLabel);
  });

  it("reads the band of every logged nutrient", () => {
    const values = buildNutritionMeasurementValues([
      { nutrient: "eiwit", band: "below" },
      { nutrient: "omega3", band: "meets" },
    ]);
    expect(values.map((value) => value.answerLabel)).toEqual([
      "Aan de lage kant",
      "Geen aandachtspunt",
    ]);
  });

  it("skips an entry without a usable band", () => {
    const values = buildNutritionMeasurementValues([
      { nutrient: "eiwit", band: "onbekend" },
      { nutrient: "omega3", band: "around" },
    ]);
    expect(values).toHaveLength(1);
    expect(values[0].answerLabel).toBe("Geen aandachtspunt");
  });

  it("returns nothing when the log carries no estimate", () => {
    expect(buildNutritionMeasurementValues(null)).toEqual([]);
    expect(buildNutritionMeasurementValues(undefined)).toEqual([]);
  });
});
