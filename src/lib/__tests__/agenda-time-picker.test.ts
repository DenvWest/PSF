import { describe, expect, it } from "vitest";
import {
  adjustDurationMinutes,
  adjustPickerTime,
  buildQuarterHourSlots,
  durationMinutesFromRange,
  endTimeFromStartAndDuration,
  MAX_DURATION_MINUTES,
  MIN_DURATION_MINUTES,
  resolveNowPickerTime,
  resolvePickerDisplayTime,
} from "@/lib/agenda-time-picker";

describe("buildQuarterHourSlots", () => {
  it("starts at 06:00 and ends at 24:00 in 15-minute steps", () => {
    const slots = buildQuarterHourSlots();
    expect(slots[0]).toBe("06:00");
    expect(slots.at(-1)).toBe("24:00");
    expect(slots).toContain("12:30");
    expect(slots).toContain("18:00");
  });
});

describe("adjustPickerTime", () => {
  it("snaps and clamps within the timeline day", () => {
    expect(adjustPickerTime("12:00", 15)).toBe("12:15");
    expect(adjustPickerTime("12:07", 15)).toBe("12:15");
    expect(adjustPickerTime("06:00", -15)).toBe("06:00");
    expect(adjustPickerTime("24:00", 15)).toBe("24:00");
  });
});

describe("endTimeFromStartAndDuration", () => {
  it("adds duration minutes to start", () => {
    expect(endTimeFromStartAndDuration("18:00", 45)).toBe("18:45");
  });

  it("clamps at timeline end", () => {
    expect(endTimeFromStartAndDuration("23:30", 60)).toBe("24:00");
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

describe("adjustDurationMinutes", () => {
  it("steps by 15 minutes and clamps between 15 and 120", () => {
    expect(adjustDurationMinutes(30, 15)).toBe(45);
    expect(adjustDurationMinutes(15, -15)).toBe(MIN_DURATION_MINUTES);
    expect(adjustDurationMinutes(120, 15)).toBe(MAX_DURATION_MINUTES);
    expect(adjustDurationMinutes(22, 15)).toBe(30);
  });
});

describe("resolveNowPickerTime", () => {
  it("snaps current Amsterdam time to quarter hours", () => {
    const summerNoon = new Date("2026-08-04T10:08:00.000Z");
    expect(resolveNowPickerTime(summerNoon)).toBe("12:15");
  });
});
