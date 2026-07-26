"use client";

import FocusPill from "@/components/dashboard/focus/FocusPill";
import AgendaFocusPicker from "@/components/dashboard/agenda/AgendaFocusPicker";
import type { DashboardModel, PillarId } from "@/types/dashboard";

type AgendaFocusPillProps = {
  model: DashboardModel;
  busy: boolean;
  expanded: boolean;
  onToggle: () => void;
};

export function AgendaFocusPill(props: AgendaFocusPillProps) {
  return <FocusPill {...props} variant="agenda" />;
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
