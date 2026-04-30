export interface RecognitionPoint {
  situation: string;
  emotion: string;
}

export interface StepCareItem {
  title: string;
  description: string;
  actionable: string;
  timeframe: string;
}

export interface StepCareLayer {
  id: string;
  title: string;
  subtitle: string;
  items: StepCareItem[];
}

export interface SupplementSuggestion {
  name: string;
  efsa_claim: string;
  why_this_profile: string;
  href: string;
  hasComparison: boolean;
}

export interface ProfilePageData {
  slug: string;
  label: string;

  seo: {
    title: string;
    description: string;
    canonical: string;
    targetKeyword: string;
  };

  hero: {
    headline: string;
    subline: string;
  };

  recognition: {
    intro: string;
    points: RecognitionPoint[];
    closer: string;
  };

  understanding: {
    title: string;
    paragraphs: string[];
  };

  stepCare: StepCareLayer[];

  supplements: SupplementSuggestion[];

  guidanceCta: {
    title: string;
    text: string;
  };

  relatedPillar: { href: string; turboSnippet: string } | null;

  relatedComparisons: { href: string; turboSnippet: string; linkText?: string }[];

  breadcrumbs: { name: string; href: string }[];
}
