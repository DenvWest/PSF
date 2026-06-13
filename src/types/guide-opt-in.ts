export const GUIDE_THEMAS = [
  "slaap",
  "stress",
  "energie",
  "herstel",
  "testosteron",
  "voeding",
  "beweging",
] as const;

export type GuideThema = (typeof GUIDE_THEMAS)[number];

export interface GuideOptInData {
  slug: GuideThema;
  guideName: string;
  seo: {
    title: string;
    description: string;
    canonical: string;
  };
  heroLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  recognition: {
    sectionLabel: string;
    title: string;
    quotes: string[];
  };
  optIn: {
    sectionLabel: string;
    title: string;
    subtitle: string;
    bulletPoints: string[];
    ctaText: string;
    successMessage: string;
  };
  /** PDF in public/downloads; null = pillar-link in dag-0 mail */
  pdfPath: string | null;
  pillarHref: string;
}
