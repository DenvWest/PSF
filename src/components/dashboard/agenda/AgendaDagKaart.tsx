"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import { clarityTag } from "@/lib/clarity";
import { DAG_STOFFEN, dagStof } from "@/lib/agenda-dag-stoffen";
import { eiwitPerMaaltijd } from "@/lib/agenda-eiwit-per-maaltijd";
import { trackEvent } from "@/lib/ga4";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import type { KernstofNormen } from "@/lib/nutrition-normen";
import { nutrientReferences } from "@/data/nutrition/intake-reference";

type AgendaDagKaartProps = {
  dag: DagboekDag | null;
  normen: KernstofNormen;
  stapTitel: string | null;
  handleidingHref: string | null;
};

const CHIP =
  "inline-flex min-h-9 shrink-0 cursor-pointer items-center rounded-full border px-3 text-[12.5px] font-medium transition-colors";

function percentage(aandeel: number): number {
  return Math.round(Math.min(aandeel, 1) * 100);
}

export default function AgendaDagKaart({ dag, normen, stapTitel, handleidingHref }: AgendaDagKaartProps) {
  const [actief, setActief] = useState<NutrientId>("protein");

  useEffect(() => {
    trackEvent("agenda_dagkaart_shown", { heeft_dagboek: Boolean(dag?.items?.length) });
  }, [dag?.items?.length]);

  const maaltijden = useMemo(() => eiwitPerMaaltijd(dag), [dag]);
  const stof = useMemo(() => dagStof(dag, actief, normen), [dag, actief, normen]);

  return (
    <section
      aria-label="Je dag in stoffen"
      className="mb-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-3.5 sm:p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="m-0 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#9FB0A6]">
          Je dag in stoffen
        </h3>
        {handleidingHref ? (
          <Link
            href={handleidingHref}
            onClick={() => {
              trackEvent("dashboard_agenda_plan_click", { surface: "agenda_dagkaart" });
              clarityTag("dashboard_agenda", "plan_link");
            }}
            className="inline-flex min-h-9 items-center gap-1 text-[12px] font-medium text-[#9FB0A6] no-underline transition-colors hover:text-[#F1EFE8]"
          >
            Handleiding
            <Icons.ArrowRight s={12} />
          </Link>
        ) : null}
      </div>

      <div
        role="tablist"
        aria-label="Kies een stof"
        className="-mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1 pb-1"
      >
        {DAG_STOFFEN.map((nutrient) => {
          const selected = nutrient === actief;
          return (
            <button
              key={nutrient}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => {
                setActief(nutrient);
                trackEvent("agenda_dagkaart_stof_gekozen", { stof: nutrient });
                clarityTag("agenda_dagkaart", nutrient);
              }}
              className={`${CHIP} ${
                selected
                  ? "border-[var(--sage)] bg-[var(--sage)]/15 text-[#F1EFE8]"
                  : "border-white/10 bg-white/[0.03] text-[#9FB0A6] hover:text-[#F1EFE8]"
              }`}
            >
              {nutrientReferences[nutrient].label}
            </button>
          );
        })}
      </div>

      {actief === "protein" ? (
        <div role="tabpanel" className="mt-3">
          <p className="m-0 text-[13px] leading-snug text-[#CDD7D0] text-pretty">
            {stapTitel ?? "Begin elke maaltijd met 20–30 g eiwit."}
          </p>
          <ul className="m-0 mt-3 grid list-none grid-cols-3 gap-2 p-0">
            {maaltijden.map((maaltijd) => (
              <li
                key={maaltijd.id}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 ${
                  maaltijd.stand === "gehaald"
                    ? "border-[#7FB28E]/40 bg-[#7FB28E]/10"
                    : "border-white/10 bg-black/15"
                }`}
              >
                <span className="text-[11px] text-[#9FB0A6]">{maaltijd.label}</span>
                <span
                  className="flex items-center gap-1 text-[18px] leading-none text-[#F1EFE8] tabular-nums"
                  style={{ fontFamily: "var(--f-serif)" }}
                >
                  {maaltijd.stand === "gehaald" ? (
                    <Icons.Check s={14} style={{ color: "#7FB28E" }} />
                  ) : null}
                  {maaltijd.gram !== null ? maaltijd.gram : "—"}
                  {maaltijd.gram !== null ? <span className="text-[11px] text-[#9FB0A6]">g</span> : null}
                </span>
                <span className="sr-only">
                  {maaltijd.stand === "gehaald"
                    ? "minimaal 20 gram eiwit"
                    : maaltijd.stand === "open"
                      ? "nog niet aangetoond"
                      : "niet ingevuld"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div role="tabpanel" className="mt-3">
          {stof.stand === "leeg" ? (
            <p className="m-0 text-[13px] leading-snug text-[#9FB0A6]">
              Nog niets ingevuld voor vandaag.
            </p>
          ) : (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <span
                  className="flex items-center gap-1.5 text-[22px] leading-none text-[#F1EFE8] tabular-nums"
                  style={{ fontFamily: "var(--f-serif)" }}
                >
                  {stof.stand === "gehaald" ? (
                    <Icons.Check s={16} style={{ color: "#7FB28E" }} />
                  ) : null}
                  {stof.aandeel !== null ? `${percentage(stof.aandeel)}%` : "—"}
                </span>
                <span className="text-[12px] text-[#9FB0A6]">
                  {stof.stand === "gehaald" ? "van je norm gedekt" : "van je norm, minstens"}
                </span>
              </div>
              <div
                className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10"
                role="img"
                aria-label={`${stof.label}: minstens ${percentage(stof.aandeel ?? 0)}% van je norm`}
              >
                <div
                  className={`h-full rounded-full ${
                    stof.stand === "gehaald" ? "bg-[#7FB28E]" : "bg-white/45"
                  }`}
                  style={{ width: `${percentage(stof.aandeel ?? 0)}%` }}
                />
              </div>
            </>
          )}
        </div>
      )}

      <p className="m-0 mt-3 text-[11px] leading-relaxed text-[#7E8C82]">
        Een vinkje staat er pas als je dagboek het laat zien. Een leeg vakje betekent niet dat je het
        gemist hebt.
      </p>
    </section>
  );
}
