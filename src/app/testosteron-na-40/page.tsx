import type { Metadata } from "next";
import Link from "next/link";
import { canonicalMetadata } from "@/lib/seo/canonical";
import Container from "@/components/layout/Container";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { IntakeCtaMicro } from "@/components/common/IntakeCtaMicro";
import { ReferenceList } from "@/components/references/ReferenceList";
import PillarReadingChrome from "@/components/content/PillarReadingChrome";
import PillarStickyIntakeCta from "@/components/content/PillarStickyIntakeCta";
import { testosteronNa40References } from "@/data/references/testosteron-na-40";

const LINK =
  "font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] transition hover:decoration-ps-green hover:text-ps-green-hover";

export const metadata: Metadata = {
  title: "Testosteron na 40: wat verandert en wat helpt | PerfectSupplement",
  description:
    "Testosteron na 40 in begrijpelijke taal: leeftijdstrend, slaap, stress en training — zonder diagnoses. Links naar vergelijkingen en cluster-artikelen.",
  ...canonicalMetadata("/testosteron-na-40"),
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
  dateModified: "2026-05-20",
  mainEntityOfPage: "https://perfectsupplement.nl/testosteron-na-40",
};

const faqItems = [
  {
    q: "Daalt testosteron altijd na 40?",
    a: "Gemiddeld dalen de testosteronwaarden langzaam met de leeftijd, maar de verschillen tussen mannen zijn groot. Vermoeidheid of minder zin in seks heeft vaak meerdere oorzaken. Alleen bloedonderzoek bij een arts geeft zekerheid over jouw waarden.",
  },
  {
    q: "Helpt zink mijn testosteron verhogen?",
    a: "Zink draagt bij tot instandhouding van een normaal testosterongehalte in het bloed bij voldoende inname — geen belofte van verhoging. Bij twijfel over tekort: meten en advisering via zorgverlener.",
  },
  {
    q: "Heeft stress invloed op testosteron?",
    a: "Langdurige stress en slechte slaap worden in onderzoek vaak genoemd naast veranderende hormonen. Dat geldt voor groepen, het is geen voorspelling voor jouw bloedwaarden. Pak slaap en stress eerst aan.",
  },
  {
    q: "Helpt creatine bij testosteron?",
    a: "Creatine is officieel erkend voor korte, intense inspanning bij voldoende inname — geen Europees erkende claim op testosteron of libido. Het kan wel passen als je krachttraining wilt ondersteunen, naast slaap en voeding.",
  },
  {
    q: "Wanneer naar de huisarts?",
    a: "Bij aanhoudende vermoeidheid, libidoverandering, onverklaard gewichtsverlies, borstklachten of stemmingsklachten die niet verbeteren met basis-leefstijl. Dit artikel vervangt geen medisch onderzoek.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
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

      <main className="pb-24 md:pb-28 py-12 md:py-16">
        <Container>
          <div className="pillar-prose">
            <PillarReadingChrome>
            <article>
              <header>
                <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
                  Complete gids
                </p>
                <h1 className="mt-2 font-serif text-4xl font-bold text-gray-900 md:text-5xl">
                  Testosteron na 40: wat verandert en wat je zelf kunt doen
                </h1>
                <p className="mt-4 text-lg text-gray-600">
                  Bijgewerkt: mei 2026 · Leestijd: 14 min
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
                      Ken je dit?
                    </a>
                  </li>
                  <li>
                    <a href="#wat-verandert" className="hover:underline">
                      Wat gemiddeld verandert na 40
                    </a>
                  </li>
                  <li>
                    <a href="#hpa-as" className="hover:underline">
                      Stress, cortisol en de HPA-as
                    </a>
                  </li>
                  <li>
                    <a href="#leefstijl" className="hover:underline">
                      Leefstijl eerst
                    </a>
                  </li>
                  <li>
                    <a href="#profielen" className="hover:underline">
                      Herken je dit patroon?
                    </a>
                  </li>
                  <li>
                    <a href="#supplementen" className="hover:underline">
                      Supplementen in context
                    </a>
                  </li>
                  <li>
                    <a href="#aanpak" className="hover:underline">
                      Week voor week
                    </a>
                  </li>
                  <li>
                    <a href="#verder-lezen" className="hover:underline">
                      Verder lezen
                    </a>
                  </li>
                  <li>
                    <a href="#leefstijlcheck" className="hover:underline">
                      Leefstijlcheck
                    </a>
                  </li>
                  <li>
                    <a href="#veelgestelde-vragen" className="hover:underline">
                      Veelgestelde vragen
                    </a>
                  </li>
                </ol>
              </nav>

              <p className="mt-10 text-lg leading-relaxed text-gray-700">
                Ken je dit: harder werken om hetzelfde resultaat in de gym te halen, langzamer
                herstel na een drukke week, minder zin om aan iets nieuws te beginnen? Op internet
                wordt dat snel teruggebracht tot &ldquo;testosteron&rdquo;. In de praktijk is het een
                deel van een groter plaatje: slaap, stress, voeding en beweging. Deze gids helpt je
                je verwachtingen bijstellen — zonder harde hormoonclaims over jouw lichaam.
              </p>

              <p className="mt-6 text-sm text-gray-500">
                Benieuwd hoe jouw profiel scoort? Scroll naar beneden voor de gratis Leefstijlcheck.
              </p>

              <section id="herkenning" className="mt-12 scroll-mt-24">
                <h2 className="font-serif text-3xl font-bold text-gray-900">Ken Je Dit?</h2>
                <p className="mt-4 text-lg leading-relaxed text-gray-700">
                  Veel mannen 40+ merken veranderingen die ze online snel aan hormonen koppelen.
                  Herkenning is nuttig — zelf-diagnose niet.
                </p>
                <p className="mt-6 font-medium text-gray-700">Ken je dit:</p>
                <ul className="mt-3 list-inside list-disc space-y-2 text-gray-700">
                  <li>Je moet harder trainen voor hetzelfde resultaat — of het voelt alsof je spiermassa stilstaat</li>
                  <li>Herstel na zware weken duurt merkbaar langer dan vroeger</li>
                  <li>Je libido of ochtenddrive voelt lager, zonder duidelijke externe oorzaak</li>
                  <li>Na stressvolle periodes voel je je langer &ldquo;leeg&rdquo; dan verwacht</li>
                  <li>Je slaap is onrustig terwijl je overdag wél doorzet</li>
                  <li>Je vraagt je af of &ldquo;het hormonen zijn&rdquo; — maar je weet het niet zeker</li>
                </ul>
                <p className="mt-6 leading-relaxed text-gray-700">
                  Als je hier drie of meer van herkent, lees verder. Dat is geen medische uitspraak
                  — wel een signaal om slaap, stress, training en eventueel bloedonderzoek met je
                  huisarts te bespreken.
                </p>
              </section>

              <section id="wat-verandert" className="mt-14 scroll-mt-24">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Wat gemiddeld verandert na 40
                </h2>
                <p className="mt-4 leading-relaxed text-gray-700">
                  Onderzoek bij grote groepen mannen laat zien dat het testosteron gemiddeld langzaam
                  daalt met de leeftijd. De verschillen tussen mannen zijn wel groot.{" "}
                  <Link href="/kennisbank/testosteron" className={LINK}>
                    Testosteron in de kennisbank
                  </Link>{" "}
                  legt begrippen uit; hieronder de praktische kaders.
                </p>

                <h3 className="mt-8 text-xl font-semibold text-gray-900">
                  1. Totaal vs vrij testosteron
                </h3>
                <p className="mt-3 leading-relaxed text-gray-700">
                  Bloedwaarden laten vaak het totale testosteron zien (gebonden + vrij) en soms het
                  vrije testosteron — het deel dat je lichaam echt gebruikt. Beide kunnen los van
                  elkaar veranderen. Eén getal op een uitslag zegt dus weinig. Een arts leest zo&apos;n
                  waarde altijd samen met je klachten, het tijdstip van de meting en andere
                  bloedwaarden.
                </p>

                <h3 className="mt-8 text-xl font-semibold text-gray-900">
                  2. Leeftijdstrend is geen individuele voorspelling
                </h3>
                <p className="mt-3 leading-relaxed text-gray-700">
                  Onderzoek dat mannen jarenlang volgt, laat vanaf de middelbare leeftijd gemiddeld
                  zo&apos;n 1% daling per jaar zien. Maar de verschillen zijn enorm. Sommige mannen
                  blijven ruim binnen de normale waarden, anderen merken meer. Vermoeidheid alleen is
                  geen reden om aan hormoontherapie te beginnen zonder medisch onderzoek.
                </p>

                <h3 className="mt-8 text-xl font-semibold text-gray-900">
                  3. Slaap en gewicht wegen zwaarder dan je denkt
                </h3>
                <p className="mt-4 leading-relaxed text-gray-700">
                  Slaaptekort en overgewicht komen in onderzoek vaker voor bij mannen met lagere
                  testosteronwaarden. Het hangt dus samen, maar het is geen simpel oorzaak-gevolg voor
                  jou persoonlijk. Beter slapen en werken aan je lichaamssamenstelling (minder vet,
                  meer spier) kan onderdeel zijn van een medisch plan, maar we beloven hier niets over
                  jouw bloedwaarden.
                </p>
              </section>

              <section id="hpa-as" className="mt-14 scroll-mt-24">
                <h3 className="font-serif text-2xl font-bold text-gray-900">
                  Stress, cortisol en de HPA-as
                </h3>
                <p className="mt-4 leading-relaxed text-gray-700">
                  Langdurige stress activeert de stress-as in je lichaam, ook wel de HPA-as genoemd
                  (hypothalamus-hypofyse-bijnier-as).{" "}
                  <Link href="/kennisbank/cortisol" className={LINK}>
                    Cortisol
                  </Link>{" "}
                  en testosteron worden vaak in één adem genoemd. Onderzoek bij grote groepen laat
                  zien dat ze op elkaar inwerken, maar het is geen simpele regel van &ldquo;hoog
                  cortisol = laag testosteron&rdquo; voor elke man. Praktischer: lees{" "}
                  <Link href="/blog/cortisol-en-testosteron" className={LINK}>
                    cortisol en testosteron
                  </Link>{" "}
                  en de gids{" "}
                  <Link href="/stress-verminderen-man" className={LINK}>
                    stress verminderen
                  </Link>{" "}
                  voor wat je met je gedrag kunt doen — vóór je aan supplementen denkt.
                </p>
              </section>

              <section id="leefstijl" className="mt-14 scroll-mt-24">
                <h2 className="font-serif text-3xl font-bold text-gray-900">Leefstijl Eerst</h2>
                <p className="mt-4 leading-relaxed text-gray-700">
                  Geen enkel supplement vervangt de basis. Deze hefbomen hebben het meeste bewijs
                  rond energie, herstel en mannelijke gezondheid in brede zin:
                </p>

                <h3 className="mt-8 text-xl font-semibold text-gray-900">1. Slaap en ritme</h3>
                <p className="mt-3 leading-relaxed text-gray-700">
                  Vast bed- en wakker-tijdstip, minder schermlicht &apos;s avonds, geen alcohol als
                  slaapmiddel. Bij cumulatief tekort: zie{" "}
                  <Link href="/kennisbank/slaapschuld" className={LINK}>
                    slaapschuld
                  </Link>{" "}
                  en de gids{" "}
                  <Link href="/slaap-verbeteren-na-40" className={LINK}>
                    slaap verbeteren na 40
                  </Link>
                  .
                </p>

                <h3 className="mt-8 text-xl font-semibold text-gray-900">
                  2. Krachttraining en eiwit
                </h3>
                <p className="mt-3 leading-relaxed text-gray-700">
                  2–3× per week krachttraining met progressieve belasting ondersteunt spierbehoud —
                  relevant naast hormoonverhalen, geen vervanging van medische beoordeling. Eiwit
                  (≈1,6–2 g/kg lichaamsgewicht als richtlijn met je diëtist/arts) en herstel: zie{" "}
                  <Link href="/herstel-verbeteren-na-40" className={LINK}>
                    herstel verbeteren na 40
                  </Link>{" "}
                  en{" "}
                  <Link href="/blog/creatine-en-herstel" className={LINK}>
                    creatine en herstel
                  </Link>
                  .
                </p>

                <h3 className="mt-8 text-xl font-semibold text-gray-900">3. Stress en grenzen</h3>
                <p className="mt-3 leading-relaxed text-gray-700">
                  Chronische werkbelasting zonder herstelweeks kan libido, slaap en trainingszin
                  ondermijnen — ongeacht één labwaarde. Start met{" "}
                  <Link href="/blog/ademhaling-tegen-stress" className={LINK}>
                    ademhaling tegen stress
                  </Link>{" "}
                  en structurele grenzen op werk.
                </p>

                <h3 className="mt-8 text-xl font-semibold text-gray-900">
                  4. Gewicht en beweging overdag
                </h3>
                <p className="mt-3 leading-relaxed text-gray-700">
                  Buikvet en weinig beweging op een dag hangen in onderzoek samen met minder gunstige
                  hormoonwaarden. Dagelijks wandelen na het eten en bewust lichtere trainingsweken
                  passen bij mannen die te veel trainen — zie profiel{" "}
                  <Link href="/profiel/overtrainer" className={LINK}>
                    Overtrainer
                  </Link>
                  .
                </p>

                <h3 className="mt-8 text-xl font-semibold text-gray-900">
                  5. Medische baseline
                </h3>
                <p className="mt-3 leading-relaxed text-gray-700">
                  Blijven klachten aanhouden ondanks basis-leefstijl? Bespreek met je huisarts
                  bloedonderzoek (totaal en eventueel vrij testosteron, schildklier, vitamine D,
                  bloedbeeld) — niet zelf interpreteren via marketing.
                </p>
              </section>

              <section id="profielen" className="mt-14 scroll-mt-24">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Herken Je Dit Patroon?
                </h2>
                <p className="mt-4 leading-relaxed text-gray-700">
                  Testosteron-thema&apos;s overlappen met bestaande profielen — geen diagnose, wel
                  herkenning:
                </p>

                <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-5">
                  <p className="text-sm leading-relaxed text-gray-700">
                    <strong className="text-gray-900">Stressdrager:</strong> piekeren, slecht
                    landen &apos;s nachts, kort lontje — stress en slaap als eerste hefboom.
                  </p>
                  <Link
                    href="/profiel/stressdrager"
                    className="mt-2 inline-block text-sm font-semibold text-ps-green hover:underline"
                  >
                    Bekijk het Stressdrager-profiel →
                  </Link>
                </div>

                <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-5">
                  <p className="text-sm leading-relaxed text-gray-700">
                    <strong className="text-gray-900">Lage batterij:</strong> structurele
                    vermoeidheid, middagdips — energie breder dan één hormoon.
                  </p>
                  <Link
                    href="/profiel/lage-batterij"
                    className="mt-2 inline-block text-sm font-semibold text-ps-green hover:underline"
                  >
                    Bekijk het Lage Batterij-profiel →
                  </Link>
                </div>

                <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-5">
                  <p className="text-sm leading-relaxed text-gray-700">
                    <strong className="text-gray-900">Overtrainer:</strong> veel volume, weinig
                    buffer — herstel vóór extra supplementen.
                  </p>
                  <Link
                    href="/profiel/overtrainer"
                    className="mt-2 inline-block text-sm font-semibold text-ps-green hover:underline"
                  >
                    Bekijk het Overtrainer-profiel →
                  </Link>
                </div>
              </section>

              <section id="supplementen" className="mt-14 scroll-mt-24">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Supplementen In Context
                </h2>
                <p className="mt-4 leading-relaxed text-gray-700">
                  Geen supplement vervangt een meting of medisch advies — en geen enkele combinatie
                  van supplementen verhoogt gegarandeerd je testosteron. Onderstaande opties passen
                  vooral bij{" "}
                  <strong className="text-gray-900">spierbehoud en krachttraining na 40</strong>,
                  naast slaap, eiwit via voeding en stressmanagement. Meer diepgang:{" "}
                  <Link href="/herstel-verbeteren-na-40" className={LINK}>
                    herstel verbeteren na 40
                  </Link>{" "}
                  en{" "}
                  <Link href="/blog/creatine-en-herstel" className={LINK}>
                    creatine en herstel
                  </Link>
                  .
                </p>

                <div className="mt-8 rounded-xl border border-stone-200 bg-stone-50 p-5">
                  <h3 className="font-semibold text-gray-900">Supplementen in onderzoek</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">
                    geen hormoon-oplossing
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-700">
                    Geen supplement vervangt medisch advies — en geen combinatie van supplementen
                    vervangt slaap, kracht en herstel.
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700">
                    <li>
                      <strong className="text-gray-900">Zink</strong> — bij een tekort kan het
                      bijdragen aan een normaal testosterongehalte in het bloed.{" "}
                      <Link href="/beste/zink" className={LINK}>
                        Bekijk de zink-vergelijking →
                      </Link>
                    </li>
                    <li>
                      <strong className="text-gray-900">Eiwitpoeder</strong> — handig als je
                      dagdoel (≈1,2–1,6 g/kg) lastig haalt via maaltijden; officieel erkend voor
                      groei en instandhouding van spiermassa bij training.{" "}
                      <Link href="/beste/eiwitpoeder" className={LINK}>
                        Bekijk de eiwitpoeder-vergelijking →
                      </Link>
                    </li>
                    <li>
                      <strong className="text-gray-900">Omega-3</strong> — EPA/DHA (de werkzame
                      visvetzuren) dragen bij aan een normaal hart bij voldoende inname; wordt
                      onderzocht rond spierstofwisseling,
                      geen hormoon-belofte.{" "}
                      <Link href="/beste/omega-3-supplement" className={LINK}>
                        Bekijk de omega-3-vergelijking →
                      </Link>
                    </li>
                    <li>
                      <strong className="text-gray-900">Creatine</strong> — officieel erkend voor
                      korte, intense inspanning (≥3 g/dag); geen hormoonclaim, wel onderbouwd bij
                      krachttraining.{" "}
                      <Link href="/beste/creatine" className={LINK}>
                        Bekijk de creatine-vergelijking →
                      </Link>
                    </li>
                  </ul>
                </div>
              </section>

              <section id="aanpak" className="mt-14 scroll-mt-24">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Hoe Je Dit Aanpakt: Week voor Week
                </h2>

                <div className="mt-8 rounded-xl border border-stone-200 bg-stone-50 p-6">
                  <p className="text-lg font-semibold text-gray-900">Week 1 — Basis</p>
                  <ul className="mt-3 list-inside list-disc space-y-2 text-gray-700">
                    <li>Vast slaapritme (±30 min venster, ook weekend)</li>
                    <li>Eiwit bij ontbijt (≥25–30 g)</li>
                    <li>10 minuten ochtendlicht dagelijks</li>
                  </ul>
                </div>

                <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-6">
                  <p className="text-lg font-semibold text-gray-900">Week 2–3 — Verankeren</p>
                  <ul className="mt-3 list-inside list-disc space-y-2 text-gray-700">
                    <li>Krachttraining 2× per week met rustdagen ertussen</li>
                    <li>Stressroute: ademhaling of wandelen na werkdag</li>
                    <li>Trainingslog bijhouden — volume omlaag als herstel achterblijft</li>
                  </ul>
                </div>

                <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-6">
                  <p className="text-lg font-semibold text-gray-900">Week 4 — Meten</p>
                  <p className="mt-3 leading-relaxed text-gray-700">
                    Doe de{" "}
                    <Link href="/intake" className={LINK}>
                      Leefstijlcheck
                    </Link>{" "}
                    opnieuw. Vergelijk slaap-, stress- en energie-scores. Blijven klachten? Bespreek
                    bloedonderzoek met je huisarts — niet zelf supplementen stapelen.
                  </p>
                </div>
              </section>

              <section id="verder-lezen" className="mt-14 scroll-mt-24">
                <h2 className="font-serif text-3xl font-bold text-gray-900">Verder Lezen</h2>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Link
                    href="/blog/cortisol-en-testosteron"
                    className="group block rounded-xl border border-stone-200 bg-stone-50 p-5 transition-colors hover:border-ps-green/30"
                  >
                    <p className="text-sm leading-relaxed text-gray-700">
                      Cortisol en testosteron: hoe de stress-as werkt, zonder mythes.
                    </p>
                    <span className="mt-3 inline-block text-sm font-semibold text-ps-green group-hover:underline">
                      Lees het artikel →
                    </span>
                  </Link>
                  <Link
                    href="/blog/zink-en-testosteron"
                    className="group block rounded-xl border border-stone-200 bg-stone-50 p-5 transition-colors hover:border-ps-green/30"
                  >
                    <p className="text-sm leading-relaxed text-gray-700">
                      Zink en testosteron: wat officieel erkend is — en wat marketing erbovenop zet.
                    </p>
                    <span className="mt-3 inline-block text-sm font-semibold text-ps-green group-hover:underline">
                      Lees het artikel →
                    </span>
                  </Link>
                  <Link
                    href="/blog/testosteron-en-energie-na-40"
                    className="group block rounded-xl border border-stone-200 bg-stone-50 p-5 transition-colors hover:border-ps-green/30 sm:col-span-2"
                  >
                    <p className="text-sm leading-relaxed text-gray-700">
                      Testosteron en energie na 40: vermoeidheid is breder dan één bloedwaarde.
                    </p>
                    <span className="mt-3 inline-block text-sm font-semibold text-ps-green group-hover:underline">
                      Lees het artikel →
                    </span>
                  </Link>
                </div>

                <p className="mt-6 text-sm text-gray-600">
                  Wil je een compact overzicht per e-mail?{" "}
                  <Link href="/gids/testosteron" className={LINK}>
                    Vraag de gratis testosterongids aan
                  </Link>
                  .
                </p>
              </section>

              <section id="leefstijlcheck" className="mt-14 scroll-mt-24">
                <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
                  <h2 className="font-serif text-2xl font-bold text-gray-900 md:text-3xl">
                    Ontdek Waar Jij Staat
                  </h2>
                  <p className="mx-auto mt-3 max-w-lg leading-relaxed text-gray-600">
                    Testosteron speelt mee in een groter plaatje. In 3 minuten zie je hoe je scoort
                    op slaap, stress, energie, herstel, voeding en beweging — en welk profiel past.
                  </p>
                  <IntakeCtaMicro className="mx-auto mt-4 max-w-lg text-sm text-gray-500" />
                  <Link
                    href="/intake"
                    className="mt-5 inline-block rounded-lg bg-green-700 px-8 py-3 font-semibold text-white transition-colors hover:bg-green-800"
                  >
                    Zie waar jouw slaap, stress en energie scoren — gratis →
                  </Link>
                </div>
              </section>

              <section id="veelgestelde-vragen" className="mt-14 scroll-mt-24">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Veelgestelde Vragen
                </h2>
                <div className="mt-6 space-y-3">
                  {faqItems.map((item) => (
                    <details
                      key={item.q}
                      className="group overflow-hidden rounded-xl border border-stone-200"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold text-gray-900 transition-colors hover:bg-stone-50">
                        {item.q}
                        <span className="shrink-0 text-xl leading-none text-green-700 transition-transform duration-200 group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <div className="px-5 pb-5 leading-relaxed text-gray-700">{item.a}</div>
                    </details>
                  ))}
                </div>
              </section>

              <ReferenceList references={testosteronNa40References} />
              <MedicalDisclaimer />
            </article>
            </PillarReadingChrome>
          </div>
        </Container>
      </main>
      <PillarStickyIntakeCta />
    </>
  );
}
