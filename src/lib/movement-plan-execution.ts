import type { PlanStepState } from "@/types/lifestyle-plan";

/**
 * Afgeleide uitvoeringsstaat voor account-users: daily-log is SSOT,
 * plan-progress-checkboxes worden niet gebruikt voor display.
 */
export function buildExecutionStepStateGetter(
  loggedStepIds: ReadonlySet<string>,
): (stepId: string) => PlanStepState {
  return (stepId: string) => (loggedStepIds.has(stepId) ? "done" : "todo");
}

export function mergeLoggedStepIds(
  todayKeys: readonly string[],
  weekKeys: readonly string[],
): Set<string> {
  return new Set([...todayKeys, ...weekKeys]);
}
