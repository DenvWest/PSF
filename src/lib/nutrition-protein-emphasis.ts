/**
 * Kwalitatieve eiwit-nadruk op basis van het activiteitsniveau (PAL).
 *
 * Verzilvert de PAL-kern: bij een actief leefpatroon ligt de eiwitbehoefte hoger
 * (spieronderhoud/herstel, 40+). Dit is een nuance op het eiwit-advies —
 * KWALITATIEF, nooit een g/kg-getal (dat vereist gewicht) en nooit een status
 * ("tekort"). Blijft binnen de inname-vs-status-grens (COMPLIANCE.md).
 *
 * Pure functie, geen I/O. Wordt later bedraad in het eiwit-advies (vervangt de
 * inline MOV-check in IntakeResults.tsx).
 */

import type { PalBandId } from "@/data/movement/pal-reference";
import { derivePAL, type MovementPalReport } from "@/lib/movement-pal";
import type { IntakeBand } from "@/lib/nutrition-intake-estimate";

export type ProteinEmphasisLevel = "standard" | "elevated";

export interface ProteinEmphasis {
  level: ProteinEmphasisLevel;
  /** Kwalitatieve nuance-zin; null bij "standard" (geen ophoging). */
  note: string | null;
}

/** Actief genoeg om de eiwitbehoefte op te tillen (uit pal-reference). */
const ELEVATED_PAL_BANDS: ReadonlySet<PalBandId> = new Set([
  "active",
  "very_active",
]);

/**
 * Kern: bepaalt de eiwit-nadruk uit een PAL-band, met optioneel de eiwit-band
 * (uit de voedings-inschatting) voor de toon.
 * - Lage activiteit → "standard" (geen ophoging).
 * - Actief + eiwit-gap → scherpere nudge.
 * - Actief zonder gap → bevestigende nudge.
 */
export function proteinEmphasisForPalBand(
  band: PalBandId,
  proteinBand?: IntakeBand,
): ProteinEmphasis {
  if (!ELEVATED_PAL_BANDS.has(band)) {
    return { level: "standard", note: null };
  }

  const note =
    proteinBand === "below"
      ? "Je beweegt stevig én je eiwit blijft nu achter — juist dan helpt een eiwitbron bij élke maaltijd."
      : "Je beweegt stevig, dus je eiwitbehoefte ligt aan de hogere kant — houd een eiwitbron bij elke maaltijd vast.";

  return { level: "elevated", note };
}

/** Gemak: leidt PAL af uit de bewegingsantwoorden en bepaalt de nadruk. */
export function getProteinEmphasis(
  report: MovementPalReport,
  proteinBand?: IntakeBand,
): ProteinEmphasis {
  return proteinEmphasisForPalBand(derivePAL(report).band, proteinBand);
}
