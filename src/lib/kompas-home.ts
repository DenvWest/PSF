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
  voeding: "eiwit & regelmaat",
  stress: "herstel & rust",
  verbinding: "contact & steun",
};

export const KOMPAS_LINES_EXPLAINER =
  "Elke ring staat voor één domein: slaap, beweging, voeding, stress en verbinding. Hoe verder de ring gevuld is, hoe sterker dat domein scoort. In het midden zie je je leefstijlscore — het totaalbeeld van die vijf domeinen. Rechts per rij: score, trend en richting. Tik op een rij voor meer detail.";

export type KompasMilestoneKind = "hermeting" | "week" | "cycle" | "neutral";

export type KompasMilestone = {
  kind: KompasMilestoneKind;
  line: string;
  ctaLabel?: string;
};

export type KompasCycleContext = {
  cycleDay: number;
  daysUntilRemeasure: number;
  activeDaysInCycle: number;
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

export function buildKompasMilestone(
  model: DashboardModel,
  completedWeekDays: number,
  remeasureDue: boolean,
  cycleContext?: KompasCycleContext | null,
): KompasMilestone {
  if (remeasureDue) {
    return {
      kind: "hermeting",
      line: "Tijd voor je hermeting — meet of je stappen werken.",
      ctaLabel: "Doe je hermeting",
    };
  }

  if (cycleContext && cycleContext.daysUntilRemeasure > 0) {
    const { cycleDay, daysUntilRemeasure, activeDaysInCycle } = cycleContext;
    if (daysUntilRemeasure <= 7) {
      return {
        kind: "cycle",
        line:
          daysUntilRemeasure === 1
            ? `Dag ${cycleDay} van 30 — morgen is je hermeting (${activeDaysInCycle} dagen actief).`
            : `Nog ${daysUntilRemeasure} dagen tot je hermeting — ${activeDaysInCycle} dagen actief.`,
      };
    }
    if (cycleDay <= 30) {
      return {
        kind: "cycle",
        line: `Dag ${cycleDay} van 30 — ${activeDaysInCycle} dagen actief.`,
      };
    }
  }

  const remaining = 7 - completedWeekDays;
  if (remaining > 0 && remaining <= 3) {
    if (remaining === 1) {
      return {
        kind: "week",
        line: "Nog één gewoonte en je week is compleet.",
      };
    }
    return {
      kind: "week",
      line: `Nog ${remaining} dagen en je week is compleet.`,
    };
  }

  const priorityRow = buildKompasDomainRows(model).find((row) => row.isPriority);
  if (priorityRow?.delta != null && priorityRow.delta > 0) {
    return {
      kind: "neutral",
      line: `Je ${priorityRow.label.toLowerCase()} verbeterde sinds vorige week.`,
    };
  }

  if (model.vitalityDelta != null && model.vitalityDelta > 0) {
    return {
      kind: "neutral",
      line: `Je bent ${model.vitalityDelta} punten dichter bij je doel.`,
    };
  }

  return {
    kind: "neutral",
    line: "Elke stap telt — ook de kleine.",
  };
}
