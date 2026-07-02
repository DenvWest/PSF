export type StressDimensionKey = "spanning" | "herstel";
export type StressBand = "aandacht" | "redelijk" | "sterk";
export type StressDeepField =
  | "STR_AUTO"
  | "STR_COMP"
  | "STR_REFL"
  | "STR_AWARE"
  | "STR_BLOCK"
  | "STR_CHARGE";

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

export const STRESS_DEEP_QUESTIONS: {
  field: StressDeepField;
  question: string;
  options: { label: string; value: number }[];
}[] = [
  {
    field: "STR_AUTO",
    question:
      "Als je merkt dat stress opbouwt, voel je dan dat je daar zelf invloed op hebt?",
    options: [
      { label: "Ik weet goed hoe ik mijn spanning kan verlagen", value: 4 },
      { label: "Meestal lukt dat wel", value: 3 },
      { label: "Soms, maar vaak ook niet", value: 2 },
      { label: "Nee, stress overkomt me meestal", value: 1 },
    ],
  },
  {
    field: "STR_COMP",
    question:
      "Hoeveel vertrouwen heb je dat je ook op drukke dagen een gezonde gewoonte kunt volhouden?",
    options: [
      { label: "Heel veel vertrouwen", value: 4 },
      { label: "Redelijk veel", value: 3 },
      { label: "Beperkt", value: 2 },
      { label: "Nauwelijks", value: 1 },
    ],
  },
  {
    field: "STR_REFL",
    question: "Wat gebeurt er meestal als jij veel stress ervaart?",
    options: [
      { label: "Ik zoek bewust herstel", value: 4 },
      { label: "Ik blijf doorgaan", value: 3 },
      { label: "Ik stel gezonde keuzes uit", value: 2 },
      { label: "Ik weet eigenlijk niet goed wat er gebeurt", value: 1 },
    ],
  },
  {
    field: "STR_AWARE",
    question: "Hoe vaak merk je pas achteraf dat je eigenlijk te gespannen was?",
    options: [
      { label: "Bijna nooit", value: 4 },
      { label: "Soms", value: 3 },
      { label: "Regelmatig", value: 2 },
      { label: "Heel vaak", value: 1 },
    ],
  },
  {
    field: "STR_BLOCK",
    question: "Wat houdt je het vaakst tegen om een paar minuten voor jezelf te nemen?",
    options: [
      { label: "Ik vergeet het", value: 4 },
      { label: "Ik heb geen tijd", value: 3 },
      { label: "Ik voel me schuldig als ik niets doe", value: 2 },
      { label: "Ik weet niet goed wat helpt", value: 1 },
    ],
  },
  {
    field: "STR_CHARGE",
    question: "Wanneer voelde je je voor het laatst echt opgeladen?",
    options: [
      { label: "Vandaag", value: 4 },
      { label: "Afgelopen week", value: 3 },
      { label: "Afgelopen maand", value: 2 },
      { label: "Dat kan ik me nauwelijks herinneren", value: 1 },
    ],
  },
];

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

export function stressDeepReflection(values: Partial<Record<StressDeepField, number>>): string {
  const autonomy = values.STR_AUTO ?? 3;
  const competence = values.STR_COMP ?? 3;
  const charge = values.STR_CHARGE ?? 3;

  if (autonomy <= 2 || competence <= 2) {
    return "Je winst zit nu in simpele, vaste rituelen. Kies 1 resetmoment dat elke dag terugkomt.";
  }
  if (charge <= 2) {
    return "Je herstelvoorraad is laag. Plan deze week bewust twee avonden met minder prikkels.";
  }
  return "Je basis is sterk. Veranker je ritme met vaste overgangsmomenten zodat stress minder opstapelt.";
}
