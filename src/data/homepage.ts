import type { QuestionId } from "@/data/intake-questions";
import { DISCLAIMER_TEXTS } from "@/lib/disclaimer-text";

export const INTAKE_PROMO = {
  questionCount: 15,
  durationLabel: "3 minuten",
  subline: "15 vragen, 3 minuten — direct een persoonlijk herstelplan.",
  sublineShort: "Check in 3 minuten hoe jouw leefstijl invloed heeft.",
  sublineWithResult: "15 vragen, 3 minuten, persoonlijk resultaat.",
  sublineWithAdvice: "15 vragen, 3 minuten — persoonlijk herstelplan.",
  heroCta: "Start de Leefstijlcheck (3 min)",
} as const;

export const HOMEPAGE_HERO = {
  eyebrow: "VOOR MANNEN 40+",
  headline: "Waar komt jouw verminderde energie écht vandaan?",
  subheadline:
    "Ontdek binnen 3 minuten welke leefstijlfactoren waarschijnlijk de grootste invloed hebben op jouw energie, herstel en vitaliteit.",
  bullets: [
    "Persoonlijke analyse van 6 leefstijldomeinen",
    "Gerangschikt op waarschijnlijkheid en impact",
    "Onafhankelijk en onderbouwd",
    "Gratis en anoniem",
  ],
  primaryCta: "Start de Leefstijlcheck (3 min)",
  secondaryCta: "Bekijk de gidsen",
  secondaryCtaHref: "/gidsen",
  widget: {
    eyebrow: "Gratis",
    title: "Leefstijlcheck voor mannen 40+",
    body: "15 vragen · 3 minuten · persoonlijk herstelplan op 6 domeinen.",
    cta: "Start direct",
  },
  microCopy: DISCLAIMER_TEXTS.ctaMicro,
  footnoteLabel: "Meer over testosteron na 40",
  footnoteHref: "/testosteron-na-40",
} as const;

export const HOMEPAGE_TRUST = {
  tagline:
    "Het startpunt voor mannen 40+ die grip willen op energie en vitaliteit",
  stats: [
    { value: "15 vragen", label: "Persoonlijk inzicht" },
    { value: "3 minuten", label: "Gratis Leefstijlcheck" },
    { value: "6 domeinen", label: "Slaap, energie, stress & meer" },
  ],
  cards: [
    {
      label: "Onafhankelijk",
      description: "Geen sponsors of betaalde plaatsingen",
    },
    {
      label: "Onderbouwd",
      description: "Gebaseerd op medische en leefstijlinzichten",
    },
    {
      label: "3 minuten",
      description: "15 vragen, persoonlijk herstelplan",
    },
    {
      label: "Gratis",
      description: "Geen account, anoniem verwerkt",
    },
  ],
} as const;

export const HOMEPAGE_GUIDES_PROMO = {
  title: "Gratis gidsen na 40",
  body:
    "Diepgaande PDF's over slaap, stress, energie, herstel en testosteron — praktisch, onderbouwd en zonder diagnoses. Eén overzicht, geen keuzestress op de homepage.",
  secondaryLine:
    "Je hoeft niet vooraf te weten welk thema past. De Leefstijlcheck hierboven ordenet dat voor je.",
  cta: "Bekijk de gidsen",
  ctaHref: "/gidsen",
  footnote:
    "Liever direct persoonlijk? Start de Leefstijlcheck — die wijst je naar je profiel en relevante vervolgstappen.",
  imageSrc: "/images/home/Gidsen-Compacte-Gidsen.webp",
  imageAlt:
    "Gratis compacte gidsen voor mannen 40+: slaap, stress, energie, herstel en testosteron",
} as const;

export const HOMEPAGE_LIFESTYLE = {
  sectionId: "leefstijlcheck",
  title:
    "Ontdek in 3 minuten hoe jouw leefstijl invloed heeft op je energie en vitaliteit",
  subtitle: "15 korte vragen, direct persoonlijk inzicht",
  cta: "Start de Leefstijlcheck (3 min)",
  footnote: DISCLAIMER_TEXTS.ctaMicro,
  progressLabel: "Vraag 3 van 15",
  progressPercent: 20,
  previewQuestionIds: [
    "SLP_QUAL",
    "NRG_PATN",
    "STR_FREQ",
    "MOV_STR",
  ] as const satisfies readonly QuestionId[],
} as const;
