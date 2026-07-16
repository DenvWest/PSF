import type { Metadata } from "next";
import Hero from "@/components/homepage/Hero";
import { canonicalMetadata } from "@/lib/seo/canonical";
import { absoluteUrl } from "@/lib/public-site-url";
import HomeTrustSection from "@/components/homepage/HomeTrustSection";
import LifestyleCheckSection from "@/components/homepage/LifestyleCheckSection";
import HomeGuidesPromoSection from "@/components/homepage/HomeGuidesPromoSection";
import FloatingLeefstijlcheckCta from "@/components/ui/FloatingLeefstijlcheckCta";
import "./homepage.css";

const HOME_TITLE = "Minder energie na 40? Zo vind je de oorzaak";
const HOME_DESCRIPTION =
  "Minder energie na 40 is vaak geen ‘gewoon ouder worden’. Ontdek in 3 minuten wat je leefstijl doet met slaap, stress en herstel. Gratis check.";

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
        <LifestyleCheckSection />
        <HomeGuidesPromoSection />
        <FloatingLeefstijlcheckCta />
      </div>
    </>
  );
}
