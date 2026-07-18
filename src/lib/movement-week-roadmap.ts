import { movementPlanTemplate } from "@/data/lifestyle-plans/movement";
import { getMovementTrack } from "@/lib/movement-plan-track";
import type { MovementRecoveryHint } from "@/lib/movement-recovery-hint";
import {
  filterStepsForCategory,
  getCategoryStatus,
  WEEK_CATEGORY_OPTIONS,
  type WeekCategory,
} from "@/lib/movement-week-categories";
import type {
  PlanIntakeContext,
  PlanStep,
  PlanStepLinkKind,
  PlanStepState,
} from "@/types/lifestyle-plan";
import { REST_DAY_STEP_ID } from "@/lib/movement-recovery-hint";

export type MovementWeekRoadmapModel = {
  trackLine: string;
  todayLine: string | null;
  progressLabel: string;
  spoorRows: readonly {
    id: WeekCategory;
    label: string;
    subtitle: string;
    status: ReturnType<typeof getCategoryStatus>;
  }[];
};

export type MovementSpoorDetailModel = {
  category: WeekCategory;
  title: string;
  hook: string;
  mechanismSummary: string;
  primarySteps: PlanStep[];
  alternativeSteps: PlanStep[];
  evidenceLinks: readonly {
    stepId: string;
    label: string;
    href: string;
    kind: PlanStepLinkKind;
  }[];
};

const SPOOR_URL_VALUES = new Set(["kracht", "conditie", "dagelijks-ritme"]);

export function weekCategoryToSpoorParam(category: WeekCategory): string {
  return category === "dagelijks_ritme" ? "dagelijks-ritme" : category;
}

export function spoorParamToWeekCategory(param: string): WeekCategory | null {
  if (param === "kracht" || param === "conditie") {
    return param;
  }
  if (param === "dagelijks-ritme") {
    return "dagelijks_ritme";
  }
  return null;
}

export function parseSpoorFromUrl(url: string | URL): WeekCategory | null {
  const parsed =
    typeof url === "string" ? new URL(url, "http://localhost") : new URL(url.toString());
  const spoor = parsed.searchParams.get("spoor");
  if (!spoor || !SPOOR_URL_VALUES.has(spoor)) {
    return null;
  }
  return spoorParamToWeekCategory(spoor);
}

export function syncPlanSpoorParam(category: WeekCategory | null): void {
  if (typeof window === "undefined") {
    return;
  }
  const url = new URL(window.location.href);
  if (category) {
    url.searchParams.set("spoor", weekCategoryToSpoorParam(category));
  } else {
    url.searchParams.delete("spoor");
  }
  window.history.replaceState(null, "", url.toString());
}

function buildSpoorSubtitle(
  category: WeekCategory,
  steps: readonly PlanStep[],
  recoveryHint: MovementRecoveryHint | null,
): string {
  if (category === "dagelijks_ritme") {
    return "Beweegsnacks en stappendoel";
  }
  if (category === "kracht") {
    if (recoveryHint?.promoteRustdagStep) {
      return "Herstel eerst — lichte kracht daarna";
    }
    if (steps.length === 0) {
      return "Geen krachtacties voor jouw profiel";
    }
    return "1 krachtsessie of rustdag plannen";
  }
  if (steps.length === 0) {
    return "Geen conditie-acties voor jouw profiel";
  }
  return "Matig intensief bewegen deze week";
}

function buildSpoorProgressLabel(
  visibleSteps: readonly PlanStep[],
  getStepState: (stepId: string) => PlanStepState,
): string {
  const trackable = WEEK_CATEGORY_OPTIONS.filter(
    (option) => getCategoryStatus(visibleSteps, option.id, getStepState) !== "na",
  );
  const doneCount = trackable.filter(
    (option) => getCategoryStatus(visibleSteps, option.id, getStepState) === "done",
  ).length;

  if (trackable.length === 0) {
    return "Nog geen sporen voor jouw profiel";
  }

  return `${doneCount} van ${trackable.length} sporen`;
}

export function buildMovementWeekRoadmap(
  ctx: PlanIntakeContext,
  visibleSteps: readonly PlanStep[],
  getStepState: (stepId: string) => PlanStepState,
  recoveryHint: MovementRecoveryHint | null,
): MovementWeekRoadmapModel {
  const track = getMovementTrack(ctx);

  return {
    trackLine: track.summary,
    todayLine: recoveryHint?.headline ?? null,
    progressLabel: buildSpoorProgressLabel(visibleSteps, getStepState),
    spoorRows: WEEK_CATEGORY_OPTIONS.map((option) => ({
      id: option.id,
      label: option.label,
      subtitle: buildSpoorSubtitle(
        option.id,
        filterStepsForCategory(visibleSteps, option.id),
        recoveryHint,
      ),
      status: getCategoryStatus(visibleSteps, option.id, getStepState),
    })),
  };
}

