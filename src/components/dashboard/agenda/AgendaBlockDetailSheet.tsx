"use client";

import { useEffect, useId, useMemo, useState } from "react";
import type { ComponentType, CSSProperties } from "react";
import * as Icons from "@/components/app/icons";
import AgendaSheetFrame from "@/components/dashboard/agenda/AgendaSheetFrame";
import AgendaTodayHero from "@/components/dashboard/agenda/AgendaTodayHero";
import { getAgendaCategory } from "@/data/agenda/categories";
import { normalizeLocalTime } from "@/lib/account-priority-pref";
import { getBlockRoleLabel, minutesToTime, timeToMinutes } from "@/lib/agenda-timeline";
import { clarityTag } from "@/lib/clarity";
import { trackAgendaBlockUpdated, trackEvent } from "@/lib/ga4";
import { isValidAgendaDate } from "@/lib/dashboard-url";
import type { AgendaCategoryId, TimelineBlock } from "@/types/agenda";
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
  onToggleDone?: (blockId: string, done: boolean) => void;
  onDelete?: (blockId: string) => void;
  onRetime?: (blockId: string, input: RetimeInput) => void;
  onDismissPlanStep?: (date: string) => void;
  onHideAllPlanSteps?: () => void;
  onOpenHelpSheet?: (input: { categoryId: AgendaCategoryId; domain: PillarId }) => void;
};

const DURATION_CHOICES = [15, 30, 45, 60] as const;

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
  onDelete,
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

  const retimeEnd = useMemo(
    () => minutesToTime(timeToMinutes(retimeStart) + retimeDuration),
    [retimeStart, retimeDuration],
  );

  if (!block) {
    return null;
  }

  const isAnalysis = block.kind === "analysis" && block.slot;
  const category = getAgendaCategory(block.categoryId);

  const handleRetimeSubmit = () => {
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
    if (endMinutes > 24 * 60) {
      setRetimeError("Dit moment loopt over middernacht heen.");
      return;
    }

    setRetimeError(null);
    const movedDate = retimeDate !== date;
    onRetime(block.id, {
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
  };

  return (
    <AgendaSheetFrame
      titleId={titleId}
      title={isAnalysis ? "Stap uit je plan" : block.title}
      onClose={onClose}
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

          {block.slot && onOpenHelpSheet ? (
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
                onOpenHelpSheet({ categoryId: block.categoryId, domain });
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
              <button
                type="button"
                disabled={busy || prefBusy}
                onClick={() => {
                  onDismissPlanStep(block.slot!.date);
                  trackEvent("agenda_plan_step_dismissed", {
                    surface: "agenda_block_detail",
                    scope: "day",
                  });
                  clarityTag("agenda_plan_step", "hidden_day");
                  onClose();
                }}
                className="mt-4 inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-[14px] font-medium text-[#CDD7D0] disabled:opacity-60"
                style={{ fontFamily: "var(--f-sans)" }}
              >
                Verberg op deze dag
              </button>
              {onHideAllPlanSteps ? (
                <button
                  type="button"
                  disabled={busy || prefBusy}
                  onClick={() => {
                    onHideAllPlanSteps();
                    trackEvent("agenda_plan_step_dismissed", {
                      surface: "agenda_block_detail",
                      scope: "all",
                    });
                    clarityTag("agenda_plan_step", "hidden_all");
                    onClose();
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
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    const nextDone = !block.done;
                    onToggleDone?.(block.id, nextDone);
                    trackEvent("agenda_block_toggled", {
                      category_id: block.categoryId,
                      done: nextDone,
                      surface: "agenda_block_detail",
                    });
                    clarityTag("agenda_block", nextDone ? "done" : "undone");
                  }}
                  className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-none px-3 text-[15px] font-semibold disabled:opacity-60"
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
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    onDelete?.(block.id);
                    trackEvent("agenda_block_deleted", {
                      category_id: block.categoryId,
                      surface: "agenda_block_detail",
                    });
                    clarityTag("agenda_block", "archived");
                    onClose();
                  }}
                  className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-[14px] font-medium text-[#CDD7D0] disabled:opacity-60"
                  style={{ fontFamily: "var(--f-sans)" }}
                >
                  Verberg
                </button>
              </div>

              {onRetime ? (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    disabled={busy}
                    aria-expanded={retimeOpen}
                    onClick={() => setRetimeOpen((open) => !open)}
                    className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 border-none bg-transparent px-0 text-[13px] font-semibold text-[var(--sage)] disabled:opacity-60"
                    style={{ fontFamily: "var(--f-sans)" }}
                  >
                    {retimeOpen ? "Sluit verplaatsen" : "Verplaatsen"}
                    <Icons.ChevronRight s={13} />
                  </button>

                  {retimeOpen ? (
                    <div className="mt-3">
                      <label className="mb-3 block">
                        <span className={LABEL_CLASS}>Dag</span>
                        <input
                          type="date"
                          value={retimeDate}
                          disabled={busy}
                          onChange={(event) => setRetimeDate(event.target.value)}
                          className={FIELD_CLASS}
                          style={{ fontFamily: "var(--f-sans)" }}
                        />
                      </label>

                      <label className="mb-3 block">
                        <span className={LABEL_CLASS}>Start</span>
                        <input
                          type="time"
                          value={retimeStart}
                          disabled={busy}
                          step={300}
                          onChange={(event) => setRetimeStart(event.target.value)}
                          className={FIELD_CLASS}
                          style={{ fontFamily: "var(--f-sans)" }}
                        />
                      </label>

                      <p className={LABEL_CLASS}>Duur</p>
                      <div className="mb-3 flex flex-wrap gap-2">
                        {DURATION_CHOICES.map((minutes) => {
                          const selected = minutes === retimeDuration;
                          return (
                            <button
                              key={minutes}
                              type="button"
                              disabled={busy}
                              aria-pressed={selected}
                              onClick={() => setRetimeDuration(minutes)}
                              className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border px-3 text-[12.5px] font-medium tabular-nums transition-colors disabled:opacity-60 ${
                                selected
                                  ? "border-[rgba(90,143,106,0.55)] bg-[rgba(90,143,106,0.2)] text-[#F1EFE8]"
                                  : "border-white/10 bg-white/[0.03] text-[#9FB0A6] hover:border-white/25"
                              }`}
                              style={{ fontFamily: "var(--f-sans)" }}
                            >
                              {minutes} min
                            </button>
                          );
                        })}
                      </div>

                      <p className="mb-3 text-[12.5px] tabular-nums text-[#9FB0A6]">
                        Nieuw: {retimeStart} – {retimeEnd}
                      </p>

                      {retimeError ? (
                        <p className="mb-3 text-[13px] text-[#E2BC96]">{retimeError}</p>
                      ) : null}

                      <button
                        type="button"
                        disabled={busy}
                        onClick={handleRetimeSubmit}
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
                </div>
              ) : null}

              <p className="mt-2 text-[12px] leading-normal text-[#9FB0A6]">
                Verborgen momenten kun je terugzetten via Moment.
              </p>
            </>
          ) : null}
        </article>
      )}
    </AgendaSheetFrame>
  );
}
