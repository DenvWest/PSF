import type { DomainScores } from "@/lib/intake-engine";

export type PillarId =
  | "stress"
  | "sleep"
  | "nutrition"
  | "movement"
  | "connection";

export type PyramidPillar = {
  id: PillarId;
  label: string;
  sublabel: string;
  description: string;
};

export type PyramidLayerId =
  | "vitality"
  | "tools"
  | "supplements"
  | "outcomes"
  | "lifestyle";

export type PyramidLayer = {
  id: PyramidLayerId;
  label: string;
  subtitle?: string;
  eyebrow: string;
  summary: string;
  details: string;
  pillars?: readonly PyramidPillar[];
};

export type FoundationBaseItem = {
  id: "dna" | "epigenetics" | "mindset" | "why";
  label: string;
  summary: string;
  details: string;
};

export const LIFESTYLE_PILLARS: readonly PyramidPillar[] = [
  {
    id: "stress",
    label: "Stress",
    sublabel: "Zenuwstelsel",
    description:
      "Hoe je lichaam schakelt tussen alert zijn en herstellen bepaalt veel van je energie en slaap.",
  },
  {
    id: "sleep",
    label: "Slaap",
    sublabel: "Herstel",
    description:
      "Consistente slaap is het fundament waarop focus, humeur en fysiek herstel rusten.",
  },
  {
    id: "nutrition",
    label: "Voeding",
    sublabel: "Darmen",
    description:
      "Wat je structureel eet beïnvloedt energie, herstel en hoe je lichaam reageert op stress.",
  },
  {
    id: "movement",
    label: "Beweging",
    sublabel: "Spierkracht",
    description:
      "Kracht en beweging houden spieren, botten en stofwisseling op peil — vooral na 40.",
  },
  {
    id: "connection",
    label: "Verbinding",
    sublabel: "Sociaal · doel",
    description:
      "Doel, relaties en betekenis dragen bij aan veerkracht — vaak onderschat in health-plannen.",
  },
] as const;

/** Vier gemeten leefstijlgebieden — zelfde volgorde als intro-previewkaart. */
export const SUMMARY_PILLAR_IDS: readonly PillarId[] = [
  "sleep",
  "stress",
  "nutrition",
  "movement",
] as const;

export const PYRAMID_LAYERS: readonly PyramidLayer[] = [
  {
    id: "vitality",
    eyebrow: "01",
    label: "Longevity",
    summary:
      "Optimalisatie aan de top — pas zinvol als het fundament stevig staat.",
    details:
      "Longevity gaat niet over trucjes, maar over jarenlang stabiele gewoonten. Supplementen, tracking en fine-tuning horen hier — niet als startpunt, wel als verfijning wanneer leefstijl en basis op orde zijn.",
  },
  {
    id: "tools",
    eyebrow: "02",
    label: "Tools",
    subtitle: "Biomarkers",
    summary: "Meten helpt — mits je weet wát je ermee doet.",
    details:
      "Biomarkers en periodieke checks geven context. Ze vervangen geen solide leefstijl, maar maken keuzes scherper. PerfectSupplement gebruikt je intake om patronen te zien, geen diagnoses te stellen.",
  },
  {
    id: "supplements",
    eyebrow: "03",
    label: "Supplementen",
    subtitle: "Gericht, op basis van profiel",
    summary: "Aanvulling waar leefstijl niet rond komt — niet andersom.",
    details:
      "Supplementen kunnen gaten dichten als voeding, slaap of stress het moeilijk maken om alles uit eten te halen. Ze werken het best als tweede stap: eerst de basis, daarna gericht vergelijken wat past bij jouw situatie.",
  },
  {
    id: "outcomes",
    eyebrow: "04",
    label: "Vitaliteit",
    subtitle: "Energie · focus · herstel",
    summary:
      "Wat je merkt — energie, focus, herstel — volgt vaak uit wat eronder ligt.",
    details:
      "Vermoeidheid, wazigheid of trage progressie zijn signalen, geen eindpunten. In je resultaten kijken we naar energie en herstel naast de vijf leefstijl-pijlers — patronen, geen diagnose.",
  },
  {
    id: "lifestyle",
    eyebrow: "05",
    label: "Leefstijl",
    subtitle: "Jouw 5 gebieden",
    summary:
      "Stress, slaap, voeding, beweging en verbinding dragen alles wat erboven staat.",
    details:
      "De brede basis van de piramide. Hier win je het meeste terug: betere nachten, stabielere energie, minder ruis in je hoofd. Supplementen en optimalisatie bouwen hierop — niet eromheen.",
    pillars: LIFESTYLE_PILLARS,
  },
] as const;

