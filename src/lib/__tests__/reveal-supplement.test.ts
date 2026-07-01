import { describe, expect, it, vi } from "vitest";
import { buildRevealSupplementDisclosure, buildSupplementDisclosure } from "@/lib/reveal-supplement";
import { buildRecommendationInput } from "@/lib/recommendation-input";
import { PILLAR } from "@/data/dashboard";
import {
  getDeficiencySignals,
  getProfileLabel,
  RULES_VERSION,
  type DomainScores,
} from "@/lib/intake-engine";
import { isGatedComparisonPathAllowed } from "@/lib/supplement-gate";
import type { RecommendationInput } from "@/types/recommendation";

const balancedScores: DomainScores = {
  sleep_score: 70,
  energy_score: 70,
  stress_score: 70,
  nutrition_score: 70,
  movement_score: 70,
  recovery_score: 70,
    connection_score: 70,
};

function fallbackInput(scores: DomainScores = balancedScores) {
  return buildRecommendationInput({ scores });
}

describe("buildSupplementDisclosure", () => {
  it("returns omega-3 disclosure for voeding priority", () => {
    const data = buildSupplementDisclosure(PILLAR.voeding, fallbackInput());
    expect(data).not.toBeNull();
    expect(data?.name).toBe("Omega-3");
    expect(data?.comparisonPath).toBe("/beste/omega-3-supplement?from=results");
    expect(data?.onHold).toBe(false);
    expect(data?.explanation).toBeDefined();
    expect(data?.explanation.lifestyleFirst).toContain("Eiwitrijk ontbijt");
    expect(data?.explanation.factors.length).toBeGreaterThanOrEqual(1);
    expect(data?.explanation.trustLine).toBe(
      "Wij kozen dit op kwaliteit, niet op commissie.",
    );
  });

  it("returns magnesium disclosure for slaap priority with explanation", () => {
    const data = buildSupplementDisclosure(PILLAR.slaap, fallbackInput());
    expect(data).not.toBeNull();
    expect(data?.explanation).toBeDefined();
    expect(data?.explanation.lifestyleFirst).toContain("Vaste afbouw na 21:00");
    expect(data?.explanation.factors.length).toBeGreaterThanOrEqual(1);
    expect(data?.explanation.trustLine).toBe(
      "Wij kozen dit op kwaliteit, niet op commissie.",
    );
  });

  it("uses dashboard from param in comparison path", () => {
    const data = buildSupplementDisclosure(PILLAR.voeding, fallbackInput(), "dashboard");
    expect(data?.comparisonPath).toBe("/beste/omega-3-supplement?from=dashboard");
  });

  it("returns richer explanation factors for low nutrition score and omega3 signal", () => {
    const input = buildRecommendationInput({
      scores: { ...balancedScores, nutrition_score: 40 },
      answers: { NUT_O3: 1 },
    });
    const data = buildSupplementDisclosure(PILLAR.voeding, input);

    expect(data?.explanation.factors.length).toBeGreaterThanOrEqual(2);
    expect(data?.explanation.factors.some((factor) => factor.kind === "measurement")).toBe(true);
    expect(data?.explanation.factors.some((factor) => factor.kind === "signal")).toBe(true);
  });

  it("returns null for stress priority (leefstijl-only, no supplement CTA)", () => {
    expect(buildSupplementDisclosure(PILLAR.stress, fallbackInput())).toBeNull();
  });

  it("returns null when pillar has no supplement", () => {
    expect(buildSupplementDisclosure(PILLAR.energie, fallbackInput())).toBeNull();
  });

  it("returns null when supplement is disabled via killswitch", async () => {
    vi.resetModules();
    vi.doMock("@/lib/supplement-availability", () => ({
      isSupplementAvailable: () => false,
    }));
    const { buildSupplementDisclosure: buildWithKillswitch } = await import("@/lib/reveal-supplement");
    expect(buildWithKillswitch(PILLAR.slaap, fallbackInput())).toBeNull();
    vi.resetModules();
  });
});

describe("buildRevealSupplementDisclosure", () => {
  it("delegates to buildSupplementDisclosure with results from param", () => {
    const input = fallbackInput();
    const data = buildRevealSupplementDisclosure(PILLAR.voeding, input);
    expect(data?.comparisonPath).toBe("/beste/omega-3-supplement?from=results");
  });
});

describe("approved-only gate (F-inv-3)", () => {
  it("only returns comparison paths that pass resolveGatedComparisonPath", () => {
    const scores: DomainScores = {
      sleep_score: 25,
      energy_score: 70,
      stress_score: 70,
      nutrition_score: 25,
      movement_score: 70,
      recovery_score: 70,
    connection_score: 70,
    };
    const answers = { NUT_O3: 1, SLP_QUAL: 1 };
    const input: RecommendationInput = {
      scores,
      signals: getDeficiencySignals(answers),
      profileLabel: getProfileLabel(scores),
      answers,
      rulesVersion: RULES_VERSION,
    };

    for (const pillar of Object.values(PILLAR)) {
      const disclosure = buildSupplementDisclosure(pillar, input);
      if (!disclosure) {
        continue;
      }

      const path = disclosure.comparisonPath.replace(/\?from=.*$/, "");
      expect(isGatedComparisonPathAllowed(path)).toBe(true);
    }
  });
});
