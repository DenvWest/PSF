"use client";

import { useMemo } from "react";
import { DeltaBadge } from "@/components/app/primitives";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { isUsableFirstName } from "@/lib/intake-greetings";
import { buildKompasDomainRows } from "@/lib/kompas-home";
import { getVitalityExplainer } from "@/lib/vitality-explainer";
import { getVitalityBand } from "@/lib/vitality-gauge";
import type { DashboardModel, PillarId } from "@/types/dashboard";

type KompasStatusCardProps = {
  model: DashboardModel;
  firstName?: string | null;
};

function getStatusHeading(vitality: number, firstName?: string | null): string {
  const band = getVitalityBand(vitality);
  let phrase: string;
  switch (band.id) {
    case "optimaal":
    case "sterk":
      phrase = "Je bent sterk onderweg.";
      break;
    case "goed":
      phrase = "Je bent goed onderweg.";
      break;
    default:
      phrase = "Je bent op gang.";
  }

  if (isUsableFirstName(firstName)) {
    const lower = phrase.charAt(0).toLowerCase() + phrase.slice(1);
    return `${firstName!.trim()}, ${lower}`;
  }
  return phrase;
}

function formatTrendLabel(delta: number | null, note: string | null): string | null {
  if (note?.trim()) {
    return note.trim();
  }
  if (delta == null || delta === 0) {
    return "Stabiel sinds je laatste meting";
  }
  const arrow = delta > 0 ? "↑" : "↓";
  const signed = delta > 0 ? `+${delta}` : `${delta}`;
  return `${arrow} ${signed} sinds je laatste meting`;
}

function MiniDomainStat({
  label,
  score,
  delta,
  color,
  tag,
}: {
  label: string;
  score: number;
  delta: number | null;
  color: string;
  tag?: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-black/15 px-2.5 py-2">
      <span
        aria-hidden
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: color }}
      />
      <span className="min-w-0 flex-1 truncate text-[12px] text-[#CDD7D0]">
        {tag ? (
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7E8C82]">
            {tag}
          </span>
        ) : null}
        {label}
      </span>
      <span className="shrink-0 text-[12px] tabular-nums text-[#F1EFE8]">{score}</span>
      <span className="w-[32px] shrink-0 text-right">
        <DeltaBadge delta={delta} empty={delta == null} />
      </span>
    </div>
  );
}

export default function KompasStatusCard({ model, firstName }: KompasStatusCardProps) {
  const explainer = getVitalityExplainer({
    vitality: model.vitality,
    vitalityDelta: model.vitalityDelta,
    priorityId: model.priority.id,
    priorityScore: model.scores[model.priority.id] ?? 0,
    answers: model.answers,
    domainScores: model.domainScores,
  });
  const trendLabel = formatTrendLabel(model.vitalityDelta, model.vitalityDeltaNote);
  const factLine = explainer[1];

  const highlightRows = useMemo(() => {
    const rows = buildKompasDomainRows(model);
    const priority = rows.find((row) => row.isPriority);
    const others = rows.filter((row) => !row.isPriority);
    const weakest = [...others].sort((a, b) => a.score - b.score)[0];
    const strongest = [...others].sort((a, b) => b.score - a.score)[0];

    const tagged: Array<{ row: (typeof rows)[number]; tag: string }> = [];
    if (priority) {
      tagged.push({ row: priority, tag: "Focus" });
    }
    if (weakest && weakest.id !== strongest?.id) {
      tagged.push({ row: weakest, tag: "Aandacht" });
    }
    if (strongest) {
      tagged.push({ row: strongest, tag: "Sterk" });
    }

    const seen = new Set<PillarId>();
    return tagged.filter(({ row }) => {
      if (seen.has(row.id)) {
        return false;
      }
      seen.add(row.id);
      return true;
    });
  }, [model]);

  return (
    <CockpitTile className="p-4 sm:p-5">
      <h1
        className="m-0 font-serif text-[22px] leading-tight text-[#F1EFE8] sm:text-[24px] text-pretty"
        style={{ fontFamily: "var(--f-serif)" }}
      >
        {getStatusHeading(model.vitality, firstName)}
      </h1>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span
          className="font-serif text-[36px] leading-none tabular-nums text-[#F1EFE8] sm:text-[40px]"
          style={{ fontFamily: "var(--f-serif)" }}
        >
          {Math.round(model.vitality)}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#7E8C82]">
          leefstijlscore
        </span>
      </div>

      {trendLabel ? (
        <p className="mt-1.5 text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
          {trendLabel}
        </p>
      ) : null}

      {factLine ? (
        <p className="mt-3 text-[13px] leading-relaxed text-[#CDD7D0] text-pretty">
          {factLine}
        </p>
      ) : null}

      {highlightRows.length > 0 ? (
        <div className="mt-3 flex flex-col gap-1.5">
          {highlightRows.map(({ row, tag }) => (
            <MiniDomainStat
              key={row.id}
              label={row.label}
              score={row.score}
              delta={row.delta}
              color={row.color}
              tag={tag}
            />
          ))}
        </div>
      ) : null}
    </CockpitTile>
  );
}
