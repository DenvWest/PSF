"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/ga4";
import type { SleepFactRow, SleepFactStatus } from "@/lib/sleep-checkin-readout";

const VISIBLE_ROWS = 4;

const STATUS_STYLE: Record<SleepFactStatus, string> = {
  below: "border-[#C99A3C]/50 text-[#C99A3C]",
  near: "border-[#C8956C]/45 text-[#C8956C]",
  meets: "border-[#5A8F6A]/50 text-[#9CC5A9]",
  na: "border-white/10 text-[#7E8C82]",
};

const STATUS_LABEL: Record<SleepFactStatus, string> = {
  below: "Aandacht",
  near: "Redelijk",
  meets: "Op orde",
  na: "—",
};

export type SleepFactReadoutProps = {
  rows: SleepFactRow[];
  surface: "intake_slaap" | "voortgang_slaap";
};

export default function SleepFactReadout({ rows, surface }: SleepFactReadoutProps) {
  const [expanded, setExpanded] = useState(false);

  if (rows.length === 0) {
    return null;
  }

  const visible = expanded ? rows : rows.slice(0, VISIBLE_ROWS);
  const hasMore = rows.length > VISIBLE_ROWS;

  return (
    <section aria-labelledby="sleep-fact-heading" className="mt-5">
      <h2
        id="sleep-fact-heading"
        className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#CDD7D0]"
      >
        Hoe je nu slaapt
      </h2>
      <p className="mt-1 text-[11.5px] leading-relaxed text-[#7E8C82]">
        Eerst je antwoord, daarna wat dat betekent — geen score als kop.
      </p>

      <ul className="mt-3 list-none space-y-0 p-0">
        {visible.map((row) => (
          <li key={row.key} className="border-t border-white/[0.06] py-3 last:border-b">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[12.5px] font-bold text-[#F1EFE8]">{row.label}</p>
              <span
                className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${STATUS_STYLE[row.status]}`}
              >
                {STATUS_LABEL[row.status]}
              </span>
            </div>
            <p className="mt-1 text-[13.5px] font-medium leading-snug text-[#F1EFE8]">
              {row.answerLabel}
            </p>
            {row.benchmarkLabel ? (
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#9FB0A6]">
                {row.benchmarkLabel}
              </p>
            ) : null}
            <p className="mt-1 text-[12px] leading-relaxed text-[#CDD7D0]">{row.whyLine}</p>
          </li>
        ))}
      </ul>

      {hasMore ? (
        <button
          type="button"
          onClick={() => {
            if (!expanded) {
              trackEvent("sleep_checkin_fact_readout_expanded", { surface });
            }
            setExpanded((open) => !open);
          }}
          aria-expanded={expanded}
          className="mt-2 min-h-[44px] w-full cursor-pointer border-none bg-transparent p-0 text-left text-[12.5px] font-semibold text-[#9CC5A9] transition-colors hover:text-[#F1EFE8]"
        >
          {expanded ? "Toon minder" : "Toon alle metingen"}
        </button>
      ) : null}
    </section>
  );
}
