/** Normalized wearable snapshot — no raw vendor payloads (see ARCHITECTUUR_LIFESTYLE_PLANNER §8.3). */
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
