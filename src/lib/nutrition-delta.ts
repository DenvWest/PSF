/**
 * F3: delta-laag voor de voedings zelf-evaluatie-lus.
 *
 * Vergelijkt twee IntakeEstimate[]-arrays (vorige vs. huidige log) en produceert
 * inname-geformuleerde delta-zinnen. Puur, geen I/O.
 */

import { nutrientReferences } from "@/data/nutrition/intake-reference";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { IntakeBand, IntakeEstimate } from "@/lib/nutrition-intake-estimate";

const BAND_RANK: Record<IntakeBand, number> = {
  below: 0,
  around: 1,
  meets: 2,
};

export type DeltaDirection = "improved" | "worsened" | "unchanged";

export interface NutrientDelta {
  nutrient: NutrientId;
  from: IntakeBand;
  to: IntakeBand;
  direction: DeltaDirection;
}

/**
 * Vergelijkt twee IntakeEstimate[]-snapshots.
 * Alleen nutriënten die in BEIDE aanwezig zijn worden meegenomen.
 */
export function compareNutritionEstimates(
  previous: IntakeEstimate[],
  current: IntakeEstimate[],
): NutrientDelta[] {
  const prevMap = new Map<NutrientId, IntakeBand>(
    previous.map((e) => [e.nutrient, e.band]),
  );
  const result: NutrientDelta[] = [];

  for (const curr of current) {
    const prevBand = prevMap.get(curr.nutrient);
    if (prevBand === undefined) continue;

    const fromRank = BAND_RANK[prevBand];
    const toRank = BAND_RANK[curr.band];

    let direction: DeltaDirection;
    if (toRank > fromRank) {
      direction = "improved";
    } else if (toRank < fromRank) {
      direction = "worsened";
    } else {
      direction = "unchanged";
    }

    result.push({
      nutrient: curr.nutrient,
      from: prevBand,
      to: curr.band,
      direction,
    });
  }

  return result;
}

/**
 * Geeft een inname-geformuleerde delta-zin.
 * Nooit statustaal — compliance via statementHasForbiddenPhrase (F1).
 */
export function deltaStatementFor(delta: NutrientDelta): string {
  const label = nutrientReferences[delta.nutrient].label;

  switch (delta.direction) {
    case "improved":
      return `Je ${label}-inname bewoog de goede kant op sinds je vorige check.`;
    case "worsened":
      return `Je ${label}-inname liep iets terug sinds je vorige check.`;
    case "unchanged":
      return `Je ${label}-inname bleef gelijk sinds je vorige check.`;
  }
}
