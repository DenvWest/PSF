/**
 * Data-gedreven vragenset voor de Lifesum-stijl voedingscheck.
 *
 * Flow (P1): planten → allergie → voorkeur → dieet-sliders (13 kernvragen).
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

export type NutritionQuestionHelp = {
  title: string;
  body: string;
  anchor: string | null;
  benchmarkLabel: string | null;
  benchmarkKind: "populatierichtlijn" | "vuistregel" | null;
  source: string | null;
};

export interface SliderQuestion {
  kind: "slider";
  id: string;
  prompt: string;
  helper?: string;
  help?: NutritionQuestionHelp;
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
  help?: NutritionQuestionHelp;
  options: { value: string; label: string }[];
}

export interface SingleQuestion {
  kind: "single";
  id: string;
  prompt: string;
  helper?: string;
  help?: NutritionQuestionHelp;
  options: { value: string; label: string }[];
}

export type NutritionQuestion = SliderQuestion | MultiQuestion | SingleQuestion;

export const NUTRITION_CORE_SLIDER_IDS_BEFORE_DIET = [
  "vegetables",
  "fruit",
  "berries",
] as const;

export const NUTRITION_CORE_SLIDER_IDS_AFTER_DIET = [
  "nutsSeedsLegumes",
  "oilyFish",
  "proteinMeals",
  "meatLegumes",
  "dairy",
  "daylight",
  "wholegrain",
  "sugaryDrinks",
] as const;

/** Alle kern-sliders in volgorde (vóór + na dieet-meta). */
export const NUTRITION_CORE_SLIDER_IDS = [
  ...NUTRITION_CORE_SLIDER_IDS_BEFORE_DIET,
  ...NUTRITION_CORE_SLIDER_IDS_AFTER_DIET,
] as const;

