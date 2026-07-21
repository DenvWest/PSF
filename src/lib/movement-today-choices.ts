import { movementPlanTemplate } from "@/data/lifestyle-plans/movement";
import {
  REST_DAY_STEP_ID,
  type MovementRecoveryHint,
} from "@/lib/movement-recovery-hint";
import type { PlanStep } from "@/types/lifestyle-plan";

export type TodayChoiceKind = "herstel" | "licht" | "trainen";

export type TodayChoiceOption = {
  kind: TodayChoiceKind;
  stepId: string;
  label: string;
  title: string;
  durationLabel: string;
  whyLinkLabel: string;
};

const ALL_STEPS = movementPlanTemplate.phases.flatMap((phase) => phase.steps);

const LIGHT_FALLBACK_STEP_ID = "mov-trap-of-wandeling";

const CHOICE_META: Record<
  TodayChoiceKind,
  Pick<TodayChoiceOption, "label" | "durationLabel" | "whyLinkLabel">
> = {
  herstel: {
    label: "Herstel",
    durationLabel: "10–20 min",
    whyLinkLabel: "Waarom herstel aandacht krijgt?",
  },
  licht: {
    label: "Licht bewegen",
    durationLabel: "20 min",
    whyLinkLabel: "Waarom licht bewegen?",
  },
  trainen: {
    label: "Trainen",
    durationLabel: "30–45 min",
    whyLinkLabel: "Waarom deze training?",
  },
};

function findStep(stepId: string): PlanStep | undefined {
  return ALL_STEPS.find((step) => step.id === stepId);
}

function stepTitle(stepId: string, fallback: string): string {
  return findStep(stepId)?.title ?? fallback;
}

export function resolveLightStepId(trainingStepId: string): string {
  const trainingStep = findStep(trainingStepId);
  if (
    trainingStep?.tags?.includes("conditie") &&
    trainingStep.id !== LIGHT_FALLBACK_STEP_ID
  ) {
    return LIGHT_FALLBACK_STEP_ID;
  }
  return LIGHT_FALLBACK_STEP_ID;
}

export function resolveTodayChoiceOptions(trainingStepId: string): TodayChoiceOption[] {
  const lightStepId = resolveLightStepId(trainingStepId);

  return (["herstel", "licht", "trainen"] as const).map((kind) => {
    const stepId =
      kind === "herstel"
        ? REST_DAY_STEP_ID
        : kind === "licht"
          ? lightStepId
          : trainingStepId;
    const meta = CHOICE_META[kind];

    return {
      kind,
      stepId,
      label: meta.label,
      title: stepTitle(
        stepId,
        kind === "herstel"
          ? "Rustdag of lichte wandeling"
          : kind === "licht"
            ? "Neem de trap of loop 20 min stevig"
            : "Je training van vandaag",
      ),
      durationLabel: meta.durationLabel,
      whyLinkLabel: meta.whyLinkLabel,
    };
  });
}

export function inferCompletedChoice(
  keys: readonly string[],
  options: readonly TodayChoiceOption[],
): TodayChoiceKind | null {
  for (const option of options) {
    if (keys.includes(option.stepId)) {
      return option.kind;
    }
  }
  return null;
}

export function findChoiceOption(
  options: readonly TodayChoiceOption[],
  kind: TodayChoiceKind,
): TodayChoiceOption {
  const option = options.find((entry) => entry.kind === kind);
  if (!option) {
    throw new Error(`Missing today choice option: ${kind}`);
  }
  return option;
}

/** Intake-only hints recommend rest in the picker — they never auto-override the hero. */
export function shouldRecommendRestChoice(hint: MovementRecoveryHint | null): boolean {
  if (!hint) {
    return false;
  }
  return (
    hint.level === "rest" ||
    hint.level === "medical" ||
    (hint.level === "light" && hint.promoteRustdagStep)
  );
}

/** Alleen actuele bronnen (check-in, wearable, gecombineerd) — geen intake-only. */
export function shouldOverrideTodayFromRecovery(hint: MovementRecoveryHint | null): boolean {
  if (!hint) {
    return false;
  }
  return hint.overrideToday;
}

export function buildRecoveryRecommendationLine(
  hint: MovementRecoveryHint | null,
): string | null {
  if (!shouldRecommendRestChoice(hint) || !hint) {
    return null;
  }

  if (hint.source === "intake") {
    return "Je Leefstijlcheck laat zien dat herstel extra aandacht verdient. Kies wat vandaag klopt.";
  }

  if (hint.source === "checkin") {
    return "Je recente check-in wijst op herstel. Kies wat vandaag klopt.";
  }

  if (hint.source === "wearable") {
    return "Je recovery-signaal wijst op herstel. Kies wat vandaag klopt.";
  }

  return "Je signalen wijzen op herstel. Kies wat vandaag klopt.";
}

export function buildMedicalSafetyLine(hint: MovementRecoveryHint | null): string | null {
  if (!hint?.showMedicalNote) {
    return null;
  }
  return hint.body;
}

export function modalityLabelForChoice(
  kind: TodayChoiceKind,
  stepId: string,
): string {
  if (kind === "herstel") {
    return "Herstel";
  }
  const step = findStep(stepId);
  if (step?.tags?.includes("kracht")) {
    return "Kracht";
  }
  if (step?.tags?.includes("conditie")) {
    return "Conditie";
  }
  return CHOICE_META[kind].label;
}
