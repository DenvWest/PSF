import { movementPlanTemplate } from "@/data/lifestyle-plans/movement";
import {
  buildDomainPositionLine,
  DEFAULT_BUILD_PHASE,
  type DomainBuildPhase,
} from "@/lib/domain-position-line";

/**
 * Vaste mapping van fase-id naar de gedeelde bouwfase — vervangt het ordinale
 * "Fase X van Y". "returning" is met de huidige 3 fase-ids niet bereikbaar;
 * dat komt pas met F3's fase-aware resolver.
 */
const PHASE_BUILD_PHASES: Record<string, DomainBuildPhase> = {
  "mov-phase-deze-week": "building_base",
  "mov-phase-week-2-4": "progressing",
  "mov-phase-week-4-12": "maintaining",
};

/** De positieregel op de doe-surface: "Je bouwt {label} · week {n} · sinds {datum}". */
export function buildMovementPositionLine(input: {
  currentPhaseId: string;
  startedAt: string;
}): string {
  return buildDomainPositionLine({
    phase: PHASE_BUILD_PHASES[input.currentPhaseId] ?? DEFAULT_BUILD_PHASE,
    startedAt: input.startedAt,
  }).text;
}

/**
 * De "Straks"-vooruitblik — verplaatst uit de VANDAAG-kaart naar onder de vouw
 * (S2, compositie-verdict §D.1: vooruitblik is nooit de eerste blik).
 */
export function buildMovementAheadLine(currentPhaseId: string | undefined): string {
  const phases = movementPlanTemplate.phases;
  const index = phases.findIndex((phase) => phase.id === currentPhaseId);
  if (index < 0) {
    return "Nog één moment deze week, dan schuift je plan door naar de volgende fase.";
  }
  if (index >= phases.length - 1) {
    return "Laatste fase. Je hermeting laat zien wat het ritme heeft gedaan.";
  }
  const next = phases[index + 1];
  const nextLabel =
    next.horizon === "deze-week"
      ? "deze week"
      : next.horizon === "week-2-4"
        ? "week 2–4"
        : "week 4–12";
  return `Nog één krachtmoment deze week, dan komt ${nextLabel} in beeld.`;
}
