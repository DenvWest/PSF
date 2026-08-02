import { addAgendaDays, getCalendarWeekDates } from "@/lib/agenda-week-preview";

/**
 * Maandrekenwerk voor Mijn Dag › maand. Alle datums zijn ISO-strings die op
 * UTC-noon worden gerekend, gelijk aan addAgendaDays — zo kan een DST-sprong
 * nooit een dag verschuiven.
 */

const APP_TIMEZONE = "Europe/Amsterdam";

function toUtcNoon(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00.000Z`);
}

export function getMonthStart(isoDate: string): string {
  return `${isoDate.slice(0, 7)}-01`;
}

export function getMonthEnd(isoDate: string): string {
  const cursor = toUtcNoon(getMonthStart(isoDate));
  cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  cursor.setUTCDate(0);
  return cursor.toISOString().slice(0, 10);
}

export function addAgendaMonths(isoDate: string, offset: number): string {
  const cursor = toUtcNoon(getMonthStart(isoDate));
  cursor.setUTCMonth(cursor.getUTCMonth() + offset);
  return cursor.toISOString().slice(0, 10);
}

export function getMonthRange(isoDate: string): { startDate: string; endDate: string } {
  return { startDate: getMonthStart(isoDate), endDate: getMonthEnd(isoDate) };
}

export function isSameAgendaMonth(left: string, right: string): boolean {
  return left.slice(0, 7) === right.slice(0, 7);
}

/** Volledige weken (ma–zo) die de maand van `isoDate` bedekken. */
export function getMonthGridDates(isoDate: string): string[] {
  const gridStart = getCalendarWeekDates(getMonthStart(isoDate))[0];
  const gridEnd = getCalendarWeekDates(getMonthEnd(isoDate))[6];

  const dates: string[] = [];
  let cursor = gridStart;
  while (cursor <= gridEnd) {
    dates.push(cursor);
    cursor = addAgendaDays(cursor, 1);
  }
  return dates;
}

export function formatAgendaMonthLabel(isoDate: string): string {
  return new Intl.DateTimeFormat("nl-NL", {
    month: "long",
    year: "numeric",
    timeZone: APP_TIMEZONE,
  }).format(toUtcNoon(isoDate));
}

export function formatAgendaDayNumber(isoDate: string): string {
  return String(Number(isoDate.slice(8, 10)));
}
