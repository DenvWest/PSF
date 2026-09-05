import type { QuestionId } from "@/data/intake-questions";
import type { HomepageProofCounts } from "@/lib/homepage-proof";
import {
  INTAKE_DOMAINS_LABEL,
  INTAKE_QUESTION_COUNT,
  INTAKE_QUESTIONS_LABEL,
} from "@/lib/intake-facts";
import { GUIDES } from "@/data/guides";

export const HOMEPAGE_HERO = {
  eyebrow: "VOOR 30-PLUSSERS",
  headline: "Duizenden supplementen. Maar heb jij er überhaupt één nodig?",
  subheadline:
    "Wij verkopen geen supplementen. We zoeken eerst uit of je er één nodig hebt — en pas daarna welk product goed is.",
  /** De drie regels die de subkop ontlasten: wat we doen, wat de check oplevert, waar het op rust. */
  bullets: [
    "Eerst je leefstijl, dan pas een supplement — en alleen als het daar nog iets aan toevoegt",
    `${INTAKE_QUESTION_COUNT} vragen geven je een score op ${INTAKE_DOMAINS_LABEL} en per supplement een oordeel: kopen, eerst leefstijl, of niet nodig`,
    "Onderbouwd met peer-reviewed onderzoek en Europees goedgekeurde claims, niet met marketing",
  ],
  primaryCta: "Doe de gratis Leefstijlcheck",
  primaryCtaHref: "/intake",
  primaryCtaMicro: "3 minuten · geen account · direct je uitslag",
  /**
   * De hero toont het product zelf: drie vragen uit de check. Bewust drie en
   * niet vier — de vierde kaart duwde de knop op mobiel onder de vouw.
   */
  preview: {
    progressLabel: `Vraag 3 van ${INTAKE_QUESTION_COUNT}`,
    progressPercent: Math.round((3 / INTAKE_QUESTION_COUNT) * 100),
    questionIds: [
      "SLP_QUAL",
      "MOV_CARD",
      "NUT_O3",
    ] as const satisfies readonly QuestionId[],
  },
  widget: {
    eyebrow: "Gratis",
    title: "Leefstijlcheck voor 30-plussers",
    body: `${INTAKE_QUESTIONS_LABEL} · 3 minuten · inzicht op ${INTAKE_DOMAINS_LABEL}.`,
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

/**
 * Het vertrouwensblok. Stond tot 29 augustus als vier icoonkaarten op de
 * pagina; nu drie regels proza onder één belofte, zodat de homepage rustiger
 * leest. De volledige uitleg staat op /methodologie.
 */
export const HOMEPAGE_TRUST = {
  title: "Soms is het antwoord: koop niets.",
  intro:
    "Andere vergelijkingssites beginnen bij het product. Wij beginnen bij de vraag of je het nodig hebt. Wij verkopen geen supplementen en we hebben geen eigen merk. Daardoor kunnen we iets zeggen wat een webshop nooit zegt: dat je in jouw geval beter kunt beginnen bij je slaap, je eten of je herstel — en dat potje kunt laten staan.",
  points: [
    "We noemen alleen effecten waarvoor een Europees goedgekeurde gezondheidsclaim bestaat. Haalt een ingrediënt die drempel niet, dan schrijven we dat op.",
    "Elk product rekenen we om naar de werkzame dosering per dag, zodat potten van verschillende grootte eerlijk naast elkaar liggen.",
    "Een plek in een vergelijking is niet te koop. We ontvangen commissie op sommige links; aan de volgorde verandert dat niets.",
  ],
  cta: "Lees hoe we tot een oordeel komen",
  ctaHref: "/methodologie",
  comparisonsLabel: "Bekijk de vergelijkingen",
  comparisonsHref: "/supplementen",
  affiliateMicro:
    "Sommige links zijn affiliate links. Dat verandert de volgorde niet.",
  affiliateMicroLinkLabel: "Hoe wij verdienen",
  affiliateMicroLinkHref: "/affiliate-disclosure",
} as const;

export const HOMEPAGE_GUIDES_PROMO = {
  title: "Gratis gidsen voor 30-plussers",
  body: `Slaap die minder diep is, energie die eerder opraakt, herstel dat langer duurt — vanaf je dertigste verandert er van alles, vaak geleidelijk. Deze ${GUIDES.length} compacte gidsen geven je grip op wat er speelt. Onderbouwd en praktisch, zonder hype en zonder diagnoses.`,
  cta: "Bekijk de gidsen",
  ctaHref: "/gidsen",
  imageSrc: "/images/home/Gidsen-Compacte-Gidsen.webp",
  imageAlt:
    "Gratis compacte gidsen voor 30-plussers over slaap, stress, energie, herstel, beweging, overgang en testosteron",
} as const;

export const HOMEPAGE_CLOSING = {
  title: "Benieuwd wat voor jou zinvol is?",
  body:
    `${INTAKE_QUESTION_COUNT} vragen over je slaap, stress, voeding, beweging en verbinding. Daarna weet je waar je staat — en of aanvullen in jouw geval het overwegen waard is.`,
} as const;

/**
 * Wat er over is van het oude Leefstijlcheck-blok op de homepage: de sectie is
 * opgegaan in de hero, maar `FloatingLeefstijlcheckCta` (blog, pijlerpagina's)
 * leest deze domeinlijst nog. `leefstijl` is een vragenbak zonder eigen score
 * en hoort er daarom niet in.
 */
export const HOMEPAGE_LIFESTYLE = {
  scoredCategoryIds: [
    "slaap",
    "energie",
    "stress",
    "verbinding",
    "voeding",
    "beweging",
    "herstel",
  ] as const,
} as const;
