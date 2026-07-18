"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ComponentType, CSSProperties } from "react";
import * as Icons from "@/components/app/icons";
import { SELECTABLE_AGENDA_CATEGORIES } from "@/data/agenda/categories";
import { normalizeLocalTime } from "@/lib/account-priority-pref";
import { getAgendaCategory } from "@/data/agenda/categories";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { AgendaBlockRecord, AgendaCategoryId } from "@/types/agenda";

type HiddenPlanStep = {
  title: string;
  domainLabel: string;
  color: string;
  reason: "day" | "all";
};

type AgendaAddBlockSheetProps = {
  open: boolean;
  date: string;
  busy?: boolean;
  archivedBlocks?: AgendaBlockRecord[];
  hiddenPlanStep?: HiddenPlanStep | null;
  initialStartTime?: string;
  initialEndTime?: string;
  createSurface?: "agenda_add_sheet" | "agenda_timeline_tap";
  onClose: () => void;
  onRestore?: (blockId: string) => Promise<void>;
  onRestorePlanStep?: () => Promise<void>;
  onShowAllPlanSteps?: () => Promise<void>;
  onSubmit: (input: {
    date: string;
    categoryId: AgendaCategoryId;
    title: string;
    startTime: string;
    endTime: string;
  }) => Promise<void>;
};

