"use client";

import { useCallback, useState } from "react";
import type { MouseEvent } from "react";
import AgendaBlockCard from "@/components/dashboard/agenda/AgendaBlockCard";
import type { AgendaWeekDayEntry } from "@/components/dashboard/agenda/AgendaWeekOverview";
import type { RetimeBlockInput } from "@/components/dashboard/agenda/AgendaDayTimeline";
import {
  getBlockTimelineSpanPx,
  getBlockTimelineStyle,
  getBlockTimelineTopPx,
  getHourMarkerTopPx,
  isCompactTimelineBlock,
  timeToMinutes,
  WEEK_TIMELINE_MIN_BLOCK_HEIGHT_PX,
} from "@/lib/agenda-timeline";
import {
  hasPlanStepDragChanged,
  hasRoutineDragChanged,
  resolveRetimeFromDrag,
} from "@/lib/agenda-timeline-drag";
import { clarityTag } from "@/lib/clarity";
import { trackAgendaBlockUpdated, trackEvent } from "@/lib/ga4";
import type { useAgendaTimelineDrag } from "@/lib/use-agenda-timeline-drag";
import type { TimelineBlock } from "@/types/agenda";

const HOUR_HEIGHT_PX = 44;

type TimelineDrag = ReturnType<typeof useAgendaTimelineDrag>;

type AgendaWeekTimeColumnProps = {
  day: AgendaWeekDayEntry;
  columnBlocks: TimelineBlock[];
  hourLabels: number[];
  halfHourMarks: number[];
  timelineHeightPx: number;
  selected: boolean;
  isToday: boolean;
  nowLinePercent: number | null;
  selectedBlockId: string | null;
  blockBusy: boolean;
  isDragging: boolean;
  dragGhostStyle: ReturnType<typeof getBlockTimelineStyle> | null;
  showDragGhost: boolean;
  timelineDrag: TimelineDrag;
  onSelectBlock: (blockId: string) => void;
  onColumnClick: (event: MouseEvent<HTMLButtonElement>, date: string) => void;
  onActivateDrag: () => void;
  onRetimeBlock?: (blockId: string, input: RetimeBlockInput) => Promise<void>;
  onScheduledTimeChange?: (scheduledTime: string) => void;
};

