/** Normalized wearable snapshot — no raw vendor payloads (see ARCHITECTUUR_LIFESTYLE_PLANNER §8.3).
 *  Feeds the analyse-laag (trend/check-in enrichment), not LifestylePlan checklists.
 *  AI-bril / camera-inname (horizon) would use the same snapshot shape after DPIA + consent. */
export type WearableSignalSnapshot = {
  capturedAt: string;
  stepsToday: number | null;
  activeMinutesToday: number | null;
  restingHeartRate: number | null;
  hrvMs: number | null;
  sleepScore: number | null;
  sleepDurationMin: number | null;
  trainingLoad: number | null;
  recoveryScore: number | null;
  sedentaryMinutesToday: number | null;
};

export type WearableProvider =
  | "health_connect"
  | "apple_health"
  | "garmin"
  | "fitbit"
  | "oura"
  | "polar"
  | "samsung_health";
