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
import Container from "@/components/layout/Container";
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
              Meer over zink
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Zink speelt een rol bij testosteron, immuunfunctie en herstel — drie thema&apos;s die na je 40e extra aandacht verdienen.
            </p>
            <div className="mt-3 space-y-2">
              <Link
                href="/supplement-kiezen-waar-op-letten"
                className="block text-sm font-medium text-emerald-700 underline underline-offset-4"
              >
                Supplement kiezen: waar let je op? — praktische checklist →
              </Link>
              <Link
                href="/thema/energie"
                className="block text-sm font-medium text-emerald-700 underline underline-offset-4"
              >
                Energieverlies na je 40e — oorzaken en wat je eraan kunt doen →
              </Link>
            </div>
          </div>
        </section>

        <Container>
          <section className="my-16">
            <div className="bg-gradient-to-br from-[#5A8F6A] to-[#4a7a5a] text-white rounded-2xl p-8 lg:p-12 text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
                Wil je weten welk supplement bij jou past?
              </h2>
              <p className="text-white/80 mt-3 max-w-md mx-auto text-sm leading-relaxed">
                Doe de gratis Leefstijlcheck — 12 vragen, 3 minuten, persoonlijk resultaat.
              </p>
              <div className="mt-6">
                <Link
                  href="/intake"
                  className="inline-flex items-center gap-2 bg-white text-[#5A8F6A] rounded-lg px-8 py-3.5 font-semibold text-sm hover:bg-white/90 transition-all shadow-lg"
                >
                  Start de Leefstijlcheck
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
              <p className="text-white/50 text-xs mt-4">
                Geen account nodig — je gegevens worden anoniem verwerkt.
              </p>
            </div>
          </section>
        </Container>

        <section className="border-t border-stone-200 py-10" role="complementary">
          <Container>
            <div className="mx-auto max-w-2xl text-center text-sm text-stone-500">
              <p>
                De informatie op deze pagina is geen medisch advies. Raadpleeg bij klachten altijd
                een arts.
              </p>
              <p className="mt-3">
                <Link
                  href="/disclaimer"
                  className="font-medium text-stone-600 underline decoration-stone-300 underline-offset-4 transition hover:text-stone-900"
                >
                  Lees onze volledige disclaimer →
                </Link>
              </p>
            </div>
          </Container>
        </section>
      </main>

      <StickyMobileCta topProduct={topProduct} />
    </>
  );
}
