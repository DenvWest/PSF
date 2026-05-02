import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Te Weinig Beweging Na 40? Dit Doet Het Met Je Lichaam | PerfectSupplement",
  description:
    "Je weet dat je meer moet bewegen. Maar het lukt niet, of je komt er niet aan toe. Ontdek wat stilzitten doet na 40 en hoe je begint.",
  alternates: {
    canonical: "https://perfectsupplement.nl/profiel/stilzitter",
  },
  openGraph: {
    title: "Te Weinig Beweging Na 40? Dit Doet Het Met Je Lichaam",
    description: "Ontdek wat stilzitten doet na 40 en hoe je weer in beweging komt.",
    url: "https://perfectsupplement.nl/profiel/stilzitter",
    type: "article",
  },
};

const breadcrumbJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://perfectsupplement.nl",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Profielen",
        item: "https://perfectsupplement.nl/profiel",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Stilzitter",
        item: "https://perfectsupplement.nl/profiel/stilzitter",
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Stilzitter: Te Weinig Beweging Na 40",
    description:
      "Ontdek wat stilzitten doet met je lichaam na 40 en hoe je weer in beweging komt.",
    author: {
      "@type": "Organization",
      name: "PerfectSupplement",
      url: "https://perfectsupplement.nl",
    },
    publisher: {
      "@type": "Organization",
      name: "PerfectSupplement",
    },
    datePublished: "2026-05-02",
    dateModified: "2026-05-02",
  },
];

const herkenningBullets = [
  "Je zit de hele dag. Op kantoor, in de auto, op de bank. Als je eerlijk telt, beweeg je misschien 20 minuten per dag — en dat is inclusief de trap naar je slaapkamer.",
  "Je weet dat je moet bewegen, maar je komt er niet aan toe. Na een werkdag heb je geen energie meer. In het weekend heb je andere prioriteiten. Het schuift, elke week weer.",
  "Toen je begin dertig was, kon je zonder opwarmen een potje voetbal spelen. Nu voel je het drie dagen als je een keer de tuin hebt gedaan. Je lichaam protesteert bij elke onverwachte inspanning.",
  "Je merkt het aan je gewicht. Niet dramatisch, maar geleidelijk. Elk jaar een kilo erbij, rond je middel. Je broeken worden krapper. Diëten helpt even, maar het komt terug.",
  "Je ademhaling is oppervlakkig geworden. Twee trappen op en je bent buiten adem. Niet zorgwekkend, maar het herinnert je eraan dat je conditie niet is wat het was.",
];

const quickWins = [
  {
    number: "1",
    title: "Wandel 15 minuten per dag — aaneengesloten, buiten",
    body: "Niet als workout maar als gewoonte. Na de lunch, voor het avondeten, of 's ochtends voor je begint. Loop zonder telefoon, zonder podcast, zonder doel. Gewoon lopen. Na een week verhoog je naar 20 minuten, na twee weken naar 30.",
  },
  {
    number: "2",
    title: "Sta elk uur 5 minuten op",
    body: "Zet een timer. Loop naar de keuken, doe een paar rekoefeningen, loop de trap op en neer. Het doorbreekt het langdurig zitten dat je stofwisseling op pauze zet. Onderzoek laat zien dat regelmatig opstaan effectiever is dan één keer per dag intensief sporten.",
  },
  {
    number: "3",
    title: "Neem overal de trap",
    body: "Geen lift, geen roltrap. Het klinkt triviaal, maar traplopen is een van de effectiefste vormen van dagelijkse beweging: het traint je bovenbenen, je conditie en je balans. Drie verdiepingen per dag is al merkbaar na een maand.",
  },
];

