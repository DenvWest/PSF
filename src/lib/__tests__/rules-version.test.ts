import { describe, expect, it } from "vitest";
import {
  compareRulesVersions,
  hasMethodologyChange,
  isConnectionDeltaComparable,
  isRecoveryDeltaComparable,
  isVitalityDeltaComparable,
  parseRulesVersion,
} from "@/lib/rules-version";

describe("rules-version", () => {
  it("parses semver strings", () => {
    expect(parseRulesVersion("1.2.0")).toEqual({
      major: 1,
      minor: 2,
      patch: 0,
    });
    expect(parseRulesVersion("invalid")).toBeNull();
  });

  it("compares versions", () => {
    expect(compareRulesVersions("1.0.0", "1.2.0")).toBeLessThan(0);
    expect(compareRulesVersions("1.2.0", "1.2.0")).toBe(0);
    expect(compareRulesVersions("2.0.0", "1.2.0")).toBeGreaterThan(0);
  });

  it("flags recovery delta incomparable across 1.1.0 boundary", () => {
    expect(isRecoveryDeltaComparable("1.0.0", "1.2.0")).toBe(false);
    expect(isRecoveryDeltaComparable("1.1.0", "1.2.0")).toBe(true);
  });

  it("flags vitality delta incomparable across 1.3.0 boundary", () => {
    expect(isVitalityDeltaComparable("1.2.0", "1.3.0")).toBe(false);
    expect(isVitalityDeltaComparable("1.3.0", "1.3.0")).toBe(true);
    expect(isVitalityDeltaComparable("1.2.0", "1.2.0")).toBe(true);
  });

  it("flags connection delta incomparable across 1.3.0 boundary", () => {
    expect(isConnectionDeltaComparable("1.2.0", "1.3.0")).toBe(false);
    expect(isConnectionDeltaComparable("1.3.0", "1.3.0")).toBe(true);
  });

  it("detects methodology change across version boundaries", () => {
    expect(hasMethodologyChange("1.0.0", "1.2.0")).toBe(true);
    expect(hasMethodologyChange("1.2.0", "1.3.0")).toBe(true);
    expect(hasMethodologyChange("1.3.0", "1.3.0")).toBe(false);
  });
});
