import type { SymptoomData, OorzakenData, OplossingenData } from "@/types/symptomen";

export const energieHub: SymptoomData = {
  slug: "energie",
  label: "Energie",
  metaTitle: "Energieproblemen bij mannen 40+ | Herken de signalen | PerfectSupplement",
  metaDescription:
    "Middagdips, motivatieverlies en hersenmist? Ontdek de oorzaken en concrete oplossingen voor lage energie bij mannen boven de 40.",
  heroTitle: "Weinig energie na je 40e: meer dan gewoon moe zijn",
  heroIntro:
    "Je slaapt genoeg, maar je dag voelt zwaar. Die middagdip die steeds vroeger komt, het moeite kosten van taken die vroeger vanzelf gingen, die vage hersenmist — dat is geen luiheid, dat zijn signalen dat er iets uit balans is.",
  herkenning:
    "'s Middags instorten terwijl de dag nog niet klaar is. Dingen uitstellen die vroeger geen moeite kostten. Het gevoel dat je op halve capaciteit draait. Het voelt normaal omdat het geleidelijk is gekomen — maar normaal is het niet.",
  ctaOorzaken: "Wat vreet je energie?",
  ctaOplossingen: "Hoe krijg je meer energie?",
};

export const energieOorzaken: OorzakenData = {
  slug: "energie",
  metaTitle: "Oorzaken van lage energie bij mannen 40+ | PerfectSupplement",
  metaDescription:
    "Waarom heb je minder energie na je 40e? Van bloedsuikerschommelingen tot testosterondaling — ontdek de 4 categorieën oorzaken.",
  h1: "Lage energie bij mannen 40+: waar komt het vandaan?",
  intro:
    "Energieproblemen na je 40e zijn zelden één-oorzakelijk. Bloedsuikerschommelingen, hormonale veranderingen en mentale factoren versterken elkaar. Hieronder zie je de vier categorieën die het meest bijdragen aan aanhoudende vermoeidheid bij mannen boven de 40.",
  h2Titel: "Wat vreet je energie?",
  categorieen: [
    {
      titel: "Leefstijl — de energielekken in je dag",
      kernboodschap:
        "Bloedsuikerschommelingen door koolhydraatrijke maaltijden, te weinig eiwitten en chronische dehydratie zijn de meest onderschatte energiekillers.",
      voorbeelden: [
        "Een koolhydraatrijke lunch zorgt voor een insulinepiek gevolgd door een glucosedal — de klassieke middagdip",
        "Al 2% uitdroging vermindert concentratie en fysieke prestatie meetbaar",
      ],
      blogLink: {
        href: "/blog/vitamine-d-tekort-herkennen",
        titel: "Vitamine D-tekort: herken je de signalen?",
      },
    },
    {
      titel: "Mentaal & emotioneel — de stille energiedrain",
      kernboodschap:
        "Zingevingsverlies, bore-out en chronische onderstimulatie kosten evenveel energie als overbelasting — maar worden zelden herkend als vermoeidheidsoorzaak.",
      voorbeelden: [
        "Werk dat niet meer uitdaagt activeert hetzelfde stresssysteem als overwerk — maar zonder de voldoening",
        "Het gevoel dat je niet meer weet waarvoor je het allemaal doet ondermijnt motivatie op celniveau",
      ],
      blogLink: {
        href: "/blog/testosteron-en-energie-na-40",
        titel: "Testosteron en energie na 40: wanneer is actie nodig?",
      },
    },
    {
      titel: "Werk & omgeving — structurele energiekillers",
      kernboodschap:
        "Monotoon werk, gebrek aan autonomie en een vol vergaderschema laten weinig ruimte voor de mentale herstelcapaciteit die energie in stand houdt.",
      voorbeelden: [
        "Meer dan 4 uur vergaderen per dag verstoort diepgaand denken en verhoogt mentale vermoeidheid",
        "Geen controle hebben over je werkplanning verhoogt het cortisolniveau chronisch",
      ],
      blogLink: {
        href: "/blog/omega-3-concentratie-energie",
        titel: "Omega-3, concentratie en energie: wat zegt de wetenschap?",
      },
    },
    {
      titel: "Fysiek & hormonaal — wat er in je lichaam verandert",
      kernboodschap:
        "Testosterondaling, een traag werkende schildklier, vitamine D-tekort en insulineresistentie zijn fysiologische oorzaken die energie structureel ondermijnen.",
      voorbeelden: [
        "Vitamine D-tekort komt voor bij meer dan 50% van mannen boven de 40 en is direct gelinkt aan vermoeidheid en spierkracht",
        "Subklinische hypothyreoïdie — een trage schildklier net onder de behandelgrens — veroorzaakt chronische uitputting die labs missen",
      ],
      blogLink: {
        href: "/blog/testosteron-en-energie-na-40",
        titel: "Testosteron en energie na 40: wanneer is actie nodig?",
      },
    },
  ],
  afsluitingTitel: "Herkenbaar? Dit kun je eraan doen",
  afsluitingTekst:
    "Energie terugwinnen begint met begrijpen waar het weglekt. Van kleine dagelijkse aanpassingen tot een gerichte bloedtest — er zijn concrete stappen die het verschil maken.",
  ctaOplossingen: {
    label: "Bekijk oplossingen voor energie",
    href: "/symptomen/energie/oplossingen",
  },
};

