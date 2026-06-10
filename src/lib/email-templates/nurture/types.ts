import type { InterventionBuckets } from "@/lib/content/match-interventions";
import type { NurturePlanGate } from "@/lib/content/nurture-interventions";

export interface NurtureEmailData {
  profileLabel: string;
  primaryDomain: string;
  domainScores: Record<string, number>;
  sequenceDay: number;
  urgencyLevel?: string;
  /** Optioneel; voor persoonlijke aanhef in mail (voornaam). */
  firstName?: string | null;
  /** Sleep-journey: zelfde interventies als PLAN-scherm (dag 3/14/21). */
  interventionBuckets?: InterventionBuckets | null;
  /** Aantal afgeronde leefstijlplan-fasen (plan_progress); stuurt dag 14/21 tier-degradatie. */
  completedPlanPhases?: number;
  /** Org-tier-poort; zelfde bron als getPlanContent / getVisibleTiers. */
  visibleTiers?: number[];
  /** Volledige plan-gate uit nurture-cron (dag 3/14/21). */
  planGate?: NurturePlanGate | null;
}

export type NurtureEmailDispatchContext = {
  recipientEmail: string;
  sessionId?: string | null;
  /** Recovery-URL met eenmalige token; fallback naar /intake als niet gezet. */
  recoveryUrl?: string | null;
  /** Nurture-attributietoken voor /beste/-CTA's; alleen opnemen als sessie bekend. */
  nurtureToken?: string | null;
};
