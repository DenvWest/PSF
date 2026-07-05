export const METHODOLOGY_METADATA = {
  title: "Onze methodologie | PerfectSupplement",
  description:
    "Hoe PerfectSupplement werkt: Leefstijlcheck, persoonlijke voortgang en onafhankelijke supplementvergelijking. Transparant, onderbouwd en leefstijl eerst.",
} as const;

export const METHODOLOGY_HERO = {
  eyebrow: "Onze aanpak",
  headline: "Onze methodologie",
  lead:
    "Eerst wat je kunt sturen — leefstijl en vitaliteit. Supplementen pas waar dat logisch is. Onafhankelijk onderbouwd, volledig transparant.",
} as const;

export const METHODOLOGY_CHAPTERS = [
  { id: "verhaal", number: "01", label: "Waarom wij anders beginnen" },
  { id: "leefstijl", number: "02", label: "Leefstijlcheck & voortgang" },
  { id: "supplementen", number: "03", label: "Onafhankelijke vergelijking" },
] as const;

export const METHODOLOGY_JOURNEY = {
  title: "Waarom wij anders beginnen",
  quote:
    "Je voelt het al langer: minder herstel, minder scherpte, slaap die niet meer vanzelf terugkomt. De meeste sites antwoorden met een pil. Wij beginnen waar het echt zit — in zowel je leefstijl als je vitaliteit.",
  steps: [
    {
      number: "01",
      title: "Symptoom",
      body: "Vermoeidheid die blijft, slaap die oppervlakkig voelt, stress die niet wegzakt — signalen die je herkent, geen diagnose.",
    },
    {
      number: "02",
      title: "Leefstijlcheck",
      body: "Drie minuten, vijf pijlers. Geen quiz met een supplement als uitkomst — wel een eerlijk beeld van waar jij nu op kunt sturen.",
    },
    {
      number: "03",
      title: "Profiel",
      body: "Niet twintig tips tegelijk. Eén beginstap die nu het meeste oplevert — gerangschikt op impact, niet op hype.",
    },
    {
      number: "04",
      title: "Voortgang",
      body: "Vasthouden is het moeilijkst. Je dashboard onthoudt waar je begon — hermeting laat zien of je patronen echt verschuiven.",
    },
    {
      number: "05",
      title: "Supplement",
      body: "Pas als de basis staat. Onafhankelijk vergeleken — nooit als vervanging van leefstijl.",
    },
  ],
} as const;

export type MethodologyValueId = "waarheid" | "prioriteit" | "kwaliteit" | "zuiverheid";

export const METHODOLOGY_VALUES: ReadonlyArray<{
  id: MethodologyValueId;
  title: string;
  summary: string;
}> = [
  {
    id: "waarheid",
    title: "Waarheid",
    summary: "EFSA-claims, onderbouwing per vraag — geen hype, open uitsluitingen.",
  },
  {
    id: "prioriteit",
    title: "Prioriteit",
    summary: "Laagste hefboom eerst; supplementen nooit als vervanging van leefstijl.",
  },
  {
    id: "kwaliteit",
    title: "Kwaliteit",
    summary: "Vaste criteria en weging — biobeschikbaarheid, dosering, prijs per dag.",
  },
  {
    id: "zuiverheid",
    title: "Zuiverheid",
    summary: "Geen betaalde rankings of eigen producten; affiliate is zichtbaar.",
  },
] as const;

