import type { Metadata } from "next";
import Link from "next/link";
import { magnesiumData } from "@/data/supplements/magnesium";
import { ChoiceHero } from "@/components/supplements/ChoiceHero";
import { ComparisonTable } from "@/components/supplements/ComparisonTable";
import { ProductCard } from "@/components/supplements/ProductCard";
import { BuyingGuide } from "@/components/supplements/BuyingGuide";
import { FaqSection } from "@/components/supplements/FaqSection";
import { StickyMobileCta } from "@/components/supplements/StickyMobileCta";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { TrustBar } from "@/components/supplements/TrustBar";
import Container from "@/components/layout/Container";
import {
  buildBreadcrumbSchema,
  buildItemListSchema,
} from "@/lib/seo/structuredData";

const PAGE_URL = "https://perfectsupplement.nl/beste-magnesium";

export const metadata: Metadata = {
  title: magnesiumData.seoTitle,
  description: magnesiumData.seoDescription,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: magnesiumData.seoTitle,
    description: magnesiumData.seoDescription,
    type: "article",
    url: PAGE_URL,
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  const data = magnesiumData;
  const topProduct =
    data.products.find((p) => p.bestFor === "Beste allround") ?? data.products[0];

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "https://perfectsupplement.nl" },
    {
      name: "Vergelijkingen",
      url: "https://perfectsupplement.nl/magnesium-vergelijken",
    },
    { name: "Beste magnesium", url: PAGE_URL },
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
              Meer over magnesium
            </h3>
            <div className="mt-3 space-y-2">
              <Link
                href="/magnesium-vergelijken"
                className="block text-sm font-medium text-emerald-700 underline underline-offset-4"
              >
                Magnesium vormen vergelijken — waar let je op per vorm en dosering?
              </Link>
              <Link
                href="/blog/magnesium-en-slaapkwaliteit"
                className="block text-sm font-medium text-emerald-700 underline underline-offset-4"
              >
                Magnesium en slaapkwaliteit: wat zegt het onderzoek?
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

        <section className="mt-16 border-t border-stone-100 pt-12">
          <Container>
            <h2 className="font-display text-2xl font-bold text-stone-900 mb-8">Lees ook</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/profiel/onrustige-slaper" className="group block rounded-xl border border-stone-200 p-6 hover:border-[#5A8F6A]/30 transition-colors">
                <p className="text-base text-stone-600 leading-relaxed">Slecht slapen na 40? Magnesium is stap 1. Ontdek of jij een Onrustige Slaper bent.</p>
                <span className="mt-3 inline-block text-sm font-semibold text-[#5A8F6A] group-hover:underline">Bekijk het profiel →</span>
              </Link>
              <Link href="/profiel/stressdrager" className="group block rounded-xl border border-stone-200 p-6 hover:border-[#5A8F6A]/30 transition-colors">
                <p className="text-base text-stone-600 leading-relaxed">Stress die zich opstapelt? Magnesium ontspant je zenuwstelsel.</p>
                <span className="mt-3 inline-block text-sm font-semibold text-[#5A8F6A] group-hover:underline">Bekijk het profiel →</span>
              </Link>
              <Link href="/thema/slaap" className="group block rounded-xl border border-stone-200 p-6 hover:border-[#5A8F6A]/30 transition-colors">
                <p className="text-base text-stone-600 leading-relaxed">Slaapkwaliteit verbeteren begint bij de juiste bouwstenen.</p>
                <span className="mt-3 inline-block text-sm font-semibold text-[#5A8F6A] group-hover:underline">Lees de slaapgids →</span>
              </Link>
            </div>
          </Container>
        </section>

        <MedicalDisclaimer />
      </main>

      <StickyMobileCta topProduct={topProduct} />
    </>
  );
}
