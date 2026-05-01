import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Altijd Moe Na 40? Dit Is Waarom | PerfectSupplement",
  description:
    "Je energie is op. Niet even, maar structureel. Herken je dit? Ontdek wat er aan de hand is en wat je eraan kunt doen.",
  alternates: {
    canonical: "https://perfectsupplement.nl/profiel/lage-batterij",
  },
  openGraph: {
    title: "Altijd Moe Na 40? Dit Is Waarom",
    description:
      "Je energie is op. Niet even, maar structureel. Ontdek wat er aan de hand is en wat helpt.",
    url: "https://perfectsupplement.nl/profiel/lage-batterij",
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
        name: "Lage Batterij",
        item: "https://perfectsupplement.nl/profiel/lage-batterij",
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Lage Batterij: Altijd Moe Na 40?",
    description:
      "Je energie is op. Niet even, maar structureel. Ontdek wat er aan de hand is en wat je eraan kunt doen.",
    author: {
      "@type": "Organization",
      name: "PerfectSupplement",
      url: "https://perfectsupplement.nl",
    },
    publisher: {
      "@type": "Organization",
      name: "PerfectSupplement",
    },
    datePublished: "2026-05-01",
    dateModified: "2026-05-01",
  },
];

const herkenningBullets = [
  "Je wekker gaat, maar je voelt je alsof je helemaal niet hebt geslapen. De dag is nog niet begonnen en je energie is al op.",
  "Om 10 uur 's ochtends grijp je naar je tweede koffie — niet omdat je ervan geniet, maar omdat je zonder niet functioneert.",
  "Na de lunch zak je weg. Niet een beetje, maar compleet. Je concentratie is weg, je motivatie ook. Om 15:00 is de dag eigenlijk al voorbij.",
  "'s Avonds heb je geen energie meer voor de dingen die je leuk vindt. Sporten? Geen zin. Tijd met je gezin? Je bent er wel, maar niet écht.",
  "In het weekend herstel je niet. Maandagochtend begin je weer met dezelfde lege tank.",
];

const quickWins = [
  {
    number: "1",
    title: "Eet binnen 30 minuten na het opstaan een eiwitrijk ontbijt",
    body: "Denk aan eieren, Griekse yoghurt met noten, of kwark met zaden. Eiwit stabiliseert je bloedsuiker en voorkomt de ochtend-crash die je kent van een boterham met hagelslag.",
  },
  {
    number: "2",
    title: "Stop na 14:00 met cafeïne",
    body: "Ja, ook die 'laatste' koffie om 15:00. Cafeïne heeft een halfwaardetijd van 5–6 uur. Die koffie om 15:00 zit om 21:00 nog half in je systeem en ondermijnt je slaapkwaliteit — waardoor je morgen weer moe wakker wordt.",
  },
  {
    number: "3",
    title: "Ga elke dag 10–15 minuten naar buiten in daglicht",
    body: "Het liefst 's ochtends. Daglicht reset je biologische klok en stimuleert je cortisolpiek op het juiste moment (ochtend = goed, avond = slecht). Dit kost niets en de impact is meetbaar.",
  },
];

const weekPlan = [
  {
    week: "Week 1",
    title: "Quick Wins",
    description:
      "Begin met de drie basisveranderingen: eiwitrijk ontbijt, geen cafeïne na 14:00, dagelijks daglicht. Focus alleen hierop — niet meer.",
  },
  {
    week: "Week 2–3",
    title: "Leefstijlaanpassingen",
    description:
      "Voeg toe: 20 minuten wandelen per dag, een vast slaapritme (ook in het weekend), en meer vette vis of een omega-3 supplement.",
  },
  {
    week: "Week 4",
    title: "Meten",
    description:
      "Doe de Leefstijlcheck opnieuw. Vergelijk je energiescore met 4 weken geleden. Waar is verbetering? Waar niet? Op basis daarvan stel je je aanpak bij.",
  },
];