export type NutritionCoreSliderId = (typeof NUTRITION_CORE_SLIDER_IDS)[number];
export type NutritionCoreSliderAfterDietId = (typeof NUTRITION_CORE_SLIDER_IDS_AFTER_DIET)[number];

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
  help: {
    title: "Waarom we hiernaar vragen",
    body: "Een advies dat je niet kúnt uitvoeren is geen advies. Wat je aanvinkt slaan we alleen op om vragen over te slaan die voor jou niet gelden, en om je vervolgstappen erop aan te passen.",
    anchor: null,
    benchmarkLabel: null,
    benchmarkKind: null,
    source: null,
  },
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
  help: {
    title: "Waarom je eetpatroon telt",
    body: "Vegetarisch, veganistisch en pescotarisch eten verschuift welke bronnen realistisch voor je zijn — en bij veganistisch eten geldt één punt dat voor niemand anders geldt. Je krijgt daardoor andere vervolgstappen, niet een strenger oordeel.",
    anchor: null,
    benchmarkLabel: null,
    benchmarkKind: null,
    source: null,
  },
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
    help: {
      title: "Waarom plantporties tellen",
      body: "Planten leveren vezels, kalium, magnesium en foliumzuur in één keer — daarom vragen we naar porties in plaats van naar losse stoffen. Op je resultaat zie je dit terug als je plantbasis, samen met je fruit-antwoord.",
      anchor: "C4",
      benchmarkLabel: "Populatierichtlijn: ≥400 g groente en fruit per dag (WHO 2020)",
      benchmarkKind: "populatierichtlijn",
      source: "WHO 2020",
    },
    scale: "perDay",
    defaultIndex: 1,
    stops: buildStops(
      PER_DAY_LABELS,
      [0, 0.35, 0.65, 0.9, 1],
      (i) => ({ vegFruitPerDay: PER_DAY_VALUES[i] }),
    ),
  },
  fruit: {
    kind: "slider",
    id: "fruit",
    prompt: "Hoe vaak heb je de afgelopen week een stuk fruit gegeten?",
    helper: "bijv. banaan, appel, sinaasappel",
    help: {
      title: "Waarom fruit los telt",
      body: "Fruit en groente tellen samen op naar dezelfde dagelijkse hoeveelheid, maar bijna niemand schat ze in één keer goed in. Apart vragen geeft een scherper plantbeeld op je resultaat.",
      anchor: "C4",
      benchmarkLabel: "Onderdeel van: ≥400 g groente en fruit per dag (WHO 2020)",
      benchmarkKind: "populatierichtlijn",
      source: "WHO 2020",
    },
    scale: "frequency",
    defaultIndex: 3,
    stops: buildStops(FREQUENCY_LABELS, FREQ_GOOD),
  },
  berries: {
    kind: "slider",
    id: "berries",
    prompt: "Hoe vaak heb je de afgelopen week bessen gegeten?",
    helper: "bijv. aardbeien, bosbessen, frambozen",
    help: {
      title: "Waarom juist bessen",
      body: "Bessen zijn geen aparte gezondheidsklasse — we vragen ernaar omdat ze de variatie in je plantpatroon zichtbaar maken, en variatie is iets anders dan hoeveelheid.",
      anchor: "C4",
      benchmarkLabel: "geen norm — dit is jouw eigen ijkpunt",
      benchmarkKind: null,
      source: null,
    },
    scale: "frequency",
    defaultIndex: 2,
    stops: buildStops(FREQUENCY_LABELS, FREQ_GOOD),
  },
  nutsSeedsLegumes: {
    kind: "slider",
    id: "nutsSeedsLegumes",
    prompt: "Hoe vaak eet je noten, zaden of peulvruchten (los van je warme maaltijd)?",
    helper: "bijv. handvol noten, lijnzaad, hummus, kidneybonen",
    help: {
      title: "Waarom noten en peulvruchten",
      body: "Dit is de losse-momenten-vraag: noten, zaden en peulvruchten buiten je warme maaltijd om. Ze zijn de dichtste bron van vezels en magnesium in een normaal Nederlands eetpatroon. Je ziet dit terug in je plantbasis.",
      anchor: "C3",
      benchmarkLabel: "geen norm — dit is jouw eigen ijkpunt",
      benchmarkKind: null,
      source: null,
    },
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
    help: {
      title: "Waarom vette vis apart",
      body: "Vette vis is de enige gewone voedingsbron van EPA en DHA. Eén keer per week is de Nederlandse basis; wie geen vis eet krijgt daar op zijn resultaat een aparte regel over.",
      anchor: "C3",
      benchmarkLabel: "Populatierichtlijn: 1× per week vis, bij voorkeur vet (Gezondheidsraad 2015)",
      benchmarkKind: "populatierichtlijn",
      source: "Gezondheidsraad 2015",
    },
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
    help: {
      title: "Waarom eetmomenten, niet grammen",
      body: "Voor mannen boven de veertig doet de *verdeling* over de dag meer dan het dagtotaal — daarom tellen we momenten. Op je resultaat zie je of je eiwit over de dag verdeeld staat of op één maaltijd hangt.",
      anchor: "C3",
      benchmarkLabel: "Vuistregel: 3 eiwitrijke eetmomenten per dag (PROT-AGE 2013)",
      benchmarkKind: "vuistregel",
      source: "PROT-AGE 2013",
    },
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
    help: {
      title: "Waarom deze eiwitbronnen",
      body: "Vlees, vis en peulvruchten zijn de dragende eiwit- en zinkbronnen in de meeste eetpatronen. We vragen ze los van je eetmomenten omdat de bron iets anders zegt dan het ritme.",
      anchor: "C3",
      benchmarkLabel: "geen norm — dit is jouw eigen ijkpunt",
      benchmarkKind: null,
      source: null,
    },
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
    help: {
      title: "Waarom zuivel apart",
      body: "Zuivel is voor veel mannen de stille helft van hun eiwit en calcium. We vragen ernaar om te voorkomen dat we een eiwitgat zien dat er niet is. Meer is hier niet beter — daarom telt deze vraag anders dan de rest.",
      anchor: "C3",
      benchmarkLabel: "geen norm — dit is jouw eigen ijkpunt",
      benchmarkKind: null,
      source: null,
    },
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
    help: {
      title: "Waarom een vraag over buiten",
      body: "Dit is geen eetvraag. Je vitamine D komt in Nederland vooral van je huid, niet van je bord — zonder deze vraag zouden we een tekort aan je eten toeschrijven dat daar niet vandaan komt. Je ziet hem op je resultaat apart staan, buiten je eetbeeld.",
      anchor: null,
      benchmarkLabel: "Vuistregel: dagelijks 15 minuten buiten, huid onbedekt",
      benchmarkKind: "vuistregel",
      source: null,
    },
    scale: "perWeek",
    defaultIndex: 2,
    stops: buildStops(
      ["Zelden", "1–2× per week", "3× per week", "4–5× per week", "6× per week", "Dagelijks"],
      [0, 0.3, 0.6, 0.8, 0.9, 1],
      (i) => ({ sunExposurePerWeek: [0, 1, 3, 4, 6, 7][i] }),
    ),
  },
  wholegrain: {
    kind: "slider",
    id: "wholegrain",
    prompt: "Hoeveel van het brood en de granen die je eet is volkoren?",
    helper: "bijv. volkorenbrood, zilvervliesrijst, havermout",
    help: {
      title: "Waarom volkoren-aandeel",
      body: "Hier vragen we een verhouding en geen aantal: van het brood en de granen die je tóch al eet, hoeveel is volkoren. Dat is de grootste vezelknop in een Nederlands eetpatroon en je ziet hem terug in je vezelbeeld.",
      anchor: "C4",
      benchmarkLabel:
        "Populatierichtlijn: 25 g vezels per dag (Gezondheidsraad 2015) — deze vraag schat het aandeel, niet de grammen",
      benchmarkKind: "populatierichtlijn",
      source: "Gezondheidsraad 2015",
    },
    scale: "percentage",
    defaultIndex: 2,
    stops: buildStops(PERCENT_LABELS, [0, 0.25, 0.5, 0.75, 1]),
  },
  sugaryDrinks: {
    kind: "slider",
    id: "sugaryDrinks",
    prompt: "Hoe vaak drink je suikerhoudende dranken of eet je snoep?",
    helper: "bijv. frisdrank, sportdrank, koek, snoep",
    help: {
      title: "Waarom frequentie, niet hoeveelheid",
      body: "Bij suiker voorspelt hoe vaak meer dan hoeveel per keer: het gaat om hoe vaak het je standaardkeuze is. Op je resultaat komt dit terug bij wat je kunt minderen, niet bij wat je mist.",
      anchor: "C5",
      benchmarkLabel:
        "Populatierichtlijn: vrije suikers onder 10% van je energie (WHO 2015) — deze vraag schat frequentie, niet procenten",
      benchmarkKind: "populatierichtlijn",
      source: "WHO 2015",
    },
    scale: "frequency",
    defaultIndex: 2,
    stops: buildStops(FREQUENCY_LABELS, FREQ_BAD),
  },
};

function slidersForIds(ids: readonly string[]): SliderQuestion[] {
  return ids.map((id) => SLIDER_BY_ID[id]);
}

/** Volledige flow: kern vóór dieet → meta → kern na dieet. */
export const NUTRITION_FLOW: NutritionQuestion[] = [
  ...slidersForIds(NUTRITION_CORE_SLIDER_IDS_BEFORE_DIET),
  ALLERGIES_QUESTION,
  PREFERENCE_QUESTION,
  ...slidersForIds(NUTRITION_CORE_SLIDER_IDS_AFTER_DIET),
];

/** Alias — alle consumers gebruiken de herordende flow. */
export const NUTRITION_QUESTIONS = NUTRITION_FLOW;

export const NUTRITION_META_QUESTIONS: NutritionQuestion[] = [
  ALLERGIES_QUESTION,
  PREFERENCE_QUESTION,
];

export const NUTRITION_REQUIRED_STEP_COUNT =
  NUTRITION_CORE_SLIDER_IDS.length + NUTRITION_META_QUESTIONS.length;

export function nutritionSliderQuestion(id: string): SliderQuestion | undefined {
  const question = SLIDER_BY_ID[id];
  return question ?? undefined;
}
