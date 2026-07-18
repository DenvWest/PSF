import type { WearableSignalSnapshot } from "@/types/wearable-signals";

const SNAPSHOT_KEYS: (keyof WearableSignalSnapshot)[] = [
  "capturedAt",
  "stepsToday",
  "activeMinutesToday",
  "restingHeartRate",
  "hrvMs",
  "sleepScore",
  "sleepDurationMin",
  "trainingLoad",
  "recoveryScore",
  "sedentaryMinutesToday",
];

/** Validates client-normalized snapshot before server accept (fase 2 API). */
export function parseWearableSignalSnapshot(raw: unknown): WearableSignalSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const record = raw as Record<string, unknown>;
  const capturedAt = record.capturedAt;
  if (typeof capturedAt !== "string" || !capturedAt.trim()) {
    return null;
  }

  const snapshot: WearableSignalSnapshot = {
    capturedAt: capturedAt.trim(),
    stepsToday: nullableNumber(record.stepsToday),
    activeMinutesToday: nullableNumber(record.activeMinutesToday),
    restingHeartRate: nullableNumber(record.restingHeartRate),
    hrvMs: nullableNumber(record.hrvMs),
    sleepScore: nullableNumber(record.sleepScore),
    sleepDurationMin: nullableNumber(record.sleepDurationMin),
    trainingLoad: nullableNumber(record.trainingLoad),
    recoveryScore: nullableNumber(record.recoveryScore),
    sedentaryMinutesToday: nullableNumber(record.sedentaryMinutesToday),
  };

  for (const key of SNAPSHOT_KEYS) {
    if (!(key in record)) {
      continue;
    }
    if (key === "capturedAt") {
      continue;
    }
    const value = snapshot[key];
    if (value !== null && (typeof value !== "number" || !Number.isFinite(value))) {
      return null;
    }
  }

  return snapshot;
}

function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return value;
}
