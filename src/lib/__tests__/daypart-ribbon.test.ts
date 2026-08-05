import { describe, expect, it } from "vitest";
import {
  DAYPART_SEGMENTS,
  describeScheduledTime,
  ribbonRatioForTime,
} from "@/lib/daypart-ribbon";

describe("daypart-ribbon", () => {
  it("06:00 staat links, 24:00-rand rechts, en tijden erbuiten klemmen op de rand", () => {
    expect(ribbonRatioForTime("06:00")).toBe(0);
    expect(ribbonRatioForTime("15:00")).toBeCloseTo(0.5, 5);
    expect(ribbonRatioForTime("23:59")).toBeGreaterThan(0.99);
    expect(ribbonRatioForTime("03:00")).toBe(0);
  });

  it("geeft null terug bij een onbruikbare tijd, zodat de markering wegvalt", () => {
    expect(ribbonRatioForTime(null)).toBeNull();
    expect(ribbonRatioForTime("halfnegen")).toBeNull();
    expect(ribbonRatioForTime("25:00")).toBeNull();
  });

  it("de drie dagdelen dekken de rail zonder gat of overlap", () => {
    expect(DAYPART_SEGMENTS[0].startRatio).toBe(0);
    expect(DAYPART_SEGMENTS[2].endRatio).toBe(1);
    for (let index = 1; index < DAYPART_SEGMENTS.length; index += 1) {
      expect(DAYPART_SEGMENTS[index].startRatio).toBe(DAYPART_SEGMENTS[index - 1].endRatio);
    }
  });

  it("beschrijft de vaste tijd neutraal", () => {
    expect(describeScheduledTime("09:00")).toBe("Ochtend · 09:00");
    expect(describeScheduledTime("19:30")).toBe("Avond · 19:30");
    expect(describeScheduledTime(null)).toBe("Nog geen vaste tijd");
  });
});
