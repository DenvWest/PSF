import { describe, expect, it } from "vitest";
import { buildActivePlanHabit, resolvePlanDomain } from "@/lib/dashboard-active-plan";
import { nutritionPlanTemplate } from "@/data/lifestyle-plans/nutrition";

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
        },
        DEV_ANSWERS,
      ),
    ).toBe("nutrition");
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
      },
      answers: DEV_ANSWERS,
      progress: null,
    });

    expect(habit?.source).toBe("plan");
    expect(habit?.domain).toBe("nutrition");
    expect(habit?.stepId).toBe(nutritionPlanTemplate.phases[0]?.steps[0]?.id);
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
      },
      answers: null,
      progress: null,
    });

    expect(habit).toBeNull();
  });
});
