import {
  deriveTimeBucketFromLocalTime,
  normalizeLocalTime,
  type TimeBucket,
} from "@/lib/account-priority-pref";

/**
 * Rail-geometrie voor een dagdelen-visual (06–24u). Puur en los van de agenda:
 * de instellingenpagina tekent hiermee je vaste tijd op één rail, zonder de
 * agenda-tijdlijn zelf te importeren.
 */

const RIBBON_START_HOUR = 6;
const RIBBON_END_HOUR = 24;
const RIBBON_START_MINUTES = RIBBON_START_HOUR * 60;
const RIBBON_TOTAL_MINUTES = (RIBBON_END_HOUR - RIBBON_START_HOUR) * 60;

const BUCKET_LABEL: Record<TimeBucket, string> = {
  ochtend: "Ochtend",
  middag: "Middag",
  avond: "Avond",
};

export function daypartLabel(bucket: TimeBucket): string {
  return BUCKET_LABEL[bucket];
}

/** Positie 0–1 op de rail; buiten het venster klemt hij op de rand. */
function ribbonRatioForHour(hour: number): number {
  const ratio = (hour * 60 - RIBBON_START_MINUTES) / RIBBON_TOTAL_MINUTES;
  return Math.min(1, Math.max(0, ratio));
}

export function ribbonRatioForTime(time: string | null): number | null {
  const normalized = time ? normalizeLocalTime(time) : null;
  if (!normalized) {
    return null;
  }
  const [hours, minutes] = normalized.split(":").map(Number);
  const ratio = (hours * 60 + minutes - RIBBON_START_MINUTES) / RIBBON_TOTAL_MINUTES;
  return Math.min(1, Math.max(0, ratio));
}

export type DaypartSegment = {
  id: TimeBucket;
  label: string;
  startRatio: number;
  endRatio: number;
};

export const DAYPART_SEGMENTS: readonly DaypartSegment[] = [
  { id: "ochtend", label: "Ochtend", startRatio: ribbonRatioForHour(RIBBON_START_HOUR), endRatio: ribbonRatioForHour(12) },
  { id: "middag", label: "Middag", startRatio: ribbonRatioForHour(12), endRatio: ribbonRatioForHour(17) },
  { id: "avond", label: "Avond", startRatio: ribbonRatioForHour(17), endRatio: ribbonRatioForHour(RIBBON_END_HOUR) },
] as const;

/** Vier ankers onder de rail — meer labels wordt ruis op 375px. */
export const DAYPART_HOUR_TICKS: readonly number[] = [
  RIBBON_START_HOUR,
  12,
  18,
  RIBBON_END_HOUR,
] as const;

export function describeScheduledTime(time: string | null): string {
  const normalized = time ? normalizeLocalTime(time) : null;
  if (!normalized) {
    return "Nog geen vaste tijd";
  }
  return `${daypartLabel(deriveTimeBucketFromLocalTime(normalized))} · ${normalized}`;
}
