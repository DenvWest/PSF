/**
 * Deterministische PAL-afleiding (Physical Activity Level) voor de beweging-meting.
 *
 * Regels:
 * - Pure functie, geen I/O, geen randomness.
 * - Raakt movement_score NIET aan — PAL is een aparte, additieve afgeleide
 *   (plan §A5: geen regressie op domeinscores/profiellabels/triggers).
 * - Combineert trainingsbelasting (MOV_STR/MOV_CARD, bestaand) met dagelijkse
 *   werk-/leefactiviteit (workActivity, optioneel tot de capture-bedrading).
 * - Geen input → veilige ondergrens (sedentary), nooit alarmerend.
 *
 * Zie PLAN_MEASUREMENT_PERSONALIZATION §A1.
 */

import { PAL_BANDS, type PalBandId } from "@/data/movement/pal-reference";

/** Semver van de PAL-regels — voor latere opslag naast een check-in. */
export const PAL_VERSION = "1.0.0";

/**
 * Activiteits-inputs op de bestaande 1–4 schaal (hoger = meer activiteit).
 * MOV_STR/MOV_CARD komen uit de beweeg-capture; workActivity is de nieuwe
 * werk-/dagactiviteitsvraag (nog niet gevraagd in deze stap — de kern is er klaar voor).
 */
export interface MovementPalReport {
  MOV_STR?: number;
  MOV_CARD?: number;
  workActivity?: number;
}

export interface PalEstimate {
  /** PAL-multiplier (1.4–2.0). */
  pal: number;
  band: PalBandId;
  label: string;
}

/** Normaliseer een 1–4 antwoord; ongeldig/afwezig → undefined. */
function toLevel(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value)) {
    return undefined;
  }
  return Math.min(4, Math.max(1, Math.round(value)));
}

function toEstimate(index: number): PalEstimate {
  const band = PAL_BANDS[index];
  return { pal: band.pal, band: band.id, label: band.label };
}

/**
 * Leid een PAL-band af uit trainings- en werk-/dagactiviteit.
 *
 * - Trainingsbelasting = max(MOV_STR, MOV_CARD) — sluit aan op getMovementLoad in de engine.
 * - Piek = hoogste van training en werk; bepaalt de basisband.
 * - "Zeer actief" (2.0) vereist BEIDE dimensies hoog (≥3): regelmatig sport én fysiek werk —
 *   precies het onderscheid dat movement_score (alleen training) mist.
 */
export function derivePAL(report: MovementPalReport): PalEstimate {
  const str = toLevel(report.MOV_STR);
  const card = toLevel(report.MOV_CARD);
  const work = toLevel(report.workActivity);

  const trainingValues = [str, card].filter(
    (v): v is number => v !== undefined,
  );
  const trainingLoad =
    trainingValues.length > 0 ? Math.max(...trainingValues) : undefined;

  const candidates = [trainingLoad, work].filter(
    (v): v is number => v !== undefined,
  );
  if (candidates.length === 0) {
    return toEstimate(0); // geen data → veilige ondergrens (sedentary)
  }
  const peak = Math.max(...candidates);

  const bothHigh =
    trainingLoad !== undefined &&
    work !== undefined &&
    trainingLoad >= 3 &&
    work >= 3;

  let index: number;
  if (bothHigh) {
    index = 3; // very_active
  } else if (peak >= 3) {
    index = 2; // active
  } else if (peak === 2) {
    index = 1; // light
  } else {
    index = 0; // sedentary
  }

  return toEstimate(index);
}
