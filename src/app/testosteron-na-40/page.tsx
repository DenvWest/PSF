import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";

const LINK =
  "font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] transition hover:decoration-ps-green hover:text-ps-green-hover";

export const metadata: Metadata = {
  title: "Testosteron Na 40: Wat Verandert en Wat Je Zelf Kunt Doen | PerfectSupplement",
  description:
    "Testosteron na 40 in begrijpelijke taal: leeftijdstrend, slaap, stress en training — zonder diagnoses. Links naar vergelijkingen en cluster-artikelen.",
  alternates: { canonical: "/testosteron-na-40" },
  openGraph: {
    title: "Testosteron Na 40: Complete Gids",
    description:
      "Wat verandert na 40, wat onderzoek redelijkerwijs zegt en welke stappen je veilig eerst zet.",
    url: "/testosteron-na-40",
    type: "article",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Testosteron Na 40: Wat Verandert en Wat Je Zelf Kunt Doen",
  description:
    "Testosteron na 40: leefstijl, verwachtingen en wanneer medische hulp past.",
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
  datePublished: "2026-05-14",
  dateModified: "2026-05-14",
  mainEntityOfPage: "https://perfectsupplement.nl/testosteron-na-40",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Daalt testosteron altijd na 40?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Gemiddeld dalen totale testosteronwaarden geleidelijk met de leeftijd, maar individuele spreiding is groot. Vermoeidheid of libidoverandering heeft vaak meerdere oorzaken. Alleen bloedonderzoek in medische context geeft uitsluitsel over jouw waarden.",
      },
    },
    {
      "@type": "Question",
      name: "Helpt zink mijn testosteron verhogen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Zink draagt bij tot instandhouding van een normaal testosterongehalte in het bloed bij voldoende inname — geen belofte van verhoging. Bij twijfel over tekort: meten en advisering via zorgverlener.",
      },
    },
    {
      "@type": "Question",
      name: "Heeft stress invloed op testosteron?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Langdurige stress en slechte slaap worden in onderzoek vaak genoemd naast veranderende hormonale patronen. Dat is populatie-informatie, geen voorspelling voor jouw labwaarden. Pak slaap en stress eerst aan.",
      },
    },
    {
      "@type": "Question",
      name: "Wanneer naar de huisarts?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bij aanhoudende vermoeidheid, libidoverandering, onverklaard gewichtsverlies, borstklachten of stemmingsklachten die niet verbeteren met basis-leefstijl. Dit artikel vervangt geen medisch onderzoek.",
      },
    },
  ],
};

