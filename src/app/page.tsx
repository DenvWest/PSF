import type { Metadata } from "next";
import Hero from "@/components/homepage/Hero";
import { canonicalMetadata } from "@/lib/seo/canonical";
import { absoluteUrl } from "@/lib/public-site-url";
import HomeTrustSection from "@/components/homepage/HomeTrustSection";
import LifestyleCheckSection from "@/components/homepage/LifestyleCheckSection";
import HomeGuidesPromoSection from "@/components/homepage/HomeGuidesPromoSection";
import HomeTier1Pillars from "@/components/homepage/HomeTier1Pillars";
import HomeProfileStrip from "@/components/homepage/HomeProfileStrip";
import FloatingLeefstijlcheckCta from "@/components/ui/FloatingLeefstijlcheckCta";
import "./homepage.css";

const HOME_TITLE = "Minder energie na 40? Gratis Leefstijlcheck | PerfectSupplement";
const HOME_DESCRIPTION =
  "In 3 minuten inzicht in slaap, stress, energie en herstel — zonder diagnose. Gratis, anoniem en onafhankelijk. Geen sponsors, geen verkooppraat.";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  ...canonicalMetadata("/"),
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: absoluteUrl("/"),
    type: "website",
    siteName: "PerfectSupplement",
    locale: "nl_NL",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "PerfectSupplement",
      description: HOME_DESCRIPTION,
      url: absoluteUrl("/"),
      inLanguage: "nl-NL",
    },
    {
      "@type": "Organization",
      name: "PerfectSupplement",
      url: absoluteUrl("/"),
      description: HOME_DESCRIPTION,
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <div className="home">
        <Hero />
        <HomeTrustSection />
        <HomeTier1Pillars />
        <LifestyleCheckSection />
        <HomeGuidesPromoSection />
        <HomeProfileStrip />
        <FloatingLeefstijlcheckCta />
      </div>
    </>
  );
}
