import { isUsableFirstName } from "@/lib/intake-greetings";
import type { DomainScores } from "@/lib/intake-engine";
import { buildHabitScoreKernel } from "@/lib/vitality-habit-kernel";
import { getVitalityBand, getVitalityBandMessage } from "@/lib/vitality-gauge";
import type { PillarId } from "@/types/dashboard";

export type VitalityScoreCardCopyInput = {
  firstName: string | null | undefined;
  vitality: number;
  priorityId: PillarId;
  priorityScore: number;
  answers: Record<string, number> | null;
  domainScores: DomainScores;
};

export type VitalityScoreCardCopy = {
  heading: string;
  body: string;
};

export function getVitalityScoreCardCopy(
  input: VitalityScoreCardCopyInput,
): VitalityScoreCardCopy {
  const bandLabel = getVitalityBand(input.vitality).label.toLowerCase();
  const heading = isUsableFirstName(input.firstName)
    ? `${input.firstName!.trim()}, je bent ${bandLabel}.`
    : `Je bent ${bandLabel}.`;

  const kernel = buildHabitScoreKernel({
    vitality: input.vitality,
    priorityId: input.priorityId,
    priorityScore: input.priorityScore,
    answers: input.answers,
    domainScores: input.domainScores,
  });

  const body = `${kernel.driverPillarLabel} is je prioriteit. ${kernel.driverHabitLine} ${kernel.nextBestHabit}`;

  return { heading, body };
}

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

export const VITALITY_INSIGHTS_CTA = "Bekijk je inzichten";

export const VITALITY_INSIGHTS_UPSELL_HEADING = "Wil je je vitaalscore verbeteren?";

export const VITALITY_INSIGHTS_UPSELL_BODY =
  "Ontdek eenvoudige stappen om gezonder te worden.";

export const VITALITY_INSIGHTS_UPSELL_CTA = "Vitaalscore verbeteren";

export const METINGEN_EYEBROW = "Metingen";

export const METINGEN_DOMAINS_LABEL = "Domeinen op peil";

export const METINGEN_DOMAINS_SHORT_LABEL = "Domeinen";

export const METINGEN_DOMAINS_HINT =
  "Interventiedomeinen in je vitaalscore (slaap, stress, voeding, beweging, herstel) met score 55 of hoger. Energie is een apart rapportdomein.";

export const METINGEN_RHYTHM_LABEL = "Check-reeks";

export const METINGEN_RHYTHM_SHORT_LABEL = "Reeks";

export const METINGEN_RHYTHM_HINT =
  "Opeenvolgende dagen waarop je de Leefstijlcheck deed — geen dagelijkse gewoonte-tracker.";

export const VITALITY_RHYTHM_EYEBROW = "Jouw ritme";

export const VITALITY_RHYTHM_CURRENT = "Huidige reeks";

export const VITALITY_RHYTHM_BEST = "Langste reeks";

export function formatRhythmDays(days: number): string {
  if (days === 1) {
    return "1 dag";
  }
  return `${days} dagen`;
}
