import { calcDomainScores } from "@/lib/intake-engine";
import type { SleepSelfReport } from "@/lib/sleep-assessment";

export type SleepDirection = "improved" | "stable" | "worsened";
export const SLEEP_DIRECTION_THRESHOLD = 5;

export function sleepScoreFromReport(report: SleepSelfReport): number {
  return calcDomainScores(report as Record<string, number>).sleep_score;
}

export function sleepDirection(baseline: number, current: number): SleepDirection {
  const delta = current - baseline;
  if (delta >= SLEEP_DIRECTION_THRESHOLD) return "improved";
  if (delta <= -SLEEP_DIRECTION_THRESHOLD) return "worsened";
  return "stable";
}

export function sleepStartStatement(direction: SleepDirection): string {
  switch (direction) {
    case "improved":
      return "Sinds je start slaap je merkbaar beter — de goede kant op.";
    case "worsened":
      return "De laatste tijd sliep je wat onrustiger. Dat hoort bij een proces.";
    case "stable":
      return "Ongeveer gelijk aan je start — je houdt je lijn vast.";
  }
}
