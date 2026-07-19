import { describe, expect, it } from "vitest";
import {
  parseSleepFocus,
  SLEEP_FOCUS_COOKIE_NAME,
  SLEEP_FOCUS_LABELS,
} from "@/lib/sleep-focus";

describe("sleep-focus", () => {
  it("parseSleepFocus accepts valid focus keys", () => {
    expect(parseSleepFocus("inslapen")).toBe("inslapen");
    expect(parseSleepFocus("doorslapen")).toBe("doorslapen");
    expect(parseSleepFocus("regelmaat")).toBe("regelmaat");
  });

  it("parseSleepFocus rejects invalid values", () => {
    expect(parseSleepFocus("uitgerust")).toBeNull();
    expect(parseSleepFocus(undefined)).toBeNull();
    expect(parseSleepFocus(null)).toBeNull();
    expect(parseSleepFocus("")).toBeNull();
  });

  it("uses the expected cookie name", () => {
    expect(SLEEP_FOCUS_COOKIE_NAME).toBe("psf_sleep_focus");
  });

  it("maps focus keys to Dutch labels", () => {
    expect(SLEEP_FOCUS_LABELS.doorslapen).toBe("Doorslapen");
  });
});
