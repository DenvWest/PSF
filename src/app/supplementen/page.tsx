import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/seo/canonical";
import Container from "@/components/layout/Container";
import HubPageHead from "@/components/supplement-hub/HubPageHead";
import HubSluitCta from "@/components/supplement-hub/HubSluitCta";
import ProductCatalog from "@/components/supplement-hub/ProductCatalog";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { CATALOG } from "@/data/supplement-hub/catalog";
import { getHubProducts } from "@/lib/supplement-hub/product-catalog";
import { buildHubPersonalization } from "@/lib/supplement-hub/hub-personalization";
import { getIntakeSessionFromCookie } from "@/lib/intake-session-server";
import { hasNutritionLogForSession } from "@/lib/nutrition-log-server";
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
        {/* 1. Slanke paginakop — geen hero, de catalogus begint hoog */}
        <HubPageHead
          productCount={products.length}
          categoryCount={new Set(products.map((p) => p.category)).size}
        />

        {/* 2. Keuzekolom + productcatalogus — zijbalk draagt de knoppen,
            de rijen dragen alleen het product. */}
        <section
          id="producten"
          aria-label="Alle supplementproducten"
          className="scroll-mt-24 pt-7 md:pt-8"
        >
          <Container>
            <ProductCatalog
              products={products}
              personalization={personalization}
            />
          </Container>
        </section>

        {/* 3. Afsluiter: de check (of de methode) na de lijst */}
        <Container className="mt-14 md:mt-16">
          <HubSluitCta
            state={personalization.state}
            productCount={products.length}
          />
        </Container>

        {/* 4. Medische disclaimer */}
        <Container className="mt-12">
          <MedicalDisclaimer />
        </Container>
      </div>
    </>
  );
}
