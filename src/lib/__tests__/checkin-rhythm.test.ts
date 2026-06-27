import { describe, expect, it } from "vitest";
import { computeCheckinRhythm } from "@/lib/checkin-rhythm";
import type { CheckLogEntry } from "@/types/dashboard";

function entry(date: string): CheckLogEntry {
  return {
    seq: 1,
    date,
    priority: "slaap",
    vitality: 60,
  };
}

describe("computeCheckinRhythm", () => {
  it("returns zero rhythm without history", () => {
    expect(computeCheckinRhythm([])).toEqual({
      currentDays: 0,
      longestDays: 0,
    });
  });

  it("counts consecutive days ending today", () => {
    const now = new Date("2026-06-27T12:00:00.000Z");
    const history = [
      entry("2026-06-27"),
      entry("2026-06-26"),
      entry("2026-06-25"),
      entry("2026-06-20"),
    ];

    expect(computeCheckinRhythm(history, now)).toEqual({
      currentDays: 3,
      longestDays: 3,
    });
  });

  it("tracks the longest historical streak", () => {
    const now = new Date("2026-06-27T12:00:00.000Z");
    const history = [
      entry("2026-06-27"),
      entry("2026-06-10"),
      entry("2026-06-09"),
      entry("2026-06-08"),
      entry("2026-06-07"),
    ];

    expect(computeCheckinRhythm(history, now)).toEqual({
      currentDays: 1,
      longestDays: 4,
    });
  });

  it("parses Dutch dashboard dates", () => {
    const now = new Date("2026-06-10T12:00:00.000Z");
    const history = [entry("10 jun 2026"), entry("9 jun 2026")];

    expect(computeCheckinRhythm(history, now)).toEqual({
      currentDays: 2,
      longestDays: 2,
    });
  });
});
