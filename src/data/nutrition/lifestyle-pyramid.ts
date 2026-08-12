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
