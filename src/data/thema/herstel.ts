import type { ThemaPageData } from "@/types/thema";

export const herstelThema: ThemaPageData = {
  slug: "herstel",
  title: "Herstel",
  heroTitle: "Herstel is waar groei begint",
  heroSubtitle:
    "Zonder herstel geen vooruitgang. Als je lichaam en geest niet opladen, bouw je af in plaats van op. Ontdek wat je herstel blokkeert — en hoe je het terugwint.",
  heroLabel: "THEMA",

  recognition: {
    sectionLabel: "HERKENBAAR?",
    title: "Dit hoor je jezelf misschien zeggen",
    quotes: [
      "Na een training heb ik twee dagen spierpijn.",
      "Ik ben altijd stijf als ik 's ochtends opsta.",
      "Ik sport veel, maar word niet sterker.",
      "In het weekend slaap ik uit, maar het helpt niet echt.",
      "Ik kan niet meer 'aan' en 'uit' schakelen — het draait altijd door.",
    ],
  },

  causes: {
    sectionLabel: "WAT ER SPEELT",
    title: "Waarom herstel verandert na je 40e",
    intro:
      "Herstel is geen passief proces. Je lichaam heeft actieve signalen nodig om te repareren, op te bouwen en bij te tanken. Na je 40e veranderen die signalen — en dat merk je.",
    items: [
      {
        title: "Langzamer spierherstel",
        description:
          "De snelheid waarmee je spieren herstellen na inspanning neemt af. Eiwitopname wordt minder efficiënt, en ontstekingsreacties duren langer. Wat je op je 25e in een dag repareerde, kost nu twee tot drie dagen.",
        icon: "💪",
      },
      {
        title: "Chronisch verhoogd cortisol",
        description:
          "Stress remt je herstelmodus. Cortisol onderdrukt groeihormoon en vertraagt weefselreparatie. Als je niet actief ontspant, blijft je lichaam in 'overlevingsstand' — en herstelt het niet.",
        icon: "📈",
      },
      {
        title: "Minder diepe slaap",
        description:
          "Het meeste fysieke herstel vindt plaats in diepe slaap (fase 3 en 4). Na 40 neemt de hoeveelheid diepe slaap af met 10-15% per decennium. Minder diepe slaap = minder groeihormoon = minder herstel.",
        icon: "🌙",
      },
      {
        title: "Magnesiumtekort",
        description:
          "Magnesium is betrokken bij meer dan 300 enzymatische processen, waaronder spierontspanning en energieproductie. Tekorten komen veel voor en versterken spierkrampen, stijfheid en trage recovery.",
        icon: "⚡",
      },
    ],
  },

  quickWins: {
    sectionLabel: "WAT JE NU KUNT DOEN",
    title: "Drie stappen die je herstel direct verbeteren",
    items: [
      {
        title: "Plan bewust een rustdag",
        description:
          "Herstel is geen bijproduct van training — het is de helft. Plan minimaal twee rustdagen per week in en behandel ze als onderdeel van je trainingsschema, niet als 'vrij'.",
        icon: "📅",
      },
      {
        title: "Eet eiwitrijk binnen 2 uur na inspanning",
        description:
          "Na je 40e heb je meer eiwit nodig voor dezelfde spiersynthese. Richt op 25-40 gram eiwit binnen 2 uur na training — denk aan kwark, eieren of een shake.",
        icon: "🥚",
      },
      {
        title: "Neem 10 minuten bewuste stilte per dag",
        description:
          "Ademhalingsoefeningen, een wandeling zonder telefoon of simpelweg stilzitten. Dit activeert je parasympathisch zenuwstelsel — de herstelmodus van je lichaam.",
        icon: "🧘",
      },
    ],
  },

  supplements: {
    sectionLabel: "GERICHTE ONDERSTEUNING",
    title: "Supplementen die herstel ondersteunen",
    intro:
      "Supplementen zijn geen vervanging voor rust, slaap en goede voeding. Maar bij een tekort of verhoogde behoefte kunnen ze het verschil maken. Dit zijn de drie met de sterkste onderbouwing voor herstel.",
    items: [
      {
        name: "Magnesium",
        reason:
          "Magnesium glycinaat ondersteunt spierontspanning, vermindert krampen en verbetert slaapkwaliteit — drie pijlers van fysiek herstel. Veel mannen 40+ krijgen te weinig binnen via voeding alleen.",
        guideLink: "/supplementen/magnesium",
        comparisonLink: "/beste-magnesium",
        icon: "⚡",
      },
      {
        name: "Omega-3",
        reason:
          "EPA en DHA hebben een ontstekingsremmend effect dat het herstel na inspanning versnelt. Omega-3 ondersteunt ook de gezondheid van gewrichten en pezen — kwetsbare punten na 40.",
        guideLink: "/supplementen/omega-3",
        comparisonLink: "/beste-omega-3-supplement",
        icon: "🐟",
      },
      {
        name: "Ashwagandha",
        reason:
          "Verlaagt cortisol en ondersteunt de balans tussen inspanning en herstel. Onderzoek toont verbeterde recovery en spierkracht bij regelmatig gebruik, vooral onder stressvolle omstandigheden.",
        guideLink: "/supplementen/ashwagandha",
        comparisonLink: "/beste-ashwagandha",
        icon: "🌿",
      },
    ],
  },

  emailGate: {
    sectionLabel: "GRATIS HERSTELGIDS",
    title: "De complete gids voor beter herstel na 40",
    subtitle:
      "Alles over rust, voeding, supplementen en mentaal herstel — in één overzichtelijke PDF. Direct toepasbaar.",
    bulletPoints: [
      "Waarom rustdagen net zo belangrijk zijn als trainingsdagen",
      "Een 7-dagen herstelprotocol dat je deze week kunt starten",
      "Doseerschema's voor magnesium, omega-3 en ashwagandha bij herstel",
      "De drie grootste herstelfouten die mannen 40+ maken",
    ],
    ctaText: "Download de Herstelgids",
    privacyText:
      "Je e-mail wordt alleen gebruikt voor de gids en relevante tips. Geen spam, altijd opzegbaar.",
    successMessage: "Check je inbox — de Herstelgids is onderweg.",
  },

  expertQuote: {
    quote:
      "Mannen boven de 40 die blijven presteren zonder bewust te herstellen, breken hun lichaam sneller af dan ze het opbouwen. Herstel is geen luxe — het is de voorwaarde.",
    author: "Sportfysioloog",
    credential: "Specialisatie inspanningsfysiologie 40+",
  },

  premiumCta: {
    sectionLabel: "PERSOONLIJK ADVIES",
    title: "Wil je weten hoe jouw herstel ervoor staat?",
    subtitle:
      "De Leefstijlcheck analyseert je slaap, stress, energie, voeding, beweging en herstel in 12 vragen. Je krijgt een persoonlijk Herstelplan met concrete stappen.",
    features: [
      "12 vragen, 3 minuten",
      "Scores op 6 leefstijldomeinen",
      "Persoonlijk Herstelplan met quick wins",
      "Gerichte supplementroute op basis van jouw profiel",
    ],
    ctaText: "Start de Leefstijlcheck",
    ctaLink: "/intake",
    note: "Gratis · Geen account nodig · Anoniem verwerkt",
  },

  relatedArticles: [
    {
      title: "Ademhaling tegen stress: technieken die werken",
      slug: "ademhaling-tegen-stress",
      category: "stress",
    },
    {
      title: "Slaap verbeteren na 40: wat werkt écht?",
      slug: "slaap-verbeteren-40-plus",
      category: "slaap",
    },
    {
      title: "Magnesium en slaapkwaliteit: wat zegt het onderzoek?",
      slug: "magnesium-en-slaapkwaliteit",
      category: "slaap",
    },
  ],

  leesOok: {
    sectionLabel: "MEER NAVIGATIE",
    title: "Lees ook",
    items: [
      {
        context:
          "Herstel begint bij slaap. Ontdek waarom je slaap verandert na 40 en wat je eraan kunt doen.",
        href: "/thema/slaap",
        label: "Thema: slaap (nachtrust en herstel)",
      },
      {
        context:
          "Chronische stress remt je herstel. Leer hoe cortisol je recovery blokkeert — en hoe je dat doorbreekt.",
        href: "/thema/stress",
        label: "Thema: stress (cortisol en herstel)",
      },
      {
        context:
          "Welke magnesiumvorm werkt het best voor spierherstel? We vergeleken de populairste opties op vorm, prijs en dosering.",
        href: "/beste-magnesium",
        label: "Beste magnesium-supplementen vergeleken",
      },
      {
        context:
          "Omega-3 ondersteunt herstel na inspanning door ontstekingsremmende werking. Bekijk onze onafhankelijke vergelijking.",
        href: "/beste-omega-3-supplement",
        label: "Beste omega-3 supplementen vergeleken",
      },
    ],
  },

  seo: {
    title:
      "Herstel verbeteren als man 40+ — Oorzaken, tips en supplementen | PerfectSupplement",
    description:
      "Waarom je herstel verandert na je 40e en wat je eraan kunt doen. Concrete leefstijltips, supplementadvies en een gratis herstelgids.",
    canonical: "/thema/herstel",
  },
};
