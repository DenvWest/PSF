"use client";

import type { CSSProperties } from "react";
import { PILLAR, PILLARS } from "@/data/dashboard";
import { isInterventionDomain } from "@/lib/domain-role";
import type { DashboardModel, PillarId } from "@/types/dashboard";

type FocusPickerCoreProps = {
  model: DashboardModel;
  busy: boolean;
  onSelectPillar: (pillarId: PillarId) => void;
  onAcceptEngine: () => void;
  onReset: () => void;
  className?: string;
};

// Kompas én Mijn Dag draaien in dezelfde dark cockpit-wereld; de picker kent
// daarom geen light-variant meer.
const PILLAR_BUTTON_CLASS =
  "flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors hover:border-white/14 hover:bg-white/[0.03] disabled:opacity-60";

function pillarButtonStyle(isSelected: boolean): CSSProperties {
  return {
    borderColor: isSelected ? "#5A8F6A" : "rgba(255,255,255,0.08)",
    background: isSelected ? "rgba(90, 143, 106, 0.12)" : "rgba(0,0,0,0.15)",
    fontFamily: "var(--f-sans)",
  };
}

export default function FocusPickerCore({
  model,
  busy,
  onSelectPillar,
  onAcceptEngine,
  onReset,
  className = "",
}: FocusPickerCoreProps) {
  const interventionPillars = PILLARS.filter((pillar) => isInterventionDomain(pillar.id));
  // "Volg advies" en "Terug naar advies" landen allebei op het engine-domein.
  // Toon er dus hooguit één, en nooit de knop die niets verandert.
  const followsAdvice = model.priority.id === model.enginePriority.id;

  return (
    <div className={`mt-3 border-t border-white/10 pt-3 ${className}`.trim()}>
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
              className={PILLAR_BUTTON_CLASS}
              style={pillarButtonStyle(isSelected)}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: pillar.color }}
                  aria-hidden
                />
                <span className="text-[14px] font-medium text-[#CDD7D0]">{pillar.label}</span>
              </span>
              {isEngineAdvice ? (
                <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#5A8F6A]">
                  advies
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {followsAdvice ? null : (
        <button
          type="button"
          disabled={busy}
          onClick={onAcceptEngine}
          className="mt-2 inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-[10px] border-none bg-[#5A8F6A] px-4 text-[13px] font-semibold text-[#0f1c10] disabled:opacity-60"
          style={{ fontFamily: "var(--f-sans)" }}
        >
          Volg advies → {PILLAR[model.enginePriority.id].label.toLowerCase()}
        </button>
      )}
      {followsAdvice && model.priorityIsUserChosen ? (
        <button
          type="button"
          disabled={busy}
          onClick={onReset}
          className="mt-2 cursor-pointer border-none bg-transparent p-0 text-[12px] font-medium text-[#5A8F6A] underline decoration-white/20 underline-offset-2 disabled:opacity-60"
        >
          Terug naar advies
        </button>
      ) : null}
    </div>
  );
}
