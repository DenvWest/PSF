import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Slaap Verbeteren Na 40: Oorzaken, Tips & Supplementen | PerfectSupplement",
  description:
    "Slecht slapen na 40? Ontdek waarom je slaap verandert en wat je er nu aan doet. Van leefstijl tot supplementen — onderbouwd en praktisch.",
  alternates: {
    canonical: "/slaap-verbeteren-na-40",
  },
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
        text: "Magnesium glycinaat is het breedst onderzocht en meest effectief voor slaapverbetering. Start daar. Als je slaapprobleem stressgerelateerd is, kan ashwagandha (KSM-66) een waardevolle aanvulling zijn.",
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
        text: "De verandering is normaal — je slaaparchitectuur verschuift met de leeftijd. Maar chronisch slecht slapen hoeft niet geaccepteerd te worden. Met de juiste aanpassingen kun je je slaapkwaliteit aanzienlijk verbeteren.",
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
                    <a href="#cortisol" className="hover:underline">
                      Cortisol: de onzichtbare saboteur
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
                  Ken je dit: je gaat moe naar bed, maar zodra je hoofd het kussen raakt, begint het
                  malen. Of je valt wél in slaap, maar om 3 uur &apos;s nachts lig je klaarwakker naar
                  het plafond te staren. Geen reden, geen lawaai — je brein weigert gewoon om uit te
                  schakelen.
                </p>
                <p className="mt-4 text-lg text-gray-700 leading-relaxed">
                  Overdag voel je het. Die waas. Die trage ochtenden waarin koffie nauwelijks helpt.
                  De korte lontjes. Het gevoel dat je draait op reserves in plaats van op energie.
                </p>
                <p className="mt-4 text-lg text-gray-700 leading-relaxed">
                  Je bent niet de enige. Na je 40e verandert er fysiologisch iets fundamenteels in
                  hoe je slaapt. Dat is geen zwakte en geen leeftijdsklacht — het is biologie. En het
                  goede nieuws: als je begrijpt wát er verandert, kun je er iets aan doen.
                </p>
                <p className="mt-4 text-gray-700">In deze gids leer je:</p>
                <ul className="mt-3 space-y-2 text-gray-700 list-disc list-inside">
                  <li>
                    Waarom je slaap na 40 verandert (en waarom &ldquo;gewoon eerder naar bed&rdquo; niet werkt)
                  </li>
                  <li>Welke hormonen en processen je slaap saboteren</li>
                  <li>5 concrete aanpassingen die je vanavond nog kunt starten</li>
                  <li>Welke supplementen wél werken — en welke niet</li>
                </ul>
              </section>

              {/* 4. Mechanisme */}
              <section id="wat-er-verandert" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Wat Er Verandert Na 40
                </h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Je slaap is geen constante factor. Ze evolueert mee met je biologie. Rond je 40e
                  beginnen drie veranderingen zich tegelijk door te zetten — en het samenspel
                  daarvan verklaart waarom je opeens slechter slaapt, ook al ben je net zo moe als
                  vroeger.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  Je melatonine-productie daalt
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Melatonine is het hormoon dat je lichaam vertelt dat het donker is en dat het tijd
                  is om te slapen. Je pijnappelklier maakt dit aan op basis van lichtprikkels. Na
                  je 40e neemt de productie geleidelijk af — bij sommige mannen tot wel 50% minder
                  dan op hun 20e.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Het praktische gevolg: je slaapsignaal wordt zwakker. Je lichaam geeft minder
                  duidelijk het sein &ldquo;slaap nu&rdquo; af. Daardoor duurt het langer voor je in slaap
                  valt, en wordt je gevoeliger voor licht en geluid in de avonduren. Blauwe
                  schermstraling van telefoons en laptops versterkt dit effect — het onderdrukt de
                  toch al verminderde melatonine-aanmaak nog verder.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  Je diepe slaap neemt af
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Slaap bestaat uit cycli van circa 90 minuten. Elk blok bevat lichte slaap,
                  diepe slaap (slow-wave sleep) en REM-slaap. De diepe slaap is cruciaal: dit is
                  waar je lichaam herstelt, groeihormoon aanmaakt en herinneringen consolideert.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Onderzoek laat consistent zien dat de hoeveelheid diepe slaap per nacht afneemt
                  met de leeftijd. Op je 20e slaap je misschien 20-25% van de nacht in diepe slaap;
                  op je 45e kan dat al gedaald zijn naar 10-15%. Het gevolg: je slaapt technisch
                  gezien &ldquo;genoeg&rdquo; uren, maar de herstelwaarde is lager. Je wordt wakker en voelt je
                  toch niet uitgerust.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Alcohol verergert dit aanzienlijk. Een borrel voor het slapen verkort de tijd
                  nodig om in slaap te vallen, maar onderdrukt diepe slaap en REM drastisch — je
                  slaapt &ldquo;door&rdquo;, maar herstelt nauwelijks.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  Je wordt gevoeliger voor verstoringen
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Na je 40e duurt het langer om van lichte slaap naar diepe slaap te zakken. En
                  eenmaal wakker geworden — door geluid, licht, een volle blaas, of zomaar — kom je
                  moeilijker terug. Je slaapdrempel stijgt, je terugvalsdrempel daalt.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Dat verklaard het klassieke patroon van de 40-plusser: makkelijk in slaap vallen,
                  maar dan om 2 of 3 uur wakker liggen met een draaierig hoofd. Die
                  vroeg-in-de-nacht-wakker-periode is geen toeval — het is je biologie.
                </p>
              </section>

              {/* 5. Cortisol */}
              <section id="cortisol" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Cortisol: De Onzichtbare Saboteur
                </h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Cortisol is je primaire stresshormoon. Het heeft een natuurlijk dag-nacht ritme:
                  piek in de ochtend om je wakker en alert te maken, en een daling richting de
                  avond zodat je lichaam tot rust kan komen. Melatonine kan pas stijgen als
                  cortisol voldoende gedaald is — ze zijn communicerende vaten.
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Het probleem bij veel mannen na 40: chronische stress, werkdruk, en een altijd-aan
                  levensstijl houden het cortisolniveau te lang verhoogd. Het hormoon daalt
                  &lsquo;s avonds onvoldoende, waardoor melatonine te laat of te weinig stijgt. Je bent
                  lichamelijk moe, maar &lsquo;aan&rsquo; — in bed liggen scrollen op je telefoon maakt het
                  alleen maar erger.
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Er is nog een tweede mechanisme. Bij sommige mensen schiet cortisol vroeg in de
                  ochtend — soms al om 3 of 4 uur — omhoog. Dat is een evolutionair overblijfsel:
                  je lichaam bereidt zich voor op de dag. Maar als je cortisolcurve verschoven is
                  of te piekerig is, word je daardoor te vroeg wakker, niet meer in staat om terug
                  te slapen. Dit is de biologische verklaring voor het &lsquo;3-uur-wakker&rsquo; patroon.
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Cortisol reguleren is daarmee net zo belangrijk als je slaaphygiëne verbeteren.
                  Niet wat je in bed doet, maar wat je overdag doet bepaalt grotendeels hoe je
                  &lsquo;s nachts slaapt.
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
                  Je circadiaan ritme — je interne klok — wordt voornamelijk gestuurd door
                  consistente tijden. Elke dag op hetzelfde tijdstip opstaan, ook in het weekend, is
                  de krachtigste interventie die bestaat. Niet naar bed gaan op een vast tijdstip,
                  maar opstaan op een vast tijdstip.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Uitslapen in het weekend voelt als herstel, maar het verschuift je biologische
                  klok. Maandag voel je dat — ook wel &ldquo;sociale jetlag&rdquo; genoemd. Varieer maximaal 30
                  minuten met je opstaanmoment, zeven dagen per week.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  2. Bouw een windroutine van 45-60 minuten
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Je zenuwstelsel heeft tijd nodig om van de sympathische (actief) naar de
                  parasympathische (rust) stand te schakelen. Dat gaat niet van de ene op de
                  andere minuut. Een actieve wind-down routine — dimmen van lichten, geen schermen,
                  lichte bezigheid zoals lezen of ademhalingsoefeningen — helpt cortisol te dalen
                  en geeft melatonine de ruimte om te stijgen.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Concreet: zet schermen uit om 22:00 als je om 23:00 in bed wil liggen.
                  Gebruik oranje/rode verlichting in de avond — die heeft nauwelijks effect op
                  melatonine, in tegenstelling tot wit en blauw licht.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  3. Oefen eerder op de dag
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Beweging verhoogt de slow-wave slaap significant — maar het tijdstip telt.
                  Intensieve training verhoogt je lichaamstemperatuur en cortisolniveau, wat bij
                  sommige mensen de slaap verstoort als ze dit na 19:00 doen. Ochtend of vroege
                  middag is optimaal voor intensieve training. Avondwandelingen zijn prima.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Bijkomend voordeel van ochtendtraining: het versterkt je circadiaan ritme. Je
                  lichaam koppelt activiteit aan de ochtend en rust aan de avond — precies wat je wil.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  4. Beheer je cafeïne-inname
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Cafeïne heeft een halfwaardetijd van 5-7 uur. Een kop koffie om 14:00 betekent
                  dat om 21:00 nog de helft van de cafeïne actief is in je bloed. Na je 40e neemt
                  je lever cafeïne langzamer af — de effectieve halfwaardetijd kan 8-10 uur worden.
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
                  Je kernlichaamstemperatuur moet dalen met 1-2°C om in slaap te vallen en diepe
                  slaap te bereiken. Een koele slaapkamer (16-19°C) faciliteert dit. Een warme kamer
                  verstoort de slaap zonder dat je je er bewust van bent.
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
                  Magnesium is betrokken bij meer dan 300 enzymatische processen in het lichaam,
                  waaronder de regulatie van GABA — de neurotransmitter die het zenuwstelsel tot
                  rust brengt. Studies tonen consistent aan dat magnesiumsuppletie de slaapkwaliteit
                  verbetert, met name bij mensen met een suboptimale inname.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Magnesiumtekort is vaker aanwezig dan gedacht: stressvolle leefstijlen, alcohol en
                  een westers dieet arm aan groente en noten zorgen bij veel mannen voor een tekort.
                  Na je 40e neemt de opname via de darmen ook iets af.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Vorm maakt uit. Magnesiumoxide (goedkoop, in veel supermarkt-supplementen) heeft
                  een slechte biologische beschikbaarheid. Magnesium glycinaat en bisglycinaat
                  worden het best opgenomen en hebben het minste last van maag-darmklachten.
                  Dosering: 200-400 mg, 30-60 minuten voor bedtijd.
                </p>

                <div className="mt-6 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700">
                    Welke magnesium vorm werkt het best voor slaap? Glycinaat, bisglycinaat en
                    citraat vergeleken op opname en prijs.
                  </p>
                  <Link
                    href="/beste-magnesium"
                    className="mt-2 inline-block text-green-700 font-semibold hover:text-green-800"
                  >
                    Bekijk onze magnesium vergelijking →
                  </Link>
                </div>

                <h3 className="font-semibold text-xl text-gray-900 mt-10">
                  Ashwagandha (KSM-66)
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Ashwagandha is een adaptogeen — het helpt het lichaam omgaan met stress door
                  cortisol te moduleren. KSM-66 is de meest onderzochte gestandaardiseerde extract,
                  met een reeks gerandomiseerde gecontroleerde studies die positieve effecten laten
                  zien op stressperceptie, cortisolniveau en slaapkwaliteit.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Ashwagandha werkt niet direct slaapbevorderend zoals magnesium dat doet. Het
                  werkt via het cortisol-as: door cortisol te normaliseren, verwijdert het de
                  primaire blokkade waardoor je moeilijk in slaap valt. Het effect bouwt op over
                  4-8 weken — het is geen snelle fix.
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
                    href="/beste-ashwagandha"
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
                  verkeerd begrepen. Het is geen slaapmiddel. Het is een chronobiologisch signaal
                  dat je biologische klok verschuift. Het zegt je lichaam: &ldquo;het is nu nacht&rdquo; — maar
                  het maakt je niet slaperiger als je biologische klok al klopt.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Waar melatonine wél helpt: jetlag, ploegendienst, of een sterk verschoven
                  slaapritme. Tijdelijk gebruik (2-4 weken) in lage dosering (0,3-0,5 mg) is
                  zinvol. Dosering maakt hier veel uit: de gangbare tabletten van 1-5 mg zijn
                  farmacologisch (te) hoog gedoseerd voor chronobiologisch gebruik.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Chronisch melatonine slikken lost het onderliggende probleem niet op — het
                  maskeert het. Focus op magnesium en leefstijl eerst; gebruik melatonine alleen
                  als tijdelijk hulpmiddel bij een specifieke verstoorde klok.
                </p>
              </section>

              {/* 8. Timing & Planning */}
              <section id="aanpak" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Hoe Je Dit Aanpakt: Week voor Week
                </h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Alles tegelijk veranderen werkt zelden. Dit is een praktisch protocol, opgebouwd
                  in fasen.
                </p>

                <div className="mt-8 p-6 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="font-semibold text-gray-900 text-lg">Week 1 — De basis</p>
                  <p className="mt-3 text-gray-700 leading-relaxed">
                    Kies één vast opstaanmoment en houd je er zeven dagen aan, ook in het weekend.
                    Bepaal je slaapvenster (bijv. 23:00–06:30) en ga niet eerder naar bed als je
                    niet slaperig bent — dat versterkt slaapangst. Zet schermen om 22:00 uit. Dit
                    zijn de drie meest impactvolle interventies. Doe nog niets met supplementen —
                    registreer eerst hoe je slaapt.
                  </p>
                </div>

                <div className="mt-4 p-6 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="font-semibold text-gray-900 text-lg">Week 2–4 — Verdiepen en supplementeren</p>
                  <p className="mt-3 text-gray-700 leading-relaxed">
                    Start met magnesium glycinaat: 200-400 mg, 45 minuten voor bedtijd. Bouw een
                    consistente wind-down routine van 45 minuten. Schrap cafeïne na 13:00. Voeg
                    een ochtendwandeling van 15-20 minuten toe direct na het opstaan — daglicht
                    direct in de ochtend is een krachtig circadiaan signaal.
                  </p>
                  <p className="mt-3 text-gray-700 leading-relaxed">
                    Evalueer na week 2: voel je verschil? Zo ja, houd dit vol. Zo nee, voeg
                    ashwagandha toe aan je ochtend- of avondroutine.
                  </p>
                </div>

                <div className="mt-4 p-6 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="font-semibold text-gray-900 text-lg">Maand 2+ — Consolideren en finetunen</p>
                  <p className="mt-3 text-gray-700 leading-relaxed">
                    De meeste mensen merken na 4-6 weken een duidelijk verschil in slaapkwaliteit,
                    energieniveau overdag, en stemming. Dit is ook het moment om te evalueren of
                    je nog verdere optimalisaties wil doen: kamertemperatuur, training timing, of
                    eventueel een slaaptracker om objectief inzicht te krijgen in je slaapfasen.
                  </p>
                  <p className="mt-3 text-gray-700 leading-relaxed">
                    Blijf kritisch op alcohol. Zelfs één glas wijn verstoort diepe slaap meetbaar.
                    Dat hoeft je niet te weerhouden van een sociaal glas, maar weet dat het een
                    afweging is.
                  </p>
                </div>

                <div className="mt-10 text-center p-8 bg-green-50 rounded-2xl border border-green-200">
                  <h3 className="font-serif text-2xl font-bold text-gray-900">
                    Wil je weten waar je staat?
                  </h3>
                  <p className="mt-3 text-gray-600 max-w-lg mx-auto">
                    Slaap is één van de zes domeinen die we meten in de Leefstijlcheck. In 3
                    minuten weet je hoe je scoort — en welk profiel bij jou past.
                  </p>
                  <Link
                    href="/intake"
                    className="mt-5 inline-block bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
                  >
                    Doe de gratis Leefstijlcheck →
                  </Link>
                </div>
              </section>

              {/* 9. Verder Lezen */}
              <section id="verder-lezen" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">Verder Lezen</h2>
                <p className="mt-4 text-gray-700">
                  We werken aan een serie verdiepende artikelen over slaap en herstel. De onderstaande
                  blogs verschijnen de komende weken.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 opacity-75">
                    <span className="inline-block text-xs font-semibold uppercase tracking-wider text-stone-500 bg-stone-200 px-2 py-0.5 rounded mb-3">
                      Binnenkort beschikbaar
                    </span>
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

                  <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 opacity-75">
                    <span className="inline-block text-xs font-semibold uppercase tracking-wider text-stone-500 bg-stone-200 px-2 py-0.5 rounded mb-3">
                      Binnenkort beschikbaar
                    </span>
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

                  <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 opacity-75">
                    <span className="inline-block text-xs font-semibold uppercase tracking-wider text-stone-500 bg-stone-200 px-2 py-0.5 rounded mb-3">
                      Binnenkort beschikbaar
                    </span>
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

                  <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 opacity-75">
                    <span className="inline-block text-xs font-semibold uppercase tracking-wider text-stone-500 bg-stone-200 px-2 py-0.5 rounded mb-3">
                      Binnenkort beschikbaar
                    </span>
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
                      Magnesium glycinaat is het breedst onderzocht en meest effectief voor
                      slaapverbetering. Start daar. Als je slaapprobleem stressgerelateerd is, kan
                      ashwagandha (KSM-66) een waardevolle aanvulling zijn.
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
                      De verandering is normaal — je slaaparchitectuur verschuift met de leeftijd.
                      Maar chronisch slecht slapen hoeft niet geaccepteerd te worden. Met de juiste
                      aanpassingen kun je je slaapkwaliteit aanzienlijk verbeteren.
                    </div>
                  </details>
                </div>
              </section>

              {/* 11. Eind-CTA */}
              <section className="mt-14">
                <div className="text-center p-8 bg-green-50 rounded-2xl border border-green-200">
                  <h3 className="font-serif text-2xl font-bold text-gray-900">
                    Klaar om je slaap structureel aan te pakken?
                  </h3>
                  <p className="mt-3 text-gray-600 max-w-lg mx-auto">
                    De Leefstijlcheck brengt in 3 minuten jouw slaak-, stress- en energieprofiel in
                    kaart. Je krijgt een persoonlijk herstelplan — gratis, zonder registratie.
                  </p>
                  <Link
                    href="/intake"
                    className="mt-5 inline-block bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
                  >
                    Doe de gratis Leefstijlcheck →
                  </Link>
                </div>
              </section>

              {/* 12. Disclaimer */}
              <footer className="mt-16 pt-8 border-t border-stone-200">
                <p className="text-sm text-gray-400 italic">
                  Dit artikel is informatief van aard en vervangt geen medisch advies. Bij
                  aanhoudende slaapproblemen raden we aan contact op te nemen met je huisarts.
                </p>
              </footer>

            </article>
          </div>
        </Container>
      </main>
    </>
  );
}
