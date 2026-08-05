import { getAgendaCategory, isAgendaCategoryId } from "@/data/agenda/categories";
import { PILLAR } from "@/data/dashboard";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import { resolvePlanStepDuration } from "@/lib/agenda-plan-duration";
import { isPlanStepHidden, resolveScheduledTime } from "@/lib/day-model";
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
/** Week-kolomgrid: lege slots snappen op halve uren (Dag-timeline blijft 15 min). */
export const WEEK_GRID_SNAP_MINUTES = 30;

/**
 * De percentage-hoogte van een blok blijft de eerlijke claim op de tijd; alleen
 * de gerenderde chip krijgt een bodem in pixels, zodat een kwartierblok zijn
 * herkomst-label plus één titelregel kwijt kan in plaats van beide dood te
 * knippen.
 */
export const TIMELINE_MIN_BLOCK_HEIGHT_PX = 50;
/** Daaronder valt de tijdregel weg: herkomst en titel gaan voor. */
export const TIMELINE_COMPACT_BLOCK_HEIGHT_PX = 58;

const HOUR_LABELS = Array.from(
  { length: TIMELINE_END_HOUR - TIMELINE_START_HOUR + 1 },
  (_, index) => TIMELINE_START_HOUR + index,
);

const HALF_HOUR_MARKS = Array.from(
  { length: TIMELINE_SEGMENT_COUNT },
  (_, index) => TIMELINE_START_HOUR + index + 0.5,
);

export function getTimelineHourLabels(): number[] {
  return HOUR_LABELS;
}

/**
 * Halfuurlijnen (7.5 … 21.5) — alleen raster, nooit een label: het uur draagt
 * de tijd, het halfuur draagt de precisie.
 */
export function getTimelineHalfHourMarks(): number[] {
  return HALF_HOUR_MARKS;
}

export function getTimelineTrackHeightPx(hourHeightPx: number): number {
  return TIMELINE_SEGMENT_COUNT * hourHeightPx;
}

/** Accepteert ook halve uren (bijv. 7.5) voor de halfuurlijnen. */
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
  snapStep = TIMELINE_SNAP_MINUTES,
): { startTime: string; endTime: string } {
  if (trackHeightPx <= 0) {
    return { startTime: "12:00", endTime: "12:30" };
  }

  const ratio = Math.min(Math.max(offsetY / trackHeightPx, 0), 1);
  const rawMinutes = TIMELINE_START_MINUTES + ratio * TIMELINE_TOTAL_MINUTES;
  const snappedStart = clampTimelineMinutes(snapTimelineMinutes(rawMinutes, snapStep));
  const endMinutes = clampTimelineMinutes(snappedStart + durationMinutes);
  const startMinutes = Math.max(TIMELINE_START_MINUTES, endMinutes - durationMinutes);

  return {
    startTime: minutesToTime(startMinutes),
    endTime: minutesToTime(endMinutes),
  };
}

export function positionToWeekGridTime(
  offsetY: number,
  trackHeightPx: number,
  durationMinutes = DEFAULT_BLOCK_DURATION_MINUTES,
): { startTime: string; endTime: string } {
  return positionToTimelineTime(
    offsetY,
    trackHeightPx,
    durationMinutes,
    WEEK_GRID_SNAP_MINUTES,
  );
}

