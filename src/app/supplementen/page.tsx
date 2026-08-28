import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/seo/canonical";
import Container from "@/components/layout/Container";
import HubSluitCta from "@/components/supplement-hub/HubSluitCta";
import ProductCatalog from "@/components/supplement-hub/ProductCatalog";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { CATALOG } from "@/data/supplement-hub/catalog";
import { getHubProducts } from "@/lib/supplement-hub/product-catalog";
import { buildHubPersonalization } from "@/lib/supplement-hub/hub-personalization";
import { getIntakeSessionFromCookie } from "@/lib/intake-session-server";
import { VoortgangReturnBanner } from "@/components/dashboard/VoortgangReturnBanner";
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
        {/* 1. Keuzekolom + productcatalogus. Geen kop erboven: de zijbalk zegt
            wat de meetlat is en de lijstkop draagt de h1, zodat de producten
            meteen in beeld staan. */}
        <section
          id="producten"
          aria-label="Alle supplementproducten"
          className="scroll-mt-24 pt-8 md:pt-10"
        >
          <Container>
            <VoortgangReturnBanner surface="supplementen" />
            <h1 className="font-display text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
              Supplementen
            </h1>
            <div className="mt-5 md:mt-6">
              <ProductCatalog
                products={products}
                personalization={personalization}
              />
            </div>
          </Container>
        </section>

        {/* 2. Afsluiter: de check (of de methode) na de lijst */}
        <Container className="mt-14 md:mt-16">
          <HubSluitCta
            state={personalization.state}
            productCount={products.length}
          />
        </Container>

        {/* 3. Medische disclaimer */}
        <Container className="mt-12">
          <MedicalDisclaimer />
        </Container>
      </div>
    </>
  );
}
