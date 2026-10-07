import { HOW_IT_WORKS_QUESTIONS } from "@/data/how-it-works";

export const DASHBOARD_UNLOCK_METADATA = {
  title: "Hoe Werkt Jouw Dashboard?",
  description:
    "Eerst je voeding, dan pas een supplement. Het dashboard beantwoordt drie vragen: heb je wel een supplement nodig, welke voeding brengt je naar je norm, en welk goed beoordeeld supplement past bij wat je eet. Gratis, zonder diagnose.",
} as const;

export const DASHBOARD_UNLOCK_HERO = {
  eyebrow: "Eerst je voeding, dan pas een supplement",
  title: "Zo werkt je dashboard",
  lead: "Drie vragen, in deze volgorde: heb je wel een supplement nodig, welke voeding brengt je naar je norm, en welk supplement is goed beoordeeld én past bij wat je eet.",
  subtitle:
    "Geen diagnose — we kijken naar wat je eet, niet naar je bloed. Een gratis account (geen wachtwoord) bewaart je dagboek, je norm en je keuzes.",
} as const;

export const DASHBOARD_UNLOCK_QUESTIONS_SECTION = {
  title: "De drie vragen",
  questions: HOW_IT_WORKS_QUESTIONS,
} as const;

export const DASHBOARD_UNLOCK_RECOGNITION = {
  sectionLabel: "Herkenbaar?",
  quotes: [
    "Ik slik al jaren magnesium, maar weet niet of ik het nodig heb.",
    "Ik heb geen idee of ik genoeg omega-3 binnenkrijg uit wat ik eet.",
  ],
} as const;

export const DASHBOARD_UNLOCK_GAINS = {
  title: "Met dashboard",
  items: [
    "Wat je eet telt per stof mee, tegen jouw eigen norm",
    "Je ziet welke stof over meerdere dagen achterblijft — en welke niet",
    "Een supplement alleen waar je voeding het gat niet dicht, met PS-Score",
  ],
} as const;

export const DASHBOARD_UNLOCK_LOSSES = {
  title: "Zonder account",
  items: [
    "Je check is een momentopname die verdwijnt als je het tabblad sluit",
    "Geen dagboek, dus geen beeld over meerdere dagen",
    "Je kiest een supplement op gevoel, niet op wat je eet",
  ],
  closingLine: "Gratis account, geen wachtwoord — in 30 seconden klaar.",
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
  label: "Gratis · 3 minuten",
  primaryLabel: "Start de check →",
  primaryHref: "/intake",
  secondaryLabel: "Ik heb al een account — open dashboard →",
  secondaryHref: "/account/login",
  trustLine: "Adviezen, geen diagnoses · Onafhankelijk · AVG-proof",
} as const;

export const DASHBOARD_UNLOCK_PRINCIPLE = {
  line: "Een supplement dat een gat dicht dat er niet is, koop je voor niets. Daarom eerst je voeding.",
} as const;

export type DashboardUnlockStep = {
  step: number;
  title: string;
  description: string;
  timeLabel: string;
};

export const DASHBOARD_UNLOCK_ROUTE_ACCORDION = {
  title: "Zo werkt het, stap voor stap",
} as const;

export const DASHBOARD_UNLOCK_STEPS: DashboardUnlockStep[] = [
  {
    step: 1,
    title: "De check: wat mis je?",
    description:
      "Korte vragen over wat je doorgaans eet. Je ziet per stof waar je waarschijnlijk tekortschiet — en waar niet.",
    timeLabel: "± 3 min",
  },
  {
    step: 2,
    title: "Account",
    description:
      "Bewaar je resultaat met alleen je e-mailadres. Je krijgt een inlogcode, geen wachtwoord.",
    timeLabel: "Gratis",
  },
  {
    step: 3,
    title: "Dagboek",
    description:
      "Wat je eet telt per stof mee tegen jouw norm. Die stel je in onder Doelen: leeftijd, activiteit en welke stoffen je wilt volgen.",
    timeLabel: "Per maaltijd",
  },
  {
    step: 4,
    title: "Patroon",
    description:
      "Over meerdere dagen zie je welke stof structureel achterblijft, per maaltijd en per stof — en welke voeding het verschil maakt.",
    timeLabel: "Na een paar dagen",
  },
  {
    step: 5,
    title: "Keuze",
    description:
      "Blijft een gat open, dan zet je voeding naast supplement, met de PS-Score per product. Kopen doe je pas op de productpagina.",
    timeLabel: "Alleen als het past",
  },
];

export const DASHBOARD_UNLOCK_FAQ = [
  {
    question: "Moet ik een account aanmaken?",
    answer:
      "Voor je eerste resultaat niet: de check doe je anoniem. Een gratis account heb je nodig voor je dagboek, je norm en je patroon over meerdere dagen.",
  },
  {
    question: "Krijg ik altijd een supplementadvies?",
    answer:
      "Nee. Haal je met je voeding de norm voor een stof, dan staat daar geen supplement bij. Het dashboard stelt ook geen tekort vast — dat kan alleen een arts.",
  },
  {
    question: "Wat zegt de PS-Score?",
    answer:
      "Een cijfer van 0 tot 100 voor de kwaliteit van een supplement, berekend uit het etiket en de Europese lijst van goedgekeurde gezondheidsclaims. Prijs zit er niet in. De score beoordeelt het product, niet jouw voeding.",
  },
] as const;

export const DASHBOARD_UNLOCK_HOWTO = {
  name: "Eerst je voeding, dan pas een supplement",
  description:
    "Van de check naar je dashboard: dagboek, patroon en keuze — een supplement alleen waar je voeding het gat niet dicht.",
  steps: DASHBOARD_UNLOCK_STEPS.map((step) => ({
    name: step.title,
    text: `${step.description} (${step.timeLabel})`,
  })),
} as const;
