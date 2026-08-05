"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import AgendaTimelineHourAxis from "@/components/dashboard/agenda/AgendaTimelineHourAxis";
import AgendaWeekTimeColumn from "@/components/dashboard/agenda/AgendaWeekTimeColumn";
import type { AgendaWeekDayEntry } from "@/components/dashboard/agenda/AgendaWeekOverview";
import type { RetimeBlockInput } from "@/components/dashboard/agenda/AgendaDayTimeline";
import { PILLAR } from "@/data/dashboard";
import {
  buildWeekColumnBlocks,
  getBlockTimelineStyle,
  getNowLinePercent,
  getTimelineHalfHourMarks,
  getTimelineHourLabels,
  getTimelineTrackHeightPx,
  positionToWeekGridTime,
  resolveWeekGridHourHeightPx,
  WEEK_GRID_SHORT_VIEWPORT_QUERY,
  WEEK_GRID_SNAP_MINUTES,
} from "@/lib/agenda-timeline";
import { clarityTag } from "@/lib/clarity";
import { isWeekSlotCompleted } from "@/lib/agenda-week-preview";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import { trackEvent } from "@/lib/ga4";
import { useAgendaTimelineDrag } from "@/lib/use-agenda-timeline-drag";
import { useMediaQuery } from "@/lib/use-media-query";
import type { DashboardModel } from "@/types/dashboard";

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

function WeekDayHeader({
  day,
  selected,
  isToday,
  onSelectDate,
}: {
  day: AgendaWeekDayEntry;
  selected: boolean;
  isToday: boolean;
  onSelectDate: (date: string) => void;
}) {
  const pillar = day.domain ? PILLAR[day.domain] : null;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onSelectDate(day.date);
      }}
      aria-current={selected ? "date" : undefined}
      className={`mb-1 flex min-h-9 cursor-pointer flex-col items-center justify-center rounded-lg border px-0.5 py-1 transition-colors ${
        selected
          ? "border-[rgba(90,143,106,0.55)] bg-[rgba(90,143,106,0.12)]"
          : isToday
            ? "border-white/20 bg-white/[0.05] hover:bg-white/[0.08]"
            : "border-transparent bg-white/[0.02] hover:bg-white/[0.06]"
      }`}
      style={{ fontFamily: "var(--f-sans)" }}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9FB0A6]">
        {day.isToday ? "Nu" : day.dayLabel}
      </span>
      <span className="flex items-center gap-1">
        <span className="text-[13px] font-medium tabular-nums text-[#F1EFE8]">
          {day.dayNumber}
        </span>
        {pillar ? (
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: pillar.color }}
            aria-hidden
          />
        ) : null}
      </span>
    </button>
  );
}

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
  const isShortViewport = useMediaQuery(WEEK_GRID_SHORT_VIEWPORT_QUERY);
  const hourHeightPx = resolveWeekGridHourHeightPx(isShortViewport);
  const timelineHeightPx = getTimelineTrackHeightPx(hourHeightPx);

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
      <div className="flex min-w-0 flex-col gap-0">
        <div className="flex min-w-0 gap-1">
          <div className="w-9 shrink-0" aria-hidden />
          <div className="grid min-w-0 flex-1 grid-cols-7 gap-px">
            {days.map((day) => (
              <WeekDayHeader
                key={`header-${day.date}`}
                day={day}
                selected={day.date === selectedDate}
                isToday={day.date === todayDate}
                onSelectDate={onSelectDate}
              />
            ))}
          </div>
        </div>

        <div className="flex min-w-0 gap-1">
          <AgendaTimelineHourAxis
            compact
            hourLabels={hourLabels}
            hourHeightPx={hourHeightPx}
            trackHeightPx={timelineHeightPx}
          />

          <div className="grid min-w-0 flex-1 grid-cols-7 gap-px">
            {days.map((day) => (
              <AgendaWeekTimeColumn
                key={day.date}
                day={day}
                columnBlocks={blocksByDate.get(day.date) ?? []}
                hourLabels={hourLabels}
                halfHourMarks={halfHourMarks}
                hourHeightPx={hourHeightPx}
                timelineHeightPx={timelineHeightPx}
                selected={day.date === selectedDate}
                isToday={day.date === todayDate}
                nowLinePercent={nowLinePercent}
                selectedBlockId={selectedBlockId}
                blockBusy={blockBusy}
                isDragging={timelineDrag.isDragging}
                dragGhostStyle={dragGhostStyle}
                showDragGhost={timelineDrag.isDragging && dragColumnDate === day.date}
                timelineDrag={timelineDrag}
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
    </div>
  );
}
