import { describe, it, expect } from "vitest";
import {
  spreadClassFor,
  spreadBandPer100g,
  spreadBandForPortion,
} from "@/lib/nutrition-spread";
import type { NutrientValue } from "@/data/nutrition/food-sources";

const usdaValue = (value: number, observed?: NutrientValue["observed"]): NutrientValue => ({
  value,
  unit: "mg",
  per: "100g",
  source: { origin: "usda", ref: "12345", edition: "SR Legacy" },
  ...(observed ? { observed } : {}),
});

describe("spreadClassFor — de klasse volgt de voedselgroep", () => {
  it("noemt vlees, ei en zuivel dierlijk", () => {
    expect(spreadClassFor("protein", "vlees", "biefstuk")).toBe("dier");
    expect(spreadClassFor("zinc", "eieren", "eieren")).toBe("dier");
    expect(spreadClassFor("protein", "zuivel", "jonge-kaas")).toBe("dier");
  });

  it("splitst vis in gekweekt en wild", () => {
    expect(spreadClassFor("omega3", "vis", "zalm-gekweekt")).toBe("visGekweekt");
    expect(spreadClassFor("omega3", "vis", "haring")).toBe("visWild");
  });

  it("noemt de rest plantaardig", () => {
    expect(spreadClassFor("magnesium", "noten", "amandelen")).toBe("plant");
    expect(spreadClassFor("magnesium", "peulvruchten", "linzen")).toBe("plant");
  });

  it("kent 'verrijkt' alleen bij vitamine D, niet bij de mineralen van datzelfde product", () => {
    expect(spreadClassFor("vitamin_d", "vetten", "halvarine")).toBe("verrijkt");
    // De eiwit-/mineraalgehaltes van een verrijkt product zijn wél biologisch.
    expect(spreadClassFor("magnesium", "vetten", "halvarine")).toBe("plant");
  });
});

describe("observed wint van de klassenband", () => {
  it("gebruikt de waargenomen min/max als de bron ze draagt", () => {
    const value = usdaValue(79, { min: 60, max: 110, median: 82, samples: 12 });
    const band = spreadBandPer100g(value, "magnesium", "groente", "spinazie-rauw");
    expect(band.basis).toBe("observed");
    expect(band.lo).toBe(60);
    expect(band.hi).toBe(110);
    expect(band.point).toBe(82);
  });

  it("valt terug op de klassenband zonder observed", () => {
    const value = usdaValue(79);
    const band = spreadBandPer100g(value, "magnesium", "groente", "spinazie-rauw");
    expect(band.basis).toBe("band");
    // Plantaardig mineraal: ×0,60–1,70 uit §1.7.
    expect(band.lo).toBeCloseTo(79 * 0.6, 5);
    expect(band.hi).toBeCloseTo(79 * 1.7, 5);
    expect(band.point).toBe(79);
  });

  it("behandelt één monster niet als spreiding — dan wint de band alsnog", () => {
    const value = usdaValue(79, { min: 79, max: 79, median: 79, samples: 1 });
    const band = spreadBandPer100g(value, "magnesium", "groente", "spinazie-rauw");
    expect(band.basis).toBe("band");
  });
});

describe("de klassenband is asymmetrisch waar de bron dat is", () => {
  it("houdt de verrijkte-vitamine-D-band strak (×0,95–1,05)", () => {
    const value = usdaValue(7.5);
    const band = spreadBandPer100g(value, "vitamin_d", "vetten", "halvarine");
    expect(band.lo).toBeCloseTo(7.5 * 0.95, 5);
    expect(band.hi).toBeCloseTo(7.5 * 1.05, 5);
  });

  it("houdt wilde vis-vitamine-D breed en asymmetrisch (×0,50–2,00)", () => {
    const value = usdaValue(19);
    const band = spreadBandPer100g(value, "vitamin_d", "vis", "haring");
    expect(band.lo).toBeCloseTo(19 * 0.5, 5);
    expect(band.hi).toBeCloseTo(19 * 2.0, 5);
  });
});

describe("spreadBandForPortion — de portie-variant", () => {
  it("rekent de band om naar de portie en rondt af op één decimaal", () => {
    const value = usdaValue(79);
    const band = spreadBandForPortion(value, "magnesium", "groente", "spinazie-rauw", 75);
    expect(band).not.toBeNull();
    // 79 × 0,6 × 0,75 = 35,55 → 35,6 ; 79 × 1,7 × 0,75 = 100,725 → 100,7
    expect(band?.lo).toBe(35.6);
    expect(band?.hi).toBe(100.7);
    expect(band?.point).toBe(59.3);
  });

  it("weigert een onzinnige portie in plaats van een getal te verzinnen", () => {
    const value = usdaValue(79);
    expect(spreadBandForPortion(value, "magnesium", "groente", "x", 0)).toBeNull();
    expect(spreadBandForPortion(value, "magnesium", "groente", "x", -10)).toBeNull();
    expect(spreadBandForPortion(value, "magnesium", "groente", "x", NaN)).toBeNull();
  });

  it("draagt de observed-basis mee naar de portie-band", () => {
    const value = usdaValue(79, { min: 60, max: 110, median: 82, samples: 12 });
    const band = spreadBandForPortion(value, "magnesium", "groente", "spinazie-rauw", 100);
    expect(band?.basis).toBe("observed");
    expect(band?.lo).toBe(60);
    expect(band?.hi).toBe(110);
  });
});
