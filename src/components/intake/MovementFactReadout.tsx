"use client";

import { useState } from "react";
import {
  MOVEMENT_FACT_HEADING,
  MOVEMENT_FACT_INTRO,
  MOVEMENT_FACT_STATUS_LABELS,
} from "@/data/movement-checkin";
import { trackEvent } from "@/lib/ga4";
import type { MovementFactRow, MovementFactStatus } from "@/lib/movement-assessment";

const VISIBLE_ROWS = 4;

const STATUS_STYLE: Record<MovementFactStatus, string> = {
  below: "border-[#C26E4B]/50 text-[#C26E4B]",
  near: "border-[#C8956C]/45 text-[#C8956C]",
  meets: "border-[#5A8F6A]/50 text-[#9CC5A9]",
  own: "border-white/10 text-[#7E8C82]",
};

export type MovementFactReadoutProps = {
  rows: MovementFactRow[];
  focusDimension: string | null;
  surface: "intake_beweging" | "voortgang_beweging";
};

/**
 * Het feitelijke beeld onder de readout: per deel eerst zijn eigen antwoord, dan
 * de richtlijn waar die bestaat, en pas daarna een kwalificatie (L12). Vier rijen
 * standaard — meer maakt van het resultaat een leesscherm en duwt de enige actie
 * die telt uit beeld.
 */
export default function MovementFactReadout({
  rows,
  focusDimension,
  surface,
}: MovementFactReadoutProps) {
  const [expanded, setExpanded] = useState(false);

  if (rows.length === 0) {
    return null;
  }

  const visible = expanded ? rows : rows.slice(0, VISIBLE_ROWS);
  const hasMore = rows.length > VISIBLE_ROWS;

  function handleToggle() {
    if (!expanded) {
      trackEvent("movement_checkin_fact_readout_expanded", {
        surface,
        focus_dimension: focusDimension ?? "geen",
      });
    }
    setExpanded((open) => !open);
  }

  return (
    <section aria-labelledby="movement-fact-heading" className="mt-5">
      <h2
        id="movement-fact-heading"
        className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#CDD7D0]"
      >
        {MOVEMENT_FACT_HEADING}
      </h2>
      <p className="mt-1 text-[11.5px] leading-relaxed text-[#7E8C82]">{MOVEMENT_FACT_INTRO}</p>

      <ul className="mt-3 list-none space-y-0 p-0">
        {visible.map((row) => (
          <li key={row.key} className="border-t border-white/[0.06] py-3 last:border-b">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[12.5px] font-bold text-[#F1EFE8]">{row.label}</p>
              <span
                className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${STATUS_STYLE[row.status]}`}
              >
                {MOVEMENT_FACT_STATUS_LABELS[row.status]}
              </span>
            </div>
            <p className="mt-1 text-[13.5px] font-medium leading-snug text-[#F1EFE8]">
              {row.answerLabel}
            </p>
            {row.benchmarkLabel ? (
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#9FB0A6]">
                {row.benchmarkLabel}
                {row.benchmarkSource ? (
                  <span className="text-[#7E8C82]"> · {row.benchmarkSource}</span>
                ) : null}
              </p>
            ) : null}
            <p className="mt-1 text-[12px] leading-relaxed text-[#CDD7D0]">{row.whyLine}</p>
            {row.footnote ? (
              <p className="mt-1.5 text-[11px] leading-relaxed text-[#7E8C82]">{row.footnote}</p>
            ) : null}
          </li>
        ))}
      </ul>

      {hasMore ? (
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={expanded}
          className="mt-2 min-h-[44px] w-full cursor-pointer border-none bg-transparent p-0 text-left text-[12.5px] font-semibold text-[#9CC5A9] transition-colors hover:text-[#F1EFE8]"
        >
          {expanded ? "Toon minder" : "Toon alle metingen"}
        </button>
      ) : null}
    </section>
  );
}
