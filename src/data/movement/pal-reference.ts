/**
 * Referentietabel voor de PAL-afleiding (Physical Activity Level).
 * Meet-fundament — geen persoonsdata. De enige plek met PAL-multipliers;
 * hardcode deze NIET in de engine of de beweeg-capture.
 *
 * PAL-multipliers en drempels zijn INDICATIEF (bron: FAO/WHO/UNU 2001).
 * TODO review met cijferbron vóór gebruik in een energiebehoefte (TDEE).
 *
 * Brug naar de voedingslaag: TDEE = BMR × PAL (PLAN_MEASUREMENT_PERSONALIZATION §A2).
 * Deze datafile levert de PAL-helft; BMR/gewicht/lengte horen hier bewust nog niet.
 */

export type PalBandId = "sedentary" | "light" | "active" | "very_active";

export interface PalBand {
  id: PalBandId;
  /** PAL-multiplier (indicatief, FAO/WHO/UNU). */
  pal: number;
  /** Nederlandse gebruikerslabel. */
  label: string;
  /** Herkenbare omschrijving — geen statuswoorden. */
  description: string;
}

/** Oplopend van minst naar meest actief; volgorde = bandindex in derivePAL. */
export const PAL_BANDS: readonly PalBand[] = [
  {
    id: "sedentary",
    pal: 1.4,
    label: "Vooral zittend",
    description: "Zittend werk en weinig beweging buiten sport om.",
  },
  {
    id: "light",
    pal: 1.6,
    label: "Licht actief",
    description: "Staand werk óf 1–2× sport per week.",
  },
  {
    id: "active",
    pal: 1.8,
    label: "Actief",
    description: "Fysiek werk óf 3–4× sport per week.",
  },
  {
    id: "very_active",
    pal: 2.0,
    label: "Zeer actief",
    description: "Zwaar fysiek werk én regelmatig sport.",
  },
] as const;
