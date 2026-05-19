import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";

const INLINE_LINK_CLASS =
  "font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] transition hover:decoration-ps-green hover:text-ps-green-hover";

export const metadata: Metadata = {
  title:
    "Stress Verminderen na 40: Van Altijd 'Aan' Naar Meer Rust | PerfectSupplement",
  description:
    "Langdurige stress voelt zwaarder na 40: slaap, energie en rust. Praktische stappen — zonder diagnoses of vage adviezen.",
  alternates: {
    canonical: "/stress-verminderen-man",
  },
  openGraph: {
    title: "Stress Verminderen na 40: Van Altijd 'Aan' Naar Meer Rust",
    description:
      "Langdurige stress voelt zwaarder na 40: slaap, energie en rust. Hier lees je wat je zelf kunt doen.",
    url: "/stress-verminderen-man",
    type: "article",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Stress Verminderen na 40: Van Altijd 'Aan' Naar Meer Rust",
  description:
    "Langdurige stress voelt zwaarder na 40: slaap, energie en rust. Praktische stappen — zonder diagnoses.",
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
  mainEntityOfPage: "https://perfectsupplement.nl/stress-verminderen-man",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Hoe weet ik of mijn stress chronisch is?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Je herkent langdurige stress vaak aan signalen die niet verdwijnen na een weekend rust: slechte slaap ondanks vermoeidheid, prikkelbaarheid, moeite met concentreren, en een lichaam dat moeilijk tot rust komt. Dat is herkenbaar gedrag — geen diagnose. Blijven klachten lang hangen, bespreek het met je huisarts.",
      },
    },
    {
      "@type": "Question",
      name: "Welk supplement helpt het beste tegen stress?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Magnesium draagt bij tot de normale werking van het zenuwstelsel en tot een normale psychologische functie (EU‑claim bij voldoende inname). Ashwagandha heeft geen vaste EU‑gezondheidsclaims op stress; sommige studies gaan over hoe mensen spanning ervaren — vergelijk producten op kwaliteit en overleg bij medicatie. Zie ook onze ashwagandha‑pagina en amber waarschuwing.",
      },
    },
    {
      "@type": "Question",
      name: "Kan stress mijn testosteron verlagen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In populaties kan langdurige stress samenhangen met vermoeidheid, minder zin in training of seksuele interesse, of minder herstelgevoel — dat verschilt sterk per persoon. Dat is geen meetbare diagnose van jouw hormonen zonder bloedonderzoek. Bij aanhoudende klachten: huisarts.",
      },
    },
    {
      "@type": "Question",
      name: "Hoe snel merk ik effect van stressvermindering?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ademhalingsoefeningen helpen veel mensen snel om rustiger te worden. Leefstijl zoals vast slaapritme en dagelijkse wandeling merk je vaak binnen enkele weken. Supplementen zijn geen vervanging voor rust en ritme; volg altijd het etiket en vraag advies bij medicatie.",
      },
    },
    {
      "@type": "Question",
      name: "Wanneer moet ik naar een professional met mijn stress?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Als je langer dan 6 weken last hebt van aanhoudende vermoeidheid, somberheid, slaapproblemen of concentratieproblemen die niet verbeteren met leefstijlaanpassingen. Of als je merkt dat je je terugtrekt uit sociale situaties, niet meer kunt genieten, of fysieke klachten hebt waar geen medische oorzaak voor wordt gevonden. Begin bij je huisarts of de POH-GGZ.",
      },
    },
  ],
};

