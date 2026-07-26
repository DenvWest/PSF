"use client";

import type { CSSProperties } from "react";
import { PILLAR, PILLARS } from "@/data/dashboard";
import { isInterventionDomain } from "@/lib/domain-role";
import type { DashboardModel, PillarId } from "@/types/dashboard";
import type { FocusSurfaceVariant } from "@/components/dashboard/focus/FocusPill";

type FocusPickerCoreProps = {
  model: DashboardModel;
  busy: boolean;
  onSelectPillar: (pillarId: PillarId) => void;
  onAcceptEngine: () => void;
  onReset: () => void;
  variant?: FocusSurfaceVariant;
  className?: string;
};

function pillarButtonClass(variant: FocusSurfaceVariant): string {
  const base =
    "flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors disabled:opacity-60";
  if (variant === "agenda") {
    return base;
  }
  return `${base} hover:border-white/14 hover:bg-white/[0.03]`;
}

function pillarButtonStyle(
  variant: FocusSurfaceVariant,
  isSelected: boolean,
): CSSProperties {
  if (variant === "agenda") {
    return {
      borderColor: isSelected ? "var(--sage)" : "#ebe7e2",
      background: isSelected ? "rgba(90, 143, 106, 0.06)" : "transparent",
      fontFamily: "var(--f-sans)",
    };
  }
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
  variant = "agenda",
  className = "",
}: FocusPickerCoreProps) {
  const interventionPillars = PILLARS.filter((pillar) => isInterventionDomain(pillar.id));
  // "Volg advies" en "Terug naar advies" landen allebei op het engine-domein.
  // Toon er dus hooguit één, en nooit de knop die niets verandert.
  const followsAdvice = model.priority.id === model.enginePriority.id;
  const dividerClass =
    variant === "agenda" ? "border-[#ebe7e2]" : "border-white/10";
  const labelClass =
    variant === "agenda" ? "text-[#1c1917]" : "text-[#CDD7D0]";
  const adviceClass =
    variant === "agenda" ? "text-[var(--sage)]" : "text-[#5A8F6A]";
  const resetClass =
    variant === "agenda"
      ? "text-[var(--sage)] decoration-[#d6d3d1]"
      : "text-[#5A8F6A] decoration-white/20";

  return (
    <div className={`mt-3 border-t pt-3 ${dividerClass} ${className}`.trim()}>
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
              className={pillarButtonClass(variant)}
              style={pillarButtonStyle(variant, isSelected)}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: pillar.color }}
                  aria-hidden
                />
                <span className={`text-[14px] font-medium ${labelClass}`}>{pillar.label}</span>
              </span>
              {isEngineAdvice ? (
                <span
                  className={`text-[10px] font-semibold uppercase tracking-[0.06em] ${adviceClass}`}
                >
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
          className={`mt-2 cursor-pointer border-none bg-transparent p-0 text-[12px] font-medium underline underline-offset-2 disabled:opacity-60 ${resetClass}`}
        >
          Terug naar advies
        </button>
      ) : null}
    </div>
  );
}
