import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Chronische Stress Na 40? Herken De Signalen | PerfectSupplement",
  description:
    "Stress die zich opstapelt, dag na dag. Je functioneert, maar het kost steeds meer. Herken de signalen en ontdek wat je kunt doen.",
  alternates: {
    canonical: "https://perfectsupplement.nl/profiel/stressdrager",
  },
  openGraph: {
    title: "Chronische Stress Na 40? Herken De Signalen",
    description:
      "Stress die zich opstapelt, dag na dag. Herken de signalen en ontdek wat helpt.",
    url: "https://perfectsupplement.nl/profiel/stressdrager",
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
        name: "Stressdrager",
        item: "https://perfectsupplement.nl/profiel/stressdrager",
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Stressdrager: Stress Die Zich Opstapelt",
    description:
      "Stress die zich opstapelt, dag na dag. Herken de signalen en ontdek wat je kunt doen.",
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
  "Je bent altijd 'aan'. Op werk, in het verkeer, thuis. Je hoofd stopt niet met draaien — ook niet als je in bed ligt. Je weet dat je moet ontspannen, maar je weet niet meer hoe.",
  "Kleine dingen raken je harder dan vroeger. Een opmerking van een collega, een file, je kinderen die niet luisteren. Je reactie is groter dan de situatie rechtvaardigt. Dat frustreert je nog meer.",
  "Je kaak is gespannen. Je schouders zitten bij je oren. Je merkt het pas als iemand het zegt, of als je er bewust op let. Je lichaam draagt de stress die je hoofd probeert te negeren.",
  "Je hebt het gevoel dat je geen tijd hebt. Niet voor sport, niet voor ontspanning, niet voor jezelf. Alles gaat naar werk, gezin en verplichtingen. Wat overblijft is een lege tank en Netflix op de bank.",
  "Je slaapt wel, maar je wordt niet uitgerust wakker. Je lichaam ligt stil, maar je brein draait door. 's Ochtends voel je je alsof je de hele nacht hebt gewerkt.",
];

const quickWins = [
  {
    number: "1",
    title: "De 4-7-8 ademhaling, twee keer per dag",
    body: "Adem 4 tellen in door je neus. Houd 7 tellen vast. Adem 8 tellen uit door je mond. Doe dit 3-4 cycli. Het duurt 2 minuten en het activeert je parasympathisch zenuwstelsel — je lichaam schakelt letterlijk van 'vecht-of-vlucht' naar 'rust-en-herstel'. Doe het 's ochtends en voor het slapengaan.",
  },
  {
    number: "2",
    title: "Wandel 15-20 minuten na de lunch",
    body: "Niet rennen, niet bellen, niet luisteren naar een podcast over productiviteit. Gewoon lopen. Buiten. Onderzoek laat zien dat 15 minuten wandelen in de natuur je cortisolniveau meetbaar verlaagt. Het is de goedkoopste en meest onderbouwde stressverlager die er is.",
  },
  {
    number: "3",
    title: "Schrijf 's avonds 3 dingen op die goed gingen vandaag",
    body: "Klinkt simpel, is het ook. Maar het dwingt je brein om de dag niet af te sluiten met wat er nog moet, maar met wat er al goed ging. Het verlaagt je activatieniveau voor het slapengaan. Een notitieboekje op je nachtkastje is genoeg.",
  },
];

const weekPlan = [
  {
    week: "Week 1",
    title: "Ademhaling + Beweging",
    description:
      "Start met de 4-7-8 ademhaling (2× per dag) en een dagelijkse wandeling na de lunch. Dat is alles. Bouw geen druk op om méér te doen — dat is precies het patroon dat je wilt doorbreken.",
  },
  {
    week: "Week 2–3",
    title: "Routines Verankeren",
    description:
      "Voeg het avond-journaling toe. Start eventueel met magnesium glycinaat voor het slapengaan. Let op je slaapkwaliteit — stress en slaap zijn nauw verbonden. Als je merkt dat je beter slaapt, werkt de aanpak.",
  },
  {
    week: "Week 4",
    title: "Meten",
    description:
      "Doe de Leefstijlcheck opnieuw. Vergelijk je stressscore met 4 weken geleden — maar kijk ook naar je slaap- en energiescore, want die worden vaak meegezogen in de verbetering.",
  },
];

