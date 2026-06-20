import type { Metadata } from "next";
import Link from "next/link";
import { canonicalMetadata } from "@/lib/seo/canonical";
import Container from "@/components/layout/Container";
import { ReferenceList } from "@/components/references/ReferenceList";
import { RefNote } from "@/components/references/RefNote";
import { herstelVerbeterenNa40References } from "@/data/references/herstel-verbeteren-na-40";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { IntakeCtaMicro } from "@/components/common/IntakeCtaMicro";
import PillarReadingChrome from "@/components/content/PillarReadingChrome";
import { INBODY_LEEFSTIJLCHECK_CTA_ATTR } from "@/lib/leefstijlcheck-inbody-cta";

const INLINE_LINK_THEME =
  "font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px]";

export const metadata: Metadata = {
  title: "Herstel Verbeteren Na 40: Training, Voeding & Supplementen | PerfectSupplement",
  description:
    "Trager herstel na 40? Lees waarom spierherstel verandert en wat werkt: slaap, eiwit, rust, magnesium, omega-3, vitamine D, creatine en meer — onderbouwd en stap voor stap.",
  ...canonicalMetadata("/herstel-verbeteren-na-40"),
  openGraph: {
    title: "Herstel Verbeteren Na 40: De Complete Gids",
    description:
      "Trager herstel na je 40e? Training, slaap en voeding in balans brengen — plus welke supplementen het meeste onderbouwing hebben.",
    url: "/herstel-verbeteren-na-40",
    type: "article",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Herstel Verbeteren Na 40: De Complete Gids",
  description:
    "Waarom spierherstel na 40 verandert — en een praktisch protocol met voeding en supplementen.",
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
  datePublished: "2026-05-09",
  dateModified: "2026-05-09",
  mainEntityOfPage: "https://perfectsupplement.nl/herstel-verbeteren-na-40",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Hoeveel eiwit per dag na 40 als ik train?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Richt voor gezonde mannen 40+ bij regelmatige krachttraining vaak op ongeveer 1,2–1,6 g eiwit per kg lichaamsgewicht per dag, verdeeld over de dag. Zonder structurele training kun je dichter tegen 1,0–1,2 g/kg zitten — exacte behoefte hangt af van lichaamsmaat en training.",
      },
    },
    {
      "@type": "Question",
      name: "Kan ik magnesium combineren met creatine?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja — dat is veelvoorkomend en hoeft niet in de weg te staan. Creatine wordt vaak rond het trainmoment of op een vast tijdstip gebruikt; magnesiumglycinaat past vaak bij de avondroutine of na training. Bij maagklachten: spreid tijdstippen.",
      },
    },
    {
      "@type": "Question",
      name: "Hoe lang tot ik herstel merk?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Slaap- en eiwitinterventies kunnen binnen een paar dagen tot twee weken subjectief verschil geven. Omega-3 en vitamine D hebben bij een gemeten tekort langere opbouwfase nodig — denk aan wéken tot maanden voor bloedparameters. Bij twijfel: laat eerste bloedwerk bij je huisarts doen voor je structureel micronutriënten hoog wilt doseren.",
      },
    },
    {
      "@type": "Question",
      name: "Moet ik alle supplementen tegelijk starten?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nee. Voeg stap voor stap toe — begin met gedrag (slaaptijden, eiwit, rustdagen), daarna maximaal één nieuwe suppletiestap per ongeveer 1 á 2 weken zodat je effect en bijwerkingen kunt herleiden.",
      },
    },
    {
      "@type": "Question",
      name: "Wanneer naar de huisarts met herstelklachten?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bij extreme vermoeidheid, niet-aangeboden spierpijn, spontane spierzwakte, koorts of onbedoeld fors gewichtsverlies. Ook bij pijnklachten aan de borst tijdens belasting: stop met zware inspanning en laat jezelf nakijken. Dit artikel is informatief en vervangt geen onderzoek of diagnose.",
      },
    },
  ],
};

