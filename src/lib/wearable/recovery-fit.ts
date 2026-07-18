import type { WearableSignalSnapshot } from "@/types/wearable-signals";

/**
 * Maps normalized wearable signals to a 0–1 recovery fit factor for planning.
 * Used by notification priority (recoveryFit) and movement recovery hints.
 * Feature-gated at ingest — no OAuth until DPIA + consent (fase 2).
 */
export function computeRecoveryFit(snapshot: WearableSignalSnapshot): number {
  const parts: number[] = [];

  if (typeof snapshot.recoveryScore === "number") {
    parts.push(clamp01(snapshot.recoveryScore / 100));
  }

  if (typeof snapshot.hrvMs === "number" && snapshot.hrvMs > 0) {
    // Conservative band: 20–80 ms maps to 0.2–1.0 (device-agnostic placeholder).
    parts.push(clamp01((snapshot.hrvMs - 20) / 60));
  }

  if (typeof snapshot.sleepScore === "number") {
    parts.push(clamp01(snapshot.sleepScore / 100));
  }

  if (typeof snapshot.restingHeartRate === "number" && snapshot.restingHeartRate > 0) {
    // Higher resting HR → lower fit (rough heuristic, not diagnostic).
    const hrFit = 1 - clamp01((snapshot.restingHeartRate - 50) / 40);
    parts.push(hrFit);
  }

  if (parts.length === 0) {
    return 1;
  }

  return parts.reduce((sum, value) => sum + value, 0) / parts.length;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

export function shouldConservativeLoad(recoveryFit: number): boolean {
  return recoveryFit < 0.45;
}
