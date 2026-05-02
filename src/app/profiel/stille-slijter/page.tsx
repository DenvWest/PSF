import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Niet Ziek, Maar Ook Niet Fit? Dit Is Waarom | PerfectSupplement",
  description:
    "Je functioneert, maar op halve kracht. Niet één ding is echt mis — maar alles voelt net iets te zwaar. Herken je dit?",
  alternates: {
    canonical: "https://perfectsupplement.nl/profiel/stille-slijter",
  },
  openGraph: {
    title: "Niet Ziek, Maar Ook Niet Fit? Dit Is Waarom",
    description:
      "Je functioneert, maar op halve kracht. Ontdek wat er aan de hand is en wat helpt.",
    url: "https://perfectsupplement.nl/profiel/stille-slijter",
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
        name: "Stille Slijter",
        item: "https://perfectsupplement.nl/profiel/stille-slijter",
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Stille Slijter: Niet Ziek, Maar Ook Niet Fit",
    description:
      "Je functioneert, maar op halve kracht. Ontdek wat er aan de hand is en wat helpt.",
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
  "Je bent niet ziek, maar je voelt je ook niet goed. Als iemand vraagt hoe het gaat, zeg je 'prima' — maar je meent het niet. Je kunt niet benoemen wat er mis is, want er is niet één ding. Het is alles een beetje.",
  "Je energie is matig, je slaap is matig, je humeur is matig. Niets is alarmerend, maar niets is goed. Je leeft op 60% — en je bent dat normaal gaan vinden.",
  "Je bent gestopt met dingen die je vroeger leuk vond. Niet bewust, het is er gewoon bij ingeschoten. Sporten, hobby's, vrienden zien — het kost meer energie dan het oplevert, dus laat je het.",
  "Je herstelt langzamer dan vroeger. Een avondje uit, een slechte nacht, een drukke week — het duurt dagen voor je weer op niveau bent. Vroeger schudde je dat af.",
  "Je merkt dat je meer leeft op automatische piloot dan op motivatie. De dagen lijken op elkaar. Niet ongelukkig, maar ook niet vervuld.",
];

const quickWins = [
  {
    number: "1",
    title: "Stel een vast slaapritme in — ook in het weekend",
    body: "Je circadiaan ritme heeft regelmaat nodig. Ga elke dag op dezelfde tijd naar bed en sta op dezelfde tijd op. Maximaal 30 minuten verschil, ook op zaterdag. Na 1–2 weken merk je dat je makkelijker inslaapt en frisser wakker wordt.",
  },
  {
    number: "2",
    title: "Drink 2–2,5 liter water per dag",
    body: "Klinkt basaal, maar de meeste mannen zitten op de helft. Dehydratie veroorzaakt vermoeidheid, concentratieproblemen en hoofdpijn — precies de vage klachten van het stille slijten. Zet een fles op je bureau en maak het zichtbaar.",
  },
  {
    number: "3",
    title: "Wandel 20 minuten per dag — buiten, zonder telefoon",
    body: "Daglicht, frisse lucht en lichte beweging in combinatie. Het verbetert je slaap, verlaagt je cortisol en geeft je energie. Niet als workout, maar als dagelijkse reset.",
  },
];

const weekPlan = [
  {
    week: "Week 1",
    title: "De Basis",
    description:
      "Vast slaapritme, 2 liter water, 20 minuten wandelen. Meer niet. Doe dit 7 dagen achter elkaar voordat je iets toevoegt.",
  },
  {
    week: "Week 2–3",
    title: "Opbouwen",
    description:
      "Voeg voedingsverbeteringen toe: meer eiwit bij het ontbijt, meer groente, 2× per week vette vis of start met omega-3. Begin eventueel met magnesium glycinaat in de avond.",
  },
  {
    week: "Week 4",
    title: "Meten",
    description:
      "Doe de Leefstijlcheck opnieuw. Vergelijk al je domeinscores met 4 weken geleden. Bij het Stille Slijter profiel zie je vaak brede, subtiele verbetering — niet spectaculair op één domein, maar merkbaar op meerdere.",
  },
];

