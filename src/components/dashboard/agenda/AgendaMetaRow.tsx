"use client";

import AgendaFocusPicker from "@/components/dashboard/agenda/AgendaFocusPicker";
import type { DashboardModel, PillarId } from "@/types/dashboard";

type AgendaMetaRowProps = {
  model: DashboardModel;
  busy: boolean;
  focusExpanded: boolean;
  onToggleFocus: () => void;
  onSelectPillar: (pillarId: PillarId) => void;
  onAcceptEngine: () => void;
  onReset: () => void;
};

export default function AgendaMetaRow({
  model,
  busy,
  focusExpanded,
  onToggleFocus,
  onSelectPillar,
  onAcceptEngine,
  onReset,
}: AgendaMetaRowProps) {
  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={onToggleFocus}
        aria-expanded={focusExpanded}
        className="inline-flex min-h-11 cursor-pointer items-center border-none bg-transparent px-0 text-[13px] font-semibold text-[var(--sage)] disabled:opacity-60"
        style={{ fontFamily: "var(--f-sans)" }}
      >
        {focusExpanded ? "Sluit focus" : "Wijzig focus"}
      </button>
      {focusExpanded ? (
        <AgendaFocusPicker
          model={model}
          busy={busy}
          onSelectPillar={onSelectPillar}
          onAcceptEngine={onAcceptEngine}
          onReset={onReset}
        />
      ) : null}
    </div>
  );
}
