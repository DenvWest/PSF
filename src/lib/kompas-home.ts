import { PILLAR } from "@/data/dashboard";
import { buildWeekSchedulePreview } from "@/lib/agenda-week-preview";
import { KOMPAS_RAIL_PILLAR_IDS } from "@/lib/context-rail";
import { resolvePlanStepContent } from "@/lib/day-model";
import { buildDomainTrendRow } from "@/lib/leefstijllijn";
import type { DashboardModel, PillarId } from "@/types/dashboard";

type KompasRailPillarId = "slaap" | "beweging" | "voeding" | "stress" | "verbinding";

export type KompasDomainRow = {
  id: PillarId;
  label: string;
  descriptor: string;
  color: string;
  score: number;
  delta: number | null;
  trend: number[];
  nextStep: string;
  stepId: string;
  isPriority: boolean;
};

export const KOMPAS_PILLAR_DESCRIPTORS: Record<KompasRailPillarId, string> = {
  slaap: "diepte & regelmaat",
  beweging: "kracht & conditie",
  voeding: "diversiteit & regelmaat",
  stress: "herstel & rust",
  verbinding: "contact & steun",
};

export const KOMPAS_LINES_EXPLAINER =
  "Elke ring staat voor één domein: slaap, beweging, voeding, stress en verbinding. Hoe verder de ring gevuld is, hoe sterker dat domein scoort. In het midden zie je je leefstijlscore — het totaalbeeld van die vijf domeinen. Rechts per rij: score, trend en richting. Tik op een rij voor meer detail.";

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
      descriptor: KOMPAS_PILLAR_DESCRIPTORS[id as KompasRailPillarId],
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

export type KompasCycleContext = {
  cycleDay: number;
  daysUntilRemeasure: number;
  activeDaysInCycle: number;
};

/**
 * Waar je in de 30-daagse cyclus staat, in één feitelijke regel — dag, actieve
 * dagen, en het aftellen naar de hermeting. Geen aanmoediging, geen oordeel:
 * de contextkolom leest hem als ritme-regel, en `voortgang-horizon-copy.ts`
 * legt dezelfde lat aan.
 *
 * `null` zodra de hermeting klaarstaat (`daysUntilRemeasure <= 0`) of de cyclus
 * verlopen is: dan zegt de kolom zelf dat de hermeting wacht, en zou een
 * dag-teller daar tegenin praten.
 */
export function buildCycleLine(cycleContext: KompasCycleContext | null): string | null {
  if (!cycleContext || cycleContext.daysUntilRemeasure <= 0) {
    return null;
  }

  const { cycleDay, daysUntilRemeasure, activeDaysInCycle } = cycleContext;

  if (daysUntilRemeasure <= 7) {
    return daysUntilRemeasure === 1
      ? `Dag ${cycleDay} van 30 — morgen is je hermeting (${activeDaysInCycle} dagen actief).`
      : `Nog ${daysUntilRemeasure} dagen tot je hermeting — ${activeDaysInCycle} dagen actief.`;
  }

  if (cycleDay <= 30) {
    return `Dag ${cycleDay} van 30 — ${activeDaysInCycle} dagen actief.`;
  }

  return null;
}
