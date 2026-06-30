"use client";

import {
  REVEAL_COPY,
  REVEAL_DASHBOARD_ROWS,
  type RevealDashboardRow,
} from "@/lib/results-reveal-copy";
import type { RevealModel } from "@/lib/reveal-model";
import type { PillarId } from "@/types/dashboard";

const PRODUCT_PILLARS = new Set<PillarId>(["voeding", "slaap"]);

type RevealDashboardTeaseProps = {
  model: RevealModel;
};

export default function RevealDashboardTease({ model }: RevealDashboardTeaseProps) {
  const prioritySub = PRODUCT_PILLARS.has(model.primaryPillarId)
    ? REVEAL_COPY.dashboardRowPrioritySubProduct
    : REVEAL_COPY.dashboardRowPrioritySubLifestyle;

  const rows: RevealDashboardRow[] = [
    {
      key: "priority",
      dotColor: model.priority.color,
      title: model.primaryPillarLabel,
      subtitle: prioritySub,
      soon: false,
    },
    ...REVEAL_DASHBOARD_ROWS,
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13.5px] leading-relaxed text-[#57534e]">
        {REVEAL_COPY.dashboardTeaseLead}
      </p>
      <ul className="flex flex-col gap-2" aria-label="Wat in je dashboard klaarstaat">
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex min-h-[52px] w-full items-center gap-3 rounded-[18px] border border-[#ebe7e2] bg-white px-3.5 py-3 shadow-sm"
          >
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#faf9f7]"
              aria-hidden
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: row.dotColor }} />
            </span>
            <div className="min-w-0 flex-1">
              <div
                className="text-base leading-tight text-[#1c1917]"
                style={{ fontFamily: "var(--f-serif, Georgia, serif)" }}
              >
                {row.title}
              </div>
              <div className="mt-0.5 text-[13px] leading-snug text-[#57534e]">{row.subtitle}</div>
            </div>
            {row.soon ? (
              <span className="inline-flex shrink-0 items-center rounded-full border border-[rgba(200,149,108,0.4)] px-2.5 py-1 text-[11px] font-bold tracking-[0.04em] text-[#C8956C]">
                Binnenkort
              </span>
            ) : (
              <span className="shrink-0 text-[12px] font-semibold text-[#5A8F6A]">Vergelijk →</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
