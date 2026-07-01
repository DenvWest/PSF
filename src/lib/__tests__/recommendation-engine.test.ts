import { describe, expect, it } from "vitest";
import { PILLAR } from "@/data/dashboard";
import {
  calcDomainScores,
  getDeficiencySignals,
  RULES_VERSION,
  type DomainScores,
} from "@/lib/intake-engine";
import { buildRecommendations } from "@/lib/build-recommendations";
import { buildRecommendationInput } from "@/lib/recommendation-input";
import { buildSupplementDisclosure } from "@/lib/reveal-supplement";
import {
  getPillarRecommendation,
  getRecommendations,
} from "@/lib/recommendation-engine";
import type { RecommendationInput } from "@/types/recommendation";

function makeInput(answers: Record<string, number>): RecommendationInput {
  const scores = calcDomainScores(answers);
  return buildRecommendationInput({ scores, answers });
}

function makeScoresInput(
  scores: DomainScores,
  answers?: Record<string, number>,
): RecommendationInput {
  return buildRecommendationInput({ scores, answers });
}

const balancedScores: DomainScores = {
  sleep_score: 70,
  energy_score: 70,
  stress_score: 70,
  nutrition_score: 70,
  movement_score: 70,
  recovery_score: 70,
    connection_score: 70,
};

describe("recommendation-engine hub parity", () => {
  it("matches buildRecommendations slugs for nutrition-focused session", () => {
    const input = makeInput({
      NUT_PROT: 1,
      MOV_STR: 3,
      MOV_CARD: 2,
      NUT_O3: 3,
      RCV_PHYS: 2,
      STR_RCV: 3,
      SLP_QUAL: 3,
      SLP_CONS: 3,
      SLP_ONSET: 3,
      SLP_WAKE: 3,
      NRG_PATN: 3,
      NRG_DEP: 3,
      STR_FREQ: 3,
      LIF_ALC: 2,
      LIF_SUN: 2,
    });
    input.scores.nutrition_score = 35;
    input.scores.recovery_score = 45;

    const engineSlugs = getRecommendations(input, { source: "hub" })
      .map((item) => item.hubSlug)
      .filter(Boolean);
    const legacySlugs = buildRecommendations({
      sessionId: "test",
      symptoms: [],
      answers: input.answers,
      scores: input.scores,
      urgency: "mild",
      profile: input.profileLabel.name,
      timestamp: Date.now(),
      ageRange: null,
      firstName: null,
    }).map((item) => item.slug);

    expect(engineSlugs).toEqual(legacySlugs);
  });
});

describe("recommendation-engine pillar parity", () => {
  it("matches buildSupplementDisclosure comparison paths for slaap and voeding", () => {
    const input = makeInput({
      SLP_QUAL: 1,
      SLP_CONS: 1,
      SLP_ONSET: 1,
      SLP_WAKE: 1,
      NRG_PATN: 3,
      NRG_DEP: 3,
      STR_FREQ: 3,
      STR_RCV: 3,
      NUT_O3: 1,
      NUT_PROT: 3,
      MOV_STR: 3,
      MOV_CARD: 3,
      RCV_PHYS: 3,
      LIF_ALC: 2,
      LIF_SUN: 2,
    });

    for (const pillar of [PILLAR.slaap, PILLAR.voeding] as const) {
      const legacy = buildSupplementDisclosure(pillar, input);
      const engine = getPillarRecommendation(input, pillar.id);
      expect(engine?.comparisonPath).toBe(
        legacy?.comparisonPath.replace(/\?from=.*$/, "") ?? null,
      );
    }
  });

  it("returns null for stress pillar (leefstijl-only)", () => {
    const input = makeInput({
      SLP_QUAL: 3,
      SLP_CONS: 3,
      SLP_ONSET: 3,
      SLP_WAKE: 3,
      NRG_PATN: 3,
      NRG_DEP: 3,
      STR_FREQ: 1,
      STR_RCV: 1,
      NUT_O3: 3,
      NUT_PROT: 3,
      MOV_STR: 3,
      MOV_CARD: 3,
      RCV_PHYS: 3,
      LIF_ALC: 2,
      LIF_SUN: 2,
    });

    expect(getPillarRecommendation(input, "stress")).toBeNull();
    expect(buildSupplementDisclosure(PILLAR.stress, input)).toBeNull();
  });
});

describe("getPillarRecommendation score-aware reasons", () => {
  it("includes domain_below for low nutrition score without omega3 signal", () => {
    const input = makeScoresInput({
      ...balancedScores,
      nutrition_score: 40,
    });

    const result = getPillarRecommendation(input, "voeding");
    expect(result?.reason.triggeredBy).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "domain_below",
          domain: "nutrition_score",
        }),
      ]),
    );
  });

  it("includes domain_below and omega3 signal for full input with low omega3 answer", () => {
    const input = makeInput({
      SLP_QUAL: 3,
      SLP_CONS: 3,
      SLP_ONSET: 3,
      SLP_WAKE: 3,
      NRG_PATN: 3,
      NRG_DEP: 3,
      STR_FREQ: 3,
      STR_RCV: 3,
      NUT_O3: 1,
      NUT_PROT: 1,
      MOV_STR: 3,
      MOV_CARD: 3,
      RCV_PHYS: 3,
      LIF_ALC: 2,
      LIF_SUN: 2,
    });
    input.scores.nutrition_score = 40;

    const result = getPillarRecommendation(input, "voeding");
    expect(result?.reason.triggeredBy).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "domain_below",
          domain: "nutrition_score",
        }),
        expect.objectContaining({
          type: "signal",
          signal: "omega3_deficiency",
        }),
      ]),
    );
  });

  it("falls back to pillar reason when scores are above thresholds", () => {
    const input = buildRecommendationInput({ scores: balancedScores });

    const result = getPillarRecommendation(input, "voeding");
    expect(result?.reason.triggeredBy).toEqual([{ type: "pillar", pillarId: "voeding" }]);
  });
});

describe("buildRecommendationInput", () => {
  it("returns all-false signals without answers", () => {
    const input = buildRecommendationInput({ scores: balancedScores });

    expect(Object.values(input.signals).every((value) => value === false)).toBe(true);
    expect(input.answers).toEqual({});
    expect(input.rulesVersion).toBe(RULES_VERSION);
  });

  it("derives deficiency signals when answers are provided", () => {
    const input = buildRecommendationInput({
      scores: balancedScores,
      answers: { NUT_O3: 1 },
    });

    expect(input.signals.omega3_deficiency).toBe(true);
    expect(getDeficiencySignals({ NUT_O3: 1 }).omega3_deficiency).toBe(true);
  });
});
