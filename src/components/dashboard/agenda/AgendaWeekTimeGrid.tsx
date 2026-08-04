"use client";

import { useEffect, useMemo } from "react";
import type { MouseEvent } from "react";
import AgendaBlockCard from "@/components/dashboard/agenda/AgendaBlockCard";
import type { AgendaWeekDayEntry } from "@/components/dashboard/agenda/AgendaWeekOverview";
import { PILLAR } from "@/data/dashboard";
import {
  buildWeekColumnBlocks,
  formatTimelineHour,
  getBlockTimelineStyle,
  getHourMarkerTopPx,
  getNowLinePercent,
  getTimelineHalfHourMarks,
  getTimelineHourLabels,
  getTimelineTrackHeightPx,
  isCompactTimelineBlock,
  positionToWeekGridTime,
  TIMELINE_MIN_BLOCK_HEIGHT_PX,
} from "@/lib/agenda-timeline";
import { clarityTag } from "@/lib/clarity";
import { isWeekSlotCompleted } from "@/lib/agenda-week-preview";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import { trackEvent } from "@/lib/ga4";
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
  onSelectDate: (date: string) => void;
  onSelectBlock: (blockId: string | null) => void;
  onEmptySlot: (slot: WeekGridEmptySlot) => void;
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
  onSelectDate,
  onSelectBlock,
  onEmptySlot,
}: AgendaWeekTimeGridProps) {
  const hourLabels = getTimelineHourLabels();
  const halfHourMarks = getTimelineHalfHourMarks();
  const nowLinePercent = getNowLinePercent();

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && selectedBlockId) {
        onSelectBlock(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onSelectBlock, selectedBlockId]);

  const handleColumnClick = (
    event: MouseEvent<HTMLButtonElement>,
    date: string,
  ) => {
    if (blockBusy) {
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
  };

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
          {days.map((day) => {
            const columnBlocks = blocksByDate.get(day.date) ?? [];
            const pillar = day.domain ? PILLAR[day.domain] : null;
            const selected = day.date === selectedDate;
            const isToday = day.date === todayDate;

            return (
              <div key={day.date} className="flex min-w-0 flex-col">
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

                <div
                  className={`relative min-w-0 overflow-hidden rounded-lg border ${
                    selected
                      ? "border-[rgba(90,143,106,0.35)]"
                      : "border-white/10"
                  } bg-black/20`}
                  style={{ height: TIMELINE_HEIGHT_PX }}
                >
                  <button
                    type="button"
                    disabled={blockBusy}
                    aria-label={`Voeg moment toe op ${day.dayLabel} ${day.dayNumber}`}
                    onClick={(event) => handleColumnClick(event, day.date)}
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

                  {columnBlocks.map((block, index) => {
                    const style = getBlockTimelineStyle(block.startTime, block.endTime);
                    const compact = isCompactTimelineBlock(
                      block.startTime,
                      block.endTime,
                      HOUR_HEIGHT_PX,
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
                          top: `${style.topPercent}%`,
                          height: `${style.heightPercent}%`,
                          minHeight: TIMELINE_MIN_BLOCK_HEIGHT_PX,
                          zIndex: 10 + index,
                        }}
                      >
                        <AgendaBlockCard
                          block={block}
                          compact={compact}
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