export default function AgendaWeekTimeColumn({
  day,
  columnBlocks,
  hourLabels,
  halfHourMarks,
  timelineHeightPx,
  selected,
  isToday,
  nowLinePercent,
  selectedBlockId,
  blockBusy,
  isDragging,
  dragGhostStyle,
  showDragGhost,
  timelineDrag,
  onSelectBlock,
  onColumnClick,
  onActivateDrag,
  onRetimeBlock,
  onScheduledTimeChange,
}: AgendaWeekTimeColumnProps) {
  const [columnElement, setColumnElement] = useState<HTMLDivElement | null>(null);

  const getTrackRect = useCallback(
    () => columnElement?.getBoundingClientRect() ?? null,
    [columnElement],
  );

  const commitPlanStepDrag = useCallback(
    (startTime: string) => {
      onScheduledTimeChange?.(startTime);
      clarityTag("agenda_block", "timeline_drag");
    },
    [onScheduledTimeChange],
  );

  const bindBlockDrag = useCallback(
    (block: TimelineBlock) => {
      if (!block.isEditable) {
        return undefined;
      }
      const durationMinutes = Math.max(
        15,
        timeToMinutes(block.endTime) - timeToMinutes(block.startTime),
      );
      return timelineDrag.bindDragHandle({
        durationMinutes,
        getTrackRect,
        onActivate: onActivateDrag,
        onCommit: (slot) => {
          if (block.kind === "analysis") {
            if (!hasPlanStepDragChanged(block.startTime, slot.startTime)) {
              return;
            }
            commitPlanStepDrag(slot.startTime);
            return;
          }
          if (!onRetimeBlock) {
            return;
          }
          const retime = resolveRetimeFromDrag(
            block.startTime,
            block.endTime,
            slot.startTime,
          );
          if (!hasRoutineDragChanged(block.startTime, block.endTime, retime)) {
            return;
          }
          void onRetimeBlock(block.id, retime);
          trackAgendaBlockUpdated({
            category_id: block.categoryId,
            surface: "agenda_timeline_drag",
            moved_date: false,
          });
          clarityTag("agenda_block", "timeline_drag");
        },
      });
    },
    [
      commitPlanStepDrag,
      getTrackRect,
      onActivateDrag,
      onRetimeBlock,
      timelineDrag,
    ],
  );

  return (
    <div
      ref={setColumnElement}
      className={`relative min-w-0 overflow-hidden rounded-lg border ${
        selected ? "border-[rgba(90,143,106,0.35)]" : "border-white/10"
      } ${isToday ? "bg-black/25" : "bg-black/20"}`}
      style={{
        height: timelineHeightPx,
        minHeight: timelineHeightPx,
        maxHeight: timelineHeightPx,
      }}
    >
      <button
        type="button"
        disabled={blockBusy || isDragging}
        aria-label={`Voeg moment toe op ${day.dayLabel} ${day.dayNumber}`}
        onClick={(event) => onColumnClick(event, day.date)}
        className="absolute inset-0 z-0 cursor-pointer border-none bg-transparent transition-colors hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
      />

      {hourLabels.map((hour) => (
        <div
          key={`grid-${day.date}-${hour}`}
          className="pointer-events-none absolute inset-x-0 border-t border-white/10"
          style={{ top: getHourMarkerTopPx(hour, HOUR_HEIGHT_PX) }}
          aria-hidden
        />
      ))}

      {halfHourMarks.map((mark) => (
        <div
          key={`half-${day.date}-${mark}`}
          className="pointer-events-none absolute inset-x-0 border-t border-dashed border-white/[0.055]"
          style={{ top: getHourMarkerTopPx(mark, HOUR_HEIGHT_PX) }}
          aria-hidden
        />
      ))}

      {isToday && nowLinePercent !== null ? (
        <div
          className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
          style={{ top: `${nowLinePercent}%` }}
          aria-hidden
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--sage)]" />
          <span className="h-px flex-1 bg-[var(--sage)]/70" />
        </div>
      ) : null}

      {dragGhostStyle && showDragGhost ? (
        <div
          className="pointer-events-none absolute inset-x-0.5 z-[6] rounded-md border border-dashed border-[var(--sage)] bg-[rgba(90,143,106,0.22)]"
          style={{
            top: `${dragGhostStyle.topPercent}%`,
            height: `${dragGhostStyle.heightPercent}%`,
          }}
          aria-hidden
        />
      ) : null}

      {columnBlocks.map((block, index) => {
        const topPx = getBlockTimelineTopPx(block.startTime, HOUR_HEIGHT_PX);
        const heightPx = getBlockTimelineSpanPx(
          block.startTime,
          block.endTime,
          HOUR_HEIGHT_PX,
          WEEK_TIMELINE_MIN_BLOCK_HEIGHT_PX,
        );
        const compact = isCompactTimelineBlock(
          block.startTime,
          block.endTime,
          HOUR_HEIGHT_PX,
          WEEK_TIMELINE_MIN_BLOCK_HEIGHT_PX,
        );
        const blockSelected = selectedBlockId === block.id;

        return (
          <div
            key={block.id}
            className={`absolute inset-x-0.5 z-10 overflow-hidden rounded-md transition-shadow ${
              blockSelected
                ? "ring-2 ring-[var(--sage)] ring-offset-1 ring-offset-[#1a2e1a]"
                : ""
            }`}
            style={{
              top: topPx,
              height: heightPx,
              zIndex: 10 + index,
            }}
          >
            <AgendaBlockCard
              block={block}
              compact={compact}
              dragHandleProps={bindBlockDrag(block)}
              onOpenDetail={() => {
                onSelectBlock(block.id);
                trackEvent("dashboard_agenda_week_block_select", {
                  surface: "agenda_week_grid",
                  block_kind: block.kind,
                });
                clarityTag("dashboard_agenda", "week_block_select");
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
