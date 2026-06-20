export type DashboardRouteStep = {
  step: number;
  title: string;
  description: string;
  timeLabel: string;
};

export const DASHBOARD_ROUTE_STEPS: DashboardRouteStep[] = [
  {
    step: 1,
    title: "Leefstijlcheck",
    description:
      "15 vragen over slaap, stress, energie, voeding, beweging en herstel. Je krijgt scores op 6 domeinen en een profiellabel.",
    timeLabel: "± 3 min",
  },
  {
    step: 2,
    title: "Herstelplan",
    description:
      "Je ziet welke pijler nu het meeste lekt en één concrete beginstap — gerangschikt op impact, niet op hype.",
    timeLabel: "Direct",
  },
  {
    step: 3,
    title: "Dashboard",
    description:
      "Bewaar je overzicht op één plek: prioriteitenladder, persoonlijk plan en trends over tijd.",
    timeLabel: "Gratis account",
  },
  {
    step: 4,
    title: "Check-ins",
    description:
      "Korte metingen per pijler houden je plan haalbaar. Zo blijft het praktisch, niet theoretisch.",
    timeLabel: "± 1 min per check",
  },
  {
    step: 5,
    title: "Hermeting",
    description:
      "Na ongeveer 30 dagen meet je opnieuw en zie je wat echt verschoven is sinds je vorige check.",
    timeLabel: "Optionele reminder",
  },
  {
    step: 6,
    title: "Bijsturen",
    description:
      "Leefstijlstappen eerst. Alleen als dat past bij jouw profiel: een onafhankelijke supplementvergelijking — geen verkooppraat.",
    timeLabel: "Doorlopend",
  },
];

export const DASHBOARD_ROUTE_DISCLAIMER =
  "Geen medische diagnose — wel een praktische route met meetmomenten.";

export const DASHBOARD_ROUTE_HERO = {
  eyebrow: "Jouw route na de Leefstijlcheck",
  title: "Zo werkt je dashboard na de Leefstijlcheck",
  subtitle:
    "In 6 stappen van check naar meetbaar overzicht — zonder diagnose, wel met een beginpunt. Je ziet waar je staat, wat verschuift en welke check-in nu logisch is.",
  routeSectionTitle: "Je route in 6 stappen",
  routeSectionSubtitle:
    "Dit is wat je krijgt — van eerste check tot bijsturen op data.",
} as const;

export const DASHBOARD_ROUTE_FEATURES = [
  {
    title: "Startpunt",
    description:
      "Je ziet direct welke pijler nu het meeste lekt: slaap, stress, voeding of beweging.",
  },
  {
    title: "Check-ins",
    description:
      "Met korte check-ins houd je het ritme vast. Zo blijft je plan haalbaar en niet theoretisch.",
  },
  {
    title: "Voortgang",
    description:
      "Je ziet trends en prioriteitsverschuivingen, zodat je bijstuurt op data in plaats van gevoel.",
  },
] as const;

export const DASHBOARD_ROUTE_WHY = {
  title: "Waarom dit helpt",
  paragraphs: [
    "Veel mannen beginnen steeds opnieuw. Het dashboard doorbreekt dat patroon: je ziet waar je staat, waar je begint, en wat echt verschuift sinds je vorige check.",
    "Je ziet niet alleen waar je staat, maar ook welke stap logisch is vandaag. Geen diagnose, wel een praktische route met meetmomenten die je consistent houdt.",
  ],
} as const;

export const DASHBOARD_ROUTE_CTA = {
  title: "Klaar om te starten?",
  primaryLabel: "Start de Leefstijlcheck →",
  primaryHref: "/intake",
  secondaryLabel: "Ik heb al een check gedaan — open dashboard →",
  secondaryHref: "/account/login",
  microcopy: "Gratis · 3 minuten · geen account nodig voor je resultaat",
} as const;

export const DASHBOARD_ROUTE_PREVIEW = {
  title: "Zo ziet je dashboard eruit",
  subtitle:
    "Vijf tabbladen — van je volgende stap tot hermeting. Alles op één plek.",
} as const;

export const DASHBOARD_ROUTE_FAQ = [
  {
    question: "Moet ik een account aanmaken?",
    answer:
      "Nee, voor je eerste resultaat niet. Je kunt de Leefstijlcheck anoniem doen en direct je herstelplan zien. Een gratis account is handig als je je voortgang wilt bewaren en check-ins wilt bijhouden.",
  },
  {
    question: "Hoe vaak moet ik inchecken?",
    answer:
      "Dat hangt af van je prioriteit. Korte check-ins duren ongeveer één minuut per pijler. Het dashboard laat zien welke meting nu logisch is — je hoeft niet alles tegelijk te doen.",
  },
  {
    question: "Krijg ik supplementadvies?",
    answer:
      "Alleen als het past bij jouw profiel en leefstijlstappen. PerfectSupplement zet leefstijl eerst. Supplementen zijn een optionele trede — altijd onafhankelijk vergeleken, zonder sponsors.",
  },
] as const;

export const DASHBOARD_ROUTE_METADATA = {
  title: "Hoe Werkt Jouw Dashboard? | PerfectSupplement",
  description:
    "Je route in 6 stappen: Leefstijlcheck, herstelplan, dashboard, check-ins en hermeting. Gratis overzicht voor mannen 40+ — zonder diagnose.",
} as const;
