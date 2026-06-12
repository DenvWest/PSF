import {
  SLEEP_QUESTIONS,
  SLEEP_STATEMENTS,
  SLEEP_CHOICES,
  SLEEP_DEEPEN,
  type SleepBand,
  type SleepDimensionKey,
  type SleepActionableKey,
} from "@/data/sleep-checkin";
import { resolveGatedComparisonPath } from "@/lib/supplement-gate";
import { getUsableClaims } from "@/data/approved-claims";

export type SleepSelfReport = {
  SLP_ONSET?: number;
  SLP_WAKE?: number;
  SLP_CONS?: number;
  SLP_QUAL?: number;
};
export type SleepSupplement = { comparisonPath: string; claimText: string };

export type SleepDimensionStatus = {
  dimension: SleepDimensionKey;
  label: string;
  band: SleepBand;
};
export type SleepFocus = {
  dimension: SleepActionableKey;
  label: string;
  statement: string;
  choices: string[];
  deepen: string;
  supplement: SleepSupplement | null;
} | null;
export type SleepAssessment = { statuses: SleepDimensionStatus[]; focus: SleepFocus };

function bandFor(value: number, max: number): SleepBand {
  if (value >= max) return "sterk";
  if (value === max - 1) return "redelijk";
  return "aandacht";
}

function magnesiumGate(): SleepSupplement | null {
  const comparisonPath = resolveGatedComparisonPath("magnesium");
  if (!comparisonPath) return null;
  const claims = getUsableClaims("magnesium");
  if (claims.length === 0) return null;
  return { comparisonPath, claimText: claims[0].text };
}

export function assessSleep(report: SleepSelfReport): SleepAssessment {
  const statuses: SleepDimensionStatus[] = [];
  const actionable: {
    dimension: SleepActionableKey;
    label: string;
    band: SleepBand;
    normalized: number;
  }[] = [];

  for (const q of SLEEP_QUESTIONS) {
    const value = report[q.field];
    if (typeof value !== "number") continue;
    const band = bandFor(value, q.max);
    statuses.push({ dimension: q.dimension, label: q.label, band });
    if (q.actionable) {
      actionable.push({
        dimension: q.dimension as SleepActionableKey,
        label: q.label,
        band,
        normalized: value / q.max,
      });
    }
  }

  const ORDER: SleepActionableKey[] = ["inslapen", "doorslapen", "regelmaat"];
  actionable.sort((a, b) =>
    a.normalized !== b.normalized
      ? a.normalized - b.normalized
      : ORDER.indexOf(a.dimension) - ORDER.indexOf(b.dimension),
  );
  const weakest = actionable[0];

  let focus: SleepFocus = null;
  if (weakest && weakest.band !== "sterk") {
    focus = {
      dimension: weakest.dimension,
      label: weakest.label,
      statement: SLEEP_STATEMENTS[weakest.dimension][weakest.band],
      choices: SLEEP_CHOICES[weakest.dimension],
      deepen: SLEEP_DEEPEN[weakest.dimension],
      supplement:
        weakest.dimension === "inslapen" || weakest.dimension === "doorslapen"
          ? magnesiumGate()
          : null,
    };
  }

  return { statuses, focus };
}