export default function StilleSlijterPage() {
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
                  <span className="text-slate-600">Stille Slijter</span>
                </li>
              </ol>
            </nav>

            {/* Hero */}
            <section className="pt-10 pb-14">
              <span className="inline-block text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-4">
                Profiel
              </span>
              <h1 className="font-[var(--font-heading)] text-3xl md:text-5xl text-slate-900 leading-tight max-w-2xl">
                Stille Slijter: Niet Ziek, Maar Ook Niet Fit
              </h1>
              <p className="mt-5 text-xl text-slate-600 max-w-2xl leading-relaxed">
                Je functioneert. Je draait mee. Maar ergens weet je: dit is niet hoe het hoort te
                voelen. Niet één ding is echt mis — maar alles kost net iets te veel.
              </p>
              <div className="mt-8">
                <Link
                  href="/intake"
                  className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
                >
                  Ontdek waar jij staat →
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
                Als je hier drie of meer van herkent, dan slijt je stil. Niet dramatisch, niet
                acuut — maar wel structureel. En dat verdient aandacht.
              </p>
            </section>

            {/* Wat er aan de hand is */}
            <section id="uitleg" className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">
                Wat Er Aan De Hand Is
              </h2>
              <div className="mt-6 space-y-5">
                <p className="text-slate-600 leading-relaxed">
                  Het stille slijten is het lastigste profiel om te herkennen, juist omdat er geen
                  duidelijke rode vlag is. Je hebt geen ernstig slaapprobleem, geen burn-out, geen
                  specifieke klacht. Maar meerdere systemen in je lichaam functioneren net onder het
                  optimale niveau.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Na je 40e gebeuren er meerdere dingen tegelijk. Je testosteron daalt geleidelijk.
                  Je stofwisseling vertraagt. Je slaap wordt lichter. Je herstelvermogen neemt af.
                  Elk van die veranderingen is op zich klein — maar samen creëren ze een patroon dat
                  je langzaam leegtrekt.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Het is alsof je auto op alle cilinders een beetje hapert. Geen enkele is kapot,
                  maar het totaalplaatje is dat je niet meer soepel rijdt. De meeste mannen in dit
                  profiel compenseren met wilskracht en routine. Dat werkt — tot het niet meer werkt.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Het goede nieuws: omdat het probleem breed is, hoef je niet alles tegelijk aan te
                  pakken. De sleutel is beginnen bij het fundament — slaap en voeding — en van
                  daaruit opbouwen.
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
                Focus op de basis. Niet drie domeinen tegelijk, maar het fundament:
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
                Als meerdere domeinen onder druk staan, zijn er twee supplementen die breed
                ondersteunen:
              </p>

              <div className="space-y-5">
                {/* Omega-3 */}
                <div className="border border-slate-200 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-900 text-base">Omega-3 (EPA/DHA)</h4>
                  <div className="mt-3 space-y-3">
                    <p className="text-slate-600 leading-relaxed">
                      Omega-3 is relevant voor bijna elk domein dat bij de Stille Slijter onder
                      druk staat: het ondersteunt je energieproductie, je breinfunctie, je
                      spierherstel en je stemmingsregulatie. De meeste Nederlanders krijgen
                      structureel te weinig omega-3 binnen — en dat tekort uit zich in precies de
                      vage, brede klachten die je herkent.
                    </p>
                  </div>
                  <p className="text-slate-500 text-sm mt-4">
                    Welke omega-3 is écht goed? We vergeleken op EPA/DHA-gehalte,
                    biobeschikbaarheid en prijs per maand.
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
                      Magnesium is betrokken bij meer dan 300 processen — van energieproductie tot
                      spierontspanning tot slaapkwaliteit. Bij het Stille Slijter profiel, waar
                      alles net iets onder het optimum zit, kan magnesium als breed werkende
                      bouwsteen het verschil maken. Kies magnesium glycinaat voor de beste opname
                      en het kalmerende effect.
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
                Het stille slijten doorbreek je niet in één week. Maar met consistent kleine stappen
                merk je na 2–3 weken een verschil — eerst in je slaap, dan in je energie, dan in je
                humeur.
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
                  Ontdek Waar Jij Staat
                </h2>
                <p className="text-slate-600 mt-4 leading-relaxed max-w-xl mx-auto">
                  De Leefstijlcheck meet 6 gezondheidsdomeinen in 3 minuten. Je ziet precies welke
                  gebieden aandacht nodig hebben — en waar je het snelst resultaat boekt.
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
                    Altijd moe na 40? Misschien is energie je primaire aandachtspunt.
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
                    Stress die zich opstapelt? Herken de signalen.
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
                vervanging voor professioneel medisch advies. Als je klachten aanhouden ondanks
                leefstijlaanpassingen, of als je merkt dat je stemming structureel daalt, neem dan
                contact op met je huisarts.
              </p>
            </aside>
          </article>
        </Container>
      </main>
    </>
  );
}