export default function TestosteronNa40Page() {
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

      <main className="py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <article>
              <header>
                <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
                  Complete gids
                </p>
                <h1 className="mt-2 font-serif text-4xl font-bold text-gray-900 md:text-5xl">
                  Testosteron na 40: wat verandert en wat je zelf kunt doen
                </h1>
                <p className="mt-4 text-lg text-gray-600">
                  Bijgewerkt: mei 2026 · Leestijd: 11 min
                </p>
              </header>

              <nav
                aria-label="Inhoudsopgave"
                className="mt-10 rounded-xl border border-stone-200 bg-stone-50 p-6"
              >
                <p className="mb-3 font-semibold text-gray-900">In deze gids</p>
                <ol className="list-inside list-decimal space-y-2 text-green-800">
                  <li>
                    <a href="#herkenning" className="hover:underline">
                      Herkenning zonder diagnose
                    </a>
                  </li>
                  <li>
                    <a href="#wat-verandert" className="hover:underline">
                      Wat gemiddeld verandert na 40
                    </a>
                  </li>
                  <li>
                    <a href="#leefstijl" className="hover:underline">
                      Leefstijl eerst
                    </a>
                  </li>
                  <li>
                    <a href="#supplementen" className="hover:underline">
                      Supplementen in context
                    </a>
                  </li>
                  <li>
                    <a href="#verder-lezen" className="hover:underline">
                      Verder lezen
                    </a>
                  </li>
                  <li>
                    <a href="#faq" className="hover:underline">
                      Veelgestelde vragen
                    </a>
                  </li>
                </ol>
              </nav>

              <p className="mt-10 text-lg leading-relaxed text-gray-700">
                Testosteron wordt online vaak neergezet als de enige schakelaar voor energie,
                libido en spierbehoud. In de praktijk is het een deel van een groter plaatje:
                slaap, stress, voeding en beweging. Deze gids helpt je verwachtingen te kalibreren
                — zonder harde hormoonclaims over jouw lichaam.
              </p>

              <section id="herkenning" className="mt-12 scroll-mt-24">
                <h2 className="font-serif text-2xl font-bold text-gray-900">
                  Herkenning zonder diagnose
                </h2>
                <p className="mt-4 leading-relaxed text-gray-700">
                  Veel mannen 40+ herkennen: minder drive om te trainen, langzamer herstel, minder
                  zin in seks of een zwaarder gevoel na stressvolle periodes. Dat kan samenhangen
                  met hormonen — maar ook met{" "}
                  <Link href="/slaap-verbeteren-na-40" className={LINK}>
                    slaap
                  </Link>
                  ,{" "}
                  <Link href="/stress-verminderen-man" className={LINK}>
                    stress
                  </Link>{" "}
                  of{" "}
                  <Link href="/energie-na-40" className={LINK}>
                    energie
                  </Link>
                  . Profiel{" "}
                  <Link href="/profiel/stressdrager" className={LINK}>
                    Stressdrager
                  </Link>{" "}
                  en{" "}
                  <Link href="/profiel/lage-batterij" className={LINK}>
                    Lage batterij
                  </Link>{" "}
                  ordenen die herkenning zonder medische labels.
                </p>
              </section>

              <section id="wat-verandert" className="mt-12 scroll-mt-24">
                <h2 className="font-serif text-2xl font-bold text-gray-900">
                  Wat gemiddeld verandert na 40
                </h2>
                <p className="mt-4 leading-relaxed text-gray-700">
                  Populatieonderzoek laat een geleidelijke daling van totale testosteron zien met de
                  leeftijd — met grote individuele verschillen.{" "}
                  <Link href="/kennisbank/testosteron" className={LINK}>
                    Testosteron in de kennisbank
                  </Link>{" "}
                  legt begrippen uit; voor de koppeling met stress:{" "}
                  <Link href="/blog/cortisol-en-testosteron" className={LINK}>
                    cortisol en testosteron
                  </Link>
                  .
                </p>
              </section>

              <section id="leefstijl" className="mt-12 scroll-mt-24">
                <h2 className="font-serif text-2xl font-bold text-gray-900">
                  Leefstijl eerst
                </h2>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                  <li>
                    <strong>Slaap:</strong> vast ritme en minder schermlicht ’s avonds — zie{" "}
                    <Link href="/slaap-verbeteren-na-40" className={LINK}>
                      slaap verbeteren na 40
                    </Link>
                    .
                  </li>
                  <li>
                    <strong>Krachttraining + eiwit:</strong> ondersteunt spierbehoud; pillar{" "}
                    <Link href="/herstel-verbeteren-na-40" className={LINK}>
                      herstel na 40
                    </Link>
                    .
                  </li>
                  <li>
                    <strong>Stress:</strong> grenzen en ademhaling —{" "}
                    <Link href="/blog/ademhaling-tegen-stress" className={LINK}>
                      ademhaling tegen stress
                    </Link>
                    .
                  </li>
                </ul>
                <p className="mt-6">
                  <Link
                    href="/intake"
                    className="inline-flex items-center rounded-lg bg-ps-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-ps-green-hover"
                  >
                    Start de Leefstijlcheck →
                  </Link>
                </p>
              </section>

              <section id="supplementen" className="mt-12 scroll-mt-24">
                <h2 className="font-serif text-2xl font-bold text-gray-900">
                  Supplementen in context
                </h2>
                <p className="mt-4 leading-relaxed text-gray-700">
                  Geen supplement vervangt meting of medisch advies. Inhoudelijk vergelijken kan wel:
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
                  <li>
                    <Link href="/beste/zink" className={LINK}>
                      Zink vergelijken
                    </Link>{" "}
                    — EU-claim normaal testosterongehalte bij voldoende inname; lees{" "}
                    <Link href="/blog/zink-en-testosteron" className={LINK}>
                      zink en testosteron
                    </Link>
                    .
                  </li>
                  <li>
                    <Link href="/beste/creatine" className={LINK}>
                      Creatine vergelijken
                    </Link>{" "}
                    — vooral rond korte, intense inspanning, niet als hormoonmiddel.
                  </li>
                  <li>
                    <Link href="/beste/ashwagandha" className={LINK}>
                      Ashwagandha vergelijken
                    </Link>{" "}
                    — in stresscontext; geen vaste EU-stressclaims op het etiket.
                  </li>
                </ul>
              </section>

              <section id="verder-lezen" className="mt-12 scroll-mt-24">
                <h2 className="font-serif text-2xl font-bold text-gray-900">Verder lezen</h2>
                <p className="mt-4 rounded-lg border border-stone-200 bg-stone-50 p-4 text-gray-700">
                  <strong>Turbo:</strong>{" "}
                  <Link href="/blog/testosteron-en-energie-na-40" className={LINK}>
                    testosteron en energie na 40
                  </Link>{" "}
                  verdiept het energie-aspect;{" "}
                  <Link href="/blog/cortisol-en-testosteron" className={LINK}>
                    cortisol en testosteron
                  </Link>{" "}
                  verbindt stress met dit thema.
                </p>
              </section>

              <section id="faq" className="mt-12 scroll-mt-24">
                <h2 className="font-serif text-2xl font-bold text-gray-900">
                  Veelgestelde vragen
                </h2>
                <dl className="mt-6 space-y-6">
                  {faqSchema.mainEntity.map((item) => (
                    <div key={item.name}>
                      <dt className="font-semibold text-gray-900">{item.name}</dt>
                      <dd className="mt-2 text-gray-700">
                        {(item.acceptedAnswer as { text: string }).text}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              <div className="mt-12">
                <MedicalDisclaimer />
              </div>
            </article>
          </div>
        </Container>
      </main>
    </>
  );
}
