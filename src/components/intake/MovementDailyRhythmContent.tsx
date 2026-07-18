"use client";

import { useState } from "react";
import Link from "next/link";
import { clarityTag } from "@/lib/clarity";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { trackEvent } from "@/lib/ga4";
import type { MovementDailyRhythm } from "@/lib/movement-daily-rhythm";
import type { MovementSnackId } from "@/data/movement/daily-rhythm";

type MovementDailyRhythmContentProps = {
  rhythm: MovementDailyRhythm;
  domain: string;
  templateVersion: string;
  /** Embedded in week category panel — compact, no outer section chrome. */
  embedded?: boolean;
};

export default function MovementDailyRhythmContent({
  rhythm,
  domain,
  templateVersion,
  embedded = false,
}: MovementDailyRhythmContentProps) {
  const [snackOpen, setSnackOpen] = useState(true);
  const [doneSnacks, setDoneSnacks] = useState<Set<MovementSnackId>>(new Set());

  const trackRhythmClick = (itemId: string, itemType: "snack" | "steps" | "evidence") => {
    emitIntakeClientEvent("plan.daily_rhythm_clicked", {
      domain,
      item_id: itemId,
      item_type: itemType,
      template_version: templateVersion,
    });
    trackEvent("movement_daily_rhythm", {
      item_id: itemId,
      item_type: itemType,
    });
    clarityTag("movement_daily_rhythm", itemId);
  };

  const toggleSnack = (snackId: MovementSnackId) => {
    setDoneSnacks((prev) => {
      const next = new Set(prev);
      if (next.has(snackId)) {
        next.delete(snackId);
      } else {
        next.add(snackId);
      }
      return next;
    });
    trackRhythmClick(snackId, "snack");
  };

  return (
    <div className={embedded ? "space-y-3" : "mt-3 grid gap-3 sm:grid-cols-2"}>
      <div className="rounded-xl border border-intake-sage/25 bg-intake-sage/5 px-3 py-3">
        <button
          type="button"
          className="flex w-full items-start justify-between gap-2 text-left"
          aria-expanded={snackOpen}
          onClick={() => setSnackOpen((open) => !open)}
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-intake-sage">
              Beweegsnack
            </p>
            <p className="mt-1 text-sm font-medium text-intake-ink">
              {rhythm.snackHeadline}
            </p>
          </div>
          <span className="shrink-0 text-intake-ink-subtle" aria-hidden>
            {snackOpen ? "▾" : "▸"}
          </span>
        </button>
        {snackOpen ? (
          <div className="mt-3 border-t border-intake-sage/20 pt-3">
            <div className="flex flex-wrap gap-2">
              {rhythm.snacks.map((snack) => {
                const done = doneSnacks.has(snack.id);
                return (
                  <button
                    key={snack.id}
                    type="button"
                    onClick={() => toggleSnack(snack.id)}
                    className={`rounded-full border px-3 py-1.5 text-left text-xs transition-colors ${
                      done
                        ? "border-intake-sage bg-intake-sage/15 text-intake-sage line-through"
                        : "border-intake-card-border bg-white text-intake-ink hover:border-intake-sage/40"
                    }`}
                  >
                    {snack.label}
                    <span className="ml-1 text-intake-ink-subtle">
                      · {snack.durationMin} min
                    </span>
                  </button>
                );
              })}
            </div>
            <Link
              href={rhythm.evidenceHref}
              className="mt-3 inline-block text-xs font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-2"
              onClick={() => {
                trackRhythmClick("MOV_SED", "evidence");
                emitIntakeClientEvent("plan.step_link_clicked", {
                  domain,
                  step_id: "MOV_SED",
                  link_kind: "article",
                  surface: "daily_rhythm",
                });
              }}
            >
              Onderbouwing sedentair gedrag →
            </Link>
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-intake-card-border bg-intake-bg px-3 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-intake-ink-subtle">
          Stappen
        </p>
        <p className="mt-1 text-sm font-medium text-intake-ink">
          {rhythm.stepsHeadline}
        </p>
        <p className="mt-2 text-sm font-semibold text-intake-sage">
          {rhythm.stepsTarget.label}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-intake-ink-subtle">
          {rhythm.stepsTarget.hint}
        </p>
        <Link
          href={rhythm.evidenceHref}
          className="mt-3 inline-block text-xs font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-2"
          onClick={() => {
            trackRhythmClick("steps_target", "steps");
            emitIntakeClientEvent("plan.step_link_clicked", {
              domain,
              step_id: "steps_target",
              link_kind: "article",
              surface: "daily_rhythm",
            });
          }}
        >
          Waarom deze richting? →
        </Link>
      </div>
    </div>
  );
}
