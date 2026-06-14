import { calcDomainScores } from "@/lib/intake-engine";
import type { MovementSelfReport } from "@/lib/movement-assessment";

export type MovementDirection = "improved" | "stable" | "worsened";
export const MOVEMENT_DIRECTION_THRESHOLD = 5;

export function movementScoreFromReport(report: MovementSelfReport): number {
  return calcDomainScores(report as Record<string, number>).movement_score;
}

export function movementDirection(
  baseline: number,
  current: number,
): MovementDirection {
  const delta = current - baseline;
  if (delta >= MOVEMENT_DIRECTION_THRESHOLD) return "improved";
  if (delta <= -MOVEMENT_DIRECTION_THRESHOLD) return "worsened";
  return "stable";
}

export function movementStartStatement(direction: MovementDirection): string {
  switch (direction) {
    case "improved":
      return "Sinds je start beweeg je merkbaar meer — de goede kant op.";
    case "worsened":
      return "De laatste tijd kwam bewegen er wat bij in. Dat hoort bij een proces.";
    case "stable":
      return "Ongeveer gelijk aan je start — je houdt je lijn vast.";
  }
}
