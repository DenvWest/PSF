import { movementPlanTemplate } from "@/data/lifestyle-plans/movement";
import type { WeekCategory } from "@/lib/movement-week-categories";
import {
  REST_DAY_STEP_ID,
  type MovementRecoveryHint,
} from "@/lib/movement-recovery-hint";
import type { PlanStep } from "@/types/lifestyle-plan";

/**
 * Drie belastings-tiers (niet modaliteiten): herstel < matig < trainen.
 * Het tier-label is stabiel; het concrete voorbeeld (title) komt dynamisch uit
 * de plan-stap. Zo passen toekomstige modaliteiten (yoga, pilates, 2e kracht)
 * binnen hetzelfde kader zonder de UI te verbreden.
 */
export type TodayChoiceKind = "herstel" | "matig" | "trainen";

export type TodayChoiceOption = {
  kind: TodayChoiceKind;
  stepId: string;
  label: string;
  /** Generaliserende tier-regel — stabiel, los van het voorbeeld van vandaag. */
  tierDescription: string;
  /** Uitleg in simpele taal: mechanisme + hersteltijd + frequentie (hover/tap-reveal). */
  tierExplanation: string;
  /** Concreet voorbeeld van vandaag, uit de plan-stap. */
  title: string;
  durationLabel: string;
  whyLinkLabel: string;
};

const ALL_STEPS = movementPlanTemplate.phases.flatMap((phase) => phase.steps);

const MODERATE_FALLBACK_STEP_ID = "mov-trap-of-wandeling";
const MODERATE_CONDITIONING_STEP_ID = "mov-conditie-onderhoud-week";

const CHOICE_META: Record<
  TodayChoiceKind,
  Pick<
    TodayChoiceOption,
    "label" | "tierDescription" | "tierExplanation" | "durationLabel" | "whyLinkLabel"
  >
