export type SymptomId = "stress" | "slaap" | "energie";

export interface Symptom {
  id: SymptomId;
  icon: string;
  label: string;
  desc: string;
}

export type CategoryId =
  | "slaap"
  | "energie"
  | "stress"
  | "voeding"
  | "beweging"
  | "herstel";

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
  color: string;
}

export type QuestionId =
  | "SLP_QUAL"
  | "SLP_CONS"
  | "NRG_PATN"
  | "NRG_DEP"
  | "STR_FREQ"
  | "STR_RECV"
  | "NUT_QUAL"
  | "NUT_O3"
  | "MOV_FREQ"
  | "MOV_DAILY"
  | "RCV_PHYS"
  | "RCV_MENT";

export interface QuestionOption {
  label: string;
  value: number;
}

export interface IntakeQuestion {
  id: QuestionId;
  category: CategoryId;
  questionIndex: 1 | 2;
  question: string;
  options: QuestionOption[];
}

export const SYMPTOMS: readonly Symptom[] = [
  {
    id: "stress",
    icon: "🧠",
    label: "Stress",
    desc: "Meer prikkelbaarheid, minder rust",
  },
  {
    id: "slaap",
    icon: "🌙",
    label: "Slaap",
    desc: "Moeite met inslapen of doorslapen",
  },
  {
    id: "energie",
    icon: "⚡",
    label: "Energie",
    desc: "Lege batterij, minder drive",
  },
] as const satisfies readonly Symptom[];

export const CATEGORIES: readonly Category[] = [
  { id: "slaap", label: "Slaap", icon: "🌙", color: "#5B6EAE" },
  { id: "energie", label: "Energie", icon: "⚡", color: "#C4873B" },
  { id: "stress", label: "Stress", icon: "🧠", color: "#8B6E99" },
  { id: "voeding", label: "Voeding", icon: "🥗", color: "#5A8F6A" },
  { id: "beweging", label: "Beweging", icon: "🏃", color: "#C26E4B" },
  { id: "herstel", label: "Herstel", icon: "🔄", color: "#4A8A99" },
] as const satisfies readonly Category[];

export const QUESTIONS: readonly IntakeQuestion[] = [
  {
    id: "SLP_QUAL",
    category: "slaap",
    questionIndex: 1,
    question: "Hoe voel je je gemiddeld als je wakker wordt?",
    options: [
      { label: "Uitgerust en helder", value: 4 },
      { label: "Redelijk, maar niet optimaal", value: 3 },
      { label: "Moe, alsof ik niet geslapen heb", value: 1 },
      { label: "Wisselend, verschilt per dag", value: 2 },
    ],
  },
  {
    id: "SLP_CONS",
    category: "slaap",
    questionIndex: 2,
    question: "Lukt het je om op een vast tijdstip te gaan slapen en wakker te worden?",
    options: [
      { label: "Ja, vrij consistent", value: 3 },
      { label: "Meestal wel, soms niet", value: 2 },
      { label: "Nee, mijn ritme is onregelmatig", value: 1 },
    ],
  },
  {
    id: "NRG_PATN",
    category: "energie",
    questionIndex: 1,
    question: "Hoe zou je je energieniveau overdag omschrijven?",
    options: [
      { label: "Stabiel de hele dag", value: 4 },
      { label: "Goed in de ochtend, dip in de middag", value: 2 },
      { label: "Laag vanaf het begin", value: 1 },
      { label: "Wisselend en onvoorspelbaar", value: 2 },
    ],
  },
  {
    id: "NRG_DEP",
    category: "energie",
    questionIndex: 2,
    question: "Waar leun je op voor energie?",
    options: [
      { label: "Koffie of energiedrank (meer dan 3 per dag)", value: 1 },
      { label: "Koffie of energiedrank (1-2 per dag)", value: 2 },
      { label: "Ik heb weinig stimulanten nodig", value: 4 },
      { label: "Ik gebruik regelmatig suiker of snacks als opkikker", value: 1 },
    ],
  },
  {
    id: "STR_FREQ",
    category: "stress",
    questionIndex: 1,
    question: "Hoe vaak voel je je gestrest of overprikkeld?",
    options: [
      { label: "Zelden", value: 4 },
      { label: "Soms, maar beheersbaar", value: 3 },
      { label: "Regelmatig", value: 2 },
      { label: "Dagelijks of bijna dagelijks", value: 1 },
    ],
  },
  {
    id: "STR_RECV",
    category: "stress",
    questionIndex: 2,
    question: "Als je een drukke of stressvolle dag hebt gehad, hoe snel kom je tot rust?",
    options: [
      { label: "Vrij snel, ik kan goed loslaten", value: 4 },
      { label: "Het kost me wat tijd, maar lukt wel", value: 3 },
      { label: "Ik neem stress mee naar bed", value: 1 },
      { label: "Ik merk dat stress zich opstapelt over dagen", value: 1 },
    ],
  },
  {
    id: "NUT_QUAL",
    category: "voeding",
    questionIndex: 1,
    question: "Hoe zou je je dagelijkse eetpatroon omschrijven?",
    options: [
      { label: "Gevarieerd met groente, eiwitten en vetten", value: 4 },
      { label: "Redelijk, maar niet altijd bewust", value: 3 },
      { label: "Onregelmatig of eenzijdig", value: 2 },
      { label: "Veel bewerkt voedsel en weinig groente", value: 1 },
    ],
  },
  {
    id: "NUT_O3",
    category: "voeding",
    questionIndex: 2,
    question: "Eet je regelmatig vette vis (zalm, makreel, sardines)?",
    options: [
      { label: "2x per week of vaker", value: 3 },
      { label: "Ongeveer 1x per week", value: 2 },
      { label: "Zelden of nooit", value: 1 },
    ],
  },
  {
    id: "MOV_FREQ",
    category: "beweging",
    questionIndex: 1,
    question: "Hoe vaak beweeg je intensief (sport, krachttraining, hardlopen)?",
    options: [
      { label: "3x per week of meer", value: 4 },
      { label: "1-2x per week", value: 3 },
      { label: "Minder dan 1x per week", value: 2 },
      { label: "Zelden of nooit", value: 1 },
    ],
  },
  {
    id: "MOV_DAILY",
    category: "beweging",
    questionIndex: 2,
    question: "Hoeveel beweeg je buiten sport om (wandelen, fietsen, staan)?",
    options: [
      { label: "Veel - ik sta en loop de hele dag", value: 3 },
      { label: "Gemiddeld - ik wissel zitten en bewegen af", value: 2 },
      { label: "Weinig - ik zit het grootste deel van de dag", value: 1 },
    ],
  },
  {
    id: "RCV_PHYS",
    category: "herstel",
    questionIndex: 1,
    question: "Hoe snel herstel je na inspanning (sport, fysiek werk)?",
    options: [
      { label: "Binnen een dag", value: 3 },
      { label: "Duurt 2-3 dagen", value: 2 },
      { label: "Ik voel me langer moe of stijf", value: 1 },
    ],
  },
  {
    id: "RCV_MENT",
    category: "herstel",
    questionIndex: 2,
    question: "Neem je bewust momenten van rust of ontspanning?",
    options: [
      {
        label: "Ja, dagelijks (meditatie, wandeling, ademhaling)",
        value: 3,
      },
      { label: "Soms, maar niet structureel", value: 2 },
      { label: "Nee, daar kom ik niet aan toe", value: 1 },
    ],
  },
] as const satisfies readonly IntakeQuestion[];
