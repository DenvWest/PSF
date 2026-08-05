import {
  clampWritableMinutes,
  minutesToTime,
  timeToMinutes,
  TIMELINE_START_MINUTES,
} from "@/lib/agenda-timeline";

export const TIMELINE_DRAG_ACTIVATION_PX = 8;

export type TimelineDragTimeSlot = {
  startTime: string;
  endTime: string;
};

/** Behoud blokduur bij verslepen; klem binnen 06:00–23:45 (24:00 is geen
 * geldige lokale tijd) door bij een overschrijding het startpunt terug te
 * schuiven i.p.v. de duur te laten krimpen. */
export function resolveRetimeFromDrag(
  currentStart: string,
  currentEnd: string,
  nextStart: string,
): TimelineDragTimeSlot {
  const duration = Math.max(15, timeToMinutes(currentEnd) - timeToMinutes(currentStart));
  const desiredStart = timeToMinutes(nextStart);
  const endMinutes = clampWritableMinutes(desiredStart + duration);
  const startMinutes = Math.max(TIMELINE_START_MINUTES, endMinutes - duration);
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