> = {
  herstel: {
    label: "Herstel",
    tierDescription: "Herstel, mobiliteit of rust",
    tierExplanation:
      "Herstel is voorwaarden scheppen, geen niets-doen. Rustig wandelen en je spieren losmaken " +
      "brengt bloed en zuurstof naar je spieren en houdt gewrichten soepel — zonder nieuwe belasting. " +
      "Na een zware training of een lange matige inspanning heeft spierweefsel meestal 24 tot 72 uur " +
      "nodig om zich te herstellen. Eén à twee bewuste hersteldagen per week houden dat ritme vol.",
    durationLabel: "10–20 min",
    whyLinkLabel: "Waarom herstel aandacht krijgt?",
  },
  matig: {
    label: "Matig bewegen",
    tierDescription: "Conditie opbouwen zonder je te slopen",
    tierExplanation:
      "Matig bewegen is inspanning waarbij praten nog net lukt — stevig wandelen, fietsen of licht " +
      "krachtwerk. Het bouwt je conditie en doorbloeding op en belast hart en spieren zónder je herstel " +
      "op te maken. Juist omdat de belasting laag genoeg blijft, kun je het vaak doen: het effect zit in " +
      "regelmaat. Een veelgebruikte richtlijn is zo'n 150 minuten per week, verspreid over meerdere dagen.",
    durationLabel: "20–45 min",
    whyLinkLabel: "Waarom matig bewegen?",
  },
  trainen: {
    label: "Trainen",
    tierDescription: "Volle belasting — kracht of conditie",
    tierExplanation:
      "Zware training is volle belasting: krachttraining of stevige conditie waarbij vlot praten niet " +
      "meer lukt. Die prikkel beschadigt spiervezels licht; in de rust erna herstelt je lichaam ze sterker " +
      "— dat remt spierverlies na je 40e het hardst. Omdat de belasting hoog is, hoort er herstel bij: " +
      "2× per week met 48 tot 72 uur ertussen is voor de meeste mannen 40+ haalbaar en effectief.",
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

/**
 * Kiest de matige (tier 2) stap uit de moderate-pool i.p.v. altijd trap/wandeling.
 * Botst nooit met de trainen-stap; conditie-patroon leunt op een matige
 * conditie-onderhoudstap, kracht-patroon op de aerobe basis (trap/wandeling).
 */
export function resolveModerateStepId(
  trainingStepId: string,
  startPattern: WeekCategory | null,
): string {
  const moderateSteps = ALL_STEPS.filter(
    (step) => step.intensityTier === "moderate",
  );
  const pool = moderateSteps.filter((step) => step.id !== trainingStepId);
  const usable = pool.length > 0 ? pool : moderateSteps;

  const preferredId =
    startPattern === "conditie"
      ? MODERATE_CONDITIONING_STEP_ID
      : MODERATE_FALLBACK_STEP_ID;

  const preferred = usable.find((step) => step.id === preferredId);
  return (preferred ?? usable[0])?.id ?? MODERATE_FALLBACK_STEP_ID;
}

export function resolveTodayChoiceOptions(
  trainingStepId: string,
  startPattern: WeekCategory | null = null,
): TodayChoiceOption[] {
  const moderateStepId = resolveModerateStepId(trainingStepId, startPattern);

  return (["herstel", "matig", "trainen"] as const).map((kind) => {
    const stepId =
      kind === "herstel"
        ? REST_DAY_STEP_ID
        : kind === "matig"
          ? moderateStepId
          : trainingStepId;
    const meta = CHOICE_META[kind];

    return {
      kind,
      stepId,
      label: meta.label,
      tierDescription: meta.tierDescription,
      tierExplanation: meta.tierExplanation,
      title: stepTitle(
        stepId,
        kind === "herstel"
          ? "Rustdag of lichte wandeling"
          : kind === "matig"
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

export type ChoiceDoneSource = "hydrate" | "fresh_select" | "toggled";

/** Fresh keuze in sessie toont altijd unchecked; hydrate volgt de daily log. */
export function resolveChoiceDoneDisplay(
  logKeys: readonly string[],
  stepId: string,
  source: ChoiceDoneSource,
  toggledDone: boolean,
): boolean {
  if (source === "fresh_select") {
    return false;
  }
  if (source === "toggled") {
    return toggledDone;
  }
  return logKeys.includes(stepId);
}

const MS_PER_DAY = 86_400_000;

export function isRcvFeelWithinDays(
  rcvFeelAt: string | null | undefined,
  maxDays = 7,
): boolean {
  if (!rcvFeelAt) {
    return false;
  }
  const ts = new Date(rcvFeelAt).getTime();
  if (!Number.isFinite(ts)) {
    return false;
  }
  return Date.now() - ts <= maxDays * MS_PER_DAY;
}

export function resolveRcvFeelForRecoveryHint(
  rcvFeel: number | null | undefined,
  rcvFeelAt: string | null | undefined,
  maxDays = 7,
): number | undefined {
  if (rcvFeel == null || !isRcvFeelWithinDays(rcvFeelAt, maxDays)) {
    return undefined;
  }
  return rcvFeel;
}

export type MovementCheckinCta = {
  label: string;
  href: string;
};

export function buildMovementPulseCheckinHref(): string {
  return "/intake/beweging?mode=pulse&from=dashboard&kompas=beweging";
}

export function buildMovementCheckinCta(input: {
  rcvFeelAt: string | null | undefined;
  restRecommended: boolean;
}): MovementCheckinCta | null {
  const { rcvFeelAt, restRecommended } = input;
  const href = buildMovementPulseCheckinHref();

  if (isRcvFeelWithinDays(rcvFeelAt, 7)) {
    return null;
  }

  if (rcvFeelAt && !isRcvFeelWithinDays(rcvFeelAt, 7) && restRecommended) {
    return { label: "Update je herstel", href };
  }

  return { label: "Check in voor vandaag", href };
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

/**
 * Verse check-in (rcvFeel ≤7 dagen) wint op intake-profiel voor de Aanbevolen-badge.
 * Zonder check-in valt terug op recovery-hint (intake/wearable).
 */
export function resolveRecommendedTodayChoiceKind(
  rcvFeel: number | undefined,
  recovery: MovementRecoveryHint | null,
): TodayChoiceKind | null {
  if (rcvFeel != null) {
    if (rcvFeel <= 2) {
      return "herstel";
    }
    if (rcvFeel === 5) {
      return "trainen";
    }
    if (rcvFeel === 4) {
      return "matig";
    }
    return null;
  }

  if (shouldRecommendRestChoice(recovery)) {
    return "herstel";
  }

  return null;
}

export function buildTodayChoiceRecommendationLine(
  recommendedKind: TodayChoiceKind | null,
  recovery: MovementRecoveryHint | null,
  rcvFeel: number | undefined,
): string | null {
  if (recommendedKind === "trainen" && rcvFeel != null && rcvFeel >= 4) {
    return "Je check-in laat zien dat je klaar bent voor belasting. Trainen past vandaag.";
  }

  if (recommendedKind === "matig" && rcvFeel === 4) {
    return "Je check-in wijst op een matige sessie vandaag. Kies wat past.";
  }

  if (recommendedKind === "herstel" && rcvFeel != null && rcvFeel <= 2) {
    return "Je recente check-in wijst op herstel. Kies wat vandaag klopt.";
  }

  return buildRecoveryRecommendationLine(recovery);
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
