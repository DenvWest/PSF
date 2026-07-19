export type SleepDimensionKey = "inslapen" | "doorslapen" | "regelmaat" | "uitgerust";
export type SleepActionableKey = "inslapen" | "doorslapen" | "regelmaat";
export type SleepBand = "aandacht" | "redelijk" | "sterk";

export type SleepQuestion = {
  field: "SLP_ONSET" | "SLP_WAKE" | "SLP_CONS" | "SLP_QUAL";
  dimension: SleepDimensionKey;
  label: string;
  max: number;
  actionable: boolean;
  question: string;
  options: { label: string; value: number }[];
};

export const SLEEP_QUESTIONS: SleepQuestion[] = [
  {
    field: "SLP_ONSET",
    dimension: "inslapen",
    label: "Inslapen",
    max: 4,
    actionable: true,
    question: "Hoe lang doe je erover om in te slapen?",
    options: [
      { label: "Meestal binnen 15 minuten", value: 4 },
      { label: "Ongeveer 15–30 minuten", value: 3 },
      { label: "Regelmatig langer dan 30 minuten", value: 2 },
      { label: "Vaak langer dan een uur of heel moeilijk", value: 1 },
    ],
  },
  {
    field: "SLP_WAKE",
    dimension: "doorslapen",
    label: "Doorslapen",
    max: 4,
    actionable: true,
    question: "Hoe vaak word je 's nachts wakker?",
    options: [
      { label: "Zelden of nooit", value: 4 },
      { label: "Soms, maar ik slaap meestal weer door", value: 3 },
      { label: "Regelmatig wakker, soms lang wakker liggen", value: 2 },
      { label: "Vaak meerdere keren per nacht", value: 1 },
    ],
  },
  {
    field: "SLP_CONS",
    dimension: "regelmaat",
    label: "Regelmaat",
    max: 3,
    actionable: true,
    question: "Houd je een vast slaap-waakritme aan?",
    options: [
      { label: "Ja, vrij consistent", value: 3 },
      { label: "Meestal wel, soms niet", value: 2 },
      { label: "Nee, mijn ritme is onregelmatig", value: 1 },
    ],
  },
  {
    field: "SLP_QUAL",
    dimension: "uitgerust",
    label: "Uitgerust wakker",
    max: 4,
    actionable: false,
    question: "Hoe voel je je gemiddeld als je wakker wordt?",
    options: [
      { label: "Uitgerust en helder", value: 4 },
      { label: "Redelijk, maar niet optimaal", value: 3 },
      { label: "Wisselend, verschilt per dag", value: 2 },
      { label: "Moe, alsof ik niet geslapen heb", value: 1 },
    ],
  },
];

export const SLEEP_DUUR_QUESTION = {
  field: "duur" as const,
  question: "Hoeveel uur slaap je doorgaans per nacht?",
  options: [
    { label: "Minder dan 5 uur", value: 4.5 },
    { label: "5 tot 6 uur", value: 5.5 },
    { label: "6 tot 7 uur", value: 6.5 },
    { label: "7 tot 8 uur", value: 7.5 },
    { label: "Meer dan 8 uur", value: 8.5 },
  ],
};
export const SLEEP_DUUR_VALUES = [4.5, 5.5, 6.5, 7.5, 8.5];

export const SLEEP_REGIE_QUESTION = {
  field: "grip" as const,
  question: "Heb je het gevoel dat je grip hebt op je slaap?",
  options: [
    { label: "Nee, het overkomt me", value: 1 },
    { label: "Meestal niet", value: 2 },
    { label: "Soms wel, soms niet", value: 3 },
    { label: "Meestal wel", value: 4 },
    { label: "Ja, ik heb het in de hand", value: 5 },
  ],
};

export type SleepContextField =
  | "winddown"
  | "nightload"
  | "morninglight"
  | "sleepconfidence";

export type SleepContextQuestion = {
  field: SleepContextField;
  question: string;
  options: { label: string; value: number }[];
};

