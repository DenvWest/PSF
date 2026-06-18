import { CHECK_LOG, CHECKS } from "@/data/dashboard";
import { computeVitaliteit, resolveVitaliteitFacets } from "@/lib/vitaliteit";
import type {
  Check,
  CheckId,
  CheckLogEntry,
  CheckScores,
  CheckSnapshot,
  DashboardData,
} from "@/types/dashboard";

function toDomainScores(scores: CheckScores) {
  return {
    sleep_score: scores.slaap,
    energy_score: scores.energie,
    stress_score: scores.stress,
    nutrition_score: scores.voeding,
    movement_score: scores.beweging,
    recovery_score: scores.herstel,
  };
}

function toSnapshot(check: Check): CheckSnapshot {
  return {
    scores: check.scores,
    vitality: computeVitaliteit(resolveVitaliteitFacets(toDomainScores(check.scores))),
    date: check.date,
  };
}

function filterHistory(checkId: CheckId): CheckLogEntry[] {
  const check = CHECKS[checkId];
  return CHECK_LOG.filter((entry) => entry.seq <= check.seq);
}

export function buildDevDashboardData(
  mode: "scored" | "retest",
): DashboardData {
  const currentCheck = mode === "retest" ? CHECKS.check2 : CHECKS.check1;
  const currentSnapshot = toSnapshot(currentCheck);
  const history = filterHistory(mode === "retest" ? "check2" : "check1");
  const prev =
    mode === "retest"
      ? toSnapshot(CHECKS.check1)
      : history.length > 1
        ? {
            scores: currentSnapshot.scores,
            vitality: history[history.length - 2].vitality,
            date: history[history.length - 2].date,
          }
        : null;

  return {
    empty: false,
    current: {
      ...currentSnapshot,
      trend: currentCheck.trend,
    },
    prev,
    history,
    retest: mode === "retest",
    nutritionIntake: null,
    remeasure:
      mode === "retest"
        ? { dueDate: "10 jul 2026", daysUntil: -8 }
        : { dueDate: "10 jul 2026", daysUntil: 22 },
  };
}
