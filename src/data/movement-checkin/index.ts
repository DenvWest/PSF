export type MovementDimensionKey = "kracht" | "conditie";
export type MovementBand = "aandacht" | "redelijk" | "sterk";

export type MovementQuestion = {
  field: "MOV_STR" | "MOV_CARD";
  dimension: MovementDimensionKey;
  question: string;
  options: { label: string; value: number }[];
};

export const MOVEMENT_QUESTIONS: MovementQuestion[] = [
  {
    field: "MOV_STR",
    dimension: "kracht",
    question: "Doe je kracht- of weerstandstraining (gewichten, banden, eigen lichaamsgewicht)?",
    options: [
      { label: "Ja, 2x per week of vaker", value: 4 },
      { label: "Ja, ongeveer 1x per week", value: 3 },
      { label: "Minder dan 1x per week", value: 2 },
      { label: "Zelden of nooit", value: 1 },
    ],
  },
  {
    field: "MOV_CARD",
    dimension: "conditie",
    question:
      "Hoe vaak beweeg je matig intensief — stevig doorwandelen, fietsen of sport waarbij praten nog lukt, maar zingen niet?",
    options: [
      { label: "3x per week of meer", value: 4 },
      { label: "1-2x per week", value: 3 },
      { label: "Minder dan 1x per week", value: 2 },
      { label: "Zelden of nooit", value: 1 },
    ],
  },
];

export const MOVEMENT_STATEMENTS: Record<MovementDimensionKey, Record<MovementBand, string>> = {
  kracht: {
    aandacht: "Krachttraining schiet er nu bij in — en juist daar valt na 40 het meest te winnen.",
    redelijk: "Je doet al iets aan kracht. Er is ruimte om er net wat consistenter in te worden.",
    sterk: "Je traint kracht stevig — mooi, dat houdt je spieren op peil.",
  },
  conditie: {
    aandacht: "Cardio schiet er nu bij in — een beetje meer beweging tilt je conditie al merkbaar.",
    redelijk: "Je conditie krijgt al wat aandacht. Er is ruimte om vaker even door te pakken.",
    sterk: "Je conditie houd je goed bij — fijn, dat merk je in je dagelijkse energie.",
  },
};

export const MOVEMENT_CHOICES: Record<MovementDimensionKey, string[]> = {
  kracht: [
    "Opstaan uit een stoel zonder je handen — een paar keer achter elkaar",
    "Kniebuigingen of opdrukken tegen het aanrecht",
    "Boodschappentassen of een krat bewust tillen, rug recht",
    "Plan één krachtsessie met squat, push en pull — korter dan gewoon",
  ],
  conditie: [
    "Neem de trap in plaats van de lift — of loop 20 minuten stevig",
    "Loop 30 minuten matig intensief — praten lukt, zingen niet",
    "Tijdens een wandeling 3× 1 minuut stevig doorstappen, daarna rustig verder",
    "Korte ritjes op de fiets in plaats van de auto",
  ],
};

export const MOVEMENT_DEEPEN: Record<MovementDimensionKey, string> = {
  kracht:
    "Wil je verder? Bouw rustig op naar 2× per week full-body — squat, push, pull en hip hinge. " +
    "Zwaar genoeg dat de laatste herhalingen pittig zijn, met 48–72 uur rust tussen krachtdagen.",
  conditie:
    "Wil je verder? Begin met stevig wandelen of traplopen, daarna 2× per week 30 min matig intensief (zone 2). " +
    "Praten-nog-lukt is je test — geen hartslagmeter nodig.",
};
