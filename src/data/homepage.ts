import type { QuestionId } from "@/data/intake-questions";
import type { HomepageProofCounts } from "@/lib/homepage-proof";

export const HOMEPAGE_HERO = {
  eyebrow: "VOOR MANNEN 40+",
  headline: "Welke supplementen zijn voor jou zinvol — en welke niet",
  subheadline:
    "Per categorie vergelijken we de vorm, de werkzame dagdosering en de prijs per dag. We zeggen het hardop als een product de Europese claimdrempel niet haalt — en als je er beter aan doet eerst je leefstijl aan te pakken.",
  bullets: [
    "Vorm, elementaire dosering en prijs per dag naast elkaar",
    "Alleen effecten waarvoor een Europees goedgekeurde claim bestaat",
    "Geen ranglijst op commissie — een plek is niet te koop",
  ],
  primaryCta: "Bekijk de vergelijkingen",
  primaryCtaHref: "/supplementen",
  secondaryCta: "Doe de check (3 min)",
  secondaryCtaHref: "/intake",
  affiliateMicro:
    "Sommige links zijn affiliate links. Dat verandert de volgorde niet.",
  affiliateMicroLinkLabel: "Hoe wij verdienen",
  affiliateMicroLinkHref: "/affiliate-disclosure",
  widget: {
    eyebrow: "Gratis",
    title: "Leefstijlcheck voor mannen 40+",
    body: "15 vragen · 3 minuten · leefstijl-inzicht op 7 domeinen.",
    cta: "Start direct",
  },
} as const;

export const HOMEPAGE_PROOF = {
  ariaLabel: "Wat we tot nu toe hebben nagelopen",
  /** `key` verwijst naar een veld van `HomepageProofCounts`; het getal komt uit de data. */
  items: [
    { key: "comparisons", label: "vergelijkingen" },
    { key: "products", label: "producten beoordeeld" },
    { key: "approvedClaims", label: "goedgekeurde EU-claims" },
    { key: "peerReviewedSources", label: "peer-reviewed bronnen" },
  ],
} as const satisfies {
  ariaLabel: string;
  items: readonly { key: keyof HomepageProofCounts; label: string }[];
};

export const HOMEPAGE_METHOD = {
  title: "Hoe wij tot een oordeel komen",
  intro:
    "Wij verkopen zelf niets. Wat een vergelijking op deze site bepaalt, staat vast voordat we naar een merk kijken.",
  cta: "Lees de methodologie",
  ctaHref: "/methodologie",
  cards: [
    {
      label: "Europese claimdrempel",
      description:
        "We noemen alleen effecten waarvoor een goedgekeurde EU-gezondheidsclaim bestaat. Haalt een ingrediënt die drempel niet, dan zeggen we dat.",
    },
    {
      label: "Prijs per werkzame dagdosis",
      description:
        "Elk product rekenen we om naar de elementaire dosering per dag. Zo worden potten van verschillende grootte vergelijkbaar.",
    },
    {
      label: "Geen betaalde plaatsingen",
      description:
        "Sponsors kunnen geen positie kopen. We ontvangen commissie op sommige links; de volgorde verandert daar niet door.",
    },
    {
      label: "Datum van herziening",
      description:
        "Elke vergelijking draagt de datum waarop hij voor het laatst is nagelopen, boven aan de pagina.",
    },
  ],
} as const;

export const HOMEPAGE_GUIDES_PROMO = {
  title: "Gratis gidsen voor mannen 40+",
  body:
    "Slaap die minder diep is, energie die eerder opraakt, herstel dat langer duurt — na je 40e verandert er van alles, vaak geleidelijk. Deze vijf compacte gidsen over slaap, stress, energie, herstel en testosteron geven je grip op wat er speelt. Onderbouwd en praktisch, zonder hype en zonder diagnoses.",
  secondaryLine:
    "Nog niet zeker welk thema bij jou past? Doe eerst de Leefstijlcheck. In 3 minuten weet je waar je het beste kunt beginnen.",
  cta: "Bekijk de gidsen",
  ctaHref: "/gidsen",
  imageSrc: "/images/home/Gidsen-Compacte-Gidsen.webp",
  imageAlt:
    "Gratis compacte gidsen voor mannen 40+: slaap, stress, energie, herstel en testosteron",
} as const;

export const HOMEPAGE_LIFESTYLE = {
  sectionId: "leefstijlcheck",
  title: "Twijfel je of je het überhaupt nodig hebt?",
  subtitle:
    "De Leefstijlcheck geeft per supplement een persoonlijk oordeel: kopen, eerst je leefstijl aanpakken, of niet nodig. 15 vragen, 3 minuten, gratis.",
  cta: "Start de Leefstijlcheck (3 min)",
  ctaHref: "/intake",
  progressLabel: "Vraag 3 van 15",
  progressPercent: 20,
  /**
   * De chips tonen de domeinen waarop de check scoort — niet alle
   * vraag-categorieën. `leefstijl` is een vragenbak zonder eigen score, dus die
   * hoort hier niet: anders belooft de pagina een domein dat je in je resultaat
   * nooit terugziet.
   */
  scoredCategoryIds: [
    "slaap",
    "energie",
    "stress",
    "verbinding",
    "voeding",
    "beweging",
    "herstel",
  ] as const,
  previewQuestionIds: [
    "SLP_QUAL",
    "NRG_PATN",
    "STR_FREQ",
    "MOV_STR",
  ] as const satisfies readonly QuestionId[],
} as const;
