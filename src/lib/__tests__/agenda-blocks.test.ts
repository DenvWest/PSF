import { describe, expect, it } from "vitest";
import {
  isValidTimeRange,
  normalizeCreateBlockInput,
  validateCreateBlockInput,
  validateUpdateBlockInput,
} from "@/lib/agenda-blocks";

describe("agenda block validation", () => {
  it("normalizes single-digit hour times", () => {
    const normalized = normalizeCreateBlockInput({
      date: "2026-07-19",
      categoryId: "water",
      title: "Water drinken",
      startTime: "9:00",
      endTime: "9:30",
    });

    expect(normalized).toEqual({
      date: "2026-07-19",
      categoryId: "water",
      title: "Water drinken",
      startTime: "09:00",
      endTime: "09:30",
    });
  });

  it("accepts normalized time ranges", () => {
    expect(isValidTimeRange("09:00", "09:30")).toBe(true);
    expect(isValidTimeRange("09:30", "09:00")).toBe(false);
  });

  it("returns a clear validation error for invalid titles", () => {
    expect(
      validateCreateBlockInput({
        date: "2026-07-19",
        categoryId: "water",
        title: "   ",
        startTime: "11:00",
        endTime: "11:30",
      }),
    ).toBe("Ongeldige titel.");
  });
});

describe("validateUpdateBlockInput — verplaatsen", () => {
  it("accepteert een retime binnen dezelfde dag", () => {
    expect(
      validateUpdateBlockInput({ startTime: "18:00", endTime: "18:45" }),
    ).toBeNull();
  });

  it("accepteert een verplaatsing naar een andere dag", () => {
    expect(
      validateUpdateBlockInput({
        date: "2026-08-19",
        startTime: "07:15",
        endTime: "07:45",
      }),
    ).toBeNull();
  });

  it("weigert een ongeldige datum", () => {
    expect(validateUpdateBlockInput({ date: "19-08-2026" })).toBe("Ongeldige datum.");
    expect(validateUpdateBlockInput({ date: "" })).toBe("Ongeldige datum.");
  });

  it("weigert een omgekeerd tijdvenster", () => {
    expect(
      validateUpdateBlockInput({ startTime: "18:45", endTime: "18:00" }),
    ).toBe("Ongeldig tijdvenster.");
  });
});
