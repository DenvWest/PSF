"use client";

import { useEffect, useRef } from "react";
import { MOVEMENT_FORMS } from "@/data/movement/movement-forms";
import { SPORT_CATALOG } from "@/data/movement/sport-catalog";
import { buildMovementSportLens } from "@/lib/movement-sport-lens";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";

export type MovementSportLensProps = {
  sports: string[];
  busy: boolean;
  onToggleSport: (sportId: string) => void;
};

function coverageBarClass(level: "dekt" | "deels" | "niet"): string {
  if (level === "dekt") {
    return "bg-[color:var(--ac)]";
  }
  if (level === "deels") {
    return "bg-[color:var(--ac)]/45";
  }
  return "bg-white/10";
}

export default function MovementSportLens({
  sports,
  busy,
  onToggleSport,
}: MovementSportLensProps) {
  const lens = buildMovementSportLens(sports);
  const gapShownRef = useRef<string | null>(null);

  useEffect(() => {
    if (sports.length === 0 || lens.missingForms.length === 0) {
      return;
    }
    const key = `${sports.join(",")}:${lens.missingForms.join(",")}`;
    if (gapShownRef.current === key) {
      return;
    }
    gapShownRef.current = key;
    trackEvent("movement_gap_shown", {
      forms_missing: lens.missingForms.join(","),
      surface: "stappenplan_lens",
    });
    emitAccountClientEvent("movement.gap_shown", {
      forms_missing: lens.missingForms,
      surface: "stappenplan_lens",
    });
    clarityTag("movement_gap_lens", lens.missingForms.join(","));
  }, [lens.missingForms, sports]);

  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
          Wat je al afdekt
        </p>
        <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.09em] text-[#7E8C82]">
          kleurt de uitleg
        </span>
      </div>
      <p className="mt-2 max-w-[68ch] text-[13px] leading-relaxed text-[#CDD7D0]">
        {lens.headline}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {SPORT_CATALOG.map((sport) => {
          const selected = sports.includes(sport.id);
          const atMax = sports.length >= 3 && !selected;
          return (
            <button
              key={sport.id}
              type="button"
              disabled={busy || atMax}
              onClick={() => {
                const nextSports = selected
                  ? sports.filter((id) => id !== sport.id)
                  : [...sports, sport.id];
                onToggleSport(sport.id);
                trackEvent("movement_sport_selected", {
                  sports: nextSports.join(","),
                  surface: "stappenplan_lens",
                });
                emitAccountClientEvent("movement.sport_selected", {
                  sports: nextSports,
                  surface: "stappenplan_lens",
                });
                clarityTag("movement_sport_lens", sport.id);
              }}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                selected
                  ? "border-[color:var(--ac)]/60 bg-[color:var(--ac)]/15 text-[#F1EFE8]"
                  : "border-white/15 text-[#CDD7D0] hover:border-white/25"
              }`}
            >
              {sport.label}
              {sport.status === "beta" ? " · beta" : ""}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-2">
        {MOVEMENT_FORMS.map((form) => (
          <div key={form.id} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-[11px] text-[#9FB0A6]">{form.label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${coverageBarClass(lens.coverage[form.id])}`}
                style={{
                  width:
                    lens.coverage[form.id] === "dekt"
                      ? "100%"
                      : lens.coverage[form.id] === "deels"
                        ? "55%"
                        : "12%",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {lens.note ? (
        <p className="mt-3 max-w-[68ch] text-[12px] leading-relaxed text-[#9FB0A6]">
          {lens.note}
        </p>
      ) : null}
      <p className="mt-3 max-w-[68ch] text-[11px] leading-relaxed text-[#7E8C82]">
        Dit is het gemiddelde profiel van een sport, geen meting van jou. Maximaal drie
        sporten.
      </p>
    </section>
  );
}