const weekPlan = [
  {
    week: "Week 1",
    title: "Wandelen",
    description:
      "15 minuten per dag, elk uur opstaan, overal de trap. Dat is alles. Geen sportschool, geen sportkleding, geen drempel.",
  },
  {
    week: "Week 2–3",
    title: "Opbouwen",
    description:
      "Verhoog naar 20–30 minuten wandelen. Voeg 2× per week 10 minuten lichaamseigen oefeningen toe: squats, push-ups (desnoods tegen de muur), planken. Start eventueel met magnesium als je spierstijfheid merkt.",
  },
  {
    week: "Week 4",
    title: "Meten",
    description:
      "Doe de Leefstijlcheck opnieuw. Vergelijk je bewegingsscore met 4 weken geleden. Let ook op je energiescore en slaapscore — beweging verbetert beide.",
  },
];

export default function StilzitterPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main>
        <Container>
          <article>
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="pt-6 pb-2">
              <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-400">
                <li className="flex items-center gap-1">
                  <Link href="/" className="hover:text-slate-600 transition-colors">
                    Home
                  </Link>
                  <span aria-hidden="true">/</span>
                </li>
                <li className="flex items-center gap-1">
                  <Link href="/profiel" className="hover:text-slate-600 transition-colors">
                    Profielen
                  </Link>
                  <span aria-hidden="true">/</span>
                </li>
                <li>
                  <span className="text-slate-600">Stilzitter</span>
                </li>
              </ol>
            </nav>

            {/* Hero */}
            <section className="pt-10 pb-14">
              <span className="inline-block text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-4">
                Profiel
              </span>
              <h1 className="font-[var(--font-heading)] text-3xl md:text-5xl text-slate-900 leading-tight max-w-2xl">
                Stilzitter: Te Weinig Beweging Na 40
              </h1>
              <p className="mt-5 text-xl text-slate-600 max-w-2xl leading-relaxed">
                Je weet dat je meer moet bewegen. Dat is niet het probleem. Het probleem is beginnen
                — en volhouden. En hoe langer je wacht, hoe zwaarder het voelt.
              </p>
              <div className="mt-8">
                <Link
                  href="/intake"
                  className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
                >
                  Ontdek hoe beweging jouw gezondheid beïnvloedt →
                </Link>
              </div>
            </section>

            {/* Herkenning */}
            <section id="herkenning" className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">
                Ken Je Dit?
              </h2>
              <ul className="mt-6 space-y-3" role="list">
                {herkenningBullets.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-4 bg-slate-50 rounded-xl p-5">
                    <span
                      className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <svg
                        className="w-3.5 h-3.5 text-emerald-600"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2 7L5.5 10.5L12 3.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <p className="text-slate-700 leading-relaxed">{bullet}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-slate-600 font-medium">
                Als je hier drie of meer van herkent, dan is het geen luiheid — het is een patroon
                dat steeds moeilijker te doorbreken wordt. Tenzij je nu begint.
              </p>
            </section>

            {/* Wat er aan de hand is */}
            <section id="uitleg" className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">
                Wat Er Aan De Hand Is
              </h2>
              <div className="mt-6 space-y-5">
                <p className="text-slate-600 leading-relaxed">
                  Na je 40e verlies je gemiddeld 3–5% spiermassa per decennium — als je niets doet.
                  Dat heet sarcopenie, en het begint eerder dan de meeste mannen denken. Minder
                  spiermassa betekent een tragere stofwisseling, minder calorieën verbranden in
                  rust, en makkelijker vet opslaan. Het is een spiraal: minder spieren → minder
                  verbranding → meer vet → minder zin om te bewegen → nog minder spieren.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Daar komt bij: stilzitten is niet hetzelfde als niet sporten. Je kunt drie keer
                  per week naar de sportschool gaan en toch een &lsquo;stilzitter&rsquo; zijn als je de
                  overige uren van de dag zit. Het gaat om je totale dagelijkse beweging — en die is
                  bij de meeste kantoorbanen ver onder het minimum.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  De gevolgen gaan verder dan je gewicht. Te weinig beweging verslechtert je
                  insulinegevoeligheid, verlaagt je testosteron, verslechtert je slaapkwaliteit en
                  vermindert je botdichtheid. Het zijn stille processen die je niet voelt tot ze
                  problemen worden.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Maar hier is het goede nieuws: je lichaam reageert op elke leeftijd op beweging.
                  Of je nu 42 bent of 58 — als je begint met bewegen, bouw je spiermassa op,
                  verbetert je stofwisseling en stijgt je energieniveau. De drempel is beginnen. En
                  die drempel is lager dan je denkt.
                </p>
              </div>
            </section>

            {/* Wat je nu kunt doen */}
            <section id="aanpak" className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">
                Wat Je Nu Kunt Doen
              </h2>

              <h3 className="font-semibold text-lg text-slate-900 mt-8 mb-2">
                Quick Wins — Deze Week
              </h3>
              <p className="text-slate-600 mb-5">
                Vergeet de sportschool even. Begin met dagelijkse beweging die geen wilskracht kost:
              </p>
              <div className="space-y-4">
                {quickWins.map((item) => (
                  <div key={item.number} className="flex items-start gap-5 bg-slate-50 rounded-xl p-6">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">
                      {item.number}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-slate-600 mt-2 leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="font-semibold text-lg text-slate-900 mt-10 mb-2">
                Supplementen Die Helpen Bij Dit Profiel
              </h3>
              <p className="text-slate-600 mb-6">
                Beweging is de interventie — supplementen ondersteunen het proces. Twee zijn
                relevant voor het Stilzitter profiel:
              </p>

              <div className="space-y-5">
                {/* Magnesium */}
                <div className="border border-slate-200 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-900 text-base">Magnesium</h4>
                  <div className="mt-3 space-y-3">
                    <p className="text-slate-600 leading-relaxed">
                      Als je meer gaat bewegen, stijgt je magnesiumbehoefte. Magnesium is essentieel
                      voor spiercontractie, energieproductie en het voorkomen van krampen. Bij
                      mannen die van weinig beweging naar meer beweging gaan, is magnesiumtekort een
                      veelvoorkomende oorzaak van spierpijn en stijfheid. Glycinaat is de best
                      opneembare vorm.
                    </p>
                  </div>
                  <p className="text-slate-500 text-sm mt-4">
                    Welke magnesium vorm past bij jou? Glycinaat, bisglycinaat of citraat —
                    objectief vergeleken op opname en prijs.
                  </p>
                  <Link
                    href="/beste-magnesium"
                    className="inline-block mt-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    Bekijk de magnesium vergelijking →
                  </Link>
                </div>

                {/* Omega-3 */}
                <div className="border border-slate-200 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-900 text-base">Omega-3 (EPA/DHA)</h4>
                  <div className="mt-3 space-y-3">
                    <p className="text-slate-600 leading-relaxed">
                      Omega-3 ondersteunt je gewrichten en vermindert ontstekingsreacties — relevant
                      als je lichaam weer moet wennen aan beweging. EPA heeft een
                      ontstekingsremmend effect dat spierherstel ondersteunt en gewrichtsstijfheid
                      vermindert. Vooral in de eerste weken van meer bewegen merk je daar het
                      verschil van.
                    </p>
                  </div>
                  <p className="text-slate-500 text-sm mt-4">
                    Welke omega-3 is écht goed? Vergeleken op EPA/DHA-gehalte, biobeschikbaarheid
                    en prijs.
                  </p>
                  <Link
                    href="/beste-omega-3-supplement"
                    className="inline-block mt-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    Bekijk de omega-3 vergelijking →
                  </Link>
                </div>
              </div>
            </section>

            {/* 30-Dagen Plan */}
            <section id="plan" className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">
                Je 30-Dagen Bewegingsplan
              </h2>
              <p className="mt-3 text-slate-600 leading-relaxed">
                Het doel is niet om een atleet te worden. Het doel is om dagelijkse beweging normaal
                te maken — iets dat je doet zonder erover na te denken.
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {weekPlan.map((step, index) => (
                  <div key={index} className="relative bg-slate-50 rounded-xl p-6">
                    <div className="inline-block bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      {step.week}
                    </div>
                    <h3 className="font-semibold text-slate-900 text-base">{step.title}</h3>
                    <p className="text-slate-600 mt-2 text-sm leading-relaxed">{step.description}</p>
                    {index < weekPlan.length - 1 && (
                      <span
                        className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-slate-300 text-lg"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* CTA Blok */}
            <section className="py-16">
              <div className="bg-emerald-50 rounded-2xl p-8 md:p-12 text-center">
                <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">
                  Ontdek Hoe Beweging Jouw Gezondheid Beïnvloedt
                </h2>
                <p className="text-slate-600 mt-4 leading-relaxed max-w-xl mx-auto">
                  De Leefstijlcheck meet je bewegingspatroon als onderdeel van 6
                  gezondheidsdomeinen. In 3 minuten weet je waar je staat en hoe beweging
                  samenhangt met je energie, slaap en herstel.
                </p>
                <Link
                  href="/intake"
                  className="inline-flex items-center mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-10 py-4 rounded-xl transition-colors text-base"
                >
                  Doe de gratis Leefstijlcheck
                </Link>
                <p className="mt-4 text-sm text-slate-400">
                  Gratis, anoniem, geen account nodig. Je krijgt direct je persoonlijke Herstelplan.
                </p>
              </div>
            </section>

            {/* Verder Lezen */}
            <section className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-xl text-slate-900 mb-6">
                Verder Lezen
              </h2>
              <div className="space-y-5">
                <div>
                  <p className="text-slate-600 text-sm">
                    Welke magnesium vorm past bij jou? Objectief vergeleken op opname en prijs.
                  </p>
                  <Link
                    href="/beste-magnesium"
                    className="text-emerald-600 hover:underline font-medium"
                  >
                    Bekijk de magnesium vergelijking →
                  </Link>
                </div>
                <div>
                  <p className="text-slate-600 text-sm">
                    Welke omega-3 is écht goed? Vergeleken op EPA/DHA, biobeschikbaarheid en prijs.
                  </p>
                  <Link
                    href="/beste-omega-3-supplement"
                    className="text-emerald-600 hover:underline font-medium"
                  >
                    Bekijk de omega-3 vergelijking →
                  </Link>
                </div>
                <div>
                  <p className="text-slate-600 text-sm">
                    Altijd moe, ook zonder veel te bewegen? Misschien speelt energie een grotere
                    rol.
                  </p>
                  <Link
                    href="/profiel/lage-batterij"
                    className="text-emerald-600 hover:underline font-medium"
                  >
                    Ben jij een Lage Batterij? →
                  </Link>
                </div>
                <div>
                  <p className="text-slate-600 text-sm">
                    Je eet wel, maar niet genoeg van het goede? Check je voedingsbasis.
                  </p>
                  <Link
                    href="/profiel/stille-tekorten"
                    className="text-emerald-600 hover:underline font-medium"
                  >
                    Heb jij Stille Tekorten? →
                  </Link>
                </div>
              </div>
            </section>

            {/* Disclaimer */}
            <aside className="py-8 border-t border-slate-100 text-xs text-slate-400">
              <p>
                PerfectSupplement geeft adviezen op basis van wetenschappelijk onderzoek, geen
                medische diagnoses. Onze Leefstijlcheck is een hulpmiddel voor zelfinzicht, geen
                vervanging voor professioneel medisch advies. Start geleidelijk met meer beweging.
                Bij gewrichtsklachten, pijn op de borst bij inspanning, of als je langer dan een
                jaar niet hebt gesport, raadpleeg eerst je huisarts voordat je begint met
                intensieve training.
              </p>
            </aside>
          </article>
        </Container>
      </main>
    </>
  );
}
