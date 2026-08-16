/**
 * Eetbasis-piramide — zes lagen en vijf meetclusters voor voeding v1.
 * Canon uit BESLUIT_VOEDING_PIRAMIDE_V1_2026-08.md §D2 en §E.
 */

export type NutritionLayerId =
  | "eetbasis"
  | "voedingskwaliteit"
  | "verhoudingen"
  | "situatie"
  | "meten-timing"
  | "aanvullen";

export type NutritionClusterId = "C1" | "C2" | "C3" | "C4" | "C5";

export type NutritionLayer = {
  id: NutritionLayerId;
  /** Alleen in data-contract — nooit in gerenderde UI-strings. */
  layer: 1 | 2 | 3 | 4 | 5 | 6;
  name: string;
  stateRule: string;
};

export type NutritionCluster = {
  id: NutritionClusterId;
  sliderIds: readonly string[];
  layer: 1 | 2 | 3 | 4 | 5 | 6;
  /** Max 12 woorden — status-uitleg per cluster. */
  whyLine: string;
};

export const NUTRITION_LAYERS: readonly NutritionLayer[] = [
  {
    id: "eetbasis",
    layer: 1,
    name: "Je eetbasis",
    stateRule: "Nu zolang één cluster below is",
  },
  {
    id: "voedingskwaliteit",
    layer: 2,
    name: "Voedingskwaliteit",
    stateRule: "Wacht tot laag 1 geen below meer heeft, dan nu",
  },
  {
    id: "verhoudingen",
    layer: 3,
    name: "Verhoudingen",
    stateRule: "Wacht tot laag 1 én 2 staan",
  },
  {
    id: "situatie",
    layer: 4,
    name: "Op jouw situatie",
    stateRule: "Altijd read-only",
  },
  {
    id: "meten-timing",
    layer: 5,
    name: "Meten & timing",
    stateRule: "Altijd wacht in v1",
  },
  {
    id: "aanvullen",
    layer: 6,
    name: "Aanvullen & vergelijken",
    stateRule: "Dicht of open — poort op voedingscheck én signaal",
  },
] as const;

export const NUTRITION_CLUSTERS: readonly NutritionCluster[] = [
  {
    id: "C1",
    sliderIds: [],
    layer: 1,
    whyLine: "Hier vroegen we nog niets naar",
  },
  {
    id: "C2",
    sliderIds: [],
    layer: 1,
    whyLine: "Hier vroegen we nog niets naar",
  },
  {
    id: "C3",
    sliderIds: [
      "proteinMeals",
      "meatLegumes",
      "dairy",
      "nutsSeedsLegumes",
      "oilyFish",
    ],
    layer: 3,
    whyLine: "Verdeling over de dag telt boven veertig",
  },
  {
    id: "C4",
    sliderIds: ["vegetables", "fruit", "berries", "wholegrain"],
    layer: 1,
    whyLine: "Vezels, kalium en magnesium komen hier vandaan",
  },
  {
    id: "C5",
    sliderIds: ["sugaryDrinks"],
    layer: 2,
    whyLine: "Frequentie voorspelt hier meer dan hoeveelheid",
  },
] as const;

export function getNutritionLayerById(id: NutritionLayerId): NutritionLayer | undefined {
  return NUTRITION_LAYERS.find((layer) => layer.id === id);
}

export function getNutritionClusterById(id: NutritionClusterId): NutritionCluster | undefined {
  return NUTRITION_CLUSTERS.find((cluster) => cluster.id === id);
}

/**
 * Zelfselectie-vorm van dezelfde zes lagen (§PrioriteitenLadder) — geen
 * winst/ok/watch/wacht-status, want die vereist per-cluster meting en C1/C2
 * meten we nog niet (zie NUTRITION_CLUSTERS hierboven). Tekst woordelijk uit
 * voeding-piramide-prebuild-v1.5-2026-08.html (RAIL_ROWS + LAYER_ACTIONS) —
 * dat bestand is het ontwerpcontract, dit is de overname ervan.
 */
export type NutritionPriorityLayer = {
  id: 1 | 2 | 3 | 4 | 5 | 6;
  name: string;
  summary: string;
  actions: readonly string[];
};

export const NUTRITION_PRIORITY_LAYERS: readonly NutritionPriorityLayer[] = [
  {
    id: 1,
    name: "Je eetbasis",
    summary:
      "Passende energie, een regelmatig patroon, een volwaardige basis met planten en eiwit, en water als standaard.",
    actions: [
      "Zet één portie groente bij je avondeten.",
      "Ruil je brood naar volkoren bij je volgende boodschappen.",
      "Kies water als standaard bij het avondeten.",
    ],
  },
  {
    id: 2,
    name: "Voedingskwaliteit",
    summary:
      "Meer groente, peulvruchten, volkoren, noten en vis. Minder suikerhoudende dranken, zout en sterk bewerkte producten.",
    actions: [
      "Vervang één zoet drankmoment per dag door water of thee.",
      "Leg één keer per week vis op je boodschappenlijst.",
      "Neem een handvol ongezouten noten als vaste tussendoor.",
    ],
  },
  {
    id: 3,
    name: "Verhoudingen",
    summary:
      "Eiwit per maaltijd, vezels, de kwaliteit van je vetten en koolhydraten. Telt pas als je eetbasis en kwaliteit staan.",
    actions: [
      "Verplaats één eiwitrijk moment naar je ontbijt.",
      "Voeg peulvruchten toe aan één warme maaltijd per week.",
      "Reken je eiwitdoel uit voor jouw gewicht.",
    ],
  },
  {
    id: 4,
    name: "Op jouw situatie",
    summary:
      "Je gewicht, leeftijd, activiteit, voorkeuren en intoleranties bepalen welke stappen realistisch zijn. Geen diagnose — bij twijfel verwijzen we door.",
    actions: [],
  },
  {
    id: 5,
    name: "Meten & timing",
    summary:
      "Calorieën tellen, macro’s bijhouden, eten binnen een tijdvenster — dat zijn gereedschappen, geen fundament. Ze doen pas iets als je eetbasis en je verhoudingen staan. We openen dit niet eerder.",
    actions: [],
  },
  {
    id: 6,
    name: "Aanvullen & vergelijken",
    summary:
      "Wat je bord niet dekt kan een aanvulling worden — maar alleen als je check dat laat zien.",
    actions: [],
  },
] as const;
