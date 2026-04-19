/**
 * Reminder-type normalisatie voor `intake_reminders` (alleen nog o.a. handmatige dag-30 herinnering).
 * De nurture-sequentie staat in `nurture_emails` (zie `scheduleNurtureSequence`).
 */
export const NURTURE_REMINDER_TYPES = [
  "welcome",
  "day3",
  "day7",
  "day14",
  "day21",
  "day30",
] as const;

export type NurtureReminderType = (typeof NURTURE_REMINDER_TYPES)[number];

export function normalizeReminderType(raw: string): NurtureReminderType {
  if (raw === "30d") {
    return "day30";
  }
  if (NURTURE_REMINDER_TYPES.includes(raw as NurtureReminderType)) {
    return raw as NurtureReminderType;
  }
  return "day30";
}
