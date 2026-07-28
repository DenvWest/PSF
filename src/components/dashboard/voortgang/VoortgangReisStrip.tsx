"use client";

import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import type { DashboardData, DashboardModel } from "@/types/dashboard";

type VoortgangReisStripProps = {
  model: DashboardModel;
  data?: DashboardData;
};

function formatShortDate(dateLabel: string | undefined): string {
  if (!dateLabel) {
    return "—";
  }
  const parts = dateLabel.split(" ");
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1]}`;
  }
  return dateLabel;
}

export default function VoortgangReisStrip({ model, data }: VoortgangReisStripProps) {
  const cycle = data?.cycleEvidence;
  const remeasure = data?.remeasure;

  if (!cycle || !remeasure) {
    return null;
  }

  const checkLabel = formatShortDate(model.date);
  const checkCount = model.history.length;
  const metaLine =
    checkCount > 0
      ? `${checkCount} check${checkCount === 1 ? "" : "s"} gedaan · dag ${cycle.cycleDay} bezig`
      : `Dag ${cycle.cycleDay} bezig`;

  return (
    <CockpitTile className="mb-3.5">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr auto 1fr",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <ReisNode
          title="Check"
          value={checkLabel}
          active
        />
        <ReisLine active />
        <ReisNode
          title="Nu"
          value={`dag ${cycle.cycleDay}`}
          active
        />
        <ReisLine active={remeasure.daysUntil <= 14} />
        <ReisNode
          title="Hermeting"
          value={remeasure.daysUntil > 0 ? `${remeasure.daysUntil} dgn` : "nu"}
          active={remeasure.daysUntil <= 14}
        />
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: "var(--text-muted)",
          lineHeight: 1.5,
          textAlign: "center",
          textWrap: "pretty",
        }}
      >
        {metaLine}
      </p>
    </CockpitTile>
  );
}

function ReisNode({
  title,
  value,
  active,
}: {
  title: string;
  value: string;
  active: boolean;
}) {
  return (
    <div style={{ textAlign: "center", minWidth: 0 }}>
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          margin: "0 auto 6px",
          background: active ? "var(--sage)" : "rgba(255,255,255,0.12)",
          border: active ? "none" : "1px solid var(--panel-border)",
        }}
      />
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text-subtle)",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "var(--text)",
          marginTop: 2,
          lineHeight: 1.3,
          textWrap: "pretty",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ReisLine({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden
      style={{
        height: 2,
        borderRadius: 999,
        background: active ? "var(--sage)" : "rgba(255,255,255,0.08)",
      }}
    />
  );
}
