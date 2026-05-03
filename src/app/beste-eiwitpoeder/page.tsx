import type { Metadata } from "next";
import Link from "next/link";
import { eiwitpoederData } from "@/data/supplements/eiwitpoeder";
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

const PAGE_URL = "https://perfectsupplement.nl/beste-eiwitpoeder";

export const metadata: Metadata = {
  title: eiwitpoederData.seoTitle,
  description: eiwitpoederData.seoDescription,
  alternates: { canonical: "/beste-eiwitpoeder" },
  openGraph: {
    title: eiwitpoederData.seoTitle,
    description: eiwitpoederData.seoDescription,
    type: "article",
    url: PAGE_URL,
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  const data = eiwitpoederData;
  const topProduct =
    data.products.find((p) => p.bestFor === "Beste allround") ?? data.products[0];

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "https://perfectsupplement.nl" },
    {
      name: "Supplementen",
      url: "https://perfectsupplement.nl/supplementen",
    },
    { name: "Beste eiwitpoeder", url: PAGE_URL },
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

        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <p className="-mt-1 text-base font-semibold text-emerald-800">
            <Link
              href="/intake"
              className="underline decoration-emerald-600 underline-offset-4 hover:text-emerald-950"
            >
              Welk eiwitpoeder past bij jou? → Doe de Leefstijlcheck
            </Link>
          </p>
        </div>

        <div className="mx-auto mt-6 w-full max-w-7xl px-6 lg:px-8">
          <p className="text-sm text-slate-500 mb-8">
            Dit artikel bevat affiliate links. Bij aankoop via deze links ontvangen wij een
            kleine vergoeding. Dit heeft geen invloed op onze beoordeling —
            onze <a href="/methodologie" className="underline hover:text-slate-700">methodologie</a> is
            onafhankelijk.
          </p>
        </div>

        <section className="mx-auto w-full max-w-7xl px-6 lg:px-8 pb-4">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900">
            Waarom eiwitpoeder?
          </h2>
          <div className="max-w-3xl space-y-4 text-sm leading-7 text-slate-600">
            <p>
              <span className="font-medium text-slate-800">Herkenning: </span>
              Je traint, je eet redelijk gezond, maar je spieren herstellen langzamer dan vroeger.
              Of je merkt dat je spiermassa verliest terwijl je hetzelfde doet als altijd.
            </p>
            <p>
              <span className="font-medium text-slate-800">Mechanisme: </span>
              Na 40 daalt de eiwitsynthese. Je lichaam heeft meer eiwit nodig om dezelfde spiermassa
              te behouden — maar de meeste mannen krijgen te weinig binnen via voeding alleen. Een
              eiwitpoeder vult dit gat efficiënt aan. Het verschil tussen whey en plantaardig zit
              vooral in{" "}
              <Link
                href="/kennisbank/biobeschikbaarheid"
                className="font-medium text-emerald-700 underline underline-offset-4 hover:text-emerald-800"
              >
                biobeschikbaarheid
              </Link>{" "}
              en snelheid van opname: whey wordt doorgaans sneller opgenomen; plantaardige blends
              zijn vaak geschikter bij intoleranties of als je zuivel wilt vermijden.
            </p>
            <p>
              <span className="font-medium text-slate-800">Europees kader (EFSA): </span>
              Eiwitten dragen bij aan de groei en instandhouding van spiermassa. Eiwitten dragen bij
              aan de instandhouding van normale botten.
            </p>
          </div>
        </section>

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
              Meer over eiwitpoeder
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Eiwit werkt het best als onderdeel van training, slaap en voeding. Dit sluit aan bij
              eerdere vergelijkingen op PerfectSupplement.
            </p>
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-sm text-slate-600">
                  Train je veel maar herstel je slecht? Creatine kan het verschil maken.
                </p>
                <Link
                  href="/beste-creatine"
                  className="mt-1 inline-block text-sm font-medium text-emerald-700 underline underline-offset-4"
                >
                  Bekijk de vergelijking →
                </Link>
              </div>
              <div>
                <p className="text-sm text-slate-600">
                  Spieren herstellen &apos;s nachts. Goed slapen is essentieel.
                </p>
                <Link
                  href="/slaap-verbeteren-na-40"
                  className="mt-1 inline-block text-sm font-medium text-emerald-700 underline underline-offset-4"
                >
                  Lees de complete gids →
                </Link>
              </div>
              <div>
                <p className="text-sm text-slate-600">
                  Benieuwd hoe jouw herstel en energie scoren?
                </p>
                <Link
                  href="/intake"
                  className="mt-1 inline-block text-sm font-medium text-emerald-700 underline underline-offset-4"
                >
                  Doe de Leefstijlcheck →
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 border-t border-stone-100 pt-12">
          <Container>
            <h2 className="font-display text-2xl font-bold text-stone-900 mb-8">Lees ook</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/profiel/stille-slijter"
                className="group block rounded-xl border border-stone-200 p-6 hover:border-[#5A8F6A]/30 transition-colors"
              >
                <p className="text-base text-stone-600 leading-relaxed">
                  Snacks en leeg-calorieën na de training? Herstel begint bij consistente
                  voeding — ontdek het profiel van de Stille Slijter.
                </p>
                <span className="mt-3 inline-block text-sm font-semibold text-[#5A8F6A] group-hover:underline">
                  Bekijk het profiel →
                </span>
              </Link>
              <Link
                href="/beste-creatine"
                className="group block rounded-xl border border-stone-200 p-6 hover:border-[#5A8F6A]/30 transition-colors"
              >
                <p className="text-base text-stone-600 leading-relaxed">
                  Train je veel maar herstel je slecht? Creatine kan het verschil maken voor
                  kracht en herstel.
                </p>
                <span className="mt-3 inline-block text-sm font-semibold text-[#5A8F6A] group-hover:underline">
                  Bekijk de vergelijking →
                </span>
              </Link>
              <Link
                href="/slaap-verbeteren-na-40"
                className="group block rounded-xl border border-stone-200 p-6 hover:border-[#5A8F6A]/30 transition-colors"
              >
                <p className="text-base text-stone-600 leading-relaxed">
                  Spieren herstellen &apos;s nachts. Goed slapen is essentieel voor resultaat.
                </p>
                <span className="mt-3 inline-block text-sm font-semibold text-[#5A8F6A] group-hover:underline">
                  Lees de complete gids →
                </span>
              </Link>
              <Link
                href="/intake"
                className="group block rounded-xl border border-stone-200 p-6 hover:border-[#5A8F6A]/30 transition-colors"
              >
                <p className="text-base text-stone-600 leading-relaxed">
                  Benieuwd hoe jouw herstel en energie scoren?
                </p>
                <span className="mt-3 inline-block text-sm font-semibold text-[#5A8F6A] group-hover:underline">
                  Doe de Leefstijlcheck →
                </span>
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
