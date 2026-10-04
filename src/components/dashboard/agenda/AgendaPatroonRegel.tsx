"use client";

import { useEffect, useMemo } from "react";
import * as Icons from "@/components/app/icons";
import { dekkingPerDag } from "@/lib/agenda-tekort-voorstellen";
import type { TekortVoorstel } from "@/lib/agenda-tekort-voorstellen";
import { trackEvent } from "@/lib/ga4";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { useKernstofNormen } from "@/lib/use-kernstof-normen";

type AgendaPatroonRegelProps = {
  focus: TekortVoorstel | null;
  dagen: readonly DagboekDag[];
  weekDates: readonly string[];
  weekDayLabels: readonly string[];
  onOpenPatroon: () => void;
};

export default function AgendaPatroonRegel({
  focus,
  dagen,
  weekDates,
  weekDayLabels,
  onOpenPatroon,
}: AgendaPatroonRegelProps) {
  const normen = useKernstofNormen();
  const dekking = useMemo(
    () => (focus ? dekkingPerDag(dagen, focus.nutrient, weekDates, normen) : null),
    [dagen, focus, weekDates, normen],
  );

  useEffect(() => {
    if (focus) {
      trackEvent("agenda_patroon_regel_shown", { nutrient: focus.nutrient });
    }
  }, [focus]);

  if (!focus || !dekking) {
    return null;
  }

  return (
    <div className="mb-3 flex items-center justify-between gap-3 text-[12px] text-[#9FB0A6]">
      <div className="flex min-w-0 items-center gap-2">
        <span className="shrink-0 font-semibold text-[#CDD7D0]">{focus.label}</span>
        <ol className="m-0 flex list-none items-center gap-1.5 p-0">
          {weekDates.map((date, index) => {
            const stand = dekking[date];
            const label =
              stand === "gedekt"
                ? "gedekt"
                : stand === "open"
                  ? "nog te gaan"
                  : "niet ingevuld";
            return (
              <li
                key={date}
                className="flex h-5 w-4 items-center justify-center"
                title={`${weekDayLabels[index]}: ${label}`}
                aria-label={`${weekDayLabels[index]}: ${label}`}
              >
                {stand === "gedekt" ? (
                  <Icons.Check s={12} style={{ color: "#7FB28E" }} />
                ) : (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      stand === "open" ? "bg-white/45" : "bg-white/15"
                    }`}
                    aria-hidden
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
      <button
        type="button"
        onClick={() => {
          trackEvent("agenda_patroon_regel_click", { nutrient: focus.nutrient });
          onOpenPatroon();
        }}
        className="inline-flex shrink-0 cursor-pointer items-center gap-0.5 border-none bg-transparent p-0 text-[12px] font-semibold text-[var(--sage)]"
      >
        Je patroon
        <Icons.ChevronRight s={13} />
      </button>
    </div>
  );
}
