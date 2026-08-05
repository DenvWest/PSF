import { describe, expect, it } from "vitest";
import {
  hasPlanStepDragChanged,
  hasRoutineDragChanged,
  resolveRetimeFromDrag,
} from "@/lib/agenda-timeline-drag";

describe("resolveRetimeFromDrag", () => {
  it("preserves routine block duration when start moves", () => {
    const result = resolveRetimeFromDrag("10:00", "10:45", "14:00");
    expect(result.startTime).toBe("14:00");
    expect(result.endTime).toBe("14:45");
  });

  it("clamps end time within the timeline window", () => {
    const result = resolveRetimeFromDrag("10:00", "10:30", "23:45");
    expect(result.endTime).toBe("24:00");
    expect(result.startTime).toBe("23:45");
  });

  it("uses at least 15 minutes duration for short blocks", () => {
    const result = resolveRetimeFromDrag("10:00", "10:10", "12:00");
    expect(result.startTime).toBe("12:00");
    expect(result.endTime).toBe("12:15");
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
