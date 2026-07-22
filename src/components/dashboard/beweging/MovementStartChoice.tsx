"use client";

import { useState } from "react";
import * as Icons from "@/components/app/icons";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import {
  MOVEMENT_ANCHOR_OPTIONS,
  MOVEMENT_START_PATTERN_OPTIONS,
  type MovementAnchor,
  type MovementPrefs,
  type MovementStartPattern,
} from "@/lib/movement-prefs";

const SURFACE = "kompas_beweging";

const PATTERN_DESCRIPTIONS: Record<MovementStartPattern, string> = {
  kracht:
    "Spierbehoud is na je 40e de snelste winst — thuis, zonder sportschool.",
  conditie:
    "Stevig wandelen en rustig doorfietsen bouwen je motor stap voor stap op.",
  dagelijks_ritme:
    "Meer bewegen door je dag heen — de trap, een blokje om, minder zitten.",
};

function patternIcon(pattern: MovementStartPattern) {
  if (pattern === "kracht") {
    return <Icons.Activity s={18} />;
  }
  if (pattern === "conditie") {
    return <Icons.Footprints s={18} />;
  }
  return <Icons.Clock s={18} />;
}

type MovementStartChoiceProps = {
  onSaved: (prefs: MovementPrefs) => void;
  onSkip: () => void;
};

/**
 * Eerste-keer keuze (B-1b): startpatroon (spoor, geen oefening-default) +
 * anker ("waarvoor"). Schrijft naar answers-jsonb via /api/account/movement-prefs;
 * het anker kleurt daarna alleen copy — nooit een score.
 */
export default function MovementStartChoice({
  onSaved,
  onSkip,
}: MovementStartChoiceProps) {
  const [pattern, setPattern] = useState<MovementStartPattern | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (anchor: MovementAnchor | null) => {
    if (!pattern || busy) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/account/movement-prefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(
          anchor ? { startPattern: pattern, anchor } : { startPattern: pattern },
        ),
      });
      if (!response.ok) {
        setError("Opslaan lukte niet — probeer het zo nog eens.");
        return;
      }
      const prefs = (await response.json()) as MovementPrefs & { ok: boolean };

      emitIntakeClientEvent("plan.week_category_selected", {
        source: "kompas_beweging_start_pattern",
        category: pattern,
        anchor: anchor ?? "none",
      });
      trackEvent("movement_week_category", {
        category: pattern,
        anchor: anchor ?? "none",
        surface: SURFACE,
      });
      clarityTag("movement_start_pattern", pattern);

      onSaved({ startPattern: prefs.startPattern, anchor: prefs.anchor });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      aria-label="Jouw start — beweging"
      className="relative overflow-hidden rounded-2xl border border-[color:var(--ac)]/45 bg-black/25 p-5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-30 blur-[80px]"
        style={{ background: "var(--ac)" }}
      />
      <div className="relative">
        {pattern == null ? (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ac)]">
              Jouw start · kies je spoor
            </p>
            <h3 className="mt-2 font-serif text-[22px] leading-snug text-[#F1EFE8] text-pretty">
              Waar wil je beginnen?
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-[#CDD7D0] text-pretty">
              Eén spoor is genoeg om te starten — je kunt dit later altijd
              wijzigen.
            </p>
            <div className="mt-4 flex flex-col gap-2.5">
              {MOVEMENT_START_PATTERN_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPattern(option.id)}
                  className="flex w-full cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/25 p-4 text-left transition-colors hover:border-white/20"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[color:var(--ac)]">
                    {patternIcon(option.id)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-serif text-[16px] text-[#F1EFE8]">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-[13px] leading-snug text-[#CDD7D0] text-pretty">
                      {PATTERN_DESCRIPTIONS[option.id]}
                    </span>
                  </span>
                  <span className="mt-2 shrink-0 text-[#7E8C82]">
                    <Icons.ChevronRight s={16} />
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onSkip}
              className="mt-4 cursor-pointer border-none bg-transparent p-0 text-[13px] font-medium text-[#9FB0A6]"
            >
              Liever direct beginnen? Sla over
            </button>
          </>
        ) : (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ac)]">
              Jouw start · waarvoor doe je dit
            </p>
            <h3 className="mt-2 font-serif text-[22px] leading-snug text-[#F1EFE8] text-pretty">
              Als bewegen over tien jaar één ding voor je geregeld heeft — wat
              moet dat zijn?
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-[#CDD7D0] text-pretty">
              Dit kleurt alleen je waarom — je scores blijven gewoon je scores.
            </p>
            <div className="mt-4 flex flex-col gap-2.5">
              {MOVEMENT_ANCHOR_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={busy}
                  onClick={() => void save(option.id)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/25 p-4 text-left transition-colors hover:border-white/20 disabled:opacity-60"
                >
                  <span className="min-w-0 flex-1 text-[14.5px] leading-snug text-[#F1EFE8] text-pretty">
                    {option.label}
                  </span>
                  <span className="shrink-0 text-[#7E8C82]">
                    <Icons.ChevronRight s={16} />
                  </span>
                </button>
              ))}
            </div>
            {error ? (
              <p className="mt-3 text-[13px] text-[#E8A08A]">{error}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setPattern(null)}
                className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-medium text-[#9FB0A6] disabled:opacity-60"
              >
                Terug
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void save(null)}
                className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-medium text-[#9FB0A6] disabled:opacity-60"
              >
                Sla deze vraag over
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
