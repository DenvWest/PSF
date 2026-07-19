export const INTAKE_AGE_RANGE_OPTIONS = [
  "40–44",
  "45–49",
  "50–54",
  "55+",
] as const;

export type IntakeAgeRange = (typeof INTAKE_AGE_RANGE_OPTIONS)[number];

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
  | "verbinding"
  | "voeding"
  | "beweging"
  | "herstel"
  | "leefstijl";

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
  color: string;
}

/** Sentinel: eiwitinname onbekend — telt niet mee in voedingsscore (rules_version ≥ 1.4.0). */
export const NUT_PROT_UNKNOWN = 0 as const;

export type QuestionId =
  | "SLP_QUAL"
  | "SLP_CONS"
  | "SLP_ONSET"
  | "SLP_WAKE"
  | "NRG_PATN"
  | "NRG_DEP"
  | "STR_FREQ"
  | "STR_RCV"
  | "CON_SOC"
  | "NUT_O3"
  | "NUT_PROT"
  | "MOV_STR"
  | "MOV_CARD"
  | "RCV_PHYS"
  | "LIF_ALC"
  | "LIF_SUN"
  | "MOV2_STR"
  | "MOV2_CARD"
  | "MOV2_VIG"
  | "MOV2_SIT"
  | "MOV2_COND"
  | "MOV2_PAIN"
  | "MOV2_MOB"
  | "MOV2_FUNC"
  | "MOV2_CONSIST"
  | "MOV2_MOTIV";

export interface QuestionOption {
  label: string;
  value: number;
}

export interface IntakeQuestion {
  id: QuestionId;
  category: CategoryId;
  questionIndex: 1 | 2 | 3 | 4;
  question: string;
  /** Korte toelichting onder de vraag (optioneel). */
  subtitle?: string;
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
  { id: "verbinding", label: "Verbinding", icon: "🤝", color: "#7A8A6B" },
  { id: "voeding", label: "Voeding", icon: "🥗", color: "var(--ps-green)" },
  { id: "beweging", label: "Beweging", icon: "🏃", color: "#C26E4B" },
  { id: "herstel", label: "Herstel", icon: "🔄", color: "#4A8A99" },
  { id: "leefstijl", label: "Leefstijl", icon: "☀️", color: "#7A8A6B" },
] as const satisfies readonly Category[];

