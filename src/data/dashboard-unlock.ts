import { DASHBOARD_ROUTE_FAQ, DASHBOARD_ROUTE_STEPS } from "@/data/dashboard-route";
import type { PillarId } from "@/types/dashboard";

export const DASHBOARD_UNLOCK_METADATA = {
  title: "Bewaar Je Leefstijl-Overzicht | PerfectSupplement",
  description:
    "Je Leefstijlcheck is klaar — bewaar je prioriteit, check-ins en voortgang gratis. Geen wachtwoord. Onafhankelijk advies voor mannen 40+, geen diagnose.",
} as const;

export const DASHBOARD_UNLOCK_PROGRESS = {
  percent: 67,
  steps: [
    { id: "check", label: "Check", detail: "± 3 min", done: true },
    { id: "overview", label: "Overzicht", detail: "Direct", done: true },
    { id: "save", label: "Bewaren", detail: "± 30 sec", done: false },
  ],
  microcopy: "Je bent er bijna — nog één stap.",
} as const;

export const DASHBOARD_UNLOCK_HERO = {
  eyebrow: "Jouw momentopname · 2 van 3 klaar",
  title: "Je weet nu waar het lekt — maar zonder account verdwijnt dit morgen weer.",
  subtitle:
    "Bewaar je prioriteit, je eerste stap en je voortgang op één plek. Gratis. Geen wachtwoord.",
} as const;

export const DASHBOARD_UNLOCK_RECOGNITION = {
  sectionLabel: "Herkenbaar?",
  quotes: [
    "Ik heb dit al vaker gedaan — volgende week begin ik weer opnieuw.",
    "Ik weet wat ik moet doen, maar zonder overzicht houd ik het niet vol.",
    "Als ik dit tabblad sluit, is mijn check weg — en dat irriteert me.",
  ],
} as const;

export const DASHBOARD_UNLOCK_GAINS = {
  title: "Met dashboard (gratis)",
  items: [
    'Je volledige prioriteitsladder blijft bewaard — inclusief "← hier begin je nu"',
    "Korte check-ins (±1 min) houden je ritme vast tussen werkdagen door",
    "Na ~30 dagen zie je wat echt verschuift sinds je vorige meting",
    "Eén plek voor leefstijlstappen, trends en hermeting — geen losse screenshots",
    "Je data blijft van jou: exporteer of verwijder wanneer je wilt",
  ],
} as const;

export const DASHBOARD_UNLOCK_LOSSES = {
  title: "Zonder account (nu)",
  items: [
    "Je momentopname verdwijnt als je het tabblad sluit",
    "Geen trend — je ziet niet of je eerste stap effect had",
    "Geen reminder voor je volgende check-in of hermeting",
    "Volgende week start je opnieuw op gevoel, niet op data",
    "Je 3 minuten check levert dan geen blijvend anker op",
  ],
  closingLine:
    "Je hebt de check al gedaan. Bewaren kost 30 seconden — opnieuw beginnen kost weken.",
} as const;

export const DASHBOARD_UNLOCK_LOCKED_FEATURES = [
  {
    tab: "Voortgang",
    detail: "Trend zichtbaar na account",
  },
  {
    tab: "Check-ins",
    detail: "Welke meting nu logisch is",
  },
  {
    tab: "Hermeting",
    detail: "Plan je volgende meting (~30 dagen)",
  },
] as const;

export const DASHBOARD_UNLOCK_CTA = {
  label: "Gratis · geen wachtwoord",
  primaryLabel: "Bewaar mijn overzicht →",
  primaryHref: "/account/login",
  subtext: "Log in via je mail — je ziet meteen je volledige ladder en voortgang.",
  intakeFallbackLabel: "Nog geen check gedaan? Start de Leefstijlcheck →",
  intakeFallbackHref: "/intake",
  trustLines: [
    "Adviezen, geen diagnoses",
    "Onafhankelijk — geen sponsors",
    "AVG-proof — intrekken of verwijderen wanneer je wilt",
  ],
} as const;

export const DASHBOARD_UNLOCK_SOCIAL_PROOF = {
  line: "Mannen 40+ gebruiken het dashboard om niet elke maand opnieuw te beginnen.",
  testimonials: [
    {
      name: "Mark",
      age: 47,
      quote:
        "Eindelijk één plek waar ik zie wat ik al gedaan heb — geen Excel meer.",
    },
    {
      name: "Peter",
      age: 52,
      quote: "De check-in duurt een minuut. Dat houd ik vol tussen meetings door.",
    },
    {
      name: "Rob",
      age: 44,
      quote:
        "Na 30 dagen zag ik dat mijn slaapscore echt omhoog ging. Dat motiveert.",
    },
  ],
} as const;

export const DASHBOARD_UNLOCK_ROUTE_ACCORDION = {
  title: "Zo werkt het volledige traject (6 stappen)",
} as const;

export const DASHBOARD_UNLOCK_PREVIEW = {
  profileName: "Lage Batterij",
  vitality: 53,
  priorityId: "voeding" satisfies PillarId,
  scores: {
    voeding: 38,
    energie: 45,
    slaap: 52,
    stress: 58,
    beweging: 62,
    herstel: 68,
  } satisfies Record<PillarId, number>,
  firstStepTitle: "Eiwitrijk ontbijt",
  firstStepDetail: "30 g eiwit vóór 10 uur",
} as const;

export const DASHBOARD_UNLOCK_FAQ = DASHBOARD_ROUTE_FAQ;
export const DASHBOARD_UNLOCK_STEPS = DASHBOARD_ROUTE_STEPS;

export const DASHBOARD_UNLOCK_HOWTO = {
  name: "Leefstijl-overzicht bewaren en volgen",
  description:
    "Van Leefstijlcheck naar meetbaar dashboard: check, overzicht, account, check-ins en hermeting.",
  steps: DASHBOARD_ROUTE_STEPS.map((step) => ({
    name: step.title,
    text: `${step.description} (${step.timeLabel})`,
  })),
} as const;
