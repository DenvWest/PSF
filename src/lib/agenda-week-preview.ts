import { resolveDayContent } from "@/lib/day-model";
import { isReadoutDomain } from "@/lib/domain-role";
import { buildVandaagOnderbouwingHref } from "@/lib/vandaag-card-links";
import type { DashboardModel, PillarId } from "@/types/dashboard";
import type { PlanStepLink } from "@/types/lifestyle-plan";

/**
 * Agenda week-preview (precursor). Tweakable week (swap, tijdvak, agenda_preferences)
 * blijft DEFER tot retentie-trigger: 2e-dag-retour op dashboard.daily_action_toggled
 * < 30% in consented cohort, 2 opeenvolgende weken — zie fable-agenda-refine-verdict-2026-07.
 * Pool voor toekomstige MVP: selectVisibleSteps(movementPlan) uit lifestyle-plans/movement.ts.
 */

const APP_TIMEZONE = "Europe/Amsterdam";

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
    const step = resolveDayContent(model, domain, isToday, dayIndex);

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