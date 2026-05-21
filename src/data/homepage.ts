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
  headline: "Minder energie na 40? Meestal geen testosteronprobleem.",
  subheadline:
    "Mannen blijven hun hele leven vruchtbaar en actief. Testosteron daalt geleidelijk vanaf 40 — maar bij een klein percentage spelen hormonen echt de hoofdrol. Bij de meeste mannen wegen slaap, gewicht, stress en beweging zwaarder. Ontdek waar jij kunt bijsturen.",
  bullets: [
    "Geen plotselinge “andropauze” — veranderingen zijn geleidelijk en per man verschillend",
    "Echte hormonale klachten komen bij weinig mannen voor",
    "Leefstijl beïnvloedt energie, libido en herstel het sterkst",
    "Overgewicht en chronische stress zijn veelvoorkomende oorzaken",
    "In 3 minuten zie je welke hefbomen bij jou het grootst zijn",
  ],
  primaryCta: "Start de Leefstijlcheck (3 min)",
  secondaryCta: "Bekijk hoe het werkt",
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
