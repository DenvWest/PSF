import type { DomainScores } from "@/lib/intake-engine";

export type RecoveryHintLevel = "none" | "light" | "rest" | "medical";

export type MovementRecoveryInput = {
  movStr?: number;
  movCard?: number;
  rcvPhys?: number;
  recoveryScore?: number;
  /** Latest beweeg-check-in: 1 = uitgeput, 5 = fris */
  rcvFeel?: number;
  /** Optional wearable-derived 0–1 recovery fit (premium, fase 2) */
  recoveryFit?: number | null;
};

export type MovementRecoveryHint = {
  level: RecoveryHintLevel;
  headline: string;
  body: string;
  source: "intake" | "checkin" | "wearable" | "combined";
  promoteRustdagStep: boolean;
  showMedicalNote: boolean;
};

const REST_DAY_STEP_ID = "mov-rustdag-na-inspanning";

export { REST_DAY_STEP_ID };

function isHighTrainingLoad(movStr?: number, movCard?: number): boolean {
  return (movStr ?? 0) >= 3 || (movCard ?? 0) >= 4;
}

function isLowPhysicalRecovery(rcvPhys?: number, recoveryScore?: number): boolean {
  return (rcvPhys ?? 3) <= 1 || (recoveryScore ?? 100) <= 40;
}

function isModerateRecoveryStress(rcvPhys?: number, recoveryScore?: number): boolean {
  return (rcvPhys ?? 3) <= 2 || (recoveryScore ?? 100) <= 55;
}

export function buildMovementRecoveryHint(
  input: MovementRecoveryInput,
): MovementRecoveryHint | null {
  const { movStr, movCard, rcvPhys, recoveryScore, rcvFeel, recoveryFit } = input;

  const highLoad = isHighTrainingLoad(movStr, movCard);
  const lowRecovery = isLowPhysicalRecovery(rcvPhys, recoveryScore);
  const moderateRecovery = isModerateRecoveryStress(rcvPhys, recoveryScore);
  const feelLow = typeof rcvFeel === "number" && rcvFeel <= 2;
  const feelVeryLow = typeof rcvFeel === "number" && rcvFeel === 1;
  const wearableLow =
    typeof recoveryFit === "number" && Number.isFinite(recoveryFit) && recoveryFit < 0.45;

  const fromCheckin = feelLow;
  const fromIntake = lowRecovery || (highLoad && moderateRecovery);
  const fromWearable = wearableLow;

  if (!fromCheckin && !fromIntake && !fromWearable) {
    return null;
  }

  const source: MovementRecoveryHint["source"] =
    [fromCheckin, fromIntake, fromWearable].filter(Boolean).length > 1
      ? "combined"
      : fromWearable
        ? "wearable"
        : fromCheckin
          ? "checkin"
          : "intake";

  const contextLabel =
    source === "checkin"
      ? "Op basis van je check-in"
      : source === "wearable"
        ? "Op basis van je recovery-signaal"
        : source === "combined"
          ? "Op basis van je signalen"
          : "Op basis van je Leefstijlcheck";

  const showMedicalNote =
    (recoveryScore ?? 100) <= 30 &&
    (rcvPhys ?? 3) <= 1 &&
    (feelVeryLow || fromIntake);

  if (showMedicalNote) {
    return {
      level: "medical",
      headline: `${contextLabel}: vandaag rust of licht bewegen`,
      body:
        "Je herstel lijkt structureel onder druk. Plan een rustdag of lichte wandeling — en bespreek aanhoudende klachten met je huisarts.",
      source,
      promoteRustdagStep: true,
      showMedicalNote: true,
    };
  }

  if (lowRecovery || feelLow || wearableLow) {
    return {
      level: "rest",
      headline: `${contextLabel}: vandaag liever rust of licht bewegen`,
      body: "Herstel is waar je sterker wordt. Kies rust, een lichte wandeling of de rustdag-stap — geen zware kracht vandaag.",
      source,
      promoteRustdagStep: true,
      showMedicalNote: false,
    };
  }

  return {
    level: "light",
    headline: `${contextLabel}: houd het licht vandaag`,
    body: "Je traint al redelijk veel — een kortere krachtsessie of extra rust tussen sessies helpt je ritme vol te houden.",
    source,
    promoteRustdagStep: highLoad,
    showMedicalNote: false,
  };
}

export function buildMovementRecoveryInput(
  scores: DomainScores,
  answers: Record<string, number>,
  rcvFeel?: number,
  recoveryFit?: number | null,
): MovementRecoveryInput {
  return {
    movStr: answers.MOV_STR,
    movCard: answers.MOV_CARD,
    rcvPhys: answers.RCV_PHYS,
    recoveryScore: scores.recovery_score,
    rcvFeel,
    recoveryFit,
  };
}
