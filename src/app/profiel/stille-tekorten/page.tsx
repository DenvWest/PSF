import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Voedingstekorten Na 40? Zo Herken Je Ze | PerfectSupplement",
  description:
    "Je eet wel, maar niet genoeg van het goede. Ontdek welke voedingsstoffen je waarschijnlijk mist en hoe je dat aanpakt.",
  alternates: {
    canonical: "https://perfectsupplement.nl/profiel/stille-tekorten",
  },
  openGraph: {
    title: "Voedingstekorten Na 40? Zo Herken Je Ze",
    description: "Je eet wel, maar niet genoeg van het goede. Ontdek wat je mist en wat helpt.",
    url: "https://perfectsupplement.nl/profiel/stille-tekorten",
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
        name: "Stille Tekorten",
        item: "https://perfectsupplement.nl/profiel/stille-tekorten",
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Stille Tekorten: Je Eet Wel, Maar Niet Genoeg Van Het Goede",
    description:
      "Ontdek welke voedingsstoffen je waarschijnlijk mist na 40 en hoe je dat aanpakt.",
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
  "Je eet drie maaltijden per dag, maar als je eerlijk bent: het is vaak hetzelfde. Brood, pasta, iets met vlees. Vis? Misschien één keer per maand. Groente? Een beetje, maar niet genoeg.",
  "Je voelt je moe zonder duidelijke reden. Je slaapt redelijk, je beweegt een beetje, je hebt geen grote stressbron — maar toch mis je die scherpte die je vroeger had.",
  "Je bent vaker ziek dan je zou willen. Verkoudheden die langer duren, kleine wondjes die langzaam genezen, een immuunsysteem dat niet meer doet wat het moet.",
  "Je hebt last van spierkrampen, stijfheid of gewrichtspijn die je niet kunt verklaren. Geen blessure, geen overbelasting — het is er gewoon.",
  "Je weet eigenlijk wel dat je gezonder zou moeten eten, maar het voelt overweldigend. Waar begin je? Wat is echt belangrijk en wat is hype?",
];

const quickWins = [
  {
    number: "1",
    title: "Eet 2× per week vette vis",
    body: "Zalm, makreel, haring of sardines. Dit zijn de belangrijkste bronnen van EPA en DHA — de actieve omega-3 vetzuren die je lichaam niet zelf aanmaakt. Eén portie per week is beter dan geen, twee is het minimum voor een merkbaar effect.",
  },
  {
    number: "2",
    title: "Voeg bij elke maaltijd een handvol groente toe",
    body: "Niet als bijgerecht maar als vaste component. Broccoli bij het ontbijt-ei, spinazie door de pasta, een salade bij de lunch. Het doel is variatie — verschillende kleuren betekent verschillende voedingsstoffen.",
  },
  {
    number: "3",
    title: "Vervang één tussendoortje per dag door noten",
    body: "Walnoten, amandelen of cashewnoten. Ze bevatten magnesium, gezonde vetten en eiwit. Een handvol (30 gram) is genoeg. Het vervangt een koekje of cracker en levert je lichaam daadwerkelijk iets op.",
  },
];

const weekPlan = [
  {
    week: "Week 1",
    title: "De Basis Op Orde",
    description:
      "Eet 2× vette vis, noten als snack, groente bij elke maaltijd. Drink 2 liter water. Dit is je fundament — niet sexy, maar effectief.",
  },
  {
    week: "Week 2–3",
    title: "Supplementen Toevoegen",
    description:
      "Start met omega-3 (als je niet 3× per week vis eet) en eventueel magnesium glycinaat in de avond. Let op je energieniveau en slaap — de eerste effecten zijn daar vaak het snelst merkbaar.",
  },
  {
    week: "Week 4",
    title: "Meten",
    description:
      "Doe de Leefstijlcheck opnieuw. Vergelijk je voedingsscore met 4 weken geleden. Is die verbeterd? Kijk ook naar je energie- en herstelscore — die profiteren direct van betere voeding.",
  },
];

