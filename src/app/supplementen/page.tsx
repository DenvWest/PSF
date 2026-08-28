import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/seo/canonical";
import Container from "@/components/layout/Container";
import HubHero from "@/components/supplement-hub/HubHero";
import ProductCatalog from "@/components/supplement-hub/ProductCatalog";
import HubVerderLezen from "@/components/supplement-hub/HubVerderLezen";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { CATALOG } from "@/data/supplement-hub/catalog";
import { getHubProducts } from "@/lib/supplement-hub/product-catalog";
import { buildHubPersonalization } from "@/lib/supplement-hub/hub-personalization";
import { getIntakeSessionFromCookie } from "@/lib/intake-session-server";
import { hasNutritionLogForSession } from "@/lib/nutrition-log-server";
import type { SupplementHubState } from "@/components/supplement-hub/HubHero";
import {
  buildBreadcrumbSchema,
  buildNamedItemListSchema,
} from "@/lib/seo/structuredData";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title:
    "Supplementengids | Onafhankelijk advies voor mannen 40+ | PerfectSupplement",
  description:
    "Alle supplementen met een berekende PS-Score, kwaliteitsrang en kostenrang per claim-conforme dag. Onafhankelijk, na te rekenen, zonder prijs in de score.",
  openGraph: {
    title: "Supplementengids — PerfectSupplement",
    description:
      "Supplementen vergeleken op een berekende PS-Score, EU-claimvoorwaarde en prijs per claim-conforme dag.",
  },
  ...canonicalMetadata("/supplementen"),
};

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", url: "https://perfectsupplement.nl" },
  { name: "Supplementen", url: "/supplementen" },
]);

const itemListSchema = buildNamedItemListSchema(
  "Supplementengidsen",
  CATALOG.filter((e) => !e.comingSoon).map((e) => ({
    name: e.name,
    url: e.guideHref,
  })),
);

const jsonLd = [breadcrumbSchema, itemListSchema];

export default async function SupplementenPage() {
  const products = getHubProducts();
  const { verifiedSessionId, session } = await getIntakeSessionFromCookie();
  const hasIntakeCookie = verifiedSessionId !== null;
  const hasSession = hasIntakeCookie && session !== null;
  const nutritionLogCompleted =
    hasSession && verifiedSessionId
      ? await hasNutritionLogForSession(verifiedSessionId)
      : false;

  const hubState: SupplementHubState = !hasIntakeCookie
    ? "no_intake"
    : nutritionLogCompleted
      ? "ready"
      : "needs_nutrition";

  const personalization = buildHubPersonalization({
    session,
    hasIntakeCookie,
    nutritionLogCompleted,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>
        {/* 1. Hero */}
        <HubHero hubState={hubState} />

        {/* 2. Productcatalogus — PS-Score, persoonlijke markering, kostenrang */}
        <section
          id="producten"
          aria-label="Alle supplementproducten"
          className="mt-16 md:mt-20"
        >
          <Container>
            <ProductCatalog
              products={products}
              personalization={personalization}
            />
          </Container>
        </section>

        {/* 3. Verder lezen — gidsen per supplement en per thema */}
        <section
          id="verder-lezen"
          aria-label="Verder lezen"
          className="mt-16 md:mt-20"
        >
          <Container>
            <HubVerderLezen />
          </Container>
        </section>

        {/* 4. Medische disclaimer */}
        <Container className="mt-16">
          <MedicalDisclaimer />
        </Container>
      </div>
    </>
  );
}
