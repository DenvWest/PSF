import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import HubHero from "@/components/supplementen-hub/HubHero";
import RecommendedForYou from "@/components/supplementen-hub/RecommendedForYou";
import ProfileUpdateLink from "@/components/supplementen-hub/ProfileUpdateLink";
import ThemaGrid from "@/components/supplementen-hub/ThemaGrid";
import SupplementCatalog from "@/components/supplementen-hub/SupplementCatalog";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { CATALOG } from "@/data/supplementen-hub/catalog";
import { getIntakeSessionFromCookie } from "@/lib/intake-session-server";
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
  alternates: { canonical: "/supplementen" },
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
  const { verifiedSessionId, session } = await getIntakeSessionFromCookie();
  const hasIntakeCookie = verifiedSessionId !== null;
  const hasSession = hasIntakeCookie && session !== null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>
        {/* 1. Hero */}
        <HubHero hasSession={hasIntakeCookie} />

        {/* 2. Alle supplementgidsen */}
        <section id="supplementgidsen" aria-label="Alle supplementgidsen" className="mt-16 md:mt-20">
          <Container>
            <SupplementCatalog />
          </Container>
        </section>

        {/* 3. Persoonlijke aanbeveling */}
        <section id="aanbeveling" aria-label="Persoonlijke aanbeveling" className="mt-16 md:mt-20">
          <Container>
            {hasSession ? (
              <>
                <RecommendedForYou session={session!} />
                <ProfileUpdateLink />
              </>
            ) : (
              <div className="bg-amber-50 rounded-2xl border border-amber-100 px-8 py-10 md:px-12 md:py-12">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900">
                  Welke supplementen passen bij jou?
                </h2>
                <p className="text-base text-stone-600 mt-3 max-w-lg leading-relaxed">
                  Doe de gratis Leefstijlcheck en ontdek in 3 minuten welke
                  supplementen bij jouw situatie passen.
                </p>
                <div className="mt-6">
                  <Link
                    href="/intake"
                    className="inline-flex items-center gap-2 bg-[#5A8F6A] text-white rounded-xl px-8 py-4 text-base font-semibold hover:bg-[#4A7F5A] transition-all shadow-sm hover:shadow-md"
                  >
                    Doe de Leefstijlcheck →
                  </Link>
                </div>
              </div>
            )}
          </Container>
        </section>

        {/* 4. Blader per thema */}
        <section id="themas" aria-label="Supplementthema's" className="mt-16 md:mt-20">
          <Container>
            <ThemaGrid />
          </Container>
        </section>

        {/* 5. Waarom PerfectSupplement? */}
        <section id="waarom" aria-label="Waarom PerfectSupplement?" className="mt-16 md:mt-20 border-t border-stone-100 py-16">
          <Container>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 text-center mb-12">
              Waarom PerfectSupplement?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-12 h-12 mx-auto rounded-xl bg-[#5A8F6A]/10 flex items-center justify-center mb-4 text-xl">
                  🔬
                </div>
                <h3 className="font-semibold text-stone-900 text-base">
                  Wetenschappelijk onderbouwd
                </h3>
                <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                  Elke aanbeveling is gebaseerd op onafhankelijk onderzoek en
                  gepubliceerde studies.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-12 h-12 mx-auto rounded-xl bg-[#5A8F6A]/10 flex items-center justify-center mb-4 text-xl">
                  ⚖️
                </div>
                <h3 className="font-semibold text-stone-900 text-base">
                  Objectief vergeleken
                </h3>
                <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                  Geen gesponsorde rankings. We vergelijken op dosering,
                  biobeschikbaarheid en prijs-kwaliteit.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-12 h-12 mx-auto rounded-xl bg-[#5A8F6A]/10 flex items-center justify-center mb-4 text-xl">
                  🎯
                </div>
                <h3 className="font-semibold text-stone-900 text-base">
                  Persoonlijk advies
                </h3>
                <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                  Via de Leefstijlcheck krijg je supplementadvies dat past bij
                  jouw situatie — niet een one-size-fits-all.
                </p>
              </div>
            </div>
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
