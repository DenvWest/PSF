"use client";

import AgendaFocusPicker from "@/components/dashboard/agenda/AgendaFocusPicker";
import type { DashboardModel, PillarId } from "@/types/dashboard";

type AgendaFocusPillProps = {
  model: DashboardModel;
  busy: boolean;
  expanded: boolean;
  onToggle: () => void;
};

export function AgendaFocusPill({
  model,
  busy,
  expanded,
  onToggle,
}: AgendaFocusPillProps) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onToggle}
      aria-expanded={expanded}
      className="inline-flex min-h-11 max-w-[9.5rem] shrink-0 cursor-pointer items-center rounded-full border border-[#e4e0da] bg-white px-3 text-[13px] font-semibold text-[var(--sage)] transition-colors disabled:opacity-60"
      style={{ fontFamily: "var(--f-sans)" }}
    >
      <span className="truncate">
        {expanded ? "Sluit" : `Focus · ${model.priority.label.toLowerCase()}`}
      </span>
    </button>
  );
}

type AgendaFocusPanelProps = {
  model: DashboardModel;
  busy: boolean;
  onSelectPillar: (pillarId: PillarId) => void;
  onAcceptEngine: () => void;
  onReset: () => void;
};

export function AgendaFocusPanel({
  model,
  busy,
  onSelectPillar,
  onAcceptEngine,
  onReset,
}: AgendaFocusPanelProps) {
  return (
    <AgendaFocusPicker
      model={model}
      busy={busy}
      onSelectPillar={onSelectPillar}
      onAcceptEngine={onAcceptEngine}
      onReset={onReset}
    />
  );
}
