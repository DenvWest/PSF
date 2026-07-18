import type { PalBandId } from "@/data/movement/pal-reference";

/** Stable ids — aligned with ARCHITECTUUR_LIFESTYLE_PLANNER §14.2. */
export type MovementSnackId =
  | "mov-snack-walk-3"
  | "mov-snack-stairs"
  | "mov-snack-stand"
  | "mov-snack-squats"
  | "mov-snack-shoulders"
  | "mov-snack-mobility";

export type MovementSnackDefinition = {
  id: MovementSnackId;
  label: string;
  durationMin: number;
  /** Tags for personalization: kracht, conditie, bureau. */
  tags: readonly ("kracht" | "conditie" | "bureau")[];
};

export const MOVEMENT_SNACK_CATALOG: readonly MovementSnackDefinition[] = [
  {
    id: "mov-snack-squats",
    label: "10 squats",
    durationMin: 2,
    tags: ["kracht", "bureau"],
  },
  {
    id: "mov-snack-stairs",
    label: "Eén verdieping traplopen",
    durationMin: 2,
    tags: ["conditie", "kracht"],
  },
  {
    id: "mov-snack-walk-3",
    label: "3 minuten wandelen",
    durationMin: 3,
    tags: ["conditie"],
  },
  {
    id: "mov-snack-shoulders",
    label: "Schouder- en nekrekken",
    durationMin: 2,
    tags: ["bureau", "kracht"],
  },
  {
    id: "mov-snack-stand",
    label: "1 minuut staan en rekken",
    durationMin: 1,
    tags: ["bureau"],
  },
  {
    id: "mov-snack-mobility",
    label: "Korte mobiliteitsoefening",
    durationMin: 3,
    tags: ["kracht", "conditie"],
  },
] as const;

export type StepsTargetBand = {
  band: PalBandId;
  targetSteps: number;
  label: string;
  hint: string;
};

/** Haalbare richting — geen diagnose of harde WHO-norm. */
export const STEPS_TARGET_BY_PAL: readonly StepsTargetBand[] = [
  {
    band: "sedentary",
    targetSteps: 7000,
    label: "~7.000 stappen per dag",
    hint: "Haalbare richting als je vooral zittend werkt — geen wedstrijd.",
  },
  {
    band: "light",
    targetSteps: 8000,
    label: "~8.000 stappen per dag",
    hint: "Iets meer dagelijkse beweging boven je huidige ritme.",
  },
  {
    band: "active",
    targetSteps: 8500,
    label: "~8.500 stappen per dag",
    hint: "Onderhoud je niveau — focus op consistentie.",
  },
  {
    band: "very_active",
    targetSteps: 9000,
    label: "~9.000+ stappen per dag",
    hint: "Je beweegt al veel — houd vooral je herstel scherp.",
  },
] as const;

export const DAILY_RHYTHM_EVIDENCE_HREF = "/onderbouwing#MOV_SED";

export const DAILY_RHYTHM_SNACK_HEADLINE =
  "Doorbreek zitten elke 20–30 min — 2–3 min kracht of conditie";

export const DAILY_RHYTHM_STEPS_HEADLINE =
  "Meer stappen per dag — haalbare richting, geen wedstrijd";