export const METHODOLOGY_LEEFSTIJLCHECK = {
  id: "leefstijlcheck",
  title: "De Leefstijlcheck",
  titleAccent: "Vijf pijlers",
  subtitle:
    "Leefstijl is waar je op stuurt; vitaliteit laat zien wat het oplevert.",
  pyramidEyebrow: "Leefstijlcheck",
  pyramidCardTitle: "Leefstijl en vitaliteit",
  pillarsBridge: "In de check meet je vijf gebieden:",
  interventionDomains: [
    { label: "Slaap", detail: "Herstel en ritme — de basis waar energie op bouwt" },
    { label: "Stress", detail: "Zenuwstelsel en herstel — of je lichaam oplaadt of alert blijft" },
    { label: "Voeding", detail: "Energie en opbouw — wat je structureel eet telt altijd" },
    { label: "Beweging", detail: "Kracht en stofwisseling — spieren die verdwijnen als je niets doet" },
    { label: "Verbinding", detail: "Doel, relaties en steun — vaak onderschat, wel essentieel" },
  ],
  intakeCta: {
    href: "/intake",
    label: "Start de Leefstijlcheck",
  },
  onderbouwingLink: {
    href: "/onderbouwing#interventie-rapport",
    title: "Waarom leefstijl én vitaliteit",
    subtitle: "Wetenschappelijke onderbouwing",
  },
} as const;

export const METHODOLOGY_VOORTGANG = {
  id: "voortgang",
  title: "Van momentopname naar voortgang",
  lead: "Eén check geeft richting — terugkomen laat zien wat er verschuift.",
  dashboardEyebrow: "Jouw dashboard",
  dashboardCardTitle: "Kompas · Voortgang · Hermeting",
  bullets: [
    "Dashboard en Kompas houden je voortgang bij, zonder dat jij alles hoeft te onthouden.",
    "Hermeting laat patronen zien over tijd — geen medische uitspraak, wel meetbaar verschil.",
    "Inzichten koppelen artikelen aan je laatste check: wat speelt voor jou nu.",
  ],
  dashboardLink: {
    href: "/hoe-werkt-dashboard",
    label: "Zo werkt je dashboard",
  },
  inzichtenLink: {
    href: "/inzichten",
    label: "Bekijk Inzichten",
  },
} as const;

export const METHODOLOGY_SUPPLEMENTEN = {
  id: "supplementen",
  title: "Supplementen — pas als aanvulling",
  lead:
    "Beoordeeld op inhoud en dagdosering — dezelfde criteria voor iedereen.",
  exampleLink: {
    href: "/beste/omega-3-supplement",
    label: "omega-3-vergelijking",
  },
} as const;

export type MethodologyCriterion = {
  title: string;
  pct: string;
  weight: number;
  description: string;
  inlineLink?: { href: string; before: string; linkLabel: string; after: string };
};

export const METHODOLOGY_CRITERIA: readonly MethodologyCriterion[] = [
  {
    title: "Biobeschikbaarheid",
    pct: "25%",
    weight: 25,
    description:
      "Hoeveel je lichaam daadwerkelijk opneemt — niet wat er op het etiket staat.",
  },
  {
    title: "Dosering",
    pct: "30%",
    weight: 30,
    description: "",
    inlineLink: {
      before: "Of de dosis aansluit bij de ",
      href: "/kennisbank/adh",
      linkLabel: "ADH",
      after: " en bij klinisch onderzoek.",
    },
  },
  {
    title: "Prijs-kwaliteit",
    pct: "25%",
    weight: 25,
    description: "De prijs per effectieve dosis, niet per capsule.",
  },
  {
    title: "Transparantie",
    pct: "20%",
    weight: 20,
    description: "",
    inlineLink: {
      before: "",
      href: "/kennisbank/derde-partij-testen",
      linkLabel: "Derde-partij testen",
      after: ", EFSA-claims en volledige ingrediëntenlijst.",
    },
  },
] as const;

export const METHODOLOGY_AFFILIATE_FOOTNOTE = {
  body: "Sommige links zijn affiliate links — scores blijven onafhankelijk.",
  disclosureLink: {
    href: "/affiliate-disclosure",
    label: "Affiliate disclosure",
  },
} as const;

export const METHODOLOGY_CTA = {
  title: "Start met de Leefstijlcheck",
  lead: "Vijf hefbomen in drie minuten — gratis, zonder account.",
  buttonLabel: "Start de Leefstijlcheck",
  href: "/intake",
  footnote: "Geen account nodig · Je gegevens worden anoniem verwerkt",
} as const;
