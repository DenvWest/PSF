import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";

const INLINE_LINK_CLASS =
  "font-medium text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px] transition hover:decoration-[#5A8F6A] hover:text-[#4a7a5a]";

export const metadata: Metadata = {
  title: "Energie Na 40: Waarom Je Moe Bent en Wat Je Eraan Doet | PerfectSupplement",
  description:
    "Altijd moe na 40? Dat is niet normaal. Ontdek de oorzaken — van mitochondriën tot hormonen — en wat je vandaag nog kunt veranderen.",
  alternates: {
    canonical: "/energie-na-40",
  },
  openGraph: {
    title: "Energie Na 40: Waarom Je Anders Bent (en Wat Je Eraan Doet)",
    description:
      "Altijd moe na 40? Ontdek de oorzaken en wat je vandaag nog kunt veranderen.",
    url: "/energie-na-40",
    type: "article",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Energie Na 40: Waarom Je Moe Bent en Wat Je Eraan Doet",
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
  datePublished: "2026-05-07",
  dateModified: "2026-05-07",
  mainEntityOfPage: "https://perfectsupplement.nl/energie-na-40",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Waarom ben ik altijd moe na mijn 40e?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Na je 40e veranderen meerdere systemen tegelijk: je mitochondriën produceren minder ATP, testosteron daalt met 1-2% per jaar, je insulinegevoeligheid neemt af, en vitamine D-tekort komt vaker voor. De combinatie van deze verschuivingen verklaart waarom vermoeidheid na 40 anders voelt dan 'gewoon moe zijn'.",
      },
    },
    {
      "@type": "Question",
      name: "Welk supplement helpt het beste tegen vermoeidheid?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dat hangt af van de oorzaak. Bij vitamine D-tekort (zeer veel voorkomend in Nederland) is D3+K2 de eerste stap. Bij lage visinname helpt omega-3 (EPA/DHA). Creatine ondersteunt directe ATP-productie in spieren en brein. Begin met bloedonderzoek bij je huisarts om tekorten uit te sluiten.",
      },
    },
    {
      "@type": "Question",
      name: "Kan lage testosteron mijn vermoeidheid veroorzaken?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja. Testosteron speelt een rol bij energieniveau, spiermassa en motivatie. Na 40 daalt testosteron met gemiddeld 1-2% per jaar. Bij aanhoudende vermoeidheid in combinatie met minder spiermassa, lager libido en stemmingsveranderingen is het zinvol om je testosteronwaarden te laten controleren via bloedonderzoek.",
      },
    },
    {
      "@type": "Question",
      name: "Hoe snel merk ik verschil als ik mijn leefstijl aanpas?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "De eerste quick wins (eiwitrijk ontbijt, ochtendlicht, geen cafeïne na 14:00) geven vaak binnen 3-5 dagen merkbaar verschil. Structurele verbetering van energieniveau duurt 2-4 weken. Supplementen als vitamine D hebben 4-8 weken nodig voor volledig effect.",
      },
    },
    {
      "@type": "Question",
      name: "Wanneer moet ik naar de huisarts met vermoeidheid?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Als je langer dan 6 weken moe bent ondanks voldoende slaap en een gezonde leefstijl. Of als je last hebt van onverklaarbaar gewichtsverlies, koorts, extreme dorst, of als de vermoeidheid plotseling begon. Je huisarts kan bloedonderzoek doen op schildklier, vitamine D, B12, ijzer en testosteron.",
      },
    },
  ],
};