export default function StilleTekorten() {
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
                  <span className="text-slate-600">Stille Tekorten</span>
                </li>
              </ol>
            </nav>

            {/* Hero */}
            <section className="pt-10 pb-14">
              <span className="inline-block text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-4">
                Profiel
              </span>
              <h1 className="font-[var(--font-heading)] text-3xl md:text-5xl text-slate-900 leading-tight max-w-2xl">
                Stille Tekorten: Je Eet Wel, Maar Niet Genoeg Van Het Goede
              </h1>
              <p className="mt-5 text-xl text-slate-600 max-w-2xl leading-relaxed">
                Je slaat geen maaltijden over. Maar de bouwstenen die je lichaam nodig heeft —
                omega-3, magnesium, vitamine D — krijg je structureel te weinig binnen. En dat merk
                je.
              </p>
              <div className="mt-8">
                <Link
                  href="/intake"
                  className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
                >
                  Ontdek welke bouwstenen jij mist →
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
                Als je hier drie of meer van herkent, dan mist je lichaam waarschijnlijk essentiële
                bouwstenen. Dat is geen schande — het is de realiteit voor de meeste Nederlanders.
              </p>
            </section>

            {/* Wat er aan de hand is */}
            <section id="uitleg" className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">
                Wat Er Aan De Hand Is
              </h2>
              <div className="mt-6 space-y-5">
                <p className="text-slate-600 leading-relaxed">
                  De Nederlandse voeding is niet zo volledig als we denken. Onderzoek laat zien dat
                  de gemiddelde Nederlander structureel te weinig binnenkrijgt van omega-3 vetzuren,
                  magnesium en vitamine D. Na je 40e wordt dit probleem groter, om twee redenen.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Ten eerste neemt je absorptievermogen af. Je darmen nemen voedingsstoffen minder
                  efficiënt op dan op je 20e. Wat je eet, komt niet meer volledig aan waar het moet
                  zijn. Ten tweede stijgt je behoefte: je lichaam heeft meer bouwstenen nodig voor
                  herstel, immuunfunctie en energieproductie — precies op het moment dat je er
                  minder van opneemt.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Het resultaat is een stil tekort. Geen dramatisch gebrek dat op een bloedtest
                  springt, maar een chronisch net-te-weinig dat zich uit in vage klachten:
                  vermoeidheid, spierstijfheid, traag herstel, wisselend humeur.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Dit is het profiel waar supplementen het meest direct verschil maken — niet als
                  vervanging van goede voeding, maar als aanvulling op een basis die voor de meeste
                  mensen simpelweg niet toereikend is.
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
                Eerst de voeding verbeteren, dan pas supplementen:
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
                Bij het Stille Tekorten profiel is supplementatie het meest direct relevant. Niet
                als luxe, maar als praktische oplossing voor tekorten die je via voeding alleen
                moeilijk kunt dichten:
              </p>

              <div className="space-y-5">
                {/* Omega-3 */}
                <div className="border border-slate-200 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-900 text-base">Omega-3 (EPA/DHA)</h4>
                  <div className="mt-3 space-y-3">
                    <p className="text-slate-600 leading-relaxed">
                      De meeste Nederlanders krijgen 50–80% minder omega-3 binnen dan aanbevolen.
                      Om aan de richtlijn te voldoen zou je 3–4× per week vette vis moeten eten —
                      dat doet bijna niemand. Een omega-3 supplement vult dat gat. EPA en DHA
                      ondersteunen je hartfunctie, je brein, je spierherstel en je
                      stemmingsregulatie.
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
                      Magnesium is een van de meest voorkomende tekorten. Het zit in noten, zaden,
                      donkergroene groente en volkoren producten — voedingsmiddelen die veel mensen
                      te weinig eten. Een tekort uit zich in spierkrampen, vermoeidheid, slechte
                      slaap en prikkelbaarheid. Magnesium glycinaat of bisglycinaat zijn de best
                      opneembare vormen.
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
              </div>
            </section>

            {/* 30-Dagen Plan */}
            <section id="plan" className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">
                Je 30-Dagen Voedingsplan
              </h2>
              <p className="mt-3 text-slate-600 leading-relaxed">
                Voeding verbeteren is geen dieet. Het is kleine, houdbare aanpassingen die na een
                maand vanzelfsprekend voelen.
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
                  Ontdek Welke Bouwstenen Jij Mist
                </h2>
                <p className="text-slate-600 mt-4 leading-relaxed max-w-xl mx-auto">
                  De Leefstijlcheck brengt je voeding in kaart als onderdeel van 6
                  gezondheidsdomeinen. In 3 minuten weet je waar de tekorten zitten — en wat je
                  eraan kunt doen.
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
                    Niet ziek, maar ook niet fit? Misschien is het breder dan voeding alleen.
                  </p>
                  <Link
                    href="/profiel/stille-slijter"
                    className="text-emerald-600 hover:underline font-medium"
                  >
                    Ben jij een Stille Slijter? →
                  </Link>
                </div>
                <div>
                  <p className="text-slate-600 text-sm">
                    Altijd moe na 40? Misschien speelt energie een grotere rol dan voeding.
                  </p>
                  <Link
                    href="/profiel/lage-batterij"
                    className="text-emerald-600 hover:underline font-medium"
                  >
                    Ben jij een Lage Batterij? →
                  </Link>
                </div>
              </div>
            </section>

            {/* Disclaimer */}
            <aside className="py-8 border-t border-slate-100 text-xs text-slate-400">
              <p>
                PerfectSupplement geeft adviezen op basis van wetenschappelijk onderzoek, geen
                medische diagnoses. Onze Leefstijlcheck is een hulpmiddel voor zelfinzicht, geen
                vervanging voor professioneel medisch advies. Bij vermoeden van ernstige
                voedingstekorten — bijvoorbeeld door eenzijdig eetgedrag, maag-darmklachten of
                onverklaarbare vermoeidheid — raden wij aan om een bloedonderzoek te laten doen
                via je huisarts.
              </p>
            </aside>
          </article>
        </Container>
      </main>
    </>
  );
}
