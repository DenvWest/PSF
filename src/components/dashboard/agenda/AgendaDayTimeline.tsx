"use client";

import { useMemo, useState } from "react";
import type { MouseEvent } from "react";
import * as Icons from "@/components/app/icons";
import AgendaAddBlockSheet from "@/components/dashboard/agenda/AgendaAddBlockSheet";
import AgendaBlockCard from "@/components/dashboard/agenda/AgendaBlockCard";
import { clarityTag } from "@/lib/clarity";
import {
  buildDayTimeline,
  formatTimelineHour,
  getBlockTimelineStyle,
  getHourMarkerTopPx,
  getNowLinePercent,
  getTimelineHourLabels,
  getTimelineTrackHeightPx,
  positionToTimelineTime,
} from "@/lib/agenda-timeline";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import type { AgendaBlockRecord, AgendaCategoryId } from "@/types/agenda";
import type { DashboardModel } from "@/types/dashboard";

const HOUR_HEIGHT_PX = 52;
const TIMELINE_HEIGHT_PX = getTimelineTrackHeightPx(HOUR_HEIGHT_PX);

type DraftSlot = {
  startTime: string;
  endTime: string;
};

type AgendaDayTimelineProps = {
  model: DashboardModel;
  slot: WeekDaySlot;
  routineBlocks: AgendaBlockRecord[];
  prefBusy: boolean;
  blockBusy?: boolean;
  onCompletionChange?: () => void;
  onScheduledTimeChange: (scheduledTime: string) => void;
  onCreateBlock: (input: {
    date: string;
    categoryId: AgendaCategoryId;
    title: string;
    startTime: string;
    endTime: string;
  }) => Promise<void>;
  onToggleBlockDone: (blockId: string, done: boolean) => Promise<void>;
  onDeleteBlock: (blockId: string) => Promise<void>;
};

function formatDayHeading(isoDate: string, isToday: boolean): string {
  const formatted = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Amsterdam",
  }).format(new Date(`${isoDate}T12:00:00.000Z`));

  return isToday ? `Vandaag · ${formatted}` : formatted;
}

export default function AgendaDayTimeline({
  model,
  slot,
  routineBlocks,
  prefBusy,
  blockBusy = false,
  onCompletionChange,
  onScheduledTimeChange,
  onCreateBlock,
  onToggleBlockDone,
  onDeleteBlock,
}: AgendaDayTimelineProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [draftSlot, setDraftSlot] = useState<DraftSlot | null>(null);
  const blocks = useMemo(
    () => buildDayTimeline(model, slot, routineBlocks),
    [model, slot, routineBlocks],
  );
  const nowLinePercent = slot.isToday ? getNowLinePercent() : null;
  const hourLabels = getTimelineHourLabels();
  const ghostStyle = draftSlot
    ? getBlockTimelineStyle(draftSlot.startTime, draftSlot.endTime)
    : null;

  const openHeaderSheet = () => {
    setDraftSlot(null);
    setAddOpen((open) => !open);
  };

  const handleRailClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (blockBusy) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const offsetY = event.clientY - rect.top;
    const nextDraft = positionToTimelineTime(offsetY, rect.height);
    setDraftSlot(nextDraft);
    setAddOpen(true);
    clarityTag("agenda_block", "tap_create");
  };

  const closeSheet = () => {
    setAddOpen(false);
    setDraftSlot(null);
  };

  return (
    <section aria-label="Dagtijdlijn">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2
          className="m-0 text-[20px] font-medium capitalize text-[#1c1917]"
          style={{ fontFamily: "var(--f-serif)" }}
        >
          {formatDayHeading(slot.date, slot.isToday)}
        </h2>
        <button
          type="button"
          disabled={blockBusy}
          onClick={openHeaderSheet}
          aria-expanded={addOpen && draftSlot === null}
          className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-[#e4e0da] bg-white px-3 text-[13px] font-semibold text-[var(--sage)] transition-colors disabled:opacity-60"
          style={{ fontFamily: "var(--f-sans)" }}
        >
          <Icons.Plus s={14} />
          Moment
        </button>
      </div>

      <div className="flex gap-3">
        <div
          className="relative w-11 shrink-0"
          style={{ height: TIMELINE_HEIGHT_PX }}
          aria-hidden
        >
          {hourLabels.map((hour) => (
            <span
              key={hour}
              className="absolute right-0 -translate-y-1/2 text-[11px] font-medium tabular-nums text-[#a8a29e]"
              style={{ top: getHourMarkerTopPx(hour, HOUR_HEIGHT_PX) }}
            >
              {formatTimelineHour(hour)}
            </span>
          ))}
        </div>

        <div
          className="relative min-w-0 flex-1 rounded-[18px] border border-[#ebe7e2] bg-[#fcfbfa]"
          style={{ height: TIMELINE_HEIGHT_PX }}
        >
          <button
            type="button"
            disabled={blockBusy}
            aria-label="Voeg leefstijlmoment toe op dit tijdstip"
            onClick={handleRailClick}
            className="absolute inset-0 z-0 cursor-pointer border-none bg-transparent transition-colors hover:bg-[#f5f3f0] disabled:cursor-not-allowed disabled:opacity-60"
          />

          {hourLabels.map((hour) => (
            <div
              key={`grid-${hour}`}
              className="pointer-events-none absolute inset-x-0 border-t border-[#f0ece7]"
              style={{ top: getHourMarkerTopPx(hour, HOUR_HEIGHT_PX) }}
              aria-hidden
            />
          ))}

          {ghostStyle && addOpen && draftSlot ? (
            <div
              className="pointer-events-none absolute inset-x-2 z-[5] rounded-[14px] border border-dashed border-[var(--sage)] bg-[rgba(90,143,106,0.08)]"
              style={{
                top: `${ghostStyle.topPercent}%`,
                height: `${ghostStyle.heightPercent}%`,
              }}
              aria-hidden
            />
          ) : null}

          {nowLinePercent !== null ? (
            <div
              className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
              style={{ top: `${nowLinePercent}%` }}
              aria-hidden
            >
              <span className="h-2 w-2 rounded-full bg-[var(--sage)]" />
              <span className="h-px flex-1 bg-[var(--sage)]" />
            </div>
          ) : null}

          {blocks.map((block, index) => {
            const style = getBlockTimelineStyle(block.startTime, block.endTime);
            return (
              <div
                key={block.id}
                className="absolute inset-x-2 z-10"
                style={{
                  top: `${style.topPercent}%`,
                  height: `${style.heightPercent}%`,
                  zIndex: 10 + index,
                }}
              >
                <AgendaBlockCard
                  block={block}
                  model={model}
                  prefBusy={prefBusy}
                  busy={blockBusy}
                  onCompletionChange={onCompletionChange}
                  onScheduledTimeChange={onScheduledTimeChange}
                  onToggleDone={(blockId, done) => void onToggleBlockDone(blockId, done)}
                  onDelete={(blockId) => void onDeleteBlock(blockId)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {addOpen ? (
        <AgendaAddBlockSheet
          key={
            draftSlot
              ? `tap-${slot.date}-${draftSlot.startTime}-${draftSlot.endTime}`
              : `header-${slot.date}`
          }
          date={slot.date}
          busy={blockBusy}
          initialStartTime={draftSlot?.startTime}
          initialEndTime={draftSlot?.endTime}
          createSurface={draftSlot ? "agenda_timeline_tap" : "agenda_add_sheet"}
          onClose={closeSheet}
          onSubmit={onCreateBlock}
        />
      ) : null}
    </section>
  );
}
