import { loadAccountDashboardData } from "@/lib/account-dashboard";
import { getAccountFromCookie } from "@/lib/account-server";
import { buildActivePlanHabit } from "@/lib/dashboard-active-plan";
import {
  getDeficiencySignals,
  type DeficiencySignals,
} from "@/lib/intake-engine";
import { mapCheckScoresToDomainScores } from "@/lib/reveal-model";
import {
  derivePersonalization,
  type VisitorPersonalization,
} from "@/lib/visitor-personalization";

export type InzichtenVisitorContext = VisitorPersonalization & {
  gapSignals: DeficiencySignals | null;
  activePlan: {
    phaseId: string | null;
    stepTitle: string;
    planHref: string;
  } | null;
};

export async function getInzichtenVisitorContext(): Promise<InzichtenVisitorContext | null> {
  const account = await getAccountFromCookie();
  if (!account) {
    return null;
  }

  const dashboard = await loadAccountDashboardData(account.id);
  if (dashboard.empty || !dashboard.current) {
    return null;
  }

  const personalization = derivePersonalization(
    dashboard.current.scores,
    dashboard.profileLabel,
  );

  const gapSignals = dashboard.answers
    ? getDeficiencySignals(dashboard.answers)
    : null;

  const habit = buildActivePlanHabit({
    priorityId: personalization.priorityPillarId,
    priorityScore: dashboard.current.scores[personalization.priorityPillarId],
    vitality: dashboard.current.vitality,
    domainScores: mapCheckScoresToDomainScores(dashboard.current.scores),
    answers: dashboard.answers,
    progress: dashboard.planProgress,
  });

  const activePlan =
    habit && habit.planHref
      ? {
          phaseId: habit.phaseId,
          stepTitle: habit.title,
          planHref: habit.planHref,
        }
      : null;

  return {
    ...personalization,
    gapSignals,
    activePlan,
  };
}
