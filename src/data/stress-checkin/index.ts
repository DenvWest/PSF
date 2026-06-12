export type StressDimensionKey = "spanning" | "herstel";
export type StressBand = "aandacht" | "redelijk" | "sterk";

export type StressQuestion = {
  field: "STR_FREQ" | "STR_RCV";
  dimension: StressDimensionKey;
  question: string;
  options: { label: string; value: number }[];
};

// Exact dezelfde schaal als de intake — kritiek voor vergelijkbaarheid met je nulpunt.
export const STRESS_QUESTIONS: StressQuestion[] = [
  {
    field: "STR_FREQ",
    dimension: "spanning",
    question: "Hoe vaak voel je je gestrest of overprikkeld?",
    options: [
      { label: "Zelden", value: 4 },
      { label: "Soms, maar beheersbaar", value: 3 },
      { label: "Regelmatig", value: 2 },
      { label: "Dagelijks of bijna dagelijks", value: 1 },
    ],
  },
  {
    field: "STR_RCV",
    dimension: "herstel",
    question: "Lukt het je om op een drukke dag tot rust te komen en herstelmomenten te pakken?",
    options: [
      { label: "Ja — ik kan loslaten én neem bewust rust", value: 4 },
      { label: "Het kost tijd, maar ik vind wel herstelmomenten", value: 3 },
      { label: "Stress stapelt op of herstel blijft achterwege", value: 2 },
      { label: "Ik neem stress mee en kom niet aan ontspanning", value: 1 },
    ],
  },
];

// VOORUITKIJKEND SIGNAAL — NIET in calcDomainScores, NIET in stress_score.
// Opgeslagen in raw_inputs.grip; brandstof voor een later puntensysteem / home-surface / upsell. Schaal 1–5.
export const STRESS_REGIE_QUESTION = {
  field: "grip" as const,
  question: "Heb je het gevoel dat je zelf grip hebt op je stress?",
  options: [
    { label: "Nee, het overkomt me", value: 1 },
    { label: "Meestal niet", value: 2 },
    { label: "Soms wel, soms niet", value: 3 },
    { label: "Meestal wel", value: 4 },
    { label: "Ja, ik heb het in de hand", value: 5 },
  ],
};

// Gedrag/beleving tegen jezelf — nooit norm/status.
export const STRESS_STATEMENTS: Record<StressDimensionKey, Record<StressBand, string>> = {
  spanning: {
    aandacht: "Stress is nu vaak aanwezig — je staat veel 'aan'. Juist daar valt rust te winnen.",
    redelijk: "Stress speelt soms op, maar je houdt het redelijk in de hand.",
    sterk: "Je voelt je weinig overprikkeld — mooi, je staat lekker in balans.",
  },
  herstel: {
    aandacht: "Tot rust komen lukt nu moeizaam — herstelmomenten schieten erbij in.",
    redelijk: "Je vindt soms je rust; er is ruimte om dat bewuster te doen.",
    sterk: "Je weet goed te schakelen naar rust — dat beschermt je tegen opbouw.",
  },
};

// Vrije keuze — simpel en gratis. De man kiest zelf; geen verkeerd antwoord.
export const STRESS_CHOICES: Record<StressDimensionKey, string[]> = {
  spanning: [
    "Eén bewust rustmoment van 10 minuten op een vaste tijd vandaag",
    "Leg je telefoon 30 minuten vóór bedtijd buiten bereik",
    "Beperk cafeïne na 14:00 als je 's avonds moeilijk tot rust komt",
    "Even naar buiten lopen op het moment dat de druk oploopt",
  ],
  herstel: [
    "Adem een paar keer rustig uit vóór je aan iets nieuws begint",
    "Een korte wandeling zonder telefoon",
    "Haal één ding van je lijst dat alleen energie kost",
    "Ga op een vast tijdstip naar bed, ook in een drukke week",
  ],
};

export const STRESS_DEEPEN: Record<StressDimensionKey, string> = {
  spanning: "Wil je verder? Bouw een vast dagritme — dezelfde sta-op- en rustmomenten geven je zenuwstelsel houvast.",
  herstel: "Wil je verder? Koppel je rustmoment aan iets vasts (na het eten, vóór bed) zodat het vanzelf gaat.",
};

// Verbinding/validatie bij de regie-score — nooit een sale, nooit status/diagnose.
export function regieReflection(grip: number): string {
  if (grip <= 2)
    return "Dat je hier nog zoekt is heel normaal — de meeste mannen krijgen dit er niet vanzelf bij. Je hoeft het niet in één keer op te lossen.";
  if (grip === 3)
    return "Je bent op weg. De stappen die je koos maken je grip stap voor stap groter.";
  return "Mooi — je pakt dit zelf op. Houd vast wat voor jou werkt.";
}
