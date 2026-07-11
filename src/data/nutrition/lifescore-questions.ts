/**
 * Data-gedreven vragenset voor de Lifesum-stijl voedingscheck.
 *
 * Flow (P1): groente → allergie → voorkeur → dieet-sliders → optionele breedte.
 * Elke slider definieert eigen stops; scoring in nutrition-score.ts.
 */

import type { NutritionSelfReport } from "@/lib/nutrition-intake-estimate";

/** Type antwoord-schaal — bepaalt alleen het label-bereik, niet de scoring. */
export type NutritionScale = "frequency" | "perDay" | "perWeek" | "percentage";

export interface SliderStop {
  label: string;
  weight: number;
  report?: Partial<NutritionSelfReport>;
}

export interface SliderOptOut {
  label: string;
}

export interface SliderQuestion {
  kind: "slider";
  id: string;
  prompt: string;
  helper?: string;
  scale: NutritionScale;
  defaultIndex: number;
  stops: SliderStop[];
  weight?: number;
  optOut?: SliderOptOut;
}

export interface MultiQuestion {
  kind: "multi";
  id: string;
  prompt: string;
  helper?: string;
  options: { value: string; label: string }[];
}

export interface SingleQuestion {
  kind: "single";
  id: string;
  prompt: string;
  helper?: string;
  options: { value: string; label: string }[];
}

export type NutritionQuestion = SliderQuestion | MultiQuestion | SingleQuestion;

export const NUTRITION_CORE_SLIDER_IDS_BEFORE_DIET = [
  "vegetables",
] as const;

export const NUTRITION_CORE_SLIDER_IDS_AFTER_DIET = [
  "nutsSeedsLegumes",
  "oilyFish",
  "proteinMeals",
  "meatLegumes",
  "dairy",
  "daylight",
] as const;

/** Alle kern-sliders in volgorde (vóór + na dieet-meta). */
export const NUTRITION_CORE_SLIDER_IDS = [
  ...NUTRITION_CORE_SLIDER_IDS_BEFORE_DIET,
  ...NUTRITION_CORE_SLIDER_IDS_AFTER_DIET,
] as const;

export const NUTRITION_BREADTH_SLIDER_IDS = [
  "fruit",
  "berries",
  "wholegrain",
  "sugaryDrinks",
] as const;

export type NutritionCoreSliderId = (typeof NUTRITION_CORE_SLIDER_IDS)[number];
export type NutritionCoreSliderAfterDietId = (typeof NUTRITION_CORE_SLIDER_IDS_AFTER_DIET)[number];
export type NutritionBreadthSliderId = (typeof NUTRITION_BREADTH_SLIDER_IDS)[number];

/* ── Herbruikbare schaal-presets ─────────────────────────────────── */

const FREQUENCY_LABELS = [
  "Nooit",
  "1× per maand",
  "1× per week",
  "2× per week",
  "3–4× per week",
  "5–6× per week",
  "1× per dag",
  "2× per dag",
];

const PER_DAY_LABELS = ["Nooit", "1× per dag", "2× per dag", "3× per dag", "4× of meer"];
const PER_DAY_VALUES = [0, 1, 2, 3, 4];

const PER_WEEK_LABELS = ["Nooit", "1× per week", "2× per week", "3× per week", "4× per week", "5× of meer"];
const PER_WEEK_VALUES = [0, 1, 2, 3, 4, 5];

const PERCENT_LABELS = ["0%", "25%", "50%", "75%", "100%"];

const FREQ_GOOD = [0, 0.15, 0.35, 0.55, 0.75, 0.9, 1, 1];
const FREQ_BAD = [1, 0.9, 0.75, 0.55, 0.35, 0.2, 0.1, 0];

function buildStops(
  labels: string[],
  weights: number[],
  report?: (index: number) => Partial<NutritionSelfReport> | undefined,
): SliderStop[] {
  return labels.map((label, index) => {
    const fragment = report?.(index);
    return fragment ? { label, weight: weights[index], report: fragment } : { label, weight: weights[index] };
  });
}

