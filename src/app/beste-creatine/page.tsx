import type { Metadata } from "next";
import Link from "next/link";
import { creatineData } from "@/data/supplements/creatine";
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

const PAGE_URL = "https://perfectsupplement.nl/beste-creatine";

const OG_IMAGE_URL =
  "https://perfectsupplement.nl/images/producten/vital-Nutrition-Creatine-Monohydraat.jpg";

export const metadata: Metadata = {
  title: creatineData.seoTitle,
  description: creatineData.seoDescription,
  alternates: { canonical: "/beste-creatine" },
  openGraph: {
    title: creatineData.seoTitle,
    description: creatineData.seoDescription,
    type: "article",
    url: PAGE_URL,
    siteName: "PerfectSupplement",
    locale: "nl_NL",
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Vital Nutrition Creatine Monohydraat — topkeuze in de vergelijking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: creatineData.seoTitle,
    description: creatineData.seoDescription,
    images: [OG_IMAGE_URL],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  const data = creatineData;
  const topProduct =
    data.products.find((p) => p.bestFor === "Topkeuze") ?? data.products[0];

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "https://perfectsupplement.nl" },
    {
      name: "Supplementen",
      url: "https://perfectsupplement.nl/supplementen",
    },
    { name: "Beste creatine", url: PAGE_URL },
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
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-slate-900">
            Veelgestelde vragen
          </h2>
          <FaqSection items={data.faq} />
        </section>

        <section className="mx-auto mt-16 w-full max-w-7xl px-6 lg:px-8 pb-8">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Meer over creatine
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Creatine werkt het best als onderdeel van een bredere herstelstrategie. Bekijk wat goed aansluit.
            </p>
            <div className="mt-3 space-y-2">
              <Link
                href="/beste-magnesium"
                className="block text-sm font-medium text-emerald-700 underline underline-offset-4"
              >
                Beste magnesium — ondersteunt herstel en slaapkwaliteit →
              </Link>
              <Link
                href="/supplement-kiezen-waar-op-letten"
                className="block text-sm font-medium text-emerald-700 underline underline-offset-4"
              >
                Supplement kiezen: waar let je op? — praktische checklist →
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
