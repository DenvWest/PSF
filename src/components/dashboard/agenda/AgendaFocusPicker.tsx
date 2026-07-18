"use client";

import { PILLAR, PILLARS } from "@/data/dashboard";
import { isInterventionDomain } from "@/lib/domain-role";
import type { DashboardModel, PillarId } from "@/types/dashboard";

type AgendaFocusPickerProps = {
  model: DashboardModel;
  busy: boolean;
  onSelectPillar: (pillarId: PillarId) => void;
  onAcceptEngine: () => void;
  onReset: () => void;
};

export default function AgendaFocusPicker({
  model,
  busy,
  onSelectPillar,
  onAcceptEngine,
  onReset,
}: AgendaFocusPickerProps) {
  const interventionPillars = PILLARS.filter((pillar) => isInterventionDomain(pillar.id));

  return (
    <div className="mt-3 border-t border-[#ebe7e2] pt-3">
      <div className="flex flex-col gap-2">
        {interventionPillars.map((pillar) => {
          const isSelected = pillar.id === model.priority.id;
          const isEngineAdvice = pillar.id === model.enginePriority.id;
          return (
            <button
              key={pillar.id}
              type="button"
              disabled={busy}
              onClick={() => onSelectPillar(pillar.id)}
              className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors disabled:opacity-60"
              style={{
                borderColor: isSelected ? "var(--sage)" : "#ebe7e2",
                background: isSelected ? "rgba(90, 143, 106, 0.06)" : "transparent",
                fontFamily: "var(--f-sans)",
              }}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: pillar.color }}
                  aria-hidden
                />
                <span className="text-[14px] font-medium text-[#1c1917]">{pillar.label}</span>
              </span>
              {isEngineAdvice ? (
                <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--sage)]">
                  advies
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={onAcceptEngine}
        className="mt-2 inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-[10px] border-none bg-[var(--sage)] px-4 text-[13px] font-semibold text-[#0f1c10] disabled:opacity-60"
        style={{ fontFamily: "var(--f-sans)" }}
      >
        Volg advies → {PILLAR[model.enginePriority.id].label.toLowerCase()}
      </button>
      {model.priorityIsUserChosen ? (
        <button
          type="button"
          disabled={busy}
          onClick={onReset}
          className="mt-2 cursor-pointer border-none bg-transparent p-0 text-[12px] font-medium text-[var(--sage)] underline decoration-[#d6d3d1] underline-offset-2 disabled:opacity-60"
        >
          Terug naar advies
        </button>
      ) : null}
    </div>
  );
}
