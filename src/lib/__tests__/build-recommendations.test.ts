import { describe, expect, it } from "vitest";
import { buildRecommendations } from "@/lib/build-recommendations";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";

function makeSession(
  answers: Record<string, number>,
  scoreOverrides: Partial<IntakeSessionPayload["scores"]> = {},
): IntakeSessionPayload {
  return {
    sessionId: "test-session",
    symptoms: [],
    answers,
    scores: {
      sleep_score: 70,
      energy_score: 70,
      stress_score: 70,
      nutrition_score: 35,
      movement_score: 75,
      recovery_score: 45,
      ...scoreOverrides,
    },
    urgency: "mild",
    profile: "In Balans",
    timestamp: Date.now(),
    ageRange: null,
  };
}

describe("buildRecommendations", () => {
  it("includes eiwitpoeder when protein_gap_signal is active", () => {
    const session = makeSession({
      NUT_PROT: 1,
      MOV_STR: 3,
      MOV_CARD: 2,
      NUT_O3: 3,
      RCV_PHYS: 2,
      STR_RCV: 3,
    });
    const recommendations = buildRecommendations(session);
    expect(recommendations.some((r) => r.slug === "eiwitpoeder")).toBe(true);
    const protein = recommendations.find((r) => r.slug === "eiwitpoeder");
    expect(protein?.comparisonHref).toBe("/beste/eiwitpoeder");
  });

  it("does not include eiwitpoeder when protein is low but user is sedentary with ok recovery", () => {
    const session = makeSession({
      NUT_PROT: 1,
      MOV_STR: 1,
      MOV_CARD: 1,
      NUT_O3: 3,
      RCV_PHYS: 3,
      STR_RCV: 3,
    });
    const recommendations = buildRecommendations(session);
    expect(recommendations.some((r) => r.slug === "eiwitpoeder")).toBe(false);
  });
});
