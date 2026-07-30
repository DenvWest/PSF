import { movementPlanTemplate } from "@/data/lifestyle-plans/movement";
import type { WeekCategory } from "@/lib/movement-week-categories";

export type WeekRhythmTag = "kracht" | "conditie" | "herstel";

export type WeekRhythmChip = {
  tag: WeekRhythmTag;
  label: string;
  count: number;
};

const MODALITY_TAGS: readonly WeekRhythmTag[] = ["kracht", "conditie", "herstel"];

const MODALITY_LABELS: Record<WeekRhythmTag, string> = {
  kracht: "Kracht",
  conditie: "Conditie",
  herstel: "Herstel",
};

function isModalityTag(tag: string): tag is WeekRhythmTag {
  return (MODALITY_TAGS as readonly string[]).includes(tag);
}

const stepModalityById = new Map<string, WeekRhythmTag>(
  movementPlanTemplate.phases
    .flatMap((phase) => phase.steps)
    .flatMap((step) => {
      const modality = step.tags?.find(isModalityTag);
      return modality ? [[step.id, modality] as const] : [];
    }),
);

export function buildWeekRhythm(loggedStepIds: readonly string[]): WeekRhythmChip[] {
  const counts: Record<WeekRhythmTag, number> = {
    kracht: 0,
    conditie: 0,
    herstel: 0,
  };

  for (const stepId of loggedStepIds) {
    const modality = stepModalityById.get(stepId);
    if (modality) {
      counts[modality] += 1;
    }
  }

  return MODALITY_TAGS.flatMap((tag) =>
    counts[tag] > 0
      ? [{ tag, label: MODALITY_LABELS[tag], count: counts[tag] }]
      : [],
  );
}

/**
 * Eén zin voor "DEZE WEEK" — nooit een saldo, nooit "x van y", nooit lege
 * balken naast gevulde (verbod: gap-display als default-toestand). Wat gedekt
 * is wordt bevestigd; hooguit één open vorm wordt genoemd, als kans.
 */
export function buildWeekFocusSentence(
  chips: readonly WeekRhythmChip[],
  startPattern: WeekCategory | null,
): string {
  if (chips.length === 0) {
    return "Nog niets deze week — je eerste moment telt al mee.";
  }
  if (chips.length === 1 && chips[0].tag === "herstel") {
    return "Vooral herstel deze week — dat is óók bouwen.";
  }

  const coveredLabels = chips.map((chip) => chip.label);
  const coveredSentence =
    coveredLabels.length === 1
      ? `${coveredLabels[0]} staat deze week.`
      : `${coveredLabels.slice(0, -1).join(", ")} en ${coveredLabels[coveredLabels.length - 1]} staan deze week.`;

  const opportunityTag: WeekRhythmTag | null =
    startPattern === "kracht" || startPattern === "conditie" ? startPattern : null;
  const opportunityCovered =
    opportunityTag == null || chips.some((chip) => chip.tag === opportunityTag);

  if (opportunityTag && !opportunityCovered) {
    return `${coveredSentence} ${MODALITY_LABELS[opportunityTag]} is nu je grootste winst — één sessie is genoeg.`;
  }

  return coveredSentence;
}
