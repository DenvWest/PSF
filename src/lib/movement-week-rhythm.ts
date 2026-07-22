import { movementPlanTemplate } from "@/data/lifestyle-plans/movement";

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
