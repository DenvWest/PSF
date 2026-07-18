import {
  buildMovementRecoveryHint,
  buildMovementRecoveryInput,
  type MovementRecoveryHint,
} from "@/lib/movement-recovery-hint";
import { computeRecoveryFit } from "@/lib/wearable/recovery-fit";
import type { WearableSignalSnapshot } from "@/types/wearable-signals";
import type { DomainScores } from "@/lib/intake-engine";

/**
 * Combines intake/check-in rules with optional wearable snapshot (fase 2).
 * Wearable ingest disabled until DPIA — callers pass snapshot only when consented.
 */
export function buildMovementRecoveryHintWithWearable(options: {
  scores: DomainScores;
  answers: Record<string, number>;
  rcvFeel?: number;
  wearableSnapshot?: WearableSignalSnapshot | null;
}): MovementRecoveryHint | null {
  const recoveryFit =
    options.wearableSnapshot != null
      ? computeRecoveryFit(options.wearableSnapshot)
      : null;

  return buildMovementRecoveryHint(
    buildMovementRecoveryInput(
      options.scores,
      options.answers,
      options.rcvFeel,
      recoveryFit,
    ),
  );
}
