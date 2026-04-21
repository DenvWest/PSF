export interface ThemaPageData {
  slug: string;
  title: string;
  heroTitle: string;
  heroSubtitle: string;
  heroLabel: string;

  recognition: {
    sectionLabel: string;
    title: string;
    quotes: string[];
  };

  causes: {
    sectionLabel: string;
    title: string;
    intro: string;
    items: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };

  quickWins: {
    sectionLabel: string;
    title: string;
    items: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };

  supplements: {
    sectionLabel: string;
    title: string;
    intro: string;
    items: Array<{
      name: string;
      reason: string;
      guideLink: string;
      comparisonLink: string;
      icon: string;
    }>;
  };

  emailGate: {
    sectionLabel: string;
    title: string;
    subtitle: string;
    bulletPoints: string[];
    ctaText: string;
    privacyText: string;
    successMessage: string;
  };

  expertQuote: {
    quote: string;
    author: string;
    credential: string;
  };

  premiumCta: {
    sectionLabel: string;
    title: string;
    subtitle: string;
    features: string[];
    ctaText: string;
    ctaLink: string;
    note: string;
  };

  relatedArticles: Array<{
    title: string;
    slug: string;
    category: string;
  }>;

  seo: {
    title: string;
    description: string;
    canonical: string;
  };
}
