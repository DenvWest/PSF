import { ThemaPageData } from "@/types/thema";

export const slaapThema: ThemaPageData = {
  slug: "slaap",
  title: "Slaap",
  heroTitle: "Slaap is waar herstel begint",
  heroSubtitle:
    "Als je 's nachts niet oplaadt, draai je overdag op reserves. Herken de signalen, begrijp wat er speelt, en ontdek wat je er concreet aan kunt doen.",
  heroLabel: "THEMA",

  recognition: {
    sectionLabel: "HERKENBAAR?",
    title: "Dit hoor je jezelf misschien zeggen",
    quotes: [
      "Ik slaap wel, maar word moe wakker.",
      "Ik lig 's nachts te malen over werk.",
      "Ik val makkelijk in slaap, maar word om 3 uur wakker.",
      "In het weekend slaap ik uit, maar het helpt niet.",
      "Mijn partner zegt dat ik onrustig slaap.",
    ],
  },

  causes: {
    sectionLabel: "WAT ER SPEELT",
    title: "Waarom je slaap verandert na je 40e",
    intro:
      "Slaapproblemen na je 40e zijn niet alleen een kwestie van slechte gewoonten. Er zijn biologische verschuivingen die je slaapkwaliteit direct beïnvloeden.",
    items: [
      {
        title: "Melatonine daalt",
        description:
          "Je lichaam maakt minder melatonine aan naarmate je ouder wordt. Dit vertaalt zich in langer wakker liggen, lichter slapen en eerder wakker worden.",
        icon: "🌙",
      },
      {
        title: "Cortisol blijft hoog",
        description:
          "Chronische stress houdt je cortisolspiegel verhoogd — precies het hormoon dat 's avonds hoort te dalen. Het resultaat: je lichaam komt niet in de herstelmodus.",
        icon: "📈",
      },
      {
        title: "Magnesiumtekort",
        description:
          "Magnesium is essentieel voor spierontspanning en de regulatie van je zenuwstelsel. Bij een tekort — wat bij 40+ veel voorkomt — blijft je lichaam in een staat van alertheid.",
        icon: "⚡",
      },
      {
        title: "Minder diepe slaap",
        description:
          "De hoeveelheid diepe slaap (fase 3 en 4) neemt af met de leeftijd. Je slaapt misschien 7 uur, maar het herstellend vermogen van die uren is lager.",
        icon: "📉",
      },
    ],
  },

  quickWins: {
    sectionLabel: "DIRECT TOEPASBAAR",
    title: "3 dingen die je vanavond al kunt doen",
    items: [
      {
        title: "Vast slaapritme",
        description:
          "Ga elke dag op hetzelfde tijdstip naar bed en sta op hetzelfde tijdstip op — ook in het weekend. Je circadiaan ritme heeft consistentie nodig, geen inhaalweekenden.",
        icon: "⏰",
      },
      {
        title: "Scherm uit om 21:00",
        description:
          "Blauw licht onderdrukt melatonine. Zet je telefoon op vliegtuigmodus en pak een boek. De eerste drie avonden voelen raar — daarna merk je het verschil.",
        icon: "📱",
      },
      {
        title: "Koele slaapkamer",
        description:
          "Je kerntemperatuur moet dalen om in te slapen. Zet je slaapkamer op 16-18°C. Een te warme kamer is een van de meest onderschatte slaapverstoorders.",
        icon: "🌡️",
      },
    ],
  },

  supplements: {
    sectionLabel: "SUPPLEMENTEN DIE KUNNEN HELPEN",
    title: "Gericht aanvullen — niet zomaar slikken",
    intro:
      "Deze supplementen hebben wetenschappelijke onderbouwing voor slaapverbetering. Klik door naar de gids voor dosering, vormen en onze onafhankelijke productvergelijking.",
    items: [
      {
        name: "Magnesium",
        reason:
          "Magnesium glycinaat ondersteunt spierontspanning en helpt je zenuwstelsel in de parasympathische modus — essentieel om in slaap te vallen en door te slapen.",
        guideLink: "/supplementen/magnesium",
        comparisonLink: "/beste-magnesium",
        icon: "⚡",
      },
      {
        name: "Ashwagandha",
        reason:
          "Verlaagt cortisol en helpt je 's avonds sneller tot rust te komen. Vooral effectief als je slaapprobleem gekoppeld is aan stress of piekeren.",
        guideLink: "/supplementen/ashwagandha",
        comparisonLink: "/beste-ashwagandha",
        icon: "🌿",
      },
      {
        name: "Omega-3",
        reason:
          "EPA en DHA ondersteunen de productie van serotonine, een voorloper van melatonine. Een tekort kan je slaap-waakcyclus verstoren.",
        guideLink: "/supplementen/omega-3",
        comparisonLink: "/beste-omega-3-supplement",
        icon: "🐟",
      },
    ],
  },

  emailGate: {
    sectionLabel: "GRATIS SLAAPGIDS",
    title: "De complete gids voor betere slaap na 40",
    subtitle:
      "Alles wat je moet weten over slaaphygiëne, supplementdosering en ritme-opbouw — in één overzichtelijke PDF.",
    bulletPoints: [
      "Waarom magnesium glycinaat beter werkt dan oxide voor slaap",
      "Een 7-dagen slaapritme-protocol dat je vanavond kunt starten",
      "Doseerschema's per supplement, gebaseerd op klinisch onderzoek",
      "Veelgemaakte fouten die je slaap saboteren zonder dat je het weet",
    ],
    ctaText: "Download de Slaapgids",
    privacyText:
      "Je e-mail wordt alleen gebruikt voor de gids en relevante tips. Geen spam, altijd opzegbaar.",
    successMessage: "Check je inbox — de Slaapgids is onderweg.",
  },

  expertQuote: {
    quote:
      "Slaap is de meest onderschatte interventie voor mannen boven de 40. Geen supplement compenseert voor structureel slaaptekort.",
    author: "Voedingsdeskundige",
    credential: "Orthomoleculair therapeut",
  },

  premiumCta: {
    sectionLabel: "PERSOONLIJK ADVIES",
    title: "Wil je weten wat er bij jou speelt?",
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
      title: "Slaap verbeteren na 40: wat werkt écht?",
      slug: "slaap-verbeteren-40-plus",
      category: "slaap",
    },
    {
      title: "Cortisol verlagen: 5 bewezen methoden",
      slug: "cortisol-verlagen-natuurlijk",
      category: "stress",
    },
  ],

  seo: {
    title:
      "Slaap verbeteren als man 40+ — Oorzaken, tips en supplementen | PerfectSupplement",
    description:
      "Waarom je slaap verandert na je 40e en wat je eraan kunt doen. Concrete leefstijltips, supplementadvies en een gratis slaapgids.",
    canonical: "/thema/slaap",
  },
};
