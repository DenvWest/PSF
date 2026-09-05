/**
 * Kwantitatieve eiwitrichtlijn (g/dag) op basis van gewicht en trainingsbelasting.
 *
 * - Eiwit schaalt met lichaamsgewicht (g/kg); trainings-/krachtbelasting moduleert
 *   de factor (spieronderhoud/opbouw, 30+). Leeftijd moduleert sinds 1 september
 *   mee, maar alleen op de bovenste band — zie {@link ageFloor}.
 * - Output is een RANGE — geen schijnprecisie, en een inname-richtlijn, nooit een
 *   status. Pure functie, geen I/O.
 *
 * Factor-grenzen volgen PROT-AGE Study Group (2013) en ESPEN (2014):
 * 1.0–1.2 g/kg basis (geen training), 1.2–1.6 g/kg bij training
 * (PKN Vol.2 ch.5/6). Geen medisch advies, een richtlijn.
 */

export const PROTEIN_TARGET_VERSION = "1.1.0";

const MIN_WEIGHT_KG = 40;
const MAX_WEIGHT_KG = 250;

export interface ProteinTargetInput {
  weightKg: number;
  /** Trainings-/krachtbelasting 1–4 (max van MOV_STR/MOV_CARD). Afwezig → basis 30+. */
  trainingLoad?: number;
  /**
   * De leeftijdsband uit de check. Alleen `"55+"` verandert iets; zie
   * {@link ageFloor} voor waarom de andere drie banden niets doen.
   */
  ageRange?: string;
}

export interface ProteinTarget {
  perKgLow: number;
  perKgHigh: number;
  gramsLow: number;
  gramsHigh: number;
}

/**
 * Wat de advies-copy nodig heeft — nooit perKg, nooit gewicht.
 * DashboardData draagt alleen deze range naar de client, niet de volle
 * ProteinTarget (die intern g/kg-factoren bevat, hier niet relevant).
 */
export type ProteinTargetRange = Pick<ProteinTarget, "gramsLow" | "gramsHigh">;

/**
 * De ondergrens die leeftijd afdwingt, of `null` als leeftijd hier niets zegt.
 *
 * ## Waarom alleen 55+, en waarom alleen de ondergrens
 *
 * PROT-AGE (2013) en ESPEN (2014) adviseren voor gezonde ouderen minimaal
 * 1,0–1,2 g/kg per dag, oplopend bij training en ziekte. De scherpe knik in
 * die literatuur ligt rond 65 — en bij sarcopenie en ziekte, niet bij een
 * verjaardag. Onze check meet alleen 40–44 / 45–49 / 50–54 / 55+, en die
 * bovenste band is open: hij bevat zowel een 56-jarige als iemand van 70.
 *
 * Wat we daaruit wél mogen afleiden is een **ondergrens**, geen nieuwe curve.
 * Voor wie in die open band valt is 1,0 g/kg de onderkant van wat beide
 * bronnen verdedigen; 1,2 is dat onbetwist. Daarom tilt 55+ alleen de vloer
 * op, en raakt het de bovengrens niet — die wordt al door training bepaald, en
 * twee factoren die dezelfde grens omhoog duwen zou dubbeltellen zijn.
 *
 * De drie banden eronder doen niets. Niet uit voorzichtigheid maar omdat er
 * geen bron is die binnen 40–54 een grens legt: daar zou een getal verzonnen
 * zijn, en dat is precies wat de discipline in `nutrient-personalization.ts`
 * verbiedt.
 */
function ageFloor(ageRange: string | undefined): number | null {
  return ageRange === "55+" ? 1.2 : null;
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
  const { weightKg, trainingLoad, ageRange } = input;
  if (
    !Number.isFinite(weightKg) ||
    weightKg < MIN_WEIGHT_KG ||
    weightKg > MAX_WEIGHT_KG
  ) {
    return null;
  }

  const { low, high } = factorRange(trainingLoad);
  // Leeftijd tilt de vloer op, nooit het plafond, en nooit onder wat training
  // al vroeg: `Math.max` en niet vervangen, zodat een 55-plusser die zwaar
  // traint zijn hogere ondergrens houdt.
  const floor = ageFloor(ageRange);
  const effectiveLow = floor === null ? low : Math.max(low, floor);
  return {
    perKgLow: effectiveLow,
    perKgHigh: high,
    gramsLow: round5(weightKg * effectiveLow),
    gramsHigh: round5(weightKg * high),
  };
}
