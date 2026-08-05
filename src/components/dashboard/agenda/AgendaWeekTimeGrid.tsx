"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import AgendaWeekTimeColumn from "@/components/dashboard/agenda/AgendaWeekTimeColumn";
import type { AgendaWeekDayEntry } from "@/components/dashboard/agenda/AgendaWeekOverview";
import type { RetimeBlockInput } from "@/components/dashboard/agenda/AgendaDayTimeline";
import {
  buildWeekColumnBlocks,
  formatTimelineHour,
  getBlockTimelineStyle,
  getHourMarkerTopPx,
  getNowLinePercent,
  getTimelineHalfHourMarks,
  getTimelineHourLabels,
  getTimelineTrackHeightPx,
  positionToWeekGridTime,
  WEEK_GRID_SNAP_MINUTES,
} from "@/lib/agenda-timeline";
import { clarityTag } from "@/lib/clarity";
import { isWeekSlotCompleted } from "@/lib/agenda-week-preview";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import { trackEvent } from "@/lib/ga4";
import { useAgendaTimelineDrag } from "@/lib/use-agenda-timeline-drag";
import type { DashboardModel } from "@/types/dashboard";

const HOUR_HEIGHT_PX = 44;
const TIMELINE_HEIGHT_PX = getTimelineTrackHeightPx(HOUR_HEIGHT_PX);

export type WeekGridEmptySlot = {
  date: string;
  startTime: string;
  endTime: string;
};

type AgendaWeekTimeGridProps = {
  model: DashboardModel;
  days: AgendaWeekDayEntry[];
  slots: WeekDaySlot[];
  /** Afgevinkte dag-domein-sleutels uit daily_action_log; de enige gedaan-bron. */
  completedKeys: ReadonlySet<string>;
  selectedDate: string;
  todayDate: string;
  selectedBlockId: string | null;
  blockBusy: boolean;
  prefBusy?: boolean;
  onSelectDate: (date: string) => void;
  onSelectBlock: (blockId: string | null) => void;
  onEmptySlot: (slot: WeekGridEmptySlot) => void;
  onRetimeBlock?: (blockId: string, input: RetimeBlockInput) => Promise<void>;
  onScheduledTimeChange?: (scheduledTime: string) => void;
};

export default function AgendaWeekTimeGrid({
  model,
  days,
  slots,
  completedKeys,
  selectedDate,
  todayDate,
  selectedBlockId,
  blockBusy,
  prefBusy = false,
  onSelectDate,
  onSelectBlock,
  onEmptySlot,
  onRetimeBlock,
  onScheduledTimeChange,
}: AgendaWeekTimeGridProps) {
  const hourLabels = getTimelineHourLabels();
  const halfHourMarks = getTimelineHalfHourMarks();
  const nowLinePercent = getNowLinePercent();
  const [dragColumnDate, setDragColumnDate] = useState<string | null>(null);

  const timelineDrag = useAgendaTimelineDrag({
    disabled: blockBusy || prefBusy,
    snapStep: WEEK_GRID_SNAP_MINUTES,
    positionToTime: positionToWeekGridTime,
    onDragEnd: () => setDragColumnDate(null),
  });

  const blocksByDate = useMemo(() => {
    const map = new Map<string, ReturnType<typeof buildWeekColumnBlocks>>();
    for (const day of days) {
      const slot = slots.find((entry) => entry.date === day.date) ?? null;
      map.set(
        day.date,
        buildWeekColumnBlocks(
          model,
          day.date,
          slot,
          day.blocks,
          slot ? isWeekSlotCompleted(slot, completedKeys) : false,
        ),
      );
    }
    return map;
  }, [completedKeys, days, model, slots]);

  const dragGhostStyle =
    timelineDrag.ghost && timelineDrag.isDragging
      ? getBlockTimelineStyle(timelineDrag.ghost.startTime, timelineDrag.ghost.endTime)
      : null;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && selectedBlockId) {
        onSelectBlock(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onSelectBlock, selectedBlockId]);

  const handleColumnClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>, date: string) => {
      if (blockBusy || timelineDrag.isDragging) {
        return;
      }
      event.stopPropagation();
      const rect = event.currentTarget.getBoundingClientRect();
      const offsetY = event.clientY - rect.top;
      const nextSlot = positionToWeekGridTime(offsetY, rect.height);
      onSelectBlock(null);
      onEmptySlot({ date, ...nextSlot });
      trackEvent("dashboard_agenda_week_slot_click", {
        surface: "agenda_week_grid",
      });
      clarityTag("dashboard_agenda", "week_slot_tap");
    },
    [blockBusy, onEmptySlot, onSelectBlock, timelineDrag.isDragging],
  );

  const handleGridBackgroundClick = () => {
    if (selectedBlockId) {
      onSelectBlock(null);
    }
  };

  return (
    <div
      className="min-w-0 flex-1"
      onClick={handleGridBackgroundClick}
      role="presentation"
    >
      <div className="flex min-w-0 gap-1">
        <div
          className="relative w-9 shrink-0 pt-9"
          style={{ height: TIMELINE_HEIGHT_PX + 36 }}
          aria-hidden
        >
          {hourLabels.map((hour) => (
            <span
              key={hour}
              className="absolute right-0 -translate-y-1/2 text-[10px] font-medium tabular-nums text-[#7E8C82]"
              style={{ top: getHourMarkerTopPx(hour, HOUR_HEIGHT_PX) + 36 }}
            >
              {formatTimelineHour(hour)}
            </span>
          ))}
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-7 gap-px">
          {days.map((day) => (
            <AgendaWeekTimeColumn
              key={day.date}
              day={day}
              columnBlocks={blocksByDate.get(day.date) ?? []}
              hourLabels={hourLabels}
              halfHourMarks={halfHourMarks}
              timelineHeightPx={TIMELINE_HEIGHT_PX}
              selected={day.date === selectedDate}
              isToday={day.date === todayDate}
              nowLinePercent={nowLinePercent}
              selectedBlockId={selectedBlockId}
              blockBusy={blockBusy}
              isDragging={timelineDrag.isDragging}
              dragGhostStyle={dragGhostStyle}
              showDragGhost={timelineDrag.isDragging && dragColumnDate === day.date}
              timelineDrag={timelineDrag}
              onSelectDate={onSelectDate}
              onSelectBlock={onSelectBlock}
              onColumnClick={handleColumnClick}
              onActivateDrag={() => setDragColumnDate(day.date)}
              onRetimeBlock={onRetimeBlock}
              onScheduledTimeChange={onScheduledTimeChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
