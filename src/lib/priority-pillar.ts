import { PILLAR } from "@/data/dashboard";
import type { DomainScores } from "@/lib/intake-engine";
import { MEASURED_DOMAIN_TO_PILLAR } from "@/lib/measured-pillar-map";
import { getPrimaryTheme } from "@/lib/primary-theme";
import type { Pillar, PillarId } from "@/types/dashboard";

/**
 * Eén priority-bron voor de hele funnel: de zichtbare prioriteitspijler is altijd de
 * measured primary theme (slaap/stress/voeding/beweging), nooit energie/herstel. Zo matchen
 * de reveal-kop, de dashboard-priority en nurture.primary_domain 1-op-1.
 */
export function getPriorityPillarId(
  scores: DomainScores,
  answers: Record<string, number>,
): PillarId {
  return MEASURED_DOMAIN_TO_PILLAR[getPrimaryTheme(scores, answers)];
}

export function getPriorityPillar(
  scores: DomainScores,
  answers: Record<string, number>,
): Pillar {
  return PILLAR[getPriorityPillarId(scores, answers)];
}
