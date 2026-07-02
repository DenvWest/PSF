import { describe, expect, it } from "vitest";
import {
  buildMovementRecommendations,
  buildSleepRecommendations,
  buildRecommendations,
  getMovementNutritionHint,
  getSleepNutritionHint,
} from "@/lib/build-recommendations";
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
    connection_score: 45,
      ...scoreOverrides,
    },
    urgency: "mild",
    profile: "In Balans",
    timestamp: Date.now(),
    ageRange: null,
    firstName: null,
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

describe("buildMovementRecommendations", () => {
  it("includes eiwitpoeder when protein_gap_signal is active", () => {
    const session = makeSession({
      NUT_PROT: 1,
      MOV_STR: 3,
      MOV_CARD: 2,
      NUT_O3: 3,
      RCV_PHYS: 2,
      STR_RCV: 3,
    });
    const recommendations = buildMovementRecommendations(session);
    expect(recommendations.some((r) => r.slug === "eiwitpoeder")).toBe(true);
    expect(recommendations.some((r) => r.slug === "omega-3")).toBe(false);
  });

  it("excludes magnesium when recovery is ok", () => {
    const session = makeSession(
      {
        NUT_PROT: 3,
        MOV_STR: 1,
        MOV_CARD: 1,
        NUT_O3: 3,
        RCV_PHYS: 3,
        STR_RCV: 3,
      },
      { sleep_score: 30, stress_score: 30, recovery_score: 60 },
    );
    const recommendations = buildMovementRecommendations(session);
    expect(recommendations.some((r) => r.slug === "magnesium")).toBe(false);
  });

  it("includes magnesium when recovery is low and engine recommends it", () => {
    const session = makeSession(
      {
        NUT_PROT: 3,
        MOV_STR: 1,
        MOV_CARD: 1,
        NUT_O3: 3,
        RCV_PHYS: 1,
        STR_RCV: 2,
      },
      { sleep_score: 30, stress_score: 30, recovery_score: 35 },
    );
    const all = buildRecommendations(session);
    const movement = buildMovementRecommendations(session);
    if (all.some((r) => r.slug === "magnesium")) {
      expect(movement.some((r) => r.slug === "magnesium")).toBe(true);
    }
  });
});

describe("getMovementNutritionHint", () => {
  it("mentions protein gap when signal is active", () => {
    const session = makeSession({
      NUT_PROT: 1,
      MOV_STR: 3,
      MOV_CARD: 2,
      NUT_O3: 3,
      RCV_PHYS: 2,
      STR_RCV: 3,
    });
    expect(getMovementNutritionHint(session)).toMatch(/eiwit/i);
  });
});

describe("buildSleepRecommendations", () => {
  it("returns only sleep-relevant supplement slugs", () => {
    const session = makeSession(
      {
        NUT_PROT: 3,
        MOV_STR: 1,
        MOV_CARD: 1,
        NUT_O3: 3,
        RCV_PHYS: 1,
        STR_RCV: 2,
      },
      { sleep_score: 30, stress_score: 35 },
    );
    const recommendations = buildSleepRecommendations(session);
    expect(
      recommendations.every((rec) => ["magnesium", "melatonine"].includes(rec.slug)),
    ).toBe(true);
  });
});

describe("getSleepNutritionHint", () => {
  it("advises evening nutrition basics when nutrition score is low", () => {
    const session = makeSession(
      {
        NUT_PROT: 1,
        MOV_STR: 2,
        MOV_CARD: 2,
        NUT_O3: 2,
        RCV_PHYS: 2,
        STR_RCV: 2,
      },
      { nutrition_score: 35 },
    );
    expect(getSleepNutritionHint(session)).toMatch(/voedingsscore/i);
  });
});
