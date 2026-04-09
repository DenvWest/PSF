/**
 * Intake-vragenlijst (sectie 2: Vragenlijst-ontwerp).
 * Indien docs/intake-spec.md wordt gevuld, stem teksten hier 1-op-1 af op die spec.
 */

export const DOMAIN_IDS = [
  "slaap",
  "energie",
  "stress",
  "basis",
  "beweging",
  "stille_belasting",
] as const;

export type DomainId = (typeof DOMAIN_IDS)[number];

/** Max numerieke waarde van een antwoordoptie (laag 2-normalisatie in de engine). */
export const MAX_OPTION_VALUE = 3;

export interface IntakeSymptom {
  id: string;
  icon: string;
  label: string;
  desc: string;
}

export interface IntakeCategory {
  id: DomainId;
  label: string;
  icon: string;
  /** CSS-kleur of hex voor UI (bijv. #6366f1). */
  color: string;
}

export interface IntakeQuestionOption {
  label: string;
  /** Zwaarte / belasting: 0 = minst, MAX_OPTION_VALUE = meest (slechter voor gezondheid). */
  value: number;
}

export interface IntakeQuestion {
  /** Data-tag voor analytics en antwoord-map. */
  id: string;
  category: DomainId;
  questionIndex: number;
  question: string;
  options: IntakeQuestionOption[];
}

const BURDEN_4: IntakeQuestionOption[] = [
  { label: "Nooit", value: 0 },
  { label: "Zelden", value: 1 },
  { label: "Regelmatig", value: 2 },
  { label: "Bijna altijd", value: 3 },
];

export const SYMPTOMS: IntakeSymptom[] = [
  {
    id: "stress",
    icon: "🧠",
    label: "Stress",
    desc: "Meer prikkelbaarheid, een hoofd dat niet stopt, spanning in je lijf.",
  },
  {
    id: "slaap",
    icon: "🌙",
    label: "Slaap",
    desc: "Moeite met inslapen, wakker liggen of nooit echt uitgerust opstaan.",
  },
  {
    id: "energie",
    icon: "⚡",
    label: "Energie",
    desc: "Een lege batterij halverwege de dag, minder drive en motivatie.",
  },
];

export const CATEGORIES: IntakeCategory[] = [
  { id: "slaap", label: "Slaap", icon: "🌙", color: "#6366f1" },
  { id: "energie", label: "Energie", icon: "⚡", color: "#10b981" },
  { id: "stress", label: "Stress", icon: "🧠", color: "#f59e0b" },
  { id: "basis", label: "Basis (voeding & ritme)", icon: "🥗", color: "#78716c" },
  { id: "beweging", label: "Beweging", icon: "🚶", color: "#0ea5e9" },
  { id: "stille_belasting", label: "Stille belasting", icon: "🔇", color: "#f43f5e" },
];

export const QUESTIONS: IntakeQuestion[] = [
  {
    id: "intake-slaap-inslapen",
    category: "slaap",
    questionIndex: 1,
    question: "Hoe vaak heb je moeite om ’s avonds tot rust te komen en in slaap te vallen?",
    options: BURDEN_4,
  },
  {
    id: "intake-slaap-uitgerust",
    category: "slaap",
    questionIndex: 2,
    question: "Hoe vaak sta je op en voel je je niet uitgerust, ook na voldoende uren in bed?",
    options: BURDEN_4,
  },
  {
    id: "intake-energie-dip",
    category: "energie",
    questionIndex: 3,
    question: "Hoe vaak heb je na de lunch een duidelijke energiedip of een zwaar hoofd?",
    options: BURDEN_4,
  },
  {
    id: "intake-energie-inspanning",
    category: "energie",
    questionIndex: 4,
    question: "Hoe vaak voelt je lichaam zich traag of zwaar bij normale dagelijkse dingen?",
    options: BURDEN_4,
  },
  {
    id: "intake-stress-lichaam",
    category: "stress",
    questionIndex: 5,
    question:
      "Hoe vaak merk je spanning in je lichaam (kaak, schouders, buik) zonder dat er iets groots speelt?",
    options: BURDEN_4,
  },
  {
    id: "intake-stress-irritatie",
    category: "stress",
    questionIndex: 6,
    question: "Hoe snel ben je geïrriteerd of kortaf als het druk wordt of onverwachts schuift?",
    options: BURDEN_4,
  },
  {
    id: "intake-basis-variatie",
    category: "basis",
    questionIndex: 7,
    question: "Hoe vaak eet je op een gemiddelde dag weinig gevarieerd (weinig groente, eiwit of vezels)?",
    options: BURDEN_4,
  },
  {
    id: "intake-basis-vocht",
    category: "basis",
    questionIndex: 8,
    question: "Hoe vaak drink je te weinig water gedurende de dag (dorst, donkere urine, hoofdpijn)?",
    options: BURDEN_4,
  },
  {
    id: "intake-beweging-zitten",
    category: "beweging",
    questionIndex: 9,
    question: "Hoe vaak zit je op een werkdag lang achter elkaar zonder echt te bewegen?",
    options: BURDEN_4,
  },
  {
    id: "intake-beweging-norm",
    category: "beweging",
    questionIndex: 10,
    question: "Hoe vaak lukt het niet om aan de beweegnorm te komen (minimaal matig intensief)?",
    options: BURDEN_4,
  },
  {
    id: "intake-stille-maaltijd",
    category: "stille_belasting",
    questionIndex: 11,
    question: "Hoe vaak heb je een opgeblazen of zwaar gevoel na maaltijden, terwijl je niet veel gegeten hebt?",
    options: BURDEN_4,
  },
  {
    id: "intake-stille-alcohol",
    category: "stille_belasting",
    questionIndex: 12,
    question: "Hoe vaak drink je meer dan één glas alcohol op een gemiddelde avond?",
    options: BURDEN_4,
  },
];
