import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import {
  findChoiceOption,
  inferCompletedChoice,
  resolveMovementTodayChoiceOptions,
  type TodayChoiceKind,
} from "@/lib/movement-today-choices";
import type { DashboardModel } from "@/types/dashboard";

export const DEFAULT_PLAN_STEP_DURATION_MINUTES = 45;
export const DEFAULT_PLAN_STEP_DURATION_LABEL = "45 min";

export type PlanStepDuration = {
  durationMinutes: number;
  durationLabel: string;
};

/** Bovengrens uit labels als "10–20 min" → 20. */
export function parseDurationUpperMinutes(label: string): number {
  const rangeMatch = label.match(/(\d+)\s*[–-]\s*(\d+)/);
  if (rangeMatch) {
    return Number(rangeMatch[2]);
  }

  const singleMatch = label.match(/(\d+)/);
  if (singleMatch) {
    return Number(singleMatch[1]);
  }

  return DEFAULT_PLAN_STEP_DURATION_MINUTES;
}

function resolveBewegingChoiceKind(
  model: DashboardModel,
  slot: WeekDaySlot,
  options: ReturnType<typeof resolveMovementTodayChoiceOptions>,
  logKeys: readonly string[],
): TodayChoiceKind {
  // movementDayChoice is al datum-geresolved in DashboardModel (via movementDayChoice+date).
  if (slot.isToday && model.movementDayChoice) {
    return model.movementDayChoice;
  }

  if (slot.isToday) {
    const inferred = inferCompletedChoice(logKeys, options);
    if (inferred) {
      return inferred;
    }
  }

  return "matig";
}

export function resolvePlanStepDuration(
  model: DashboardModel,
  slot: WeekDaySlot,
  logKeys: readonly string[] = [],
): PlanStepDuration {
  if (slot.domain !== "beweging") {
    return {
      durationMinutes: DEFAULT_PLAN_STEP_DURATION_MINUTES,
      durationLabel: DEFAULT_PLAN_STEP_DURATION_LABEL,
    };
  }

  const options = resolveMovementTodayChoiceOptions(model, slot);
  if (options.length === 0) {
    return {
      durationMinutes: DEFAULT_PLAN_STEP_DURATION_MINUTES,
      durationLabel: DEFAULT_PLAN_STEP_DURATION_LABEL,
    };
  }

  const choiceKind = resolveBewegingChoiceKind(model, slot, options, logKeys);
  const option =
    options.find((entry) => entry.kind === choiceKind) ??
    findChoiceOption(options, "matig");

  return {
    durationMinutes: parseDurationUpperMinutes(option.durationLabel),
    durationLabel: option.durationLabel,
  };
}