export default function StressVerminderenManPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
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
                  Stress Verminderen na 40: Van Altijd &apos;Aan&apos; Naar Meer Rust
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
                    <a href="#wat-er-gebeurt" className="hover:underline">
                      Waarom stress na 40 vaak zwaarder voelt
                    </a>
                  </li>
                  <li>
                    <a href="#stress-bij-mannen-40" className="hover:underline">
                      Hoe stress zich meestal uit — in begrijpelijke taal
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
                  Je wordt wakker en je hoofd staat meteen aan. Nog voor je voeten de grond raken, ben
                  je de volgende dag al aan het plannen. Op je werk functioneer je — niemand merkt
                  hoeveel energie het je kost. &apos;s Avonds kun je niet loslaten: je lichaam is
                  moe, maar je hoofd blijft doorgaan.
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">Ken je dit:</p>
                <ul className="mt-3 space-y-2 text-gray-700 list-disc list-inside">
                  <li>
                    Je hebt moeite om &apos;s avonds je gedachten te stoppen — ook als de dag{" "}
                    &quot;goed&quot; was
                  </li>
                  <li>
                    Je bent sneller geïrriteerd dan een paar jaar geleden, op dingen die je vroeger
                    niet raakten
                  </li>
                  <li>
                    Je merkt dat je steeds vaker &quot;doorduwen&quot; als standaardmodus hebt —
                    pauze voelt als stilstand
                  </li>
                  <li>Je slaap is licht en onrustig, ook al ben je doodmoe</li>
                  <li>
                    Hoofdpijn, kaakspanning of schouderklachten komen steeds terug
                  </li>
                </ul>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Als je hier drie of meer van herkent, lees verder. Het is geen zwakte — het is een
                  signaal dat je lang in een hoge belastingstand zit. Dat wil zeggen: je systeem
                  krijgt weinig echte rustmomenten, niet dat wij weten wat er in je bloed zit.
                </p>
              </section>

              {/* 4–6. Stress na 40, HPA, cortisol/testosteron */}
              <section id="wat-er-gebeurt" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Waarom stress na 40 vaak zwaarder voelt
                </h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Stress is niet per definitie slecht. Kortdurende stress — een deadline, een
                  intensieve training, een moeilijk gesprek — kan je scherp zetten. Het probleem
                  begint wanneer de spanning lang aan blijft staan en rust zeldzaam wordt.
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Na je 40e merken veel mannen dat herstel langer duurt: waar een zware week vroeger
                  met een goed weekend weer vlak werd, blijft het gevoel van &quot;aan&quot; langer
                  hangen. Dat past vaak bij druk op werk, gezin en verantwoordelijkheden — niet
                  automatisch bij een ziekte.
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">Drie dingen horen we vaak terug:</p>
                <ol className="mt-3 space-y-3 text-gray-700 list-decimal list-inside leading-relaxed">
                  <li>
                    <strong className="font-semibold text-gray-900">Je komt moeilijk in echte rust.</strong>{" "}
                    Overdag functioneer je, maar &apos;s avonds blijft je hoofd doorlopen en slaap
                    voelt oppervlakkig. Dat is herkenbaar gedrag bij langdurige belasting.
                  </li>
                  <li>
                    <strong className="font-semibold text-gray-900">
                      Energie en herstel voelen minder &quot;gratis&quot;.
                    </strong>{" "}
                    Trainen, werken en sociale dingen kosten meer moeite om weer op peil te komen.
                    Dat zegt niets over je karakter — wel over je weekbelasting.
                  </li>
                  <li>
                    <strong className="font-semibold text-gray-900">
                      Kleine dingen voelen sneller zwaar.
                    </strong>{" "}
                    Prikkelbaarheid, spanning in kaak of schouders, hoofdpijn: signalen die vaak
                    samengaan met weinig pauzes en slechte slaap.
                  </li>
                </ol>

                <section id="stress-bij-mannen-40" className="mt-14">
                  <h3 className="font-semibold text-xl text-gray-900">
                    Hoe stress zich meestal uit — zonder medisch jargon
                  </h3>
                  <p className="mt-3 text-gray-700 leading-relaxed">
                    In gesprekken met mannen 40+ horen we vaak hetzelfde patroon: je lichaam blijft
                    lang in een &quot;alles moet af&quot;-modus, terwijl je brein weinig momenten
                    krijgt om echt los te laten. Daardoor slaap je slechter, ben je sneller kort van
                    stok en blijft sporten of hobby&apos;s voelen als &quot;moeten&quot;.
                  </p>
                  <p className="mt-4 text-gray-700 leading-relaxed">
                    Wil je dieper duiken in het biologische verhaal (bijvoorbeeld{" "}
                    <Link href="/kennisbank/cortisol" className={INLINE_LINK_CLASS}>
                      cortisol
                    </Link>{" "}
                    of de{" "}
                    <Link href="/kennisbank/hpa-as" className={INLINE_LINK_CLASS}>
                      HPA-as
                    </Link>
                    )? Dat lees je in de kennisbank — zonder dat we hier claimen wat er bij jou
                    precies meetbaar speelt.
                  </p>
                  <p className="mt-4 text-gray-700 leading-relaxed">
                    Het goede nieuws: wat je overdag doet met ritme, slaap, beweging en grenzen, heeft
                    voor veel mensen de grootste impact. Daar begin je het liefst — supplementen
                    zijn hooguit een tweede stap als de basis staat.
                  </p>
                </section>
              </section>

              {/* 7. Leefstijl */}
              <section id="leefstijl" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Wat Je Zelf Kunt Doen
                </h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Stressvermindering begint niet bij supplementen, maar bij de manier waarop je je
                  dag inricht. Dit zijn de vijf interventies met het meeste bewijs:
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  1. Ademhaling — de snelste manier om je lichaam tot rust te brengen
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Langzaam en bewust uitademen helpt veel mensen om sneller rustiger te worden. De
                  4-7-8 methode (4 tellen inademen, 7 tellen vasthouden, 8 tellen uitademen) is
                  eenvoudig om te onthouden. Twee keer per dag, 5 minuten.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  → Lees meer:{" "}
                  <Link href="/blog/ademhaling-tegen-stress" className={INLINE_LINK_CLASS}>
                    Ademhalingstechnieken die binnen 5 minuten werken
                  </Link>
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  2. Beweging — maar niet te veel
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Matige beweging (wandelen, zwemmen, fietsen) helpt veel mensen om spanning af te
                  bouwen. Heel intensief trainen bovenop een vol hoofd voelt voor sommigen juist te
                  zwaar. Als je al lang &quot;aan&quot; staat, is een dagelijkse wandeling van 30
                  minuten vaak effectiever dan extra harde sessies.
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  3. Slaapritme — de ondergewaardeerde reset
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Een vast ritme helpt je lichaam overdag scherper te stellen: ga op een vergelijkbaar
                  tijdstip naar bed en sta op een vast moment op — ook in het weekend. Dat klinkt
                  simpel, maar het is voor veel mensen de snelste winst op slaap en stressgevoel.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  → Worstel je ook met je slaap? Lees de complete gids:{" "}
                  <Link href="/slaap-verbeteren-na-40" className={INLINE_LINK_CLASS}>
                    Slaap verbeteren na 40
                  </Link>
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  4. Grenzen stellen — de structurele oplossing
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Stress is vaak niet wat er op je afkomt, maar wat je accepteert. Leer nee zeggen
                  zonder schuldgevoel. Blokkeer tijd in je agenda voor herstel — behandel het als
                  een afspraak die je niet afzegt.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  → Lees meer:{" "}
                  <Link href="/blog/stress-werk-grenzen-stellen" className={INLINE_LINK_CLASS}>
                    Grenzen stellen op werk zonder je carrière te saboteren
                  </Link>
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">
                  5. Stimulanten beperken
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Cafeïne laat op de dag kan slapen lastiger maken. Alcohol lijkt ontspannend, maar
                  maakt slaap voor veel mensen oppervlakkiger. Beperk koffie tot de ochtend en drink
                  alcohol met mate — niet dagelijks rond bedtijd.
                </p>
              </section>

              {/* 8. Supplementen */}
              <section id="supplementen" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Welke Supplementen Helpen Bij Stress
                </h2>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  Supplementen zijn geen vervanging voor leefstijlaanpassingen — maar ze kunnen het
                  verschil maken als de basis op orde is. Dit zijn de twee met het meeste bewijs bij
                  chronische stress:
                </p>

                <h3 className="font-semibold text-xl text-gray-900 mt-8">Ashwagandha (KSM-66)</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Ashwagandha wordt in studies vaak besproken rond hoe mensen spanning ervaren.
                  Er zijn geen vaste EU‑gezondheidsclaims op stress voor dit kruid; er lopen discussies
                  over regulering in Nederland. KSM‑66 is een veelgebruikt gestandaardiseerd extract
                  — vergelijk producten op kwaliteit en overleg bij medicatie.
                </p>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Let op: ashwagandha heeft geen EFSA-goedgekeurde gezondheidsclaims en er lopen
                  discussies over regulering in Nederland. Wij presenteren wat onderzoek op dit moment
                  laat zien — de keuze is aan jou.
                </p>
                <div className="mt-6 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700">
                    Welke ashwagandha is het meest onderzocht en het beste gedoseerd?
                  </p>
                  <Link
                    href="/beste/ashwagandha"
                    className="mt-2 inline-block text-green-700 font-semibold hover:text-green-800"
                  >
                    Bekijk de vergelijking →
                  </Link>
                </div>

                <h3 className="font-semibold text-xl text-gray-900 mt-10">
                  Magnesium glycinaat
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  Magnesium speelt een rol bij meer dan 300 processen in je lichaam, waaronder het
                  ontspannen van je zenuwstelsel. Glycinaat is de vorm die het beste opgenomen wordt
                  en werkt vaak rustgevender via de glycine-component. Dosering: 200-400 mg
                  elementair magnesium, bij voorkeur &apos;s avonds.
                </p>
                <div className="mt-6 p-5 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-gray-700">
                    Welke magnesium werkt het snelst en wordt het beste opgenomen?
                  </p>
                  <Link
                    href="/beste/magnesium"
                    className="mt-2 inline-block text-green-700 font-semibold hover:text-green-800"
                  >
                    Bekijk de vergelijking →
                  </Link>
                </div>
              </section>

              {/* 9. Week voor week */}
              <section id="aanpak" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Hoe Je Dit Aanpakt: Week voor Week
                </h2>

                <div className="mt-8 p-6 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="font-semibold text-gray-900 text-lg">Week 1 — De basis</p>
                  <p className="mt-3 text-gray-700 leading-relaxed">
                    Begin met drie dingen, niet meer:
                  </p>
                  <ul className="mt-3 space-y-2 text-gray-700 list-disc list-inside leading-relaxed">
                    <li>Ademhalingsoefening 2x per dag, 5 minuten (ochtend en avond)</li>
                    <li>Geen cafeïne na 14:00</li>
                    <li>Vast bedtijd met maximaal 30 minuten verschil</li>
                  </ul>
                </div>

                <div className="mt-4 p-6 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="font-semibold text-gray-900 text-lg">Week 2-3 — Leefstijl verankeren</p>
                  <ul className="mt-3 space-y-2 text-gray-700 list-disc list-inside leading-relaxed">
                    <li>Voeg dagelijkse wandeling toe (minimaal 20 minuten)</li>
                    <li>
                      Blokkeer 2 &quot;lege&quot; blokken in je agenda per week — geen afspraken, geen taken
                    </li>
                    <li>Overweeg magnesium glycinaat voor het slapen (200-400 mg)</li>
                  </ul>
                </div>

                <div className="mt-4 p-6 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="font-semibold text-gray-900 text-lg">Week 4 — Meten en bijstellen</p>
                  <p className="mt-3 text-gray-700 leading-relaxed">
                    Doe de{" "}
                    <Link href="/intake" className={INLINE_LINK_CLASS}>
                      Leefstijlcheck
                    </Link>{" "}
                    opnieuw. Vergelijk je stressscore met 4 weken geleden. Waar is verbetering?
                    Waar niet? Op basis daarvan stel je je aanpak bij.
                  </p>
                </div>
              </section>

              {/* 10. Verder lezen */}
              <section id="verder-lezen" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">Verder Lezen</h2>

                <div className="mt-6 p-5 rounded-xl border border-stone-200 bg-stone-50">
                  <p className="text-stone-600 mt-0 leading-relaxed text-sm">
                    <strong className="text-stone-900">Moe én gestrest?</strong>
                    <br />
                    Vermoeidheid en stress versterken elkaar. Als je energie structureel laag is,
                    kan het helpen om beide kanten te bekijken.
                  </p>
                  <a
                    href="/energie-na-40"
                    className="font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] mt-2 inline-block text-sm"
                  >
                    Lees de gids: Energie Na 40 →
                  </a>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Link
                    href="/blog/cortisol-verlagen-natuurlijk"
                    className="group block rounded-xl border border-stone-200 bg-stone-50 p-5 transition-colors hover:border-ps-green/30"
                  >
                    <p className="text-sm leading-relaxed text-gray-700">
                      Langdurige stress en spanning kunnen samengaan met slechte slaap en meer
                      prikkelbaarheid — vaak zonder dat je het direct doorhebt. In dit artikel: vijf
                      leefstijlroutes om rustiger te worden.
                    </p>
                    <span className="mt-3 inline-block text-sm font-semibold text-ps-green group-hover:underline">
                      Lees het artikel →
                    </span>
                  </Link>

                  <Link
                    href="/blog/ademhaling-tegen-stress"
                    className="group block rounded-xl border border-stone-200 bg-stone-50 p-5 transition-colors hover:border-ps-green/30"
                  >
                    <p className="text-sm leading-relaxed text-gray-700">
                      Je ademhaling is de snelste manier om je zenuwstelsel te beïnvloeden. Geen
                      apparaat nodig, geen abonnement.
                    </p>
                    <span className="mt-3 inline-block text-sm font-semibold text-ps-green group-hover:underline">
                      Lees het artikel →
                    </span>
                  </Link>

                  <Link
                    href="/blog/stress-werk-grenzen-stellen"
                    className="group block rounded-xl border border-stone-200 bg-stone-50 p-5 transition-colors hover:border-ps-green/30"
                  >
                    <p className="text-sm leading-relaxed text-gray-700">
                      Nee zeggen voelt riskant als je verantwoordelijkheid draagt of je positie wilt
                      behouden. Maar chronische overbelasting is een groter risico.
                    </p>
                    <span className="mt-3 inline-block text-sm font-semibold text-ps-green group-hover:underline">
                      Lees het artikel →
                    </span>
                  </Link>

                  <Link
                    href="/blog/cortisol-en-testosteron"
                    className="group block rounded-xl border border-stone-200 bg-stone-50 p-5 transition-colors hover:border-ps-green/30"
                  >
                    <p className="text-sm leading-relaxed text-gray-700">
                      Stress en testosteron worden vaak in één adem genoemd — dit artikel scheidt feiten
                      van verhalen.
                    </p>
                    <span className="mt-3 inline-block text-sm font-semibold text-ps-green group-hover:underline">
                      Cortisol en testosteron →
                    </span>
                  </Link>

                  <Link
                    href="/testosteron-na-40"
                    className="group block rounded-xl border border-stone-200 bg-stone-50 p-5 transition-colors hover:border-ps-green/30"
                  >
                    <p className="text-sm leading-relaxed text-gray-700">
                      Volledige gids testosteron na 40: leefstijl eerst, supplementen in context.
                    </p>
                    <span className="mt-3 inline-block text-sm font-semibold text-ps-green group-hover:underline">
                      Naar de pillar →
                    </span>
                  </Link>

                  <Link
                    href="/profiel/stressdrager"
                    className="group block rounded-xl border border-stone-200 bg-stone-50 p-5 transition-colors hover:border-ps-green/30"
                  >
                    <p className="text-sm leading-relaxed text-gray-700">
                      Herken je het Stressdrager-profiel? Als chronische stress je primaire patroon
                      is, past dit profiel bij jou. Met concrete stappen en supplementadvies
                      afgestemd op jouw situatie.
                    </p>
                    <span className="mt-3 inline-block text-sm font-semibold text-ps-green group-hover:underline">
                      Lees meer over het Stressdrager-profiel →
                    </span>
                  </Link>
                </div>
              </section>

              {/* 11. CTA */}
              <section id="leefstijlcheck" className="mt-14">
                <div className="text-center p-8 bg-green-50 rounded-2xl border border-green-200">
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900">
                    Ontdek Waar Jij Staat
                  </h2>
                  <p className="mt-3 text-gray-600 max-w-lg mx-auto leading-relaxed">
                    Stress is één van de zes domeinen die we meten in de Leefstijlcheck. In 3
                    minuten weet je hoe je scoort op stress, slaap, energie, herstel, voeding en
                    beweging — en welk profiel bij jou past.
                  </p>
                  <p className="mt-4 text-sm text-gray-500 max-w-lg mx-auto">
                    Geen diagnose — wel een startpunt voor gesprek met je arts.
                  </p>
                  <Link
                    href="/intake"
                    className="mt-5 inline-block bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
                  >
                    Zie waar jouw stress, slaap en energie scoren — gratis →
                  </Link>
                  <p className="mt-3 text-sm text-gray-500">
                    12 vragen, 3 minuten, persoonlijk advies
                  </p>
                </div>
              </section>

              {/* 12. FAQ */}
              <section id="veelgestelde-vragen" className="mt-14">
                <h2 className="font-serif text-3xl font-bold text-gray-900">
                  Veelgestelde Vragen
                </h2>

                <div className="mt-6 space-y-3">
                  <details className="group border border-stone-200 rounded-xl overflow-hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold text-gray-900 transition-colors hover:bg-stone-50">
                      Hoe weet ik of mijn stress chronisch is?
                      <span className="shrink-0 text-xl leading-none text-green-700 transition-transform duration-200 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 leading-relaxed text-gray-700">
                      Je herkent langdurige stress vaak aan signalen die niet verdwijnen na een
                      weekend rust: slechte slaap ondanks vermoeidheid, prikkelbaarheid, moeite met
                      concentreren, en een lichaam dat moeilijk tot rust komt. Dat is herkenbaar
                      gedrag — geen diagnose. Blijven klachten lang hangen, bespreek het met je
                      huisarts.
                    </div>
                  </details>

                  <details className="group border border-stone-200 rounded-xl overflow-hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold text-gray-900 transition-colors hover:bg-stone-50">
                      Welk supplement helpt het beste tegen stress?
                      <span className="shrink-0 text-xl leading-none text-green-700 transition-transform duration-200 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 leading-relaxed text-gray-700">
                      Magnesium draagt bij tot de normale werking van het zenuwstelsel en tot een
                      normale psychologische functie (EU‑claim bij voldoende inname). Ashwagandha
                      heeft geen vaste EU‑gezondheidsclaims op stress; sommige studies gaan over hoe
                      mensen spanning ervaren — vergelijk producten op kwaliteit en overleg bij
                      medicatie. Zie ook onze ashwagandha‑pagina en amber waarschuwing.
                    </div>
                  </details>

                  <details className="group border border-stone-200 rounded-xl overflow-hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold text-gray-900 transition-colors hover:bg-stone-50">
                      Kan stress mijn testosteron verlagen?
                      <span className="shrink-0 text-xl leading-none text-green-700 transition-transform duration-200 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 leading-relaxed text-gray-700">
                      In populaties kan langdurige stress samenhangen met vermoeidheid, minder zin in
                      training of seksuele interesse, of minder herstelgevoel — dat verschilt sterk
                      per persoon. Dat is geen meetbare diagnose van jouw hormonen zonder
                      bloedonderzoek. Bij aanhoudende klachten: huisarts.
                    </div>
                  </details>

                  <details className="group border border-stone-200 rounded-xl overflow-hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold text-gray-900 transition-colors hover:bg-stone-50">
                      Hoe snel merk ik effect van stressvermindering?
                      <span className="shrink-0 text-xl leading-none text-green-700 transition-transform duration-200 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 leading-relaxed text-gray-700">
                      Ademhalingsoefeningen helpen veel mensen snel om rustiger te worden.
                      Leefstijl zoals vast slaapritme en dagelijkse wandeling merk je vaak binnen
                      enkele weken. Supplementen zijn geen vervanging voor rust en ritme; volg
                      altijd het etiket en vraag advies bij medicatie.
                    </div>
                  </details>

                  <details className="group border border-stone-200 rounded-xl overflow-hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold text-gray-900 transition-colors hover:bg-stone-50">
                      Wanneer moet ik naar een professional met mijn stress?
                      <span className="shrink-0 text-xl leading-none text-green-700 transition-transform duration-200 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 leading-relaxed text-gray-700">
                      Als je langer dan 6 weken last hebt van aanhoudende vermoeidheid, somberheid,
                      slaapproblemen of concentratieproblemen die niet verbeteren met
                      leefstijlaanpassingen. Of als je merkt dat je je terugtrekt uit sociale
                      situaties, niet meer kunt genieten, of fysieke klachten hebt waar geen
                      medische oorzaak voor wordt gevonden. Begin bij je huisarts of de POH-GGZ.
                    </div>
                  </details>
                </div>
              </section>

              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
              />

              <MedicalDisclaimer />

              <footer className="mt-8 pt-8 border-t border-stone-200">
                <p className="text-sm text-gray-400 italic leading-relaxed">
                  Bij langdurige somberheid, burn-outklachten of paniekgevoelens: zoek professionele
                  hulp via je huisarts of de POH-GGZ. Supplementen zijn geen vervanging voor
                  psychologische zorg.
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