function buildSpoorHook(
  category: WeekCategory,
  ctx: PlanIntakeContext,
  recoveryHint: MovementRecoveryHint | null,
): string {
  const track = getMovementTrack(ctx);

  if (category === "dagelijks_ritme") {
    return "Korte beweegmomenten tellen mee — ook zonder sportschool of extra training.";
  }

  if (category === "kracht") {
    if (recoveryHint?.promoteRustdagStep) {
      return "Je signalen wijzen op herstel — plan rust of licht bewegen vóór zware kracht.";
    }
    return track.label.includes("Kracht")
      ? track.summary
      : "Eén echte krachtprikkel per week houdt spiermassa op peil na 40.";
  }

  return track.label.includes("Conditie")
    ? track.summary
    : "Stevig wandelen of traplopen bouwt conditie op zonder extra schema.";
}

function buildMechanismSummary(category: WeekCategory): string {
  const mechanism = movementPlanTemplate.mechanism.body;
  const paragraphs = mechanism.split("\n\n");

  if (category === "kracht") {
    return paragraphs[0] ?? mechanism;
  }
  if (category === "conditie") {
    return (
      paragraphs[1] ??
      "Conditie bouw je op via stevig wandelen — niet meteen alles tegelijk."
    );
  }
  return "Onderbreek lang zitten met korte beweegmomenten. Dat telt mee naast je weektraining.";
}

export function splitSpoorSteps(
  category: WeekCategory,
  steps: readonly PlanStep[],
  recoveryHint: MovementRecoveryHint | null,
): { primarySteps: PlanStep[]; alternativeSteps: PlanStep[] } {
  if (category === "dagelijks_ritme" || steps.length === 0) {
    return { primarySteps: [], alternativeSteps: [] };
  }

  if (category === "kracht" && recoveryHint?.promoteRustdagStep) {
    return {
      primarySteps: steps.filter((step) => step.id === REST_DAY_STEP_ID),
      alternativeSteps: steps.filter((step) => step.id !== REST_DAY_STEP_ID),
    };
  }

  if (steps.length === 1) {
    return { primarySteps: [...steps], alternativeSteps: [] };
  }

  return {
    primarySteps: [steps[0]],
    alternativeSteps: steps.slice(1),
  };
}

export function buildMovementSpoorDetail(
  ctx: PlanIntakeContext,
  visibleSteps: readonly PlanStep[],
  category: WeekCategory,
  recoveryHint: MovementRecoveryHint | null,
): MovementSpoorDetailModel {
  const categorySteps = filterStepsForCategory(visibleSteps, category);
  const { primarySteps, alternativeSteps } = splitSpoorSteps(
    category,
    categorySteps,
    recoveryHint,
  );

  const evidenceLinks = [...primarySteps, ...alternativeSteps]
    .filter((step) => step.link)
    .map((step) => ({
      stepId: step.id,
      label: step.link!.label,
      href: step.link!.href,
      kind: step.link!.kind,
    }));

  const option = WEEK_CATEGORY_OPTIONS.find((row) => row.id === category);

  return {
    category,
    title: option?.label ?? category,
    hook: buildSpoorHook(category, ctx, recoveryHint),
    mechanismSummary: buildMechanismSummary(category),
    primarySteps,
    alternativeSteps,
    evidenceLinks,
  };
}

export function buildNutrientBridgeIntro(category: WeekCategory): string {
  switch (category) {
    case "kracht":
      return "Kracht vraagt consistente eiwitinname — eerst tafel, dan potje.";
    case "conditie":
      return "Conditie vraagt energie en herstel — voeding ondersteunt beide.";
    case "dagelijks_ritme":
      return "Meer dagelijks bewegen vraagt ook voldoende eiwit en rust.";
  }
}

export function getMicroRationale(body: string, maxLength = 120): string {
  const firstLine = body.split("\n")[0]?.trim() ?? body.trim();
  if (firstLine.length <= maxLength) {
    return firstLine;
  }
  return `${firstLine.slice(0, maxLength - 1)}…`;
}
