import type { Metadata } from "next";
import Link from "next/link";
import { canonicalMetadata } from "@/lib/seo/canonical";
import Container from "@/components/layout/Container";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { IntakeCtaMicro } from "@/components/common/IntakeCtaMicro";
import PillarReadingChrome from "@/components/content/PillarReadingChrome";
import PillarStickyIntakeCta from "@/components/content/PillarStickyIntakeCta";

const LINK =
  "font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] transition hover:decoration-ps-green hover:text-ps-green-hover";

export const metadata: Metadata = {
  title: "Voeding Na 40: Wat Mannen Vaak Missen | PerfectSupplement",
  description:
    "Eiwit, vetten, ritme en stabiliteit na 40 — zonder dieet-hype. Praktische stappen vóór supplementen, met links naar gidsen en kennisbank.",
  ...canonicalMetadata("/voeding-na-40"),
  openGraph: {
    title: "Voeding Na 40 — eerst basis, dan pas supplementen",
    description:
      "Herkenning, leefstijlstappen en wanneer vergelijkingen zinvol zijn — voor mannen 40+.",
    url: "/voeding-na-40",
    type: "article",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Voeding Na 40: Wat Mannen Vaak Missen",
  description:
    "Eiwit, vetten, ritme en stabiliteit na 40 — praktische stappen vóór supplementen.",
  author: {
    "@type": "Organization",
    name: "PerfectSupplement",
    url: "https://perfectsupplement.nl",
  },
  publisher: {
    "@type": "Organization",
    name: "PerfectSupplement",
    url: "https://perfectsupplement.nl",
  },
  datePublished: "2026-06-04",
  dateModified: "2026-06-04",
  mainEntityOfPage: "https://perfectsupplement.nl/voeding-na-40",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Hoeveel eiwit heb ik nodig na 40?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Veel mannen 40+ zitten structureel onder 1,2 g eiwit per kg lichaamsgewicht per dag. Bij actief trainen is 1,6–2,0 g/kg een gangbaar richtpunt in sportvoeding — bespreek structurele tekorten met je huisarts.",
      },
    },
    {
      "@type": "Question",
      name: "Moet ik meteen supplementen nemen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nee. Eerst ritme, eiwit bij elke maaltijd, vette vis en voldoende vezels. Supplementen zijn een laatste stap als voeding en slaap op orde zijn — of als bloedonderzoek iets specifieks aangeeft.",
      },
    },
    {
      "@type": "Question",
      name: "Wat als ik weinig vis eet?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "EPA en DHA komen vooral uit vette vis. Eet je minder dan twee porties per week, is omega-3 via voeding of supplement een logisch gespreksonderwerp — niet omdat marketing dat zegt, maar omdat de inname vaak laag is.",
      },
    },
  ],
};

