import { describe, expect, it } from "vitest";
import {
  buildPlanIntakeContext,
} from "@/lib/lifestyle-plan-eval";
import {
  buildMovementDailyRhythm,
  selectMovementSnacks,
} from "@/lib/movement-daily-rhythm";
import type { DomainScores } from "@/lib/intake-engine";

const BASE_SCORES: DomainScores = {
  sleep_score: 60,
  energy_score: 60,
  stress_score: 60,
  nutrition_score: 60,
  movement_score: 40,
  recovery_score: 60,
  connection_score: 60,
};

function ctxForAnswers(answers: Record<string, number>) {
  return buildPlanIntakeContext(BASE_SCORES, answers, "movement", null);
}

describe("buildMovementDailyRhythm", () => {
  it("returns four snacks and evidence href", () => {
    const rhythm = buildMovementDailyRhythm(
      ctxForAnswers({ MOV_STR: 2, MOV_CARD: 2 }),
    );
    expect(rhythm.snacks).toHaveLength(4);
    expect(rhythm.evidenceHref).toBe("/onderbouwing#MOV_SED");
  });

  it("prioritizes kracht snacks for low MOV_STR", () => {
    const snacks = selectMovementSnacks(
      ctxForAnswers({ MOV_STR: 1, MOV_CARD: 4 }),
    );
    expect(snacks[0]?.tags).toContain("kracht");
  });

  it("sets lower step target for sedentary PAL band", () => {
    const rhythm = buildMovementDailyRhythm(
      ctxForAnswers({ MOV_STR: 1, MOV_CARD: 1 }),
    );
    expect(rhythm.stepsTarget.targetSteps).toBe(7000);
  });

  it("sets higher step target for active PAL band", () => {
    const rhythm = buildMovementDailyRhythm(
      ctxForAnswers({ MOV_STR: 4, MOV_CARD: 4 }),
    );
    expect(rhythm.stepsTarget.targetSteps).toBeGreaterThanOrEqual(8500);
  });
});
