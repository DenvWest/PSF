import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Slaapproblemen Na 40? Dit Kun Je Eraan Doen | PerfectSupplement",
  description:
    "Wakker om 3 uur, niet meer terug in slaap? Herken je dit? Ontdek waarom je slaap verandert na 40 en wat je eraan kunt doen.",
  alternates: {
    canonical: "https://perfectsupplement.nl/profiel/onrustige-slaper",
  },
  openGraph: {
    title: "Slaapproblemen Na 40? Dit Kun Je Eraan Doen",
    description:
      "Wakker om 3 uur, niet meer terug in slaap? Ontdek waarom en wat helpt — zonder medicatie.",
    url: "https://perfectsupplement.nl/profiel/onrustige-slaper",
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
        name: "Onrustige Slaper",
        item: "https://perfectsupplement.nl/profiel/onrustige-slaper",
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Onrustige Slaper: Je Slaap Laat Je In De Steek",
    description:
      "Wakker om 3 uur, niet meer terug in slaap? Ontdek waarom je slaap verandert na 40 en wat je eraan kunt doen.",
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
  "Je valt prima in slaap, maar om 3 of 4 uur ben je klaarwakker. Je brein begint meteen te malen — over werk, over morgen, over niets specifieks. Terugslapen lukt niet meer.",
  "'s Ochtends voelt het alsof je helemaal niet hebt geslapen. Je wekker gaat en je eerste gedachte is: nog even. Dat 'even' wordt een half uur. Je begint de dag al met een achterstand.",
  "Doordeweeks overleef je op discipline en cafeïne. In het weekend probeer je bij te slapen, maar dat helpt niet echt — maandagochtend sta je weer met hetzelfde gevoel op.",
  "Je partner zegt dat je onrustig slaapt. Woelen, draaien, soms snurken. Je merkt het zelf niet, maar je lichaam herstelt niet.",
  "Je merkt het aan je humeur. Kort lontje, minder geduld, sneller geïrriteerd. Niet omdat je een vervelend mens bent, maar omdat je brein simpelweg niet genoeg rust krijgt.",
];

const quickWins = [
  {
    number: "1",
    title: "Zet je slaapkamer op 16–18°C",
    body: "Je lichaamstemperatuur moet dalen om in diepe slaap te komen. Een koele kamer helpt dat proces. Klinkt simpel, maar het effect op je slaapkwaliteit is in onderzoek aangetoond. Open een raam of zet de verwarming lager.",
  },
  {
    number: "2",
    title: "Stop 60 minuten voor bed met schermen",
    body: "Het blauwe licht van je telefoon en laptop onderdrukt je melatonineproductie. Dat is geen theorie — het is gemeten. Leg je telefoon buiten de slaapkamer en lees een boek, luister een podcast, of doe een korte ademhalingsoefening.",
  },
  {
    number: "3",
    title: "Houd een vast slaapritme — ook in het weekend",
    body: "Je circadiaan ritme (je interne klok) heeft regelmaat nodig. Als je doordeweeks om 23:00 naar bed gaat en in het weekend om 01:00, verwar je je biologische klok elke week opnieuw. Houd maximaal 30 minuten verschil aan.",
  },
];

const weekPlan = [
  {
    week: "Week 1",
    title: "Slaaphygiëne",
    description:
      "Koele kamer, geen schermen voor bed, vast slaapritme. Focus alleen hierop. Weersta de verleiding om alles tegelijk te veranderen.",
  },
  {
    week: "Week 2–3",
    title: "Ontspanning Toevoegen",
    description:
      "Voeg een avondroutine toe: 10 minuten ademhalingsoefening (4-7-8 methode) of lichte stretching voor bed. Start eventueel met magnesium glycinaat. Houd bij hoe je slaapt — niet met een app, maar met een simpele 1-10 score elke ochtend.",
  },
  {
    week: "Week 4",
    title: "Meten",
    description:
      "Doe de Leefstijlcheck opnieuw. Vergelijk je slaapscore met 4 weken geleden. Is er verbetering? Dan weet je dat de aanpak werkt. Geen verbetering? Dan is het misschien tijd om een arts te raadplegen — niet als falen, maar als logische volgende stap.",
  },
];

