/**
 * Herkenningscopy voor het pijn-waypoint — geen diagnose, wel concreet genoeg
 * om te herkennen wat iemand wil maar nog niet lukt.
 */

const DEFAULT_CAPABILITY =
  "De trap op zonder aan de leuning — dat is wat je anker beschrijft, en waar je plan naartoe werkt.";

export function buildMovementCapabilityStatement(input: {
  anchorLabel: string | null;
  movStr: number | undefined;
}): string {
  if (input.anchorLabel) {
    return `Je doel gaat over: ${input.anchorLabel.toLowerCase()}. Dat lukt nog niet overal — en dat hoeft ook niet vandaag.`;
  }

  if (input.movStr != null && input.movStr <= 2) {
    return "Lang staan of traplopen kost meer dan je zou willen — herkenbaar, en precies waar je plan op inspeelt.";
  }

  return DEFAULT_CAPABILITY;
}

export function buildMovementGoalProgress(input: {
  baselineScore: number | null;
  currentScore: number;
  remeasureDays: number | null;
  anchorLabel: string | null;
}): string {
  if (input.baselineScore == null) {
    return "Na je eerste hermeting lees je hier je richting — geen norm, wel beweging.";
  }

  const direction = `Op weg: ${input.currentScore}/100`;
  const remeasure =
    input.remeasureDays != null && input.remeasureDays > 0
      ? `Hermeting over ${input.remeasureDays} dagen`
      : null;
  const anchor = input.anchorLabel
    ? ` — richting ${input.anchorLabel.toLowerCase()}`
    : "";

  return [direction, remeasure].filter(Boolean).join(". ") + anchor + ".";
}
