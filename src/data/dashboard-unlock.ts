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
  eyebrow: "Check afgerond · laatste stap",
  title: "Bewaar je leefstijl-overzicht",
  lead: "Zonder account verlies je je prioriteit zodra je dit tabblad sluit.",
  subtitle:
    "Gratis login via je mail — je ladder, stappen en voortgang blijven op één plek. Geen wachtwoord.",
} as const;

export const DASHBOARD_UNLOCK_RECOGNITION = {
  sectionLabel: "Herkenbaar?",
  quotes: [
    "Ik weet wat ik moet doen, maar zonder overzicht houd ik het niet vol.",
    "Als ik dit tabblad sluit, begin ik volgende week opnieuw.",
  ],
} as const;

export const DASHBOARD_UNLOCK_GAINS = {
  title: "Met dashboard",
  items: [
    "Prioriteitsladder en eerste stap blijven bewaard",
    "Check-ins en hermeting houden je plan volgbaar",
    "Je data blijft van jou — exporteer of verwijder wanneer je wilt",
  ],
} as const;

export const DASHBOARD_UNLOCK_LOSSES = {
  title: "Zonder account",
  items: [
    "Je momentopname verdwijnt als je het tabblad sluit",
    "Geen trend of reminder voor je volgende stap",
    "Je start opnieuw op gevoel, niet op data",
  ],
  closingLine: "Bewaren kost 30 seconden.",
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
  subtext: "We sturen een loginlink naar je mail.",
  intakeFallbackLabel: "Nog geen check gedaan? Start de Leefstijlcheck →",
  intakeFallbackHref: "/intake",
  trustLine: "Adviezen, geen diagnoses · Onafhankelijk · AVG-proof",
} as const;

export const DASHBOARD_UNLOCK_SOCIAL_PROOF = {
  line: "Mannen 40+ gebruiken het dashboard om niet elke maand opnieuw te beginnen.",
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
