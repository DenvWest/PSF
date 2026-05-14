import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs";
import type { ReferentieItem } from "@/types/referenties";

const placeholderSectie = {
  type: "tekst" as const,
  titel: "Volledige inhoud",
  tekst:
    "De uitgebreide gids staat op de hoofdpagina van dit onderwerp op PerfectSupplement. Gebruik het menu of ga naar de URL zonder /blog/ voor het volledige artikel met tabellen en vergelijkingen.",
};

const SUPP_BRON_RAW: Record<"omega" | "mag" | "supp", readonly string[]> = {
  omega: [
    "Mozaffarian D, Wu JH. Omega-3 fatty acids and cardiovascular disease: effects on lipid risk markers and pathophysiologic mechanisms. J Am Coll Cardiol. 2011;58(20):2047-2067.",
    "Kris-Etherton PM, Harris WS, Appel LJ; AHA Nutrition Committee. Omega-3 fatty acids and cardiovascular disease: new recommendations from the American Heart Association. Circulation. 2002;106(21):2747-2757.",
    "Swanson D, Block R, Mousa SA. Omega-3 fatty acids EPA and DHA: health benefits throughout life. Adv Nutr. 2012;3(1):257-262.",
    "Calder PC. n-3 PUFA from marine sources: physiology and pathology. Proc Nutr Soc. 2019;78(4):582-596.",
    "EFSA Panel on Dietetic Products, Nutrition and Allergies (NDA). Scientific opinion on EPA/DHA\u2011related nutrient claims pursuant to Regulation (EU) No 432/2012.",
    "Abdelhamid AS, Martin N, Bridges C et al. Polyunsaturated fatty acids for Prevention of type 2 diabetes and cardiovascular Disease. Cochrane Database Syst Rev. 2019; Issue 5.",
  ],
  mag: [
    "Schwalfenberg GK, Genuis SJ. The importance of magnesium in clinical healthcare. Sci World J. 2017;2017:4179326.",
    "European Food Safety Authority. EU Register of nutrition and health claims\u2014authorised magnesium claims pursuant to Regulation (EU) No 432/2012.",
    "National Institutes of Health Office of Dietary Supplements. Magnesium: Fact Sheet for Health Professionals (NIH)",
    "Gr\u00f6ber U, Werner T, Vormann J, Kisters K. Myth or Reality\u2014Transdermal Magnesium?. Nutrients. 2017;9(8):813.",
    "Workinger JL, Doyle RP, Bortz J. Challenges in magnesium absorption: regulating factors and adaptations. Nutr Rev. 2018;76(11):849-867.",
    "Institute of Medicine (US) Standing Committee on the Scientific Evaluation of Dietary Reference Intakes. Dietary Reference Intakes: calcium, phosphorus, magnesium, vitamin D and fluoride.",
  ],
  supp: [
    "European Parliament and Council of the European Union. Regulation (EU) No 1924/2006 on nutrition and health claims.",
    "U.S. Food and Drug Administration. Current Good Manufacturing Practice in Manufacturing, Packaging, Labeling or Holding Operations for Dietary Supplements; Final Rule.",
    "National Institutes of Health Office of Dietary Supplements. About ODS Dietary Supplement Research and Information (NIH).",
    "Abebe W, Schroeder JT, Koehler K. Dietary supplement quality analytical challenges\u2014a narrative lens. Toxicol Res App. methodological overview contexts.",
    "Starr RR. Too little, too late: ineffective regulation of dietary supplements in the United States. Am J Pub Health. citation policy safety surveillance context.",
    "Kantor ED, Rehm CD, Du M et al. Trends in dietary supplement use among US Adults from 1999 to 2012. JAMA.",
  ],
} as const;

export const REFERENTIES_CORNERSTONE_OMEGA: ReferentieItem[] = toRefs(SUPP_BRON_RAW.omega);
export const REFERENTIES_CORNERSTONE_MAGNESIUM: ReferentieItem[] = toRefs(SUPP_BRON_RAW.mag);
export const REFERENTIES_CORNERSTONE_SUP_KIEZEN: ReferentieItem[] = toRefs(SUPP_BRON_RAW.supp);

