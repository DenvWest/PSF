import type { DomainGoalDomain, GoalMode, SituationId } from "@/lib/domain-goal";
import type { MovementAnchor } from "@/lib/movement-prefs";

/**
 * Slice B/C (PLAN_EIGEN_IJKPUNT_DOEL_PER_DOMEIN.md): client-shape voor het
 * ijkpunt, gedragen door het doelblok in Kompas (`KompasDoelIjkpunt`). Droeg
 * tot 23 september ook de meetreeks op Voortgang (`VoortgangMetingenPerDomein`,
 * opgeheven toen voeding het enige domein werd).
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

/**
 * Eén regel per modus, gedeeld door de surfaces die het ijkpunt tonen: het
 * zetmoment in de middenkolom en de richting-regel in de contextkolom. Geen
 * oordeel, alleen de stand tussen twee scores.
 */
export const GOAL_MODE_LINE: Record<GoalMode, string> = {
  verwerven: "Je bent dit aan het verwerven.",
  behouden: "Je houdt dit vast.",
  herpakken: "Lager dan je vorige meting.",
};