export default function AgendaAddBlockSheet({
  open,
  date,
  busy = false,
  archivedBlocks = [],
  hiddenPlanStep = null,
  initialStartTime,
  initialEndTime,
  createSurface = "agenda_add_sheet",
  onClose,
  onRestore,
  onRestorePlanStep,
  onShowAllPlanSteps,
  onSubmit,
}: AgendaAddBlockSheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const [categoryId, setCategoryId] = useState<AgendaCategoryId>("persoonlijke_routine");
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState(initialStartTime ?? "12:00");
  const [endTime, setEndTime] = useState(initialEndTime ?? "12:30");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    clarityTag("agenda_block", "add_open");

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      clarityTag("agenda_block", "add_close");
    };
  }, [open, onClose]);

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Geef je moment een titel.");
      return;
    }

    const normalizedStart = normalizeLocalTime(startTime);
    const normalizedEnd = normalizeLocalTime(endTime);
    if (!normalizedStart || !normalizedEnd) {
      setError("Kies een geldig tijdvenster.");
      return;
    }

    const [startH, startM] = normalizedStart.split(":").map(Number);
    const [endH, endM] = normalizedEnd.split(":").map(Number);
    if (startH * 60 + startM >= endH * 60 + endM) {
      setError("Eindtijd moet na starttijd liggen.");
      return;
    }

    setError(null);
    try {
      await onSubmit({
        date,
        categoryId,
        title: trimmedTitle,
        startTime: normalizedStart,
        endTime: normalizedEnd,
      });
      trackEvent("agenda_block_created", {
        category_id: categoryId,
        surface: createSurface,
      });
      clarityTag("agenda_block", "created");
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Kon dit moment niet opslaan.",
      );
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100]" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Sluit nieuw moment"
        onClick={onClose}
      />

      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed bottom-0 left-0 right-0 flex max-h-[85vh] flex-col rounded-t-2xl border border-[#ebe7e2] bg-[#fcfbfa] shadow-2xl outline-none md:bottom-auto md:left-auto md:top-0 md:h-dvh md:max-h-none md:w-[420px] md:rounded-none md:rounded-l-2xl md:border-l md:border-t-0"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#ebe7e2] px-4 py-4 md:px-6">
          <h2
            id={titleId}
            className="m-0 text-[15px] font-semibold text-[#1c1917]"
            style={{ fontFamily: "var(--f-sans)" }}
          >
            Nieuw leefstijlmoment
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-9 shrink-0 cursor-pointer items-center rounded-lg border-none bg-transparent px-2 text-[18px] leading-none text-[#78716c] transition-colors hover:text-[#1c1917]"
            aria-label="Sluiten"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4 md:px-6">
          {hiddenPlanStep ? (
            <div className="mb-5 rounded-[12px] border border-[#e4e0da] bg-white px-3 py-2.5">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#78716c]">
                Verborgen stap uit je plan
              </p>
              <div
                className="flex items-center justify-between gap-3"
                style={{ borderLeftWidth: 3, borderLeftColor: hiddenPlanStep.color, paddingLeft: 10 }}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className="m-0 truncate text-[14px] font-medium text-[#1c1917]"
                    style={{ fontFamily: "var(--f-serif)" }}
                  >
                    {hiddenPlanStep.title}
                  </p>
                  <p className="mt-0.5 text-[12px] text-[#78716c]">{hiddenPlanStep.domainLabel}</p>
                </div>
                <button
                  type="button"
                  disabled={
                    busy ||
                    (hiddenPlanStep.reason === "all" ? !onShowAllPlanSteps : !onRestorePlanStep)
                  }
                  onClick={() => {
                    void (async () => {
                      try {
                        if (hiddenPlanStep.reason === "all") {
                          if (!onShowAllPlanSteps) {
                            return;
                          }
                          await onShowAllPlanSteps();
                          trackEvent("agenda_plan_step_restored", {
                            surface: "agenda_add_sheet",
                            scope: "all",
                          });
                          clarityTag("agenda_plan_step", "shown_all");
                          return;
                        }

                        if (!onRestorePlanStep) {
                          return;
                        }
                        await onRestorePlanStep();
                        trackEvent("agenda_plan_step_restored", {
                          surface: "agenda_add_sheet",
                          scope: "day",
                        });
                        clarityTag("agenda_plan_step", "restored_day");
                      } catch (restoreError) {
                        setError(
                          restoreError instanceof Error
                            ? restoreError.message
                            : "Kon plan-stap niet terugzetten.",
                        );
                      }
                    })();
                  }}
                  className="inline-flex min-h-9 shrink-0 cursor-pointer items-center rounded-full border border-[#e4e0da] bg-[#faf9f7] px-3 text-[12px] font-semibold text-[var(--sage)] disabled:opacity-60"
                  style={{ fontFamily: "var(--f-sans)" }}
                >
                  {hiddenPlanStep.reason === "all" ? "Toon plan-stappen weer" : "Terugzetten"}
                </button>
              </div>
            </div>
          ) : null}

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#78716c]">
            Categorie
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            {SELECTABLE_AGENDA_CATEGORIES.map((category) => {
              const Icon = Icons[category.icon as keyof typeof Icons] as ComponentType<{
                s?: number;
                style?: CSSProperties;
              }>;
              const selected = category.id === categoryId;
              return (
                <button
                  key={category.id}
                  type="button"
                  disabled={busy}
                  onClick={() => setCategoryId(category.id)}
                  className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition-colors disabled:opacity-60"
                  style={{
                    borderColor: selected ? category.color : "#e4e0da",
                    background: selected ? `${category.color}14` : "white",
                    color: selected ? "#1c1917" : "#78716c",
                    fontFamily: "var(--f-sans)",
                  }}
                >
                  <Icon s={13} style={{ color: category.color }} />
                  {category.label}
                </button>
              );
            })}
          </div>

          <label className="mb-4 block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#78716c]">
              Hoe noem je dit moment?
            </span>
            <input
              type="text"
              value={title}
              disabled={busy}
              maxLength={120}
              placeholder="Bijv. wandelen na het eten"
              onChange={(event) => setTitle(event.target.value)}
              className="min-h-11 w-full rounded-[10px] border border-[#e4e0da] bg-white px-3 text-[15px] text-[#1c1917] disabled:opacity-60"
              style={{ fontFamily: "var(--f-sans)" }}
            />
          </label>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <label>
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#78716c]">
                Start
              </span>
              <input
                type="time"
                value={startTime}
                disabled={busy}
                onChange={(event) => setStartTime(event.target.value)}
                className="min-h-11 w-full rounded-[10px] border border-[#e4e0da] bg-white px-3 text-[15px] tabular-nums text-[#1c1917] disabled:opacity-60"
                style={{ fontFamily: "var(--f-sans)" }}
              />
            </label>
            <label>
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#78716c]">
                Eind
              </span>
              <input
                type="time"
                value={endTime}
                disabled={busy}
                onChange={(event) => setEndTime(event.target.value)}
                className="min-h-11 w-full rounded-[10px] border border-[#e4e0da] bg-white px-3 text-[15px] tabular-nums text-[#1c1917] disabled:opacity-60"
                style={{ fontFamily: "var(--f-sans)" }}
              />
            </label>
          </div>

          {error ? <p className="mb-3 text-[13px] text-[#b45309]">{error}</p> : null}

          <button
            type="button"
            disabled={busy}
            onClick={() => void handleSubmit()}
            className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] border-none text-[15px] font-semibold disabled:opacity-60"
            style={{
              background: "var(--sage)",
              color: "#0f1c10",
              fontFamily: "var(--f-sans)",
            }}
          >
            <Icons.Plus s={16} />
            Toevoegen
          </button>

          {archivedBlocks.length > 0 ? (
            <div className="mt-5 border-t border-[#e4e0da] pt-4">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#78716c]">
                Verborgen momenten
              </p>
              <p className="mb-3 text-[12px] leading-normal text-[#78716c]">
                Je kunt een eerder verborgen moment hier terugzetten op je agenda.
              </p>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {archivedBlocks.map((block) => {
                  const category = getAgendaCategory(block.categoryId);
                  return (
                    <li
                      key={block.id}
                      className="flex items-center justify-between gap-3 rounded-[12px] border border-[#e4e0da] bg-white px-3 py-2.5"
                      style={{ borderLeftWidth: 3, borderLeftColor: category.color }}
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className="m-0 truncate text-[14px] font-medium text-[#1c1917]"
                          style={{ fontFamily: "var(--f-serif)" }}
                        >
                          {block.title}
                        </p>
                        <p className="mt-0.5 text-[12px] tabular-nums text-[#78716c]">
                          {block.startTime} – {block.endTime}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={busy || !onRestore}
                        onClick={() => {
                          if (!onRestore) {
                            return;
                          }
                          void (async () => {
                            try {
                              await onRestore(block.id);
                              trackEvent("agenda_block_restored", {
                                category_id: block.categoryId,
                                surface: "agenda_add_sheet",
                              });
                              clarityTag("agenda_block", "restored");
                            } catch (restoreError) {
                              setError(
                                restoreError instanceof Error
                                  ? restoreError.message
                                  : "Kon moment niet terugzetten.",
                              );
                            }
                          })();
                        }}
                        className="inline-flex min-h-9 shrink-0 cursor-pointer items-center rounded-full border border-[#e4e0da] bg-[#faf9f7] px-3 text-[12px] font-semibold text-[var(--sage)] disabled:opacity-60"
                        style={{ fontFamily: "var(--f-sans)" }}
                      >
                        Terugzetten
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
