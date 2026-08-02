"use client";

import { useEffect, useId, useState } from "react";
import type { ComponentType, CSSProperties } from "react";
import * as Icons from "@/components/app/icons";
import AgendaSheetFrame from "@/components/dashboard/agenda/AgendaSheetFrame";
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

const LABEL_CLASS =
  "mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9FB0A6]";
const FIELD_CLASS =
  "min-h-11 w-full rounded-[10px] border border-white/10 bg-black/25 px-3 text-[15px] text-[#F1EFE8] disabled:opacity-60";

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
    return () => {
      clarityTag("agenda_block", "add_close");
    };
  }, [open]);

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
    <AgendaSheetFrame titleId={titleId} title="Nieuw leefstijlmoment" onClose={onClose}>
      {hiddenPlanStep ? (
        <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
          <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9FB0A6]">
            Verborgen stap uit je plan
          </p>
          <div
            className="flex items-center justify-between gap-3"
            style={{
              borderLeftWidth: 3,
              borderLeftColor: hiddenPlanStep.color,
              paddingLeft: 10,
            }}
          >
            <div className="min-w-0 flex-1">
              <p
                className="m-0 truncate text-[14px] font-medium text-[#F1EFE8]"
                style={{ fontFamily: "var(--f-serif)" }}
              >
                {hiddenPlanStep.title}
              </p>
              <p className="mt-0.5 text-[12px] text-[#9FB0A6]">{hiddenPlanStep.domainLabel}</p>
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
              className="inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-full border border-white/10 bg-white/[0.04] px-3 text-[12px] font-semibold text-[var(--sage)] disabled:opacity-60"
              style={{ fontFamily: "var(--f-sans)" }}
            >
              {hiddenPlanStep.reason === "all" ? "Toon plan-stappen weer" : "Terugzetten"}
            </button>
          </div>
        </div>
      ) : null}

      <p className={LABEL_CLASS}>Categorie</p>
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
              aria-pressed={selected}
              onClick={() => setCategoryId(category.id)}
              className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition-colors disabled:opacity-60"
              style={{
                borderColor: selected ? category.color : "rgba(255,255,255,0.12)",
                background: selected ? `${category.color}26` : "rgba(255,255,255,0.03)",
                color: selected ? "#F1EFE8" : "#9FB0A6",
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
        <span className={LABEL_CLASS}>Hoe noem je dit moment?</span>
        <input
          type="text"
          value={title}
          disabled={busy}
          maxLength={120}
          placeholder="Bijv. wandelen na het eten"
          onChange={(event) => setTitle(event.target.value)}
          className={FIELD_CLASS}
          style={{ fontFamily: "var(--f-sans)" }}
        />
      </label>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <label>
          <span className={LABEL_CLASS}>Start</span>
          <input
            type="time"
            value={startTime}
            disabled={busy}
            onChange={(event) => setStartTime(event.target.value)}
            className={`${FIELD_CLASS} tabular-nums`}
            style={{ fontFamily: "var(--f-sans)" }}
          />
        </label>
        <label>
          <span className={LABEL_CLASS}>Eind</span>
          <input
            type="time"
            value={endTime}
            disabled={busy}
            onChange={(event) => setEndTime(event.target.value)}
            className={`${FIELD_CLASS} tabular-nums`}
            style={{ fontFamily: "var(--f-sans)" }}
          />
        </label>
      </div>

      {error ? <p className="mb-3 text-[13px] text-[#E2BC96]">{error}</p> : null}

      <button
        type="button"
        disabled={busy}
        onClick={() => void handleSubmit()}
        className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-none text-[15px] font-semibold disabled:opacity-60"
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
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9FB0A6]">
            Verborgen momenten
          </p>
          <p className="mb-3 text-[12px] leading-normal text-[#9FB0A6]">
            Je kunt een eerder verborgen moment hier terugzetten op je agenda.
          </p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {archivedBlocks.map((block) => {
              const category = getAgendaCategory(block.categoryId);
              return (
                <li
                  key={block.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
                  style={{ borderLeftWidth: 3, borderLeftColor: category.color }}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className="m-0 truncate text-[14px] font-medium text-[#F1EFE8]"
                      style={{ fontFamily: "var(--f-serif)" }}
                    >
                      {block.title}
                    </p>
                    <p className="mt-0.5 text-[12px] tabular-nums text-[#9FB0A6]">
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
                    className="inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-full border border-white/10 bg-white/[0.04] px-3 text-[12px] font-semibold text-[var(--sage)] disabled:opacity-60"
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
    </AgendaSheetFrame>
  );
}
