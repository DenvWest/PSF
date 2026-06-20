import { ThemaPageData } from "@/types/thema";
import { INTAKE_CTA, INTAKE_DELIVERABLE } from "@/lib/intake-product-copy";

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
          "Slechte slaap, eenzijdige voeding en te weinig beweging zijn geen pure gevolgen van stress; ze houden je zenuwstelsel in een alerte modus. Stress en slaap vormen een vicieuze cirkel die zichzelf versterkt.",
        icon: "🍽️",
        source: "Mikkelsen et al., Maturitas, 2017",
      },
      {
        title: "Mentaal & emotioneel",
        description:
          "Piekeren, controle willen houden en onuitgesproken twijfels vormen stille stressbronnen die mannen zelden meteen zo benoemen. Chronische psychologische stress activeert dezelfde HPA-as als fysieke bedreigingen.",
        icon: "🧠",
        source: "Herman et al., Compr Physiol, 2016",
      },
      {
        title: "Werk & omgeving",
        description:
          "Hoge verwachtingen, onduidelijke grenzen en het gevoel onmisbaar te moeten zijn zorgen voor chronische druk. Een hoge cortisol-testosteron ratio is een endocrinologische marker van chronische werkstress.",
        icon: "💼",
        source: "Smith et al., Circulation (Caerphilly Study), 2005",
      },
      {
        title: "Fysiek & hormonaal",
        description:
          "Na je 40e verandert de balans van cortisol, testosteron en herstel. Cortisol en testosteron concurreren om dezelfde bouwsteen (pregnenolon) — chronische stress kiest voor cortisol boven testosteron.",
        icon: "📊",
        source:
          "Cumming et al., J Clin Endocrinol Metab, 1983; Baulieu, Psychoneuroendocrinology, 1998",
      },
    ],
  },

  scienceBlock: {
    sectionLabel: "WAT ONDERZOEK LAAT ZIEN",
    title: "De wetenschap achter chronische stress",
    intro: "Geen meningen, maar meetbare feiten uit peer-reviewed onderzoek.",
    facts: [
      {
        claim: "Gecontroleerde ademhaling (langzame uitademing) activeert de nervus vagus en verlaagt hartslag en cortisol binnen 5 minuten.",
        source: "Zaccaro et al., Front Hum Neurosci, 2018 (systematic review)",
        pubmedId: "30245619",
      },
      {
        claim: "Eén 5-minuten sessie 'fysiologische zucht' (dubbele inademing + lange uitademing) verbetert stemming effectiever dan meditatie.",
        source: "Huberman et al., Cell Rep Med, 2023 (RCT)",
        pubmedId: "36630953",
      },
      {
        claim:
          "Een RCT met een ashwagandha‑wortelextract rapporteerde na 8 weken andere serum‑cortisolwaarden dan placebo en hogere ingeschatte slaapscores bij sommige deelnemers — slaap‑ of stressclaims op het EU‑label ontbreken nog (EFSA on‑hold).",
        source: "Lopresti et al., Medicine, 2019 (RCT, n=60)",
        pubmedId: "32021735",
      },
      {
        claim: "Een hoge cortisol-testosteron ratio is een onafhankelijke risicofactor voor hart- en vaatziekten bij mannen 45-59 jaar.",
        source: "Smith et al., Circulation (Caerphilly Study, n=2512), 2005",
        pubmedId: "16009799",
      },
      {
        claim: "95% van de serotonine in het lichaam wordt geproduceerd in de darm — chronische stress verstoort dit via de vaguszenuw.",
        source: "Yano et al., Cell, 2015",
        pubmedId: "25860609",
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
          "Ashwagandha staat bij EFSA op de on‑holdlijst voor claims: onderzoek suggereert soms andere stressperceptie of stressmarkers, maar daar bestaat géén afgeronde EU‑health claim voor. Vergelijk extracts op inhoud — gebruik op eigen risico.",
        guideLink: "/supplementen/ashwagandha",
        comparisonLink: "/beste/ashwagandha",
        icon: "🌿",
      },
      {
        name: "Magnesium",
        reason:
          "Magnesium draagt bij tot de normale werking van het zenuwstelsel en tot een normale psychologische functie (EFSA). Glycinaat of tauraat zijn praktisch vaak gekozen vormen; velen krijgen structureel relatief weinig magnesium binnen via voeding.",
        guideLink: "/supplementen/magnesium",
        comparisonLink: "/beste/magnesium",
        icon: "⚡",
      },
      {
        name: "Omega-3 (EPA/DHA)",
        reason:
          "EPA en DHA dragen bij tot de normale werking van het hart; DHA draagt bij tot het instandhouden van normale hersenfunctie — passend als je structureel weinig vette vis eet (geen EU‑claim hier op ‘minder ontsteking’ of energie als labelzin).",
        guideLink: "/supplementen/omega-3",
        comparisonLink: "/beste/omega-3-supplement",
        icon: "🐟",
      },
      {
        name: "Zink",
        reason:
          "Zink draagt bij tot de normale eiwitsynthese en tot een normale werking van het immuunsysteem; het speelt daarnaast een rol bij talloze enzymreacties — chronisch hoge spanning kan meer zink‑verplaatsing of ‑verlies met zich meebrengen.",
        guideLink: "/supplementen/zink",
        comparisonLink: "/beste/zink",
        icon: "🛡️",
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
    ctaText: "Download ter inspiratie",
    privacyText:
      "Je e-mail wordt alleen gebruikt voor de gids en relevante tips. Geen spam, altijd opzegbaar.",
    successMessage: "Check je inbox — de Stressgids is onderweg.",
  },

  pillarPage: {
    href: "/stress-verminderen-man",
    title: "De complete gids: stress verminderen na 40",
    description:
      "Van de HPA-as en cortisol-testosteron balans tot een concreet vierwekenplan. Alles wat op deze pagina in het kort staat, uitgewerkt met bronnen en context.",
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
      `De Leefstijlcheck analyseert je stress, slaap, energie, voeding, beweging en herstel in 15 vragen. ${INTAKE_DELIVERABLE.premiumSubtitleSuffix}`,
    features: [
      "15 vragen, 3 minuten",
      "Scores op 6 leefstijldomeinen",
      INTAKE_DELIVERABLE.premiumFeatureBullet,
      INTAKE_CTA.supplementFeature,
    ],
    ctaText: "Start de Leefstijlcheck",
    ctaLink: "/intake",
    note: "Gratis · Geen account nodig · Anoniem verwerkt",
  },

  relatedArticles: [
    {
      title:
        "Cortisol benaderen: vijf leefstijlroutes uit onderzoek, zonder medicatie",
      slug: "cortisol-verlagen-natuurlijk",
      category: "stress",
    },
    {
      title: "Ademhalingstechnieken die binnen 5 minuten werken",
      slug: "ademhaling-tegen-stress",
      category: "stress",
    },
    {
      title: "Grenzen stellen op werk zonder je carrière te saboteren",
      slug: "stress-werk-grenzen-stellen",
      category: "stress",
    },
  ],

  leesOok: {
    sectionLabel: "MEER NAVIGATIE",
    title: "Lees ook",
    items: [
      {
        context:
          "Beter slapen is vaak de snelste hefboom op je stresssysteem: het thema slaap vult aan wat hier op hoofdlijnen staat (ritme, licht, supplementkeuze).",
        href: "/gids/slaap",
        label: "Thema: slaap (ritme, cortisol, herstel)",
      },
      {
        context:
          "KSM-66 en vergelijkbare extracten: wat onderzoek zegt over cortisol, stemming en nachtrust — met productvergelijking.",
        href: "/beste/ashwagandha",
        label: "Beste ashwagandha-supplementen vergeleken",
      },
      {
        context:
          "Eerlijke top picks op vorm, elementair gehalte en prijs per dag, relevant voor onrust en fysieke spanning.",
        href: "/beste/magnesium",
        label: "Beste magnesium-supplementen vergeleken",
      },
      {
        context:
          "Volledige uitleg over adaptogenen, wanneer ashwagandha wél of níét past, en praktische dosering.",
        href: "/supplementen/ashwagandha",
        label: "Ashwagandhagids",
      },
      {
        context:
          "Glycinaat, tauraat, citraat: welke vorm kies je bij piekeren, gespannen spieren of slappe nachten?",
        href: "/supplementen/magnesium",
        label: "Magnesiumgids",
      },
      {
        context:
          "Functioneer je wel, maar kost alles meer dan het zou moeten? Herken de signalen van chronische stress.",
        href: "/profiel/stressdrager",
        label: "Chronische stress? Check of je een Stressdrager bent →",
      },
      {
        context:
          "Hoe wij supplementen onafhankelijk beoordelen: criteria, weging en werkwijze.",
        href: "/methodologie",
        label: "Hoe wij supplementen beoordelen →",
      },
    ],
  },

  seo: {
    title:
      "Stress bij mannen 40+ herkennen en aanpakken | PerfectSupplement",
    description:
      "Chronische stress herkennen, oorzaken begrijpen en concrete stappen zetten. Leefstijl, supplementen en een gratis gids — onafhankelijk uitgelegd.",
    canonical: "/gids/stress",
  },
};