export default function LageBatterijPage() {
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
                  <span className="text-slate-600">Lage Batterij</span>
                </li>
              </ol>
            </nav>

            {/* Hero */}
            <section className="pt-10 pb-14">
              <span className="inline-block text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-4">
                Profiel
              </span>
              <h1 className="font-[var(--font-heading)] text-3xl md:text-5xl text-slate-900 leading-tight max-w-2xl">
                Lage Batterij: Altijd Moe Na 40?
              </h1>
              <p className="mt-5 text-xl text-slate-600 max-w-2xl leading-relaxed">
                Je energie is niet even op — het is structureel. Elke dag weer. En nee, dat is niet
                &lsquo;normaal bij je leeftijd&rsquo;.
              </p>
              <div className="mt-8">
                <Link
                  href="/intake"
                  className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
                >
                  Ontdek waar jouw energie lekt →
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
                Als je hier drie of meer van herkent, lees dan verder. Je bent niet lui, je bent
                niet oud — er is iets anders aan de hand.
              </p>
            </section>

            {/* Wat er aan de hand is */}
            <section id="uitleg" className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">
                Wat Er Aan De Hand Is
              </h2>
              <div className="mt-6 space-y-5">
                <p className="text-slate-600 leading-relaxed">
                  Na je 40e verandert er iets fundamenteels in hoe je lichaam energie aanmaakt. Je
                  mitochondriën — de energiecentrales in elke cel van je lichaam — worden geleidelijk
                  minder efficiënt. Dat is een biologisch proces, geen karakterfout.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Tegelijk gebeuren er nog twee dingen. Ten eerste daalt je testosteronspiegel met
                  gemiddeld 1–2% per jaar. Testosteron speelt een directe rol in je energieniveau,
                  je motivatie en je spiermassa. Ten tweede wordt je stofwisseling trager: je lichaam
                  verbrandt minder calorieën in rust, slaat makkelijker vet op, en heeft meer moeite
                  om voedingsstoffen te absorberen.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Het resultaat is een cascade: minder energie → minder beweging → slechtere slaap →
                  nog minder energie. Die spiraal versterkt zichzelf. Maar het goede nieuws is dat je
                  hem kunt doorbreken — als je weet waar je moet beginnen.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  En daar gaat het vaak mis. De meeste mannen proberen het op te lossen met meer
                  koffie, meer wilskracht, of door het te negeren. Geen van die dingen werkt
                  structureel. Wat wél werkt: begrijpen welke bouwstenen je lichaam mist en die
                  gericht aanvullen.
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
                Je hoeft niet je hele leven om te gooien. Begin met drie dingen:
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
                Leefstijlaanpassingen zijn de basis. Maar als je lichaam structureel voedingsstoffen
                mist, kun je dat niet alleen met voeding oplossen. Twee supplementen zijn specifiek
                relevant voor het Lage Batterij profiel:
              </p>

              <div className="space-y-5">
                {/* Omega-3 */}
                <div className="border border-slate-200 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-900 text-base">Omega-3 (EPA/DHA)</h4>
                  <div className="mt-3 space-y-3">
                    <p className="text-slate-600 leading-relaxed">
                      EPA en DHA — de actieve omega-3 vetzuren — ondersteunen je mitochondriale
                      functie. Dat is relevant omdat je mitochondriën na 40 minder efficiënt worden.
                      Omega-3 helpt ze beter te functioneren, wat zich vertaalt in een stabieler
                      energieniveau door de dag.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      De meeste mannen in Nederland krijgen structureel te weinig omega-3 binnen. Je
                      zou 3–4 keer per week vette vis moeten eten (zalm, makreel, haring) om aan de
                      aanbevolen hoeveelheid te komen. Een supplement vult dit gat.
                    </p>
                  </div>
                  <p className="text-slate-500 text-sm mt-4">
                    Welke omega-3 is écht goed? We vergeleken op EPA/DHA-gehalte, biobeschikbaarheid
                    en prijs per maand.
                  </p>
                  <Link
                    href="/beste-omega-3-supplement"
                    className="inline-block mt-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    Bekijk de omega-3 vergelijking →
                  </Link>
                </div>

                {/* Magnesium */}
                <div className="border border-slate-200 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-900 text-base">Magnesium</h4>
                  <div className="mt-3 space-y-3">
                    <p className="text-slate-600 leading-relaxed">
                      Magnesium is betrokken bij meer dan 300 processen in je lichaam, waaronder
                      energieproductie en spierontspanning. Een tekort — dat bij naar schatting 50%
                      van de westerse bevolking voorkomt — uit zich in vermoeidheid, spierkrampen en
                      slechte slaap. Precies de klachten van het Lage Batterij profiel.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      Kies voor magnesium glycinaat of bisglycinaat: deze vormen worden het best
                      opgenomen en hebben een ontspannend effect dat ook je slaap ten goede komt.
                    </p>
                  </div>
                  <p className="text-slate-500 text-sm mt-4">
                    Welke magnesium vorm werkt het snelst? Glycinaat, bisglycinaat of citraat —
                    objectief vergeleken op opname en prijs.
                  </p>
                  <Link
                    href="/beste-magnesium"
                    className="inline-block mt-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    Bekijk de magnesium vergelijking →
                  </Link>
                </div>
              </div>
            </section>

            {/* 30-Dagen Plan */}
            <section id="plan" className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">
                Je 30-Dagen Plan
              </h2>
              <p className="mt-3 text-slate-600 leading-relaxed">
                Structurele verandering kost tijd. Maar met dit plan merk je na 2–3 weken de eerste
                resultaten.
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
                  Ontdek Waar Jouw Energie Lekt
                </h2>
                <p className="text-slate-600 mt-4 leading-relaxed max-w-xl mx-auto">
                  In 3 minuten weet je waar je staat op 6 gezondheidsdomeinen — en krijg je een
                  persoonlijk Herstelplan met concrete stappen.
                </p>
                <Link
                  href="/intake"
                  className="inline-flex items-center mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-10 py-4 rounded-xl transition-colors text-base"
                >
                  Doe de gratis Leefstijlcheck
                </Link>
                <p className="mt-4 text-sm text-slate-400">
                  Meer dan 500 mannen 40+ gingen je voor. Gratis, anoniem, geen account nodig.
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
                    Welke omega-3 is écht goed? We vergeleken de beste supplementen op EPA/DHA,
                    biobeschikbaarheid en prijs.
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
                    Welke magnesium vorm past bij jou? Glycinaat, bisglycinaat of citraat —
                    objectief vergeleken op opname en prijs.
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
                    Stress die zich opstapelt, dag na dag? Misschien herken je jezelf in een ander
                    profiel.
                  </p>
                  <Link
                    href="/profiel/stressdrager"
                    className="text-emerald-600 hover:underline font-medium"
                  >
                    Ben jij een Stressdrager? →
                  </Link>
                </div>
              </div>
            </section>

            {/* Disclaimer */}
            <aside className="py-8 border-t border-slate-100 text-xs text-slate-400">
              <p>
                PerfectSupplement geeft adviezen op basis van wetenschappelijk onderzoek, geen
                medische diagnoses. Onze Leefstijlcheck is een hulpmiddel voor zelfinzicht, geen
                vervanging voor professioneel medisch advies. Raadpleeg altijd een arts bij
                aanhoudende klachten.
              </p>
            </aside>
          </article>
        </Container>
      </main>
    </>
  );
}
