import type { Metadata } from "next";
import Link from "next/link";
import { zinkData } from "@/data/supplements/zink";
import { ChoiceHero } from "@/components/supplements/ChoiceHero";
import { ComparisonTable } from "@/components/supplements/ComparisonTable";
import { ProductCard } from "@/components/supplements/ProductCard";
import { BuyingGuide } from "@/components/supplements/BuyingGuide";
import { FaqSection } from "@/components/supplements/FaqSection";
import { StickyMobileCta } from "@/components/supplements/StickyMobileCta";
import { TrustBar } from "@/components/supplements/TrustBar";
import {
  buildBreadcrumbSchema,
  buildItemListSchema,
} from "@/lib/seo/structuredData";

const PAGE_URL = "https://perfectsupplement.nl/beste-zink";

const OG_IMAGE_URL =
  "https://perfectsupplement.nl/images/producten/vital-nutrition-zink-methionine.jpg";

export const metadata: Metadata = {
  title: zinkData.seoTitle,
  description: zinkData.seoDescription,
  alternates: { canonical: "/beste-zink" },
  openGraph: {
    title: zinkData.seoTitle,
    description: zinkData.seoDescription,
    type: "article",
    url: PAGE_URL,
    siteName: "PerfectSupplement",
    locale: "nl_NL",
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Vital Nutrition Zink 15 mg — topkeuze in de vergelijking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: zinkData.seoTitle,
    description: zinkData.seoDescription,
    images: [OG_IMAGE_URL],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  const data = zinkData;
  const topProduct =
    data.products.find((p) => p.bestFor === "Topkeuze") ?? data.products[0];

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "https://perfectsupplement.nl" },
    {
      name: "Supplementen",
      url: "https://perfectsupplement.nl/supplementen",
    },
    { name: "Beste zink", url: PAGE_URL },
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
              Meer over zink
            </h3>
            <div className="mt-3 space-y-2">
              <p className="text-sm text-slate-600">
                Meer weten over zink en testosteron?{" "}
                <Link
                  href="/blog"
                  className="font-medium text-emerald-700 underline underline-offset-4"
                >
                  Lees ons artikel over testosteron na je 40e →
                </Link>
              </p>
              <Link
                href="/intake"
                className="block text-sm font-medium text-emerald-700 underline underline-offset-4"
              >
                Doe de gratis leefstijlcheck — ontdek welk supplement bij jou past
              </Link>
            </div>
          </div>
        </section>
      </main>

      <StickyMobileCta topProduct={topProduct} />
    </>
  );
}
