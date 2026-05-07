import type { BlogArtikel } from "@/types/blog";

const placeholderSectie = {
  type: "tekst" as const,
  titel: "Volledige inhoud",
  tekst:
    "De uitgebreide gids staat op de hoofdpagina van dit onderwerp op PerfectSupplement. Gebruik het menu of ga naar de URL zonder /blog/ voor het volledige artikel met tabellen en vergelijkingen.",
};

const BRONNEN_OMEGA: string[] = [
  "Mozaffarian D, Wu JH. Omega-3 fatty acids and cardiovascular disease: effects on lipid risk markers and pathophysiologic mechanisms. J Am Coll Cardiol. 2011;58(20):2047-2067.",
  "Kris-Etherton PM et al. Omega-3 fatty acids and cardiovascular disease — AHA science advisory. Circulation. landmark guidance context.",
  "Swanson D, Block R, Mousa SA. Omega-3 fatty acids EPA and DHA biomedical aspects. Adv Nutr. 2012;3(3):257-262.",
  "Calder PC. n-3 PUFA and inflammation: from membrane to nucleus and from bench to bedside. Proc Nutr Soc. review mechanisms.",
  "EFSA Panel on Dietetic Products Nutrition Allergies. Scientific Opinion DHA EPA claims cardiovascular health dossier lineage EU register.",
  "Abdelhamid AS et al. Omega-3 fatty acids coronary heart disease update Cochrane Database Syst Rev meta-analytic lineage.",
];

const BRONNEN_MAGNESIUM: string[] = [
  "Schwalfenberg GK, Genuis SJ. The importance magnesium clinical healthcare. Scientifica (Cairo). 2017;2017:4179326.",
  "EFSA authorised health claims magnesium contributes normal nervous system muscle function — EU Nutrition Health Claims Register reference.",
  "NIH Office of Dietary Supplements. Magnesium — Health Professional Fact Sheet (forms bioavailability supplementation context).",
  "Grober U et al. Myth or Reality — Transdermal Magnesium?. Magnes Res. systematic narrative supplement-form evidence.",
  "Fiorentini D et al. Magnesium biochemical nutrition clinical relevance. Nutrients. mineral physiology reviews.",
  "Institute of Medicine (US) Dietary Reference Intakes chapter magnesium — DRV reference frames.",
];

const BRONNEN_SUPPLEMENT_KIEZEN: string[] = [
  "European Parliament Council. Regulation EC 1924/2006 nutrition health claims EU legal framework labeling.",
  "US FDA CFR Title 21 Part 111 CGMP Manufacturing dietary supplements quality standard reference.",
  "NIH Office of Dietary Supplements introduction dietary supplements fact sheets methodological consumer science context.",
  "Gillespie JA, Chae JM. Herbal supplement manufacturing quality variability clinical pharmacology viewpoint.",
  "Starr RR. Assessment dietary supplement safety methodological toxicology viewpoints.",
  "Kantor ED et al. Trends dietary supplement usage US methodological NHANES supplement surveillance context.",
];

