import { GUIDE_DATA } from "@/data/gids";
import { getPillarById } from "@/data/foundation-pyramid";
import type { MeasuredPillarId } from "@/lib/primary-theme";
import type { GuideThema } from "@/types/guide-opt-in";

/** Pijlers met een gids-opt-in; ontbrekende keys → fallback naar pijler-link-CTA. */
const PILLAR_TO_GUIDE_THEMA: Partial<Record<MeasuredPillarId, GuideThema>> = {
  sleep: "slaap",
  stress: "stress",
  nutrition: "voeding",
  movement: "beweging",
};

export type IntakeGuideCta = {
  thema: GuideThema;
  pillarLabel: string;
  pdfPath: string | null;
  successMessage: string;
  ctaLabel: string;
};

export function getIntakeGuideCta(pillar: MeasuredPillarId): IntakeGuideCta | null {
  const thema = PILLAR_TO_GUIDE_THEMA[pillar];
  if (!thema) {
    return null;
  }

  const guide = GUIDE_DATA[thema];
  const pillarLabel = getPillarById(pillar)?.label ?? pillar;
  const hasPdf = guide.pdfPath !== null;

  return {
    thema,
    pillarLabel,
    pdfPath: guide.pdfPath,
    successMessage: guide.optIn.successMessage,
    ctaLabel: hasPdf
      ? `Download je gratis ${pillarLabel}-gids`
      : `Ontvang je gratis ${pillarLabel.toLowerCase()}-stappenplan`,
  };
}
