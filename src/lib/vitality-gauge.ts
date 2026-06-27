/**
 * 5-banden vitaliteitsschaal voor de gauge-weergave (totaal + per categorie).
 *
 * Display-laag: vertaalt een 0–100 score naar een band met label + kleur, in de
 * geest van Lifesum's Life Score (Uit balans → Optimaal). Pure functies, geen I/O,
 * server- én client-bruikbaar. Geen medische claims — een reflectie van antwoorden.
 *
 * Voor de compliance-gevoelige intake-reveal blijft src/lib/score-display.ts (4-staps)
 * de bron; deze schaal is uitsluitend voor de dashboard-/check-gauge.
 */

export type VitalityBandId = "uit_balans" | "op_gang" | "goed" | "sterk" | "optimaal";

export interface VitalityBand {
  id: VitalityBandId;
  label: string;
  /** Ondergrens (inclusief) op de 0–100 schaal. */
  min: number;
  color: string;
}

export const VITALITY_BANDS: VitalityBand[] = [
  { id: "uit_balans", label: "Uit balans", min: 0, color: "#C2674B" },
  { id: "op_gang", label: "Op gang", min: 35, color: "#C8956C" },
  { id: "goed", label: "Goed", min: 55, color: "#B9A24E" },
  { id: "sterk", label: "Sterk", min: 70, color: "#6FA77E" },
  { id: "optimaal", label: "Optimaal", min: 85, color: "#5A8F6A" },
];

export function getVitalityBand(score: number): VitalityBand {
  const clamped = Number.isFinite(score) ? Math.min(100, Math.max(0, score)) : 0;
  let band = VITALITY_BANDS[0];
  for (const candidate of VITALITY_BANDS) {
    if (clamped >= candidate.min) {
      band = candidate;
    }
  }
  return band;
}

/** Korte, niet-diagnostische regel bij een band — optioneel met categorie-naam. */
export function getVitalityBandMessage(score: number, label = "Je vitaliteit"): string {
  const band = getVitalityBand(score);
  switch (band.id) {
    case "optimaal":
      return `${label} ligt op een sterk niveau — houd vast wat werkt.`;
    case "sterk":
      return `${label} is goed op weg — een paar gewoontes maken het verschil.`;
    case "goed":
      return `${label} is in balans, met ruimte om te groeien.`;
    case "op_gang":
      return `${label} komt op gang — hier valt de meeste winst te halen.`;
    case "uit_balans":
    default:
      return `${label} vraagt aandacht — kleine stappen tellen het zwaarst.`;
  }
}
