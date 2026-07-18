import { describe, expect, it } from "vitest";
import { movementPlanTemplate } from "@/data/lifestyle-plans/movement";
import {
  buildPlanIntakeContext,
  selectVisibleSteps,
} from "@/lib/lifestyle-plan-eval";
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
  return buildPlanIntakeContext(
    BASE_SCORES,
    answers,
    "movement",
    null,
  );
}

function visibleStepIds(
  phaseId: string,
  answers: Record<string, number>,
): string[] {
  const phase = movementPlanTemplate.phases.find((item) => item.id === phaseId);
  if (!phase) {
    throw new Error(`Unknown phase ${phaseId}`);
  }
  return selectVisibleSteps(phase, ctxForAnswers(answers)).map((step) => step.id);
}

describe("movement plan personalization bands", () => {
  it("shows starter kracht + cardio steps when both dimensions are low", () => {
    const ids = visibleStepIds("mov-phase-deze-week", { MOV_STR: 1, MOV_CARD: 1 });
    expect(ids).toContain("mov-thuis-basisoefening");
    expect(ids).toContain("mov-trap-of-wandeling");
    expect(ids).not.toContain("mov-kracht-onderhoud-week");
    expect(ids).not.toContain("mov-conditie-onderhoud-week");
  });

  it("shows onderhoud steps when both dimensions are already strong", () => {
    const ids = visibleStepIds("mov-phase-deze-week", { MOV_STR: 4, MOV_CARD: 4 });
    expect(ids).toContain("mov-kracht-onderhoud-week");
    expect(ids).toContain("mov-conditie-onderhoud-week");
    expect(ids).not.toContain("mov-thuis-basisoefening");
    expect(ids).not.toContain("mov-trap-of-wandeling");
  });

  it("progresses cardio from trap/walk to zone 2 for low MOV_CARD", () => {
    const phase2 = visibleStepIds("mov-phase-week-2-4", { MOV_STR: 2, MOV_CARD: 2 });
    expect(phase2).toContain("mov-full-body-2x");
    expect(phase2).toContain("mov-conditie-zone2");
    expect(phase2).not.toContain("mov-conditie-interval-lite");
  });

  it("shows interval-lite only for redelijk MOV_CARD", () => {
    const phase2 = visibleStepIds("mov-phase-week-2-4", { MOV_STR: 3, MOV_CARD: 3 });
    expect(phase2).toContain("mov-kracht-consistentie");
    expect(phase2).toContain("mov-conditie-interval-lite");
    expect(phase2).not.toContain("mov-conditie-zone2");
    expect(phase2).not.toContain("mov-full-body-2x");
  });

  it("gates volume build to users already training strength", () => {
    const lowStrength = visibleStepIds("mov-phase-week-4-12", { MOV_STR: 2, MOV_CARD: 2 });
    const trained = visibleStepIds("mov-phase-week-4-12", { MOV_STR: 4, MOV_CARD: 4 });
    expect(lowStrength).not.toContain("mov-volume-opbouwen");
    expect(trained).toContain("mov-volume-opbouwen");
  });
});
