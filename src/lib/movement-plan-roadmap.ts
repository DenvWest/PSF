import { movementPlanTemplate } from "@/data/lifestyle-plans/movement";
import { MOVEMENT_FREQUENCY_OPTIONS } from "@/data/movement/session-catalog";
import { selectVisibleSteps } from "@/lib/lifestyle-plan-eval";
import { getMovementTrack } from "@/lib/movement-plan-track";
import type { MovementPlanProfile } from "@/lib/movement-plan-profile";
import { buildAnchorWhySuffix, MOVEMENT_ANCHOR_OPTIONS, startPatternLabel } from "@/lib/movement-prefs";
import { filterStepsForCategory } from "@/lib/movement-week-categories";
import type {
  PlanIntakeContext,
  PlanStepState,
  PlanPhase,
} from "@/types/lifestyle-plan";
import type { MovementWeeklyFrequency } from "@/data/movement/session-catalog";

/**
 * Beeldmodel voor de fase-as + het fase-paneel (S2).
 *
 * Twee regels die hier hard in zitten:
 * - **Positie is afgeleid** (lock 5, BLAUWDRUK §5.1): `state` en `loggedCount`
 *   komen uit de daily-log-afgeleide stap-staat, nooit uit een opgeslagen veld.
 * - **Personalisatie is copy, geen programma**: spoor, dosis, anker en de
 *   check-band kleuren alleen tekst en nadruk. Welke stappen zichtbaar zijn
 *   blijft `selectVisibleSteps`, precies zoals vóór deze slice.
 */

export type RoadmapPhaseState = "done" | "active" | "ahead";

export type MovementRoadmapPhase = {
  id: string;
  title: string;
  horizonLabel: string;
  intro: string | null;
  state: RoadmapPhaseState;
  /** Uit de daily-log afgeleid — je verdient je plek, je zet hem niet. */
  loggedCount: number;
  stepCount: number;
  /** Wat jouw spoor in déze fase betekent. Copy, geen programmawijziging. */
  spoorNote: string | null;
};

export type MovementPlanRoadmapView = {
  phases: MovementRoadmapPhase[];
  activePhaseId: string;
  /** "Fase 2 van 3" — de positie, niet een score. */
  positionLabel: string;
  headline: string;
  /** Gekozen route: spoor + dosis, met het anker als waarom. */
  routeLine: string | null;
  /** Afgeleide readout over de actieve fase. */
  progressLine: string | null;
  /** Waar je nu het meest wint, uit de bestaande MOV_STR/MOV_CARD-band. */
  focusLine: string | null;
  /** Copy-only na hermeting — geen automatische planwijziging (S5b). */
  remeasureLine: string | null;
  /** Anker-citaat in de positie-header. */
  anchorQuote: string | null;
};

const HORIZON_LABELS: Record<string, string> = {
  "deze-week": "Deze week",
  "week-2-4": "Week 2–4",
  "week-4-12": "Week 4–12",
};

export function roadmapHorizonLabel(horizon: string): string {
  return HORIZON_LABELS[horizon] ?? horizon;
}

function frequencyLabel(
  frequency: MovementWeeklyFrequency | null,
): string | null {
  if (!frequency) {
    return null;
  }
  return (
    MOVEMENT_FREQUENCY_OPTIONS.find((option) => option.id === frequency)
      ?.label ?? null
  );
}

function buildSpoorNote(
  phase: PlanPhase,
  stepCount: number,
  profile: MovementPlanProfile,
  ctx: PlanIntakeContext,
): string | null {
  const pattern = profile.startPattern;
  if (!pattern) {
    return null;
  }
  const label = startPatternLabel(pattern);
  if (pattern === "dagelijks_ritme") {
    return `Jouw spoor ${label}: je beweegmomenten staan onder Dagelijks ritme, niet als losse stappen.`;
  }
  const own = filterStepsForCategory(selectVisibleSteps(phase, ctx), pattern);
  if (own.length === 0) {
    return `Jouw spoor ${label}: deze fase heeft geen eigen ${label.toLowerCase()}-stap — wat hier staat geldt voor elk spoor.`;
  }
  return `Jouw spoor ${label}: ${own.length} van de ${stepCount} stappen in deze fase.`;
}

function buildRouteLine(profile: MovementPlanProfile): string | null {
  const parts: string[] = [];
  const pattern = profile.startPattern;
  if (pattern) {
    const dose =
      pattern === "dagelijks_ritme"
        ? null
        : frequencyLabel(profile.weeklyFrequency);
    const spoor = startPatternLabel(pattern).toLowerCase();
    parts.push(dose ? `Jouw route: ${spoor}, ${dose}.` : `Jouw route: ${spoor}.`);
  }
  const why = buildAnchorWhySuffix(profile.anchor);
  if (why) {
    parts.push(why);
  }
  return parts.length > 0 ? parts.join(" ") : null;
}

function buildProgressLine(phase: MovementRoadmapPhase | undefined): string | null {
  if (!phase || phase.stepCount === 0) {
    return null;
  }
  if (phase.loggedCount === 0) {
    return "Afgelopen 7 dagen: nog geen stap gelogd";
  }
  return `Afgelopen 7 dagen: ${phase.loggedCount} van ${phase.stepCount} stappen gelogd`;
}

export function buildMovementPlanRoadmapView(input: {
  ctx: PlanIntakeContext;
  currentPhaseId: string;
  profile: MovementPlanProfile;
  getStepState: (stepId: string) => PlanStepState;
  /** S5b: copy-only hermeting-haak in de positie-header. */
  remeasureLine?: string | null;
}): MovementPlanRoadmapView {
  const templatePhases = movementPlanTemplate.phases;
  const rawIndex = templatePhases.findIndex(
    (phase) => phase.id === input.currentPhaseId,
  );
  const activeIndex = rawIndex >= 0 ? rawIndex : 0;

  const phases: MovementRoadmapPhase[] = templatePhases.map((phase, index) => {
    const visible = selectVisibleSteps(phase, input.ctx);
    const loggedCount = visible.filter(
      (step) => input.getStepState(step.id) === "done",
    ).length;
    const state: RoadmapPhaseState =
      index < activeIndex ? "done" : index === activeIndex ? "active" : "ahead";

    return {
      id: phase.id,
      title: phase.title,
      horizonLabel: roadmapHorizonLabel(phase.horizon),
      intro: phase.intro?.body ?? null,
      state,
      loggedCount,
      stepCount: visible.length,
      spoorNote: buildSpoorNote(phase, visible.length, input.profile, input.ctx),
    };
  });

  const activePhase = phases[activeIndex];
  const track = getMovementTrack(input.ctx);
  const anchorOption = input.profile.anchor
    ? MOVEMENT_ANCHOR_OPTIONS.find((option) => option.id === input.profile.anchor)
    : null;

  return {
    phases,
    activePhaseId: activePhase?.id ?? "",
    positionLabel: `Fase ${activeIndex + 1} van ${templatePhases.length}`,
    headline: activePhase?.title ?? movementPlanTemplate.title,
    routeLine: buildRouteLine(input.profile),
    progressLine: buildProgressLine(activePhase),
    focusLine: `Uit je beweegcheck — ${track.label}. ${track.summary}`,
    remeasureLine: input.remeasureLine ?? null,
    anchorQuote: anchorOption?.label ?? null,
  };
}