export const FOUNDATION_BASE: readonly FoundationBaseItem[] = [
  {
    id: "dna",
    label: "DNA",
    summary: "Je startpunt — niet je lot.",
    details:
      "Genetische aanleg zet kaders, maar vertelt zelden het hele verhaal. Leefstijl bepaalt voor een groot deel hoe die aanleg zich uit.",
  },
  {
    id: "epigenetics",
    label: "Epigenetica",
    summary: "Hoe gewoonten genen aan- en uitzetten.",
    details:
      "Slaap, voeding, stress en beweging sturen welke genen actief zijn. Dat maakt consistente keuzes belangrijker dan perfectie op één dag.",
  },
  {
    id: "mindset",
    label: "Mindset",
    summary: "Gedrag volgt betekenis.",
    details:
      "Als je weet waarom iets ertoe doet, houd je vol op dagen dat motivatie ontbreekt. Kleine, haalbare stappen slaan aan op wilskracht.",
  },
  {
    id: "why",
    label: "Waarom",
    summary: "Doel dat je plan draagt.",
    details:
      "Of het scherper worden op het werk is of fit blijven voor je gezin — een helder waarom maakt trade-offs makkelijker en houdt je bij de basis.",
  },
] as const;

export function getPyramidLayerById(id: PyramidLayerId): PyramidLayer | undefined {
  return PYRAMID_LAYERS.find((layer) => layer.id === id);
}

export function getFoundationBaseById(
  id: FoundationBaseItem["id"],
): FoundationBaseItem | undefined {
  return FOUNDATION_BASE.find((item) => item.id === id);
}

export type PillarDrawerLink = {
  label: string;
  href: string;
};

export type PillarDrawerFallback = {
  quickWins: readonly string[];
  guideHref?: string;
  profileSlugs?: readonly string[];
};

export const PILLAR_SCORE_KEYS: Partial<
  Record<PillarId, keyof DomainScores>
> = {
  stress: "stress_score",
  sleep: "sleep_score",
  nutrition: "nutrition_score",
  movement: "movement_score",
};

export const PILLAR_DRAWER_FALLBACKS: Record<PillarId, PillarDrawerFallback> = {
  stress: {
    quickWins: [
      "Plan één rustmoment van 10 minuten op een vaste tijd vandaag.",
      "Beperk cafeïne na 14:00 als je 's avonds moeilijk tot rust komt.",
      "Leg je telefoon 30 minuten vóór bedtijd buiten bereik.",
    ],
    guideHref: "/gids/stress",
    profileSlugs: ["stressdrager"],
  },
  sleep: {
    quickWins: [
      "Ga de komende 3 nachten op hetzelfde tijdstip naar bed.",
      "Houd je slaapkamer koel, donker en stil — geen scherm in bed.",
      "Stop met eten 2–3 uur voor het slapen.",
    ],
    guideHref: "/gids/slaap",
    profileSlugs: ["onrustige-slaper"],
  },
  nutrition: {
    quickWins: [
      "Begin elke maaltijd met een eiwitbron (eieren, zuivel, vis, peulvruchten).",
      "Eet vette vis minstens 2× per week of overweeg omega-3 uit voeding.",
      "Drink water vóór koffie in de ochtend.",
    ],
    guideHref: "/voeding-na-40",
    profileSlugs: ["lage-batterij"],
  },
  movement: {
    quickWins: [
      "Plan 2× per week 20 minuten krachttraining — ook thuis met lichaamsgewicht.",
      "Neem na elke 90 minuten zitten een korte wandeling van 5 minuten.",
      "Kies één vaste trainingsdag en zet die in je agenda.",
    ],
    guideHref: "/beweging-na-40",
    profileSlugs: ["lage-batterij", "overtrainer"],
  },
  connection: {
    quickWins: [
      "Plan één sociaal contact deze week — kort bellen telt ook.",
      "Schrijf op waarom je fitter wilt worden; herlees het bij lage motivatie.",
      "Neem één taak van je lijst af die geen energie oplevert.",
    ],
    guideHref: undefined,
    profileSlugs: [],
  },
};

export function getPillarById(pillarId: PillarId): PyramidPillar | undefined {
  return LIFESTYLE_PILLARS.find((pillar) => pillar.id === pillarId);
}
