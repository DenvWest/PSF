import type { Metadata } from "next";
import Link from "next/link";
import { eiwitpoederData } from "@/data/supplements/eiwitpoeder";
import { ChoiceHero } from "@/components/supplements/ChoiceHero";
import { ComparisonTable } from "@/components/supplements/ComparisonTable";
import { ProductCard } from "@/components/supplements/ProductCard";
import { BuyingGuide } from "@/components/supplements/BuyingGuide";
import { FaqSection } from "@/components/supplements/FaqSection";
import { StickyMobileCta } from "@/components/supplements/StickyMobileCta";
import { TrustBar } from "@/components/supplements/TrustBar";
import {
  ComparisonChooserIntro,
  ComparisonEducationalLead,
} from "@/components/supplements/ContentFirstComparisonCTAs";
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

        <ComparisonChooserIntro category={data.category}>
          <ComparisonTable rows={data.tableRows} criteria={data.comparisonCriteria} doseringColumnLabel={data.tableDoseringColumnLabel} />
        </ComparisonChooserIntro>
        <ComparisonEducationalLead category={data.category} />

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
            guideHref={data.guideHref}
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
              Eiwit werkt het best als onderdeel van training, slaap en voeding. Begin met de gids
              als je eerst wilt bepalen of whey, isolaat of plantaardig eiwit bij je past.
            </p>
            <div className="mt-3 space-y-2">
              <Link
                href="/supplementen/eiwitpoeder"
                className="block text-sm font-medium text-emerald-700 underline underline-offset-4"
              >
                Eiwitpoeder gids — whey, isolaat en plantaardig uitgelegd →
              </Link>
              <Link
                href="/beste-creatine"
                className="block text-sm font-medium text-emerald-700 underline underline-offset-4"
              >
                Beste creatine — handig naast eiwit bij krachttraining →
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-16 border-t border-stone-100 pt-12">
          <Container>
            <h2 className="font-display text-2xl font-bold text-stone-900 mb-8">Lees ook</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/supplementen/eiwitpoeder"
                className="group block rounded-xl border border-stone-200 p-6 hover:border-[#5A8F6A]/30 transition-colors"
              >
                <p className="text-base text-stone-600 leading-relaxed">
                  Eerst begrijpen wat bij jou past? Lees de complete eiwitpoeder gids.
                </p>
                <span className="mt-3 inline-block text-sm font-semibold text-[#5A8F6A] group-hover:underline">
                  Lees de gids →
                </span>
              </Link>
              <Link
                href="/beste-creatine"
                className="group block rounded-xl border border-stone-200 p-6 hover:border-[#5A8F6A]/30 transition-colors"
              >
                <p className="text-base text-stone-600 leading-relaxed">
                  Train je veel maar herstel je slecht? Creatine kan het verschil maken →
                </p>
              </Link>
              <Link
                href="/slaap-verbeteren-na-40"
                className="group block rounded-xl border border-stone-200 p-6 hover:border-[#5A8F6A]/30 transition-colors"
              >
                <p className="text-base text-stone-600 leading-relaxed">
                  Spieren herstellen &apos;s nachts — goed slapen is essentieel →
                </p>
              </Link>
            </div>
          </Container>
        </section>

        <Container>
          <section
            id="leefstijl-cta"
            aria-labelledby="leefstijl-cta-heading"
            className="py-16 lg:py-20"
          >
            <div className="rounded-2xl bg-gradient-to-br from-[#5A8F6A] to-[#4a7a5a] p-8 text-center shadow-sm lg:p-12">
              <p className="text-xs font-medium uppercase tracking-widest text-white/60">
                Persoonlijk advies
              </p>
              <h2
                id="leefstijl-cta-heading"
                className="mt-3 font-serif text-2xl text-white lg:text-3xl"
              >
                Niet zeker of eiwitpoeder bij jouw situatie past?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-base text-white/80">
                De meeste herstelproblemen beginnen niet bij één supplement, maar bij slaap,
                training, voeding en stress. De Leefstijlcheck laat zien waar jouw grootste winst zit.
              </p>
              <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-x-6 gap-y-2">
                <span className="text-sm text-white/70">✓ 12 vragen, 3 minuten</span>
                <span className="text-sm text-white/70">✓ Scores op 6 leefstijldomeinen</span>
                <span className="text-sm text-white/70">✓ Persoonlijk Herstelplan</span>
                <span className="text-sm text-white/70">✓ Gerichte supplementroute</span>
              </div>
              <div className="mt-8">
                <Link
                  href="/intake"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[#5A8F6A] shadow-lg transition-all hover:bg-white/90 hover:shadow-xl"
                >
                  Start je leefstijlcheck
                  <span aria-hidden>→</span>
                </Link>
              </div>
              <p className="mt-4 text-xs text-white/45">
                Gratis · Geen account nodig · Anoniem verwerkt
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
