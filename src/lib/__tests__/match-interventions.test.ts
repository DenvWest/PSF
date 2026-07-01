import { describe, expect, it } from "vitest";
import {
  buildFallbackBuckets,
  interventionTriggersMatch,
  type InterventionTriggerRow,
} from "@/lib/content/match-interventions";
import type { DeficiencySignals, DomainScores, ProfileLabel } from "@/lib/intake-engine";
import { getRecommendations } from "@/lib/recommendation-engine";
import { buildRecommendationInput } from "@/lib/recommendation-input";

const baseScores: DomainScores = {
  sleep_score: 70,
  energy_score: 70,
  stress_score: 70,
  nutrition_score: 70,
  movement_score: 70,
  recovery_score: 70,
    connection_score: 70,
};

const baseSignals: DeficiencySignals = {
  omega3_deficiency: false,
  magnesium_signal: false,
  cortisol_risk: false,
  creatine_signal: false,
  melatonine_signal: false,
  protein_gap_signal: false,
  low_recovery_no_load: false,
  sleep_issue_no_stress: false,
  energy_dip_unexplained: false,
};

const profile: ProfileLabel = {
  name: "In Balans",
  domain: "sleep",
  score: 70,
};

describe("interventionTriggersMatch", () => {
  it("matches when any OR-group satisfies all AND triggers", () => {
    const triggers: InterventionTriggerRow[] = [
      {
        group_id: 1,
        kind: "domain_below",
        field: "sleep_score",
        operator: null,
        value: 50,
      },
      {
        group_id: 2,
        kind: "answer",
        field: "SLP_WAKE",
        operator: "<=",
        value: 2,
      },
    ];

    expect(
      interventionTriggersMatch(triggers, {
        scores: { ...baseScores, sleep_score: 30 },
        deficiencySignals: baseSignals,
        profileLabel: profile,
        answers: {},
      }),
    ).toBe(true);

    expect(
      interventionTriggersMatch(triggers, {
        scores: baseScores,
        deficiencySignals: baseSignals,
        profileLabel: profile,
        answers: { SLP_WAKE: 1 },
      }),
    ).toBe(true);
  });

  it("requires all triggers in a group (AND)", () => {
    const triggers: InterventionTriggerRow[] = [
      {
        group_id: 1,
        kind: "domain_below",
        field: "sleep_score",
        operator: null,
        value: 50,
      },
      {
        group_id: 1,
        kind: "answer",
        field: "SLP_WAKE",
        operator: "<=",
        value: 2,
      },
    ];

    expect(
      interventionTriggersMatch(triggers, {
        scores: { ...baseScores, sleep_score: 30 },
        deficiencySignals: baseSignals,
        profileLabel: profile,
        answers: { SLP_WAKE: 4 },
      }),
    ).toBe(false);

    expect(
      interventionTriggersMatch(triggers, {
        scores: { ...baseScores, sleep_score: 30 },
        deficiencySignals: baseSignals,
        profileLabel: profile,
        answers: { SLP_WAKE: 1 },
      }),
    ).toBe(true);
  });

  it("matches deficiency_signal triggers", () => {
    const triggers: InterventionTriggerRow[] = [
      {
        group_id: 1,
        kind: "deficiency_signal",
        field: "omega3_deficiency",
        operator: null,
        value: true,
      },
    ];

    expect(
      interventionTriggersMatch(triggers, {
        scores: baseScores,
        deficiencySignals: { ...baseSignals, omega3_deficiency: true },
        profileLabel: profile,
        answers: {},
      }),
    ).toBe(true);
  });

  it("returns true when no triggers configured", () => {
    expect(
      interventionTriggersMatch([], {
        scores: baseScores,
        deficiencySignals: baseSignals,
        profileLabel: profile,
        answers: {},
      }),
    ).toBe(true);
  });
});

describe("buildFallbackBuckets engine-parity", () => {
  it("supplement-bucket komt uit getRecommendations(route)[0]", () => {
    const input = buildRecommendationInput({
      scores: {
        sleep_score: 30, energy_score: 40, stress_score: 30,
        nutrition_score: 45, movement_score: 60, recovery_score: 40,
    connection_score: 40,
      },
      answers: {},
    });
    const buckets = buildFallbackBuckets(
      input.scores, input.signals, input.profileLabel, input.answers,
    );
    const top = getRecommendations(input, { source: "route" })[0];

    expect(top).toBeDefined();
    expect(buckets.supplement?.slug).toBe(top?.supplementId);
    expect(buckets.supplement?.affiliateUrl).toBe(top?.comparisonPath);
  });
});

describe("buildFallbackBuckets engine-parity", () => {
  it("supplement-bucket komt uit getRecommendations(route)[0]", () => {
    const input = buildRecommendationInput({
      scores: {
        sleep_score: 30, energy_score: 40, stress_score: 30,
        nutrition_score: 45, movement_score: 60, recovery_score: 40,
    connection_score: 40,
      },
      answers: {},
    });
    const buckets = buildFallbackBuckets(
      input.scores, input.signals, input.profileLabel, input.answers,
    );
    const top = getRecommendations(input, { source: "route" })[0];

    expect(top).toBeDefined();
    expect(buckets.supplement?.slug).toBe(top?.supplementId);
    expect(buckets.supplement?.affiliateUrl).toBe(top?.comparisonPath);
  });
});
