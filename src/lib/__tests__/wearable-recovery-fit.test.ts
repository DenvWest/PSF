import { describe, expect, it } from "vitest";
import {
  computeRecoveryFit,
  shouldConservativeLoad,
} from "@/lib/wearable/recovery-fit";
import { parseWearableSignalSnapshot } from "@/lib/wearable/signal-snapshot";

describe("wearable recovery-fit", () => {
  it("returns high fit for healthy snapshot", () => {
    const fit = computeRecoveryFit({
      capturedAt: "2026-07-18T08:00:00Z",
      stepsToday: 8000,
      activeMinutesToday: 45,
      restingHeartRate: 58,
      hrvMs: 55,
      sleepScore: 82,
      sleepDurationMin: 420,
      trainingLoad: 40,
      recoveryScore: 78,
      sedentaryMinutesToday: 300,
    });
    expect(fit).toBeGreaterThan(0.6);
    expect(shouldConservativeLoad(fit)).toBe(false);
  });

  it("returns low fit for poor recovery signals", () => {
    const fit = computeRecoveryFit({
      capturedAt: "2026-07-18T08:00:00Z",
      stepsToday: null,
      activeMinutesToday: null,
      restingHeartRate: 72,
      hrvMs: 22,
      sleepScore: 35,
      sleepDurationMin: 300,
      trainingLoad: 85,
      recoveryScore: 28,
      sedentaryMinutesToday: null,
    });
    expect(shouldConservativeLoad(fit)).toBe(true);
  });

  it("parses valid snapshot payloads", () => {
    const parsed = parseWearableSignalSnapshot({
      capturedAt: "2026-07-18T08:00:00Z",
      hrvMs: 48,
      recoveryScore: 70,
    });
    expect(parsed?.hrvMs).toBe(48);
  });

  it("rejects invalid snapshot payloads", () => {
    expect(parseWearableSignalSnapshot({ hrvMs: "bad" })).toBeNull();
  });
});
