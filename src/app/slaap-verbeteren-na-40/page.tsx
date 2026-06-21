import type { Metadata } from "next";
import Link from "next/link";
import { canonicalMetadata } from "@/lib/seo/canonical";
import Container from "@/components/layout/Container";
import { ReferenceList } from "@/components/references/ReferenceList";
import { RefNote } from "@/components/references/RefNote";
import { magnesiumReferences } from "@/data/references/magnesium";
import DomainHubConnector from "@/components/content/DomainHubConnector";
import PillarReadingChrome from "@/components/content/PillarReadingChrome";
import { INBODY_LEEFSTIJLCHECK_CTA_ATTR } from "@/lib/leefstijlcheck-inbody-cta";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";

export const metadata: Metadata = {
  title: "Slaap Verbeteren Na 40: Oorzaken, Tips & Supplementen | PerfectSupplement",
  description:
    "Slecht slapen na 40? Ontdek waarom je slaap verandert en wat je er nu aan doet. Van leefstijl tot supplementen — onderbouwd en praktisch.",
  ...canonicalMetadata("/slaap-verbeteren-na-40"),
  openGraph: {
    title: "Slaap Verbeteren Na 40: De Complete Gids",
    description:
      "Slecht slapen na 40? Ontdek waarom je slaap verandert en wat je er nu aan doet.",
    url: "/slaap-verbeteren-na-40",
    type: "article",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Slaap Verbeteren Na 40: De Complete Gids",
  description:
    "Slecht slapen na 40? Ontdek waarom je slaap verandert en wat je er nu aan doet.",
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
  datePublished: "2026-05-02",
  dateModified: "2026-05-02",
  mainEntityOfPage: "https://perfectsupplement.nl/slaap-verbeteren-na-40",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Hoeveel slaap heb je nodig na 40?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "De meeste mannen 40+ hebben 7-8 uur nodig. Maar kwaliteit telt meer dan kwantiteit. 6,5 uur diepe, ononderbroken slaap is beter dan 8 uur lichte, gefragmenteerde slaap.",
      },
    },
    {
      "@type": "Question",
      name: "Helpt melatonine bij slaapproblemen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Melatonine verschuift je biologische klok — het is geen slaapmiddel. Het kan tijdelijk helpen bij jetlag of een verschoven slaapritme, maar is niet de oplossing voor chronische slaapproblemen. Gebruik het maximaal 2-4 weken in lage dosering (0,3-0,5 mg).",
      },
    },
    {
      "@type": "Question",
      name: "Wat is het beste supplement voor slaap?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Magnesium draagt bij tot de normale werking van het zenuwstelsel en tot een normale psychologische functie (officieel erkend bij voldoende inname). Bij stressgerelateerde onrust kun je met je arts bespreken of ashwagandha past — voor dit kruid bestaat nog geen Europees erkende gezondheidsclaim; vergelijk producten zorgvuldig en overleg bij medicatie.",
      },
    },
    {
      "@type": "Question",
      name: "Wanneer merk je effect van magnesium op je slaap?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "De meeste mensen merken binnen 1-2 weken verschil. Geef het minimaal 2 weken de kans bij een dosering van 200-400 mg voor bedtijd.",
      },
    },
    {
      "@type": "Question",
      name: "Is slecht slapen na 40 normaal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "De verandering is normaal — je slaappatroon verschuift met de leeftijd. Maar chronisch slecht slapen hoeft niet geaccepteerd te worden. Met de juiste aanpassingen kun je je slaapkwaliteit aanzienlijk verbeteren.",
      },
    },
  ],
};