/** Zeven root-level supplement-gidsen: zichtbaar in blog/categorieën; slugs komen overeen met bestaande routes. */
export const cornerstoneSupplementenArtikelen: BlogArtikel[] = [
  {
    slug: "omega-3-vergelijken",
    pad: "/omega-3-vergelijken",
    categorie: "supplementen",
    titel: "Omega-3 supplementen vergelijken",
    heroIntro:
      "Populaire omega-3 supplementen naast elkaar op EPA/DHA-gehalte, prijs per dag en kwaliteitsindicatoren.",
    leestijd: "11 min",
    gepubliceerdOp: "2025-02-15",
    secties: [placeholderSectie],
    samenvatting:
      "Vergelijkt omega-3 op werkzame mg’s, prijs per dag en kwaliteitssignalen — zie de hoofdpagina voor het volledige overzicht.",
    cornerstoneLink: {
      label: "Supplementen in de kennisbank",
      href: "/blog/supplementen",
    },
    gerelateerdeSluggen: [
      "waar-let-je-op-bij-omega-3",
      "beste-omega-3-supplement",
      "wat-is-omega-3",
    ],
    metaTitle: "Omega-3 supplementen vergelijken op EPA/DHA en prijs per dag",
    metaDescription:
      "Populaire omega-3 supplementen naast elkaar op EPA/DHA-gehalte, prijs per dag en kwaliteitsindicatoren.",
    keywords: ["omega-3 vergelijken", "EPA DHA", "omega-3 supplementen"],
    bronnen: BRONNEN_OMEGA,
  },
  {
    slug: "beste-omega-3-supplement",
    pad: "/beste-omega-3-supplement",
    categorie: "supplementen",
    titel: "Beste omega-3 supplement",
    heroIntro:
      "De beste keuzes voor verschillende situaties: dagelijks gebruik, budget en premium kwaliteit.",
    leestijd: "15 min",
    gepubliceerdOp: "2025-02-01",
    secties: [placeholderSectie],
    samenvatting:
      "Keuzehulp op basis van EPA/DHA, gebruik en prijs per dag — volledige pagina bevat topkeuzes en uitleg.",
    cornerstoneLink: {
      label: "Supplementen in de kennisbank",
      href: "/blog/supplementen",
    },
    gerelateerdeSluggen: [
      "omega-3-vergelijken",
      "waar-let-je-op-bij-omega-3",
      "omega-3-concentratie-energie",
    ],
    metaTitle: "Beste omega-3 supplement: keuzehulp op inhoud en prijs per dag",
    metaDescription:
      "De beste keuzes voor verschillende situaties: dagelijks gebruik, budget en premium kwaliteit.",
    keywords: ["beste omega-3", "omega-3 keuzehulp", "EPA DHA"],
    bronnen: BRONNEN_OMEGA,
  },
  {
    slug: "wat-is-omega-3",
    pad: "/wat-is-omega-3",
    categorie: "supplementen",
    titel: "Wat is omega-3?",
    heroIntro:
      "Een introductie op de rol van omega-3 vetzuren in het lichaam en waarom de bron ertoe doet.",
    leestijd: "8 min",
    gepubliceerdOp: "2025-03-10",
    secties: [placeholderSectie],
    samenvatting:
      "Basis over EPA, DHA en supplementen — de hoofdpagina bevat de volledige uitleg en vervolgstappen.",
    cornerstoneLink: {
      label: "Supplementen in de kennisbank",
      href: "/blog/supplementen",
    },
    gerelateerdeSluggen: [
      "waar-let-je-op-bij-omega-3",
      "omega-3-vergelijken",
      "omega-3-concentratie-energie",
    ],
    metaTitle: "Wat is omega-3? EPA, DHA en supplementen uitgelegd",
    metaDescription:
      "Een introductie op de rol van omega-3 vetzuren in het lichaam en waarom de bron ertoe doet.",
    keywords: ["wat is omega-3", "EPA DHA", "omega-3 vetzuren"],
    bronnen: BRONNEN_OMEGA,
  },
  {
    slug: "waar-let-je-op-bij-omega-3",
    pad: "/waar-let-je-op-bij-omega-3",
    categorie: "supplementen",
    titel: "Waar let je op bij omega-3?",
    heroIntro:
      "Kwaliteit, dosering en zuiverheid — wat er werkelijk toe doet bij de keuze van een omega-3 supplement.",
    leestijd: "12 min",
    gepubliceerdOp: "2025-03-05",
    secties: [placeholderSectie],
    samenvatting:
      "Criteria om omega-3 eerlijk te vergelijken — zie de hoofdgids voor checklists en details.",
    cornerstoneLink: {
      label: "Supplementen in de kennisbank",
      href: "/blog/supplementen",
    },
    gerelateerdeSluggen: [
      "wat-is-omega-3",
      "omega-3-vergelijken",
      "beste-omega-3-supplement",
    ],
    metaTitle: "Omega-3 kiezen: waar let je op bij EPA, DHA en kwaliteit?",
    metaDescription:
      "Kwaliteit, dosering en zuiverheid — wat er werkelijk toe doet bij de keuze van een omega-3 supplement.",
    keywords: ["omega-3 kiezen", "EPA DHA dosering", "omega-3 kwaliteit"],
    bronnen: BRONNEN_OMEGA,
  },
  {
    slug: "magnesium-vergelijken",
    pad: "/magnesium-vergelijken",
    categorie: "supplementen",
    titel: "Magnesium vergelijken",
    heroIntro:
      "Vormen, doseringen en toepassingen — van magnesiumcitraat tot bisglycinaat.",
    leestijd: "9 min",
    gepubliceerdOp: "2025-01-20",
    secties: [placeholderSectie],
    samenvatting:
      "Overzicht van vormen en elementair magnesium — de hoofdpagina bevat tabellen en uitleg.",
    cornerstoneLink: {
      label: "Supplementen in de kennisbank",
      href: "/blog/supplementen",
    },
    gerelateerdeSluggen: [
      "beste-magnesium",
      "magnesium-en-slaapkwaliteit",
      "supplement-kiezen-waar-op-letten",
    ],
    metaTitle: "Magnesium vergelijken: vormen en elementaire dosering",
    metaDescription:
      "Vormen, doseringen en toepassingen — van magnesiumcitraat tot bisglycinaat.",
    keywords: ["magnesium vergelijken", "magnesium vormen", "elementair magnesium"],
    bronnen: BRONNEN_MAGNESIUM,
  },
  {
    slug: "beste-magnesium",
    pad: "/beste-magnesium",
    categorie: "supplementen",
    titel: "Beste magnesium supplement",
    heroIntro:
      "Welke magnesiumvorm werkt het best voor jouw doel? Een overzicht van de meest relevante varianten.",
    leestijd: "13 min",
    gepubliceerdOp: "2025-01-10",
    secties: [placeholderSectie],
    samenvatting:
      "Keuzehulp per doel en vorm — de hoofdpagina toont topkeuzes en criteria.",
    cornerstoneLink: {
      label: "Supplementen in de kennisbank",
      href: "/blog/supplementen",
    },
    gerelateerdeSluggen: [
      "magnesium-vergelijken",
      "magnesium-en-slaapkwaliteit",
      "supplement-kiezen-waar-op-letten",
    ],
    metaTitle: "Beste magnesium supplement: vormen en gebruik vergeleken",
    metaDescription:
      "Welke magnesiumvorm werkt het best voor jouw doel? Een overzicht van de meest relevante varianten.",
    keywords: ["beste magnesium", "magnesium bisglycinaat", "magnesium citraat"],
    bronnen: BRONNEN_MAGNESIUM,
  },
  {
    slug: "supplement-kiezen-waar-op-letten",
    pad: "/supplement-kiezen-waar-op-letten",
    categorie: "supplementen",
    titel: "Supplement kiezen: waar op letten?",
    heroIntro:
      "Kwaliteit herkennen: dosering, opneembaarheid, zuiverheid en transparantie — zonder marketingpraat.",
    leestijd: "14 min",
    gepubliceerdOp: "2026-03-20",
    secties: [placeholderSectie],
    samenvatting:
      "Kader om supplementen te beoordelen — de hoofdgids werkt dit verder uit.",
    cornerstoneLink: {
      label: "Supplementen in de kennisbank",
      href: "/blog/supplementen",
    },
    gerelateerdeSluggen: [
      "magnesium-vergelijken",
      "waar-let-je-op-bij-omega-3",
      "ashwagandha-werking-mannen",
    ],
    metaTitle: "Supplement kiezen: waar op letten? Dosering, vorm, transparantie",
    metaDescription:
      "Kwaliteit herkennen: dosering, opneembaarheid, zuiverheid en transparantie — zonder marketingpraat.",
    keywords: ["supplement kiezen", "supplement kwaliteit", "etiket supplement"],
    bronnen: BRONNEN_SUPPLEMENT_KIEZEN,
  },
];
