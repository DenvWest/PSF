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
  headline: "Zullen wij je helpen aan een sterk, energiek en vitaal lichaam?",
  subheadline:
    "Wij maken van jouw leefstijl een helder overzicht — en geven je concrete vervolgstappen. Onafhankelijk platform voor mannen 40+, gratis in 3 minuten.",
  bullets: [
    "Ontvang een duidelijk leefstijloverzicht op 6 domeinen",
    "Één concrete beginstap — gerangschikt op impact",
    "Geen hype: eerst leefstijl, supplementen alleen waar het zinvol is",
  ],
  primaryCta: "Start de Leefstijlcheck (3 min)",
  secondaryCta: "Bekijk de gidsen",
  secondaryCtaHref: "/gidsen",
  widget: {
    eyebrow: "Gratis",
    title: "Leefstijlcheck voor mannen 40+",
    body: "15 vragen · 3 minuten · leefstijl-inzicht op 6 domeinen.",
    cta: "Start direct",
  },
  microCopy: DISCLAIMER_TEXTS.ctaMicro,
} as const;

export const HOMEPAGE_TRUST = {
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
  title: "Gratis gidsen voor mannen 40+",
  body:
    "Slaap die minder diep is, energie die eerder opraakt, herstel dat langer duurt — na je 40e verandert er van alles, vaak geleidelijk. Deze vijf compacte gidsen over slaap, stress, energie, herstel en testosteron geven je grip op wat er speelt. Onderbouwd en praktisch, zonder hype en zonder diagnoses.",
  secondaryLine:
    "Nog niet zeker welk thema bij jou past? Doe eerst de Leefstijlcheck hierboven. In 3 minuten weet je waar je het beste kunt beginnen.",
  cta: "Bekijk de gidsen",
  ctaHref: "/gidsen",
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