export default function HerstelVerbeterenNa40Page() {
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
                  Complete Gids
                </p>
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mt-2">
                  Herstel Verbeteren Na 40: De Complete Gids
                </h1>
                <p className="mt-4 text-lg text-gray-600">
                  Bijgewerkt: mei 2026 · Leestijd: 12 min
                </p>
              </header>

              <nav
                aria-label="Inhoudsopgave"
                className="mt-10 p-6 bg-stone-50 rounded-xl border border-stone-200"
              >
                <p className="font-semibold text-gray-900 mb-3">In deze gids</p>
                <ol className="space-y-2 text-green-800 list-decimal list-inside">
                  <li>
                    <a href="#herkenbaar" className="hover:underline">
                      Herkenbaar?
                    </a>
                  </li>
                  <li>
                    <a href="#wat-er-verandert" className="hover:underline">
                      Wat er verandert na 40
                    </a>
                  </li>
                  <li>
                    <a href="#training-alleen" className="hover:underline">
                      Waarom training alleen niet genoeg is
                    </a>
                  </li>
                  <li>
                    <a href="#spierherstel" className="hover:underline">
                      Spierherstel na 40: wat verandert echt?
                    </a>
                  </li>
                  <li>
                    <a href="#wat-je-zelf-kunt-doen" className="hover:underline">
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

              <section id="herkenbaar" className="mt-12">
                <h2 className="font-serif text-3xl font-bold text-gray-900">Ken Je Dit?</h2>
                <p className="mt-4 text-lg text-gray-700 leading-relaxed">
                  Je traint nog steeds serieus, maar je lichaam reageert anders dan vroeger. Een sessie
                  die je op je 30e binnen 48 uur verteerde, voel je nu soms drie of vier dagen. Je bent
                  niet lui of &ldquo;uit vorm&rdquo; — je ruimte om te herstellen is kleiner geworden.
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Veel mannen 40+ merken hetzelfde patroon: belasting stapelt sneller op dan herstel.
                  Dan voelt het alsof je harder moet trainen voor minder resultaat, terwijl de echte
                  winst juist zit in slimmer herstellen.
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">Herken je dit:</p>
                <ul className="mt-3 space-y-2 text-gray-700 list-disc list-inside">
                  <li>Spierpijn en stijfheid houden langer aan dan een paar jaar geleden</li>
                  <li>Je prestaties schommelen meer tussen trainingen</li>
                  <li>Je slaapt genoeg uur, maar wordt niet echt uitgerust wakker</li>
                  <li>Na drukke werkdagen voelt trainen &ldquo;zwaarder&rdquo; dan normaal</li>
                  <li>Je voelt je vaak moe, ondanks dat je &ldquo;alles goed doet&rdquo;</li>
                </ul>
                <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-gray-800 font-medium">
                    Train je hard, maar blijf je achter de feiten aanlopen?
                  </p>
                  <p className="mt-2 text-gray-600">
                    Dan past mogelijk het leefstijlpatroon Overtrainer bij jou: hoge belasting, te weinig buffers.
                  </p>
                  <Link
                    href="/profiel/overtrainer"
                    className="mt-3 inline-block text-green-700 font-semibold hover:text-green-800"
                  >
                    Bekijk het profiel Overtrainer →
                  </Link>
                </div>
                <p className="mt-6 text-gray-700 leading-relaxed">In deze gids leer je:</p>
                <ul className="mt-3 space-y-2 text-gray-700 list-disc list-inside">
                  <li>Wat er biologisch verandert in herstel na je 40e</li>
                  <li>Waarom training zonder herstelstrategie vastloopt</li>
                  <li>Welke leefstijlinterventies het meeste effect geven</li>
                  <li>Welke supplementen onderbouwd zijn — en hoe je ze slim inzet</li>
                </ul>
              </section>

              <section id="wat-er-verandert" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Wat Er Verandert Na 40
                </h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Herstelproblemen na 40 zijn geen karakterkwestie. Je fysiologie verschuift echt. De
                  trainingsprikkel kan nog steeds sterk zijn, maar je systeem vraagt betere randvoorwaarden:
                  slaapkwaliteit, eiwitverdeling, stressregulatie en rustmomenten.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  Testosteron daalt geleidelijk
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Onderzoek dat mannen jarenlang volgt, laat zien dat het totale en vrije testosteron
                  gemiddeld afnemen met de leeftijd
                  <RefNote number={1} />
                  <RefNote number={2} />
                  . Dat hoeft geen probleem te zijn, maar het maakt consistent trainen, voldoende eiwit en
                  herstelplanning belangrijker dan op je 25e.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  Je slaappatroon verandert mee
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Diepe slaap en het herstel via je hormonen veranderen naarmate je ouder wordt
                  <RefNote number={3} />
                  . Daardoor kan 7 uur slaap op papier minder herstel opleveren dan vroeger. Niet alleen
                  slaapduur telt, maar ook slaapkwaliteit en regelmaat.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">Meer sluimerende ontstekingen</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Met het ouder worden neemt vaak de lichte, sluimerende ontsteking in je lichaam toe
                  <RefNote number={4} />
                  <RefNote number={5} />
                  . Dat kan je spierherstel vertragen en vermoeidheid versterken, vooral als zware
                  trainingen, werkstress en slaaptekort tegelijk oplopen.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  Je spieren reageren minder sterk op eiwit
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Oudere spieren reageren minder sterk op dezelfde hoeveelheid eiwit per maaltijd
                  <RefNote number={6} />
                  <RefNote number={7} />
                  <RefNote number={21} />
                  . Daarom werkt &ldquo;voldoende totaal eiwit + slimme spreiding over de dag&rdquo; vaak beter dan
                  alles in een avondmaaltijd proppen.
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Wil je dieper duiken in het biologische verhaal (bijvoorbeeld{" "}
                  <Link href="/kennisbank/overtrainingssyndroom" className={INLINE_LINK_THEME}>
                    overtraining
                  </Link>
                  ,{" "}
                  <Link href="/kennisbank/eiwitbehoefte-na-40" className={INLINE_LINK_THEME}>
                    eiwitbehoefte na 40
                  </Link>
                  ,{" "}
                  <Link href="/kennisbank/mitochondrien" className={INLINE_LINK_THEME}>
                    mitochondriën
                  </Link>{" "}
                  of{" "}
                  <Link href="/kennisbank/atp" className={INLINE_LINK_THEME}>
                    ATP
                  </Link>
                  )? Dat lees je in de kennisbank — zonder dat we hier claimen wat er bij jou
                  precies meetbaar speelt.
                </p>
              </section>

              <section id="training-alleen" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Waarom Training Alleen Niet Genoeg Is
                </h2>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  Meer volume is niet altijd beter
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Zonder herstelweken kan extra training juist minder vooruitgang opleveren en
                  klachten opstapelen. Wetenschappelijke richtlijnen over overbelasting en overtraining
                  benadrukken de balans tussen inspanning en herstel
                  <RefNote number={8} />
                  .
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">Slaap bepaalt je adaptatie</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Slaapschuld verstoort processen in je stofwisseling en hormonen die je nodig hebt voor
                  herstel
                  <RefNote number={9} />
                  . Bij sporters hangt slaapkwaliteit bovendien samen met prestaties en hoe goed het
                  herstel voelt
                  <RefNote number={12} />
                  .
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  Voeding is kritischer geworden
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Wetenschappelijke adviezen wijzen bij veel 40-plussers op een hogere eiwitinname dan
                  de minimale norm, zeker bij krachttraining of hersteldoelen
                  <RefNote number={10} />
                  . In de praktijk blijft de combinatie van krachttraining + voldoende eiwit de
                  stevigste basis
                  <RefNote number={19} />
                  .
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  Stress en cortisol beïnvloeden herstel
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Trainen, werkdruk en slechte slaap verhogen allemaal je stress. Hoe zwaarder je
                  traint, hoe sterker je cortisol direct stijgt
                  <RefNote number={11} />
                  . Als alles tegelijk hoog blijft, vertraagt het herstel tussen trainingen merkbaar.
                </p>
              </section>

              <section id="spierherstel" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Spierherstel Na 40: Wat Verandert Echt?
                </h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Herstel draait niet alleen om spierpijn. Het gaat om de snelheid waarmee je zenuwstelsel,
                  bindweefsel, energievoorziening en spieropbouw terugkeren naar &ldquo;klaar voor de
                  volgende inspanning&rdquo;.
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Na je 40e is dat proces gevoeliger voor slaaptekort, lage eiwitinname en chronische stress.
                  Dat is precies waarom twee mannen met hetzelfde schema toch totaal verschillend kunnen reageren.
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Het praktische gevolg: minder focussen op &ldquo;nog een set erbij&rdquo; en meer op herstelkwaliteit
                  tussen sessies. Daar zit meestal de snelste winst.
                </p>
              </section>

              <section id="wat-je-zelf-kunt-doen" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">Wat Je Zelf Kunt Doen</h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Supplementen kunnen helpen, maar de basis bepaalt 80% van je herstelresultaat. Begin met
                  deze vijf stappen.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  1. Fix je slaapritme
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Sta op vaste tijden op (ook in het weekend), beperk fel licht in de avond en plan een
                  rustige afbouw. Dit ondersteunt herstel en prestatie
                  <RefNote number={9} />
                  <RefNote number={12} />
                  .
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Slaapproblemen als basis? Lees ook:{" "}
                  <Link href="/slaap-verbeteren-na-40" className={INLINE_LINK_THEME}>
                    Slaap verbeteren na 40
                  </Link>
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">2. Verdeel eiwit over de dag</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Richt op ongeveer 25-40 gram eiwit per hoofdmaaltijd en zorg dat je totale daginname
                  past bij je trainingsbelasting. Die spreiding helpt, omdat je spieren met het ouder
                  worden minder sterk op eiwit reageren
                  <RefNote number={7} />
                  <RefNote number={19} />
                  .
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">3. Plan rustdagen expliciet</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Zet minimaal 1-2 relatieve herstelmomenten per week in je schema. Niet als noodrem,
                  maar als vast onderdeel van progressie.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">4. Verlaag achtergrondstress</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Korte ademhalingsoefeningen, rustige wandelingen en een duidelijke werk-stop in de avond
                  helpen je lichaam sneller terugschakelen richting herstel
                  <RefNote number={11} />
                  .
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Veel mentale onrust naast fysieke belasting?{" "}
                  <Link href="/stress-verminderen-man" className={INLINE_LINK_THEME}>
                    Lees de stressgids
                  </Link>
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  5. Gebruik actief herstel slim
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Rustig bewegen op rustdagen (wandelen, fietsen, mobiliteit) helpt stijfheid en doorbloeding
                  zonder extra zware belasting. Denk aan 20-40 minuten lage intensiteit.
                </p>
              </section>

              <section id="supplementen" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Welke Supplementen Helpen
                </h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Supplementen zijn een aanvulling op training, voeding en slaap — geen vervanging. Dit zijn
                  de opties met de meest relevante onderbouwing voor herstel na 40.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">Magnesium (glycinaat)</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Magnesium is betrokken bij honderden enzymatische processen en speelt een rol in spier- en
                  zenuwfunctie
                  <RefNote number={13} />
                  . Voor slaapkwaliteit en ontspanning wordt vaak glycinaat gekozen vanwege tolerantie
                  <RefNote number={22} />
                  .
                </p>
                <div className="mt-6 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700">
                    Magnesiumvormen vergelijken op opname, maag-tolerantie en prijs per effectieve dosis.
                  </p>
                  <Link
                    href="/beste/magnesium"
                    className="mt-2 inline-block text-green-700 font-semibold hover:text-green-800"
                  >
                    Bekijk onze magnesium vergelijking →
                  </Link>
                </div>

                <h3 className="font-semibold text-xl text-gray-900 mt-10">Omega-3 (EPA/DHA)</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Omega-3-vetzuren uit vis (EPA/DHA) hangen in onderzoek samen met gunstige effecten op
                  ontstekingen en de spierstofwisseling bij ouder worden
                  <RefNote number={14} />
                  <RefNote number={15} />
                  . Verwacht geen wonderen, maar wel een zinvolle basis bij lage visinname.
                </p>
                <div className="mt-6 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700">
                    EPA/DHA in mg per capsule, versheid (oxidatie) en prijs per dag — naast elkaar gezet.
                  </p>
                  <Link
                    href="/beste/omega-3-supplement"
                    className="mt-2 inline-block text-green-700 font-semibold hover:text-green-800"
                  >
                    Bekijk onze omega-3 vergelijking →
                  </Link>
                </div>

                <h3 className="font-semibold text-xl text-gray-900 mt-10">Vitamine D</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Een te lage vitamine D-waarde komt veel voor in Nederland. Overzichtsstudies koppelen dit
                  aan spierfunctie en belastbaarheid bij sporten
                  <RefNote number={16} />
                  . Stem de dosering het liefst af op je bloedwaarden.
                </p>
                <div className="mt-6 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700">Welke D3+K2-combinaties en doseringen sluiten aan?</p>
                  <Link
                    href="/beste/vitamine-d"
                    className="mt-2 inline-block text-green-700 font-semibold hover:text-green-800"
                  >
                    Bekijk de vitamine D-gids →
                  </Link>
                </div>

                <h3 className="font-semibold text-xl text-gray-900 mt-10">Creatine monohydraat</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Creatine is een van de best onderzochte supplementen voor kracht en spiermassa, ook
                  bij oudere volwassenen die krachttraining doen
                  <RefNote number={17} />
                  <RefNote number={18} />
                  . Voor veel mannen is 3-5 gram per dag een praktisch startpunt.
                </p>
                <div className="mt-6 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700">Monohydraat, Creapure en prijs per dosering.</p>
                  <Link
                    href="/beste/creatine"
                    className="mt-2 inline-block text-green-700 font-semibold hover:text-green-800"
                  >
                    Bekijk de creatine vergelijking →
                  </Link>
                </div>

                <h3 className="font-semibold text-xl text-gray-900 mt-10">Eiwitpoeder (praktisch hulpmiddel)</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Eiwitpoeder is vooral praktisch: je haalt makkelijker je dagdoel wanneer maaltijden
                  onregelmatig zijn. Het effect op spiergroei hangt af van totale eiwitinname plus training
                  <RefNote number={19} />
                  .
                </p>
                <div className="mt-6 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700">
                    Door ons supplementen-overzicht, met uitleg per doel (herstel, energie, slaap).
                  </p>
                  <Link
                    href="/supplementen"
                    className="mt-2 inline-block text-green-700 font-semibold hover:text-green-800"
                  >
                    Naar supplementen &amp; thema’s →
                  </Link>
                </div>

                <h3 className="font-semibold text-xl text-gray-900 mt-10">Zink (alleen gericht inzetten)</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Zink speelt een rol bij je afweer en bij veel processen in je lichaam
                  <RefNote number={20} />
                  . Overweeg het vooral bij een aantoonbaar lage inname of een voeding met meer kans op
                  een tekort, niet als standaard hoge dosering.
                </p>
                <div className="mt-6 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700">Zinkvormen en doseringen vergeleken.</p>
                  <Link
                    href="/beste/zink"
                    className="mt-2 inline-block text-green-700 font-semibold hover:text-green-800"
                  >
                    Bekijk de zink vergelijking →
                  </Link>
                </div>
              </section>

              <section id="aanpak" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Hoe Je Dit Aanpakt: Week voor Week
                </h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Alles tegelijk aanpassen werkt zelden. Dit protocol bouwt op in logische stappen.
                </p>

                <div className="mt-8 p-6 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="font-semibold text-gray-900 text-lg">Week 1 — Herstelbasis neerzetten</p>
                  <ul className="mt-3 list-disc list-inside text-gray-700 space-y-2 leading-relaxed">
                    <li>Vaste opstaatijd (ook weekend, max 30 minuten verschil)</li>
                    <li>Eiwit bij elke hoofdmaaltijd (richtlijn 25-40 gram)</li>
                    <li>Plan 1-2 herstelmomenten zonder zware training</li>
                  </ul>
                </div>

                <div className="mt-4 p-6 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="font-semibold text-gray-900 text-lg">Week 2-3 — Verdiepen</p>
                  <ul className="mt-3 list-disc list-inside text-gray-700 space-y-2 leading-relaxed">
                    <li>Voeg magnesium glycinaat toe in je avondroutine</li>
                    <li>Voeg omega-3 toe als je weinig vette vis eet</li>
                    <li>Dagelijks 20-30 minuten rustig bewegen buiten</li>
                  </ul>
                </div>

                <div className="mt-4 p-6 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="font-semibold text-gray-900 text-lg">Week 4 — Evalueren</p>
                  <p className="mt-3 text-gray-700 leading-relaxed">
                    Evalueer je herstelscore: duur van spierpijn, slaapkwaliteit, energie en trainingszin.
                    Blijft herstel achter? Overweeg dan gericht creatine en laat bij twijfel bloedonderzoek
                    doen (bijv. vitamine D, B12, ijzer, schildklier via huisarts).
                  </p>
                </div>

                <div className="mt-4 p-6 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="font-semibold text-gray-900 text-lg">Week 5-8 — Consolideren</p>
                  <ul className="mt-3 list-disc list-inside text-gray-700 space-y-2 leading-relaxed">
                    <li>Wissel zwaar en licht af: 3 weken opbouw, 1 week rustiger trainen</li>
                    <li>Houd eiwitinname en slaapritme stabiel</li>
                    <li>Voeg alleen supplementen toe die een duidelijk doel hebben</li>
                  </ul>
                </div>
              </section>

              <section id="verder-lezen" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">Verder Lezen</h2>
                <p className="mt-4 text-gray-700">
                  Verdieping over slaap, stress en energie — de drie systemen die je herstel sturen.
                </p>

                <div className="mt-6 p-5 rounded-xl border border-stone-200 bg-stone-50">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    <strong className="text-gray-900">
                      Slaap is je belangrijkste herstelfactor
                    </strong>
                    <br />
                    Als slaapkwaliteit achterblijft, loopt herstel vrijwel altijd terug — ongeacht je
                    trainingsschema.
                  </p>
                  <Link
                    href="/slaap-verbeteren-na-40"
                    className={`mt-2 inline-block ${INLINE_LINK_THEME} text-sm`}
                  >
                    Complete gids: Slaap verbeteren na 40 →
                  </Link>
                </div>

                <div className="mt-6 p-5 rounded-xl border border-stone-200 bg-stone-50">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    <strong className="text-gray-900">
                      Chronische stress vertraagt je lichamelijk herstel
                    </strong>
                    <br />
                    Als je hoofd altijd &ldquo;aan&rdquo; staat, blijft je lichaam vaker in actiestand dan in
                    herstelstand.
                  </p>
                  <Link
                    href="/stress-verminderen-man"
                    className={`mt-2 inline-block ${INLINE_LINK_THEME} text-sm`}
                  >
                    Stress verminderen (man 40+) →
                  </Link>
                </div>

                <div className="mt-6 p-5 rounded-xl border border-stone-200 bg-stone-50">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    <strong className="text-gray-900">
                      Lage energie maakt herstel zwaarder
                    </strong>
                    <br />
                    Als je energie overdag laag is, wordt je herstelcapaciteit tussen trainingen kleiner.
                  </p>
                  <Link
                    href="/energie-na-40"
                    className={`mt-2 inline-block ${INLINE_LINK_THEME} text-sm`}
                  >
                    Energie na 40 gids →
                  </Link>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="p-5 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Testosteron verandert na 40 geleidelijk. Wat betekent dat voor energie, herstel en
                      prestaties?
                    </p>
                    <Link
                      href="/blog/testosteron-en-energie-na-40"
                      className="mt-2 inline-block text-green-700 text-sm font-semibold hover:text-green-800"
                    >
                      Testosteron en energie na 40 →
                    </Link>
                  </div>
                  <div className="p-5 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Omega-3 en energie: wat zegt onderzoek over dosering, kwaliteit en effect?
                    </p>
                    <Link
                      href="/blog/omega-3-concentratie-energie"
                      className="mt-2 inline-block text-green-700 text-sm font-semibold hover:text-green-800"
                    >
                      Omega-3, concentratie en energie →
                    </Link>
                  </div>
                  <div className="p-5 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Vitamine D-tekort herkennen en gericht aanvullen.
                    </p>
                    <Link
                      href="/blog/vitamine-d-tekort-herkennen"
                      className="mt-2 inline-block text-green-700 text-sm font-semibold hover:text-green-800"
                    >
                      Vitamine D-tekort herkennen →
                    </Link>
                  </div>
                  <div className="p-5 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Natuurlijke energieverhogers die ook je herstel ondersteunen.
                    </p>
                    <Link
                      href="/blog/energie-verhogen-natuurlijk"
                      className="mt-2 inline-block text-green-700 text-sm font-semibold hover:text-green-800"
                    >
                      Energie verhogen, natuurlijk →
                    </Link>
                  </div>
                  <div className="p-5 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Creatine en herstel: buffer naast slaap en eiwit.
                    </p>
                    <Link
                      href="/blog/creatine-en-herstel"
                      className="mt-2 inline-block text-green-700 text-sm font-semibold hover:text-green-800"
                    >
                      Creatine en herstel →
                    </Link>
                  </div>
                  <div className="p-5 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Omega-3 en herstel: EPA/DHA wanneer je weinig vis eet.
                    </p>
                    <Link
                      href="/blog/omega-3-en-herstel"
                      className="mt-2 inline-block text-green-700 text-sm font-semibold hover:text-green-800"
                    >
                      Omega-3 en herstel →
                    </Link>
                  </div>
                  <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 sm:col-span-2">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Veel trainen, weinig buffer? Bekijk profiel Overtrainer.
                    </p>
                    <Link
                      href="/profiel/overtrainer"
                      className="mt-2 inline-block text-green-700 text-sm font-semibold hover:text-green-800"
                    >
                      Naar het profiel →
                    </Link>
                  </div>
                </div>
              </section>

              <section id="leefstijlcheck" className="mt-14" {...{ [INBODY_LEEFSTIJLCHECK_CTA_ATTR]: "" }}>
                <div className="text-center p-8 bg-green-50 rounded-2xl border border-green-200">
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900">
                    Ontdek Waar Jij Staat
                  </h2>
                  <p className="mt-3 text-gray-600 max-w-lg mx-auto">
                    Herstel is een van de zes domeinen in de Leefstijlcheck. In 3 minuten zie je hoe je
                    scoort op herstel, slaap, stress en energie — en wat je als eerste moet aanpakken.
                  </p>
                  <IntakeCtaMicro className="mx-auto mt-4 max-w-lg text-sm text-gray-500" />
                  <Link
                    href="/intake"
                    className="mt-5 inline-block bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
                  >
                    Zie waar jouw herstel, slaap en energie scoren — gratis →
                  </Link>
                </div>
              </section>

              <section id="veelgestelde-vragen" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">Veelgestelde Vragen</h2>

                <div className="mt-6 space-y-3">
                  <details className="group border border-stone-200 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 font-semibold text-gray-900 hover:bg-stone-50 transition-colors list-none">
                      Hoeveel eiwit per dag als ik train?
                      <span className="shrink-0 text-green-700 group-open:rotate-45 transition-transform duration-200 text-xl leading-none">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-gray-700 leading-relaxed">
                      Richt voor gezonde mannen 40+ bij regelmatige krachttraining vaak op ongeveer 1,2–1,6 g
                      eiwit per kg lichaamsgewicht per dag — verdeeld over meerdere maaltijden. Zo benutten je
                      spieren het eiwit beter naarmate je ouder wordt. Bij minder vaak trainen lig je lager in dat bereik.
                    </div>
                  </details>

                  <details className="group border border-stone-200 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 font-semibold text-gray-900 hover:bg-stone-50 transition-colors list-none">
                      Kan ik magnesium combineren met creatine?
                      <span className="shrink-0 text-green-700 group-open:rotate-45 transition-transform duration-200 text-xl leading-none">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-gray-700 leading-relaxed">
                      Ja, dat is een veelgebruikte combinatie. Neem creatine op een vast moment van de dag
                      en magnesium liever in de avond. Bij maagklachten kun je de innamemomenten spreiden.
                    </div>
                  </details>

                  <details className="group border border-stone-200 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 font-semibold text-gray-900 hover:bg-stone-50 transition-colors list-none">
                      Hoe lang tot ik herstel merk?
                      <span className="shrink-0 text-green-700 group-open:rotate-45 transition-transform duration-200 text-xl leading-none">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-gray-700 leading-relaxed">
                      Slaapritme en eiwitverdeling geven vaak binnen 1-2 weken het eerste verschil. Voor
                      omega-3, vitamine D en creatine duurt het meestal langer (meerdere weken), afhankelijk
                      van je uitgangssituatie.
                    </div>
                  </details>

                  <details className="group border border-stone-200 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 font-semibold text-gray-900 hover:bg-stone-50 transition-colors list-none">
                      Moet ik alle supplementen tegelijk starten?
                      <span className="shrink-0 text-green-700 group-open:rotate-45 transition-transform duration-200 text-xl leading-none">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-gray-700 leading-relaxed">
                      Nee. Start met basisgedrag (slaap, eiwit, rustdagen) en voeg daarna maximaal één
                      supplement per 1-2 weken toe. Zo kun je effecten en bijwerkingen beter beoordelen.
                    </div>
                  </details>

                  <details className="group border border-stone-200 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 font-semibold text-gray-900 hover:bg-stone-50 transition-colors list-none">
                      Wanneer naar de huisarts?
                      <span className="shrink-0 text-green-700 group-open:rotate-45 transition-transform duration-200 text-xl leading-none">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-gray-700 leading-relaxed">
                      Bij extreme vermoeidheid, onverklaarbare spierzwakte, pijn op de borst bij inspanning,
                      koorts of onbedoeld gewichtsverlies. Ook als herstelklachten langer dan 6 weken
                      aanhouden ondanks leefstijlaanpassingen.
                    </div>
                  </details>
                </div>
              </section>

              <ReferenceList references={herstelVerbeterenNa40References} />
              <MedicalDisclaimer />

              <footer className="mt-8 pt-8 border-t border-stone-200">
                <p className="text-sm text-gray-400 italic leading-relaxed">
                  Bij aanhoudende herstelklachten of onverklaarbare vermoeidheid: laat je medisch
                  beoordelen via je huisarts. Zeker bij plotselinge prestatieachteruitgang, spierzwakte
                  of pijn op de borst.
                </p>
              </footer>
            </article>
            </PillarReadingChrome>
          </div>
        </Container>
      </main>
    </>
  );
}
