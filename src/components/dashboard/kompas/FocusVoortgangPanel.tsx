"use client";

import * as Icons from "@/components/app/icons";
import FocusPickerCore from "@/components/dashboard/focus/FocusPickerCore";
import FocusPill from "@/components/dashboard/focus/FocusPill";
import { clarityTag } from "@/lib/clarity";
import { supportsKompasDeepView } from "@/lib/dashboard-url";
import { buildKompasDomainRows } from "@/lib/kompas-home";
import { getVitalityExplainer } from "@/lib/vitality-explainer";
import { getNextVitalityBand, getVitalityBand } from "@/lib/vitality-gauge";
import type { DashboardModel, PillarId } from "@/types/dashboard";

export type FocusVoortgangFocusControl = {
  busy: boolean;
  expanded: boolean;
  onToggle: () => void;
  onSelectPillar: (id: PillarId) => void;
  onAcceptEngine: () => void;
  onReset: () => void;
};

type FocusVoortgangPanelProps = {
  model: DashboardModel;
  onOpenPriority: (domain: PillarId) => void;
  claritySurface?: "kompas_home" | "voortgang_tab";
  focusControl?: FocusVoortgangFocusControl;
};

export default function FocusVoortgangPanel({
  model,
  onOpenPriority,
  claritySurface = "kompas_home",
  focusControl,
}: FocusVoortgangPanelProps) {
  const priorityRow = buildKompasDomainRows(model).find((row) => row.isPriority);

  if (!priorityRow) {
    return null;
  }

  const score = Math.round(priorityRow.score);
  const delta = priorityRow.delta;
  const band = getVitalityBand(score);
  const nextBand = getNextVitalityBand(score);
  const target = nextBand ? nextBand.min : 100;
  const baseline = delta != null ? Math.min(100, Math.max(0, score - delta)) : null;
  const hasStappenplan = supportsKompasDeepView(priorityRow.id);
  const linkLabel = hasStappenplan ? "Stappenplan" : `Open ${priorityRow.label.toLowerCase()}`;

  const explainer = getVitalityExplainer({
    vitality: model.vitality,
    vitalityDelta: model.vitalityDelta,
    priorityId: model.priority.id,
    priorityScore: model.scores[model.priority.id] ?? 0,
    answers: model.answers,
    domainScores: model.domainScores,
  });
  const painLine = explainer[1] ?? null;

  const handleOpen = () => {
    clarityTag(
      claritySurface === "voortgang_tab" ? "dashboard_voortgang" : "dashboard_kompas_home",
      `focus_${priorityRow.id}`,
    );
    onOpenPriority(priorityRow.id);
  };

  return (
    <div
      className="w-full rounded-xl border border-white/8 bg-black/15 px-3.5 py-3.5 text-left"
      style={{ fontFamily: "var(--f-sans)" }}
    >
      {focusControl ? (
        <>
          <FocusPill
            model={model}
            busy={focusControl.busy}
            expanded={focusControl.expanded}
            onToggle={focusControl.onToggle}
            variant="kompas"
            placement="panel"
          />
          {focusControl.expanded ? (
            <FocusPickerCore
              model={model}
              busy={focusControl.busy}
              onSelectPillar={focusControl.onSelectPillar}
              onAcceptEngine={focusControl.onAcceptEngine}
              onReset={focusControl.onReset}
              variant="kompas"
              className="mt-3 border-t border-white/8 pt-3"
            />
          ) : null}
        </>
      ) : null}

      <div
        className={`flex items-end justify-between gap-3${focusControl ? " mt-3.5" : ""}`}
      >
        <div>
          <p className="m-0 flex items-baseline gap-2">
            <span
              className="font-serif text-[34px] leading-none tabular-nums text-[#F1EFE8]"
              style={{ fontFamily: "var(--f-serif)" }}
            >
              {score}
            </span>
            <span
              className="rounded-full border px-2 py-0.5 text-[11px] font-semibold"
              style={{
                color: band.color,
                borderColor: `${band.color}55`,
                background: `${band.color}1a`,
              }}
            >
              {band.label}
            </span>
          </p>
        </div>
        {delta != null && delta !== 0 ? (
          <span
            className="mb-0.5 inline-flex items-center gap-1 text-[13px] font-semibold tabular-nums"
            style={{ color: delta > 0 ? "#5FA872" : "#C8956C" }}
          >
            {delta > 0 ? <Icons.TrendUp s={14} /> : <Icons.ArrowDown s={14} />}
            {delta > 0 ? `+${delta}` : delta}
          </span>
        ) : null}
      </div>

      <div className="mt-3.5">
        <div className="relative h-2 rounded-full bg-white/[0.08]">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${score}%`,
              background: `linear-gradient(90deg, ${band.color}, #5FA872)`,
            }}
          />
          {baseline != null ? (
            <span
              aria-hidden
              className="absolute top-1/2 h-3 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40"
              style={{ left: `${baseline}%` }}
              title="Waar je begon"
            />
          ) : null}
          <span
            aria-hidden
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#5FA872] bg-[#0f1c10]"
            style={{ left: `${target}%` }}
            title="Doel"
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-[#9FB0A6]">
          <span>{baseline != null ? `Start ${baseline}` : "Je startpunt"}</span>
          <span className="font-medium text-[#CDD7D0]">
            {nextBand ? `Doel ${target} · ${nextBand.label}` : "Behoud je niveau"}
          </span>
        </div>
      </div>

      {painLine ? (
        <div className="mt-3.5 flex items-start gap-2 border-t border-white/8 pt-3">
          <span
            aria-hidden
            className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: priorityRow.color }}
          />
          <p className="m-0 text-[12px] leading-relaxed text-[#9FB0A6] text-pretty">
            {painLine}
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleOpen}
        className="mt-3.5 flex w-full cursor-pointer items-center gap-1.5 border-t border-white/8 bg-transparent pt-3 text-left text-[13px] font-semibold transition hover:opacity-90"
        style={{ color: priorityRow.color, fontFamily: "var(--f-sans)" }}
      >
        {linkLabel}
        <Icons.ArrowRight s={14} />
      </button>
    </div>
  );
}
