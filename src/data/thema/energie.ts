import { ThemaPageData } from "@/types/thema";

export const energieThema: ThemaPageData = {
  slug: "energie",
  title: "Energie",
  heroTitle: "Weinig energie na je 40e: meer dan gewoon moe zijn",
  heroSubtitle:
    "Je slaapt genoeg, maar je dag voelt zwaar. Die middagdip die steeds vroeger komt, het moeite kosten van taken die vroeger vanzelf gingen, die vage hersenmist — dat is geen luiheid, dat zijn signalen dat er iets uit balans is.",
  heroLabel: "THEMA",

  recognition: {
    sectionLabel: "HERKENBAAR?",
    title: "Dit hoor je jezelf misschien zeggen",
    quotes: [
      "’s Middags stort ik in terwijl de dag nog niet klaar is.",
      "Ik stel dingen uit die vroeger geen moeite kostten — ik ben geen procastinator, denk ik.",
      "Mijn lichaam is op bed, mijn hoofd draait nog op halve toeren.",
      "Ik dacht dat dit erbij hoorde na 40, maar iedereen lijkt het wel te hebben — en te accepteren.",
      "Koffie houdt me overeind, maar versterkt de middagdip nóg meer.",
    ],
  },

  causes: {
    sectionLabel: "WAT ER SPEELT",
    title: "Waar je energie vandaan komt (en weglekt) na je 40e",
    intro:
      "Energieproblemen zijn zelden één-oorzakelijk. Bloedsuiker, hormonen, stress en beweging versterken elkaar. Hieronder vier domeinen die het vaakst een rol spelen.",
    items: [
      {
        title: "Leefstijl — de energielekken in je dag",
        description:
          "Bloedsuikerschommelingen, onvoldoende eiwitten of structuur in maaltijden, en te weinig water zijn de stille, aanhoudende drains.",
        icon: "🥗",
      },
      {
        title: "Mentaal & emotioneel",
        description:
          "Gevoelens van onrust, ruis of onderstimulatie vreten net zo hard aan je tank als harde overbelasting — zonder dat je het als ‘stress’ ervaart.",
        icon: "🧠",
      },
      {
        title: "Werk & omgeving",
        description:
          "Een strak schema zonder pauze, lange stilzitten dagen of gebrek aan beweegmomenten snoept vóór de avond al je herstel weg.",
        icon: "💼",
      },
      {
        title: "Fysiek & hormonaal",
        description:
          "Vitamine D, schildklier, testosteron en insulinegevoeligheid: kleine afwijkingen kunnen grote invloed hebben op hoe ‘vol’ je je voelt.",
        icon: "🩺",
      },
    ],
  },

  quickWins: {
    sectionLabel: "DIRECT TOEPASBAAR",
    title: "3 dingen die je vandaag al energie kunnen geven",
    items: [
      {
        title: "500 ml water direct na opstaan",
        description:
          "Na nachten zonder inname is rehydraties de snelste manier om concentratie en alertheid te herstellen — vóór je eerste koffie.",
        icon: "💧",
      },
      {
        title: "Eiwit + vet bij het ontbijt",
        description:
          "Een stabielere ochtendbloedsuiker betekent minder mid-morning crash en minder neiging tot koffie-escalatie.",
        icon: "🍳",
      },
      {
        title: "10 minuten ochtendlicht",
        description:
          "Buitenlicht in de ochtend helpt je cortisol- en waakritme te zetten — essentieel voor vermoeidheidsbestendigheid later op de dag.",
        icon: "☀️",
      },
    ],
  },

  supplements: {
    sectionLabel: "SUPPLEMENTEN DIE KUNNEN HELPEN",
    title: "Gericht aanvullen — afgestemd op veelvoorkomende gaten",
    intro:
      "Deze keuzes hebben ondersteuning in literatuur als voeding, slaap of bloedwaarden niet optimaal zijn. In de gidsen lees je wanneer wat past en hoe je producten vergelijkt.",
    items: [
      {
        name: "Vitamine D3 (+ K2)",
        reason:
          "Een wijdverspreid tekort sluit aan op vermoeidheid, spierfunctie en humeur — zeker in maanden met weinig zon of bij binnenwerk.",
        guideLink: "/supplementen/vitamine-d",
        comparisonLink: "/beste-vitamine-d",
        icon: "☀️",
      },
      {
        name: "Omega-3 (EPA/DHA)",
        reason:
          "Ondersteunt cellen, ontstekingsbalans en mentale frisheid; nauw te koppelen aan lage visinname in het moderne eetpatroon.",
        guideLink: "/supplementen/omega-3",
        comparisonLink: "/beste-omega-3-supplement",
        icon: "🐟",
      },
      {
        name: "Ashwagandha",
        reason:
          "Ondersteunt herstel en stress- en bijnierbelasting; relevant als vermoeidheid samengaat met slechte nachten of ‘altijd alert’-gevoel.",
        guideLink: "/supplementen/ashwagandha",
        comparisonLink: "/beste-ashwagandha",
        icon: "🌿",
      },
    ],
  },

  emailGate: {
    sectionLabel: "GRATIS ENERGIEGIDS",
    title: "Op een rij: energie, voeding, hormonen en stappen",
    subtitle:
      "Een strakke PDF met herkenning, eenvoudige leefstijlinterventies en wanneer meten of verdieping zinvol is — zonder pakkende beloftes, wel met duiding.",
    bulletPoints: [
      "Hoe leefstijl en hormonen elkaar versterken na je 40e",
      "Eenvoudig weekplan: eten, beweging, licht (haalbaar in drukke weken)",
      "Supplementinformatie op hoofdlijnen met links naar onze gidsen",
      "Wanneer vermoeidheid wél iets ernstigers kan betekenen — en wat je bespreekt",
    ],
    ctaText: "Download de Energiegids",
    privacyText:
      "Je e-mail wordt alleen gebruikt voor de gids en relevante tips. Geen spam, altijd opzegbaar.",
    successMessage: "Check je inbox — de Energiegids is onderweg.",
  },

  expertQuote: {
    quote:
      "Vermoeidheid is zelden ‘één’ oorzaak. Meestal is het de som van wat je s ’nachts, aan tafel en tussen je oren niet meer volledig herstelt.",
    author: "Praktische voorlichting",
    credential: "Samengesteld door PerfectSupplement",
  },

  premiumCta: {
    sectionLabel: "PERSOONLIJK ADVIES",
    title: "Wil je weten wat er bij jou speelt?",
    subtitle:
      "De Leefstijlcheck analyseert je energie, slaap, stress, voeding, beweging en herstel in 12 vragen. Je krijgt een persoonlijk Herstelplan met concrete stappen.",
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
      title: "Testosteron en energie na 40: wanneer is actie nodig?",
      slug: "testosteron-en-energie-na-40",
      category: "energie",
    },
    {
      title: "Vitamine D-tekort: herken je de signalen?",
      slug: "vitamine-d-tekort-herkennen",
      category: "energie",
    },
  ],

  seo: {
    title:
      "Energie terugwinnen als man 40+ | Oorzaken, tips en supplementen | PerfectSupplement",
    description:
      "Middagdips, hersenmist en weinig puf begrijpen. Leefstijl, verdieping wanneer nodig, en supplementinformatie onafhankelijk uit de doeken gedaan.",
    canonical: "/thema/energie",
  },
};
