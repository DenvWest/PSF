import { PILLARS, TIE_ORDER } from "@/data/dashboard";
import { mapCheckScoresToDomainScores } from "@/lib/reveal-model";
import type {
  CheckLogEntry,
  CheckScores,
  CheckSnapshot,
  DashboardData,
  DashboardModel,
  Pillar,
} from "@/types/dashboard";

export function derivePriority(scores: CheckScores): Pillar[] {
  return [...PILLARS].sort(
    (a, b) =>
      scores[a.id] - scores[b.id] ||
      TIE_ORDER.indexOf(a.id) - TIE_ORDER.indexOf(b.id),
  );
}

export function buildModel(
  current: NonNullable<DashboardData["current"]>,
  prev: CheckSnapshot | null,
  history: CheckLogEntry[],
  retest: boolean,
  answers: Record<string, number> | null,
): DashboardModel {
  const { scores } = current;
  const ladder = derivePriority(scores);
  const priority = ladder[0];
  const strongest = [...PILLARS]
    .sort((a, b) => scores[b.id] - scores[a.id])
    .filter((pillar) => pillar.id !== priority.id)[0];
  const vitality = current.vitality;
  const vitalityDelta = prev ? current.vitality - prev.vitality : null;
  const lifestyle = [
    { pillar: priority, win: priority.quickWin, role: "prioriteit" as const },
    { pillar: strongest, win: strongest.quickWin, role: "kracht" as const },
  ];
  const supplement = priority.supplement;
  const deltaOf = (id: Pillar["id"]): number => {
    const trend = current.trend[id];
    if (trend.length < 2) {
      return 0;
    }
    return trend[trend.length - 1] - trend[trend.length - 2];
  };

  return {
    scores,
    domainScores: mapCheckScoresToDomainScores(scores),
    ladder,
    priority,
    strongest,
    vitality,
    vitalityDelta,
    lifestyle,
    supplement,
    trend: current.trend,
    prevScores: prev?.scores ?? null,
    history,
    retest,
    answers,
    date: current.date,
    deltaOf,
  };
}