export const energieOplossingen: OplossingenData = {
  slug: "energie",
  metaTitle: "Meer energie als man 40+ | Wat werkt écht | PerfectSupplement",
  metaDescription:
    "Van eiwitrijk ontbijt tot bloedpanel. Ontdek wat écht werkt tegen lage energie voor mannen boven de 40.",
  h1: "Meer energie: wat werkt écht voor mannen 40+?",
  intro:
    "Energie aanpakken werkt het beste van buiten naar binnen. Begin met de directe oorzaken in je dag, bouw dan betere gewoontes op, en laat daarna meten wat er fysiologisch speelt. Hieronder drie niveaus — begin waar jij nu staat.",
  niveaus: [
    {
      niveau: 1,
      titel: "Niveau 1 — Direct toepasbaar",
      kernboodschap:
        "Kleine aanpassingen die je energieniveau vandaag al merkbaar beïnvloeden.",
      oplossingen: [
        {
          titel: "Water drinken bij het opstaan (500 ml)",
          uitleg:
            "Na 8 uur zonder vocht is rehydratie de snelste manier om concentratie en alertheid te herstellen.",
        },
        {
          titel: "Eiwitrijk ontbijt",
          uitleg:
            "Eiwit en vet stabiliseren de bloedsuiker en voorkomen de ochtendpiek-daldynamiek die energie saboteert.",
        },
        {
          titel: "10 minuten zonlicht in de ochtend",
          uitleg:
            "Activeert de cortisolpiek op het juiste moment en reset je circadiaan ritme voor betere energie door de dag.",
        },
      ],
      blogLinks: [
        {
          href: "/blog/vitamine-d-tekort-herkennen",
          titel: "Vitamine D-tekort: herken je de signalen?",
        },
      ],
      supplement: {
        naam: "Vitamine D3 + K2",
        uitleg:
          "Ondersteunt energiemetabolisme, spierfunctie en immuunsysteem — essentieel bij tekort dat bij de meeste mannen 40+ aanwezig is.",
        href: "/supplementen/vitamine-d",
      },
    },
    {
      niveau: 2,
      titel: "Niveau 2 — Gedrag & leefstijl",
      kernboodschap:
        "Gewoontes die je energiebasis structureel versterken — effect merkbaar na 2-4 weken consistent toepassen.",
      oplossingen: [
        {
          titel: "Bloedsuiker stabiliseren met eiwit + vet bij elke maaltijd",
          uitleg:
            "Voeg altijd een eiwitbron toe aan je maaltijd om insulinepieken te dempen en energieniveau stabiel te houden.",
        },
        {
          titel: "Krachttraining 2-3x per week",
          uitleg:
            "Verhoogt mitochondriële dichtheid, testosteron en insulinegevoeligheid — de drie pijlers van structureel meer energie.",
        },
        {
          titel: "Middagdip omzeilen met beweging",
          uitleg:
            "Een wandeling van 10-15 minuten na de lunch is effectiever dan koffie bij het doorbreken van de glycemische dip.",
        },
        {
          titel: "Cafeïne beperken tot vóór 13:00",
          uitleg:
            "Vermijdt slaapverstoring die de volgende dag weer voor vermoeidheid zorgt — de energiekiller die zichzelf herhaalt.",
        },
      ],
      blogLinks: [
        {
          href: "/blog/omega-3-concentratie-energie",
          titel: "Omega-3, concentratie en energie: wat zegt de wetenschap?",
        },
        {
          href: "/blog/testosteron-en-energie-na-40",
          titel: "Testosteron en energie na 40: wanneer is actie nodig?",
        },
      ],
      supplement: {
        naam: "Omega-3 (EPA/DHA)",
        uitleg:
          "Ondersteunt mitochondriële functie, vermindert ontstekingen en verbetert concentratie en mentale energie.",
        href: "/supplementen/omega-3",
      },
    },
    {
      niveau: 3,
      titel: "Niveau 3 — Dieper werk",
      kernboodschap:
        "Als vermoeidheid aanhoudt ondanks goede gewoontes, zijn er fysiologische oorzaken die meten vereisen.",
      oplossingen: [
        {
          titel: "Uitgebreid bloedpanel laten doen",
          uitleg:
            "Laat ferritine, B12, vitamine D, schildklier (TSH, vrij T4) en nuchtere glucose testen — standaard labs missen veel.",
        },
        {
          titel: "Testosteron laten testen",
          uitleg:
            "Vraag naar totaal testosteron én vrij testosteron — het vrije deel is wat daadwerkelijk beschikbaar is voor je cellen.",
        },
        {
          titel: "Schildklierfunctie grondig testen",
          uitleg:
            "Vraag naast TSH ook vrij T3 en T4 aan — een suboptimale schildklier is een van de meest gemiste oorzaken van chronische vermoeidheid.",
        },
      ],
      blogLinks: [
        {
          href: "/blog/testosteron-en-energie-na-40",
          titel: "Testosteron en energie na 40: wanneer is actie nodig?",
        },
        {
          href: "/blog/vitamine-d-tekort-herkennen",
          titel: "Vitamine D-tekort: herken je de signalen?",
        },
      ],
      supplement: {
        naam: "Ashwagandha of Tongkat Ali",
        uitleg:
          "Ashwagandha ondersteunt herstel van bijnieruitputting; Tongkat Ali stimuleert testosteronproductie — kies op basis van je situatie.",
        href: "/supplementen/ashwagandha",
      },
    },
  ],
  cta: {
    titel: "Weet je niet waar je moet beginnen?",
    tekst:
      "Energieproblemen hebben verschillende oorzaken — van voeding tot hormonen. Binnenkort lanceren we een korte vragenlijst die op basis van jouw situatie een persoonlijk startpunt voorstelt.",
    knopLabel: "Doe de gratis energiecheck",
    knopDisabled: true,
    secundaireLink: {
      label: "Lees meer over vitamine D en energie",
      href: "/supplementen/vitamine-d",
    },
  },
};
