"use client";

import { useCallback, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  positionToTimelineTime,
  TIMELINE_SNAP_MINUTES,
} from "@/lib/agenda-timeline";
import {
  TIMELINE_DRAG_ACTIVATION_PX,
  type TimelineDragTimeSlot,
} from "@/lib/agenda-timeline-drag";

type PositionToTimeFn = typeof positionToTimelineTime;

type ActiveDrag = {
  durationMinutes: number;
  startClientX: number;
  startClientY: number;
  activated: boolean;
  getTrackRect: () => DOMRect | null;
  onCommit: (slot: TimelineDragTimeSlot) => void;
  onActivate?: () => void;
};

export type AgendaTimelineDragHandleProps = {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  style: { touchAction: "none" };
};

type BindDragHandleInput = {
  durationMinutes: number;
  getTrackRect: () => DOMRect | null;
  onCommit: (slot: TimelineDragTimeSlot) => void;
  onActivate?: () => void;
  /** Bij pointer-up zonder sleep-drempel (tik). */
  onTap?: () => void;
};

type UseAgendaTimelineDragOptions = {
  disabled?: boolean;
  snapStep?: number;
  positionToTime?: PositionToTimeFn;
  onDragEnd?: () => void;
};

export function useAgendaTimelineDrag({
  disabled = false,
  snapStep = TIMELINE_SNAP_MINUTES,
  positionToTime = positionToTimelineTime,
  onDragEnd,
}: UseAgendaTimelineDragOptions = {}) {
  const activeDragRef = useRef<ActiveDrag | null>(null);
  const [ghost, setGhost] = useState<TimelineDragTimeSlot | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const resolveSlot = useCallback(
    (clientY: number, getTrackRect: () => DOMRect | null, durationMinutes: number) => {
      const rect = getTrackRect();
      if (!rect || rect.height <= 0) {
        return null;
      }
      const offsetY = Math.min(Math.max(clientY - rect.top, 0), rect.height);
      return positionToTime(offsetY, rect.height, durationMinutes, snapStep);
    },
    [positionToTime, snapStep],
  );

  const updateGhost = useCallback(
    (clientY: number, active: ActiveDrag) => {
      const slot = resolveSlot(clientY, active.getTrackRect, active.durationMinutes);
      setGhost(slot);
    },
    [resolveSlot],
  );

  const clearDrag = useCallback(() => {
    activeDragRef.current = null;
    setGhost(null);
    setIsDragging(false);
    onDragEnd?.();
  }, [onDragEnd]);

  const bindDragHandle = useCallback(
    ({
      durationMinutes,
      getTrackRect,
      onCommit,
      onActivate,
      onTap,
    }: BindDragHandleInput): AgendaTimelineDragHandleProps => {
      const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
        if (disabled || event.button !== 0) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();

        const active: ActiveDrag = {
          durationMinutes,
          startClientX: event.clientX,
          startClientY: event.clientY,
          activated: false,
          getTrackRect,
          onCommit,
          onActivate,
        };
        activeDragRef.current = active;

        const handleMove = (moveEvent: PointerEvent) => {
          const current = activeDragRef.current;
          if (!current) {
            return;
          }

          const distance = Math.hypot(
            moveEvent.clientX - current.startClientX,
            moveEvent.clientY - current.startClientY,
          );

          if (!current.activated) {
            if (distance < TIMELINE_DRAG_ACTIVATION_PX) {
              return;
            }
            current.activated = true;
            current.onActivate?.();
            setIsDragging(true);
          }

          updateGhost(moveEvent.clientY, current);
        };

        const handleUp = (upEvent: PointerEvent) => {
          window.removeEventListener("pointermove", handleMove);
          window.removeEventListener("pointerup", handleUp);
          window.removeEventListener("pointercancel", handleUp);

          const current = activeDragRef.current;
          if (!current?.activated) {
            clearDrag();
            onTap?.();
            return;
          }

          const slot = resolveSlot(
            upEvent.clientY,
            current.getTrackRect,
            current.durationMinutes,
          );
          clearDrag();
          if (slot) {
            current.onCommit(slot);
          }
        };

        window.addEventListener("pointermove", handleMove);
        window.addEventListener("pointerup", handleUp);
        window.addEventListener("pointercancel", handleUp);
      };

      return {
        onPointerDown,
        style: { touchAction: "none" },
      };
    },
    [clearDrag, disabled, resolveSlot, updateGhost],
  );

  return {
    ghost,
    isDragging,
    bindDragHandle,
  };
}