export function buildWeekColumnBlocks(
  model: DashboardModel,
  date: string,
  slot: WeekDaySlot | null,
  routineBlocks: AgendaBlockRecord[],
  planStepDone = false,
): TimelineBlock[] {
  const dayBlocks = buildDayTimeline(model, { date }, routineBlocks);
  if (!slot) {
    return dayBlocks;
  }
  const placement = resolvePlanStepPlacement(model, slot);
  const planStep = buildPlanStepBlock(model, slot, planStepDone);
  if (placement !== "grid" || !planStep) {
    return dayBlocks;
  }
  return [...dayBlocks, planStep].sort(
    (left, right) => timeToMinutes(left.startTime) - timeToMinutes(right.startTime),
  );
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

export function getBlockTimelineHeightPx(
  startTime: string,
  endTime: string,
  hourHeightPx: number,
): number {
  const { heightPercent } = getBlockTimelineStyle(startTime, endTime);
  const rawHeight = (heightPercent / 100) * getTimelineTrackHeightPx(hourHeightPx);
  return Math.max(rawHeight, TIMELINE_MIN_BLOCK_HEIGHT_PX);
}

export function isCompactTimelineBlock(
  startTime: string,
  endTime: string,
  hourHeightPx: number,
): boolean {
  return (
    getBlockTimelineHeightPx(startTime, endTime, hourHeightPx) <
    TIMELINE_COMPACT_BLOCK_HEIGHT_PX
  );
}

export type TimelineBlockRole = "basis" | "aanvulling" | null;

/**
 * Basis versus aanvulling is een herkomst-label, geen voortgangslabel: de
 * plan-stap is je basis omdat het plan hem aandraagt, een eigen moment is
 * aanvulling omdat jij hem ernaast zette. Een geïmporteerde afspraak is geen
 * van beide. Het label zegt niets over gedaan-zijn — dat blijft
 * `daily_action_log` (verdict KILL 8).
 */
export function resolveBlockRole(block: TimelineBlock): TimelineBlockRole {
  if (block.kind === "analysis") {
    return "basis";
  }
  if (block.kind === "routine") {
    return "aanvulling";
  }
  return null;
}

export function getBlockRoleLabel(block: TimelineBlock): string {
  const baseLabel =
    block.kind === "analysis" && block.domain
      ? PILLAR[block.domain].label
      : getAgendaCategory(block.categoryId).label;
  const role = resolveBlockRole(block);
  return role ? `${baseLabel} · ${role}` : baseLabel;
}

function domainToCategoryId(domain: PillarId): AgendaCategoryId {
  return isAgendaCategoryId(domain) ? domain : "persoonlijke_routine";
}

function buildAnalysisBlock(
  model: DashboardModel,
  slot: WeekDaySlot,
  done: boolean,
  logKeys?: readonly string[],
): TimelineBlock {
  const startTime = resolveScheduledTime(model, slot);
  const startMinutes = timeToMinutes(startTime);
  const { durationMinutes, durationLabel } = resolvePlanStepDuration(
    model,
    slot,
    logKeys,
  );
  const endMinutes = Math.min(
    startMinutes + durationMinutes,
    TIMELINE_END_MINUTES,
  );

  return {
    id: `analysis:${slot.date}`,
    kind: "analysis",
    categoryId: domainToCategoryId(slot.domain),
    title: slot.title,
    startTime,
    endTime: minutesToTime(endMinutes),
    durationLabel,
    // Completie van de plan-stap leeft in daily_action_log en nergens anders:
    // de aanroeper geeft de al geresolveerde staat door (isTodayActionDone voor
    // vandaag, isWeekSlotCompleted in de weekkolommen). Dit veld is dus een
    // readout, geen tweede grootboek — het blok slaat niets op.
    done,
    source: "analysis",
    isEditable: slot.isToday,
    slot,
    domain: slot.domain,
  };
}

export function buildPlanStepBlock(
  model: DashboardModel,
  slot: WeekDaySlot,
  done = false,
  logKeys?: readonly string[],
): TimelineBlock | null {
  if (isPlanStepHidden(model, slot)) {
    return null;
  }
  return buildAnalysisBlock(model, slot, done, logKeys);
}

export type PlanStepPlacement = "hidden" | "tray" | "grid";

/**
 * Tray of raster (verdict §A2c). Een blok in het uurraster is een claim op een
 * tijdstip; die claim mag alleen bestaan als de gebruiker zelf een tijd zette
 * (`scheduled_time`). Een bucket of een afgeleide default blijft in de tray —
 * anders geeft de app elke dag een afspraak die niemand maakte.
 */
export function resolvePlanStepPlacement(
  model: DashboardModel,
  slot: WeekDaySlot,
): PlanStepPlacement {
  if (isPlanStepHidden(model, slot)) {
    return "hidden";
  }
  return slot.isToday && model.scheduledTime ? "grid" : "tray";
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

/**
 * `day` is bewust alleen een datum-drager: dagen buiten de engine-week hebben
 * geen WeekDaySlot maar wel gewone momenten.
 */
export function buildDayTimeline(
  _model: DashboardModel,
  day: Pick<WeekDaySlot, "date">,
  routineBlocks: AgendaBlockRecord[],
  externalBlocks: TimelineBlock[] = [],
): TimelineBlock[] {
  const dayRoutineBlocks = routineBlocks
    .filter((block) => block.date === day.date)
    .map(mapRoutineBlock);
  const dayExternalBlocks = externalBlocks.filter((block) =>
    block.id.startsWith(`external:${day.date}:`),
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