const ALLERGIES_QUESTION: MultiQuestion = {
  kind: "multi",
  id: "allergies",
  prompt: "Heb je allergieën of intoleranties?",
  helper: "kies wat van toepassing is — beïnvloedt later je advies",
  options: [
    { value: "noten", label: "Noten" },
    { value: "vis", label: "Vis" },
    { value: "zeevruchten", label: "Zeevruchten" },
    { value: "eieren", label: "Eieren" },
    { value: "melk", label: "Melk" },
    { value: "lactose", label: "Lactose" },
    { value: "tarwe", label: "Tarwe (gluten)" },
  ],
};

const PREFERENCE_QUESTION: SingleQuestion = {
  kind: "single",
  id: "preference",
  prompt: "Wat past het best bij hoe jij eet?",
  options: [
    { value: "none", label: "Geen specifieke voorkeur" },
    { value: "pescatarian", label: "Pescotariër (vegetarisch, maar ik eet vis)" },
    { value: "vegetarian", label: "Vegetariër" },
    { value: "vegan", label: "Veganist" },
  ],
};

const SLIDER_BY_ID: Record<string, SliderQuestion> = {
  vegetables: {
    kind: "slider",
    id: "vegetables",
    prompt: "Hoeveel porties magnesiumrijke voeding eet je op een gewone dag?",
    helper: "bijv. bladgroenten, broccoli, noten, peulvruchten",
    scale: "perDay",
    defaultIndex: 1,
    stops: buildStops(
      PER_DAY_LABELS,
      [0, 0.35, 0.65, 0.9, 1],
      (i) => ({ vegFruitPerDay: PER_DAY_VALUES[i] }),
    ),
  },
  nutsSeedsLegumes: {
    kind: "slider",
    id: "nutsSeedsLegumes",
    prompt: "Hoe vaak eet je noten, zaden of peulvruchten (los van je warme maaltijd)?",
    helper: "bijv. handvol noten, lijnzaad, hummus, kidneybonen",
    scale: "perWeek",
    defaultIndex: 1,
    stops: buildStops(
      PER_WEEK_LABELS,
      [0, 0.5, 0.75, 0.9, 1, 1],
      (i) => ({ nutsSeedsLegumesPerWeek: PER_WEEK_VALUES[i] }),
    ),
  },
  oilyFish: {
    kind: "slider",
    id: "oilyFish",
    prompt: "Hoe vaak heb je de afgelopen week vette vis gegeten?",
    helper: "bijv. zalm, makreel, haring — of kies 'Ik eet geen vis'",
    scale: "perWeek",
    defaultIndex: 0,
    optOut: { label: "Ik eet geen vis" },
    stops: buildStops(
      PER_WEEK_LABELS,
      [0, 0.5, 1, 1, 1, 1],
      (i) => ({ oilyFishPerWeek: PER_WEEK_VALUES[i] }),
    ),
  },
  proteinMeals: {
    kind: "slider",
    id: "proteinMeals",
    prompt: "Hoeveel eetmomenten zijn op een gewone dag eiwitrijk?",
    helper: "bijv. ei, kwark, kip, vis, peulvruchten",
    scale: "perDay",
    defaultIndex: 1,
    stops: buildStops(
      PER_DAY_LABELS,
      [0, 0.4, 0.7, 1, 1],
      (i) => ({ proteinMealsPerDay: PER_DAY_VALUES[i] }),
    ),
  },
  meatLegumes: {
    kind: "slider",
    id: "meatLegumes",
    prompt: "Hoeveel porties vlees, vis of peulvruchten eet je op een gewone dag?",
    helper: "bijv. kip, rundvlees, vis, linzen, bonen",
    scale: "perDay",
    defaultIndex: 1,
    optOut: { label: "Ik eet geen vlees of vis" },
    stops: buildStops(
      PER_DAY_LABELS,
      [0, 0.5, 0.85, 1, 1],
      (i) => ({ meatLegumesPerDay: PER_DAY_VALUES[i] }),
    ),
  },
  dairy: {
    kind: "slider",
    id: "dairy",
    prompt: "Hoeveel porties zuivel eet je op een gewone dag?",
    helper: "bijv. melk, yoghurt, kwark, kaas — of kies 'Ik eet geen zuivel'",
    scale: "perDay",
    defaultIndex: 1,
    optOut: { label: "Ik eet geen zuivel" },
    stops: buildStops(
      PER_DAY_LABELS,
      [0.4, 0.8, 1, 0.9, 0.8],
      (i) => ({ dairyServingsPerDay: PER_DAY_VALUES[i] }),
    ),
  },
  daylight: {
    kind: "slider",
    id: "daylight",
    prompt: "Hoe vaak ben je in een gewone week ≥ 15 minuten buiten in daglicht?",
    helper: "huid aan daglicht — ook bij bewolking",
    scale: "perWeek",
    defaultIndex: 2,
    stops: buildStops(
      ["Zelden", "1–2× per week", "3× per week", "4–5× per week", "6× per week", "Dagelijks"],
      [0, 0.3, 0.6, 0.8, 0.9, 1],
      (i) => ({ sunExposurePerWeek: [0, 1, 3, 4, 6, 7][i] }),
    ),
  },
  fruit: {
    kind: "slider",
    id: "fruit",
    prompt: "Hoe vaak heb je de afgelopen week een stuk fruit gegeten?",
    helper: "bijv. banaan, appel, sinaasappel",
    scale: "frequency",
    defaultIndex: 3,
    stops: buildStops(FREQUENCY_LABELS, FREQ_GOOD),
  },
  berries: {
    kind: "slider",
    id: "berries",
    prompt: "Hoe vaak heb je de afgelopen week bessen gegeten?",
    helper: "bijv. aardbeien, bosbessen, frambozen",
    scale: "frequency",
    defaultIndex: 2,
    stops: buildStops(FREQUENCY_LABELS, FREQ_GOOD),
  },
  wholegrain: {
    kind: "slider",
    id: "wholegrain",
    prompt: "Hoeveel van het brood en de granen die je eet is volkoren?",
    helper: "bijv. volkorenbrood, zilvervliesrijst, havermout",
    scale: "percentage",
    defaultIndex: 2,
    stops: buildStops(PERCENT_LABELS, [0, 0.25, 0.5, 0.75, 1]),
  },
  sugaryDrinks: {
    kind: "slider",
    id: "sugaryDrinks",
    prompt: "Hoe vaak drink je suikerhoudende dranken of eet je snoep?",
    helper: "bijv. frisdrank, sportdrank, koek, snoep",
    scale: "frequency",
    defaultIndex: 2,
    stops: buildStops(FREQUENCY_LABELS, FREQ_BAD),
  },
};

