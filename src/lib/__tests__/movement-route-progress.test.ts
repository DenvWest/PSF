import { describe, expect, it } from "vitest";
import { deriveMovementRouteProgress } from "@/lib/movement-route-progress";
import { movementPlanTemplate } from "@/data/lifestyle-plans/movement";
import {
  buildPlanIntakeContext,
  selectVisibleSteps,
} from "@/lib/lifestyle-plan-eval";
import type { QuestionId } from "@/data/intake-questions";
import type { DomainScores } from "@/lib/intake-engine";
import type { PlanProgress } from "@/types/lifestyle-plan";

const SCORES: DomainScores = {
  sleep_score: 60,
  energy_score: 60,
  stress_score: 60,
  nutrition_score: 60,
  movement_score: 60,
  recovery_score: 60,
  connection_score: 60,
};

const ANSWERS: Record<string, number> = { MOV_STR: 2 };

const FIRST_PHASE_ID = movementPlanTemplate.phases[0].id;
const LAST_PHASE_ID =
  movementPlanTemplate.phases[movementPlanTemplate.phases.length - 1].id;

function staleBase(): PlanProgress {
  // Opgeslagen voortgang met een verouderde fase (fase 3) en geen gelogde stappen.
  return {
    sessionId: "sess-1",
    organizationId: "org-1",
    domain: "movement",
    templateVersion: "old-version",
    currentPhaseId: LAST_PHASE_ID,
    steps: {},
    startedAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    completedAt: null,
  };
}

describe("deriveMovementRouteProgress (lock 5 — positie is afgeleid)", () => {
  it("negeert de opgeslagen current_phase_id: lege daily-log ⇒ eerste fase", () => {
    const progress = deriveMovementRouteProgress({
      domainScores: SCORES,
      answers: ANSWERS,
      loggedStepIds: [],
      base: staleBase(), // opgeslagen fase 3
      sessionId: "sess-1",
    });

    // De opslag beweert fase 3; de daily-log is leeg, dus de afleiding = fase 1.
    expect(progress.currentPhaseId).toBe(FIRST_PHASE_ID);
    expect(progress.currentPhaseId).not.toBe(LAST_PHASE_ID);
  });

  it("schuift de fase op zodra de daily-log fase 1 afrondt — zonder plan_progress", () => {
    const ctx = buildPlanIntakeContext(
      SCORES,
      ANSWERS as Record<QuestionId, number>,
      "movement",
    );
    const firstPhaseStepIds = selectVisibleSteps(
      movementPlanTemplate.phases[0],
      ctx,
    ).map((step) => step.id);
    expect(firstPhaseStepIds.length).toBeGreaterThan(0);

    const progress = deriveMovementRouteProgress({
      domainScores: SCORES,
      answers: ANSWERS,
      loggedStepIds: firstPhaseStepIds,
      base: null, // account-user zonder plan_progress
      sessionId: "sess-2",
    });

    expect(progress.currentPhaseId).not.toBe(FIRST_PHASE_ID);
    for (const stepId of firstPhaseStepIds) {
      expect(progress.steps[stepId]?.state).toBe("done");
    }
  });

  it("draagt metadata over uit de opslag, maar nooit de fase", () => {
    const progress = deriveMovementRouteProgress({
      domainScores: SCORES,
      answers: ANSWERS,
      loggedStepIds: [],
      base: staleBase(),
      sessionId: "ignored-when-base-present",
    });

    expect(progress.sessionId).toBe("sess-1");
    expect(progress.templateVersion).toBe("old-version");
    expect(progress.currentPhaseId).toBe(FIRST_PHASE_ID);
  });
});
