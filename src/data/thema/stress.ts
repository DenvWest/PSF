import { ThemaPageData } from "@/types/thema";

export const stressThema: ThemaPageData = {
  slug: "stress",
  title: "Stress",
  heroTitle: "Stress na je 40e: het is geen zwakte",
  heroSubtitle:
    "Je functioneert, maar het kost meer dan het zou moeten. Die constante spanning in je schouders, het korte lontje, het gevoel dat je altijd achter de feiten aanloopt — dat is geen karakter, dat is chronische stress.",
  heroLabel: "THEMA",

  recognition: {
    sectionLabel: "HERKENBAAR?",
    title: "Dit hoor je jezelf misschien zeggen",
    quotes: [
      "Alles kost moeite, ook dingen die vroeger vanzelf gingen.",
      "Het voelt geen ‘stress’ — meer een constante ruis op de achtergrond.",
      "Als de werkdag eindigt, ben ik leeg — niet ontspannen.",
      "Mijn partner zegt dat ik korter lont heb, maar ik merk het zelf amper.",
      "Piekeren over dingen die ik rational niet eens spannend vind.",
    ],
  },

  causes: {
    sectionLabel: "WAT ER SPEELT",
    title: "Waarom stress anders voelt na je 40e",
    intro:
      "Je slaapt slechter, hebt meer verantwoordelijkheden en je lichaam reageert anders dan tien jaar geleden. Die sluipende spanning heeft vaak meerdere bronnen — in vier herkenbare categorieën.",
    items: [
      {
        title: "Leefstijl — de basis die scheef staat",
        description:
          "Slechte slaap, eenzijdige voeding en te weinig beweging zijn geen pure gevolgen van stress; ze houden je zenuwstelsel in een alerte modus.",
        icon: "🍽️",
      },
      {
        title: "Mentaal & emotioneel",
        description:
          "Piekeren, controle willen houden en onuitgesproken twijfels vormen stille stressbronnen die mannen zelden meteen zo benoemen.",
        icon: "🧠",
      },
      {
        title: "Werk & omgeving",
        description:
          "Hoge verwachtingen, onduidelijke grenzen en het gevoel onmisbaar te moeten zijn zorgen voor chronische zichtbare (en onzichtbare) druk.",
        icon: "💼",
      },
      {
        title: "Fysiek & hormonaal",
        description:
          "Na je 40e verandert de balans van cortisol, testosteron en herstel — daardoor oog je sneller fysiologisch ‘gespannen’ zonder duidelijke oorzaak.",
        icon: "📊",
      },
    ],
  },

  quickWins: {
    sectionLabel: "DIRECT TOEPASBAAR",
    title: "3 dingen die vandaag al merkbaar kunnen helpen",
    items: [
      {
        title: "Ademhaling (4-7-8)",
        description:
          "Een korte, gecontroleerde ademhaling activeert je parasympathische systeem en kan de acute stresspiek binnen enkele minuten dempen.",
        icon: "🫁",
      },
      {
        title: "Schermvrij de laatste 60 minuten voor bed",
        description:
          "Minder blauw licht betekent betere aankondiging van slaap — en betere slaap is de sterkste hefboom voor een rustiger zenuwstelsel.",
        icon: "📱",
      },
      {
        title: "20 minuten wandelen na de lunch",
        description:
          "Beweegt je lichaam en onderbreekt de mentale stroom van e-mails en besluiten; een simpele reset halverwege de dag.",
        icon: "🚶",
      },
    ],
  },

  supplements: {
    sectionLabel: "SUPPLEMENTEN DIE KUNNEN HELPEN",
    title: "Gericht aanvullen — in combinatie met leefstijl",
    intro:
      "Ondersteun je stressherstel met supplementen die in onderzoek steun vinden, vooral wanneer je voeding of slaap niet optimaal is. Klik door voor dosering, vormen en productvergelijking.",
    items: [
      {
        name: "Ashwagandha",
        reason:
          "Een goed bestudeerd adaptogeen; ondersteunt het verlagen van ervaren stress en helpt wanneer piekeren en nachtrust elkaar versterken.",
        guideLink: "/supplementen/ashwagandha",
        comparisonLink: "/beste-ashwagandha",
        icon: "🌿",
      },
      {
        name: "Magnesium",
        reason:
          "Glycinaat of tauraat helpen spieren en zenuwstelsel te ontspannen; veel mannen 40+ krijgen structureel te weinig binnen via voeding.",
        guideLink: "/supplementen/magnesium",
        comparisonLink: "/beste-magnesium",
        icon: "⚡",
      },
      {
        name: "Omega-3 (EPA/DHA)",
        reason:
          "Ondersteunt hersen- en huidcelmembranen en ontstekingsbalans; relevant bij chronische psychische en lichamelijke belasting.",
        guideLink: "/supplementen/omega-3",
        comparisonLink: "/beste-omega-3-supplement",
        icon: "🐟",
      },
    ],
  },

  emailGate: {
    sectionLabel: "GRATIS STRESSGIDS",
    title: "De compacte gids: stress duiden en stappen kiezen",
    subtitle:
      "Overzicht van herkenning, eenvoudige interventies en wanneer verdieping zinvol is — in één PDF, zonder poespas.",
    bulletPoints: [
      "4 domeinen waar stress bij 40+ vandaan komt (en wat je wél kunt sturen)",
      "Snelle interventies die je binnen 15 minuten kunt proberen",
      "Supplementinformatie op hoofdlijnen, gekoppeld aan onze gidsen",
      "Signalen wanneer professionele of medische begeleiding passend is",
    ],
    ctaText: "Download de Stressgids",
    privacyText:
      "Je e-mail wordt alleen gebruikt voor de gids en relevante tips. Geen spam, altijd opzegbaar.",
    successMessage: "Check je inbox — de Stressgids is onderweg.",
  },

  expertQuote: {
    quote:
      "Chronische stress is geen karaktereigenschap. Het is een fysiologische belasting waar je, stap voor stap, bewuster mee kunt omgaan.",
    author: "Praktische voorlichting",
    credential: "Samengesteld door PerfectSupplement",
  },

  premiumCta: {
    sectionLabel: "PERSOONLIJK ADVIES",
    title: "Wil je weten wat er bij jou speelt?",
    subtitle:
      "De Leefstijlcheck analyseert je stress, slaap, energie, voeding, beweging en herstel in 12 vragen. Je krijgt een persoonlijk Herstelplan met concrete stappen.",
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
      title: "Cortisol verlagen: 5 bewezen methoden",
      slug: "cortisol-verlagen-natuurlijk",
      category: "stress",
    },
    {
      title: "Ademhalingstechnieken die binnen 5 minuten werken",
      slug: "ademhaling-tegen-stress",
      category: "stress",
    },
  ],

  seo: {
    title:
      "Stress bij mannen 40+ herkennen en aanpakken | PerfectSupplement",
    description:
      "Chronische stress herkennen, oorzaken begrijpen en concrete stappen zetten. Leefstijl, supplementen en een gratis gids — onafhankelijk uitgelegd.",
    canonical: "/thema/stress",
  },
};
