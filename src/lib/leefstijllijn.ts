import { PILLARS } from "@/data/dashboard";
import { isInterventionDomain, type InterventionPillarId } from "@/lib/domain-role";
import type {
  DashboardIconName,
  DashboardModel,
  PillarId,
  TrendBaseline,
  TrendSource,
} from "@/types/dashboard";

export type LeefstijllijnRow = {
  pillarId: InterventionPillarId;
  label: string;
  color: string;
  icon: DashboardIconName;
  currentScore: number;
  trend: number[];
  baselineScore: number | null;
  delta: number | null;
  baselineSourceLabel: string | null;
  baselineCrossesRulesVersion: boolean;
};

function baselineSourceLabel(source: TrendSource): string {
  switch (source) {
    case "intake":
      return "op basis van je intake";
    case "checkin":
      return "op basis van je check-ins";
    case "nutrition_log":
      return "op basis van wat je noteerde";
  }
}

function buildTrendMetrics(
  model: DashboardModel,
  pillarId: PillarId,
): Pick<
  LeefstijllijnRow,
  | "currentScore"
  | "trend"
  | "baselineScore"
  | "delta"
  | "baselineSourceLabel"
  | "baselineCrossesRulesVersion"
> {
  const trend = model.trend[pillarId] ?? [];
  const currentScore = model.scores[pillarId] ?? 0;
  const baseline: TrendBaseline | undefined = model.trendBaselines?.[pillarId];
  const baselineScore = baseline?.value ?? (trend.length > 0 ? trend[0] : null);
  const baselineCrossesRulesVersion = baseline?.crossesRulesVersion ?? false;
  const delta =
    baselineScore != null && trend.length >= 2 && !baselineCrossesRulesVersion
      ? currentScore - baselineScore
      : null;

  return {
    currentScore,
    trend,
    baselineScore,
    delta,
    baselineSourceLabel: baseline ? baselineSourceLabel(baseline.source) : null,
    baselineCrossesRulesVersion,
  };
}

export function buildLeefstijllijnRows(model: DashboardModel): LeefstijllijnRow[] {
  return PILLARS.filter((pillar) => isInterventionDomain(pillar.id)).map((pillar) => {
    const pillarId = pillar.id as InterventionPillarId;

    return {
      pillarId,
      label: pillar.label,
      color: pillar.color,
      icon: pillar.icon,
      ...buildTrendMetrics(model, pillarId),
    };
  });
}

export function buildDomainTrendRow(
  model: DashboardModel,
  pillarId: PillarId,
): Pick<
  LeefstijllijnRow,
  | "currentScore"
  | "trend"
  | "baselineScore"
  | "delta"
  | "baselineSourceLabel"
  | "baselineCrossesRulesVersion"
> {
  return buildTrendMetrics(model, pillarId);
}
