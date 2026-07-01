import { PILLARS, TIE_ORDER } from "@/data/dashboard";
import { buildActivePlanHabit } from "@/lib/dashboard-active-plan";
import { getPriorityPillar } from "@/lib/priority-pillar";
import { mapCheckScoresToDomainScores } from "@/lib/reveal-model";
import type {
  CheckLogEntry,
  CheckScores,
  CheckSnapshot,
  DashboardModel,
  Pillar,
} from "@/types/dashboard";
import type { MeasuredPillarId } from "@/lib/primary-theme";
import type { PlanProgress } from "@/types/lifestyle-plan";

export function derivePriority(scores: CheckScores): Pillar[] {
  return [...PILLARS].sort(
    (a, b) =>
      scores[a.id] - scores[b.id] ||
      TIE_ORDER.indexOf(a.id) - TIE_ORDER.indexOf(b.id),
  );
}

export function buildModel(
  current: {
    scores: CheckScores;
    vitality: number;
    date: string;
    trend: DashboardModel["trend"];
  },
  prev: CheckSnapshot | null,
  history: CheckLogEntry[],
  retest: boolean,
  answers: Record<string, number> | null,
  planProgress: PlanProgress | null,
  planDomain: MeasuredPillarId | null,
): DashboardModel {
  const { scores } = current;
  const ladder = derivePriority(scores);
  const priority = getPriorityPillar(mapCheckScoresToDomainScores(scores), answers ?? {});
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

  const activeHabit = buildActivePlanHabit({
    priorityId: priority.id,
    priorityScore: scores[priority.id],
    vitality,
    domainScores: mapCheckScoresToDomainScores(scores),
    answers,
    progress: planProgress,
  });

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
    activeHabit,
    planDomain,
    planProgress,
  };
}