export default function VoedingNa40Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="pb-24 md:pb-28 py-12 md:py-16">
        <Container>
          <div className="max-w-3xl mx-auto">
            <PillarReadingChrome>
              <article>
                <header>
                  <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
                    Leefstijl eerst
                  </p>
                  <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mt-2">
                    Voeding Na 40: Wat Mannen Vaak Missen
                  </h1>
                  <p className="mt-4 text-lg text-gray-600">
                    Ken je dit: je eet “gezond genoeg”, maar herstel, energie en spiermassa
                    voelen alsof ze achterlopen? Na 40 verandert hoe je lichaam eiwit gebruikt,
                    hoe stabiel je bloedsuiker blijft en hoeveel je echt binnenkrijgt — zonder
                    dat je meer hoeft te “willen”.
                  </p>
                  <div className="mt-6 text-center">
                    <Link
                      href="/intake"
                      className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-green-700 px-8 py-3 text-sm font-semibold text-white no-underline hover:bg-green-800 transition-colors"
                    >
                      Ontdek jouw voedingsprioriteit →
                    </Link>
                    <IntakeCtaMicro className="mx-auto mt-4 max-w-lg text-sm text-gray-500" />
                  </div>
                </header>

                <nav
                  className="mt-10 rounded-xl border border-stone-200 bg-white p-5 text-sm"
                  aria-label="Inhoudsopgave"
                >
                  <p className="font-semibold text-stone-900">Op deze pagina</p>
                  <ul className="mt-3 space-y-2 text-stone-600">
                    <li>
                      <a href="#herkenning" className={LINK}>
                        Herkenning
                      </a>
                    </li>
                    <li>
                      <a href="#biologie" className={LINK}>
                        Wat er na 40 verandert
                      </a>
                    </li>
                    <li>
                      <a href="#stappen" className={LINK}>
                        Stappen zonder dieet-hype
                      </a>
                    </li>
                    <li>
                      <a href="#supplementen" className={LINK}>
                        Wanneer supplementen
                      </a>
                    </li>
                    <li>
                      <a href="#faq" className={LINK}>
                        Veelgestelde vragen
                      </a>
                    </li>
                  </ul>
                </nav>

                <section id="herkenning" className="mt-12">
                  <h2 className="font-serif text-2xl font-bold text-gray-900">
                    Herken je dit?
                  </h2>
                  <ul className="mt-4 space-y-3 text-gray-700 leading-relaxed list-disc pl-5">
                    <li>Je ontbijt is koffie + boterham, en rond 11:00 valt je energie weg.</li>
                    <li>Je traint, maar spiermassa voelt lastiger vast te houden.</li>
                    <li>Je eet weinig vette vis; omega-3 komt vooral uit supplementenmarketing.</li>
                    <li>Je avondmaaltijd is laat of eenzijdig (veel koolhydraten, weinig eiwit).</li>
                  </ul>
                  <p className="mt-4 text-gray-700 leading-relaxed">
                    Herken je een patroon?{" "}
                    <Link href="/profiel/lage-batterij" className={LINK}>
                      Lees het profiel Lage Batterij
                    </Link>{" "}
                    of start de{" "}
                    <Link href="/intake" className={LINK}>
                      gratis Leefstijlcheck
                    </Link>
                    .
                  </p>
                </section>

                <section id="biologie" className="mt-12">
                  <h2 className="font-serif text-2xl font-bold text-gray-900">
                    Wat er na 40 verandert
                  </h2>
                  <p className="mt-4 text-gray-700 leading-relaxed">
                    Spieronderhoud vraagt meer{" "}
                    <Link href="/kennisbank/eiwitbehoefte-na-40" className={LINK}>
                      eiwit per maaltijd
                    </Link>{" "}
                    dan vroeger — niet één enorme portie aan het eind van de dag. Tegelijk
                    reageert veel mannen gevoeliger op snelle suikerpieken (
                    <Link href="/kennisbank/insulineresistentie" className={LINK}>
                      insulinegevoeligheid
                    </Link>
                    ), vooral bij stress en weinig slaap.
                  </p>
                  <p className="mt-4 text-gray-700 leading-relaxed">
                    Vetten blijven onderschat:{" "}
                    <Link href="/kennisbank/epa-dha" className={LINK}>
                      EPA en DHA
                    </Link>{" "}
                    uit vette vis ondersteunen normale hartfunctie en hersenfunctie binnen
                    officiële claimkaders — geen wondermiddel tegen moeheid.
                  </p>
                </section>

                <section id="stappen" className="mt-12">
                  <h2 className="font-serif text-2xl font-bold text-gray-900">
                    Stappen die wél passen in een drukke week
                  </h2>
                  <ol className="mt-4 space-y-4 text-gray-700 leading-relaxed list-decimal pl-5">
                    <li>
                      <strong>Eiwit bij elke maaltijd</strong> — eieren, kwark, vis, peulvruchten.
                      Lees{" "}
                      <Link href="/blog/eiwit-na-40" className={LINK}>
                        eiwit na 40
                      </Link>
                      .
                    </li>
                    <li>
                      <strong>Vaste eetmomenten</strong> — vooral ontbijt binnen 2 uur na opstaan
                      helpt ritme en middagdip (
                      <Link href="/blog/middagdip-bloedsuiker-na-40" className={LINK}>
                        middagdip na 40
                      </Link>
                      ).
                    </li>
                    <li>
                      <strong>Vette vis 2× per week</strong> — anders eerst voeding structureren
                      vóór je omega-3 vergelijkt.
                    </li>
                    <li>
                      <strong>Alcohol en slaap</strong> — zie{" "}
                      <Link href="/blog/alcohol-slaap-energie-na-40" className={LINK}>
                        alcohol, slaap en energie
                      </Link>
                      .
                    </li>
                  </ol>
                </section>

                <section id="supplementen" className="mt-12">
                  <h2 className="font-serif text-2xl font-bold text-gray-900">
                    Supplementen: pas als laatste stap
                  </h2>
                  <p className="mt-4 text-gray-700 leading-relaxed">
                    Geen affiliate in deze pillar — wel doorverwijzingen als je basis op orde is:
                  </p>
                  <ul className="mt-4 space-y-3">
                    <li>
                      <Link href="/supplementen/omega-3" className={LINK}>
                        Omega-3 gids — wanneer voeding niet volstaat →
                      </Link>
                    </li>
                    <li>
                      <Link href="/beste/omega-3-supplement" className={LINK}>
                        Objectieve omega-3 vergelijking (affiliate) →
                      </Link>
                    </li>
                    <li>
                      <Link href="/supplementen/vitamine-d" className={LINK}>
                        Vitamine D gids — vooral bij weinig zon →
                      </Link>
                    </li>
                    <li>
                      <Link href="/energie-na-40" className={LINK}>
                        Energie-pillar — als vermoeidheid je hoofdthema is →
                      </Link>
                    </li>
                  </ul>
                </section>

                <section id="faq" className="mt-12">
                  <h2 className="font-serif text-2xl font-bold text-gray-900">
                    Veelgestelde vragen
                  </h2>
                  <div className="mt-6 space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Hoeveel eiwit heb ik nodig?
                      </h3>
                      <p className="mt-2 text-gray-700 leading-relaxed">
                        Richt op structureel voldoende eiwit verspreid over de dag. Bij twijfel
                        en aanhoudende klachten: bloedonderzoek via je huisarts.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Wat als ik weinig vis eet?
                      </h3>
                      <p className="mt-2 text-gray-700 leading-relaxed">
                        Dan is omega-3 het meest logische supplementgesprek — na je basis op
                        orde. Vergelijk pas als je weet hoeveel EPA/DHA je nodig hebt.
                      </p>
                    </div>
                  </div>
                </section>

                <div className="mt-12 rounded-2xl bg-ps-green/10 p-6 text-center">
                  <p className="text-gray-800 font-medium">
                    Wil je weten of voeding, slaap of stress bij jou het zwaarst weegt?
                  </p>
                  <Link
                    href="/intake"
                    className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-ps-green px-6 py-3 text-sm font-bold text-white no-underline hover:opacity-90"
                  >
                    Start de Leefstijlcheck →
                  </Link>
                </div>

                <MedicalDisclaimer className="mt-10" />
              </article>
            </PillarReadingChrome>
          </div>
        </Container>
        <PillarStickyIntakeCta />
      </main>
    </>
  );
}
