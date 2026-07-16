import { PILLARS, TIE_ORDER } from "@/data/dashboard";
import { isReadoutDomain } from "@/lib/domain-role";
import { buildActivePlanHabit } from "@/lib/dashboard-active-plan";
import { getPriorityPillar } from "@/lib/priority-pillar";
import { RULES_VERSION } from "@/lib/intake-engine";
import { hasMethodologyChange } from "@/lib/rules-version";
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
  const sortByScore = (pillars: Pillar[]) =>
    [...pillars].sort(
      (a, b) =>
        scores[a.id] - scores[b.id] ||
        TIE_ORDER.indexOf(a.id) - TIE_ORDER.indexOf(b.id),
    );
  const intervention = PILLARS.filter((pillar) => !isReadoutDomain(pillar.id));
  const readout = PILLARS.filter((pillar) => isReadoutDomain(pillar.id));
  return [...sortByScore(intervention), ...sortByScore(readout)];
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
    .filter((pillar) => !isReadoutDomain(pillar.id))
    .sort((a, b) => scores[b.id] - scores[a.id])
    .filter((pillar) => pillar.id !== priority.id)[0];
  const vitality = current.vitality;
  const baselineRulesVersion = prev?.rulesVersion ?? RULES_VERSION;
  const vitalityComparable = prev
    ? !hasMethodologyChange(baselineRulesVersion, RULES_VERSION)
    : true;
  const vitalityDelta =
    prev && vitalityComparable ? current.vitality - prev.vitality : null;
  const vitalityDeltaNote =
    prev && !vitalityComparable ? "Methodiek gewijzigd — niet vergelijkbaar" : null;
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
    vitalityDeltaNote,
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
