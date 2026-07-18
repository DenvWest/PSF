import { PILLAR } from "@/data/dashboard";
import { getPlanTemplate } from "@/data/lifestyle-plans";
import type { QuestionId } from "@/data/intake-questions";
import { isReadoutDomain } from "@/lib/domain-role";
import {
  buildPlanIntakeContext,
  computeCurrentPhaseId,
  selectVisibleSteps,
} from "@/lib/lifestyle-plan-eval";
import type { MeasuredPillarId } from "@/lib/primary-theme";
import { buildVandaagOnderbouwingHref } from "@/lib/vandaag-card-links";
import type { DashboardModel, PillarId } from "@/types/dashboard";
import type { PlanStep, PlanStepLink } from "@/types/lifestyle-plan";

const APP_TIMEZONE = "Europe/Amsterdam";

const PILLAR_TO_PLAN_DOMAIN: Partial<Record<PillarId, MeasuredPillarId>> = {
  slaap: "sleep",
  stress: "stress",
  voeding: "nutrition",
  beweging: "movement",
};

const DOMAIN_SLOT_PATTERN = [0, 0, 1, 2, 0, 1, 2] as const;
const WEEKDAY_LABELS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"] as const;

export type WeekDaySlot = {
  date: string;
  dayLabel: string;
  isToday: boolean;
  dayOffset: number;
  domain: PillarId;
  stepId: string;
  title: string;
  detail: string | null;
  rationale: string | null;
  evidenceHref: string;
  planLink: PlanStepLink | null;
};

export function todayInAgendaTimezone(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function addAgendaDays(isoDate: string, offset: number): string {
  const cursor = new Date(`${isoDate}T12:00:00.000Z`);
  cursor.setUTCDate(cursor.getUTCDate() + offset);
  return cursor.toISOString().slice(0, 10);
}

function getAmsterdamWeekdayIndex(isoDate: string): number {
  const weekday =
    new Intl.DateTimeFormat("en-US", {
      timeZone: APP_TIMEZONE,
      weekday: "short",
    }).format(new Date(`${isoDate}T12:00:00.000Z`)) ?? "Mon";

  const map: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };

  return map[weekday] ?? 0;
}

/** Calendar week Mon–Sun containing anchorDate (Europe/Amsterdam). */
export function getCalendarWeekDates(anchorDate?: string): string[] {
  const today = anchorDate ?? todayInAgendaTimezone();
  const weekdayIndex = getAmsterdamWeekdayIndex(today);
  const mondayOffset = -weekdayIndex;

  return WEEKDAY_LABELS.map((_, index) => addAgendaDays(today, mondayOffset + index));
}

function formatDayLabel(dayIndex: number): string {
  return WEEKDAY_LABELS[dayIndex] ?? "Ma";
}

function interventionDomains(model: DashboardModel): PillarId[] {
  return model.ladder
    .filter((pillar) => !isReadoutDomain(pillar.id))
    .slice(0, 3)
    .map((pillar) => pillar.id);
}

function domainForDayIndex(
  dayIndex: number,
  todayIndex: number,
  priorityId: PillarId,
  topDomains: PillarId[],
): PillarId {
  if (dayIndex === todayIndex) {
    return priorityId;
  }
  const patternIndex = dayIndex % DOMAIN_SLOT_PATTERN.length;
  const ladderIndex = DOMAIN_SLOT_PATTERN[patternIndex] ?? 0;
  return topDomains[Math.min(ladderIndex, topDomains.length - 1)] ?? priorityId;
}

function resolvePlanStep(
  pillarId: PillarId,
  model: DashboardModel,
  rotateIndex: number,
): Pick<WeekDaySlot, "stepId" | "title" | "detail" | "rationale" | "planLink"> {
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

function slotFromActiveHabit(
  model: DashboardModel,
  domain: PillarId,
): Pick<WeekDaySlot, "stepId" | "title" | "detail" | "rationale" | "planLink"> {
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

export function buildWeekSchedulePreview(
  model: DashboardModel,
  anchorDate?: string,
): WeekDaySlot[] {
  const today = anchorDate ?? todayInAgendaTimezone();
  const weekDates = getCalendarWeekDates(today);
  const todayIndex = weekDates.indexOf(today);
  const topDomains = interventionDomains(model);
  const priorityId = model.priority.id;

  return weekDates.map((date, dayIndex) => {
    const isToday = date === today;
    const dayOffset = dayIndex - (todayIndex >= 0 ? todayIndex : 0);
    const domain = domainForDayIndex(dayIndex, todayIndex, priorityId, topDomains);
    const step = isToday
      ? slotFromActiveHabit(model, domain)
      : resolvePlanStep(domain, model, dayIndex);

    return {
      date,
      dayLabel: formatDayLabel(dayIndex),
      isToday,
      dayOffset,
      domain,
      evidenceHref: buildVandaagOnderbouwingHref(domain),
      ...step,
    };
  });
}

export function isWeekSlotCompleted(
  slot: WeekDaySlot,
  completedKeys: ReadonlySet<string>,
): boolean {
  return completedKeys.has(`${slot.date}:${slot.domain}`);
}