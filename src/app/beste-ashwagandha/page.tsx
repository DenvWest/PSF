import type { Metadata } from "next";
import Link from "next/link";
import { ashwagandhaData } from "@/data/supplements/ashwagandha";
import { ChoiceHero } from "@/components/supplements/ChoiceHero";
import { ComparisonTable } from "@/components/supplements/ComparisonTable";
import { ProductCard } from "@/components/supplements/ProductCard";
import { BuyingGuide } from "@/components/supplements/BuyingGuide";
import { FaqSection } from "@/components/supplements/FaqSection";
import { StickyMobileCta } from "@/components/supplements/StickyMobileCta";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { TrustBar } from "@/components/supplements/TrustBar";
import {
  buildBreadcrumbSchema,
  buildItemListSchema,
} from "@/lib/seo/structuredData";
import {
  isSupplementAvailable,
  getSupplementDisabledReason,
} from "@/lib/supplement-availability";

const PAGE_URL = "https://perfectsupplement.nl/beste-ashwagandha";

/** Open Graph: topkeuze (Vitaminstore KSM-66) — zelfde als `seoTitle` / `seoDescription`. */
const OG_IMAGE_URL =
  "https://perfectsupplement.nl/images/producten/Vitaminstore-Ashwagandha-KSM-66.jpg";

export const metadata: Metadata = {
  title: ashwagandhaData.seoTitle,
  description: ashwagandhaData.seoDescription,
  alternates: { canonical: "/beste-ashwagandha" },
  openGraph: {
    title: ashwagandhaData.seoTitle,
    description: ashwagandhaData.seoDescription,
    type: "article",
    url: PAGE_URL,
    siteName: "PerfectSupplement",
    locale: "nl_NL",
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Vitaminstore Ashwagandha KSM-66 — topkeuze in de vergelijking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: ashwagandhaData.seoTitle,
    description: ashwagandhaData.seoDescription,
    images: [OG_IMAGE_URL],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  const data = ashwagandhaData;
  const topProduct =
    data.products.find((p) => p.bestFor === "Topkeuze") ?? data.products[0];
  const ashwagandhaAvailable = isSupplementAvailable("ashwagandha");
  const disabledReason = getSupplementDisabledReason("ashwagandha");

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "https://perfectsupplement.nl" },
    {
      name: "Supplementen",
      url: "https://perfectsupplement.nl/supplementen/ashwagandha",
    },
    { name: "Beste ashwagandha", url: PAGE_URL },
  ]);

  const itemListSchema = buildItemListSchema(data.products, PAGE_URL);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <TrustBar />

      <main className="pb-24 md:pb-12">
        {!ashwagandhaAvailable && disabledReason && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8 mx-auto max-w-7xl px-6 lg:px-8">
            <p className="text-amber-800 font-medium">
              ⚠️ Let op: {disabledReason}
            </p>
            <p className="text-amber-700 text-sm mt-2">
              De informatie op deze pagina is nog beschikbaar ter referentie,
              maar de producten zijn mogelijk niet meer verkrijgbaar.
            </p>
          </div>
        )}

        <ChoiceHero data={data} />

        <div className="mx-auto mt-6 w-full max-w-7xl px-6 lg:px-8">
          <p className="text-sm text-slate-500 mb-8">
            Dit artikel bevat affiliate links. Bij aankoop via deze links ontvangen wij een
            kleine vergoeding. Dit heeft geen invloed op onze beoordeling —
            onze <a href="/methodologie" className="underline hover:text-slate-700">methodologie</a> is
            onafhankelijk.
          </p>
        </div>

        <section className="mx-auto mt-12 w-full max-w-7xl px-6 lg:px-8">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900">
            In één oogopslag vergelijken
          </h2>
          <ComparisonTable rows={data.tableRows} criteria={data.comparisonCriteria} />
        </section>

        <section id="producten" className="mx-auto mt-16 w-full max-w-7xl space-y-8 px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Alle varianten uitgelicht
          </h2>
          {data.products.map((p, i) => (
            <ProductCard key={p.slug} product={p} position={i + 1} />
          ))}
        </section>

        <section className="mt-16">
          <BuyingGuide
            criteria={data.comparisonCriteria}
            category={data.category}
          />
        </section>

        <section className="mx-auto mt-16 w-full max-w-7xl px-6 lg:px-8">
          <aside className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-10 text-sm text-slate-600">
            <p className="font-medium text-slate-700 mb-1">Over gezondheidsclaims</p>
            <p>
              De gezondheidsclaims over ashwagandha staan op de Europese &quot;on hold&quot;-lijst.
              Dit betekent dat ze zijn ingediend bij EFSA maar nog niet definitief beoordeeld.
              Ze mogen voorlopig worden gebruikt. De Nederlandse overheid (VWS) onderzoekt momenteel
              of ashwagandha als supplement verkrijgbaar blijft in Nederland.
            </p>
          </aside>

          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-slate-900">
            Veelgestelde vragen
          </h2>
          <FaqSection items={data.faq} />
        </section>

        <section className="mx-auto mt-16 w-full max-w-7xl px-6 lg:px-8 pb-8">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Meer over ashwagandha
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Ashwagandha werkt het best in combinatie met andere herstelkeuzes. Lees de theorie of ontdek wat er naast ashwagandha relevant is voor stress en slaap na je 40e.
            </p>
            <div className="mt-3 space-y-2">
              <Link
                href="/supplementen/ashwagandha"
                className="block text-sm font-medium text-emerald-700 underline underline-offset-4"
              >
                Meer weten over ashwagandha? Lees de uitgebreide gids →
              </Link>
              <Link
                href="/thema/stress"
                className="block text-sm font-medium text-emerald-700 underline underline-offset-4"
              >
                Stress na je 40e — wat speelt er en wat helpt? →
              </Link>
              <Link
                href="/intake"
                className="block text-sm font-medium text-emerald-700 underline underline-offset-4"
              >
                Doe de gratis leefstijlcheck — ontdek welk supplement bij jou past
              </Link>
            </div>
          </div>
        </section>

        <MedicalDisclaimer />
      </main>

      <StickyMobileCta topProduct={topProduct} />
    </>
  );
}
