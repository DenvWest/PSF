"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import * as Icons from "@/components/app/icons";
import AgendaAddBlockSheet from "@/components/dashboard/agenda/AgendaAddBlockSheet";
import AgendaBlockCard from "@/components/dashboard/agenda/AgendaBlockCard";
import AgendaBlockDetailSheet from "@/components/dashboard/agenda/AgendaBlockDetailSheet";
import { AgendaFocusPanel, AgendaFocusPill } from "@/components/dashboard/agenda/AgendaMetaRow";
import { clarityTag } from "@/lib/clarity";
import AgendaPlanStepStrip from "@/components/dashboard/agenda/AgendaPlanStepStrip";
import AgendaProvenanceStrip from "@/components/dashboard/agenda/AgendaProvenanceStrip";
import {
  buildDayTimeline,
  buildPlanStepBlock,
  formatTimelineHour,
  getBlockTimelineStyle,
  getHourMarkerTopPx,
  getNowLinePercent,
  getTimelineHalfHourMarks,
  getTimelineHourLabels,
  getTimelineTrackHeightPx,
  isCompactTimelineBlock,
  positionToTimelineTime,
  resolvePlanStepPlacement,
  TIMELINE_MIN_BLOCK_HEIGHT_PX,
} from "@/lib/agenda-timeline";
import { trackEvent } from "@/lib/ga4";
import type { AgendaDayContext } from "@/lib/agenda-day-context";
import type { AgendaBlockRecord, AgendaCategoryId } from "@/types/agenda";
import type { DashboardModel, PillarId } from "@/types/dashboard";

const HOUR_HEIGHT_PX = 58;
const TIMELINE_HEIGHT_PX = getTimelineTrackHeightPx(HOUR_HEIGHT_PX);

type DraftSlot = {
  startTime: string;
  endTime: string;
};

/** Voorzet voor "Meer hulp hierbij": aanvulling naast de basis van dit domein. */
type HelpPreset = {
  categoryId: AgendaCategoryId;
  domain: PillarId;
};

const HELP_SHEET_NOTE =
  "Alleen opties die naast je basis passen. Je basis blijft staan.";

type HiddenPlanStep = {
  title: string;
  domainLabel: string;
  color: string;
  reason: "day" | "all";
};

export type RetimeBlockInput = {
  date?: string;
  startTime: string;
  endTime: string;
};

type AgendaDayTimelineProps = {
  model: DashboardModel;
  context: AgendaDayContext;
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
  onRetimeBlock?: (blockId: string, input: RetimeBlockInput) => Promise<void>;
  archivedBlocks?: AgendaBlockRecord[];
  onRestoreBlock?: (blockId: string) => Promise<void>;
  hiddenPlanStep?: HiddenPlanStep | null;
  onDismissPlanStep?: (date: string) => Promise<void>;
  onRestorePlanStep?: () => Promise<void>;
  onHideAllPlanSteps?: () => Promise<void>;
  onShowAllPlanSteps?: () => Promise<void>;
  onSelectPillar: (pillarId: PillarId) => void;
  onAcceptEngine: () => void;
  onResetFocus: () => void;
  weekStrip?: ReactNode;
  onRegisterFooterActions?: (actions: {
    openAddSheet: () => void;
    blockBusy: boolean;
  }) => void;
};

