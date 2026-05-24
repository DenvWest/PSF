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

export const PYRAMID_LAYERS: readonly PyramidLayer[] = [
  {
    id: "vitality",
    eyebrow: "01",
    label: "Vitaliteit & Longevity",
    summary:
      "Optimalisatie aan de top — pas zinvol als het fundament stevig staat.",
    details:
      "Longevity gaat niet over trucjes, maar over jarenlang stabiele gewoonten. Supplementen, tracking en fine-tuning horen hier — niet als startpunt, wel als verfijning wanneer leefstijl en basis op orde zijn.",
  },
  {
    id: "tools",
    eyebrow: "02",
    label: "Tools & Tracking",
    subtitle: "Bloedwaarden, biomarkers, intake",
    summary: "Meten helpt — mits je weet wát je ermee doet.",
    details:
      "Bloedwaarden, slaapdata en periodieke checks geven context. Ze vervangen geen solide leefstijl, maar maken keuzes scherper. PerfectSupplement gebruikt je intake om patronen te zien, geen diagnoses te stellen.",
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
    label: "Gezondheidsuitkomsten",
    subtitle: "Energie · focus · hormonen · herstel",
    summary:
      "Wat je voelt — energie, slaap, humeur — volgt vaak uit wat eronder ligt.",
    details:
      "Vermoeidheid, onrustige nachten of trage progressie zijn signalen, geen eindpunten. In je resultaten kijken we naar energie en herstel naast de vijf leefstijl-pijlers, zodat je een helder beeld krijgt zonder totaalscore of diagnose.",
  },
  {
    id: "lifestyle",
    eyebrow: "05",
    label: "Leefstijl — het fundament",
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
