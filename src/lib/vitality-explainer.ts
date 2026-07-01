import type { DomainScores } from "@/lib/intake-engine";
import {
  buildHabitScoreKernel,
  getVitalityScoreMeaning,
} from "@/lib/vitality-habit-kernel";
import type { PillarId } from "@/types/dashboard";

export type VitalityExplainer = readonly [string, string, string];

export function getVitalityExplainer(input: {
  vitality: number;
  vitalityDelta: number | null;
  vitalityDeltaComparable?: boolean;
  priorityId: PillarId;
  priorityScore: number;
  answers: Record<string, number> | null;
  domainScores: DomainScores;
}): VitalityExplainer {
  const showDelta =
    input.vitalityDeltaComparable !== false &&
    input.vitalityDelta !== null &&
    input.vitalityDelta !== 0;
  const deltaText = showDelta
    ? input.vitalityDelta! > 0
      ? ` (+${input.vitalityDelta})`
      : ` (${input.vitalityDelta})`
    : "";
  const line1 = `${getVitalityScoreMeaning(input.vitality)}${deltaText}`;
  const kernel = buildHabitScoreKernel({
    vitality: input.vitality,
    priorityId: input.priorityId,
    priorityScore: input.priorityScore,
    answers: input.answers,
    domainScores: input.domainScores,
  });

  return [line1, `${kernel.driverLinkLine} ${kernel.driverHabitLine}`, kernel.nextBestHabit];
}