export default function StressdragerPage() {
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
                  <span className="text-slate-600">Stressdrager</span>
                </li>
              </ol>
            </nav>

            {/* Hero */}
            <section className="pt-10 pb-14">
              <span className="inline-block text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-4">
                Profiel
              </span>
              <h1 className="font-[var(--font-heading)] text-3xl md:text-5xl text-slate-900 leading-tight max-w-2xl">
                Stressdrager: Stress Die Zich Opstapelt
              </h1>
              <p className="mt-5 text-xl text-slate-600 max-w-2xl leading-relaxed">
                Je draagt het. Dag na dag. Op werk, thuis, overal. Je functioneert — maar het kost
                steeds meer.
              </p>
              <div className="mt-8">
                <Link
                  href="/intake"
                  className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
                >
                  Ontdek hoe stress jouw lichaam beïnvloedt →
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
                Als je hier drie of meer van herkent, dan draag je meer stress dan je lichaam
                aankan. Dat is geen zwakte — het is een signaal.
              </p>
            </section>

            {/* Wat er aan de hand is */}
            <section id="uitleg" className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">
                Wat Er Aan De Hand Is
              </h2>
              <div className="mt-6 space-y-5">
                <p className="text-slate-600 leading-relaxed">
                  Stress is niet per definitie slecht. In korte pieken maakt cortisol — je
                  stresshormoon — je scherper, sneller en alerter. Dat is een
                  overlevingsmechanisme dat goed werkt. Het probleem ontstaat wanneer die pieken
                  niet meer dalen. Wanneer cortisol chronisch hoog blijft.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Na je 40e wordt je lichaam minder veerkrachtig in het omgaan met stress. Je
                  herstelvermogen neemt af. Waar je op je 30e na een zware week in het weekend kon
                  bijladen, lukt dat nu niet meer. De stress stapelt zich op, week na week, maand
                  na maand.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Chronisch hoog cortisol heeft een cascade aan effecten. Het onderdrukt je
                  testosteronproductie — waardoor je energie, motivatie en spiermassa afnemen. Het
                  verstoort je slaap — waardoor je niet herstelt. Het verhoogt je bloedsuiker en
                  stimuleert vetopslag rond je middel. En het remt je immuunsysteem — waardoor je
                  vaker ziek bent.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Dit is geen burn-out in klinische zin. Het is een structureel verstoord evenwicht
                  tussen belasting en herstel. Het goede nieuws: dat evenwicht kun je herstellen.
                  Niet door minder te doen (dat is niet altijd realistisch), maar door je
                  herstelvermogen te vergroten.
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
                Stressvermindering hoeft niet ingewikkeld te zijn. Het gaat niet om grote
                veranderingen, maar om dagelijkse micromenten van herstel. Begin hier:
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
                Leefstijlveranderingen zijn het fundament. Maar als je cortisol structureel te hoog
                is, kan gerichte ondersteuning het herstel versnellen. Twee supplementen zijn
                specifiek relevant voor het Stressdrager profiel:
              </p>

              <div className="space-y-5">
                {/* Ashwagandha */}
                <div className="border border-slate-200 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-900 text-base">Ashwagandha (KSM-66)</h4>
                  <div className="mt-3 space-y-3">
                    <p className="text-slate-600 leading-relaxed">
                      Ashwagandha is een adaptogeen — een plant die je lichaam helpt zich aan te
                      passen aan stress. Het gestandaardiseerde extract KSM-66 is in meerdere
                      klinische studies onderzocht op het verlagen van cortisol. De resultaten laten
                      een vermindering zien van gemiddeld 20-30% in chronisch verhoogd cortisol over
                      een periode van 8 weken.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      Belangrijk: ashwagandha is geen kalmeringsmiddel. Het maakt je niet slaperig
                      of afgestompt. Het helpt je lichaam om de stressrespons beter te reguleren —
                      zodat je wél alert bent wanneer het nodig is, maar ook kunt herstellen wanneer
                      het niet nodig is.
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

                {/* Magnesium */}
                <div className="border border-slate-200 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-900 text-base">Magnesium</h4>
                  <div className="mt-3 space-y-3">
                    <p className="text-slate-600 leading-relaxed">
                      Magnesium raakt je via twee routes: het ondersteunt je spierontspanning (denk
                      aan die gespannen kaak en schouders) en het helpt je zenuwstelsel kalmeren.
                      Bij chronische stress verbruikt je lichaam meer magnesium — precies op het
                      moment dat je het het hardst nodig hebt.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      Magnesium glycinaat is de aangewezen vorm voor het Stressdrager profiel: het
                      combineert goede opname met een kalmerend effect van de glycine-component.
                      Neem 200-400 mg in de avond.
                    </p>
                  </div>
                  <p className="text-slate-500 text-sm mt-4">
                    Welke magnesium vorm past bij jou? Glycinaat, bisglycinaat of citraat —
                    objectief vergeleken op opname en effect.
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
                Je 30-Dagen Stressplan
              </h2>
              <p className="mt-3 text-slate-600 leading-relaxed">
                Stress verminderen is geen eenmalige actie — het is een dagelijkse gewoonte
                opbouwen. Dit plan helpt je om in 4 weken een merkbaar verschil te voelen.
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
                  Ontdek Hoe Stress Jouw Lichaam Beïnvloedt
                </h2>
                <p className="text-slate-600 mt-4 leading-relaxed max-w-xl mx-auto">
                  De Leefstijlcheck meet stress als onderdeel van 6 gezondheidsdomeinen. In 3
                  minuten weet je hoe jouw stresspatroon samenhangt met je slaap, energie en
                  herstel.
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
                    Welke ashwagandha werkt het best tegen stress? KSM-66 vs Sensoril — objectief
                    vergeleken op dosering, bewijs en prijs.
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
                    Welke magnesium vorm past bij jou? Glycinaat, bisglycinaat of citraat —
                    vergeleken op opname en effect.
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
                    Wakker om 3 uur, niet terug in slaap? Stress en slaap zijn nauw verbonden.
                  </p>
                  <Link
                    href="/profiel/onrustige-slaper"
                    className="text-emerald-600 hover:underline font-medium"
                  >
                    Ben jij een Onrustige Slaper? →
                  </Link>
                </div>
                <div>
                  <p className="text-slate-600 text-sm">
                    Altijd moe, ook al slaap je genoeg? Misschien is energie je echte aandachtspunt.
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
                vervanging voor professioneel medisch advies. Bij langdurige stressklachten die je
                dagelijks functioneren beïnvloeden — zoals aanhoudende vermoeidheid,
                concentratieproblemen of het gevoel er niet meer tegenop te kunnen — raden wij aan
                om contact op te nemen met je huisarts.
              </p>
            </aside>
          </article>
        </Container>
      </main>
    </>
  );
}
