/**
 * De positieregel: de ene analyse-readout die op een doe-surface mag staan.
 * Kwalitatieve bouwfase + hoe lang + sinds wanneer — nooit een score, nooit een
 * rangnummer ("fase 1 van 3" is verboden in user-facing copy).
 *
 * Domein-agnostisch zodat slaap en stress dezelfde regel erven als beweging;
 * per domein verschilt alleen hoe `phase` wordt afgeleid.
 */

export type DomainBuildPhase =
  | "building_base"
  | "progressing"
  | "maintaining"
  | "returning";

const PHASE_LABEL: Record<DomainBuildPhase, string> = {
  building_base: "basis leggen",
  progressing: "opbouwen",
  maintaining: "onderhouden",
  returning: "terugkomen",
};

export const DEFAULT_BUILD_PHASE: DomainBuildPhase = "building_base";

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

export type DomainPositionLine = {
  phase: DomainBuildPhase;
  phaseLabel: string;
  weekNumber: number;
  sinceLabel: string | null;
  text: string;
};

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

function weekNumberSince(startedAt: string, now: Date): number {
  const startedDate = new Date(startedAt);
  if (Number.isNaN(startedDate.getTime())) {
    return 1;
  }
  return Math.max(
    1,
    Math.floor((now.getTime() - startedDate.getTime()) / MS_PER_WEEK) + 1,
  );
}

export function buildDomainPositionLine(input: {
  phase: DomainBuildPhase;
  startedAt: string;
  now?: Date;
}): DomainPositionLine {
  const now = input.now ?? new Date();
  const phaseLabel = PHASE_LABEL[input.phase];
  const weekNumber = weekNumberSince(input.startedAt, now);
  const sinceLabel = formatSinceDate(input.startedAt);
  const text = sinceLabel
    ? `Je bouwt ${phaseLabel} · week ${weekNumber} · sinds ${sinceLabel}`
    : `Je bouwt ${phaseLabel} · week ${weekNumber}`;

  return { phase: input.phase, phaseLabel, weekNumber, sinceLabel, text };
}
