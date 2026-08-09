"use client";

import { useEffect, useId, useState } from "react";
import type { ComponentType, CSSProperties } from "react";
import * as Icons from "@/components/app/icons";
import AgendaSheetFrame from "@/components/dashboard/agenda/AgendaSheetFrame";
import AgendaScheduleFields from "@/components/dashboard/agenda/AgendaScheduleFields";
import AgendaTodayHero from "@/components/dashboard/agenda/AgendaTodayHero";
import { getAgendaCategory } from "@/data/agenda/categories";
import { normalizeLocalTime } from "@/lib/account-priority-pref";
import { getBlockRoleLabel, minutesToTime, timeToMinutes } from "@/lib/agenda-timeline";
import { clarityTag } from "@/lib/clarity";
import { trackAgendaBlockUpdated, trackEvent } from "@/lib/ga4";
import { isValidAgendaDate } from "@/lib/dashboard-url";
import type { TimelineBlock } from "@/types/agenda";
import type { DashboardModel, PillarId } from "@/types/dashboard";

type RetimeInput = {
  date?: string;
  startTime: string;
  endTime: string;
};

type AgendaBlockDetailSheetProps = {
  block: TimelineBlock | null;
  model: DashboardModel;
  date: string;
  prefBusy?: boolean;
  busy?: boolean;
  onClose: () => void;
  onCompletionChange?: () => void;
  onScheduledTimeChange?: (scheduledTime: string) => void;
  onToggleDone?: (blockId: string, done: boolean) => Promise<void>;
  onPurge?: (blockId: string) => Promise<void>;
  onRetime?: (blockId: string, input: RetimeInput) => Promise<void>;
  onDismissPlanStep?: (date: string) => Promise<void>;
  onHideAllPlanSteps?: () => Promise<void>;
  onOpenHelpSheet?: (input: { domain: PillarId }) => void;
};

const LABEL_CLASS =
  "mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9FB0A6]";
const FIELD_CLASS =
  "min-h-11 w-full rounded-[10px] border border-white/10 bg-black/25 px-3 text-[15px] tabular-nums text-[#F1EFE8] disabled:opacity-60";

function CategoryIcon({
  iconName,
  color,
}: {
  iconName: keyof typeof Icons;
  color: string;
}) {
  const Icon = Icons[iconName] as ComponentType<{ s?: number; style?: CSSProperties }>;
  return <Icon s={16} style={{ color }} />;
}

