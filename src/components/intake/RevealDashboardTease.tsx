"use client";

import * as Icons from "@/components/app/icons";
import {
  REVEAL_COPY,
  REVEAL_DASHBOARD_ROWS,
  type RevealDashboardRow,
} from "@/lib/results-reveal-copy";
import { scrollToRevealStep } from "@/lib/reveal-scroll";
import type { RevealModel } from "@/lib/reveal-model";
import type { PillarId } from "@/types/dashboard";

const PRODUCT_PILLARS = new Set<PillarId>(["voeding", "slaap"]);

type RevealDashboardTeaseProps = {
  model: RevealModel;
};

function SoonPill() {
  return (
    <span className="reveal-dashboard-tease__soon-pill">
      Binnenkort
    </span>
  );
}

function RowLeading({ row }: { row: RevealDashboardRow }) {
  if (row.soon) {
    return (
      <span className="reveal-dashboard-tease__leading reveal-dashboard-tease__leading--muted" aria-hidden>
        <Icons.Lock s={18} />
      </span>
    );
  }

  return (
    <span
      className="reveal-dashboard-tease__leading"
      style={{ background: `${row.dotColor}14` }}
      aria-hidden
    >
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: row.dotColor }} />
    </span>
  );
}

function RowBody({ row }: { row: RevealDashboardRow }) {
  return (
    <>
      <RowLeading row={row} />
      <div className="reveal-dashboard-tease__copy">
        <div
          className="reveal-dashboard-tease__title"
          style={{ fontFamily: "var(--f-serif, Georgia, serif)" }}
        >
          {row.title}
        </div>
        <div className="reveal-dashboard-tease__subtitle">{row.subtitle}</div>
      </div>
      {row.soon ? (
        <SoonPill />
      ) : (
        <span className="reveal-dashboard-tease__cta">Vergelijk →</span>
      )}
    </>
  );
}

function DashboardRow({ row, isFirst }: { row: RevealDashboardRow; isFirst: boolean }) {
  const rowClass = `reveal-dashboard-tease__row${row.soon ? " reveal-dashboard-tease__row--soon" : ""}${isFirst ? "" : " reveal-dashboard-tease__row--divider"}`;

  if (row.soon) {
    return (
      <div className={rowClass}>
        <RowBody row={row} />
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label={`Naar bewaar-stap — ${row.title}`}
      onClick={() => scrollToRevealStep("save")}
      className={`${rowClass} reveal-dashboard-tease__row--interactive`}
    >
      <RowBody row={row} />
    </button>
  );
}

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
    <div className="reveal-dashboard-tease">
      <p className="reveal-dashboard-tease__lead">{REVEAL_COPY.dashboardTeaseLead}</p>
      <div className="reveal-dashboard-tease__card" aria-label="Wat in je dashboard klaarstaat">
        {rows.map((row, index) => (
          <DashboardRow key={row.key} row={row} isFirst={index === 0} />
        ))}
      </div>
    </div>
  );
}
