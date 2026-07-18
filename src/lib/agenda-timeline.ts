import {
  deriveDefaultScheduledTime,
  deriveDefaultTimeBucket,
  deriveSuggestedTimeBucket,
} from "@/lib/account-priority-pref";
import { isAgendaCategoryId } from "@/data/agenda/categories";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import type {
  AgendaBlockRecord,
  AgendaCategoryId,
  TimelineBlock,
} from "@/types/agenda";
import type { DashboardModel, PillarId } from "@/types/dashboard";

export const TIMELINE_START_HOUR = 7;
export const TIMELINE_END_HOUR = 22;
export const TIMELINE_SEGMENT_COUNT = TIMELINE_END_HOUR - TIMELINE_START_HOUR;
export const TIMELINE_START_MINUTES = TIMELINE_START_HOUR * 60;
export const TIMELINE_END_MINUTES = TIMELINE_END_HOUR * 60;
export const TIMELINE_TOTAL_MINUTES = TIMELINE_END_MINUTES - TIMELINE_START_MINUTES;
export const ANALYSIS_BLOCK_DURATION_MINUTES = 45;
export const DEFAULT_BLOCK_DURATION_MINUTES = 30;
export const TIMELINE_SNAP_MINUTES = 15;

const HOUR_LABELS = Array.from(
  { length: TIMELINE_END_HOUR - TIMELINE_START_HOUR + 1 },
  (_, index) => TIMELINE_START_HOUR + index,
);

export function getTimelineHourLabels(): number[] {
  return HOUR_LABELS;
}

export function getTimelineTrackHeightPx(hourHeightPx: number): number {
  return TIMELINE_SEGMENT_COUNT * hourHeightPx;
}

export function getHourMarkerTopPx(hour: number, hourHeightPx: number): number {
  const trackHeight = getTimelineTrackHeightPx(hourHeightPx);
  const hourIndex = hour - TIMELINE_START_HOUR;
  return (hourIndex / TIMELINE_SEGMENT_COUNT) * trackHeight;
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function clampTimelineMinutes(minutes: number): number {
  return Math.min(Math.max(minutes, TIMELINE_START_MINUTES), TIMELINE_END_MINUTES);
}

export function snapTimelineMinutes(
  minutes: number,
  step = TIMELINE_SNAP_MINUTES,
): number {
  return Math.round(minutes / step) * step;
}

export function positionToTimelineTime(
  offsetY: number,
  trackHeightPx: number,
  durationMinutes = DEFAULT_BLOCK_DURATION_MINUTES,
): { startTime: string; endTime: string } {
  if (trackHeightPx <= 0) {
    return { startTime: "12:00", endTime: "12:30" };
  }

  const ratio = Math.min(Math.max(offsetY / trackHeightPx, 0), 1);
  const rawMinutes = TIMELINE_START_MINUTES + ratio * TIMELINE_TOTAL_MINUTES;
  const snappedStart = clampTimelineMinutes(snapTimelineMinutes(rawMinutes));
  const endMinutes = clampTimelineMinutes(snappedStart + durationMinutes);
  const startMinutes = Math.max(TIMELINE_START_MINUTES, endMinutes - durationMinutes);

  return {
    startTime: minutesToTime(startMinutes),
    endTime: minutesToTime(endMinutes),
  };
}

export function getBlockTimelineStyle(startTime: string, endTime: string): {
  topPercent: number;
  heightPercent: number;
} {
  const start = clampTimelineMinutes(timeToMinutes(startTime));
  const end = clampTimelineMinutes(Math.max(timeToMinutes(endTime), start + 15));
  const topPercent =
    ((start - TIMELINE_START_MINUTES) / TIMELINE_TOTAL_MINUTES) * 100;
  const heightPercent =
    ((end - start) / TIMELINE_TOTAL_MINUTES) * 100;
  return {
    topPercent,
    heightPercent: Math.max(heightPercent, 4),
  };
}

function domainToCategoryId(domain: PillarId): AgendaCategoryId {
  return isAgendaCategoryId(domain) ? domain : "persoonlijke_routine";
}

function resolveScheduledTime(model: DashboardModel, slot: WeekDaySlot): string {
  if (slot.isToday && model.scheduledTime) {
    return model.scheduledTime;
  }
  const bucket = slot.isToday
    ? (model.timeBucket ?? deriveDefaultTimeBucket())
    : deriveSuggestedTimeBucket(slot.domain);
  return deriveDefaultScheduledTime(bucket);
}

function isPlanStepHidden(model: DashboardModel, slot: WeekDaySlot): boolean {
  return (
    model.planStepsHidden ||
    (model.planStepDismissedDate != null &&
      model.planStepDismissedDate === slot.date)
  );
}

function buildAnalysisBlock(model: DashboardModel, slot: WeekDaySlot): TimelineBlock {
  const startTime = resolveScheduledTime(model, slot);
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = Math.min(
    startMinutes + ANALYSIS_BLOCK_DURATION_MINUTES,
    TIMELINE_END_MINUTES,
  );

  return {
    id: `analysis:${slot.date}`,
    kind: "analysis",
    categoryId: domainToCategoryId(slot.domain),
    title: slot.title,
    startTime,
    endTime: minutesToTime(endMinutes),
    done: false,
    source: "analysis",
    isEditable: slot.isToday,
    slot,
    domain: slot.domain,
  };
}

export function buildPlanStepBlock(
  model: DashboardModel,
  slot: WeekDaySlot,
): TimelineBlock | null {
  if (isPlanStepHidden(model, slot)) {
    return null;
  }
  return buildAnalysisBlock(model, slot);
}

function mapRoutineBlock(block: AgendaBlockRecord): TimelineBlock {
  const kind = block.source.startsWith("external:") ? "external" : "routine";
  return {
    id: block.id,
    kind,
    categoryId: block.categoryId,
    title: block.title,
    startTime: block.startTime,
    endTime: block.endTime,
    done: block.status === "done",
    source: block.source,
    isEditable: kind === "routine",
  };
}

export function buildDayTimeline(
  _model: DashboardModel,
  slot: WeekDaySlot,
  routineBlocks: AgendaBlockRecord[],
  externalBlocks: TimelineBlock[] = [],
): TimelineBlock[] {
  const dayRoutineBlocks = routineBlocks
    .filter((block) => block.date === slot.date)
    .map(mapRoutineBlock);
  const dayExternalBlocks = externalBlocks.filter((block) =>
    block.id.startsWith(`external:${slot.date}:`),
  );

  const timelineBlocks = [...dayRoutineBlocks, ...dayExternalBlocks];

  return timelineBlocks.sort(
    (left, right) => timeToMinutes(left.startTime) - timeToMinutes(right.startTime),
  );
}

export function getCurrentTimelineMinutes(now = new Date()): number {
  const formatted = new Intl.DateTimeFormat("nl-NL", {
    timeZone: "Europe/Amsterdam",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).format(now);
  const [hours, minutes] = formatted.split(":").map(Number);
  return hours * 60 + minutes;
}

export function getNowLinePercent(now = new Date()): number | null {
  const minutes = getCurrentTimelineMinutes(now);
  if (minutes < TIMELINE_START_MINUTES || minutes > TIMELINE_END_MINUTES) {
    return null;
  }
  return ((minutes - TIMELINE_START_MINUTES) / TIMELINE_TOTAL_MINUTES) * 100;
}

export function formatTimelineHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}
