import type { DomainScores } from "@/lib/intake-engine";
import { getDisplayStatus, type DisplayStatus } from "@/lib/score-display";

export type FacetSource = "self_report" | "wearable";
export type FacetKey = "sleep" | "stress" | "nutrition" | "movement" | "recovery";

export interface VitaliteitFacet {
  key: FacetKey;
  value: number;
  source: FacetSource;
  weight: number;
}

const FACET_SCORE_KEYS: Record<FacetKey, keyof DomainScores> = {
  sleep: "sleep_score",
  stress: "stress_score",
  nutrition: "nutrition_score",
  movement: "movement_score",
  recovery: "recovery_score",
};

const FACET_KEYS: FacetKey[] = [
  "sleep",
  "stress",
  "nutrition",
  "movement",
  "recovery",
];

/** Vitality bewust zonder energy_score: energie is een readout, geen interventiedomein. */
export function resolveVitaliteitFacets(
  scores: DomainScores,
  biometrics?: unknown,
): VitaliteitFacet[] {
  void biometrics;

  return FACET_KEYS.map((key) => ({
    key,
    value: scores[FACET_SCORE_KEYS[key]],
    source: "self_report" as const,
    weight: 1.0,
  }));
}

export function computeVitaliteit(facets: VitaliteitFacet[]): number {
  if (facets.length === 0) {
    return 0;
  }

  const totalWeight = facets.reduce((sum, facet) => sum + facet.weight, 0);
  if (totalWeight === 0) {
    return 0;
  }

  const weightedSum = facets.reduce(
    (sum, facet) => sum + facet.value * facet.weight,
    0,
  );
  const average = weightedSum / totalWeight;

  return Math.min(100, Math.max(0, Math.round(average)));
}

export function vitaliteitBand(index: number): DisplayStatus {
  return getDisplayStatus(index);
}
