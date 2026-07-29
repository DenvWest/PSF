import type { DomainGoalDomain, GoalMode, SituationId } from "@/lib/domain-goal";
import type { MovementAnchor } from "@/lib/movement-prefs";

/**
 * Slice B/C (PLAN_EIGEN_IJKPUNT_DOEL_PER_DOMEIN.md): gedeelde client-shape
 * voor `VoortgangHubScroll`, dat als enige de doelen + het beweeganker fetcht
 * en doorgeeft aan `VoortgangDomeinRing` (zetmoment) en `VoortgangRichtingBeat`
 * (doelblok) — één fetch, geen state-drift tussen de twee.
 */

export type DomainGoalSummary = {
  situationId: SituationId;
  ownWords: string | null;
  scores: { score: number }[];
  mode: GoalMode | null;
};

export type DomainGoalMap = Partial<Record<DomainGoalDomain, DomainGoalSummary>>;

export async function fetchDomainGoals(): Promise<DomainGoalMap | null> {
  try {
    const response = await fetch("/api/account/domain-goal", {
      credentials: "include",
    });
    if (!response.ok) {
      return null;
    }
    const json = (await response.json()) as {
      goals: {
        domain: DomainGoalDomain;
        situationId: SituationId;
        ownWords: string | null;
        scores: { score: number }[];
        mode: GoalMode | null;
      }[];
    };
    const map: DomainGoalMap = {};
    for (const entry of json.goals) {
      map[entry.domain] = {
        situationId: entry.situationId,
        ownWords: entry.ownWords,
        scores: entry.scores,
        mode: entry.mode,
      };
    }
    return map;
  } catch {
    return null;
  }
}

export async function fetchMovementAnchor(): Promise<MovementAnchor | null> {
  try {
    const response = await fetch("/api/account/movement-prefs", {
      credentials: "include",
    });
    if (!response.ok) {
      return null;
    }
    const json = (await response.json()) as { anchor: MovementAnchor | null };
    return json.anchor ?? null;
  } catch {
    return null;
  }
}
