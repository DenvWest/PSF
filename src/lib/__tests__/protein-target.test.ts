import { describe, expect, it } from "vitest";
import { computeProteinTarget } from "@/lib/protein-target";

describe("computeProteinTarget", () => {
  it("schaalt met gewicht en hoge trainingsbelasting", () => {
    expect(computeProteinTarget({ weightKg: 80, trainingLoad: 4 })).toEqual({
      perKgLow: 1.6,
      perKgHigh: 1.8,
      gramsLow: 130, // 80 * 1.6 = 128 → 130
      gramsHigh: 145, // 80 * 1.8 = 144 → 145
    });
  });

  it("lage trainingsbelasting → conservatieve range", () => {
    expect(computeProteinTarget({ weightKg: 90, trainingLoad: 1 })).toMatchObject({
      perKgLow: 1.0,
      perKgHigh: 1.2,
    });
  });

  it("matige trainingsbelasting → actieve range", () => {
    expect(computeProteinTarget({ weightKg: 90, trainingLoad: 2 })).toMatchObject({
      perKgLow: 1.2,
      perKgHigh: 1.4,
    });
  });

  it("ontbrekende trainingsbelasting → basis 40+ range", () => {
    expect(computeProteinTarget({ weightKg: 80 })?.perKgLow).toBe(1.0);
  });

  it("weigert ongeldig gewicht", () => {
    expect(computeProteinTarget({ weightKg: 10 })).toBeNull();
    expect(computeProteinTarget({ weightKg: 500 })).toBeNull();
    expect(computeProteinTarget({ weightKg: Number.NaN })).toBeNull();
  });

  it("clampt trainingsbelasting buiten bereik", () => {
    expect(computeProteinTarget({ weightKg: 80, trainingLoad: 9 })?.perKgHigh).toBe(1.8);
  });
});
