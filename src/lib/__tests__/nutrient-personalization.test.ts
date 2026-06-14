import { describe, expect, it } from "vitest";
import {
  NUTRIENT_PERSONALIZERS,
  getPersonalizedTarget,
} from "@/lib/nutrient-personalization";

describe("nutrient-personalization", () => {
  it("personaliseert ALLEEN eiwit (discipline: micro's houden vaste RI)", () => {
    expect(Object.keys(NUTRIENT_PERSONALIZERS)).toEqual(["protein"]);
  });

  it("geeft een eiwit-range bij gewicht", () => {
    expect(
      getPersonalizedTarget("protein", { weightKg: 80, trainingLoad: 4 }),
    ).toMatchObject({ perKgLow: 1.6, perKgHigh: 1.8 });
  });

  it("null zonder gewicht", () => {
    expect(getPersonalizedTarget("protein", {})).toBeNull();
  });

  it("vaste-RI-nutriënten hebben geen personalizer", () => {
    expect(getPersonalizedTarget("magnesium", { weightKg: 80 })).toBeNull();
  });
});
