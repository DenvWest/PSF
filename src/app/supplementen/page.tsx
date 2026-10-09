import { Suspense } from "react";
import TerugNaarKeuze from "@/components/supplement-hub/TerugNaarKeuze";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { canonicalMetadata } from "@/lib/seo/canonical";
import Container from "@/components/layout/Container";
import HubSluitCta from "@/components/supplement-hub/HubSluitCta";
import ProductCatalog from "@/components/supplement-hub/ProductCatalog";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { CATALOG } from "@/data/supplement-hub/catalog";
import { loadHubProductsForPage } from "@/lib/supplement-catalog-db/hub-products-for-page";
import { HUB_CATEGORY_PARAM } from "@/lib/supplement-hub/hub-link";
import { buildHubPersonalization } from "@/lib/supplement-hub/hub-personalization";
import { INTAKE_SESSION_COOKIE_NAME, verifySignedIntakeSessionCookie } from "@/lib/intake-session-cookie";
import { resolveCheckSubject } from "@/lib/intake-session-resolve";
import { VoortgangReturnBanner } from "@/components/dashboard/VoortgangReturnBanner";
import { IntakeResultsReturnBanner } from "@/components/intake/IntakeResultsReturnBanner";
import { getLatestNutritionLogRawInputs } from "@/lib/nutrition-log-server";
import { isVitaminDLowSunSeason } from "@/lib/nutrition-season";
import { buildBreadcrumbSchema, buildNamedItemListSchema, jsonLdScript } from "@/lib/seo/structuredData";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title:
    "Supplementengids | Onafhankelijk advies voor 30-plussers",
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

type SupplementenPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * `?categorie=` zet de catalogus meteen op één stof. Andere pagina's (de
 * uitkomst van de leefstijlcheck voorop) dragen hun aanbeveling zo over als
 * navigatie: de onderbouwing blijft staan waar hij hoort, hier staan alleen de
 * producten van die categorie langs dezelfde meetlat.
 */
function readCategoryParam(
  searchParams: Record<string, string | string[] | undefined>,
): string | null {
  const raw = searchParams[HUB_CATEGORY_PARAM];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && value.trim() !== "" ? value : null;
}

export default async function SupplementenPage({ searchParams }: SupplementenPageProps) {
  const products = await loadHubProductsForPage();
  const initieleCategorie = readCategoryParam(await searchParams);
  const cookieStore = await cookies();
  const cookieSessionId = verifySignedIntakeSessionCookie(
    cookieStore.get(INTAKE_SESSION_COOKIE_NAME)?.value,
  );
  const { sessionIds } = await resolveCheckSubject(cookieSessionId);
  const hasSession = sessionIds.length > 0;
  const latestNutritionLog = hasSession
    ? await getLatestNutritionLogRawInputs(sessionIds)
    : null;

  const personalization = buildHubPersonalization({
    hasSession,
    latestNutritionLog,
    isDarkSeason: isVitaminDLowSunSeason(),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
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
            <Suspense fallback={null}>
              <TerugNaarKeuze surface="supplementen" />
            </Suspense>
            <IntakeResultsReturnBanner />
            <h1 className="font-display text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
              Supplementen
            </h1>
            <div className="mt-5 md:mt-6">
              <ProductCatalog
                products={products}
                personalization={personalization}
                initieleCategorie={initieleCategorie}
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
