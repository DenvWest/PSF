import { describe, it, expect } from "vitest";
import { buildAdviesBlokHeadline, buildStatistiekenAdviesModel } from "@/lib/statistieken-advies-model";
import { EMPTY_MOVEMENT_PREFS } from "@/lib/movement-prefs";
import type { DashboardData, DashboardModel } from "@/types/dashboard";
import type { StoredSupplementVerdict } from "@/types/verdict";

function verdict(
  ingredientKey: string,
  verdictValue: StoredSupplementVerdict["verdict"],
  reasonKey: string,
): StoredSupplementVerdict {
  return {
    id: ingredientKey,
    ingredientKey,
    verdict: verdictValue,
    reasonKey,
    rulesVersion: "1.5.0",
    nextReviewAt: null,
    createdAt: "2026-07-28T00:00:00.000Z",
    supersededAt: null,
    basedOn: null,
  };
}

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
    stressCheckinReport: null,
    domainCheckDaysAgo: {},
    movementPrefs: EMPTY_MOVEMENT_PREFS,
    supplementVerdicts: [],
    proteinTarget: null,
    ...overrides,
  };
}

describe("buildStatistiekenAdviesModel", () => {
  it("markeert zwakke interventiedomeinen en bouwt snapshot-headline", () => {
    const view = buildStatistiekenAdviesModel(baseModel(), baseData());

    expect(view.domainRows.filter((row) => row.isWeak).map((row) => row.label)).toEqual([
      "Slaap",
    ]);
    expect(view.snapshotHeadline).toBe("Slaap vraagt nu je aandacht");
    expect(view.adviesState).toBe("nutrition_missing");
  });

  it("bouwt voeding-eerst ladder alleen bij ingevulde voeding en below-band", () => {
    const view = buildStatistiekenAdviesModel(
      baseModel(),
      baseData({
        nutritionIntake: {
          date: "12 jul 2026",
          items: [
            { label: "Magnesium", band: "below", nutrient: "magnesium" },
            { label: "Omega-3", band: "meets", nutrient: "omega3" },
          ],
        },
        supplementVerdicts: [verdict("magnesium", "kopen", "trigger_matched")],
      }),
    );

    expect(view.adviesState).toBe("ready");
    expect(view.nutritionLadder.some((item) => item.nutrient === "magnesium")).toBe(true);
    expect(view.nutritionLadder.some((item) => item.nutrient === "omega3")).toBe(false);
    expect(view.verdictCards).toHaveLength(1);
  });

  it("herkent de merkbelofte-staat all_no", () => {
    const view = buildStatistiekenAdviesModel(
      baseModel(),
      baseData({
        nutritionIntake: {
          date: "12 jul 2026",
          items: [{ label: "Eiwit", band: "meets", nutrient: "protein" }],
        },
        supplementVerdicts: [
          verdict("magnesium", "niet_nodig", "no_trigger_matched"),
          verdict("omega3", "niet_nodig", "no_trigger_matched"),
        ],
      }),
    );

    expect(view.adviesState).toBe("all_no");
    expect(buildAdviesBlokHeadline(view)).toBe("Geen enkele voegt nu iets toe voor jou");
  });
});
