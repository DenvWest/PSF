import { getPlanTemplate } from "@/data/lifestyle-plans";
import type { QuestionId } from "@/data/intake-questions";
import {
  buildPlanIntakeContext,
  computeCurrentPhaseId,
  selectVisibleSteps,
} from "@/lib/lifestyle-plan-eval";
import { getPrimaryTheme, type MeasuredPillarId } from "@/lib/primary-theme";
import { buildHabitScoreKernel } from "@/lib/vitality-habit-kernel";
import type { DomainScores } from "@/lib/intake-engine";
import type { PillarId } from "@/types/dashboard";
import type {
  PlanProgress,
  PlanStep,
  PlanStepState,
} from "@/types/lifestyle-plan";

const PILLAR_TO_PLAN_DOMAIN: Partial<Record<PillarId, MeasuredPillarId>> = {
  slaap: "sleep",
  voeding: "nutrition",
  beweging: "movement",
};

export type ActivePlanHabit = {
  source: "plan" | "kernel";
  domain: MeasuredPillarId | null;
  phaseId: string | null;
  stepId: string;
  title: string;
  detail: string | null;
  state: PlanStepState | null;
  planHref: string | null;
};

export function resolvePlanDomain(
  priorityId: PillarId,
  domainScores: DomainScores,
  answers: Record<string, number>,
): MeasuredPillarId | null {
  const direct = PILLAR_TO_PLAN_DOMAIN[priorityId];
  if (direct && getPlanTemplate(direct)) {
    return direct;
  }

  const primary = getPrimaryTheme(domainScores, answers);
  return getPlanTemplate(primary) ? primary : null;
}

function getStepState(
  progress: PlanProgress | null,
  stepId: string,
): PlanStepState {
  const state = progress?.steps[stepId]?.state;
  if (
    state === "todo" ||
    state === "doing" ||
    state === "done" ||
    state === "skipped"
  ) {
    return state;
  }
  return "todo";
}

function findActivePlanStep(
  steps: Record<string, PlanStepState | undefined>,
  visibleSteps: PlanStep[],
): PlanStep | null {
  for (const step of visibleSteps) {
    const state = steps[step.id] ?? "todo";
    if (state !== "done" && state !== "skipped") {
      return step;
    }
  }
  return visibleSteps[visibleSteps.length - 1] ?? null;
}

export function buildActivePlanHabit(options: {
  priorityId: PillarId;
  priorityScore: number;
  vitality: number;
  domainScores: DomainScores;
  answers: Record<string, number> | null;
  progress: PlanProgress | null;
}): ActivePlanHabit | null {
  const { priorityId, priorityScore, vitality, domainScores, answers, progress } =
    options;

  if (!answers) {
    return null;
  }

  const normalizedAnswers = answers as Record<QuestionId, number>;
  const kernel = buildHabitScoreKernel({
    vitality,
    priorityId,
    priorityScore,
    answers,
    domainScores,
  });

  const planDomain = resolvePlanDomain(priorityId, domainScores, answers);
  const template = planDomain ? getPlanTemplate(planDomain) : undefined;

  if (!template || !planDomain) {
    return {
      source: "kernel",
      domain: null,
      phaseId: null,
      stepId: kernel.driverHabitId,
      title: kernel.nextBestHabit.replace(/^Focus nu:\s*/i, ""),
      detail: kernel.driverHabitLine,
      state: null,
      planHref: null,
    };
  }

  const ctx = buildPlanIntakeContext(
    domainScores,
    normalizedAnswers,
    planDomain,
  );
  const stepStates = Object.fromEntries(
    Object.entries(progress?.steps ?? {}).map(([id, entry]) => [id, entry.state]),
  ) as Record<string, PlanStepState>;
  const phaseStepStates = Object.fromEntries(
    Object.entries(progress?.steps ?? {}).map(([id, entry]) => [
      id,
      { state: entry.state },
    ]),
  );
  const currentPhaseId =
    progress?.currentPhaseId ??
    computeCurrentPhaseId(template.phases, ctx, phaseStepStates);
  const phase = template.phases.find((entry) => entry.id === currentPhaseId);

  if (!phase) {
    return {
      source: "kernel",
      domain: planDomain,
      phaseId: null,
      stepId: kernel.driverHabitId,
      title: kernel.nextBestHabit.replace(/^Focus nu:\s*/i, ""),
      detail: kernel.driverHabitLine,
      state: null,
      planHref: `/intake/plan/${planDomain}`,
    };
  }

  const visibleSteps = selectVisibleSteps(phase, ctx);
  const activeStep = findActivePlanStep(stepStates, visibleSteps);

  if (!activeStep) {
    return null;
  }

  const state = getStepState(progress, activeStep.id);

  return {
    source: "plan",
    domain: planDomain,
    phaseId: phase.id,
    stepId: activeStep.id,
    title: activeStep.title,
    detail: activeStep.rationale?.body ?? null,
    state,
    planHref: `/intake/plan/${planDomain}`,
  };
}
