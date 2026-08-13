import { describe, expect, it } from "vitest";
import { buildStatistiekenAdviesModel } from "@/lib/statistieken-advies-model";
import { EMPTY_MOVEMENT_PREFS } from "@/lib/movement-prefs";
import { resolveDefaultStatistiekenBlik } from "@/lib/statistieken-blik";
import type { DashboardData, DashboardModel } from "@/types/dashboard";

function baseModel(): DashboardModel {
  return {
    scores: {
      slaap: 48,
      energie: 70,
      stress: 74,
      voeding: 56,
      beweging: 71,
      herstel: 65,
      verbinding: 66,
    },
    domainScores: {
      sleep_score: 48,
      energy_score: 70,
      stress_score: 74,
      nutrition_score: 56,
      movement_score: 71,
      recovery_score: 65,
      connection_score: 66,
    },
    ladder: [],
    enginePriority: { id: "slaap", label: "Slaap" } as DashboardModel["enginePriority"],
    priority: { id: "slaap", label: "Slaap" } as DashboardModel["priority"],
    priorityIsUserChosen: false,
    timeBucket: null,
    scheduledTime: null,
    planStepDismissedDate: null,
    planStepsHidden: false,
    movementDayChoice: null,
    strongest: { id: "stress", label: "Stress" } as DashboardModel["strongest"],
    vitality: 62,
    vitalityDelta: null,
    vitalityDeltaNote: null,
    lifestyle: [],
    supplement: null,
    trend: {
      slaap: [],
      energie: [],
      stress: [],
      voeding: [],
      beweging: [],
      herstel: [],
      verbinding: [],
    },
    prevScores: null,
    history: [],
    retest: false,
    answers: {},
    date: "12 jul 2026",
    deltaOf: () => 0,
    activeHabit: null,
    planDomain: null,
    planProgress: null,
    movementPlanProgress: null,
    sleepFocus: null,
    movementRcvFeel: null,
    movementRcvFeelAt: null,
    movementPrefs: EMPTY_MOVEMENT_PREFS,
  };
}

function baseData(overrides: Partial<DashboardData> = {}): DashboardData {
  return {
    empty: false,
    current: null,
    prev: null,
    history: [],
    retest: false,
    nutritionIntake: null,
    nutritionLastLoggedAt: null,
    nutritionRelogDue: false,
    daysSinceNutritionLog: null,
    movementRecoveryTrend: [],
    movementRcvFeel: null,
    movementRcvFeelAt: null,
    remeasure: null,
    cycleEvidence: null,
    deltaReport: null,
    profileLabel: null,
    firstName: null,
    answers: null,
    sessionId: null,
    planProgress: null,
    movementPlanProgress: null,
    planDomain: null,
    priorityPref: null,
    sleepCheckinFocus: null,
    sleepCheckinSnapshot: null,
    movementCheckinSnapshot: null,
    hasStressCheckin: false,
    domainCheckDaysAgo: {},
    movementPrefs: EMPTY_MOVEMENT_PREFS,
    supplementVerdicts: [],
    proteinTarget: null,
    ...overrides,
  };
}

describe("resolveDefaultStatistiekenBlik", () => {
  it("defaults to advies when nutrition is missing", () => {
    const model = baseModel();
    const data = baseData();
    const advies = buildStatistiekenAdviesModel(model, data);
    expect(advies.adviesState).toBe("nutrition_missing");
    expect(resolveDefaultStatistiekenBlik(model, data)).toBe("advies");
  });

  it("defaults to stand when advies gate is passed", () => {
    const model = baseModel();
    const data = baseData({
      nutritionIntake: {
        date: "12 jul 2026",
        items: [{ label: "Eiwit", band: "meets", nutrient: "protein" }],
      },
      supplementVerdicts: [
        {
          id: "magnesium",
          ingredientKey: "magnesium",
          verdict: "niet_nodig",
          reasonKey: "no_trigger_matched",
          rulesVersion: "1.5.0",
          nextReviewAt: null,
          createdAt: "2026-07-28T00:00:00.000Z",
          supersededAt: null,
          basedOn: null,
        },
      ],
    });
    expect(resolveDefaultStatistiekenBlik(model, data)).toBe("stand");
  });
});