export default function EnergieNa40Page() {
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
          <div className="max-w-3xl mx-auto">
            <article>
              {/* 1. Hero */}
              <header>
                <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
                  Complete Gids
                </p>
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mt-2">
                  Energie Na 40: Waarom Je Moe Bent en Wat Je Eraan Doet
                </h1>
                <p className="mt-4 text-lg text-gray-600">
                  Bijgewerkt: mei 2026 · Leestijd: 12 min
                </p>
              </header>

              {/* 2. Inhoudsopgave */}
              <nav
                aria-label="Inhoudsopgave"
                className="mt-10 p-6 bg-stone-50 rounded-xl border border-stone-200"
              >
                <p className="font-semibold text-gray-900 mb-3">In deze gids</p>
                <ol className="space-y-2 text-green-800 list-decimal list-inside">
                  <li>
                    <a href="#herkenning" className="hover:underline">
                      Ken je dit?
                    </a>
                  </li>
                  <li>
                    <a href="#wat-er-verandert" className="hover:underline">
                      Wat er verandert na 40
                    </a>
                  </li>
                  <li>
                    <a href="#mitochondrien" className="hover:underline">
                      Mitochondriën: je energiecentrales
                    </a>
                  </li>
                  <li>
                    <a href="#hormonen" className="hover:underline">
                      Testosteron, cortisol en energie
                    </a>
                  </li>
                  <li>
                    <a href="#bloedsuiker" className="hover:underline">
                      Bloedsuiker: de onzichtbare achtbaan
                    </a>
                  </li>
                  <li>
                    <a href="#leefstijl" className="hover:underline">
                      Wat je zelf kunt doen
                    </a>
                  </li>
                  <li>
                    <a href="#supplementen" className="hover:underline">
                      Welke supplementen helpen
                    </a>
                  </li>
                  <li>
                    <a href="#aanpak" className="hover:underline">
                      Hoe je dit aanpakt: week voor week
                    </a>
                  </li>
                  <li>
                    <a href="#verder-lezen" className="hover:underline">
                      Verder lezen
                    </a>
                  </li>
                  <li>
                    <a href="#leefstijlcheck" className="hover:underline">
                      Ontdek waar jij staat
                    </a>
                  </li>
                  <li>
                    <a href="#veelgestelde-vragen" className="hover:underline">
                      Veelgestelde vragen
                    </a>
                  </li>
                </ol>
              </nav>

              {/* 3. Herkenning */}
              <section id="herkenning" className="mt-12">
                <h2 className="font-serif text-3xl font-bold text-gray-900">Ken Je Dit?</h2>
                <p className="mt-4 text-lg text-gray-700 leading-relaxed">
                  Je wordt wakker en het voelt alsof je niet hebt geslapen. Om 10 uur heb je al het
                  gevoel dat de dag voorbij is. Koffie helpt even, maar de crash daarna is erger dan
                  de dip ervoor. &apos;s Avonds heb je geen energie meer voor de dingen die je leuk
                  vindt — sporten, lezen, tijd met je gezin. Weekenden voelen net zo zwaar als
                  doordeweeks.
                </p>
                <p className="mt-6 text-gray-700 leading-relaxed font-medium">Ken je dit:</p>
                <ul className="mt-3 space-y-2 text-gray-700 list-disc list-inside">
                  <li>Je hebt om 10 uur &apos;s ochtends al het gevoel dat de dag voorbij is</li>
                  <li>Koffie helpt even, maar de crash daarna maakt het erger</li>
                  <li>Je hebt geen energie meer voor dingen die je vroeger leuk vond</li>
                  <li>Weekenden voel je je net zo moe als doordeweeks</li>
                  <li>
                    Je concentratie is minder — &quot;hersenmist&quot; die je niet kunt plaatsen
                  </li>
                </ul>
                <p className="mt-6 text-gray-700 leading-relaxed">
                  Als je hier drie of meer van herkent, lees verder. Dit is geen normaal onderdeel
                  van ouder worden — het is een signaal dat je energiesysteem uit balans is.
                </p>
              </section>

              {/* 4. Wat er verandert */}
              <section id="wat-er-verandert" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Wat Er Verandert Na 40
                </h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Vermoeidheid na 40 is niet één ding. Het is de som van vier systemen die tegelijk
                  verschuiven — langzaam genoeg om het te normaliseren, maar meetbaar genoeg om er
                  iets aan te doen.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  1. Je mitochondriën worden minder efficiënt
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Mitochondriën zijn de energiecentrales van je cellen. Ze zetten voedingsstoffen om
                  in ATP — de brandstof voor alles wat je lichaam doet. Na je 40e daalt de
                  mitochondriële efficiëntie. Je cellen produceren minder energie uit dezelfde input.
                  Dit verklaart waarom je moe kunt zijn zonder dat er iets &quot;mis&quot; is op een
                  bloedtest.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  2. Testosteron daalt — subtiel maar merkbaar
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Testosteron daalt met gemiddeld 1-2% per jaar na je 30e. Op je 45e kan dat een
                  cumulatieve daling van 15-30% betekenen. De gevolgen zijn breder: minder energie,
                  trager herstel, minder motivatie, subtiel verlies aan spiermassa. Het is niet
                  dramatisch genoeg voor een diagnose, maar wel genoeg om je dagelijks functioneren
                  te beïnvloeden.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  3. Insulinegevoeligheid neemt af
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Na je 40e reageert je lichaam minder goed op insuline. Het gevolg: grotere
                  bloedsuikerschommelingen na maaltijden, die zich vertalen in energiedips,
                  hersenmist en honger naar suiker. De middagdip die steeds vroeger komt? Dat is
                  vaak geen slaapgebrek — dat is bloedsuiker.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  4. Vitamine D-tekort is wijdverbreid
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  In Nederland krijgt 40-60% van de volwassenen onvoldoende vitamine D, vooral in de
                  wintermaanden. Een tekort is gekoppeld aan vermoeidheid, spierzwakte en
                  stemmingsklachten. Het is een van de meest voorkomende én meest onderschatte oorzaken
                  van chronische moeheid.
                </p>
              </section>

              {/* 5. Mitochondriën */}
              <section id="mitochondrien" className="mt-14">
                <h3 className="font-serif text-2xl font-bold text-gray-900">
                  Mitochondriën: Je Energiecentrales Uitgelegd
                </h3>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Elke cel in je lichaam bevat honderden tot duizenden mitochondriën. Ze gebruiken
                  zuurstof en voedingsstoffen om ATP te produceren — het molecuul dat al je
                  celprocessen aandrijft. Van spiercontractie tot hersenactiviteit: zonder ATP
                  gebeurt er niets.
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Na je 40e neemt de mitochondriële biogenese (de aanmaak van nieuwe mitochondriën)
                  af. Tegelijk produceren verouderende mitochondriën meer oxidatieve stress — vrije
                  radicalen die je cellen beschadigen. Dit is een vicieuze cirkel: minder en
                  slechtere mitochondriën → minder ATP → meer vermoeidheid → minder beweging → nog
                  minder mitochondriën.
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Het goede nieuws: je kunt deze cyclus doorbreken. Regelmatige beweging (vooral
                  matige intensiteit) stimuleert mitochondriële biogenese. Omega-3 vetzuren
                  beschermen mitochondriële membranen. Creatine levert directe ATP-precursors. En
                  CoQ10 — een co-enzym dat in je mitochondriën werkt — daalt ook met de leeftijd.
                </p>
              </section>

              {/* 6. Hormonen */}
              <section id="hormonen" className="mt-14">
                <h3 className="font-serif text-2xl font-bold text-gray-900">
                  Testosteron, Cortisol en Energie: Het Driehoeksspel
                </h3>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Energie is geen los systeem — het hangt samen met je hormonale balans. Drie
                  hormonen spelen de hoofdrol:
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  <strong className="text-gray-900">Testosteron</strong> is je anabole motor. Het
                  stuurt spierherstel, motivatie en energiebeleving aan. Na 40 daalt het
                  geleidelijk, versneld door slechte slaap, chronische stress en overgewicht.
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  <strong className="text-gray-900">Cortisol</strong> is je stresshormoon. Op de
                  juiste momenten (ochtend) geeft het je energie. Chronisch verhoogd (door stress,
                  slechte slaap, te veel cafeïne) put het je uit en onderdrukt het testosteron.
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  <strong className="text-gray-900">Insuline</strong> regelt je bloedsuiker. Bij
                  afnemende insulinegevoeligheid schommelt je bloedsuiker meer — met energiedips als
                  direct gevolg.
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  De drie beïnvloeden elkaar: hoog cortisol verlaagt testosteron. Lage testosteron
                  maakt je gevoeliger voor stress. Stress verhoogt insulineresistentie. De uitweg
                  begint bij leefstijl — niet bij één pil.
                </p>
              </section>

              {/* 7. Bloedsuiker */}
              <section id="bloedsuiker" className="mt-14">
                <h3 className="font-serif text-2xl font-bold text-gray-900">
                  Bloedsuiker: De Onzichtbare Achtbaan
                </h3>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  De meeste mannen 40+ eten te veel snelle koolhydraten en te weinig eiwit — zeker
                  bij het ontbijt. Het resultaat: een bloedsuikerpiek gevolgd door een crash. Die
                  crash is je middagdip, je hersenmist, je snack-verlangens om 16:00.
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Een stabielere bloedsuiker begint bij drie dingen:
                </p>
                <ul className="mt-3 space-y-2 text-gray-700 list-disc list-inside">
                  <li>
                    Eiwit bij elke maaltijd — minimaal 25-30 gram, vooral bij het ontbijt
                  </li>
                  <li>
                    Geen koffie op een lege maag — cafeïne verhoogt cortisol, wat je bloedsuiker
                    verder ontregelt
                  </li>
                  <li>
                    Bewegen na het eten — een wandeling van 10-15 minuten na de lunch verlaagt je
                    bloedsuikerpiek meetbaar
                  </li>
                </ul>
              </section>

              {/* 8. Leefstijl */}
              <section id="leefstijl" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Wat Je Zelf Kunt Doen
                </h2>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  1. Eiwitrijk ontbijt — de belangrijkste maaltijd
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Start de dag met minimaal 30 gram eiwit: eieren, kwark, noten, of een eiwitshake.
                  Dit stabiliseert je bloedsuiker voor de hele ochtend en voorkomt de 10-uur crash.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  2. Ochtendlicht — stel je biologische klok
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Ga binnen 30 minuten na het opstaan naar buiten voor daglicht. Dit zet je
                  cortisolritme goed — cortisol hoort &apos;s ochtends hoog te zijn (energie!) en
                  &apos;s avonds laag (slaap). Binnenlicht is niet sterk genoeg.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  3. Geen cafeïne na 14:00
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Cafeïne heeft een halfwaardetijd van 5-6 uur. Die koffie om 15:00 verstoort je
                  slaap én houdt je cortisol te hoog &apos;s avonds. Switch na de lunch naar water
                  of kruidenthee.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  4. Bewegen — maar slim
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Dagelijks 30 minuten wandelen is effectiever voor energie dan 3x per week intensief
                  sporten. Krachttraining 2-3x per week stimuleert testosteron en mitochondriële
                  biogenese. Vermijd intensieve training &apos;s avonds — dat verhoogt cortisol
                  wanneer het moet dalen.
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  <strong className="text-gray-900">Speelt stress ook een rol bij je vermoeidheid?</strong>{" "}
                  Lees de complete gids:{" "}
                  <Link href="/stress-verminderen-man" className={INLINE_LINK_CLASS}>
                    Stress verminderen na 40
                  </Link>
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  5. Bloedonderzoek — de baseline
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Laat bij aanhoudende vermoeidheid je huisarts bloedonderzoek doen op: vitamine D,
                  B12, ijzer/ferritine, schildklierfunctie (TSH) en eventueel testosteron. Een tekort
                  opsporen is vaak de snelste route naar verbetering.
                </p>
              </section>

              {/* 9. Supplementen */}
              <section id="supplementen" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Welke Supplementen Helpen Bij Vermoeidheid
                </h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Supplementen vervangen geen leefstijl — maar ze kunnen gericht aanvullen waar
                  voeding tekortschiet. Dit zijn de vier met het meeste bewijs bij energieklachten na
                  40:
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">Vitamine D3 (+ K2)</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  40-60% van de Nederlandse volwassenen heeft een suboptimaal vitamine D-niveau. Een
                  tekort is direct gekoppeld aan vermoeidheid, spierzwakte en verminderde stemming.
                  D3 is de actieve vorm; K2 zorgt ervoor dat calcium in je botten terechtkomt, niet
                  in je bloedvaten. Dosering: 25-50 mcg (1000-2000 IE) per dag, bij voorkeur bij een
                  vetrijke maaltijd.
                </p>
                <div className="mt-4 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Welke vitamine D is het best gedoseerd en meest compleet?
                  </p>
                  <Link
                    href="/beste/vitamine-d"
                    className="mt-2 inline-block font-medium text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px]"
                  >
                    Bekijk de vergelijking →
                  </Link>
                </div>

                <h3 className="font-semibold text-xl text-gray-900 mt-10">Omega-3 (EPA/DHA)</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  EPA en DHA ondersteunen je mitochondriële membranen, verminderen systemische
                  ontstekingen en ondersteunen de hersenstructuur. De meeste Nederlanders krijgen
                  structureel te weinig omega-3 via voeding. Dosering: minimaal 1000 mg EPA+DHA per
                  dag.
                </p>
                <div className="mt-4 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Welke omega-3 is het zuiverst en best gedoseerd?
                  </p>
                  <Link
                    href="/beste/omega-3-supplement"
                    className="mt-2 inline-block font-medium text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px]"
                  >
                    Bekijk de vergelijking →
                  </Link>
                </div>

                <h3 className="font-semibold text-xl text-gray-900 mt-10">Creatine</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Niet alleen voor sporters. Creatine is een directe ATP-precursor die zowel
                  spieren als je brein van energie voorziet. Onderzoek toont dat 3-5 gram creatine
                  monohydraat per dag cognitieve prestaties verbetert, vooral bij slaaptekort of
                  mentale vermoeidheid.
                </p>
                <div className="mt-4 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Welke creatine is het zuiverst?
                  </p>
                  <Link
                    href="/beste/creatine"
                    className="mt-2 inline-block font-medium text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px]"
                  >
                    Bekijk de vergelijking →
                  </Link>
                </div>

                <h3 className="font-semibold text-xl text-gray-900 mt-10">Magnesium</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Magnesium is betrokken bij meer dan 300 enzymatische processen, waaronder
                  energieproductie (ATP-synthese). Een tekort — wat bij 40+ veel voorkomt — leidt
                  tot vermoeidheid, spierkrampen en slechte slaap.
                </p>
                <div className="mt-4 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Welke magnesium werkt het beste voor jouw situatie?
                  </p>
                  <Link
                    href="/beste/magnesium"
                    className="mt-2 inline-block font-medium text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px]"
                  >
                    Bekijk de vergelijking →
                  </Link>
                </div>
              </section>

              {/* 10. Week-voor-week */}
              <section id="aanpak" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Hoe Je Dit Aanpakt: Week voor Week
                </h2>

                <div className="mt-8 p-6 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="font-semibold text-gray-900 text-lg">Week 1 — De basis</p>
                  <p className="mt-3 text-gray-700 leading-relaxed">
                    Begin met drie dingen, niet meer:
                  </p>
                  <ul className="mt-3 space-y-2 text-gray-700 list-disc list-inside">
                    <li>Eiwitrijk ontbijt (≥30g eiwit)</li>
                    <li>Geen cafeïne na 14:00</li>
                    <li>10 minuten ochtendlicht dagelijks</li>
                  </ul>
                </div>

                <div className="mt-4 p-6 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="font-semibold text-gray-900 text-lg">Week 2-3 — Leefstijl verankeren</p>
                  <ul className="mt-3 space-y-2 text-gray-700 list-disc list-inside">
                    <li>Dagelijks 20-30 minuten wandelen (liefst na de lunch)</li>
                    <li>Krachttraining 2x per week introduceren</li>
                    <li>Start vitamine D3 (1000-2000 IE per dag, bij het eten)</li>
                    <li>500 ml water direct na het opstaan</li>
                  </ul>
                </div>

                <div className="mt-4 p-6 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="font-semibold text-gray-900 text-lg">Week 4 — Meten en bijstellen</p>
                  <p className="mt-3 text-gray-700 leading-relaxed">
                    Doe de{" "}
                    <Link href="/intake" className={INLINE_LINK_CLASS}>
                      Leefstijlcheck
                    </Link>{" "}
                    opnieuw. Vergelijk je energiescore met 4 weken geleden. Waar is verbetering? Waar
                    niet? Overweeg bloedonderzoek als de vermoeidheid aanhoudt ondanks
                    leefstijlveranderingen.
                  </p>
                </div>

                <div className="mt-4 p-6 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="font-semibold text-gray-900 text-lg">Week 5-8 — Verdieping</p>
                  <ul className="mt-3 space-y-2 text-gray-700 list-disc list-inside">
                    <li>
                      Voeg omega-3 of creatine toe als je voeding tekortschiet
                    </li>
                    <li>Evalueer slaapkwaliteit (vaak de onderliggende oorzaak van energietekort)</li>
                    <li>
                      Overweeg testosteron-check als vermoeidheid + minder spiermassa + lager libido
                      samen voorkomen
                    </li>
                  </ul>
                </div>
              </section>

              {/* 11. Verder lezen */}
              <section id="verder-lezen" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">Verder Lezen</h2>

                <div className="mt-6 p-5 rounded-xl border border-stone-200 bg-stone-50">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    <strong className="text-gray-900">Herken je het Lage Batterij-profiel?</strong>
                    <br />
                    Als chronische vermoeidheid je primaire patroon is, past het Lage Batterij-profiel
                    bij jou. Met concrete stappen en supplementadvies afgestemd op jouw situatie.
                  </p>
                  <Link
                    href="/profiel/lage-batterij"
                    className="mt-2 inline-block text-sm font-semibold text-[#5A8F6A] hover:underline"
                  >
                    Lees meer over het Lage Batterij-profiel →
                  </Link>
                </div>

                <div className="mt-6 p-5 rounded-xl border border-stone-200 bg-stone-50">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    <strong className="text-gray-900">Speelt stress een rol?</strong>
                    <br />
                    Chronische stress en vermoeidheid gaan vaak samen. Cortisol onderdrukt
                    testosteron en verstoort je slaap — een dubbele drain op je energie.
                  </p>
                  <Link
                    href="/stress-verminderen-man"
                    className="mt-2 inline-block text-sm font-semibold text-[#5A8F6A] hover:underline"
                  >
                    Lees de gids: Stress Verminderen na 40 →
                  </Link>
                </div>

                <div className="mt-6 p-5 rounded-xl border border-stone-200 bg-stone-50">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    <strong className="text-gray-900">Slaap als hefboom</strong>
                    <br />
                    Slechte slaap is de meest voorkomende oorzaak van chronische vermoeidheid. Als je
                    slaap niet op orde is, helpt geen enkel supplement.
                  </p>
                  <Link
                    href="/slaap-verbeteren-na-40"
                    className="mt-2 inline-block text-sm font-semibold text-[#5A8F6A] hover:underline"
                  >
                    Lees de gids: Slaap Verbeteren na 40 →
                  </Link>
                </div>
              </section>

              {/* 12. CTA */}
              <section id="leefstijlcheck" className="mt-14">
                <div className="text-center p-8 bg-green-50 rounded-2xl border border-green-200">
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900">
                    Ontdek Waar Jij Staat
                  </h2>
                  <p className="mt-3 text-gray-600 max-w-lg mx-auto leading-relaxed">
                    Energie is één van de zes domeinen die we meten in de Leefstijlcheck. In 3
                    minuten weet je hoe je scoort op energie, slaap, stress, herstel, voeding en
                    beweging — en welk profiel bij jou past.
                  </p>
                  <Link
                    href="/intake"
                    className="mt-5 inline-block bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
                  >
                    Doe de gratis Leefstijlcheck →
                  </Link>
                  <p className="mt-3 text-sm text-gray-500">
                    12 vragen, 3 minuten, persoonlijk advies
                  </p>
                </div>
              </section>

              {/* 13. FAQ */}
              <section id="veelgestelde-vragen" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Veelgestelde Vragen
                </h2>

                <div className="mt-6 space-y-3">
                  <details className="group border border-stone-200 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 font-semibold text-gray-900 hover:bg-stone-50 transition-colors list-none">
                      Waarom ben ik altijd moe na mijn 40e?
                      <span className="shrink-0 text-green-700 group-open:rotate-45 transition-transform duration-200 text-xl leading-none">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-gray-700 leading-relaxed">
                      Na je 40e veranderen meerdere systemen tegelijk: je mitochondriën produceren
                      minder ATP, testosteron daalt met 1-2% per jaar, je insulinegevoeligheid neemt
                      af, en vitamine D-tekort komt vaker voor. De combinatie van deze verschuivingen
                      verklaart waarom vermoeidheid na 40 anders voelt dan &apos;gewoon moe zijn&apos;.
                    </div>
                  </details>

                  <details className="group border border-stone-200 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 font-semibold text-gray-900 hover:bg-stone-50 transition-colors list-none">
                      Welk supplement helpt het beste tegen vermoeidheid?
                      <span className="shrink-0 text-green-700 group-open:rotate-45 transition-transform duration-200 text-xl leading-none">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-gray-700 leading-relaxed">
                      Dat hangt af van de oorzaak. Bij vitamine D-tekort (zeer veel voorkomend in
                      Nederland) is D3+K2 de eerste stap. Bij lage visinname helpt omega-3 (EPA/DHA).
                      Creatine ondersteunt directe ATP-productie in spieren en brein. Begin met
                      bloedonderzoek bij je huisarts om tekorten uit te sluiten.
                    </div>
                  </details>

                  <details className="group border border-stone-200 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 font-semibold text-gray-900 hover:bg-stone-50 transition-colors list-none">
                      Kan lage testosteron mijn vermoeidheid veroorzaken?
                      <span className="shrink-0 text-green-700 group-open:rotate-45 transition-transform duration-200 text-xl leading-none">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-gray-700 leading-relaxed">
                      Ja. Testosteron speelt een rol bij energieniveau, spiermassa en motivatie. Na 40
                      daalt testosteron met gemiddeld 1-2% per jaar. Bij aanhoudende vermoeidheid in
                      combinatie met minder spiermassa, lager libido en stemmingsveranderingen is het
                      zinvol om je testosteronwaarden te laten controleren via bloedonderzoek.
                    </div>
                  </details>

                  <details className="group border border-stone-200 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 font-semibold text-gray-900 hover:bg-stone-50 transition-colors list-none">
                      Hoe snel merk ik verschil als ik mijn leefstijl aanpas?
                      <span className="shrink-0 text-green-700 group-open:rotate-45 transition-transform duration-200 text-xl leading-none">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-gray-700 leading-relaxed">
                      De eerste quick wins (eiwitrijk ontbijt, ochtendlicht, geen cafeïne na 14:00)
                      geven vaak binnen 3-5 dagen merkbaar verschil. Structurele verbetering van
                      energieniveau duurt 2-4 weken. Supplementen als vitamine D hebben 4-8 weken
                      nodig voor volledig effect.
                    </div>
                  </details>

                  <details className="group border border-stone-200 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 font-semibold text-gray-900 hover:bg-stone-50 transition-colors list-none">
                      Wanneer moet ik naar de huisarts met vermoeidheid?
                      <span className="shrink-0 text-green-700 group-open:rotate-45 transition-transform duration-200 text-xl leading-none">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-gray-700 leading-relaxed">
                      Als je langer dan 6 weken moe bent ondanks voldoende slaap en een gezonde
                      leefstijl. Of als je last hebt van onverklaarbaar gewichtsverlies, koorts,
                      extreme dorst, of als de vermoeidheid plotseling begon. Je huisarts kan
                      bloedonderzoek doen op schildklier, vitamine D, B12, ijzer en testosteron.
                    </div>
                  </details>
                </div>
              </section>

              <MedicalDisclaimer />

              <footer className="mt-8 pt-8 border-t border-stone-200">
                <p className="text-sm text-gray-400 italic leading-relaxed">
                  Bij aanhoudende vermoeidheid langer dan 6 weken: laat bloedonderzoek doen via je
                  huisarts. Vermoeidheid kan ook wijzen op schildklierproblemen, bloedarmoede of
                  andere medische oorzaken. Supplementen zijn geen vervanging voor medische
                  diagnostiek.
                </p>
                <p className="mt-4 text-sm text-gray-400 italic">
                  Dit artikel is informatief van aard en vervangt geen medisch advies.
                </p>
              </footer>
            </article>
          </div>
        </Container>
      </main>
    </>
  );
}