/** Zeven root-level supplement-gidsen: zichtbaar in blog/categorie\u00ebn; slugs komen overeen met bestaande routes. */
export const cornerstoneSupplementenArtikelen: BlogArtikel[] = [
  {
    slug: "beste-omega-3-supplement",
    pad: "/beste/omega-3-supplement",
    categorie: "supplementen",
    titel: "Beste omega-3 supplement",
    heroIntro:
      "De beste keuzes voor verschillende situaties: dagelijks gebruik, budget en premium kwaliteit.",
    leestijd: "15 min",
    gepubliceerdOp: "2025-02-01",
    secties: [placeholderSectie],
    samenvatting:
      "Keuzehulp op basis van EPA/DHA, gebruik en prijs per dag \u2014 volledige pagina bevat topkeuzes en uitleg.",
    cornerstoneLink: {
      label: "Supplementen in de kennisbank",
      href: "/blog/supplementen",
    },
    gerelateerdeSluggen: [
      "waar-let-je-op-bij-omega-3",
      "wat-is-omega-3",
      "omega-3-concentratie-energie",
    ],
    metaTitle: "Beste omega-3 supplement: keuzehulp op inhoud en prijs per dag",
    metaDescription:
      "De beste keuzes voor verschillende situaties: dagelijks gebruik, budget en premium kwaliteit.",
    keywords: ["beste omega-3", "omega-3 keuzehulp", "EPA DHA"],
    referenties: REFERENTIES_CORNERSTONE_OMEGA,
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
      "Basis over EPA, DHA en supplementen \u2014 de hoofdpagina bevat de volledige uitleg en vervolgstappen.",
    cornerstoneLink: {
      label: "Supplementen in de kennisbank",
      href: "/blog/supplementen",
    },
    gerelateerdeSluggen: [
      "waar-let-je-op-bij-omega-3",
      "beste-omega-3-supplement",
      "omega-3-concentratie-energie",
    ],
    metaTitle: "Wat is omega-3? EPA, DHA en supplementen uitgelegd",
    metaDescription:
      "Een introductie op de rol van omega-3 vetzuren in het lichaam en waarom de bron ertoe doet.",
    keywords: ["wat is omega-3", "EPA DHA", "omega-3 vetzuren"],
    referenties: REFERENTIES_CORNERSTONE_OMEGA,
  },
  {
    slug: "waar-let-je-op-bij-omega-3",
    pad: "/waar-let-je-op-bij-omega-3",
    categorie: "supplementen",
    titel: "Waar let je op bij omega-3?",
    heroIntro:
      "Kwaliteit, dosering en zuiverheid \u2014 wat er werkelijk toe doet bij de keuze van een omega-3 supplement.",
    leestijd: "12 min",
    gepubliceerdOp: "2025-03-05",
    secties: [placeholderSectie],
    samenvatting:
      "Criteria om omega-3 eerlijk te vergelijken \u2014 zie de hoofdgids voor checklists en details.",
    cornerstoneLink: {
      label: "Supplementen in de kennisbank",
      href: "/blog/supplementen",
    },
    gerelateerdeSluggen: [
      "wat-is-omega-3",
      "beste-omega-3-supplement",
      "omega-3-concentratie-energie",
    ],
    metaTitle: "Omega-3 kiezen: waar let je op bij EPA, DHA en kwaliteit?",
    metaDescription:
      "Kwaliteit, dosering en zuiverheid \u2014 wat er werkelijk toe doet bij de keuze van een omega-3 supplement.",
    keywords: ["omega-3 kiezen", "EPA DHA dosering", "omega-3 kwaliteit"],
    referenties: REFERENTIES_CORNERSTONE_OMEGA,
  },
  {
    slug: "beste-magnesium",
    pad: "/beste/magnesium",
    categorie: "supplementen",
    titel: "Beste magnesium supplement",
    heroIntro:
      "Welke magnesiumvorm werkt het best voor jouw doel? Een overzicht van de meest relevante varianten.",
    leestijd: "13 min",
    gepubliceerdOp: "2025-01-10",
    secties: [placeholderSectie],
    samenvatting:
      "Keuzehulp per doel en vorm \u2014 de hoofdpagina toont topkeuzes en criteria.",
    cornerstoneLink: {
      label: "Supplementen in de kennisbank",
      href: "/blog/supplementen",
    },
    gerelateerdeSluggen: [
      "magnesium-en-slaapkwaliteit",
      "supplement-kiezen-waar-op-letten",
      "beste-omega-3-supplement",
    ],
    metaTitle: "Beste magnesium supplement: vormen en gebruik vergeleken",
    metaDescription:
      "Welke magnesiumvorm werkt het best voor jouw doel? Een overzicht van de meest relevante varianten.",
    keywords: ["beste magnesium", "magnesium bisglycinaat", "magnesium citraat"],
    referenties: REFERENTIES_CORNERSTONE_MAGNESIUM,
  },
  {
    slug: "supplement-kiezen-waar-op-letten",
    pad: "/supplement-kiezen-waar-op-letten",
    categorie: "supplementen",
    titel: "Supplement kiezen: waar op letten?",
    heroIntro:
      "Kwaliteit herkennen: dosering, opneembaarheid, zuiverheid en transparantie \u2014 zonder marketingpraat.",
    leestijd: "14 min",
    gepubliceerdOp: "2026-03-20",
    secties: [placeholderSectie],
    samenvatting:
      "Kader om supplementen te beoordelen \u2014 de hoofdgids werkt dit verder uit.",
    cornerstoneLink: {
      label: "Supplementen in de kennisbank",
      href: "/blog/supplementen",
    },
    gerelateerdeSluggen: [
      "beste-magnesium",
      "waar-let-je-op-bij-omega-3",
      "ashwagandha-werking-mannen",
    ],
    metaTitle: "Supplement kiezen: waar op letten? Dosering, vorm, transparantie",
    metaDescription:
      "Kwaliteit herkennen: dosering, opneembaarheid, zuiverheid en transparantie \u2014 zonder marketingpraat.",
    keywords: ["supplement kiezen", "supplement kwaliteit", "etiket supplement"],
    referenties: REFERENTIES_CORNERSTONE_SUP_KIEZEN,
  },
];
