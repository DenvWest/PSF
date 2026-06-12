import { calcDomainScores } from "@/lib/intake-engine";
import type { StressSelfReport } from "@/lib/stress-assessment";

export type StressDirection = "improved" | "stable" | "worsened";
export const STRESS_DIRECTION_THRESHOLD = 5;

// Alleen STR_FREQ + STR_RCV bepalen de score — grip blijft hier expres buiten.
export function stressScoreFromReport(report: StressSelfReport): number {
  return calcDomainScores(report as Record<string, number>).stress_score;
}

export function stressDirection(baseline: number, current: number): StressDirection {
  const delta = current - baseline;
  if (delta >= STRESS_DIRECTION_THRESHOLD) return "improved";
  if (delta <= -STRESS_DIRECTION_THRESHOLD) return "worsened";
  return "stable";
}

/** Beleving tegen je eigen start — kwalitatief, nooit status/norm. */
export function stressStartStatement(direction: StressDirection): string {
  switch (direction) {
    case "improved":
      return "Sinds je start kom je makkelijker tot rust — de goede kant op.";
    case "worsened":
      return "De laatste tijd kostte tot rust komen wat meer moeite. Dat hoort bij een proces.";
    case "stable":
      return "Ongeveer gelijk aan je start — je houdt je lijn vast.";
  }
}
