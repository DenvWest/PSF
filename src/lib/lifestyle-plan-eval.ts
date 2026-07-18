import type { QuestionId } from "@/data/intake-questions";
import { PILLAR_SCORE_KEYS } from "@/data/foundation-pyramid";
import type { DomainScores } from "@/lib/intake-engine";
import {
  getDeficiencySignals,
  getProfileLabel,
} from "@/lib/intake-engine";
import {
  getSecondaryTheme,
  type MeasuredPillarId,
} from "@/lib/primary-theme";
import type {
  PlanCondition,
  PlanIntakeContext,
  PlanPhase,
  PlanStep,
} from "@/types/lifestyle-plan";

export function buildPlanIntakeContext(
  scores: DomainScores,
  answers: Record<string, number>,
  primaryTheme: MeasuredPillarId,
  secondaryTheme?: MeasuredPillarId | null,
): PlanIntakeContext {
  const profile = getProfileLabel(scores);
  const normalizedAnswers = answers as Record<QuestionId, number>;

  return {
    primaryTheme,
    secondaryTheme:
      secondaryTheme !== undefined
        ? secondaryTheme
        : getSecondaryTheme(scores, answers, primaryTheme),
    scores,
    profileName: profile.name,
    signals: getDeficiencySignals(answers),
    answers: normalizedAnswers,
  };
}

export function evaluatePlanCondition(
  condition: PlanCondition,
  ctx: PlanIntakeContext,
): boolean {
  switch (condition.type) {
    case "always":
      return true;
    case "signal":
      return ctx.signals[condition.signal] === true;
    case "scoreBelow": {
      const scoreKey = PILLAR_SCORE_KEYS[condition.domain];
      if (!scoreKey) {
        return false;
      }
      const score = ctx.scores[scoreKey];
      return Number.isFinite(score) && score < condition.value;
    }
    case "profileIs":
      return ctx.profileName === condition.profile;
    case "answerAtMost": {
      const value = ctx.answers[condition.question];
      return typeof value === "number" && value <= condition.value;
    }
    case "answerAtLeast": {
      const value = ctx.answers[condition.question];
      return typeof value === "number" && value >= condition.value;
    }
    case "answerEquals": {
      const value = ctx.answers[condition.question];
      return typeof value === "number" && value === condition.value;
    }
    default: {
      const _exhaustive: never = condition;
      return _exhaustive;
    }
  }
}

export function selectVisibleSteps(
  phase: PlanPhase,
  ctx: PlanIntakeContext,
): PlanStep[] {
  return phase.steps.filter(
    (step) =>
      !step.showWhen || evaluatePlanCondition(step.showWhen, ctx),
  );
}

export function isPhaseComplete(
  phase: PlanPhase,
  ctx: PlanIntakeContext,
  steps: Record<string, { state: string }>,
): boolean {
  const visible = selectVisibleSteps(phase, ctx);
  if (visible.length === 0) {
    return true;
  }
  return visible.every((step) => {
    const state = steps[step.id]?.state;
    return state === "done" || state === "skipped";
  });
}

export function computeCurrentPhaseId(
  phases: readonly PlanPhase[],
  ctx: PlanIntakeContext,
  steps: Record<string, { state: string }>,
): string {
  for (const phase of phases) {
    if (!isPhaseComplete(phase, ctx, steps)) {
      return phase.id;
    }
  }
  return phases[phases.length - 1]?.id ?? "";
}

export function isPlanComplete(
  phases: readonly PlanPhase[],
  ctx: PlanIntakeContext,
  steps: Record<string, { state: string }>,
): boolean {
  return phases.every((phase) => isPhaseComplete(phase, ctx, steps));
}
