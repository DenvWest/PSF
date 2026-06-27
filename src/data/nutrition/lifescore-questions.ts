/**
 * Data-gedreven vragenset voor de Lifesum-stijl voedingscheck.
 *
 * Principe: elke vraag definieert zijn EIGEN antwoord-schaal (stops) — niet één
 * vaste schaal voor alle vragen. Elke stop draagt een `weight` (0..1 wenselijkheid)
 * voor de score en optioneel een `report`-fragment dat de bestaande nutriënten-
 * inname-engine (NutritionSelfReport) voedt.
 *
 * Uitbreidbaar: een nieuwe slider-vraag toevoegen = één object met label-reeks +
 * gewichten. Geen scoring-logica in de UI — alles leeft hier en in nutrition-score.ts.
 */

import type { NutritionSelfReport } from "@/lib/nutrition-intake-estimate";

/** Type antwoord-schaal — bepaalt alleen het label-bereik, niet de scoring. */
export type NutritionScale = "frequency" | "perDay" | "perWeek" | "percentage";

export interface SliderStop {
  /** Label dat live boven de balk verschijnt (bv. "Twee keer per week"). */
  label: string;
  /** Wenselijkheid 0..1 voor de voeding-score. */
  weight: number;
  /** Optioneel fragment dat de nutriënten-inname-schatting voedt. */
  report?: Partial<NutritionSelfReport>;
}

export interface SliderQuestion {
  kind: "slider";
  id: string;
  prompt: string;
  helper?: string;
  scale: NutritionScale;
  /** Startpositie van de thumb. */
  defaultIndex: number;
  stops: SliderStop[];
  /** Weging van deze vraag in de totaalscore (default 1). */
  weight?: number;
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

/* ── Herbruikbare schaal-presets ─────────────────────────────────── */

/** 8-staps frequentie (Nooit → 2× per dag). */
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

/** "Meer is beter" met plateau (8 stops). */
const FREQ_GOOD = [0, 0.15, 0.35, 0.55, 0.75, 0.9, 1, 1];
/** "Minder is beter" (8 stops, omgekeerd). */
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

/* ── Vragenset ───────────────────────────────────────────────────── */

export const NUTRITION_QUESTIONS: NutritionQuestion[] = [
  {
    kind: "slider",
    id: "fruit",
    prompt: "Hoe vaak heb je de afgelopen week een stuk fruit gegeten?",
    helper: "bijv. banaan, appel, sinaasappel",
    scale: "frequency",
    defaultIndex: 3,
    stops: buildStops(FREQUENCY_LABELS, FREQ_GOOD),
  },
  {
    kind: "slider",
    id: "berries",
    prompt: "Hoe vaak heb je de afgelopen week bessen gegeten?",
    helper: "bijv. aardbeien, bosbessen, frambozen",
    scale: "frequency",
    defaultIndex: 2,
    stops: buildStops(FREQUENCY_LABELS, FREQ_GOOD),
  },
  {
    kind: "slider",
    id: "vegetables",
    prompt: "Hoeveel porties groente eet je op een gewone dag?",
    helper: "bijv. bladgroenten, broccoli, wortel, paprika",
    scale: "perDay",
    defaultIndex: 1,
    stops: buildStops(
      PER_DAY_LABELS,
      [0, 0.35, 0.65, 0.9, 1],
      (i) => ({ vegFruitPerDay: PER_DAY_VALUES[i] }),
    ),
  },
  {
    kind: "slider",
    id: "wholegrain",
    prompt: "Hoeveel van het brood en de granen die je eet is volkoren?",
    helper: "bijv. volkorenbrood, zilvervliesrijst, havermout",
    scale: "percentage",
    defaultIndex: 2,
    stops: buildStops(PERCENT_LABELS, [0, 0.25, 0.5, 0.75, 1]),
  },
  {
    kind: "slider",
    id: "oilyFish",
    prompt: "Hoe vaak heb je de afgelopen week vette vis gegeten?",
    helper: "bijv. zalm, makreel, haring, sardines",
    scale: "perWeek",
    defaultIndex: 1,
    stops: buildStops(
      PER_WEEK_LABELS,
      [0, 0.5, 1, 1, 1, 1],
      (i) => ({ oilyFishPerWeek: PER_WEEK_VALUES[i] }),
    ),
  },
  {
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
  {
    kind: "slider",
    id: "meatLegumes",
    prompt: "Hoeveel porties vlees, vis of peulvruchten eet je op een gewone dag?",
    helper: "bijv. kip, rundvlees, vis, linzen, bonen",
    scale: "perDay",
    defaultIndex: 1,
    stops: buildStops(
      PER_DAY_LABELS,
      [0, 0.5, 0.85, 1, 1],
      (i) => ({ meatLegumesPerDay: PER_DAY_VALUES[i] }),
    ),
  },
  {
    kind: "slider",
    id: "dairy",
    prompt: "Hoeveel porties zuivel eet je op een gewone dag?",
    helper: "bijv. melk, yoghurt, kwark, kaas",
    scale: "perDay",
    defaultIndex: 1,
    stops: buildStops(
      PER_DAY_LABELS,
      [0.4, 0.8, 1, 0.9, 0.8],
      (i) => ({ dairyServingsPerDay: PER_DAY_VALUES[i] }),
    ),
  },
  {
    kind: "slider",
    id: "sugaryDrinks",
    prompt: "Hoe vaak drink je suikerhoudende dranken of eet je snoep?",
    helper: "bijv. frisdrank, sportdrank, koek, snoep",
    scale: "frequency",
    defaultIndex: 2,
    stops: buildStops(FREQUENCY_LABELS, FREQ_BAD),
  },
  {
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
  {
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
  },
  {
    kind: "single",
    id: "preference",
    prompt: "Wat past het best bij hoe jij eet?",
    options: [
      { value: "none", label: "Geen specifieke voorkeur" },
      { value: "pescatarian", label: "Pescotariër (vegetarisch, maar ik eet vis)" },
      { value: "vegetarian", label: "Vegetariër" },
      { value: "vegan", label: "Veganist" },
    ],
  },
];
