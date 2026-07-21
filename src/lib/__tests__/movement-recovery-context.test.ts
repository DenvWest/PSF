import { describe, expect, it } from "vitest";
import {
  parseRcvFeelFromRawInputs,
  pickLatestMovementRcvFeel,
} from "@/lib/movement-recovery-context";

describe("parseRcvFeelFromRawInputs", () => {
  it("parses numeric and string RCV_FEEL values", () => {
    expect(parseRcvFeelFromRawInputs({ RCV_FEEL: 5 })).toBe(5);
    expect(parseRcvFeelFromRawInputs({ RCV_FEEL: "4" })).toBe(4);
    expect(parseRcvFeelFromRawInputs({ RCV_FEEL: 0 })).toBeNull();
  });
});

describe("pickLatestMovementRcvFeel", () => {
  it("returns the newest row that contains RCV_FEEL", () => {
    const picked = pickLatestMovementRcvFeel([
      { created_at: "2026-07-10T10:00:00.000Z", raw_inputs: { RCV_FEEL: 2 } },
      { created_at: "2026-07-12T10:00:00.000Z", raw_inputs: { MOV2_STR: 3 } },
      { created_at: "2026-07-14T10:00:00.000Z", raw_inputs: { RCV_FEEL: 5 } },
    ]);
    expect(picked).toEqual({
      rcvFeel: 5,
      rcvFeelAt: "2026-07-14T10:00:00.000Z",
    });
  });
});
