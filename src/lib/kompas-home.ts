import { PILLAR } from "@/data/dashboard";
import { buildWeekSchedulePreview } from "@/lib/agenda-week-preview";
import { KOMPAS_RAIL_PILLAR_IDS } from "@/lib/context-rail";
import { resolvePlanStepContent } from "@/lib/day-model";
import { buildDomainTrendRow } from "@/lib/leefstijllijn";
import type { DashboardModel, PillarId } from "@/types/dashboard";

export type KompasDomainRow = {
  id: PillarId;
  label: string;
  color: string;
  score: number;
  delta: number | null;
  trend: number[];
  nextStep: string;
  stepId: string;
  isPriority: boolean;
};

function domainRotateIndices(model: DashboardModel): Map<PillarId, number> {
  const slots = buildWeekSchedulePreview(model);
  const indices = new Map<PillarId, number>();
  slots.forEach((slot, dayIndex) => {
    if (!indices.has(slot.domain)) {
      indices.set(slot.domain, dayIndex);
    }
  });
  return indices;
}

export function buildKompasDomainRows(model: DashboardModel): KompasDomainRow[] {
  const rotateByDomain = domainRotateIndices(model);

  return KOMPAS_RAIL_PILLAR_IDS.map((id, index) => {
    const pillar = PILLAR[id];
    const metrics = buildDomainTrendRow(model, id);
    const rotateIndex = rotateByDomain.get(id) ?? index;
    const step = resolvePlanStepContent(id, model, rotateIndex);

    return {
      id,
      label: pillar.label,
      color: pillar.color,
      score: metrics.currentScore,
      delta: metrics.delta,
      trend: metrics.trend,
      nextStep: step.title,
      stepId: step.stepId,
      isPriority: id === model.priority.id,
    };
  });
}

export function prioritySegmentIndex(rows: KompasDomainRow[]): number {
  const index = rows.findIndex((row) => row.isPriority);
  return index >= 0 ? index : 0;
}
