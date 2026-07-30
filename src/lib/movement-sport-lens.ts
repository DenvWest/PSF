import { MOVEMENT_FORMS, type MovementFormId } from "@/data/movement/movement-forms";
import {
  getSportCatalogEntry,
  mergeSportCoverage,
  type SportCatalogEntry,
} from "@/data/movement/sport-catalog";

export type MovementSportLensResult = {
  headline: string;
  note: string | null;
  missingForms: MovementFormId[];
  coverage: Record<MovementFormId, "dekt" | "deels" | "niet">;
};

export function buildMovementSportLens(sportIds: readonly string[]): MovementSportLensResult {
  const coverage = mergeSportCoverage(sportIds);
  const missingForms = MOVEMENT_FORMS.filter(
    (form) => coverage[form.id] === "niet",
  ).map((form) => form.id);

  if (sportIds.length === 0) {
    return {
      headline:
        "Kies één of meer sporten — dan lees je wat je al afdekt en wat je plan aanvult.",
      note: "Sport stuurt alleen de uitleg. Je programma blijft kracht, duurbasis of ritme.",
      missingForms: MOVEMENT_FORMS.map((form) => form.id),
      coverage,
    };
  }

  const entries = sportIds
    .map((id) => getSportCatalogEntry(id))
    .filter((entry): entry is SportCatalogEntry => entry != null);

  if (entries.length === 1) {
    const entry = entries[0];
    return {
      headline: `${entry.label} ${entry.recommendation}.`,
      note: "Sport stuurt alleen de uitleg. Je programma blijft ongewijzigd.",
      missingForms,
      coverage,
    };
  }

  const labels = entries.map((entry) => entry.label);
  const coveredLabels = MOVEMENT_FORMS.filter(
    (form) => coverage[form.id] === "dekt" || coverage[form.id] === "deels",
  ).map((form) => form.label.toLowerCase());

  const headline =
    missingForms.length === 0
      ? `Samen dekken ${labels.join(" en ")} alle vijf bouwstenen op dosis.`
      : coveredLabels.length > 0
        ? `${labels.join(" en ")} raken samen ${coveredLabels.slice(0, 2).join(" en ")} — het plan vult de rest aan.`
        : `${labels.join(" en ")} vullen elkaar aan; je plan blijft leidend voor wat je mist.`;

  const gapSentences = MOVEMENT_FORMS.filter((form) => coverage[form.id] === "niet")
    .slice(0, 2)
    .map((form) => form.gapCopy);

  return {
    headline,
    note:
      gapSentences.length > 0
        ? `Wat er niet in zit: ${gapSentences.join("; ")}.`
        : "Sport stuurt alleen de uitleg. Je programma blijft ongewijzigd.",
    missingForms,
    coverage,
  };
}