export default function OnrustigeSlaperPage() {
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
                  <span className="text-slate-600">Onrustige Slaper</span>
                </li>
              </ol>
            </nav>

            {/* Hero */}
            <section className="pt-10 pb-14">
              <span className="inline-block text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-4">
                Profiel
              </span>
              <h1 className="font-[var(--font-heading)] text-3xl md:text-5xl text-slate-900 leading-tight max-w-2xl">
                Onrustige Slaper: Je Slaap Laat Je In De Steek
              </h1>
              <p className="mt-5 text-xl text-slate-600 max-w-2xl leading-relaxed">
                Wakker om 3 uur. Liggen draaien. Uiteindelijk opgeven. En dan de volgende dag door
                met een hoofd vol watten.
              </p>
              <div className="mt-8">
                <Link
                  href="/intake"
                  className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
                >
                  Ontdek wat jouw slaap verstoort →
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
                Als je hier drie of meer van herkent, dan is het geen fase — het is een patroon. En
                patronen kun je doorbreken.
              </p>
            </section>

            {/* Wat er aan de hand is */}
            <section id="uitleg" className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">
                Wat Er Aan De Hand Is
              </h2>
              <div className="mt-6 space-y-5">
                <p className="text-slate-600 leading-relaxed">
                  Na je 40e verandert je slaap op een manier die je niet altijd bewust merkt. Je
                  melatonineproductie — het hormoon dat je lichaam vertelt dat het tijd is om te
                  slapen — neemt geleidelijk af. Tegelijk wordt je slaap lichter: je brengt minder
                  tijd door in diepe slaap, de fase waarin je lichaam zich fysiek herstelt.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Daar komt bij: als je overdag veel stress ervaart, blijft je cortisol (het
                  stresshormoon) &apos;s avonds hoog. Normaal gesproken daalt cortisol richting de
                  avond zodat melatonine het kan overnemen. Maar bij chronische stress gebeurt dat
                  niet goed. Het resultaat: je valt misschien wel in slaap, maar je lichaam komt
                  niet in de diepe herstelfase. Vandaar dat je om 3 uur wakker wordt — je
                  cortisolspiegel stijgt te vroeg weer.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Dit is geen slaapstoornis in medische zin. Het is een verstoord evenwicht tussen
                  stress en herstel dat veel mannen na 40 ervaren. Het verschil met een medische
                  aandoening is belangrijk: dit kun je in veel gevallen aanpakken met
                  leefstijlaanpassingen en gerichte ondersteuning.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Maar negeren werkt niet. Slaaptekort stapelt zich op. Na een paar weken merk je
                  het in je concentratie, je humeur en je energieniveau. Na maanden in je
                  immuunsysteem en je spierherstel. Je lichaam vraagt om actie — en de oplossing
                  zit niet in slaappillen.
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
                Slaapverbetering begint niet in bed — het begint overdag. Drie dingen die je
                vanavond al kunt doen:
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
                Slaaphygiëne is de basis. Maar als je lichaam de bouwstenen mist om goed te
                ontspannen en te herstellen, kun je dat niet altijd met leefstijl alleen oplossen.
                Twee supplementen zijn specifiek relevant voor het Onrustige Slaper profiel:
              </p>

              <div className="space-y-5">
                {/* Magnesium */}
                <div className="border border-slate-200 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-900 text-base">Magnesium (glycinaat)</h4>
                  <div className="mt-3 space-y-3">
                    <p className="text-slate-600 leading-relaxed">
                      Magnesium activeert je parasympathisch zenuwstelsel — je &apos;ruststand&apos;.
                      Het helpt je spieren ontspannen en bereidt je lichaam voor op slaap. Magnesium
                      glycinaat is de vorm die hiervoor het meest onderzocht is: het wordt goed
                      opgenomen en heeft een kalmerend effect dat andere vormen (zoals oxide of
                      citraat) minder hebben.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      Neem 200–400 mg magnesium glycinaat, 30–60 minuten voor het slapengaan. Naar
                      schatting krijgt meer dan de helft van de westerse bevolking te weinig
                      magnesium binnen via voeding — bij mannen die intensief leven of sporten is
                      dat percentage nog hoger.
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

                {/* Ashwagandha */}
                <div className="border border-slate-200 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-900 text-base">Ashwagandha (KSM-66)</h4>
                  <div className="mt-3 space-y-3">
                    <p className="text-slate-600 leading-relaxed">
                      Als stress een rol speelt in je slaapprobleem — en bij de meeste Onrustige
                      Slapers is dat het geval — dan kan ashwagandha helpen. KSM-66, een
                      gestandaardiseerd extract, is in klinische studies onderzocht op het verlagen
                      van cortisol. Lager cortisol in de avond betekent dat melatonine zijn werk
                      beter kan doen.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      Ashwagandha is geen slaapmiddel. Het pakt de oorzaak aan (te hoog cortisol)
                      in plaats van het symptoom (niet slapen). Dat maakt het een andere aanpak dan
                      slaappillen — en een duurzamere.
                    </p>
                  </div>
                  <p className="text-slate-500 text-sm mt-4">
                    Welke ashwagandha werkt het best? KSM-66 vs Sensoril — het verschil matteert.
                    Objectief vergeleken.
                  </p>
                  <Link
                    href="/beste-ashwagandha"
                    className="inline-block mt-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    Bekijk de ashwagandha vergelijking →
                  </Link>
                </div>
              </div>
            </section>

            {/* 30-Dagen Plan */}
            <section id="plan" className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">
                Je 30-Dagen Slaapplan
              </h2>
              <p className="mt-3 text-slate-600 leading-relaxed">
                Slaapverbetering is geen overnachting (ironisch genoeg). Je circadiaan ritme heeft
                1–2 weken nodig om zich aan te passen. Maar als je dit plan volgt, merk je na 2–3
                weken de eerste resultaten.
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
                  Ontdek Wat Jouw Slaap Verstoort
                </h2>
                <p className="text-slate-600 mt-4 leading-relaxed max-w-xl mx-auto">
                  De Leefstijlcheck meet je slaap als onderdeel van 6 gezondheidsdomeinen. In 3
                  minuten weet je waar je slaapprobleem vandaan komt — en wat je eraan kunt doen.
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
                    Welke ashwagandha werkt het best tegen stress? KSM-66 vs Sensoril — het
                    verschil matteert.
                  </p>
                  <Link
                    href="/beste-ashwagandha"
                    className="text-emerald-600 hover:underline font-medium"
                  >
                    Bekijk de ashwagandha vergelijking →
                  </Link>
                </div>
                <div>
                  <p className="text-slate-600 text-sm">
                    Altijd moe, ook als je wél slaapt? Misschien is energie je echte probleem.
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
                vervanging voor professioneel medisch advies. Bij aanhoudende slaapproblemen raden
                wij aan om contact op te nemen met je huisarts — met name als je last hebt van
                ernstig snurken, ademstops tijdens de slaap, of slaapproblemen die langer dan 3
                maanden aanhouden.
              </p>
            </aside>
          </article>
        </Container>
      </main>
    </>
  );
}
