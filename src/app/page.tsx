import type { Metadata } from "next";
import Hero from "@/components/homepage/Hero";
import { canonicalMetadata } from "@/lib/seo/canonical";
import { absoluteUrl } from "@/lib/public-site-url";
import HomeProofBar from "@/components/homepage/HomeProofBar";
import HomeTrustSection from "@/components/homepage/HomeTrustSection";
import HomeGuidesPromoSection from "@/components/homepage/HomeGuidesPromoSection";
import HomeClosingCta from "@/components/homepage/HomeClosingCta";
import "./homepage.css";

const HOME_TITLE = "Welke supplementen zijn zinvol na je 40e — en welke niet";
const HOME_DESCRIPTION =
  "Onafhankelijke supplementvergelijkingen voor mannen 40+: vorm, werkzame dagdosering en prijs per dag. Alleen effecten met een goedgekeurde EU-claim, geen ranglijst op commissie.";

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
        <HomeProofBar />
        <HomeTrustSection />
        <HomeGuidesPromoSection />
        <HomeClosingCta />
      </div>
    </>
  );
}