export default function SlaapVerbeterenNa40Page() {
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

              {/* 1. Hero */}
              <header>
                <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
                  Complete Gids
                </p>
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mt-2">
                  Slaap Verbeteren Na 40: De Complete Gids
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
                    <a href="#spanning-slaap" className="hover:underline">
                      Spanning overdag en je slaap
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
                    <a href="#faq" className="hover:underline">
                      Veelgestelde vragen
                    </a>
                  </li>
                </ol>
              </nav>

              {/* 3. Herkenning */}
              <section id="herkenbaar" className="mt-12">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Ken je dit: je gaat moe naar bed, maar zodra je hoofd het kussen raakt, blijft je hoofd maar
                  draaien. Of je valt wél in slaap, maar om 3 uur &apos;s nachts lig je klaarwakker naar
                  het plafond te staren. Geen lawaai, geen duidelijke reden — je hoofd schakelt gewoon niet uit.
                </p>
                <p className="mt-4 text-lg text-gray-700 leading-relaxed">
                  Overdag voel je het. Die mist in je hoofd. Die trage ochtenden waarin koffie nauwelijks helpt.
                  De korte lontjes. Het gevoel dat je leeft op reserves in plaats van echte energie.
                </p>
                <p className="mt-4 text-lg text-gray-700 leading-relaxed">
                  Je bent niet de enige. Na je 40e verandert er vaak iets in hoe diep je slaapt en hoe snel je
                  wakker wordt. Dat is geen zwakte — en het goede nieuws: met ritme, licht en rust rond bedtijd kun je
                  veel winnen.
                </p>
                <p className="mt-4 text-gray-700">In deze gids leer je:</p>
                <ul className="mt-3 space-y-2 text-gray-700 list-disc list-inside">
                  <li>
                    Waarom je slaap na 40 anders kan voelen (en waarom &ldquo;gewoon eerder naar bed&rdquo; niet altijd werkt)
                  </li>
                  <li>Hoe overdag stress en schermen je nacht beïnvloeden — in begrijpelijke taal</li>
                  <li>5 concrete aanpassingen die je vanavond nog kunt starten</li>
                  <li>Welke supplementen je kunt overwegen — en wat je beter eerst met je huisarts bespreekt</li>
                </ul>
              </section>

              {/* 4. Mechanisme */}
              <section id="wat-er-verandert" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Wat Er Verandert Na 40
                </h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Je slaap blijft niet je hele leven hetzelfde. Ze verandert mee met je biologie. Rond je 40e
                  spelen drie veranderingen tegelijk op — en samen verklaren die waarom je opeens slechter slaapt, ook al ben je net zo moe als
                  vroeger.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  Je ritme rond licht en slapen verandert
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  In de kennisbank lees je wat{" "}
                  <Link href="/kennisbank/melatonine" className="text-green-700 underline underline-offset-2 hover:text-green-800">
                    melatonine
                  </Link>{" "}
                  doet: kort gezegd helpt het je biologische klok om &quot;nu is het nacht&quot; te signaleren.
                  Veel mensen merken na 40 dat inslapen langer duurt en prikkels (licht, geluid) harder binnenkomen.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Schermlicht en laat scrollen geven je brein vaak langer het gevoel van &quot;nog even
                  dagmodus&quot;. Dat maakt het niet automatisch een ziekte — wel een haakje om aan te trekken
                  vóór je aan supplementen denkt.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  Je diepe slaap neemt af
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Slaap bestaat uit blokken van ongeveer 90 minuten. Elk blok bevat lichte slaap,
                  diepe slaap en droomslaap (REM-slaap). Die diepe slaap is heel belangrijk: dan
                  herstelt je lichaam, maakt het groeihormoon aan en verwerkt het herinneringen.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Onderzoek laat zien dat de hoeveelheid diepe slaap per nacht gemiddeld afneemt
                  met de leeftijd. Het gevolg voor veel mensen: je slaapt op papier genoeg uren, maar
                  de herstelkwaliteit voelt lager. Je wordt wakker en voelt je
                  toch niet uitgerust.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Alcohol verergert dit aanzienlijk. Een borrel voor het slapen verkort de tijd
                  nodig om in slaap te vallen, maar onderdrukt diepe slaap en REM drastisch — je
                  slaapt &ldquo;door&rdquo;, maar je lichaam herstelt minder goed.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  Je wordt gevoeliger voor verstoringen
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Na je 40e duurt het langer om van lichte slaap naar diepe slaap te zakken. En
                  eenmaal wakker geworden — door geluid, licht, een volle blaas, of zomaar — kom je
                  moeilijker terug. Je wordt makkelijker wakker en valt moeilijker weer in slaap.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Dat verklaart het klassieke patroon van de 40-plusser: makkelijk in slaap vallen,
                  maar dan om 2 of 3 uur wakker liggen met een hoofd vol gedachten. Dat past vaak bij
                  stress en een scheef ritme — niet automatisch bij een hormoonprobleem bij jou.
                </p>
              </section>

              {/* 5. Cortisol */}
              <section id="spanning-slaap" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Spanning overdag en je slaap &apos;s nachts
                </h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Wie lang in een hoge belastingstand staat, merkt vaak dat slapen minder diep voelt:
                  moe, maar toch slecht landen in bed. In de kennisbank lees je meer over{" "}
                  <Link href="/kennisbank/cortisol" className="text-green-700 underline underline-offset-2 hover:text-green-800">
                    cortisol
                  </Link>{" "}
                  en de{" "}
                  <Link href="/kennisbank/hpa-as" className="text-green-700 underline underline-offset-2 hover:text-green-800">
                    HPA-as
                  </Link>
                  — zonder dat we hier claimen wat er bij jou meetbaar gebeurt.
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Praktisch gezien helpt het om overdag pauzes, daglicht en een vaste afsluiting na
                  werk te pakken. Wat je overdag met je hoofd doet, beïnvloedt vaak hoe rustig je
                  &apos;s avonds wordt.
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Word je vroeg wakker met piekeren? Dat herkennen veel mensen. Zie ook het profiel
                  Onrustige Slaper voor stappenplan en supplementen die je met je situatie wilt
                  matchen — geen diagnose.
                </p>

                <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-gray-800 font-medium">
                    Wakker om 3 uur, niet terug in slaap? Je bent niet alleen.
                  </p>
                  <p className="mt-2 text-gray-600">
                    Herken je dit patroon? Misschien ben je een Onrustige Slaper.
                  </p>
                  <Link
                    href="/profiel/onrustige-slaper"
                    className="mt-3 inline-block text-green-700 font-semibold hover:text-green-800"
                  >
                    Ben jij een Onrustige Slaper? →
                  </Link>
                </div>
              </section>

              {/* 6. Leefstijl */}
              <section id="wat-je-zelf-kunt-doen" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Wat Je Zelf Kunt Doen
                </h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Geen enkele pil of supplement compenseert structureel slechte slaapgewoonten. De
                  basis moet kloppen. Dit zijn de vijf aanpassingen met de grootste impact — gerangschikt
                  op effect, niet op gemak.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  1. Houd een vast slaapritme aan
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Je circadiaan ritme — je interne klok — wordt vooral gestuurd door vaste tijden.
                  Elke dag op hetzelfde tijdstip opstaan, ook in het weekend, heeft
                  de grootste impact op je slaap. Niet naar bed gaan op een vast tijdstip,
                  maar opstaan op een vast tijdstip.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Uitslapen in het weekend voelt als herstel, maar het verschuift je biologische
                  klok. Maandag voel je dat — ook wel &ldquo;sociale jetlag&rdquo; genoemd. Structureel
                  tekort stapelt op als{" "}
                  <Link
                    href="/kennisbank/slaapschuld"
                    className="font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px]"
                  >
                    slaapschuld
                  </Link>
                  ; uitslapen lost dat niet volledig op. Varieer maximaal 30 minuten met je
                  opstaanmoment, zeven dagen per week.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  2. Bouw een afbouwroutine van 45-60 minuten
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Je zenuwstelsel heeft tijd nodig om van actie- naar herstelmodus te schakelen. Dat gaat niet van de ene op de
                  andere minuut. Een vaste afbouwroutine — lichten dimmen, geen schermen,
                  een rustige bezigheid zoals lezen of ademhalingsoefeningen — helpt veel mensen om
                  rustiger richting bed te gaan. Meer over gewoontes en omgeving:{" "}
                  <Link href="/kennisbank/slaaphygiene" className="text-green-700 underline underline-offset-2 hover:text-green-800">
                    slaaphygiëne
                  </Link>
                  .
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Concreet: zet schermen uit om 22:00 als je om 23:00 in bed wil liggen.
                  Gebruik oranje/rode verlichting in de avond — die voelt voor veel mensen rustiger dan fel wit licht.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  3. Oefen eerder op de dag
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Beweging verhoogt je diepe slaap merkbaar — maar het tijdstip telt.
                  Intensieve training verhoogt je lichaamstemperatuur en kan bij
                  sommige mensen de slaap verstoren als ze dit na 19:00 doen. Trainen in de ochtend of vroege
                  middag werkt vaak beter bij zware blokken. Avondwandelingen zijn prima.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Bijkomend voordeel van ochtendtraining: het versterkt je circadiaan ritme. Je
                  lichaam koppelt activiteit aan de ochtend en rust aan de avond — precies wat je wil.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  4. Beheer je cafeïne-inname
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Je lichaam breekt cafeïne langzaam af: na 5-7 uur is pas de helft weg. Een kop
                  koffie om 14:00 betekent dus dat om 21:00 nog de helft in je bloed zit. Na je 40e
                  gaat dat afbreken nog langzamer — dan kan het 8-10 uur duren.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Praktische regel: geen cafeïne na 13:00. Als je gewend bent aan een middag-koffie,
                  vervang die door groene thee (minder cafeïne, bevat L-theanine dat ontspant) of
                  cafeïnevrije alternatieven.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  5. Verlaag je kamertemperatuur
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Je lichaamstemperatuur van binnen moet 1-2°C dalen om in slaap te vallen en diepe
                  slaap te bereiken. Een koele slaapkamer (16-19°C) helpt daarbij. Een warme kamer
                  verstoort de slaap zonder dat je het doorhebt.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Tip: een warme douche of bad 1-2 uur voor bedtijd helpt paradoxaal genoeg. Je
                  lichaamstemperatuur stijgt tijdelijk, maar daalt daarna sneller — waardoor je
                  sneller de slaaptemperatuur bereikt.
                </p>
              </section>

              {/* 7. Supplementen */}
              <section id="supplementen" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Welke Supplementen Helpen
                </h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Supplementen zijn geen vervanging voor de basis — maar als de basis klopt, kunnen
                  ze het verschil maken. Hier zijn de drie meest bewezen opties voor mannen 40+.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  Magnesium glycinaat
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Magnesium is betrokken bij meer dan 300 enzymatische processen in het lichaam
                  <RefNote number={4} />
                  , waaronder de aanmaak en werking van GABA — de stof die het zenuwstelsel tot
                  rust brengt. Studies laten steeds weer zien dat extra magnesium de slaapkwaliteit
                  verbetert, vooral wanneer de inname via voeding laag is
                  <RefNote number={1} />
                  <RefNote number={2} />.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Magnesium zit vooral in bladgroenten, noten en peulvruchten — voeding waar veel
                  mannen 40+ structureel te weinig van binnenkrijgen. Langdurige stress
                  <RefNote number={3} />
                  {" "}en alcohol verhogen de behoefte, en na je 40e neemt de opname via de darmen
                  iets af. De ADH is 375 mg; haal je dat niet uit voeding, dan kan een supplement
                  aanvullen.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Vorm maakt uit. Magnesiumoxide (goedkoop, in veel supermarkt-supplementen) wordt meestal
                  slecht opgenomen door het lichaam
                  <RefNote number={5} />
                  . Magnesium glycinaat en bisglycinaat worden het best opgenomen en geven het
                  minst maag-darmklachten
                  <RefNote number={6} />
                  . Dosering: 200-400 mg, 30-60 minuten voor bedtijd.
                </p>

                <div className="mt-6 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700">
                    Welke magnesium vorm werkt het best voor slaap? Glycinaat, bisglycinaat en
                    citraat vergeleken op opname en prijs.
                  </p>
                  <Link
                    href="/beste/magnesium"
                    className="mt-2 inline-block text-green-700 font-semibold hover:text-green-800"
                  >
                    Bekijk onze magnesium vergelijking →
                  </Link>
                </div>

                <h3 className="font-semibold text-xl text-gray-900 mt-10">
                  Ashwagandha (KSM-66)
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Ashwagandha is een plantenextract waar in studies soms naar spanning en slaap wordt
                  gekeken. Voor ashwagandha bestaat nog geen Europees erkende gezondheidsclaim. We
                  tonen wat het onderzoek laat zien, zonder beloftes. KSM‑66 is een veelgebruikt
                  gestandaardiseerd extract — vergelijk producten en overleg bij medicatie.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Het werkt niet als klassiek slaapmiddel zoals magnesium, waar zenuwstelsel en
                  psychologische functie officieel erkend zijn. Denk er vooral bij als je spanning overdag je
                  nacht verzwaart — en geef gedrag eerst ruimte om te werken.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Dosering: 300-600 mg KSM-66 per dag, bij voorkeur &lsquo;s avonds of gesplitst over dag
                  en avond. Bij hogere doses kan het bij sommige mensen stimulerend werken —
                  experimenteer met timing.
                </p>

                <div className="mt-6 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700">
                    KSM-66, Sensoril of goedkoop poeder? We vergeleken de beste ashwagandha
                    supplementen op extractkwaliteit, dosering en prijs per capsule.
                  </p>
                  <Link
                    href="/beste/ashwagandha"
                    className="mt-2 inline-block text-green-700 font-semibold hover:text-green-800"
                  >
                    Bekijk onze ashwagandha vergelijking →
                  </Link>
                </div>

                <h3 className="font-semibold text-xl text-gray-900 mt-10">
                  Een opmerking over melatonine
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Melatonine is het meest verkochte slaapmiddel in Nederland — en tegelijk het meest
                  verkeerd begrepen. Het is geen slaapmiddel. Het is een signaalstof voor je biologische klok —
                  zo verschuift die klok tijdelijk. Het zegt je lichaam: &ldquo;het is nu nacht&rdquo; — maar
                  het maakt je niet slaperiger als je ritme al klopt.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Waar melatonine wél helpt: jetlag, ploegendienst, of een sterk verschoven
                  slaapritme. Tijdelijk gebruik (2-4 weken) in lage dosering (0,3-0,5 mg) is
                  zinvol. Dosering maakt hier veel uit: de gangbare tabletten van 1-5 mg zijn
                  vaak veel hoger gedoseerd dan je voor een klokverschuiving nodig hebt.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Chronisch melatonine slikken lost het onderliggende probleem niet op — het
                  maskeert het. Focus op magnesium en leefstijl eerst; gebruik melatonine alleen
                  als tijdelijk hulpmiddel bij een specifieke verstoorde klok.
                </p>

                <div className="mt-6 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700">
                    Kies je voor een laag-gedoseerd product? We vergeleken melatonine-supplementen op
                    vorm, dosering en prijs per nacht.
                  </p>
                  <Link
                    href="/supplementen/melatonine"
                    className="mt-2 inline-block text-green-700 font-semibold hover:text-green-800"
                  >
                    Lees de melatonine-gids (informatief) →
                  </Link>
                </div>
              </section>

              {/* 8. Timing & Planning */}
              <section id="aanpak" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Hoe Je Dit Aanpakt: Week voor Week
                </h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Alles tegelijk veranderen werkt zelden. Dit is een praktisch stappenplan, opgebouwd
                  in fasen.
                </p>

                <div className="mt-8 p-6 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="font-semibold text-gray-900 text-lg">Week 1 — De basis</p>
                  <p className="mt-3 text-gray-700 leading-relaxed">
                    Kies één vast opstaanmoment en houd je er zeven dagen aan, ook in het weekend.
                    Bepaal je slaapvenster (bijv. 23:00–06:30) en ga niet eerder naar bed als je
                    nog niet slaperig bent — dat versterkt slaapangst. Zet schermen om 22:00 uit. Dit
                    zijn de drie stappen met het meeste effect. Doe nog niets met supplementen —
                    kijk eerst hoe je slaap hierop reageert.
                  </p>
                </div>

                <div className="mt-4 p-6 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="font-semibold text-gray-900 text-lg">Week 2–4 — Verdiepen en supplementeren</p>
                  <p className="mt-3 text-gray-700 leading-relaxed">
                    Start met magnesium glycinaat: 200-400 mg, 45 minuten voor bedtijd. Bouw een
                    vaste afbouwroutine van 45 minuten. Schrap cafeïne na 13:00. Voeg
                    een ochtendwandeling van 15-20 minuten toe direct na het opstaan — ochtendlicht helpt je
                    biologische klok resetten.
                  </p>
                  <p className="mt-3 text-gray-700 leading-relaxed">
                    Evalueer na week 2: voel je verschil? Zo ja, houd dit vol. Zo nee, voeg
                    ashwagandha toe aan je ochtend- of avondroutine.
                  </p>
                </div>

                <div className="mt-4 p-6 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="font-semibold text-gray-900 text-lg">Maand 2+ — Vasthouden en bijschaven</p>
                  <p className="mt-3 text-gray-700 leading-relaxed">
                    De meeste mensen merken na 4-6 weken een duidelijk verschil in slaapkwaliteit,
                    energie overdag en stemming. Dit is ook het moment om te kijken of je nog meer
                    wilt verbeteren: kamertemperatuur, het tijdstip van je training, of eventueel een
                    slaaptracker om beter zicht te krijgen op je slaap.
                  </p>
                  <p className="mt-3 text-gray-700 leading-relaxed">
                    Blijf kritisch op alcohol. Zelfs één glas wijn verstoort diepe slaap meetbaar.
                    Dat hoeft je niet te weerhouden van een sociaal glas, maar weet dat het een
                    afweging is. Lees{" "}
                    <Link
                      href="/blog/alcohol-slaap-energie-na-40"
                      className="text-green-700 underline underline-offset-2 hover:text-green-800"
                    >
                      alcohol, slaap en energie na 40
                    </Link>{" "}
                    voor het volledige plaatje — inclusief wat je de dag erna merkt.
                  </p>
                </div>

                <div className="mt-10 text-center p-8 bg-green-50 rounded-2xl border border-green-200">
                  <p className="text-gray-600 max-w-lg mx-auto">
                    Benieuwd hoe jouw slaapprofiel scoort? Scroll naar beneden voor de gratis
                    Leefstijlcheck.
                  </p>
                </div>
              </section>

              {/* 9. Verder Lezen */}
              <section id="verder-lezen" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">Verder Lezen</h2>
                <p className="mt-4 text-gray-700">
                  Verdiepende artikelen over slaap en herstel.
                </p>

                <div className="mt-6 p-5 rounded-xl border border-stone-200 bg-stone-50">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    <strong className="text-gray-900">Speelt stress een rol bij je slaapproblemen?</strong>
                    <br />
                    Chronische stress en slaap zijn nauw verbonden. Als je merkt dat je &apos;s nachts wakker wordt met een hoofd vol gedachten, kan stress de onderliggende oorzaak zijn.
                  </p>
                  <Link
                    href="/stress-verminderen-man"
                    className="mt-2 inline-block font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] text-sm"
                  >
                    Lees de gids: Stress Verminderen na 40 →
                  </Link>
                </div>

                <div className="mt-6 p-5 rounded-xl border border-stone-200 bg-stone-50">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    <strong className="text-gray-900">Ben je moe ondanks goede slaap?</strong>
                    <br />
                    Als je slaap op orde is maar je energie laag blijft, kunnen voeding, stress en
                    beweging samenspelen — bespreek aanhoudende klachten met je huisarts.
                  </p>
                  <Link
                    href="/energie-na-40"
                    className="mt-2 inline-block font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] text-sm"
                  >
                    Lees de gids: Energie Na 40 →
                  </Link>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="p-5 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Hoe magnesium je slaap verbetert — en welke vorm het snelst werkt.
                    </p>
                    <Link
                      href="/blog/magnesium-en-slaap"
                      className="mt-2 inline-block text-green-700 text-sm font-semibold hover:text-green-800"
                    >
                      Magnesium en slaap →
                    </Link>
                  </div>

                  <div className="p-5 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Cortisol wekt je om 3 uur. Hier is waarom — en wat je eraan doet.
                    </p>
                    <Link
                      href="/blog/cortisol-en-slaap"
                      className="mt-2 inline-block text-green-700 text-sm font-semibold hover:text-green-800"
                    >
                      Cortisol en slaap →
                    </Link>
                  </div>

                  <div className="p-5 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Je slaapritme herstellen in 7 dagen? Het kan — met dit protocol.
                    </p>
                    <Link
                      href="/blog/slaapritme-herstellen"
                      className="mt-2 inline-block text-green-700 text-sm font-semibold hover:text-green-800"
                    >
                      Slaapritme herstellen →
                    </Link>
                  </div>

                  <div className="p-5 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Melatonine alleen is niet genoeg na 40. Dit is waarom — en wat beter werkt.
                    </p>
                    <Link
                      href="/blog/melatonine-na-40"
                      className="mt-2 inline-block text-green-700 text-sm font-semibold hover:text-green-800"
                    >
                      Melatonine na 40 →
                    </Link>
                  </div>
                </div>
              </section>

              {/* 10. FAQ */}
              <section id="faq" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Veelgestelde Vragen
                </h2>

                <div className="mt-6 space-y-3">
                  <details className="group border border-stone-200 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 font-semibold text-gray-900 hover:bg-stone-50 transition-colors list-none">
                      Hoeveel slaap heb je nodig na 40?
                      <span className="shrink-0 text-green-700 group-open:rotate-45 transition-transform duration-200 text-xl leading-none">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-gray-700 leading-relaxed">
                      De meeste mannen 40+ hebben 7-8 uur nodig. Maar kwaliteit telt meer dan
                      kwantiteit. 6,5 uur diepe, ononderbroken slaap is beter dan 8 uur lichte,
                      gefragmenteerde slaap.
                    </div>
                  </details>

                  <details className="group border border-stone-200 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 font-semibold text-gray-900 hover:bg-stone-50 transition-colors list-none">
                      Helpt melatonine bij slaapproblemen?
                      <span className="shrink-0 text-green-700 group-open:rotate-45 transition-transform duration-200 text-xl leading-none">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-gray-700 leading-relaxed">
                      Melatonine verschuift je biologische klok — het is geen slaapmiddel. Het kan
                      tijdelijk helpen bij jetlag of een verschoven slaapritme, maar is niet de
                      oplossing voor chronische slaapproblemen. Gebruik het maximaal 2-4 weken in
                      lage dosering (0,3-0,5 mg).
                    </div>
                  </details>

                  <details className="group border border-stone-200 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 font-semibold text-gray-900 hover:bg-stone-50 transition-colors list-none">
                      Wat is het beste supplement voor slaap?
                      <span className="shrink-0 text-green-700 group-open:rotate-45 transition-transform duration-200 text-xl leading-none">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-gray-700 leading-relaxed">
                      Magnesium draagt bij tot de normale werking van het zenuwstelsel en tot een
                      normale psychologische functie (officieel erkend bij voldoende inname). Bij
                      stressgerelateerde onrust kun je met je arts bespreken of ashwagandha past —
                      voor dit kruid bestaat nog geen Europees erkende gezondheidsclaim; vergelijk
                      producten zorgvuldig en overleg bij medicatie.
                    </div>
                  </details>

                  <details className="group border border-stone-200 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 font-semibold text-gray-900 hover:bg-stone-50 transition-colors list-none">
                      Wanneer merk je effect van magnesium op je slaap?
                      <span className="shrink-0 text-green-700 group-open:rotate-45 transition-transform duration-200 text-xl leading-none">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-gray-700 leading-relaxed">
                      De meeste mensen merken binnen 1-2 weken verschil. Geef het minimaal 2 weken
                      de kans bij een dosering van 200-400 mg voor bedtijd.
                    </div>
                  </details>

                  <details className="group border border-stone-200 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 font-semibold text-gray-900 hover:bg-stone-50 transition-colors list-none">
                      Is slecht slapen na 40 normaal?
                      <span className="shrink-0 text-green-700 group-open:rotate-45 transition-transform duration-200 text-xl leading-none">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-gray-700 leading-relaxed">
                      De verandering is normaal — je slaappatroon verschuift met de leeftijd.
                      Maar chronisch slecht slapen hoeft niet geaccepteerd te worden. Met de juiste
                      aanpassingen kun je je slaapkwaliteit aanzienlijk verbeteren.
                    </div>
                  </details>
                </div>
              </section>

              {/* 11. Eind-CTA */}
              <section className="mt-14" {...{ [INBODY_LEEFSTIJLCHECK_CTA_ATTR]: "" }}>
                <div className="text-center p-8 bg-green-50 rounded-2xl border border-green-200">
                  <h3 className="font-serif text-2xl font-bold text-gray-900">
                    Klaar om je slaap structureel aan te pakken?
                  </h3>
                  <p className="mt-3 text-gray-600 max-w-lg mx-auto">
                    De Leefstijlcheck brengt in 3 minuten jouw slaap-, stress- en energieprofiel in
                    kaart. Je krijgt een persoonlijk leefstijloverzicht — gratis, zonder registratie.
                  </p>
                  <Link
                    href="/intake"
                    className="mt-5 inline-block bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
                  >
                    Zie waar jouw slaap, stress en energie scoren — gratis →
                  </Link>
                </div>
              </section>

              <ReferenceList references={magnesiumReferences} />

            </article>
            <DomainHubConnector pillarId="slaap" />
            <MedicalDisclaimer />
            </PillarReadingChrome>
          </div>
        </Container>
      </main>
    </>
  );
}
