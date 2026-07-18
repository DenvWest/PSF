import type { PlanStep, PlanStepState } from "@/types/lifestyle-plan";

export const MOVEMENT_WEEK_PHASE_ID = "mov-phase-deze-week";

export type WeekCategory = "kracht" | "conditie" | "dagelijks_ritme";

export const WEEK_CATEGORY_OPTIONS: readonly {
  id: WeekCategory;
  label: string;
}[] = [
  { id: "kracht", label: "Kracht" },
  { id: "conditie", label: "Conditie" },
  { id: "dagelijks_ritme", label: "Dagelijks ritme" },
] as const;

export const DEFAULT_WEEK_CATEGORY: WeekCategory = "kracht";

export function isMovementWeekPhase(phaseId: string, domain: string): boolean {
  return domain === "movement" && phaseId === MOVEMENT_WEEK_PHASE_ID;
}

export function filterStepsForCategory(
  steps: readonly PlanStep[],
  category: WeekCategory,
): PlanStep[] {
  if (category === "dagelijks_ritme") {
    return [];
  }
  if (category === "kracht") {
    return steps.filter(
      (step) =>
        step.tags?.includes("kracht") || step.tags?.includes("herstel"),
    );
  }
  return steps.filter((step) => step.tags?.includes("conditie"));
}

export type CategoryStatus = "todo" | "partial" | "done" | "na";

export function getCategoryStatus(
  steps: readonly PlanStep[],
  category: WeekCategory,
  getState: (stepId: string) => PlanStepState,
): CategoryStatus {
  if (category === "dagelijks_ritme") {
    return "na";
  }
  const filtered = filterStepsForCategory(steps, category);
  if (filtered.length === 0) {
    return "na";
  }
  const states = filtered.map((step) => getState(step.id));
  const allComplete = states.every(
    (state) => state === "done" || state === "skipped",
  );
  if (allComplete) {
    return "done";
  }
  const anyComplete = states.some(
    (state) => state === "done" || state === "skipped",
  );
  if (anyComplete) {
    return "partial";
  }
  return "todo";
}