export const QUESTIONS: readonly IntakeQuestion[] = [
  {
    id: "SLP_QUAL",
    category: "slaap",
    questionIndex: 1,
    question: "Hoe vaak word je uitgerust en helder wakker?",
    options: [
      { label: "Bijna elke ochtend", value: 4 },
      { label: "De meeste ochtenden", value: 3 },
      { label: "Een paar ochtenden per week", value: 2 },
      { label: "Zelden of nooit", value: 1 },
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
    id: "SLP_ONSET",
    category: "slaap",
    questionIndex: 3,
    question: "Hoe lang lig je gemiddeld wakker voordat je in slaap valt?",
    options: [
      { label: "Meestal binnen 15 minuten", value: 4 },
      { label: "Ongeveer 15–30 minuten", value: 3 },
      { label: "Regelmatig langer dan 30 minuten", value: 2 },
      { label: "Vaak langer dan een uur of heel moeilijk", value: 1 },
    ],
  },
  {
    id: "SLP_WAKE",
    category: "slaap",
    questionIndex: 4,
    question: "Word je 's nachts wakker en lukt doorslapen niet altijd?",
    options: [
      { label: "Zelden of nooit", value: 4 },
      { label: "Soms, maar ik slaap meestal weer door", value: 3 },
      { label: "Regelmatig wakker, soms lang wakker liggen", value: 2 },
      { label: "Vaak meerdere keren per nacht", value: 1 },
    ],
  },
  {
    id: "NRG_PATN",
    category: "energie",
    questionIndex: 1,
    question: "Hoe zou je je energieniveau overdag omschrijven?",
    options: [
      { label: "Stabiel de hele dag", value: 4 },
      { label: "Goed in de ochtend, dip in de middag", value: 3 },
      { label: "Wisselend en onvoorspelbaar", value: 2 },
      { label: "Laag vanaf het begin", value: 1 },
    ],
  },
  {
    id: "NRG_DEP",
    category: "energie",
    questionIndex: 2,
    question:
      "Heb je oppeppers nodig om de dag door te komen (extra koffie, energiedrank, zoetigheid)?",
    subtitle:
      "Gewone koffie bij je ontbijt telt niet — het gaat om wat je nodig hebt om overeind te blijven.",
    options: [
      { label: "Nee, zelden", value: 4 },
      { label: "Soms, op zware dagen", value: 3 },
      { label: "De meeste dagen wel", value: 2 },
      { label: "Zonder kom ik de dag niet door", value: 1 },
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
    id: "STR_RCV",
    category: "stress",
    questionIndex: 2,
    question:
      "Lukt het je om op een drukke dag tot rust te komen en herstelmomenten te pakken?",
    options: [
      { label: "Ja — ik kan loslaten én neem bewust rust", value: 4 },
      { label: "Het kost tijd, maar ik vind wel herstelmomenten", value: 3 },
      { label: "Stress stapelt op of herstel blijft achterwege", value: 2 },
      { label: "Ik neem stress mee en kom niet aan ontspanning", value: 1 },
    ],
  },
  {
    id: "CON_SOC",
    category: "verbinding",
    questionIndex: 1,
    question:
      "Heb je mensen om je heen bij wie je echt jezelf kunt zijn en op wie je kunt terugvallen?",
    subtitle:
      "Denk aan partner, vrienden of familie waar je op drukke of mindere dagen op kunt bouwen.",
    options: [
      { label: "Ja, en dat voelt ruim voldoende", value: 4 },
      { label: "Ja, een paar — en dat is genoeg voor mij", value: 4 },
      { label: "Er zijn mensen, maar ik mis soms echt contact", value: 2 },
      { label: "Ik heb weinig mensen om op terug te vallen", value: 1 },
    ],
  },
  {
    id: "NUT_O3",
    category: "voeding",
    questionIndex: 1,
    question: "Eet je regelmatig vette vis (zalm, makreel, sardines)?",
    options: [
      { label: "2x per week of vaker", value: 3 },
      { label: "Ongeveer 1x per week", value: 2 },
      { label: "Zelden of nooit", value: 1 },
    ],
  },
  {
    id: "NUT_PROT",
    category: "voeding",
    questionIndex: 2,
    question:
      "Hoe vaak bevat een maaltijd bij jou een flinke portie eiwit (vlees, vis, eieren, zuivel, peulvruchten)?",
    options: [
      { label: "(Vrijwel) elke maaltijd", value: 4 },
      { label: "1–2 maaltijden per dag", value: 3 },
      { label: "Niet elke dag", value: 2 },
      { label: "Zelden — of ik weet het echt niet", value: NUT_PROT_UNKNOWN },
    ],
  },
  {
    id: "MOV_STR",
    category: "beweging",
    questionIndex: 1,
    question: "Doe je kracht- of weerstandstraining (gewichten, banden, eigen lichaamsgewicht)?",
    options: [
      { label: "Ja, 2x per week of vaker", value: 4 },
      { label: "Ja, ongeveer 1x per week", value: 3 },
      { label: "Minder dan 1x per week", value: 2 },
      { label: "Zelden of nooit", value: 1 },
    ],
  },
  {
    id: "MOV_CARD",
    category: "beweging",
    questionIndex: 2,
    question:
      "Hoe vaak beweeg je matig intensief — stevig doorwandelen, fietsen of sport waarbij praten nog lukt, maar zingen niet?",
    subtitle: "Dit tempo (zone 2) traint je conditie — de basis onder je energie en herstel.",
    options: [
      { label: "3x per week of meer", value: 4 },
      { label: "1-2x per week", value: 3 },
      { label: "Minder dan 1x per week", value: 2 },
      { label: "Zelden of nooit", value: 1 },
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
    id: "LIF_ALC",
    category: "leefstijl",
    questionIndex: 1,
    question: "Hoe vaak drink je 3 glazen alcohol of meer op één avond?",
    options: [
      { label: "Zelden of nooit", value: 4 },
      { label: "Af en toe, niet wekelijks", value: 3 },
      { label: "Ongeveer 1x per week", value: 2 },
      { label: "Meerdere keren per week of vaker", value: 1 },
    ],
  },
  {
    id: "LIF_SUN",
    category: "leefstijl",
    questionIndex: 2,
    question: "Hoeveel zon en buitenlicht krijg je gemiddeld?",
    subtitle:
      "Buitenlicht zet je biologische klok — belangrijk voor slaap en energie. In de zomer maakt je huid er ook vitamine D mee aan.",
    options: [
      { label: "Dagelijks, ook in de winter", value: 4 },
      { label: "Regelmatig, meestal overdag buiten", value: 3 },
      { label: "Weinig, vooral binnen", value: 2 },
      { label: "Bijna nooit, vooral binnen", value: 1 },
    ],
  },
] as const satisfies readonly IntakeQuestion[];
