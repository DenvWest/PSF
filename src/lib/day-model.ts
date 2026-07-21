import { PILLAR } from "@/data/dashboard";
import { getPlanTemplate } from "@/data/lifestyle-plans";
import type { QuestionId } from "@/data/intake-questions";
import {
  deriveDefaultScheduledTime,
  deriveDefaultTimeBucket,
  deriveSuggestedTimeBucket,
} from "@/lib/account-priority-pref";
import {
  buildPlanIntakeContext,
  computeCurrentPhaseId,
  selectVisibleSteps,
} from "@/lib/lifestyle-plan-eval";
import type { MeasuredPillarId } from "@/lib/primary-theme";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import type { DashboardModel, PillarId } from "@/types/dashboard";
import type { PlanStep, PlanStepLink } from "@/types/lifestyle-plan";

/**
 * Day-model: de ene plek die afleidt wat er op een dag op de agenda staat
 * (content), hoe laat (tijd-resolutie) en onder welke sleutel het wordt
 * afgevinkt (actionKey). Completie hoort hier bewust NIET: agenda_blocks.status
 * en daily_action_log zijn gescheiden grootboeken die elk via hun eigen route
 * gelezen/geschreven worden (ROADMAP_DASHBOARD_COCKPIT §2.4).
 */

const PILLAR_TO_PLAN_DOMAIN: Partial<Record<PillarId, MeasuredPillarId>> = {
  slaap: "sleep",
  stress: "stress",
  voeding: "nutrition",
  beweging: "movement",
};

export type DaySlotContent = {
  stepId: string;
  title: string;
  detail: string | null;
  rationale: string | null;
  planLink: PlanStepLink | null;
};

export type DaySlot = WeekDaySlot & {
  scheduledTime: string;
  actionKey: string;
};

export function resolvePlanStepContent(
  pillarId: PillarId,
  model: DashboardModel,
  rotateIndex: number,
): DaySlotContent {
  const pillar = PILLAR[pillarId];
  const planDomain = PILLAR_TO_PLAN_DOMAIN[pillarId];
  const template = planDomain ? getPlanTemplate(planDomain) : undefined;

  if (!template || !planDomain || !model.answers) {
    return {
      stepId: `quickwin-${pillarId}`,
      title: pillar.quickWin.title,
      detail: pillar.quickWin.detail,
      rationale: null,
      planLink: null,
    };
  }

  const normalizedAnswers = model.answers as Record<QuestionId, number>;
  const ctx = buildPlanIntakeContext(
    model.domainScores,
    normalizedAnswers,
    planDomain,
  );
  const phaseStepStates = Object.fromEntries(
    Object.entries(model.planProgress?.steps ?? {}).map(([id, entry]) => [
      id,
      { state: entry.state },
    ]),
  );
  const currentPhaseId =
    model.planProgress?.currentPhaseId ??
    computeCurrentPhaseId(template.phases, ctx, phaseStepStates);
  const phase = template.phases.find((entry) => entry.id === currentPhaseId);

  if (!phase) {
    return {
      stepId: `quickwin-${pillarId}`,
      title: pillar.quickWin.title,
      detail: pillar.quickWin.detail,
      rationale: null,
      planLink: null,
    };
  }

  const visibleSteps = selectVisibleSteps(phase, ctx);
  if (visibleSteps.length === 0) {
    return {
      stepId: `quickwin-${pillarId}`,
      title: pillar.quickWin.title,
      detail: pillar.quickWin.detail,
      rationale: null,
      planLink: null,
    };
  }

  const step = visibleSteps[rotateIndex % visibleSteps.length] as PlanStep;
  return {
    stepId: step.id,
    title: step.title,
    detail: step.rationale?.body ?? null,
    rationale: step.rationale?.body ?? null,
    planLink: step.link ?? null,
  };
}

export function resolveActiveHabitContent(
  model: DashboardModel,
  domain: PillarId,
): DaySlotContent {
  const habit = model.activeHabit;
  if (!habit) {
    const pillar = PILLAR[domain];
    return {
      stepId: `quickwin-${domain}`,
      title: pillar.quickWin.title,
      detail: pillar.quickWin.detail,
      rationale: null,
      planLink: null,
    };
  }

  return {
    stepId: habit.stepId,
    title: habit.title,
    detail: habit.detail,
    rationale: habit.detail,
    planLink: null,
  };
}

export function resolveDayContent(
  model: DashboardModel,
  domain: PillarId,
  isToday: boolean,
  rotateIndex: number,
): DaySlotContent {
  return isToday
    ? resolveActiveHabitContent(model, domain)
    : resolvePlanStepContent(domain, model, rotateIndex);
}

export function resolveScheduledTime(
  model: DashboardModel,
  slot: WeekDaySlot,
): string {
  if (slot.isToday && model.scheduledTime) {
    return model.scheduledTime;
  }
  const bucket = slot.isToday
    ? (model.timeBucket ?? deriveDefaultTimeBucket())
    : deriveSuggestedTimeBucket(slot.domain);
  return deriveDefaultScheduledTime(bucket);
}

export function isPlanStepHidden(
  model: DashboardModel,
  slot: Pick<WeekDaySlot, "date">,
): boolean {
  return (
    model.planStepsHidden ||
    (model.planStepDismissedDate != null &&
      model.planStepDismissedDate === slot.date)
  );
}

/**
 * Sleutel waarmee daily_action_log wordt gelezen/geschreven voor dit slot.
 * Voor slot.isToday is de fallback een no-op (slot.stepId komt dan al uit
 * model.activeHabit via resolveActiveHabitContent) — bewust niet vereenvoudigd
 * tot slot.stepId, zodat een toekomstige wijziging in de activeHabit-resolutie
 * de schrijfsleutel niet stilzwijgend kan laten afwijken van wat getoond wordt.
 */
export function resolveActionKey(
  model: DashboardModel,
  slot: WeekDaySlot,
): string {
  return model.activeHabit?.stepId ?? slot.stepId;
}

export function buildDaySlot(model: DashboardModel, slot: WeekDaySlot): DaySlot {
  return {
    ...slot,
    scheduledTime: resolveScheduledTime(model, slot),
    actionKey: resolveActionKey(model, slot),
  };
}
