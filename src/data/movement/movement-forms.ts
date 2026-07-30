/** Beweegvormen — wat het stappenplan programmeert (niet wat sport copy kleurt). */

export type MovementFormId =
  | "kracht"
  | "duurbasis"
  | "ritme"
  | "mobiliteit"
  | "interval";

export type MovementFormCoverage = "dekt" | "deels" | "niet";

export type MovementForm = {
  id: MovementFormId;
  label: string;
  gapCopy: string;
};

export const MOVEMENT_FORMS: readonly MovementForm[] = [
  {
    id: "kracht",
    label: "Kracht",
    gapCopy: "je spieren en botten belasten",
  },
  {
    id: "duurbasis",
    label: "Duurbasis",
    gapCopy: "rustige duurinspanning waarin je nog kunt praten",
  },
  {
    id: "ritme",
    label: "Dagelijks ritme",
    gapCopy: "de uren dat je niet traint",
  },
  {
    id: "mobiliteit",
    label: "Beweeglijkheid",
    gapCopy: "je bewegingsbereik onderhouden",
  },
  {
    id: "interval",
    label: "Interval",
    gapCopy: "korte inspanning boven je comfortgrens",
  },
] as const;
