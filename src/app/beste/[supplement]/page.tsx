import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  SUPPLEMENT_SLUGS,
  getSupplementComparisonData,
} from "@/data/supplements";
import { ChoiceHero } from "@/components/supplements/ChoiceHero";
import { ComparisonTable } from "@/components/supplements/ComparisonTable";
import { ProductCard } from "@/components/supplements/ProductCard";
import { BuyingGuide } from "@/components/supplements/BuyingGuide";
import { FaqSection } from "@/components/supplements/FaqSection";
import { StickyMobileCta } from "@/components/supplements/StickyMobileCta";
import { TrustBar } from "@/components/supplements/TrustBar";
import {
  ComparisonChooserIntro,
  ComparisonIntakeFallbackCta,
} from "@/components/supplements/ContentFirstComparisonCTAs";
import Container from "@/components/layout/Container";
import {
  buildBreadcrumbSchema,
  buildItemListSchema,
} from "@/lib/seo/structuredData";
import {
  isSupplementAvailable,
  getSupplementDisabledReason,
} from "@/lib/supplement-availability";

interface PageProps {
  params: Promise<{ supplement: string }>;
}

export function generateStaticParams() {
  return SUPPLEMENT_SLUGS.map((supplement) => ({ supplement }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { supplement } = await params;
  const data = getSupplementComparisonData(supplement);
  if (!data) return {};

  const pageUrl = `https://perfectsupplement.nl/beste/${supplement}`;

  const metadata: Metadata = {
    title: data.seoTitle,
    description: data.seoDescription,
    alternates: { canonical: `/beste/${supplement}` },
    openGraph: {
      title: data.seoTitle,
      description: data.seoDescription,
      type: "article",
      url: pageUrl,
      siteName: "PerfectSupplement",
      locale: "nl_NL",
      ...(data.ogImage && {
        images: [
          {
            url: data.ogImage,
            width: 1200,
            height: 630,
            alt: data.ogImageAlt ?? data.seoTitle,
          },
        ],
      }),
    },
    ...(data.ogImage && {
      twitter: {
        card: "summary_large_image",
        title: data.seoTitle,
        description: data.seoDescription,
        images: [data.ogImage],
      },
    }),
    robots: { index: true, follow: true },
  };

  return metadata;
}

export default async function Page({ params }: PageProps) {
  const { supplement } = await params;
  const data = getSupplementComparisonData(supplement);
  if (!data) notFound();

  const pageUrl = `https://perfectsupplement.nl/beste/${supplement}`;
  const topProductLabel = data.topProductLabel ?? "Topkeuze";
  const topProduct =
    data.products.find((p) => p.bestFor === topProductLabel) ?? data.products[0];

  const breadcrumbSchema = buildBreadcrumbSchema(data.breadcrumbs);
  const itemListSchema = buildItemListSchema(data.products, pageUrl);

  const available = isSupplementAvailable(data.category);
  const disabledReason = getSupplementDisabledReason(data.category);

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
        {!available && disabledReason && (
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

        <ComparisonChooserIntro category={data.category}>
          <ComparisonTable
            rows={data.tableRows}
            criteria={data.comparisonCriteria}
            doseringColumnLabel={data.tableDoseringColumnLabel}
          />
        </ComparisonChooserIntro>

        {data.readAlsoCards && data.readAlsoCards.length > 0 && (
          <section className="mt-16 border-t border-stone-100 pt-12">
            <Container>
              <h2 className="font-display text-2xl font-bold text-stone-900 mb-8">Lees ook</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.readAlsoCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className={`group block rounded-xl border border-stone-200 p-6 hover:border-ps-green/30 transition-colors${
                      card.colSpan === 2 ? " md:col-span-2" : ""
                    }`}
                  >
                    <p className="text-base text-stone-600 leading-relaxed">
                      {card.text}
                    </p>
                  </Link>
                ))}
              </div>
            </Container>
          </section>
        )}

        <section className="mt-16">
          <BuyingGuide
            criteria={data.comparisonCriteria}
            category={data.category}
            guideHref={data.guideHref}
          />
        </section>

        <section className="mx-auto mt-16 w-full max-w-7xl px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-slate-900">
            Veelgestelde vragen
          </h2>
          <FaqSection items={data.faq} />
        </section>

        <section id="producten" className="mx-auto mt-16 w-full max-w-7xl space-y-8 px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Alle varianten uitgelicht
          </h2>
          {data.products.map((p, i) => (
            <ProductCard
              key={p.slug}
              product={p}
              position={i + 1}
              isPrimary={p.slug === topProduct.slug}
            />
          ))}
        </section>

        {data.moreAboutTitle && data.moreAboutLinks && (
          <section className="mx-auto mt-16 w-full max-w-7xl px-6 lg:px-8 pb-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                {data.moreAboutTitle}
              </h3>
              {data.moreAboutDescription && (
                <p className="mt-2 text-sm text-slate-600">
                  {data.moreAboutDescription}
                </p>
              )}
              <div className="mt-3 space-y-2">
                {data.moreAboutLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-sm font-medium text-emerald-700 underline underline-offset-4"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {data.showIntakeFallbackCta !== false && <ComparisonIntakeFallbackCta />}

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
