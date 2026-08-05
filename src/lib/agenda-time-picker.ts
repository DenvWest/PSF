import {
  deriveDefaultScheduledTime,
  type TimeBucket,
} from "@/lib/account-priority-pref";
import {
  clampTimelineMinutes,
  minutesToTime,
  snapTimelineMinutes,
  TIMELINE_END_HOUR,
  TIMELINE_SNAP_MINUTES,
  TIMELINE_START_HOUR,
  timeToMinutes,
} from "@/lib/agenda-timeline";

export const AGENDA_DURATION_CHOICES = [15, 30, 45, 60] as const;

export type AgendaDurationMinutes = (typeof AGENDA_DURATION_CHOICES)[number];

export const BUCKET_SHORTCUTS: ReadonlyArray<{
  bucket: TimeBucket;
  label: string;
  time: string;
}> = [
  { bucket: "ochtend", label: "Ochtend", time: deriveDefaultScheduledTime("ochtend") },
  { bucket: "middag", label: "Middag", time: deriveDefaultScheduledTime("middag") },
  { bucket: "avond", label: "Avond", time: deriveDefaultScheduledTime("avond") },
];

export function buildQuarterHourSlots(): string[] {
  const startMinutes = TIMELINE_START_HOUR * 60;
  const endMinutes = TIMELINE_END_HOUR * 60;
  const slots: string[] = [];
  for (
    let minutes = startMinutes;
    minutes <= endMinutes;
    minutes += TIMELINE_SNAP_MINUTES
  ) {
    slots.push(minutesToTime(minutes));
  }
  return slots;
}

export function resolvePickerDisplayTime(
  value: string | null,
  defaultBucket: TimeBucket,
): string {
  return value ?? deriveDefaultScheduledTime(defaultBucket);
}

export function adjustPickerTime(time: string, deltaMinutes: number): string {
  const snapped = snapTimelineMinutes(timeToMinutes(time) + deltaMinutes);
  const clamped = clampTimelineMinutes(snapped);
  return minutesToTime(clamped);
}

export function endTimeFromStartAndDuration(
  startTime: string,
  durationMinutes: number,
): string {
  const start = timeToMinutes(startTime);
  const end = clampTimelineMinutes(start + durationMinutes);
  return minutesToTime(Math.max(end, start + 15));
}

export function durationMinutesFromRange(
  startTime: string,
  endTime: string,
): AgendaDurationMinutes {
  const diff = Math.max(15, timeToMinutes(endTime) - timeToMinutes(startTime));
  const match = AGENDA_DURATION_CHOICES.find((choice) => choice === diff);
  if (match) {
    return match;
  }
  const nearest = AGENDA_DURATION_CHOICES.reduce((best, choice) =>
    Math.abs(choice - diff) < Math.abs(best - diff) ? choice : best,
  );
  return nearest;
}
