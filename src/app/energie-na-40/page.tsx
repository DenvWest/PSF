import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { IntakeCtaMicro } from "@/components/common/IntakeCtaMicro";
import PillarReadingChrome from "@/components/content/PillarReadingChrome";
import PillarStickyIntakeCta from "@/components/content/PillarStickyIntakeCta";

const INLINE_LINK_CLASS =
  "font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] transition hover:decoration-ps-green hover:text-ps-green-hover";

export const metadata: Metadata = {
  title: "Energie Na 40: Waarom Je Moe Bent en Wat Je Eraan Doet | PerfectSupplement",
  description:
    "Structureel moe na 40? Herkenning, oorzaken in begrijpelijke taal (slaap, ritme, eten, beweging) en wat je stap voor stap kunt doen.",
  alternates: {
    canonical: "/energie-na-40",
  },
  openGraph: {
    title: "Energie Na 40: Waarom Je Anders Bent (en Wat Je Eraan Doet)",
    description:
      "Structureel moe na 40? Praktische stappen rond slaap, ritme, eten en beweging.",
    url: "/energie-na-40",
    type: "article",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Energie Na 40: Waarom Je Moe Bent en Wat Je Eraan Doet",
  description:
    "Structureel moe na 40? Herkenning, oorzaken in begrijpelijke taal en wat je stap voor stap kunt doen.",
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
        text: "Vermoeidheid heeft meestal meerdere oorzaken tegelijk: te weinig slaap, onregelmatig ritme, weinig beweging, veel stress en maaltijden met snelle suikerpieken. Dat voelt anders dan \"één nachtje kort\". Wil je het biologische verhaal dieper (bijv. mitochondriën of ATP)? Zie de kennisbank — hier focussen we op wat je in je week kunt sturen.",
      },
    },
    {
      "@type": "Question",
      name: "Welk supplement helpt het beste tegen vermoeidheid?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dat hangt af van je situatie. Vitamine D en omega-3 hebben erkende EU‑claims op onderdelen van gezondheid (zoals botten, immuunsysteem, hart, hersenen) — geen vaste claim op \"minder moe\" voor iedereen. Creatine heeft een EU‑claim rond korte, intense inspanning. Begin bij leefstijl; bij aanhoudende klachten kun je met je huisarts bloedonderzoek bespreken.",
      },
    },
    {
      "@type": "Question",
      name: "Kan lage testosteron mijn vermoeidheid veroorzaken?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Hormonen zoals testosteron spelen mee bij energie en herstel, maar vermoeidheid is zelden één meetwaarde. Bij aanhoudende klachten (langdurige moeheid, duidelijke verandering in libido of spiermassa) is het zinvol om dit met je huisarts te bespreken — niet zelf te diagnosticeren.",
      },
    },
    {
      "@type": "Question",
      name: "Hoe snel merk ik verschil als ik mijn leefstijl aanpas?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Eerste stappen zoals eiwit bij het ontbijt, daglicht na het opstaan en minder cafeïne laat op de dag merken veel mensen binnen enkele dagen. Een rustiger weekritme bouw je meestal over enkele weken. Supplementen volg je altijd op het etiket en bij twijfel met je arts.",
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

      <main className="pb-24 md:pb-28 py-12 md:py-16">
        <Container>
          <div className="max-w-3xl mx-auto">
            <PillarReadingChrome>
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
                      Waarom energie na 40 anders voelt
                    </a>
                  </li>
                  <li>
                    <a href="#mitochondrien" className="hover:underline">
                      Celenergie — kort en zonder jargon
                    </a>
                  </li>
                  <li>
                    <a href="#hormonen" className="hover:underline">
                      Slaap, stress en eetritme
                    </a>
                  </li>
                  <li>
                    <a href="#bloedsuiker" className="hover:underline">
                      Eten en energiepieken
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
                  Als je hier drie of meer van herkent, lees verder. Dat is geen &ldquo;normaal ouder
                  worden&rdquo; — het is een signaal om je weekritme, slaap en voeding scherper te bekijken.
                </p>
              </section>

              {/* 4. Wat er verandert */}
              <section id="wat-er-verandert" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Waarom energie na 40 anders kan voelen
                </h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Vermoeidheid is zelden één oorzaak. Meestal spelen slaap, stress, beweging en
                  eetpatroon samen — langzaam genoeg om het te normaliseren, maar merkbaar genoeg om
                  er bewust mee aan de slag te gaan.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  1. Herstel duurt langer na dezelfde week
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Veel mannen merken dat een drukke week langer &ldquo;naar&rdquo; voelt dan tien jaar geleden.
                  Dat hoeft geen ziekte te zijn: het past vaak bij minder slaap, meer schermwerk en
                  minder beweging tussen vergaderingen door.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  2. Je hoofd blijft lang &ldquo;aan&rdquo;, je lichaam wil rust
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Stress en piekeren kosten energie — ook als je overdag &ldquo;alles redt&rdquo;. Als je
                  &apos;s avonds niet echt ontspant, blijft het gevoel van zwaarte hangen.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  3. Eten met snelle pieken maakt dips voorspelbaar
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Veel ontbijten en lunches zijn rijk aan snelle koolhydraten en arm aan eiwit. Dan
                  volgt vaak een snelle opfleuring en daarna een zware middag — onafhankelijk van je
                  leeftijd, maar na 40 merken mensen dat vaker.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  4. Binnen werken en weinig zonlicht
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Veel volwassenen halen minder vitamine D uit zonlicht dan je denkt, vooral als je
                  veel binnen zit. Dat is geen diagnose bij jou — wel een reden om voeding en
                  eventueel aanvulling met je huisarts te bespreken als klachten aanhouden.
                </p>
              </section>

              <section id="mitochondrien" className="mt-14">
                <h3 className="font-serif text-2xl font-bold text-gray-900">
                  Celenergie — kort, zonder medische claims
                </h3>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Je lichaam maakt energie uit voeding en zuurstof — op een manier die je op school
                  misschien &ldquo;mitochondriën&rdquo; en &ldquo;ATP&rdquo; hoorde noemen. Belangrijk voor nu: beweging,
                  slaap en eiwitrijke maaltijden helpen veel mensen om zich fitter te voelen. Wil je
                  het wetenschappelijke kader? Lees{" "}
                  <Link href="/kennisbank/mitochondrien" className={INLINE_LINK_CLASS}>
                    mitochondriën
                  </Link>{" "}
                  en{" "}
                  <Link href="/kennisbank/atp" className={INLINE_LINK_CLASS}>
                    ATP
                  </Link>{" "}
                  in de kennisbank — zonder dat we hier claimen wat er in jouw cellen meetbaar gebeurt.
                </p>
              </section>

              <section id="hormonen" className="mt-14">
                <h3 className="font-serif text-2xl font-bold text-gray-900">
                  Slaap, stress en eetritme (geen hormoon-diagnose)
                </h3>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Hormonen spelen mee bij energie en herstel, maar vanaf een webpagina kunnen we niet
                  zeggen wat jouw testosteron of andere waarden doen. Wél zien we in de praktijk dat
                  vaste slaaptijden, minder laat cafeïne en minder chronische &ldquo;doorwerkavonden&rdquo;
                  vaak het grootste verschil maken.
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Blijft vermoeidheid lang hangen, of verandert er veel aan libido, spiermassa of
                  stemming? Bespreek het met je huisarts — eventueel met bloedonderzoek — in plaats
                  van zelf te gokken.
                </p>
              </section>

              <section id="bloedsuiker" className="mt-14">
                <h3 className="font-serif text-2xl font-bold text-gray-900">
                  Eten en energiepieken — wat je merkt in je dag
                </h3>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  De meeste mannen 40+ eten relatief weinig eiwit bij het ontbijt en veel snelle
                  koolhydraten. Het resultaat: een korte oppepper en daarna een zware middag — vaak
                  omschreven als hersenmist of snackdrang.
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Drie simpele hefbomen:
                </p>
                <ul className="mt-3 space-y-2 text-gray-700 list-disc list-inside">
                  <li>Eiwit bij elke maaltijd — minimaal 25–30 gram, vooral bij het ontbijt</li>
                  <li>
                    Niet te veel sterke koffie op een lege maag — dat maakt voor veel mensen de ochtend
                    onrustiger
                  </li>
                  <li>
                    Bewegen na het eten — een wandeling van 10–15 minuten na de lunch helpt vaak om
                    de middag vlakker te maken
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
                  Ga binnen 30 minuten na het opstaan naar buiten voor daglicht. Dat helpt veel
                  mensen om het ritme van wakker worden en slapen gaan natuurlijker te laten voelen —
                  zeker als je veel binnen werkt.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  3. Geen cafeïne na 14:00
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Cafeïne heeft een halfwaardetijd van enkele uren. Koffie laat op de dag kan voor
                  veel mensen slapen lastiger maken. Switch na de lunch naar water of kruidenthee.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  4. Bewegen — maar slim
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Dagelijks 30 minuten wandelen helpt veel mensen om zich energieker te voelen dan
                  af en toe een hele zware sessie. Krachttraining 2–3x per week ondersteunt kracht en
                  conditie — plan herstel er bewust tussen. Heel laat intensief trainen past niet bij
                  iedereen als je al slecht slaapt.
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
                  In Nederland hebben veel volwassenen een vitamine D‑inname die onder de adviezen
                  ligt, vooral met weinig zon. Vitamine D draagt — bij voldoende inname — o.a. bij aan
                  botten, spieren en het immuunsysteem (EU‑claims). Laat dosering en bloedonderzoek
                  liever met je huisarts afstemmen dan zelf hoge doses te gokken.
                </p>
                <div className="mt-4 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Welke vitamine D is het best gedoseerd en meest compleet?
                  </p>
                  <Link
                    href="/beste/vitamine-d"
                    className="mt-2 inline-block font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px]"
                  >
                    Bekijk de vergelijking →
                  </Link>
                </div>

                <h3 className="font-semibold text-xl text-gray-900 mt-10">Omega-3 (EPA/DHA)</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  EPA en DHA hebben erkende EU‑claims onder andere voor hart en hersenen (DHA), mits
                  je de productteksten volgt. Als je weinig vette vis eet, is een supplement vaak
                  praktischer — vergelijk zuiverheid en hoeveelheid EPA/DHA per dag.
                </p>
                <div className="mt-4 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Welke omega-3 is het zuiverst en best gedoseerd?
                  </p>
                  <Link
                    href="/beste/omega-3-supplement"
                    className="mt-2 inline-block font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px]"
                  >
                    Bekijk de vergelijking →
                  </Link>
                </div>

                <h3 className="font-semibold text-xl text-gray-900 mt-10">Creatine</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Creatine monohydraat heeft een EU‑claim rond korte, intense inspanning bij
                  dagelijks gebruik volgens het etiket. Het is geen vervanging voor slaap en voeding,
                  maar past voor veel mensen die kracht willen ondersteunen.
                </p>
                <div className="mt-4 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Welke creatine is het zuiverst?
                  </p>
                  <Link
                    href="/beste/creatine"
                    className="mt-2 inline-block font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px]"
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
                    className="mt-2 inline-block font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px]"
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
                    className="mt-2 inline-block text-sm font-semibold text-ps-green hover:underline"
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
                    className="mt-2 inline-block text-sm font-semibold text-ps-green hover:underline"
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
                    className="mt-2 inline-block text-sm font-semibold text-ps-green hover:underline"
                  >
                    Lees de gids: Slaap Verbeteren na 40 →
                  </Link>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Link
                    href="/blog/vitamine-d-en-energie"
                    className="group block rounded-xl border border-stone-200 bg-stone-50 p-5 transition-colors hover:border-ps-green/30"
                  >
                    <p className="text-sm leading-relaxed text-gray-700">
                      Vitamine D en energie: wat claims wél zeggen en wanneer meten zinvol is.
                    </p>
                    <span className="mt-3 inline-block text-sm font-semibold text-ps-green group-hover:underline">
                      Lees het cluster-artikel →
                    </span>
                  </Link>
                  <Link
                    href="/testosteron-na-40"
                    className="group block rounded-xl border border-stone-200 bg-stone-50 p-5 transition-colors hover:border-ps-green/30"
                  >
                    <p className="text-sm leading-relaxed text-gray-700">
                      Testosteron na 40 in voorzichtige taal — gekoppeld aan energie en stress.
                    </p>
                    <span className="mt-3 inline-block text-sm font-semibold text-ps-green group-hover:underline">
                      Naar de pillar →
                    </span>
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
                  <IntakeCtaMicro className="mx-auto mt-4 max-w-lg text-sm text-gray-500" />
                  <Link
                    href="/intake"
                    className="mt-5 inline-block bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
                  >
                    Zie waar jouw energie, slaap en stress scoren — gratis →
                  </Link>
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
                      Vermoeidheid heeft meestal meerdere oorzaken tegelijk: te weinig slaap,
                      onregelmatig ritme, weinig beweging, veel stress en maaltijden met snelle
                      suikerpieken. Dat voelt anders dan &quot;één nachtje kort&quot;. Wil je het
                      biologische verhaal dieper (bijv. mitochondriën of ATP)? Zie de kennisbank —
                      hier focussen we op wat je in je week kunt sturen.
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
                      Dat hangt af van je situatie. Vitamine D en omega-3 hebben erkende EU‑claims op
                      onderdelen van gezondheid (zoals botten, immuunsysteem, hart, hersenen) — geen
                      vaste claim op &quot;minder moe&quot; voor iedereen. Creatine heeft een EU‑claim
                      rond korte, intense inspanning. Begin bij leefstijl; bij aanhoudende klachten
                      kun je met je huisarts bloedonderzoek bespreken.
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
                      Hormonen zoals testosteron spelen mee bij energie en herstel, maar vermoeidheid
                      is zelden één meetwaarde. Bij aanhoudende klachten (langdurige moeheid, duidelijke
                      verandering in libido of spiermassa) is het zinvol om dit met je huisarts te
                      bespreken — niet zelf te diagnosticeren.
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
                      Eerste stappen zoals eiwit bij het ontbijt, daglicht na het opstaan en minder
                      cafeïne laat op de dag merken veel mensen binnen enkele dagen. Een rustiger
                      weekritme bouw je meestal over enkele weken. Supplementen volg je altijd op het
                      etiket en bij twijfel met je arts.
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
              </footer>
            </article>
            </PillarReadingChrome>
          </div>
        </Container>
      </main>
      <PillarStickyIntakeCta />
    </>
  );
}
