import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import HubHero from "@/components/supplementen-hub/HubHero";
import RecommendedForYou from "@/components/supplementen-hub/RecommendedForYou";
import ProfileUpdateLink from "@/components/supplementen-hub/ProfileUpdateLink";
import PersonalizationCta from "@/components/supplementen-hub/PersonalizationCta";
import ThemaGrid from "@/components/supplementen-hub/ThemaGrid";
import SupplementCatalog from "@/components/supplementen-hub/SupplementCatalog";
import WhyTrustUs from "@/components/supplementen-hub/WhyTrustUs";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { CATALOG } from "@/data/supplementen-hub/catalog";
import { getIntakeSessionServer } from "@/lib/intake-session-server";
import {
  buildBreadcrumbSchema,
  buildItemListSchema,
} from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title:
    "Supplementengids | Onafhankelijk advies voor mannen 40+ | PerfectSupplement",
  description:
    "Ontdek welk supplement bij jou past. Objectieve gidsen en vergelijkingen op basis van wetenschap — niet op basis van marketing.",
  openGraph: {
    title: "Supplementengids — PerfectSupplement",
    description:
      "Onafhankelijke supplementgidsen en vergelijkingen voor mannen 40+.",
  },
};

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", url: "https://perfectsupplement.nl" },
  { name: "Supplementen", url: "/supplementen" },
]);

const itemListSchema = buildItemListSchema(
  "Supplementengidsen",
  CATALOG.filter((e) => !e.comingSoon).map((e) => ({
    name: e.name,
    url: e.guideHref,
  })),
);

const jsonLd = [breadcrumbSchema, itemListSchema];

export default async function SupplementenPage() {
  const session = await getIntakeSessionServer();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>
        {/* 1. Hero */}
        <HubHero hasSession={!!session} />

        {/* 2. Staat A of B */}
        {session ? (
          <section id="aanbevolen" aria-label="Aanbevolen voor jou" className="mt-4">
            <Container>
              <RecommendedForYou session={session} />
              <ProfileUpdateLink />
            </Container>
          </section>
        ) : (
          <section aria-label="Persoonlijke aanbevelingen" className="mt-4">
            <Container>
              <PersonalizationCta />
            </Container>
          </section>
        )}

        {/* 3. Thema's */}
        <section aria-label="Supplementthema's" className="mt-16 md:mt-20">
          <Container>
            <ThemaGrid />
          </Container>
        </section>

        {/* 4. Alle supplementgidsen */}
        <section className="mt-16 md:mt-20">
          <Container>
            <SupplementCatalog />
          </Container>
        </section>

        {/* 5. Vertrouwensblok */}
        <section className="mt-16 md:mt-20">
          <Container>
            <WhyTrustUs />
          </Container>
        </section>

        {/* 6. Medische disclaimer */}
        <Container className="mt-16">
          <MedicalDisclaimer />
        </Container>
      </div>
    </>
  );
}
