import { describe, expect, it } from "vitest";
import { isGeldigPercentage, isGeldigeCalorieen } from "@/lib/account-macro-doelen";

describe("validatie", () => {
  it("begrenst een calorierichtlijn tussen 500 en 6000 kcal", () => {
    expect(isGeldigeCalorieen(500)).toBe(true);
    expect(isGeldigeCalorieen(6000)).toBe(true);
    expect(isGeldigeCalorieen(499)).toBe(false);
    expect(isGeldigeCalorieen(6001)).toBe(false);
    expect(isGeldigeCalorieen(2200.5)).toBe(false);
    expect(isGeldigeCalorieen("2200")).toBe(false);
  });

  it("accepteert alleen een heel percentage tussen 0 en 100", () => {
    expect(isGeldigPercentage(0)).toBe(true);
    expect(isGeldigPercentage(100)).toBe(true);
    expect(isGeldigPercentage(50)).toBe(true);
    expect(isGeldigPercentage(-1)).toBe(false);
    expect(isGeldigPercentage(101)).toBe(false);
    expect(isGeldigPercentage(50.5)).toBe(false);
  });
});
