import { buildWeekSchedulePreview } from "@/lib/agenda-week-preview";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import type { DashboardModel } from "@/types/dashboard";

/**
 * Mijn Dag toont elke ISO-dag, maar de engine kent er maar zeven: de
 * calendar-week van vandaag. Buiten die week bestaat er geen dagstap — dan
 * toont de dag alleen eigen momenten en verdwijnt de plan-stap-UI. Een
 * verzonnen WeekDaySlot voor zo'n dag zou een advies suggereren dat de engine
 * nooit gaf.
 */
export type AgendaDayContext =
  | { kind: "engine"; date: string; slot: WeekDaySlot }
  | { kind: "orphan"; date: string };

export function findEngineSlot(
  slots: readonly WeekDaySlot[],
  date: string,
): WeekDaySlot | null {
  return slots.find((slot) => slot.date === date) ?? null;
}

export function resolveAgendaDayContext(
  model: DashboardModel,
  date: string,
  slots?: readonly WeekDaySlot[],
): AgendaDayContext {
  const engineSlots = slots ?? buildWeekSchedulePreview(model);
  const slot = findEngineSlot(engineSlots, date);
  return slot ? { kind: "engine", date, slot } : { kind: "orphan", date };
}

export function isAgendaEngineDate(
  slots: readonly WeekDaySlot[],
  date: string,
): boolean {
  return findEngineSlot(slots, date) !== null;
}
