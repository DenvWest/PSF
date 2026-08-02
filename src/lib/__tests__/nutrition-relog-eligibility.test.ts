import { describe, expect, it } from "vitest";
import {
  daysSinceIsoDate,
  isNutritionRelogDue,
  NUTRITION_RELOG_DAYS,
} from "@/lib/nutrition-relog-eligibility";

describe("nutrition-relog-eligibility", () => {
  const now = Date.parse("2026-08-02T12:00:00.000Z");

  it("returns false without a last log date", () => {
    expect(isNutritionRelogDue(null, now)).toBe(false);
    expect(isNutritionRelogDue(undefined, now)).toBe(false);
  });

  it("returns false before the relog threshold", () => {
    const recent = "2026-07-25T12:00:00.000Z";
    expect(daysSinceIsoDate(recent, now)).toBe(8);
    expect(isNutritionRelogDue(recent, now)).toBe(false);
  });

  it("returns true on and after the relog threshold", () => {
    const due = "2026-07-19T12:00:00.000Z";
    expect(daysSinceIsoDate(due, now)).toBe(NUTRITION_RELOG_DAYS);
    expect(isNutritionRelogDue(due, now)).toBe(true);
  });
});
