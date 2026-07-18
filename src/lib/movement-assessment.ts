import {
  MOVEMENT_QUESTIONS,
  MOVEMENT_STATEMENTS,
  MOVEMENT_CHOICES,
  MOVEMENT_DEEPEN,
  type MovementBand,
  type MovementDimensionKey,
} from "@/data/movement-checkin";
import { resolveGatedComparisonPath } from "@/lib/supplement-gate";
import { getUsableClaims } from "@/data/approved-claims";

export type MovementSelfReport = {
  MOV_STR?: number;
  MOV_CARD?: number;
  RCV_FEEL?: number;
};
export type MovementSupplement = { comparisonPath: string; claimText: string };

export type MovementDimensionResult = {
  dimension: MovementDimensionKey;
  band: MovementBand;
  statement: string;
  choices: string[];
  deepen: string | null;
  supplement: MovementSupplement | null;
};

function bandFor(value: number): MovementBand {
  if (value <= 2) return "aandacht";
  if (value === 3) return "redelijk";
  return "sterk";
}

function creatineGate(): MovementSupplement | null {
  const comparisonPath = resolveGatedComparisonPath("creatine");
  if (!comparisonPath) return null;
  const claims = getUsableClaims("creatine");
  if (claims.length === 0) return null;
  return { comparisonPath, claimText: claims[0].text };
}

export function assessMovement(report: MovementSelfReport): MovementDimensionResult[] {
  const results: MovementDimensionResult[] = [];
  for (const q of MOVEMENT_QUESTIONS) {
    const value = report[q.field];
    if (typeof value !== "number") continue;
    const band = bandFor(value);
    const showChoice = band !== "sterk";
    results.push({
      dimension: q.dimension,
      band,
      statement: MOVEMENT_STATEMENTS[q.dimension][band],
      choices: showChoice ? MOVEMENT_CHOICES[q.dimension] : [],
      deepen: showChoice ? MOVEMENT_DEEPEN[q.dimension] : null,
      supplement: q.dimension === "kracht" && showChoice ? creatineGate() : null,
    });
  }
  return results;
}
