import { CHECK_LOG, CHECKS, PILLARS, TIE_ORDER } from "@/data/dashboard";
import type { CheckId, CheckScores, DashboardModel, Pillar } from "@/types/dashboard";

export function derivePriority(scores: CheckScores): Pillar[] {
  return [...PILLARS].sort(
    (a, b) =>
      scores[a.id] - scores[b.id] ||
      TIE_ORDER.indexOf(a.id) - TIE_ORDER.indexOf(b.id),
  );
}

export function buildModel(checkId: CheckId): DashboardModel {
  const check = CHECKS[checkId];
  const { scores } = check;
  const ladder = derivePriority(scores);
  const priority = ladder[0];
  const strongest = [...PILLARS]
    .sort((a, b) => scores[b.id] - scores[a.id])
    .filter((pillar) => pillar.id !== priority.id)[0];
  const vitality = Math.round(
    PILLARS.reduce((sum, pillar) => sum + scores[pillar.id], 0) / PILLARS.length,
  );
  const prevLog = CHECK_LOG.find((entry) => entry.seq === check.seq - 1);
  const vitalityDelta = prevLog ? vitality - prevLog.vitality : null;
  const lifestyle = [
    { pillar: priority, win: priority.quickWin, role: "prioriteit" as const },
    { pillar: strongest, win: strongest.quickWin, role: "kracht" as const },
  ];
  const supplement = priority.supplement;
  const deltaOf = (id: Pillar["id"]): number => {
    const trend = check.trend[id];
    return trend[trend.length - 1] - trend[trend.length - 2];
  };

  return {
    check,
    checkId,
    scores,
    ladder,
    priority,
    strongest,
    vitality,
    vitalityDelta,
    lifestyle,
    supplement,
    deltaOf,
  };
}
