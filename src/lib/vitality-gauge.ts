import type { CheckScores, PillarId } from "@/types/dashboard";

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
  { id: "uit_balans", label: "Uit balans", min: 0, color: "#C24B4B" },
  { id: "op_gang", label: "Op gang", min: 35, color: "#D4824A" },
  { id: "goed", label: "Goed", min: 55, color: "#C4A035" },
  { id: "sterk", label: "Sterk", min: 70, color: "#5FA872" },
  { id: "optimaal", label: "Optimaal", min: 85, color: "#3D8B5A" },
];

/** Booglabels voor de hero-gauge — gelijk aan bandlabels, uppercase via SVG. */
export const VITALITY_BAND_ARC_LABELS: Record<VitalityBandId, string> = {
  uit_balans: "Uit balans",
  op_gang: "Op gang",
  goed: "Goed",
  sterk: "Sterk",
  optimaal: "Optimaal",
};

export const VITALITY_SCORE_MAX = 100;

export const VITALITY_ON_PEIL_MIN =
  VITALITY_BANDS.find((band) => band.id === "goed")?.min ?? 55;

/** Pijlers die meetellen in computeVitaliteit — energie valt buiten de index. */
export const VITALITY_FACET_PILLAR_IDS: readonly PillarId[] = [
  "slaap",
  "stress",
  "voeding",
  "beweging",
  "herstel",
];

export const VITALITY_FACET_COUNT = VITALITY_FACET_PILLAR_IDS.length;

export function countVitalityFacetsOnPeil(scores: CheckScores): number {
  return VITALITY_FACET_PILLAR_IDS.filter(
    (id) => scores[id] >= VITALITY_ON_PEIL_MIN,
  ).length;
}

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
