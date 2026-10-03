"use client";

import { useEffect, useMemo, useState } from "react";
import * as Icons from "@/components/app/icons";
import {
  bouwTekortVoorstellen,
  dekkingPerDag,
} from "@/lib/agenda-tekort-voorstellen";
import type { TekortVoorstel } from "@/lib/agenda-tekort-voorstellen";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { bouwTekortsysteem } from "@/lib/nutrition-tekortsysteem";
import type { AgendaCategoryId } from "@/types/agenda";

type AgendaTekortVoorstellenProps = {
  selectedDate: string;
  today: string;
  weekDates: readonly string[];
  weekDayLabels: readonly string[];
  plannedTitles: readonly string[];
  busy: boolean;
  onPlan: (input: {
    date: string;
    categoryId: AgendaCategoryId;
    title: string;
    startTime: string;
    endTime: string;
  }) => Promise<void>;
};

export default function AgendaTekortVoorstellen({
  selectedDate,
  today,
  weekDates,
  weekDayLabels,
  plannedTitles,
  busy,
  onPlan,
}: AgendaTekortVoorstellenProps) {
  const [dagen, setDagen] = useState<DagboekDag[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/account/nutrition-daybook", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("laden mislukt");
        const body = (await response.json()) as { days?: DagboekDag[] };
        if (!cancelled) setDagen(body.days ?? []);
      } catch {
        if (!cancelled) setDagen([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const voorstellen = useMemo(
    () => (dagen ? bouwTekortVoorstellen(bouwTekortsysteem(dagen, today)) : []),
    [dagen, today],
  );

  const focus = voorstellen[0] ?? null;
  const dekking = useMemo(
    () => (dagen && focus ? dekkingPerDag(dagen, focus.nutrient, weekDates) : null),
    [dagen, focus, weekDates],
  );

  useEffect(() => {
    if (focus) {
      trackEvent("agenda_tekort_voorstellen_shown", { nutrient: focus.nutrient });
    }
  }, [focus]);

  if (selectedDate < today || voorstellen.length === 0) {
    return null;
  }

  const plan = async (voorstel: TekortVoorstel) => {
    setError(null);
    try {
      await onPlan({
        date: selectedDate,
        categoryId: voorstel.categoryId,
        title: voorstel.title,
        startTime: voorstel.startTime,
        endTime: voorstel.endTime,
      });
      trackEvent("agenda_block_created", {
        category_id: voorstel.categoryId,
        surface: "agenda_tekort_voorstel",
        nutrient: voorstel.nutrient,
      });
      clarityTag("agenda_block", "created_tekort_voorstel");
    } catch (planError) {
      setError(
        planError instanceof Error ? planError.message : "Kon dit moment niet inplannen.",
      );
    }
  };

  return (
    <aside
      aria-label="Voorstellen uit je patroon"
      className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3"
    >
      <h2 className="m-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9FB0A6]">
        Uit je patroon
      </h2>
      <p className="mt-1 text-[13px] leading-snug text-[#CDD7D0]">
        Dit zijn plekken in je dag waar je {focus?.label.toLowerCase()} kunt vinden. Eén tik zet
        het in je agenda.
      </p>

      <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
        {voorstellen.map((voorstel) => {
          const gepland = plannedTitles.includes(voorstel.title);
          return (
            <li
              key={voorstel.nutrient}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="m-0 text-[13.5px] leading-snug text-[#F1EFE8]">{voorstel.title}</p>
                <p className="m-0 mt-0.5 text-[11.5px] text-[#9FB0A6]">
                  {voorstel.label} · {voorstel.moment} · {voorstel.startTime}
                </p>
              </div>
              {gepland ? (
                <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-[#7FB28E]">
                  <Icons.Check s={13} />
                  Gepland
                </span>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void plan(voorstel)}
                  className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1 rounded-full border border-[var(--sage)] bg-[var(--sage)] px-3 text-[12px] font-semibold text-[#0f1c10] disabled:opacity-60"
                >
                  <Icons.Plus s={13} />
                  Plan in
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {error ? <p className="mb-0 mt-2 text-[12.5px] text-[#E2BC96]">{error}</p> : null}

      {focus && dekking ? (
        <div className="mt-3">
          <p className="m-0 text-[11.5px] text-[#9FB0A6]">
            {focus.label} deze week — een vinkje betekent dat je dagboek de richtwaarde bewijst
          </p>
          <ol className="m-0 mt-1.5 grid list-none grid-cols-7 gap-1 p-0">
            {weekDates.map((date, index) => {
              const stand = dekking[date];
              return (
                <li
                  key={date}
                  className="flex flex-col items-center gap-0.5 text-[10px] text-[#9FB0A6]"
                >
                  <span>{weekDayLabels[index]}</span>
                  <span
                    className="flex h-5 items-center justify-center"
                    aria-label={
                      stand === "gedekt"
                        ? "gedekt"
                        : stand === "open"
                          ? "nog te gaan"
                          : "niet ingevuld"
                    }
                  >
                    {stand === "gedekt" ? (
                      <Icons.Check s={13} />
                    ) : (
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          stand === "open" ? "bg-white/45" : "bg-white/15"
                        }`}
                        aria-hidden
                      />
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}
    </aside>
  );
}