export default function AgendaDayTimeline({
  model,
  context,
  routineBlocks,
  prefBusy,
  blockBusy = false,
  onCompletionChange,
  onScheduledTimeChange,
  onCreateBlock,
  onToggleBlockDone,
  onDeleteBlock,
  onRetimeBlock,
  archivedBlocks = [],
  onRestoreBlock,
  hiddenPlanStep = null,
  onDismissPlanStep,
  onRestorePlanStep,
  onHideAllPlanSteps,
  onShowAllPlanSteps,
  onSelectPillar,
  onAcceptEngine,
  onResetFocus,
  weekStrip,
  onRegisterFooterActions,
}: AgendaDayTimelineProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [focusExpanded, setFocusExpanded] = useState(false);
  const [draftSlot, setDraftSlot] = useState<DraftSlot | null>(null);
  const [helpPreset, setHelpPreset] = useState<HelpPreset | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const slot = context.kind === "engine" ? context.slot : null;
  const date = context.date;
  const isToday = slot?.isToday ?? false;

  const planStepPlacement = slot ? resolvePlanStepPlacement(model, slot) : "hidden";
  const planStep = useMemo(
    () => (slot ? buildPlanStepBlock(model, slot) : null),
    [model, slot],
  );
  const dayBlocks = useMemo(
    () => buildDayTimeline(model, { date }, routineBlocks),
    [model, date, routineBlocks],
  );
  // Eén object, één plek: staat de plan-stap in het raster, dan verdwijnt de
  // tray-strip — en andersom (verdict §A2c).
  const gridBlocks = useMemo(() => {
    if (planStepPlacement !== "grid" || !planStep) {
      return dayBlocks;
    }
    return [...dayBlocks, planStep].sort((left, right) =>
      left.startTime.localeCompare(right.startTime),
    );
  }, [dayBlocks, planStep, planStepPlacement]);

  const selectedBlock = useMemo(() => {
    if (planStep?.id === selectedBlockId) {
      return planStep;
    }
    return gridBlocks.find((block) => block.id === selectedBlockId) ?? null;
  }, [gridBlocks, planStep, selectedBlockId]);

  const nowLinePercent = isToday ? getNowLinePercent() : null;
  const hourLabels = getTimelineHourLabels();
  const halfHourMarks = getTimelineHalfHourMarks();
  const ghostStyle = draftSlot
    ? getBlockTimelineStyle(draftSlot.startTime, draftSlot.endTime)
    : null;

  const archivedForDay = useMemo(
    () => archivedBlocks.filter((block) => block.date === date),
    [archivedBlocks, date],
  );

  const closeSheet = () => {
    setAddOpen(false);
    setDraftSlot(null);
    setHelpPreset(null);
  };

  const closeFocus = () => {
    setFocusExpanded(false);
  };

  const closeDetail = () => {
    setSelectedBlockId(null);
  };

  const openHeaderFocus = () => {
    if (focusExpanded) {
      closeFocus();
      return;
    }
    closeSheet();
    setSelectedBlockId(null);
    setFocusExpanded(true);
  };

  const openHeaderSheet = useCallback(() => {
    closeFocus();
    setSelectedBlockId(null);
    setDraftSlot(null);
    setHelpPreset(null);
    setAddOpen(true);
  }, []);

  const openHelpSheet = (preset: HelpPreset) => {
    closeFocus();
    setSelectedBlockId(null);
    setDraftSlot(null);
    setHelpPreset(preset);
    setAddOpen(true);
  };

  const handleQuietCtaClick = () => {
    trackEvent("dashboard_agenda_quiet_cta_click", {
      surface: "agenda",
      view: "dag",
    });
    clarityTag("dashboard_agenda", "quiet_cta");
    openHeaderSheet();
  };

  useEffect(() => {
    onRegisterFooterActions?.({ openAddSheet: openHeaderSheet, blockBusy });
  }, [blockBusy, onRegisterFooterActions, openHeaderSheet]);

  const openDetail = (blockId: string) => {
    closeSheet();
    closeFocus();
    setSelectedBlockId(blockId);
  };

  const handleRailClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (blockBusy) {
      return;
    }

    closeFocus();
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetY = event.clientY - rect.top;
    const nextDraft = positionToTimelineTime(offsetY, rect.height);
    setSelectedBlockId(null);
    setHelpPreset(null);
    setDraftSlot(nextDraft);
    setAddOpen(true);
    clarityTag("agenda_block", "tap_create");
  };

  // De tray blijft staan zolang er geen tijd gezet is (fullbleed-regel 7); de
  // sectiekop maakt van "hangt erboven" een eigen belofte in plaats van een
  // restpost.
  const trayVisible = Boolean(planStep && planStepPlacement === "tray");
  const freeHeading = isToday ? "Vandaag nog vrij" : "Nog vrij op deze dag";
  const quietHeading = trayVisible
    ? isToday
      ? "Nog geen moment in je dag gezet"
      : "Nog geen moment op deze dag gezet"
    : isToday
      ? "Je dag is nog leeg"
      : "Nog niets op deze dag";
  const quietBody = trayVisible
    ? "Je stap hierboven wacht nog op een tijd. Zet er een moment bij, of plan iets anders."
    : "Zet één moment vast, dan weet je waar de rest omheen past.";

  return (
    <section aria-label="Dagtijdlijn" className="min-w-0">
      {slot ? (
        <div className="mb-3 flex items-start justify-between gap-3">
          <AgendaProvenanceStrip model={model} slot={slot} className="min-w-0 flex-1" />
          {isToday ? (
            <div className="flex shrink-0 items-center">
              <AgendaFocusPill
                model={model}
                busy={prefBusy}
                expanded={focusExpanded}
                onToggle={openHeaderFocus}
              />
            </div>
          ) : null}
        </div>
      ) : (
        <p className="mb-3 text-[12.5px] leading-normal text-[#9FB0A6]">
          Deze dag valt buiten je adviesweek. Je eigen momenten staan er wel — je
          dagstap volgt weer in de week van vandaag.
        </p>
      )}

      {slot && isToday && focusExpanded ? (
        <div className="mb-3">
          <AgendaFocusPanel
            model={model}
            busy={prefBusy}
            onSelectPillar={onSelectPillar}
            onAcceptEngine={onAcceptEngine}
            onReset={onResetFocus}
          />
        </div>
      ) : null}

      {planStep && trayVisible ? (
        <section className="mb-3" aria-label={freeHeading}>
          <h3 className="m-0 mb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
            {freeHeading}
          </h3>
          <AgendaPlanStepStrip
            block={planStep}
            onOpenDetail={() => openDetail(planStep.id)}
          />
          <p className="mt-2 text-[12px] leading-normal text-[#7E8C82]">
            Blijft hier staan tot je er een moment bij kiest — hij verdwijnt niet.
          </p>
        </section>
      ) : null}

      {weekStrip ? <div className="mb-4">{weekStrip}</div> : null}

      <div className="flex gap-2 sm:gap-3">
        <div
          className="relative w-10 shrink-0 sm:w-11"
          style={{ height: TIMELINE_HEIGHT_PX }}
          aria-hidden
        >
          {hourLabels.map((hour) => (
            <span
              key={hour}
              className="absolute right-0 -translate-y-1/2 text-[10.5px] font-medium tabular-nums text-[#7E8C82]"
              style={{ top: getHourMarkerTopPx(hour, HOUR_HEIGHT_PX) }}
            >
              {formatTimelineHour(hour)}
            </span>
          ))}
        </div>

        <div
          className="relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black/20"
          style={{ height: TIMELINE_HEIGHT_PX }}
        >
          <button
            type="button"
            disabled={blockBusy}
            aria-label="Voeg leefstijlmoment toe op dit tijdstip"
            onClick={handleRailClick}
            className="absolute inset-0 z-0 cursor-pointer border-none bg-transparent transition-colors hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
          />

          {hourLabels.map((hour) => (
            <div
              key={`grid-${hour}`}
              className="pointer-events-none absolute inset-x-0 border-t border-white/10"
              style={{ top: getHourMarkerTopPx(hour, HOUR_HEIGHT_PX) }}
              aria-hidden
            />
          ))}

          {halfHourMarks.map((mark) => (
            <div
              key={`half-${mark}`}
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-white/[0.055]"
              style={{ top: getHourMarkerTopPx(mark, HOUR_HEIGHT_PX) }}
              aria-hidden
            />
          ))}

          {ghostStyle && addOpen && draftSlot ? (
            <div
              className="pointer-events-none absolute inset-x-2 z-[5] rounded-xl border border-dashed border-[var(--sage)] bg-[rgba(90,143,106,0.14)]"
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
              <span className="h-px flex-1 bg-[var(--sage)]/70" />
            </div>
          ) : null}

          {gridBlocks.length === 0 ? (
            <div className="pointer-events-none absolute inset-x-3 top-[12%] z-[15] flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-black/30 p-3.5">
              <p
                className="m-0 text-[14px] font-medium leading-snug text-[#F1EFE8] text-pretty"
                style={{ fontFamily: "var(--f-serif)" }}
              >
                {quietHeading}
              </p>
              <p className="m-0 text-[12.5px] leading-normal text-[#9FB0A6] text-pretty">
                {quietBody}
              </p>
              <button
                type="button"
                disabled={blockBusy}
                onClick={handleQuietCtaClick}
                aria-haspopup="dialog"
                className={`pointer-events-auto inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition-colors disabled:opacity-60 ${
                  trayVisible
                    ? "border border-white/15 bg-white/[0.04] text-[var(--sage)] hover:border-white/30"
                    : "border border-[var(--sage)] bg-[var(--sage)] text-[#0f1c10]"
                }`}
                style={{ fontFamily: "var(--f-sans)" }}
              >
                <Icons.Plus s={14} />
                Plan een moment
              </button>
            </div>
          ) : null}

          {gridBlocks.map((block, index) => {
            const style = getBlockTimelineStyle(block.startTime, block.endTime);
            const compact = isCompactTimelineBlock(
              block.startTime,
              block.endTime,
              HOUR_HEIGHT_PX,
            );
            return (
              <div
                key={block.id}
                className="absolute inset-x-1.5 z-10 overflow-hidden sm:inset-x-2"
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
                  onOpenDetail={() => openDetail(block.id)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {addOpen ? (
        <AgendaAddBlockSheet
          key={
            helpPreset
              ? `help-${date}-${helpPreset.categoryId}`
              : draftSlot
                ? `tap-${date}-${draftSlot.startTime}-${draftSlot.endTime}`
                : `header-${date}`
          }
          open={addOpen}
          date={date}
          busy={blockBusy}
          initialStartTime={draftSlot?.startTime}
          initialEndTime={draftSlot?.endTime}
          initialCategoryId={helpPreset?.categoryId}
          helperNote={helpPreset ? HELP_SHEET_NOTE : null}
          createSurface={draftSlot ? "agenda_timeline_tap" : "agenda_add_sheet"}
          createOrigin={helpPreset ? "meer_hulp" : undefined}
          archivedBlocks={archivedForDay}
          hiddenPlanStep={hiddenPlanStep}
          onRestore={onRestoreBlock}
          onRestorePlanStep={onRestorePlanStep}
          onShowAllPlanSteps={onShowAllPlanSteps}
          onClose={closeSheet}
          onSubmit={onCreateBlock}
        />
      ) : null}

      <AgendaBlockDetailSheet
        key={`${date}-${selectedBlockId ?? "none"}`}
        block={selectedBlock}
        model={model}
        date={date}
        prefBusy={prefBusy}
        busy={blockBusy}
        onClose={closeDetail}
        onCompletionChange={onCompletionChange}
        onScheduledTimeChange={onScheduledTimeChange}
        onToggleDone={(blockId, done) => void onToggleBlockDone(blockId, done)}
        onDelete={(blockId) => void onDeleteBlock(blockId)}
        onRetime={
          onRetimeBlock
            ? (blockId, input) => {
                void onRetimeBlock(blockId, input);
              }
            : undefined
        }
        onDismissPlanStep={
          onDismissPlanStep
            ? (dismissDate) => {
                void onDismissPlanStep(dismissDate);
              }
            : undefined
        }
        onHideAllPlanSteps={
          onHideAllPlanSteps
            ? () => {
                void onHideAllPlanSteps();
              }
            : undefined
        }
        onOpenHelpSheet={openHelpSheet}
      />
    </section>
  );
}