export default function AgendaBlockDetailSheet({
  block,
  model,
  date,
  prefBusy = false,
  busy = false,
  onClose,
  onCompletionChange,
  onScheduledTimeChange,
  onToggleDone,
  onPurge,
  onRetime,
  onDismissPlanStep,
  onHideAllPlanSteps,
  onOpenHelpSheet,
}: AgendaBlockDetailSheetProps) {
  const titleId = useId();
  const [retimeOpen, setRetimeOpen] = useState(false);
  const [retimeDate, setRetimeDate] = useState(date);
  const [retimeStart, setRetimeStart] = useState(block?.startTime ?? "12:00");
  // De sheet krijgt per blok een eigen key, dus initiële state uit props volstaat.
  const [retimeDuration, setRetimeDuration] = useState(() =>
    block ? Math.max(15, timeToMinutes(block.endTime) - timeToMinutes(block.startTime)) : 30,
  );
  const [retimeError, setRetimeError] = useState<string | null>(null);
  const [retimeBusy, setRetimeBusy] = useState(false);
  const [purgeError, setPurgeError] = useState<string | null>(null);
  const [purgeBusy, setPurgeBusy] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [toggleBusy, setToggleBusy] = useState(false);
  const [stepActionError, setStepActionError] = useState<string | null>(null);
  const [stepActionBusy, setStepActionBusy] = useState(false);

  const blockId = block?.id ?? null;

  useEffect(() => {
    if (!blockId) {
      return;
    }
    clarityTag("agenda_block", "detail_open");
    return () => {
      clarityTag("agenda_block", "detail_close");
    };
  }, [blockId]);

  const setRetimeDateAndClearError = (next: string) => {
    setRetimeDate(next);
    setRetimeError(null);
  };
  const setRetimeStartAndClearError = (next: string) => {
    setRetimeStart(next);
    setRetimeError(null);
  };
  const setRetimeDurationAndClearError = (next: number) => {
    setRetimeDuration(next);
    setRetimeError(null);
  };

  if (!block) {
    return null;
  }

  const isAnalysis = block.kind === "analysis" && block.slot;
  const category = getAgendaCategory(block.categoryId);

  const handleRetimeSubmit = async () => {
    if (!onRetime) {
      return;
    }
    const normalizedStart = normalizeLocalTime(retimeStart);
    if (!normalizedStart) {
      setRetimeError("Kies een geldige starttijd.");
      return;
    }
    if (!isValidAgendaDate(retimeDate)) {
      setRetimeError("Kies een geldige datum.");
      return;
    }
    const endMinutes = timeToMinutes(normalizedStart) + retimeDuration;
    // >= i.p.v. >: exact 24*60 levert minutesToTime "24:00" op, en dat is
    // geen geldige lokale tijd (normalizeLocalTime wijst uren >23 af).
    if (endMinutes >= 24 * 60) {
      setRetimeError("Dit moment loopt over middernacht heen.");
      return;
    }

    setRetimeError(null);
    setRetimeBusy(true);
    const movedDate = retimeDate !== date;
    try {
      await onRetime(block.id, {
        ...(movedDate ? { date: retimeDate } : {}),
        startTime: normalizedStart,
        endTime: minutesToTime(endMinutes),
      });
      trackAgendaBlockUpdated({
        category_id: block.categoryId,
        surface: "agenda_block_detail",
        moved_date: movedDate,
      });
      clarityTag("agenda_block", "updated");
      onClose();
    } catch (error) {
      setRetimeError(
        error instanceof Error ? error.message : "Kon moment niet verplaatsen.",
      );
    } finally {
      setRetimeBusy(false);
    }
  };

  const handlePurge = async () => {
    if (!onPurge) {
      return;
    }
    if (
      !window.confirm(
        "Definitief verwijderen? Dit moment verdwijnt permanent.",
      )
    ) {
      return;
    }
    setPurgeError(null);
    setPurgeBusy(true);
    try {
      await onPurge(block.id);
      trackEvent("agenda_block_deleted", {
        category_id: block.categoryId,
        surface: "agenda_block_detail",
        permanent: true,
      });
      clarityTag("agenda_block", "purged");
      onClose();
    } catch (error) {
      setPurgeError(
        error instanceof Error ? error.message : "Kon moment niet verwijderen.",
      );
    } finally {
      setPurgeBusy(false);
    }
  };

  const actionBusy = busy || purgeBusy || retimeBusy || toggleBusy;

  const handleToggleDone = async () => {
    if (!onToggleDone) {
      return;
    }
    const nextDone = !block.done;
    setToggleError(null);
    setToggleBusy(true);
    try {
      await onToggleDone(block.id, nextDone);
      trackEvent("agenda_block_toggled", {
        category_id: block.categoryId,
        done: nextDone,
        surface: "agenda_block_detail",
      });
      clarityTag("agenda_block", nextDone ? "done" : "undone");
    } catch (error) {
      setToggleError(
        error instanceof Error ? error.message : "Kon moment niet afvinken.",
      );
    } finally {
      setToggleBusy(false);
    }
  };

  const routineFooter =
    !isAnalysis && block.isEditable ? (
      <div>
        {toggleError ? (
          <p className="mb-2 text-[13px] text-[#E2BC96]">{toggleError}</p>
        ) : null}
        <button
          type="button"
          disabled={actionBusy}
          onClick={() => void handleToggleDone()}
          className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border-none px-3 text-[15px] font-semibold disabled:opacity-60"
          style={{
            background: block.done ? "rgba(90, 143, 106, 0.18)" : "var(--sage)",
            color: block.done ? "#E7EDE8" : "#0f1c10",
            border: block.done ? "1px solid rgba(255,255,255,0.15)" : "none",
            fontFamily: "var(--f-sans)",
          }}
        >
          {block.done ? (
            <>
              <Icons.Check s={16} />
              Gedaan
            </>
          ) : (
            "Markeer als gedaan"
          )}
        </button>
      </div>
    ) : null;

  return (
    <AgendaSheetFrame
      titleId={titleId}
      title={isAnalysis ? "Stap uit je plan" : block.title}
      onClose={onClose}
      footer={routineFooter}
    >
      {isAnalysis ? (
        <>
          <AgendaTodayHero
            model={model}
            slot={block.slot!}
            prefBusy={prefBusy}
            variant="detail"
            tone="dark"
            eyebrowOverride={getBlockRoleLabel(block)}
            actionSurface="agenda_block_detail"
            onCompletionChange={onCompletionChange}
            onScheduledTimeChange={onScheduledTimeChange}
          />

          {/* Tijdelijk beweging-only: de brug (Pad A, slice 3) leest movementPlanTemplate
              en movementPrefs — andere domeinen hebben nog geen equivalente content.
              Verbreedt zodra een domein zijn eigen brug-data draagt (§10). */}
          {block.slot && onOpenHelpSheet && block.slot.domain === "beweging" ? (
            <button
              type="button"
              disabled={busy || prefBusy}
              onClick={() => {
                const domain = block.slot!.domain;
                trackEvent("dashboard_agenda_meer_hulp_open", {
                  surface: "agenda",
                  domain,
                });
                clarityTag("dashboard_agenda", "meer_hulp");
                onOpenHelpSheet({ domain });
              }}
              className="mt-3 inline-flex min-h-11 cursor-pointer items-center gap-1 border-none bg-transparent px-0 text-[13px] font-semibold text-[var(--sage)] disabled:opacity-60"
              style={{ fontFamily: "var(--f-sans)" }}
            >
              Meer hulp hierbij
              <Icons.ChevronRight s={13} />
            </button>
          ) : null}

          {block.slot && onDismissPlanStep ? (
            <>
              {stepActionError ? (
                <p className="mt-3 text-[13px] text-[#E2BC96]">{stepActionError}</p>
              ) : null}
              <button
                type="button"
                disabled={busy || prefBusy || stepActionBusy}
                onClick={() => {
                  void (async () => {
                    setStepActionError(null);
                    setStepActionBusy(true);
                    try {
                      await onDismissPlanStep(block.slot!.date);
                      trackEvent("agenda_plan_step_dismissed", {
                        surface: "agenda_block_detail",
                        scope: "day",
                      });
                      clarityTag("agenda_plan_step", "hidden_day");
                      onClose();
                    } catch (error) {
                      setStepActionError(
                        error instanceof Error
                          ? error.message
                          : "Kon plan-stap niet verbergen.",
                      );
                    } finally {
                      setStepActionBusy(false);
                    }
                  })();
                }}
                className="mt-4 inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-[14px] font-medium text-[#CDD7D0] disabled:opacity-60"
                style={{ fontFamily: "var(--f-sans)" }}
              >
                Verberg op deze dag
              </button>
              {onHideAllPlanSteps ? (
                <button
                  type="button"
                  disabled={busy || prefBusy || stepActionBusy}
                  onClick={() => {
                    void (async () => {
                      setStepActionError(null);
                      setStepActionBusy(true);
                      try {
                        await onHideAllPlanSteps();
                        trackEvent("agenda_plan_step_dismissed", {
                          surface: "agenda_block_detail",
                          scope: "all",
                        });
                        clarityTag("agenda_plan_step", "hidden_all");
                        onClose();
                      } catch (error) {
                        setStepActionError(
                          error instanceof Error
                            ? error.message
                            : "Kon plan-stappen niet verbergen.",
                        );
                      } finally {
                        setStepActionBusy(false);
                      }
                    })();
                  }}
                  className="mt-2 inline-flex min-h-11 w-full cursor-pointer items-center justify-center border-none bg-transparent px-4 text-[13px] font-medium text-[#9FB0A6] underline decoration-white/25 underline-offset-2 disabled:opacity-60"
                  style={{ fontFamily: "var(--f-sans)" }}
                >
                  Toon geen plan-stappen meer
                </button>
              ) : null}
              <p className="mt-2 text-[12px] leading-normal text-[#9FB0A6]">
                Terugzetten kan via Moment.
              </p>
            </>
          ) : null}
        </>
      ) : (
        <article
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
          style={{ borderLeftWidth: 3, borderLeftColor: category.color }}
        >
          <div className="mb-3 flex items-center gap-1.5">
            <CategoryIcon iconName={category.icon} color={category.color} />
            <span className="text-[12px] font-medium text-[#9FB0A6]">
              {getBlockRoleLabel(block)}
            </span>
          </div>

          <h3
            className="m-0 text-[18px] font-medium leading-snug text-[#F1EFE8] text-pretty"
            style={{ fontFamily: "var(--f-serif)" }}
          >
            {block.title}
          </h3>

          <p className="mt-2 text-[14px] tabular-nums text-[#9FB0A6]">
            {block.startTime} – {block.endTime}
          </p>

          {block.isEditable ? (
            <>
              {purgeError ? (
                <p className="mt-3 text-[13px] text-[#E2BC96]">{purgeError}</p>
              ) : null}

              <div className="mt-4 flex gap-2">
                {onRetime ? (
                  <button
                    type="button"
                    disabled={actionBusy}
                    aria-expanded={retimeOpen}
                    onClick={() => setRetimeOpen((open) => !open)}
                    className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] px-3 text-[13px] font-semibold text-[var(--sage)] transition-colors hover:border-white/25 disabled:opacity-60"
                    style={{ fontFamily: "var(--f-sans)" }}
                  >
                    {retimeOpen ? "Sluit verplaatsen" : "Verplaatsen"}
                    <Icons.ChevronRight
                      s={13}
                      style={{
                        transform: retimeOpen ? "rotate(90deg)" : undefined,
                        transition: "transform 150ms ease",
                      }}
                    />
                  </button>
                ) : null}
                {onPurge ? (
                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={() => void handlePurge()}
                    className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border border-[rgba(226,188,150,0.35)] bg-white/[0.03] px-3 text-[13px] font-semibold text-[#E2BC96] transition-colors hover:border-[rgba(226,188,150,0.55)] disabled:opacity-60"
                    style={{ fontFamily: "var(--f-sans)" }}
                  >
                    Verwijderen
                  </button>
                ) : null}
              </div>

              {onRetime && retimeOpen ? (
                <div className="mt-3 border-t border-white/10 pt-4">
                      <label className="mb-3 block">
                        <span className={LABEL_CLASS}>Dag</span>
                        <input
                          type="date"
                          value={retimeDate}
                          disabled={busy}
                          onChange={(event) => setRetimeDateAndClearError(event.target.value)}
                          className={FIELD_CLASS}
                          style={{ fontFamily: "var(--f-sans)" }}
                        />
                      </label>

                      <AgendaScheduleFields
                        startTime={retimeStart}
                        onStartTimeChange={setRetimeStartAndClearError}
                        durationMinutes={retimeDuration}
                        onDurationChange={setRetimeDurationAndClearError}
                        showDuration
                        busy={busy}
                        variant="compact-dark"
                        preferPlacement="top"
                      />

                      {retimeError ? (
                        <p role="alert" className="mb-3 text-[13px] text-[#E2BC96]">{retimeError}</p>
                      ) : null}

                      <button
                        type="button"
                        disabled={busy || retimeBusy}
                        onClick={() => void handleRetimeSubmit()}
                        className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl border-none text-[15px] font-semibold disabled:opacity-60"
                        style={{
                          background: "var(--sage)",
                          color: "#0f1c10",
                          fontFamily: "var(--f-sans)",
                        }}
                      >
                        Verplaats moment
                      </button>
                </div>
              ) : null}
            </>
          ) : null}
        </article>
      )}
    </AgendaSheetFrame>
  );
}
