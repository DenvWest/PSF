import { describe, expect, it } from "vitest";
import {
  isValidTimeRange,
  normalizeCreateBlockInput,
  validateCreateBlockInput,
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
