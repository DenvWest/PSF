/**
 * Kwantitatieve eiwitrichtlijn (g/dag) op basis van gewicht en trainingsbelasting.
 *
 * - Eiwit schaalt met lichaamsgewicht (g/kg); trainings-/krachtbelasting moduleert
 *   de factor (spieronderhoud/opbouw, 40+). Leeftijd binnen 40+ is secundair en
 *   bewust nog niet meegenomen (TODO: verfijning met cijferbron).
 * - Output is een RANGE — geen schijnprecisie, en een inname-richtlijn, nooit een
 *   status. Pure functie, geen I/O.
 *
 * Factor-grenzen volgen PROT-AGE Study Group (2013) en ESPEN (2014):
 * 1.0–1.2 g/kg basis (geen training), 1.2–1.6 g/kg bij training
 * (PKN Vol.2 ch.5/6). Geen medisch advies, een richtlijn.
 */

export const PROTEIN_TARGET_VERSION = "1.0.0";

const MIN_WEIGHT_KG = 40;
const MAX_WEIGHT_KG = 250;

export interface ProteinTargetInput {
  weightKg: number;
  /** Trainings-/krachtbelasting 1–4 (max van MOV_STR/MOV_CARD). Afwezig → basis 40+. */
  trainingLoad?: number;
}

export interface ProteinTarget {
  perKgLow: number;
  perKgHigh: number;
  gramsLow: number;
  gramsHigh: number;
}

/** g/kg-range per trainingsbelasting (PROT-AGE/ESPEN/PKN, zie bestandscomment). */
function factorRange(trainingLoad: number | undefined): {
  low: number;
  high: number;
} {
  const load =
    trainingLoad !== undefined && Number.isFinite(trainingLoad)
      ? Math.min(4, Math.max(1, Math.round(trainingLoad)))
      : 1;
  if (load >= 4) return { low: 1.6, high: 1.8 };
  if (load === 3) return { low: 1.4, high: 1.6 };
  if (load === 2) return { low: 1.2, high: 1.4 };
  return { low: 1.0, high: 1.2 };
}

/** Afronden op 5 g voor een leesbare, niet-schijnprecieze richtlijn. */
function round5(value: number): number {
  return Math.round(value / 5) * 5;
}

/**
 * Bereken de eiwit-range. Ongeldig gewicht (buiten 40–250 kg of niet-eindig) → null,
 * zodat de caller niets toont in plaats van een onzin-richtlijn.
 */
export function computeProteinTarget(
  input: ProteinTargetInput,
): ProteinTarget | null {
  const { weightKg, trainingLoad } = input;
  if (
    !Number.isFinite(weightKg) ||
    weightKg < MIN_WEIGHT_KG ||
    weightKg > MAX_WEIGHT_KG
  ) {
    return null;
  }

  const { low, high } = factorRange(trainingLoad);
  return {
    perKgLow: low,
    perKgHigh: high,
    gramsLow: round5(weightKg * low),
    gramsHigh: round5(weightKg * high),
  };
}
