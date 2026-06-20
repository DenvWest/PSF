import { describe, expect, it } from "vitest";
import { PILLAR } from "@/data/dashboard";
import {
  calcDomainScores,
  getDeficiencySignals,
  getProfileLabel,
  RULES_VERSION,
} from "@/lib/intake-engine";
import { buildRecommendations } from "@/lib/build-recommendations";
import { getSupplementRoute } from "@/lib/getSupplementRoute";
import { buildSupplementDisclosure } from "@/lib/reveal-supplement";
import {
  getPillarRecommendation,
  getRecommendations,
} from "@/lib/recommendation-engine";
import type { RecommendationInput } from "@/types/recommendation";

function makeInput(answers: Record<string, number>): RecommendationInput {
  const scores = calcDomainScores(answers);
  return {
    scores,
    signals: getDeficiencySignals(answers),
    profileLabel: getProfileLabel(scores),
    answers,
    rulesVersion: RULES_VERSION,
  };
}

describe("recommendation-engine route parity", () => {
  it("matches getSupplementRoute paths for low sleep/stress profile", () => {
    const answers = {
      SLP_QUAL: 1,
      SLP_CONS: 1,
      SLP_ONSET: 1,
      SLP_WAKE: 1,
      NRG_PATN: 3,
      NRG_DEP: 3,
      STR_FREQ: 1,
      STR_RCV: 1,
      NUT_O3: 3,
      NUT_PROT: 3,
      MOV_STR: 2,
      MOV_CARD: 2,
      RCV_PHYS: 2,
      LIF_ALC: 2,
      LIF_SUN: 2,
    };
    const input = makeInput(answers);
    const engineRoutes = getRecommendations(input, { source: "route" }).map(
      (item) => item.comparisonPath,
    );
    const legacyRoutes = getSupplementRoute(
      input.scores,
      input.signals,
      input.profileLabel,
      input.answers,
    ).map((item) => item.affiliateUrl);

    expect(engineRoutes).toEqual(legacyRoutes);
    expect(engineRoutes.some((path) => path.includes("ashwagandha"))).toBe(false);
  });
});

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
      const legacy = buildSupplementDisclosure(pillar);
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
    expect(buildSupplementDisclosure(PILLAR.stress)).toBeNull();
  });
});
