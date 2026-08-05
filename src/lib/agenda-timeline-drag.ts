import {
  clampTimelineMinutes,
  minutesToTime,
  timeToMinutes,
} from "@/lib/agenda-timeline";

export const TIMELINE_DRAG_ACTIVATION_PX = 8;

export type TimelineDragTimeSlot = {
  startTime: string;
  endTime: string;
};

/** Behoud blokduur bij verslepen; clamp binnen 06:00–24:00. */
export function resolveRetimeFromDrag(
  currentStart: string,
  currentEnd: string,
  nextStart: string,
): TimelineDragTimeSlot {
  const duration = Math.max(15, timeToMinutes(currentEnd) - timeToMinutes(currentStart));
  const snappedStart = timeToMinutes(nextStart);
  const endMinutes = clampTimelineMinutes(snappedStart + duration);
  const startMinutes = Math.max(
    clampTimelineMinutes(snappedStart),
    endMinutes - duration,
  );
  return {
    startTime: minutesToTime(startMinutes),
    endTime: minutesToTime(endMinutes),
  };
}

export function hasRoutineDragChanged(
  currentStart: string,
  currentEnd: string,
  next: TimelineDragTimeSlot,
): boolean {
  return next.startTime !== currentStart || next.endTime !== currentEnd;
}

export function hasPlanStepDragChanged(
  currentStart: string,
  nextStart: string,
): boolean {
  return nextStart !== currentStart;
}
