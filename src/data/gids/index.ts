import type { GuideOptInData, GuideThema } from "@/types/guide-opt-in";
import { slaapGuide } from "@/data/gids/slaap";
import { stressGuide } from "@/data/gids/stress";
import { energieGuide } from "@/data/gids/energie";
import { herstelGuide } from "@/data/gids/herstel";
import { testosteronGuide } from "@/data/gids/testosteron";

export const GUIDE_DATA: Record<GuideThema, GuideOptInData> = {
  slaap: slaapGuide,
  stress: stressGuide,
  energie: energieGuide,
  herstel: herstelGuide,
  testosteron: testosteronGuide,
};

export const GUIDE_SLUGS = Object.keys(GUIDE_DATA) as GuideThema[];

export function getGuideData(slug: string): GuideOptInData | undefined {
  return GUIDE_DATA[slug as GuideThema];
}

export function guideSourceForThema(thema: GuideThema): string {
  return `guide_${thema}`;
}

export function isGuideThema(value: string): value is GuideThema {
  return value in GUIDE_DATA;
}
