import { GUIDE_DATA } from "@/data/gids";
import { getPillarById } from "@/data/foundation-pyramid";
import type { MeasuredPillarId } from "@/lib/primary-theme";
import type { GuideThema } from "@/types/guide-opt-in";

/** Pijlers met een PDF-gids; ontbrekende keys → fallback naar pijler-link-CTA. */
const PILLAR_TO_GUIDE_THEMA: Partial<Record<MeasuredPillarId, GuideThema>> = {
  sleep: "slaap",
  stress: "stress",
};

export type IntakeGuideCta = {
  thema: GuideThema;
  pillarLabel: string;
  pdfPath: string;
  successMessage: string;
  ctaLabel: string;
};

function guideHasPdf(thema: GuideThema): boolean {
  return GUIDE_DATA[thema].pdfPath !== null;
}

export function getIntakeGuideCta(pillar: MeasuredPillarId): IntakeGuideCta | null {
  const thema = PILLAR_TO_GUIDE_THEMA[pillar];
  if (!thema || !guideHasPdf(thema)) {
    return null;
  }

  const guide = GUIDE_DATA[thema];
  const pdfPath = guide.pdfPath;
  if (!pdfPath) {
    return null;
  }

  const pillarLabel = getPillarById(pillar)?.label ?? pillar;

  return {
    thema,
    pillarLabel,
    pdfPath,
    successMessage: guide.optIn.successMessage,
    ctaLabel: `Download je gratis ${pillarLabel}-gids`,
  };
}
