import type {
  Check,
  CheckId,
  CheckLogEntry,
  DashboardSection,
  IdentityField,
  Pillar,
  PillarId,
  Signal,
} from "@/types/dashboard";

export const PILLARS: Pillar[] = [
  {
    id: "slaap",
    label: "Slaap",
    color: "#5B6EAE",
    icon: "Moon",
    lever: "Begin bij je avond - niet bij een supplement. Je slaap zakte het hardst; hier herstel je eerst de basis.",
    quickWin: {
      title: "Vaste afbouw na 21:00",
      detail: "Schermen weg, licht laag. Je diepe slaap reageert hier het snelst op.",
    },
    supplement: {
      name: "Magnesium",
      form: "glycinaat",
      grade: "A",
      signal: "Je valt laat in en slaapt onrustig",
      claim: "draagt bij aan een normale werking van het zenuwstelsel",
    },
  },
  {
    id: "energie",
    label: "Energie",
    color: "#C4873B",
    icon: "Bolt",
    lever: "Begin bij je ochtend - niet bij een supplement. Daglicht en ritme doen hier het meeste.",
    quickWin: {
      title: "Daglicht binnen 30 min na opstaan",
      detail: "10 minuten buiten zet je bioklok gelijk - stabielere energie overdag.",
    },
    supplement: null,
  },
  {
    id: "stress",
    label: "Stress",
    color: "#8B6E99",
    icon: "Wind",
    lever: "Begin bij je ademhaling - niet bij een supplement. Je stress-herstel verloopt traag.",
    quickWin: {
      title: "Box-breathing, 4 minuten",
      detail: "4 tellen in, 4 vast, 4 uit. Verlaagt je hartslag meetbaar binnen één sessie.",
    },
    supplement: {
      name: "Ashwagandha",
      form: "KSM-66",
      grade: "B",
      signal: "Je stress-herstel verloopt traag",
      claim: "ondersteunt het omgaan met stress",
    },
  },
  {
    id: "voeding",
    label: "Voeding",
    color: "#5A8F6A",
    icon: "Utensils",
    lever: "Begin bij je ontbijt - niet bij een supplement. Je voedingsbodem is je zwakste schakel; daar zit nu de meeste winst.",
    quickWin: {
      title: "Eiwitrijk ontbijt",
      detail: "Begin bij je bord, niet bij een potje. 30 g eiwit vóór 10 uur houdt je energie en trek stabiel.",
    },
    supplement: {
      name: "Omega-3",
      form: "EPA/DHA",
      grade: "A",
      signal: "Je eet zelden vette vis",
      claim: "draagt bij aan de normale werking van het hart",
    },
  },
  {
    id: "beweging",
    label: "Beweging",
    color: "#C26E4B",
    icon: "Footprints",
    lever: "Begin bij je dag - niet bij een supplement. Meer beweging maakt de rest makkelijker.",
    quickWin: {
      title: "10 min wandelen na het avondeten",
      detail: "Een korte wandeling vlakt je bloedsuiker af en helpt je ontspannen richting de avond.",
    },
    supplement: null,
  },
  {
    id: "herstel",
    label: "Herstel",
    color: "#4A8A99",
    icon: "Heart",
    lever: "Begin bij je rust - niet bij een supplement. Herstel is waar alles samenkomt.",
    quickWin: {
      title: "Eén alcoholvrije avond extra",
      detail: "Alcohol fragmenteert je herstel. Eén avond minder zie je direct terug in je HRV.",
    },
    supplement: null,
  },
];

export const PILLAR: Record<PillarId, Pillar> = Object.fromEntries(
  PILLARS.map((pillar) => [pillar.id, pillar]),
) as Record<PillarId, Pillar>;

export const TIE_ORDER: PillarId[] = [
  "slaap",
  "stress",
  "energie",
  "voeding",
  "beweging",
  "herstel",
];

export const SIGNALS: Signal[] = [
  {
    id: "hrv",
    label: "HRV",
    color: "#4A8A99",
    unit: "ms",
    source: "wearable",
    status: "binnenkort",
    data: [],
  },
  {
    id: "rustpols",
    label: "Rustpols",
    color: "#8B6E99",
    unit: "bpm",
    source: "wearable",
    status: "binnenkort",
    data: [],
  },
  {
    id: "slaapduur",
    label: "Slaapduur",
    color: "#5B6EAE",
    unit: "u",
    source: "wearable",
    status: "binnenkort",
    data: [],
  },
];

export const CHECKS: Record<CheckId, Check> = {
  check1: {
    seq: 3,
    date: "10 jun 2026",
    short: "10 juni",
    scores: { slaap: 58, energie: 54, stress: 47, voeding: 38, beweging: 71, herstel: 51 },
    trend: {
      slaap: [49, 52, 51, 54, 56, 58],
      energie: [49, 50, 53, 52, 53, 54],
      stress: [53, 51, 52, 50, 49, 47],
      voeding: [31, 33, 32, 35, 37, 38],
      beweging: [62, 65, 66, 68, 70, 71],
      herstel: [50, 49, 52, 50, 52, 51],
    },
  },
  check2: {
    seq: 4,
    date: "10 jul 2026",
    short: "10 juli",
    prevId: "check1",
    scores: { slaap: 44, energie: 57, stress: 50, voeding: 52, beweging: 73, herstel: 54 },
    trend: {
      slaap: [58, 55, 52, 49, 46, 44],
      energie: [54, 55, 56, 55, 56, 57],
      stress: [47, 48, 49, 48, 49, 50],
      voeding: [38, 41, 45, 48, 50, 52],
      beweging: [71, 72, 72, 73, 73, 73],
      herstel: [51, 52, 53, 53, 54, 54],
    },
  },
};

export const CHECK_LOG: CheckLogEntry[] = [
  { seq: 1, date: "8 apr 2026", priority: "stress", vitality: 46 },
  { seq: 2, date: "6 mei 2026", priority: "voeding", vitality: 49 },
  { seq: 3, date: "10 jun 2026", priority: "voeding", vitality: 53 },
  { seq: 4, date: "10 jul 2026", priority: "slaap", vitality: 55 },
];

export const IDENTITY_FIELDS: IdentityField[] = [
  {
    id: "geslacht",
    label: "Geslacht",
    icon: "User",
    value: null,
    unlocks: "Basis voor je eiwit- en caloriedoel",
    outcome: null,
  },
  {
    id: "gewicht",
    label: "Gewicht",
    icon: "Scale",
    value: null,
    unlocks: "Ontgrendelt je persoonlijke eiwitdoel",
    outcome: null,
  },
  {
    id: "lengte",
    label: "Lengte",
    icon: "Ruler",
    value: null,
    unlocks: "Verfijnt je BMI en energiebehoefte",
    outcome: null,
  },
  {
    id: "werk",
    label: "Werk & beweging",
    icon: "Briefcase",
    value: null,
    unlocks: "Bepaalt je activiteitsniveau",
    outcome: null,
  },
];

export const DASHBOARD_SECTIONS: DashboardSection[] = [
  { id: "nu", type: "now" },
  { id: "prioriteit", type: "priority" },
  { id: "plan", type: "plan" },
  { id: "signalen", type: "signals" },
  { id: "hertest", type: "retest" },
  { id: "identiteit", type: "identity" },
  { id: "historie", type: "history" },
  { id: "toekomst", type: "future" },
];
