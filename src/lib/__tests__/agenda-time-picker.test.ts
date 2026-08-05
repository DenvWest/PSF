import { describe, expect, it } from "vitest";
import {
  adjustPickerTime,
  buildQuarterHourSlots,
  durationMinutesFromRange,
  endTimeFromStartAndDuration,
  resolvePickerDisplayTime,
} from "@/lib/agenda-time-picker";

describe("buildQuarterHourSlots", () => {
  it("starts at 07:00 and ends at 22:00 in 15-minute steps", () => {
    const slots = buildQuarterHourSlots();
    expect(slots[0]).toBe("07:00");
    expect(slots.at(-1)).toBe("22:00");
    expect(slots).toContain("12:30");
    expect(slots).toContain("18:00");
  });
});

describe("adjustPickerTime", () => {
  it("snaps and clamps within the timeline day", () => {
    expect(adjustPickerTime("12:00", 15)).toBe("12:15");
    expect(adjustPickerTime("12:07", 15)).toBe("12:15");
    expect(adjustPickerTime("07:00", -15)).toBe("07:00");
    expect(adjustPickerTime("22:00", 15)).toBe("22:00");
  });
});

describe("endTimeFromStartAndDuration", () => {
  it("adds duration minutes to start", () => {
    expect(endTimeFromStartAndDuration("18:00", 45)).toBe("18:45");
  });

  it("clamps at timeline end", () => {
    expect(endTimeFromStartAndDuration("21:30", 60)).toBe("22:00");
  });
});

describe("durationMinutesFromRange", () => {
  it("returns exact match when possible", () => {
    expect(durationMinutesFromRange("12:00", "12:30")).toBe(30);
  });

  it("snaps to nearest chip duration", () => {
    expect(durationMinutesFromRange("12:00", "12:20")).toBe(15);
  });
});

describe("resolvePickerDisplayTime", () => {
  it("uses value when set", () => {
    expect(resolvePickerDisplayTime("16:45", "ochtend")).toBe("16:45");
  });

  it("falls back to bucket default", () => {
    expect(resolvePickerDisplayTime(null, "avond")).toBe("19:00");
    expect(resolvePickerDisplayTime(null, "middag")).toBe("14:00");
  });
});
