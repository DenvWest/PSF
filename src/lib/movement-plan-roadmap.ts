/**
 * Vaste mapping van fase-id naar kwalitatief bouwfase-label — vervangt het
 * ordinale "Fase X van Y" (verbod: geen "1 van 3" meer in user-facing copy).
 * "terugkomen" is met de huidige 3 fase-ids niet bereikbaar; dat komt pas met
 * F3's fase-aware resolver.
 */
const PHASE_POSITION_LABELS: Record<string, string> = {
  "mov-phase-deze-week": "basis leggen",
  "mov-phase-week-2-4": "opbouwen",
  "mov-phase-week-4-12": "onderhouden",
};

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function formatSinceDate(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Amsterdam",
  }).format(date);
}

/** De positieregel op de doe-surface: "Je bouwt {label} · week {n} · sinds {datum}". */
export function buildMovementPositionLine(input: {
  currentPhaseId: string;
  startedAt: string;
}): string {
  const label = PHASE_POSITION_LABELS[input.currentPhaseId] ?? "basis leggen";
  const startedDate = new Date(input.startedAt);
  const weekNumber = Number.isNaN(startedDate.getTime())
    ? 1
    : Math.max(1, Math.floor((Date.now() - startedDate.getTime()) / MS_PER_WEEK) + 1);
  const sinceLabel = formatSinceDate(input.startedAt);
  return sinceLabel
    ? `Je bouwt ${label} · week ${weekNumber} · sinds ${sinceLabel}`
    : `Je bouwt ${label} · week ${weekNumber}`;
}
