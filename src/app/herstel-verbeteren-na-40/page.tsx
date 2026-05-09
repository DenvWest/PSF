import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { ReferenceList } from "@/components/references/ReferenceList";
import { RefNote } from "@/components/references/RefNote";
import { herstelVerbeterenNa40References } from "@/data/references/herstel-verbeteren-na-40";

const INLINE_LINK_THEME =
  "font-medium text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px]";

export const metadata: Metadata = {
  title: "Herstel Verbeteren Na 40: Training, Voeding & Supplementen | PerfectSupplement",
  description:
    "Trager herstel na 40? Lees waarom spierherstel verandert en wat werkt: slaap, eiwit, rust, magnesium, omega-3, vitamine D, creatine en meer — onderbouwd en stap voor stap.",
  alternates: {
    canonical: "/herstel-verbeteren-na-40",
  },
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

      <main className="py-12 md:py-16">
        <Container>
          <div className="max-w-3xl mx-auto">
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

              <section id="herkenbaar" className="mt-12">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Ken je dit: je traint normaal — misschien zelfs met hetzelfde schema als vijf jaar
                  geleden — maar DOMS en stijfheid blijven drie tot vijf dagen plakken waar het
                  vroeger binnen twee dagen voorbij was. Of je voelt jezelf tijdens trainingsblokken
                  &quot;sterk&quot;, maar je herstelt tussen trainingen niet meer zoals vroeger.
                </p>
                <p className="mt-4 text-lg text-gray-700 leading-relaxed">
                  Misschien eet je al &quot;best gezond&quot;, maar vergeet tijdens drukke weken gewoon te
                  eten tussen trainingen door. Je slaapt voldoende uren maar niet diep genoeg. Of je
                  stress blijft &apos;s avonds nog een trede te hoog staan voor echte parasympatische rust.
                  Geen excuus, wel iets dat veel mannen herkennen: het herstelbeeld wordt na je 40e veeleisender om
                  dezelfde trainingsbelasting te verwerken.
                </p>
                <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-gray-800 font-medium">
                    Train je hard, maar herstelt je lichaam niet meer zoals vroeger?
                  </p>
                  <p className="mt-2 text-gray-600">
                    Herken je dit patroon? Misschien sluit je aan bij het herstel-type profiel zoals we
                    dat beschrijven in de intake — veel belasting, weinig herstelmomenten.
                  </p>
                  <Link
                    href="/profiel/herstel"
                    className="mt-3 inline-block text-green-700 font-semibold hover:text-green-800"
                  >
                    Ben jij een herstel-profiel? →
                  </Link>
                </div>
                <p className="mt-6 text-gray-700 leading-relaxed">In deze gids leer je:</p>
                <ul className="mt-3 space-y-2 text-gray-700 list-disc list-inside">
                  <li>Wat hormonaal en stofwisselingsmatig verschuift rond middelbare leeftijd</li>
                  <li>
                    Waarom alleen meer volume kiezen tegenwerkt als slaap &amp; eiwit niet meekomen
                  </li>
                  <li>Een vijf-stappenbasis vóór je supplementen oppakt</li>
                  <li>
                    Welke supplementen inhoudelijk het meeste onderbouwing hebben rond spanning,
                    slapen &amp; spieronderhoud bij mannen 40+
                  </li>
                </ul>
              </section>

              <section id="wat-er-verandert" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Wat Er Verandert Na 40
                </h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Het is niet &quot;minder doorzetten&quot; — je lichaam heeft meer nodig om goed te herstellen
                  tussen trainingen: voeding, voldoende slaap, stressmanagement en bewust ingeplande rust.
                  Hieronder vijf biomechanische pijlers die bepalen hoeveel resultaat je nog uit training haalt.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  Testosteroncurve en anaboler context
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Serumtestosterondaling met de jaren wordt in populatiestudies consistent gezien: na de 30ste
                  daalt vrij en totaal hormoon geleidelijk, al verschilt dat sterk per persoon
                  <RefNote number={1} /> <RefNote number={2} />. Dit is geen vrijbrief om te stoppen — wel extra
                  reden om eiwitverdeling en krachttraining serieus te nemen als je wilt blijven
                  bouwen of verliezen wilt remmen na belastingblokken.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  Groeihormoonpulsen en slaap-architectuur
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Groeihormoon blijft belangrijk voor weefselreparatie, maar puls-amplitude én hoeveelheid
                  diepe slaap waar dit mee samengaat verschuiven met de leeftijd{" "}
                  <RefNote number={3} />. Kort samengevat: dezelfde klok slaapuren hoeft niet dezelfde
                  hoeveelheid herstelcapaciteit te leveren als op je twintigste.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">Inflammaging</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Chronische, laaggradige ontsteking (&ldquo;inflamm-aging&rdquo;) hangt samen met veranderingen
                  in het immuunsysteem en herstelvermogen — en dat raakt hoe snel je lichaam herstelt tussen
                  trainingen <RefNote number={4} /> <RefNote number={5} />. Trainen kan juist óók ontstekingsremmend
                  werken óf overdreven belasting verslechteren als volume en stress tegelijk
                  stapelen — context is hier leidend <RefNote number={8} />.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  Tragere spiereiwitresponses (&quot;anabolic resistance&quot;)
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Ouder wordende spieren reageren trager en minder sterk op dezelfde hoeveelheid eiwit uit een
                  maaltijd — je hebt relatief meer per maaltijd of betere timing rond het trainen nodig voor
                  een vergelijkbaar signaal voor spieropbouw{" "}
                  <RefNote number={6} /> <RefNote number={7} /> <RefNote number={21} />.
                  Hier win je geen olympische medailles mee in één cheatdag; wel betere kansen op spierbehoud en
                  spiergroei op langere termijn.
                </p>
              </section>

              <section id="training-alleen" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Waarom Training Alleen Niet Genoeg Is
                </h2>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  Wanneer training harder gaat dan herstel
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Te veel volume zonder periodes waarin stress en spierschade kunnen herstellen, leidt sneller tot
                  minder effect van training (&quot;diminishing returns&quot;) of klachten van overbelasting en
                  overtraining <RefNote number={8} />. Dit is géén
                  morele fout — dit is hoe het autonome en neuro-endocriene systeem prikkels opstapelt.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">Slaap en herstel hangen samen</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Slaapschuld remt endocriene en metabole functies die je nodig hebt om van hard trainen weer
                  sterker terug te komen <RefNote number={9} />. Voor sporters en recreatieve
                  krachttrainers is er bovendien consistent verband tussen slaapduur/kwaliteit en prestatie +
                  subjectief herstel <RefNote number={12} />.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  Voeding is kritischer geworden
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Ouderen hebben absoluut meer goed verdeelde eiwitinname van hoge kwaliteit nodig om
                  spierverlies te remmen en training te ondersteunen — position papers benadrukken richting
                  1,0–1,2 g/kg/dag als basis en hoger bij actieve ouderen of revalidatie{" "}
                  <RefNote number={10} />. Krachttraining gecombineerd met voldoende eiwit blijft de meest
                  robuuste &quot;supplement&quot; die er is <RefNote number={19} />.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  Stress en cortisol beïnvloeden herstel
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Intensiteit en duur van inspanning beïnvloeden acuut circulerend cortisol — chronische
                  stapeling zonder buffer verandert hoe snel je terugschakelt naar herstelmodus na zware sessies{" "}
                  <RefNote number={11} />. Dat botst direct met de mentaliteit van altijd maar harder trainen: soms
                  is minder
                  zwaar &quot;meer&quot; als je autonome output weer normaal moet worden.
                </p>
              </section>

              <section id="wat-je-zelf-kunt-doen" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">Wat Je Zelf Kunt Doen</h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Geen stack lost structureel gebrek aan rust of suboptimale eiwit timing op. Pak deze vijf
                  hefbomen vóór je dosiskalibraties wilt fine-tunen.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  1. Prioriteer slaapkwaliteit
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Vaste opstaandraam (ook weekend), een koele slaapkamer, gedoseerd avondlicht, en géén
                  e-mail-marathon tien minuten vóór bed. Hier bouw je de omgeving waarin GH-pulsen en
                  recuperatief herstel beter uit kunnen spelen <RefNote number={9} /> <RefNote number={12} />.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">2. Eet meer eiwit, verdeeld</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Richt op minimaal 25–35 g hoogwaardig eiwit per maaltijd in 3 maaltijden plus waar nodig een
                  snack — eet rond krachttraining bewust voldoende eiwit zodat je inname aansluit op je training.
                  Dit compenseert gedeeltelijk anabolic resistance <RefNote number={7} />{" "}
                  <RefNote number={19} />.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">3. Plan rustdagen als training</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Twee echte relatieve offload-dagen zijn geen zwakte — ze zijn periodes waarin spieren en pezen
                  echt kunnen herstellen vóór je volgende progressieve overload{" "}
                  <RefNote number={8} />.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">4. Beheer chronische stress</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Zelfs korte ademhalingssessies, wandelingen zonder podcast, of harde stop na werktijd helpen
                  je autonome schakelaar — minder high-cortisol permanente achtergrond, meer ruimte voor
                  parasympathische digest &amp; repair <RefNote number={11} />.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  5. Voeg actief herstel toe (stretching, mobiliteit, rustige zones 2)
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Lage-intensiteit beweging versnelt geen wonderen t.o.v. slaap, maar verbetert doorbloeding
                  en subjectieve stijfheid — zonder extra zware mechanische belasting. Denk aan 20–40 minuten
                  rustig fietsen of wandelen op rustdagen.
                </p>
              </section>

              <section id="supplementen" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Welke Supplementen Helpen
                </h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Geen medische claims — wel afwegingen op basis van mechanistische en klinische literatuur
                  rond spier- en herstelcontext. Start met meten (bloedwaarden) waar logisch (o.a. vitamine D,
                  eventueel ijzer/B12 via huisarts).
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">Magnesium (glycinaat)</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Magnesium speelt mee in honderden enzymroutes; spier- en zenuwfunctie en slaapkwaliteit zijn
                  bekende aandachtspunten na inspanning <RefNote number={13} /> <RefNote number={22} />.
                  Glycinaat / bisglycinaat geven vaak minder maag- en darmklachten dan goedkope oxideniveaus — zie
                  onze
                  vergelijking voor vorm + prijs.
                </p>
                <div className="mt-6 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700">
                    Magnesiumvormen vergelijken op opname, maag-tolerantie en prijs per effectieve dosis.
                  </p>
                  <Link
                    href="/beste-magnesium"
                    className="mt-2 inline-block text-green-700 font-semibold hover:text-green-800"
                  >
                    Bekijk onze magnesium vergelijking →
                  </Link>
                </div>

                <h3 className="font-semibold text-xl text-gray-900 mt-10">Omega-3 (EPA/DHA)</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Marine omega-3 vetzuren beïnvloeden ontstekingsreacties in het lichaam en spier-eiwitturnover in
                  onderzoek bij ouderen en atletische contexten <RefNote number={14} /> <RefNote number={15} />.
                  EU‑claims blijven strikt rond hart en visie — herstelverwachting formuleer je realistisch
                  binnen die kaders.
                </p>
                <div className="mt-6 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700">
                    EPA/DHA mg per softgel, oxidatiestabiliteit en prijs per dag — naast elkaar gezet.
                  </p>
                  <Link
                    href="/beste-omega-3-supplement"
                    className="mt-2 inline-block text-green-700 font-semibold hover:text-green-800"
                  >
                    Bekijk onze omega-3 vergelijking →
                  </Link>
                </div>

                <h3 className="font-semibold text-xl text-gray-900 mt-10">Vitamine D</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Suboptimale D-status komt wijdverspreid voor; relatie met spierfunctie en blessurerisico in
                  sportcontext besproken in reviews <RefNote number={16} />. Laat bloedwaarden en suppletie
                  afstemmen op meting i.p.v. blind hoge bolussen zonder follow-up.
                </p>
                <div className="mt-6 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700">Welke D3+K2-combinaties en doseringen sluiten aan?</p>
                  <Link
                    href="/beste-vitamine-d"
                    className="mt-2 inline-block text-green-700 font-semibold hover:text-green-800"
                  >
                    Bekijk de vitamine D-gids →
                  </Link>
                </div>

                <h3 className="font-semibold text-xl text-gray-900 mt-10">Zink</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Zinkhoofdstuk: immuunsignaalgeving en een breed enzymatisch netwerk — relevant als dieet
                  (plantaardig hoog fytinezuur) of verhoogd verlies rond zware training druk zet
                  <RefNote number={20} />. Niet chronisch megadoseren zonder indicatie.
                </p>
                <div className="mt-6 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700">Zinkpicolinaat, bisglycinaat en combinaties met koper.</p>
                  <Link
                    href="/beste-zink"
                    className="mt-2 inline-block text-green-700 font-semibold hover:text-green-800"
                  >
                    Bekijk de zink vergelijking →
                  </Link>
                </div>

                <h3 className="font-semibold text-xl text-gray-900 mt-10">Creatine monohydraat</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Creatine is een van de best gedocumenteerde ergogene en spieronderhoud-interventies,
                  ook bij ouderen in meta-analytische data <RefNote number={17} /> <RefNote number={18} />. Geen
                  magie — wél robuuste evidence voor kracht en lean massa als training aanwezig is.
                </p>
                <div className="mt-6 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700">Monohydraat, Creapure® en prijs per dosering.</p>
                  <Link
                    href="/beste-creatine"
                    className="mt-2 inline-block text-green-700 font-semibold hover:text-green-800"
                  >
                    Bekijk de creatine vergelijking →
                  </Link>
                </div>

                <h3 className="font-semibold text-xl text-gray-900 mt-10">Eiwitpoeder (whey of plantaardig)</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Praktische manier om je dagelijkse eiwitdoel te halen zonder elke maaltijd te koken —
                  effect op hypertrofie vooral wanneer totale daginname en training kloppen <RefNote number={19} />.
                </p>
                <div className="mt-6 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700">
                    Door ons supplementen-overzicht met context per use-case (herstel, energie, slaap).
                  </p>
                  <Link
                    href="/supplementen"
                    className="mt-2 inline-block text-green-700 font-semibold hover:text-green-800"
                  >
                    Naar supplementen &amp; thema’s →
                  </Link>
                </div>
              </section>

              <section id="aanpak" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Hoe Je Dit Aanpakt: Week voor Week
                </h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Verander niet alles tegelijk in week één — anders weet je niet meer wat echt effect heeft.
                  Dit is een progressief template; schuif timing op als je nachtdiensten of reisfases hebt.
                </p>

                <div className="mt-8 p-6 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="font-semibold text-gray-900 text-lg">Week 1–2 — De basis</p>
                  <ul className="mt-3 list-disc list-inside text-gray-700 space-y-2 leading-relaxed">
                    <li>Vaste opstaan- en bedtijden (max. ~30 min weekend-verschuiving)</li>
                    <li>Eiwit bij elke hoofdmaaltijd (≥25 g dierlijk of gecombineerd plantaardig equivalent)</li>
                    <li>Twee geplande rustdagen zonder zware belasting</li>
                  </ul>
                </div>

                <div className="mt-4 p-6 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="font-semibold text-gray-900 text-lg">Week 3–4 — Verdieping</p>
                  <ul className="mt-3 list-disc list-inside text-gray-700 space-y-2 leading-relaxed">
                    <li>Start magnesium glycinaat rond diner/avondroutine (bouwen op tolerated dose)</li>
                    <li>
                      Voeg omega-3 baseline toe conform het productlabel en afgestemd op hoeveel vette vis je eet
                    </li>
                    <li>Actief herstel: dagelijks rustig bewegen 20–30 min buitenlicht</li>
                  </ul>
                  <p className="mt-3 text-gray-700 leading-relaxed text-sm">
                    Vitamine D en creatine: voeg pas toe als basis slaap/eiwit tweewekelijks stabiel zijn —
                    zo weet je wat het meeste verschil maakte bij jou subjectief (&amp; eventueel later objectief via
                    bloedonderzoek voor vitamine&nbsp;D).
                  </p>
                </div>

                <div className="mt-4 p-6 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="font-semibold text-gray-900 text-lg">Maand 2+ — Consolidatie</p>
                  <ul className="mt-3 list-disc list-inside text-gray-700 space-y-2 leading-relaxed">
                    <li>Periodiseer blokken van 3 weken progressive overload + 1 week volume-demping</li>
                    <li>Evalueer zink alleen bij beperkt dierlijke eiwit/plantaardige restrictieve patronen — niet blind stacken</li>
                    <li>Blijf kritisch op trainings-ego: subjectieve readiness en eventueel HRV via consument-apps als gids voor zelfreflectie — geen diagnoses</li>
                  </ul>
                </div>

                <div className="mt-10 text-center p-8 bg-green-50 rounded-2xl border border-green-200">
                  <h3 className="font-serif text-2xl font-bold text-gray-900">
                    Wil je weten waar je staat?
                  </h3>
                  <p className="mt-3 text-gray-600 max-w-lg mx-auto">
                    Slaap, herstel en energie zijn centrale onderdelen van de Leefstijlcheck: in een paar minuten zie je welk domein je het eerst wilt aanpakken met een
                    concreet stappenplan.
                  </p>
                  <Link
                    href="/intake"
                    className="mt-5 inline-block bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
                  >
                    Doe de gratis Leefstijlcheck →
                  </Link>
                </div>
              </section>

              <section id="verder-lezen" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">Verder Lezen</h2>
                <p className="mt-4 text-gray-700">
                  Verdieping rond slapen (herstelbasis), cortisolstress, energetische output en micronutrienten —
                  elk artikel staat ook op zichzelf.
                </p>

                <div className="mt-6 p-5 rounded-xl border border-stone-200 bg-stone-50">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    <strong className="text-gray-900">
                      Waarom goede slaap de snelste hefboom voor fysiek herstel blijft
                    </strong>
                    <br />
                    Diepte en continuïteit van slaap voorspellen herstelperceptie meer dan de gemiddelde
                    activity-tracker-score overdag alleen kan vertellen.
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
                      Als stress je cortisolcurve laat zakken waar je energie wilt geven
                    </strong>
                    <br />
                    Chronische perceptie van druk sabotage parasympatische rebound na zware blokken —
                    zelfde trainingsplan, ander hormonaal muziekfragment.
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
                      Als je jezelf suf traint maar geen benzine meer voelt tussen sessies door
                    </strong>
                    <br />
                    Herstel zonder brandstofsysteem dat mee-geüpgraded wordt, is een race naar stagnatie — daar sluit
                    deze energiegids direct op aan.
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
                      Testosteron ≠ energie-switch, maar níet irrelevant voor kracht-, libido- en
                      vibespectrum na 40.
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
                      Omega-3 en concentratie/energie: waar het wél om draait in dosage & kwaliteit.
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
                      Vitamine D-tekorten herkennen vóór je willekeurig mega-supplementeert zonder nuance.
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
                      Natuurlijke energietriggers buiten capsules — gedrag eerst dan pas stack.
                    </p>
                    <Link
                      href="/blog/energie-verhogen-natuurlijk"
                      className="mt-2 inline-block text-green-700 text-sm font-semibold hover:text-green-800"
                    >
                      Energie verhogen, natuurlijk →
                    </Link>
                  </div>
                </div>
              </section>

              <section id="faq" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">Veelgestelde vragen</h2>

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
                      eiwit per kg lichaamsgewicht per dag — verdeeld over meerdere maaltijden voor optimale aansturing
                      van spiereiwitbalans bij ouder worden. Bij minder trainingsfrequentiteit lig je lager in het bereik.
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
                      Ja, dat combinatie-gebruik is gangbaar. Zet tijdstippen eventueel uiteen bij maag-gevoeligheid;
                      beide middelen gebruiken veel mensen chronisch maar bloedtests en hydrate blijven zinvol bij
                      buitengewone doseringsschema&apos;s — bespreek met je arts bij nier-/bloeddrukgeschiedenis.
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
                      Slaap- en eiwitinterventies: vaak eerste subjectieve verschillen in 3–14 dagen. Omega-3,
                      vitamine D en micronutrient-timing in weken-maanden horizons — vooral bij eerder suboptimale status.
                      Wees sceptisch tegen garantie-copy; verwachting managen is onderdeel van volhouden.
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
                      Nee. Voeg sequentieel toe zodat je kunt herleiden wat bijwerkingen of perceptuele winst geeft.
                      Basis eerst: slaapritme, eiwit, rustdagen — daarna maximaal één nieuwe suppletiestap per
                      ongeveer 1 á 2 weken (een haalbare kadans).
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
                      Bij plotse extreme spierpijn, koorts, onverklaarbaar gewichtsverlies, hartklachten onder belasting,
                      of duizeligheid met inspanning. Ook bij aanhoudende vermoeidheid &gt;6 weken ondanks correcties.
                    </div>
                  </details>
                </div>
              </section>

              <section className="mt-14">
                <div className="text-center p-8 bg-green-50 rounded-2xl border border-green-200">
                  <h3 className="font-serif text-2xl font-bold text-gray-900">
                    Zin in een kort, eerlijk herstelbeeld?
                  </h3>
                  <p className="mt-3 text-gray-600 max-w-lg mx-auto">
                    De Leefstijlcheck brengt slaap, stress, energie en herstel samen — zodat je niet in losse tips
                    blijft hangen maar één plan hebt dat past bij jouw werkelijkheid.
                  </p>
                  <Link
                    href="/intake"
                    className="mt-5 inline-block bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
                  >
                    Doe de gratis Leefstijlcheck →
                  </Link>
                </div>
              </section>

              <ReferenceList references={herstelVerbeterenNa40References} />

              <footer className="mt-16 pt-8 border-t border-stone-200">
                <p className="text-sm text-gray-400 italic">
                  Dit artikel is informatief van aard en vervangt geen medisch advies. Bij aanhoudende
                  herstelklachten, onverklaarbare pijn of vermoeidheid is het zinvol je huisarts te raadplegen —
                  met name vóór starten met hoge supplementdoseringen of intensieve trainingsprogramma&apos;s na
                  een ziekteperiode.
                </p>
              </footer>
            </article>
          </div>
        </Container>
      </main>
    </>
  );
}
