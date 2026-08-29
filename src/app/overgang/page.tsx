import type { Metadata } from "next";
import Link from "next/link";
import { canonicalMetadata } from "@/lib/seo/canonical";
import Container from "@/components/layout/Container";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { IntakeCtaMicro } from "@/components/common/IntakeCtaMicro";
import { ReferenceList } from "@/components/references/ReferenceList";
import PillarReadingChrome from "@/components/content/PillarReadingChrome";
import { INBODY_LEEFSTIJLCHECK_CTA_ATTR } from "@/lib/leefstijlcheck-inbody-cta";
import { overgangReferences } from "@/data/references/overgang";

const LINK =
  "font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] transition hover:decoration-ps-green hover:text-ps-green-hover";

export const metadata: Metadata = {
  title: "Overgang: wat verandert en wat helpt",
  description:
    "De overgang in begrijpelijke taal: wat perimenopauze met je slaap, botten en spieren doet — en welke leefstijlkeuzes daar volgens onderzoek het meeste aan doen. Geen hormoonadvies, geen wondermiddelen.",
  ...canonicalMetadata("/overgang"),
  openGraph: {
    title: "Overgang: Complete Gids",
    description:
      "Wat er verandert, wat onderzoek redelijkerwijs zegt en welke stappen je veilig eerst zet.",
    url: "/overgang",
    type: "article",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Overgang: Wat Verandert en Wat Je Zelf Kunt Doen",
  description:
    "De overgang: leefstijl, verwachtingen en wanneer medische hulp past.",
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
  datePublished: "2026-08-29",
  dateModified: "2026-08-29",
  mainEntityOfPage: "https://perfectsupplement.nl/overgang",
};

const faqItems = [
  {
    q: "Op welke leeftijd begint de overgang?",
    a: "De menstruatie stopt gemiddeld rond je eenenvijftigste, maar de hormonale overgangsfase (perimenopauze) begint bij de meeste vrouwen enkele jaren daarvoor — vaak midden veertig, soms eerder. De spreiding tussen vrouwen is groot.",
  },
  {
    q: "Helpt magnesium tegen overgangsklachten?",
    a: "Magnesium draagt bij aan de vermindering van vermoeidheid en een normale werking van het zenuwstelsel bij voldoende inname — dat is een erkende Europese claim, geen belofte tegen opvliegers of stemmingswisselingen specifiek.",
  },
  {
    q: "Helpen kruidenpreparaten zoals salieextract of teunisbloemolie tegen opvliegers?",
    a: "Voor deze preparaten bestaat geen door de EU goedgekeurde gezondheidsclaim. Het onderzoek is wisselend van kwaliteit en de resultaten zijn niet consistent. Wij noemen ze daarom niet als aanbeveling.",
  },
  {
    q: "Waarom is krachttraining specifiek nu belangrijk?",
    a: "Botverlies versnelt in de late perimenopauze en de eerste jaren erna. Onderzoek bij vrouwen met een lage botdichtheid laat zien dat zware, progressieve krachttraining de botdichtheid in heup en onderrug kan verbeteren — iets wat wandelen of lichte training niet doet.",
  },
  {
    q: "Wanneer is hormoontherapie een optie?",
    a: "Bij klachten die je dagelijks leven duidelijk beperken kan hormoontherapie een reële optie zijn. Dat is een individuele afweging met je huisarts, met voor- en nadelen die per persoon verschillen. Dit artikel gaat over wat je zelf via leefstijl kunt doen, niet over medische behandeling.",
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

export default function OvergangPage() {
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

      <main className="pb-16 md:pb-20 py-12 md:py-16">
        <Container>
          <div className="pillar-prose">
            <PillarReadingChrome>
            <article>
              <header>
                <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
                  Complete gids
                </p>
                <h1 className="mt-2 font-serif text-4xl font-bold text-gray-900 md:text-5xl">
                  Overgang: wat verandert en wat je zelf kunt doen
                </h1>
                <p className="mt-4 text-lg text-gray-600">
                  Bijgewerkt: augustus 2026 · Leestijd: 12 min
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
                      Wat gemiddeld verandert
                    </a>
                  </li>
                  <li>
                    <a href="#slaap" className="hover:underline">
                      Waarom juist je slaap verandert
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
                Ken je dit: nachten waarin je opeens klaarwakker bent, een cyclus die niet meer
                doet wat hij deed, stemmingen die sneller omslaan dan je gewend bent? Op internet
                wordt dat snel &ldquo;de overgang&rdquo; genoemd, met evenveel wondermiddelen als
                waarschuwingen erbij. In de praktijk is het een geleidelijke hormonale verschuiving
                die jaren duurt, met een grote spreiding tussen vrouwen. Deze gids helpt je
                verwachtingen bijstellen — zonder harde beloftes over jouw lichaam.
              </p>

              <p className="mt-6 text-sm text-gray-500">
                Benieuwd waar jij staat? Scroll naar beneden voor de gratis Leefstijlcheck.
              </p>

              <section id="herkenning" className="mt-12 scroll-mt-24">
                <h2 className="font-serif text-3xl font-bold text-gray-900">Ken Je Dit?</h2>
                <p className="mt-4 text-lg leading-relaxed text-gray-700">
                  Veel vrouwen merken veranderingen die ze pas achteraf aan de overgang koppelen.
                  Herkenning is nuttig — zelf-diagnose niet.
                </p>
                <p className="mt-6 font-medium text-gray-700">Ken je dit:</p>
                <ul className="mt-3 list-inside list-disc space-y-2 text-gray-700">
                  <li>Je cyclus wordt onregelmatiger — korter, langer, soms overgeslagen</li>
                  <li>Je slaapt slechter, ook zonder duidelijke aanleiding</li>
                  <li>Opvliegers of nachtelijk zweten, af en toe of vaker</li>
                  <li>Je stemming schommelt meer dan je van jezelf gewend bent</li>
                  <li>Herstel na een zware training of drukke week duurt langer</li>
                  <li>Je vraagt je af of &ldquo;het de overgang is&rdquo; — maar je weet het niet zeker</li>
                </ul>
                <p className="mt-6 leading-relaxed text-gray-700">
                  Als je hier drie of meer van herkent, lees verder. Dat is geen medische uitspraak
                  — wel een signaal om slaap, leefstijl en eventueel bloedonderzoek met je huisarts
                  te bespreken.
                </p>
              </section>

              <section id="wat-verandert" className="mt-14 scroll-mt-24">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Wat gemiddeld verandert
                </h2>
                <p className="mt-4 leading-relaxed text-gray-700">
                  De menstruatie stopt gemiddeld rond je eenenvijftigste — dat moment heet de
                  menopauze. De hormonale overgangsfase daarnaartoe, de perimenopauze, begint bij de
                  meeste vrouwen enkele jaren eerder, vaak midden veertig<sup>[1]</sup>. De spreiding
                  is groot: bij sommige vrouwen begint het al eind dertig, bij andere pas kort voor
                  hun laatste menstruatie.
                </p>

                <h3 className="mt-8 text-xl font-semibold text-gray-900">
                  1. Opvliegers duren vaak langer dan gedacht
                </h3>
                <p className="mt-3 leading-relaxed text-gray-700">
                  Grootschalig Amerikaans onderzoek (de SWAN-studie, ruim 1300 vrouwen langdurig
                  gevolgd) vond dat opvliegers en nachtelijk zweten bij meer dan de helft van de
                  vrouwen langer dan zeven jaar aanhielden, en bij een deel nog jaren na de laatste
                  menstruatie doorgingen<sup>[1]</sup>. Dat is geen voorspelling voor jou persoonlijk
                  — wel een reden om niet op &ldquo;het is zo voorbij&rdquo; te rekenen.
                </p>

                <h3 className="mt-8 text-xl font-semibold text-gray-900">
                  2. Botverlies versnelt, en dat merk je niet
                </h3>
                <p className="mt-3 leading-relaxed text-gray-700">
                  Hetzelfde onderzoeksprogramma volgde de botdichtheid van bijna 2000 vrouwen door de
                  overgang heen: het verlies versnelt duidelijk in de late perimenopauze en zet in
                  hetzelfde tempo door in de eerste jaren erna<sup>[2]</sup>. Dat proces voel je niet
                  — het wordt pas zichtbaar bij een botdichtheidsmeting, jaren later. Precies daarom
                  is dit het moment om er iets aan te doen, niet pas als er al klachten zijn.
                </p>

                <h3 className="mt-8 text-xl font-semibold text-gray-900">
                  3. Eén klacht zegt weinig, het patroon wel
                </h3>
                <p className="mt-4 leading-relaxed text-gray-700">
                  Slaap, stemming, energie en cyclus hangen samen en beïnvloeden elkaar over en weer.
                  Slechte nachten maken je stemming instabieler; een instabiele stemming maakt
                  inslapen lastiger. Daarom werkt het beter om naar het geheel te kijken dan naar één
                  klacht apart — dat is precies wat de Leefstijlcheck verderop in deze gids doet.
                </p>
              </section>

              <section id="slaap" className="mt-14 scroll-mt-24">
                <h3 className="font-serif text-2xl font-bold text-gray-900">
                  Waarom juist je slaap verandert
                </h3>
                <p className="mt-4 leading-relaxed text-gray-700">
                  Een review van onderzoek naar slaap in de menopauzale overgang laat zien dat een
                  aanzienlijk deel van de vrouwen in deze periode nieuwe slaapklachten ontwikkelt —
                  van vaker wakker worden tot klachten die aan de klinische maatstaf voor insomnie
                  voldoen<sup>[3]</sup>. Nachtelijke opvliegers zijn een deel van de verklaring, maar
                  niet de hele: de onderliggende hormonale verschuiving beïnvloedt ook rechtstreeks
                  hoe je slaapcyclus verloopt. Praktischer: lees de gids{" "}
                  <Link href="/slaap-verbeteren-na-40" className={LINK}>
                    slaap verbeteren na 40
                  </Link>{" "}
                  voor wat je aan ritme en avondgewoontes kunt doen — vóór je aan supplementen
                  denkt.
                </p>
              </section>

              <section id="leefstijl" className="mt-14 scroll-mt-24">
                <h2 className="font-serif text-3xl font-bold text-gray-900">Leefstijl Eerst</h2>
                <p className="mt-4 leading-relaxed text-gray-700">
                  Geen enkel supplement vervangt de basis. Deze hefbomen hebben het meeste bewijs
                  rond bot, spier en energie in deze levensfase:
                </p>

                <h3 className="mt-8 text-xl font-semibold text-gray-900">
                  1. Krachttraining — de sterkste hefboom voor je botten
                </h3>
                <p className="mt-3 leading-relaxed text-gray-700">
                  Een gerandomiseerde studie bij vrouwen met een lage botdichtheid (de
                  LIFTMOR-trial) vond dat acht maanden zware, progressieve kracht- en impacttraining
                  de botdichtheid in de onderrug met ongeveer 4% verbeterde ten opzichte van lichte
                  training — met een therapietrouw van meer dan 90%<sup>[4]</sup>. Wandelen en
                  fietsen zijn goed voor je hart, maar geven je botten niet dezelfde prikkel. Twee
                  tot drie keer per week met progressieve belasting is waar het verschil zit.
                </p>

                <h3 className="mt-8 text-xl font-semibold text-gray-900">
                  2. Eiwit — tegen het sneller verlies van spiermassa
                </h3>
                <p className="mt-3 leading-relaxed text-gray-700">
                  Een positiepaper van internationale verouderingsonderzoekers adviseert 1,0–1,2
                  g eiwit per kg lichaamsgewicht per dag voor gezonde ouderen, oplopend naar 1,2–1,5
                  g/kg bij wie regelmatig traint — verspreid over de dag, met 25–30 g per
                  maaltijd<sup>[5]</sup>. Dat is meer dan de meeste mensen gewend zijn en meer dan de
                  algemene aanbeveling van 0,8 g/kg. Zie ook{" "}
                  <Link href="/herstel-verbeteren-na-40" className={LINK}>
                    herstel verbeteren na 40
                  </Link>{" "}
                  voor hoe je dat praktisch invult.
                </p>

                <h3 className="mt-8 text-xl font-semibold text-gray-900">
                  3. Calcium en vitamine D — de bouwstenen
                </h3>
                <p className="mt-3 leading-relaxed text-gray-700">
                  De Gezondheidsraad adviseert vrouwen van 50 tot 69 jaar 1100 mg calcium per dag —
                  hoger dan voor jongere vrouwen, precies vanwege het versnelde botverlies rond de
                  overgang<sup>[6]</sup>. Calcium haal je vooral uit voeding (zuivel, groene
                  groenten, vis met graat); vitamine D draagt officieel bij aan de instandhouding van
                  normale botten én aan de normale opname van calcium, en is in Nederland lastiger
                  uit voeding te halen. Zie de{" "}
                  <Link href="/beste/vitamine-d" className={LINK}>
                    vitamine D-vergelijking
                  </Link>
                  .
                </p>

                <h3 className="mt-8 text-xl font-semibold text-gray-900">
                  4. Slaapritme en avondgewoontes
                </h3>
                <p className="mt-3 leading-relaxed text-gray-700">
                  Vast bed- en wakker-tijdstip, een koelere slaapkamer (helpt bij nachtelijk
                  zweten), minder alcohol als slaapmiddel. Zie{" "}
                  <Link href="/slaap-verbeteren-na-40" className={LINK}>
                    slaap verbeteren na 40
                  </Link>{" "}
                  voor de volledige aanpak.
                </p>

                <h3 className="mt-8 text-xl font-semibold text-gray-900">
                  5. Medische baseline
                </h3>
                <p className="mt-3 leading-relaxed text-gray-700">
                  Beperken opvliegers, stemmingsklachten of slaapproblemen je dagelijks leven
                  ondanks basis-leefstijl? Bespreek met je huisarts of hormoontherapie in jouw
                  situatie past — dat is een individuele afweging met voor- en nadelen, niet iets
                  wat je via een potje regelt.
                </p>
              </section>

              <section id="supplementen" className="mt-14 scroll-mt-24">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Supplementen In Context
                </h2>
                <p className="mt-4 leading-relaxed text-gray-700">
                  Geen supplement vervangt een meting of medisch advies — en voor de meeste
                  kruidenpreparaten die tegen opvliegers worden aangeprezen (zoals salieextract of
                  teunisbloemolie) bestaat geen door de EU goedgekeurde gezondheidsclaim. Wat wél
                  onderbouwd is, past bij bot, spier en slaap — naast krachttraining, eiwit via
                  voeding en een vast ritme.
                </p>

                <div className="mt-8 rounded-xl border border-stone-200 bg-stone-50 p-5">
                  <h3 className="font-semibold text-gray-900">Supplementen in onderzoek</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">
                    geen hormoon-oplossing
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-700">
                    Geen supplement vervangt medisch advies — en geen combinatie van supplementen
                    vervangt krachttraining, eiwit en slaap.
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700">
                    <li>
                      <strong className="text-gray-900">Vitamine D</strong> — draagt bij tot de
                      instandhouding van normale botten en tot de normale opname van calcium.{" "}
                      <Link href="/beste/vitamine-d" className={LINK}>
                        Bekijk de vitamine D-vergelijking →
                      </Link>
                    </li>
                    <li>
                      <strong className="text-gray-900">Magnesium</strong> — draagt bij aan de
                      vermindering van vermoeidheid en een normale werking van het zenuwstelsel bij
                      voldoende inname; geen erkende claim tegen opvliegers of stemming.{" "}
                      <Link href="/beste/magnesium" className={LINK}>
                        Bekijk de magnesium-vergelijking →
                      </Link>
                    </li>
                    <li>
                      <strong className="text-gray-900">Eiwitpoeder</strong> — handig als je
                      dagdoel (≈1,0–1,5 g/kg) lastig haalt via maaltijden; officieel erkend voor
                      groei en instandhouding van spiermassa.{" "}
                      <Link href="/beste/eiwitpoeder" className={LINK}>
                        Bekijk de eiwitpoeder-vergelijking →
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
                    <li>Slaapkamer een graad koeler tegen nachtelijk zweten</li>
                  </ul>
                </div>

                <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-6">
                  <p className="text-lg font-semibold text-gray-900">Week 2–3 — Verankeren</p>
                  <ul className="mt-3 list-inside list-disc space-y-2 text-gray-700">
                    <li>Krachttraining 2× per week met progressieve belasting</li>
                    <li>Calcium via voeding checken (zuivel, groene groenten, vis met graat)</li>
                    <li>Vitamine D-inname op orde brengen, zeker in de winter</li>
                  </ul>
                </div>

                <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-6">
                  <p className="text-lg font-semibold text-gray-900">Week 4 — Meten</p>
                  <p className="mt-3 leading-relaxed text-gray-700">
                    Doe de{" "}
                    <Link href="/intake" className={LINK}>
                      Leefstijlcheck
                    </Link>{" "}
                    opnieuw. Vergelijk slaap-, stress- en energie-scores. Beperken klachten je
                    dagelijks leven? Bespreek met je huisarts of hormoontherapie past — niet zelf
                    supplementen stapelen.
                  </p>
                </div>
              </section>

              <section id="verder-lezen" className="mt-14 scroll-mt-24">
                <h2 className="font-serif text-3xl font-bold text-gray-900">Verder Lezen</h2>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Link
                    href="/slaap-verbeteren-na-40"
                    className="group block rounded-xl border border-stone-200 bg-stone-50 p-5 transition-colors hover:border-ps-green/30"
                  >
                    <p className="text-sm leading-relaxed text-gray-700">
                      Slaap verbeteren: ritme, licht en avondgewoontes die je nachtrust
                      ondersteunen.
                    </p>
                    <span className="mt-3 inline-block text-sm font-semibold text-ps-green group-hover:underline">
                      Lees de gids →
                    </span>
                  </Link>
                  <Link
                    href="/herstel-verbeteren-na-40"
                    className="group block rounded-xl border border-stone-200 bg-stone-50 p-5 transition-colors hover:border-ps-green/30"
                  >
                    <p className="text-sm leading-relaxed text-gray-700">
                      Herstel verbeteren: eiwit, training en rust — hoe je veerkracht opbouwt.
                    </p>
                    <span className="mt-3 inline-block text-sm font-semibold text-ps-green group-hover:underline">
                      Lees de gids →
                    </span>
                  </Link>
                </div>

                <p className="mt-6 text-sm text-gray-600">
                  Wil je een compact overzicht per e-mail?{" "}
                  <Link href="/gidsen/overgang" className={LINK}>
                    Vraag de gratis Overgangsgids aan
                  </Link>
                  .
                </p>
              </section>

              <section
                id="leefstijlcheck"
                className="mt-14 scroll-mt-24"
                {...{ [INBODY_LEEFSTIJLCHECK_CTA_ATTR]: "" }}
              >
                <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
                  <h2 className="font-serif text-2xl font-bold text-gray-900 md:text-3xl">
                    Ontdek Waar Jij Staat
                  </h2>
                  <p className="mx-auto mt-3 max-w-lg leading-relaxed text-gray-600">
                    De overgang speelt mee in een groter plaatje. In 3 minuten zie je hoe je scoort
                    op slaap, stress, voeding, beweging en verbinding — en welk profiel past.
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

              <ReferenceList references={overgangReferences} />
              <MedicalDisclaimer />
            </article>
            </PillarReadingChrome>
          </div>
        </Container>
      </main>
    </>
  );
}
