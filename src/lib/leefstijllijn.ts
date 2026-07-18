import { PILLARS } from "@/data/dashboard";
import { isInterventionDomain, type InterventionPillarId } from "@/lib/domain-role";
import type { DashboardIconName, DashboardModel, PillarId } from "@/types/dashboard";

export type LeefstijllijnRow = {
  pillarId: InterventionPillarId;
  label: string;
  color: string;
  icon: DashboardIconName;
  currentScore: number;
  trend: number[];
  baselineScore: number | null;
  delta: number | null;
};

export function buildLeefstijllijnRows(model: DashboardModel): LeefstijllijnRow[] {
  return PILLARS.filter((pillar) => isInterventionDomain(pillar.id)).map((pillar) => {
    const pillarId = pillar.id as InterventionPillarId;
    const trend = model.trend[pillarId] ?? [];
    const currentScore = model.scores[pillarId] ?? 0;
    const baselineScore = trend.length > 0 ? trend[0] : null;
    const delta =
      baselineScore != null && trend.length >= 2 ? currentScore - baselineScore : null;

    return {
      pillarId,
      label: pillar.label,
      color: pillar.color,
      icon: pillar.icon,
      currentScore,
      trend,
      baselineScore,
      delta,
    };
  });
}

export function buildDomainTrendRow(
  model: DashboardModel,
  pillarId: PillarId,
): Pick<LeefstijllijnRow, "currentScore" | "trend" | "baselineScore" | "delta"> {
  const trend = model.trend[pillarId] ?? [];
  const currentScore = model.scores[pillarId] ?? 0;
  const baselineScore = trend.length > 0 ? trend[0] : null;
  const delta =
    baselineScore != null && trend.length >= 2 ? currentScore - baselineScore : null;

  return { currentScore, trend, baselineScore, delta };
}