export const SLEEP_CONTEXT_QUESTIONS: SleepContextQuestion[] = [
  {
    field: "winddown",
    question: "Hoe vaak bouw je je avond bewust af in het laatste uur voor bed?",
    options: [
      { label: "Bijna elke avond", value: 4 },
      { label: "Regelmatig", value: 3 },
      { label: "Af en toe", value: 2 },
      { label: "Bijna nooit", value: 1 },
    ],
  },
  {
    field: "nightload",
    question: "Hoe vaak neem je stress of piekergedachten mee naar bed?",
    options: [
      { label: "Zelden", value: 4 },
      { label: "Soms", value: 3 },
      { label: "Regelmatig", value: 2 },
      { label: "Bijna elke avond", value: 1 },
    ],
  },
  {
    field: "morninglight",
    question: "Hoe vaak zie je binnen een uur na opstaan daglicht buiten?",
    options: [
      { label: "Bijna elke dag", value: 4 },
      { label: "Meerdere dagen per week", value: 3 },
      { label: "Soms", value: 2 },
      { label: "Bijna nooit", value: 1 },
    ],
  },
  {
    field: "sleepconfidence",
    question: "Hoeveel vertrouwen heb je dat je slaap de komende 2 weken verbetert?",
    options: [
      { label: "Veel vertrouwen", value: 4 },
      { label: "Redelijk vertrouwen", value: 3 },
      { label: "Twijfel", value: 2 },
      { label: "Weinig vertrouwen", value: 1 },
    ],
  },
];

export const SLEEP_STATEMENTS: Record<SleepDimensionKey, Record<SleepBand, string>> = {
  inslapen: {
    aandacht: "Inslapen kost je nu vaak moeite — daar valt de meeste rust te winnen.",
    redelijk: "Je valt meestal redelijk in slaap; soms duurt het wat langer.",
    sterk: "Je valt vlot in slaap — fijn, dat geeft je nacht een goede start.",
  },
  doorslapen: {
    aandacht: "Je wordt 's nachts regelmatig wakker — doorslapen is nu je grootste hobbel.",
    redelijk: "Je wordt soms wakker, maar slaapt meestal weer door.",
    sterk: "Je slaapt de nacht goed door — daar gebeurt het herstel.",
  },
  regelmaat: {
    aandacht: "Je ritme is nu onregelmatig — vaste tijden geven je klok houvast.",
    redelijk: "Je tijden zijn redelijk, maar nog niet helemaal vast.",
    sterk: "Je houdt een vast ritme aan — je interne klok dankt je ervoor.",
  },
  uitgerust: {
    aandacht: "Je wordt nu vaak niet uitgerust wakker — dat verandert als de basis hieronder beter wordt.",
    redelijk: "Je wordt redelijk uitgerust wakker; er is ruimte voor meer.",
    sterk: "Je wordt uitgerust wakker — het mooiste teken dat je nachten werken.",
  },
};

export const SLEEP_CHOICES: Record<SleepActionableKey, string[]> = {
  inslapen: [
    "Leg je telefoon 30 minuten vóór bed buiten bereik",
    "Dim de lichten een uur voor bedtijd",
    "Geen cafeïne meer na de lunch",
    "Een vast afbouw-ritueel: zelfde volgorde, zelfde tijd",
  ],
  doorslapen: [
    "Plan 2–3 avonden per week zonder alcohol",
    "Houd je slaapkamer koel en donker",
    "Schrijf 's avonds kort op wat in je hoofd zit",
    "Sta bij lang wakker liggen even op in plaats van te malen",
  ],
  regelmaat: [
    "Sta elke ochtend rond dezelfde tijd op — ook in het weekend",
    "Kies één vaste bedtijd en houd 'm 3 nachten vast",
    "Ga kort naar buiten in het ochtendlicht na het opstaan",
    "Vermijd lange dutjes overdag",
  ],
};

export const SLEEP_DEEPEN: Record<SleepActionableKey, string> = {
  inslapen:
    "Wil je verder? Maak je afbouw-ritueel elke avond hetzelfde — je lichaam leert dan wanneer het mag zakken.",
  doorslapen:
    "Wil je verder? Houd je slaapkamer koel en schermloos — kleine prikkels houden je 's nachts lichter.",
  regelmaat:
    "Wil je verder? Anker je dag aan een vaste opstatijd — dat zet de rest van je ritme vanzelf goed.",
};

export function sleepRegieReflection(grip: number): string {
  if (grip <= 2)
    return "Slecht slapen sluipt er bij veel mannen ongemerkt in — je hoeft dit niet in één keer op te lossen.";
  if (grip === 3)
    return "Je bent op weg. De stap die je koos maakt je grip op je nachten stap voor stap groter.";
  return "Mooi — je pakt je slaap zelf op. Houd vast wat voor jou werkt.";
}
