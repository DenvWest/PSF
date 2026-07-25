import { describe, expect, it } from "vitest";
import { buildKompasDomainActions } from "@/lib/kompas-domain-actions";
import type { DashboardModel } from "@/types/dashboard";

function baseModel(overrides: Partial<DashboardModel> = {}): DashboardModel {
  return {
    scores: { slaap: 50, beweging: 60, voeding: 40, stress: 55, verbinding: 45 },
    domainScores: {},
    ladder: [],
    enginePriority: { id: "beweging", label: "Beweging", color: "#5A8F6A", icon: "Footprints", quickWin: { title: "Test", body: "" } },
    priority: { id: "beweging", label: "Beweging", color: "#5A8F6A", icon: "Footprints", quickWin: { title: "Test", body: "" } },
    priorityIsUserChosen: false,
    timeBucket: null,
    scheduledTime: null,
    planStepDismissedDate: null,
    planStepsHidden: false,
    strongest: { id: "beweging", label: "Beweging", color: "#5A8F6A", icon: "Footprints", quickWin: { title: "Test", body: "" } },
    vitality: 44,
    vitalityDelta: null,
    vitalityDeltaNote: null,
    lifestyle: [],
    supplement: null,
    trend: {},
    prevScores: null,
    history: [{ seq: 1, date: "2026-07-01", priority: "beweging", vitality: 44 }],
    retest: false,
    answers: {},
    date: "2026-07-25",
    deltaOf: () => 0,
    activeHabit: null,
    planDomain: null,
    planProgress: null,
    movementPlanProgress: null,
    sleepFocus: null,
    movementRcvFeel: null,
    movementRcvFeelAt: null,
    movementPrefs: { weeklyGoalMinutes: 150, preferredModalities: [] },
    ...overrides,
  } as DashboardModel;
}

describe("buildKompasDomainActions", () => {
  it("offers voedingscheck when nutrition log is incomplete", () => {
    const actions = buildKompasDomainActions({
      model: baseModel(),
      nutritionLogCompleted: false,
      hasNutritionIntake: false,
    });
    const voeding = actions.find((action) => action.domain === "voeding");
    expect(voeding?.actionKind).toBe("checkin");
    expect(voeding?.actionLabel).toBe("Doe voedingscheck");
  });

  it("offers result when nutrition log is complete", () => {
    const actions = buildKompasDomainActions({
      model: baseModel(),
      nutritionLogCompleted: true,
      hasNutritionIntake: true,
    });
    const voeding = actions.find((action) => action.domain === "voeding");
    expect(voeding?.actionKind).toBe("result");
    expect(voeding?.href).toContain("resultaten=true");
  });

  it("offers slaapanalyse when sleep focus exists", () => {
    const actions = buildKompasDomainActions({
      model: baseModel({
        sleepFocus: {
          focusLabel: "Doorslapen",
          focusDimension: "doorslapen",
          conclusionText: "Je slaap is wisselend.",
          actions: [],
          chosenActions: [],
          date: "2026-07-20",
        },
      }),
      nutritionLogCompleted: false,
      hasNutritionIntake: false,
    });
    const slaap = actions.find((action) => action.domain === "slaap");
    expect(slaap?.actionKind).toBe("result");
    expect(slaap?.internalAction).toBe("open_domain");
  });

  it("offers supplementen for beweging when nutrition log is complete", () => {
    const actions = buildKompasDomainActions({
      model: baseModel(),
      nutritionLogCompleted: true,
      hasNutritionIntake: true,
    });
    const beweging = actions.find((action) => action.domain === "beweging");
    expect(beweging?.actionKind).toBe("supplement");
    expect(beweging?.internalAction).toBe("open_supplements");
  });
});
