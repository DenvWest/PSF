import { movementPlanTemplate } from "@/data/lifestyle-plans/movement";
import type { QuestionId } from "@/data/intake-questions";
import type { DomainScores } from "@/lib/intake-engine";
import {
  buildPlanIntakeContext,
  computeCurrentPhaseId,
} from "@/lib/lifestyle-plan-eval";
import type { PlanProgress, PlanStepProgress } from "@/types/lifestyle-plan";

/**
 * Lock 5 (BLAUWDRUK_STAPPENPLAN_ROADMAP_EN_SPORTLAAG §5.1): de positie op de
 * route is AFGELEID uit de daily-log, niet uit de opgeslagen `plan_progress`.
 *
 * Dit is de ENE plek waar die afleiding gebeurt. Overzicht-hero en route-ladder
 * consumeren het resultaat via `model.movementPlanProgress`, zodat ze dezelfde
 * fase tonen als het stappenplan (dat al uit de daily-log leest). De opgeslagen
 * `current_phase_id` is hooguit een cache voor de metadata-velden, nooit de bron
 * van de fase.
 */
export function deriveMovementRouteProgress(input: {
  domainScores: DomainScores;
  answers: Record<string, number>;
  /** Vandaag + deze week gelogde stap-sleutels uit `daily_action_log`. */
  loggedStepIds: readonly string[];
  /** Opgeslagen voortgang: levert alleen de metadata-velden. */
  base: PlanProgress | null;
  sessionId: string;
}): PlanProgress {
  const ctx = buildPlanIntakeContext(
    input.domainScores,
    input.answers as Record<QuestionId, number>,
    "movement",
  );

  const now = new Date().toISOString();
  const steps: Record<string, PlanStepProgress> = {};
  const phaseStepStates: Record<string, { state: "done" }> = {};
  for (const stepId of input.loggedStepIds) {
    steps[stepId] = {
      stepId,
      state: "done",
      updatedAt: input.base?.steps[stepId]?.updatedAt ?? now,
    };
    phaseStepStates[stepId] = { state: "done" };
  }

  const currentPhaseId = computeCurrentPhaseId(
    movementPlanTemplate.phases,
    ctx,
    phaseStepStates,
  );

  return {
    sessionId: input.base?.sessionId ?? input.sessionId,
    organizationId: input.base?.organizationId ?? "",
    domain: "movement",
    templateVersion: input.base?.templateVersion ?? movementPlanTemplate.version,
    currentPhaseId,
    steps,
    startedAt: input.base?.startedAt ?? now,
    updatedAt: now,
    completedAt: input.base?.completedAt ?? null,
  };
}
