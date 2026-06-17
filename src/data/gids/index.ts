import type { GuideOptInData, GuideThema } from "@/types/guide-opt-in";
import { slaapGuide } from "@/data/gids/slaap";
import { stressGuide } from "@/data/gids/stress";
import { energieGuide } from "@/data/gids/energie";
import { herstelGuide } from "@/data/gids/herstel";
import { testosteronGuide } from "@/data/gids/testosteron";
import { voedingGuide } from "@/data/gids/voeding";
import { bewegingGuide } from "@/data/gids/beweging";

export const GUIDE_DATA: Record<GuideThema, GuideOptInData> = {
  slaap: slaapGuide,
  stress: stressGuide,
  energie: energieGuide,
  herstel: herstelGuide,
  testosteron: testosteronGuide,
  voeding: voedingGuide,
  beweging: bewegingGuide,
};

export const GUIDE_SLUGS = Object.keys(GUIDE_DATA) as GuideThema[];

export type GuideDeliveryStatus = "pdf" | "email_sequence" | "coming_soon";

export function getGuideDeliveryStatus(slug: GuideThema): GuideDeliveryStatus {
  if (GUIDE_DATA[slug].pdfPath) return "pdf";
  if (slug === "voeding" || slug === "beweging") return "email_sequence";
  return "coming_soon";
}

export const THEMA_GUIDE_SLUGS = GUIDE_SLUGS.filter(
  (slug) => slug !== "voeding" && slug !== "beweging",
);

export function getGuideData(slug: string): GuideOptInData | undefined {
  return GUIDE_DATA[slug as GuideThema];
}

export function guideSourceForThema(thema: GuideThema): string {
  return `guide_${thema}`;
}

export function isGuideThema(value: string): value is GuideThema {
  return value in GUIDE_DATA;
}
