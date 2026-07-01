import { describe, expect, it } from "vitest";
import { buildActivePlanHabit, buildPriorityInterventionHref, resolvePlanDomain } from "@/lib/dashboard-active-plan";
import { nutritionPlanTemplate } from "@/data/lifestyle-plans/nutrition";
import { stressPlanTemplate } from "@/data/lifestyle-plans/stress";

const DEV_ANSWERS: Record<string, number> = {
  SLP_QUAL: 3,
  SLP_CONS: 2,
  SLP_ONSET: 3,
  SLP_WAKE: 3,
  NRG_PATN: 3,
  NRG_DEP: 4,
  STR_FREQ: 2,
  STR_RCV: 2,
  NUT_O3: 1,
  NUT_PROT: 2,
  MOV_STR: 4,
  MOV_CARD: 4,
  RCV_PHYS: 2,
};

describe("dashboard-active-plan", () => {
  it("maps voeding priority to nutrition plan domain", () => {
    expect(
      resolvePlanDomain(
        "voeding",
        {
          sleep_score: 58,
          energy_score: 54,
          stress_score: 47,
          nutrition_score: 38,
          movement_score: 71,
          recovery_score: 51,
    connection_score: 51,
        },
        DEV_ANSWERS,
      ),
    ).toBe("nutrition");
  });

  it("maps stress priority to stress plan domain", () => {
    expect(
      resolvePlanDomain(
        "stress",
        {
          sleep_score: 58,
          energy_score: 54,
          stress_score: 35,
          nutrition_score: 47,
          movement_score: 71,
          recovery_score: 51,
    connection_score: 51,
        },
        DEV_ANSWERS,
      ),
    ).toBe("stress");
  });

  it("returns first visible nutrition plan step when no progress exists", () => {
    const habit = buildActivePlanHabit({
      priorityId: "voeding",
      priorityScore: 38,
      vitality: 53,
      domainScores: {
        sleep_score: 58,
        energy_score: 54,
        stress_score: 47,
        nutrition_score: 38,
        movement_score: 71,
        recovery_score: 51,
    connection_score: 51,
      },
      answers: DEV_ANSWERS,
      progress: null,
    });

    expect(habit?.source).toBe("plan");
    expect(habit?.domain).toBe("nutrition");
    expect(habit?.stepId).toBe(nutritionPlanTemplate.phases[0]?.steps[0]?.id);
    expect(habit?.state).toBe("todo");
    expect(habit?.planHref).toBe("/intake/plan/nutrition?from=dashboard");
  });

  it("returns first visible stress plan step when no progress exists", () => {
    const habit = buildActivePlanHabit({
      priorityId: "stress",
      priorityScore: 35,
      vitality: 53,
      domainScores: {
        sleep_score: 58,
        energy_score: 54,
        stress_score: 35,
        nutrition_score: 47,
        movement_score: 71,
        recovery_score: 51,
    connection_score: 51,
      },
      answers: DEV_ANSWERS,
      progress: null,
    });

    expect(habit?.source).toBe("plan");
    expect(habit?.domain).toBe("stress");
    expect(habit?.stepId).toBe(stressPlanTemplate.phases[0]?.steps[0]?.id);
    expect(habit?.state).toBe("todo");
  });

  it("falls back to kernel habit when answers are missing", () => {
    const habit = buildActivePlanHabit({
      priorityId: "voeding",
      priorityScore: 38,
      vitality: 53,
      domainScores: {
        sleep_score: 58,
        energy_score: 54,
        stress_score: 47,
        nutrition_score: 38,
        movement_score: 71,
        recovery_score: 51,
    connection_score: 51,
      },
      answers: null,
      progress: null,
    });

    expect(habit).toBeNull();
  });

  it("builds plan href for intervention when priority has a lifestyle plan", () => {
    const href = buildPriorityInterventionHref({
      priority: { id: "stress" } as never,
      domainScores: {
        sleep_score: 58,
        energy_score: 54,
        stress_score: 35,
        nutrition_score: 47,
        movement_score: 71,
        recovery_score: 51,
    connection_score: 51,
      },
      answers: DEV_ANSWERS,
      activeHabit: null,
    });

    expect(href).toBe("/intake/plan/stress?from=dashboard");
  });

  it("prefers active habit plan href for intervention", () => {
    const href = buildPriorityInterventionHref({
      priority: { id: "voeding" } as never,
      domainScores: {
        sleep_score: 58,
        energy_score: 54,
        stress_score: 47,
        nutrition_score: 38,
        movement_score: 71,
        recovery_score: 51,
    connection_score: 51,
      },
      answers: DEV_ANSWERS,
      activeHabit: {
        planHref: "/intake/plan/nutrition?from=dashboard",
      } as never,
    });

    expect(href).toBe("/intake/plan/nutrition?from=dashboard");
  });
});
