import type { IntakeBand } from "@/lib/nutrition-intake-estimate";
import { getVitalityBand } from "@/lib/vitality-gauge";

/** Vulpercentage voor frequentie-balk — geen grammen, band t.o.v. vuistregel. */
export function bandToFillPercent(band: IntakeBand): 35 | 68 | 100 {
  switch (band) {
    case "below":
      return 35;
    case "around":
      return 68;
    case "meets":
      return 100;
  }
}

/** Balkkleur — aligned met dashboard SNAPSHOT_BAND_COLOR. */
export function bandToBarColor(band: IntakeBand): string {
  switch (band) {
    case "below":
      return "#B45309";
    case "around":
      return "#a8a29e";
    case "meets":
      return "#5A8F6A";
  }
}

/** Korte voedingsscore-kop — geen vitaliteit-terminologie. */
export function nutritionScoreHeadline(score: number): string {
  const band = getVitalityBand(score);
  switch (band.id) {
    case "uit_balans":
      return "Veel winst op je eetfrequentie";
    case "op_gang":
      return "Je frequentie is op gang";
    case "goed":
      return "Je frequentie zit goed";
    case "sterk":
      return "Je frequentie is sterk";
    case "optimaal":
      return "Je frequentie is optimaal";
  }
}

/** Score → enkele boogkleur (geen 5-segment vitaliteitsschaal). */
export function nutritionScoreArcColor(score: number): string {
  return getVitalityBand(score).color;
}
