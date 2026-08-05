import { describe, expect, it } from "vitest";
import {
  hasPlanStepDragChanged,
  hasRoutineDragChanged,
  resolveRetimeFromDrag,
} from "@/lib/agenda-timeline-drag";
import { isValidLocalTime } from "@/lib/account-priority-pref";
import { buildQuarterHourSlots } from "@/lib/agenda-time-picker";
import { minutesToTime } from "@/lib/agenda-timeline";

describe("resolveRetimeFromDrag", () => {
  it("preserves routine block duration when start moves", () => {
    const result = resolveRetimeFromDrag("10:00", "10:45", "14:00");
    expect(result.startTime).toBe("14:00");
    expect(result.endTime).toBe("14:45");
  });

  it("clamps end time within the timeline window without ever reaching 24:00", () => {
    const result = resolveRetimeFromDrag("10:00", "10:30", "23:45");
    expect(result.endTime).toBe("23:45");
    expect(result.startTime).toBe("23:15");
  });

  it("uses at least 15 minutes duration for short blocks", () => {
    const result = resolveRetimeFromDrag("10:00", "10:10", "12:00");
    expect(result.startTime).toBe("12:00");
    expect(result.endTime).toBe("12:15");
  });

  it("never produces a startTime or endTime the server would reject — regression voor B1", () => {
    // Elk kwartierslot van 06:00 tot 23:45 als sleepdoel, met elke duur die
    // in de UI voorkomt: het resultaat moet altijd door isValidLocalTime
    // komen. Vóór de fix leverde een sleep naar 23:45+ een "24:00" op die
    // normalizeLocalTime afwees — stil, want de aanroepers gebruikten `void`.
    const targetSlots = buildQuarterHourSlots();
    const durations = [15, 30, 45, 60, 90, 120];
    for (const nextStart of targetSlots) {
      for (const duration of durations) {
        const result = resolveRetimeFromDrag(
          "10:00",
          minutesToTime(600 + duration),
          nextStart,
        );
        expect(isValidLocalTime(result.startTime)).toBe(true);
        expect(isValidLocalTime(result.endTime)).toBe(true);
      }
    }
  });
});

describe("hasRoutineDragChanged", () => {
  it("detects unchanged times", () => {
    expect(
      hasRoutineDragChanged("10:00", "10:30", {
        startTime: "10:00",
        endTime: "10:30",
      }),
    ).toBe(false);
  });

  it("detects moved start with preserved duration", () => {
    expect(
      hasRoutineDragChanged("10:00", "10:30", {
        startTime: "11:00",
        endTime: "11:30",
      }),
    ).toBe(true);
  });
});

describe("hasPlanStepDragChanged", () => {
  it("only compares start time for plan step drag", () => {
    expect(hasPlanStepDragChanged("09:00", "09:00")).toBe(false);
    expect(hasPlanStepDragChanged("09:00", "09:15")).toBe(true);
  });
});