function slidersForIds(ids: readonly string[]): SliderQuestion[] {
  return ids.map((id) => SLIDER_BY_ID[id]);
}

/** Volledige flow: kern vóór dieet → meta → kern na dieet → breedte (breedte optioneel in UI). */
export const NUTRITION_FLOW: NutritionQuestion[] = [
  ...slidersForIds(NUTRITION_CORE_SLIDER_IDS_BEFORE_DIET),
  ALLERGIES_QUESTION,
  PREFERENCE_QUESTION,
  ...slidersForIds(NUTRITION_CORE_SLIDER_IDS_AFTER_DIET),
  ...slidersForIds(NUTRITION_BREADTH_SLIDER_IDS),
];

/** Alias — alle consumers gebruiken de herordende flow. */
export const NUTRITION_QUESTIONS = NUTRITION_FLOW;

export const NUTRITION_META_QUESTIONS: NutritionQuestion[] = [
  ALLERGIES_QUESTION,
  PREFERENCE_QUESTION,
];

export const NUTRITION_REQUIRED_STEP_COUNT =
  NUTRITION_CORE_SLIDER_IDS.length + NUTRITION_META_QUESTIONS.length;

export const NUTRITION_BREADTH_STEP_COUNT = NUTRITION_BREADTH_SLIDER_IDS.length;

export const NUTRITION_TOTAL_STEPS =
  NUTRITION_REQUIRED_STEP_COUNT + NUTRITION_BREADTH_STEP_COUNT;

export function nutritionSliderQuestion(id: string): SliderQuestion | undefined {
  const question = SLIDER_BY_ID[id];
  return question ?? undefined;
}
