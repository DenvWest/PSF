import { isUsableFirstName } from "@/lib/intake-greetings";
import { getVitalityBand, getVitalityBandMessage } from "@/lib/vitality-gauge";

export const VITALITY_SCORE_EYEBROW = "Jouw vitaalscore";

export function getVitalityScoreHeading(
  firstName: string | null | undefined,
  locked: boolean,
): string {
  if (locked) {
    return "Weet precies waar je staat.";
  }
  if (isUsableFirstName(firstName)) {
    return `${firstName!.trim()}, zo sterk is je basis vandaag.`;
  }
  return "Zo sterk is je basis vandaag.";
}

export function getVitalityScoreBody(
  locked: boolean,
  vitality?: number,
  explainerLine?: string | null,
): string {
  if (locked) {
    return "Slaap, stress, voeding, beweging en herstel — samengebracht in één score. Zie waar je lekt, en waar je het snelst winst pakt.";
  }
  if (explainerLine?.trim()) {
    return explainerLine.trim();
  }
  if (vitality != null) {
    return getVitalityBandMessage(vitality, "Je vitaliteit");
  }
  return "Geen diagnose — wel een helder vertrekpunt. Elke check maakt je beeld scherper.";
}

export function getVitalityScoreBandHint(vitality: number): string | null {
  const band = getVitalityBand(vitality);
  switch (band.id) {
    case "optimaal":
      return "Je zit in de groene zone. Houd vast wat werkt.";
    case "sterk":
      return "Sterke basis — een paar gewoontes tillen je naar topniveau.";
    case "goed":
      return "Op peil, met duidelijke ruimte om te groeien.";
    case "op_gang":
      return "Hier ligt je snelste winst — kleine stappen, groot effect.";
    case "uit_balans":
    default:
      return "Je zwaarste hefboom is nu het duidelijkst — begin daar.";
  }
}

export const VITALITY_SCORE_CTA = "Doe de check";

export const VITALITY_RHYTHM_EYEBROW = "Jouw ritme";

export const VITALITY_RHYTHM_CURRENT = "Huidige reeks";

export const VITALITY_RHYTHM_BEST = "Langste reeks";

export function formatRhythmDays(days: number): string {
  if (days === 1) {
    return "1 dag";
  }
  return `${days} dagen`;
}
