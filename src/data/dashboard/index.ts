import type { DomainScoreKey } from "@/lib/intake-engine";
import type {
  Check,
  CheckId,
  CheckLogEntry,
  DashboardSection,
  DashboardSectionType,
  DashboardTab,
  DashboardTabId,
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
    lever:
      "Je valt laat in of slaapt onrustig — begin bij je avondritme, niet bij een potje. Na 40 reageert je diepe slaap sneller op licht en schermen dan op supplementen.",
    quickWin: {
      title: "Vaste afbouw na 21:00",
      detail:
        "Schermen weg, licht laag, vaste bedtijd. Je diepe slaap reageert hier het snelst op — één week consequent is genoeg om het verschil te merken.",
    },
    supplement: {
      name: "Magnesium",
      form: "glycinaat",
      grade: "A",
      signal: "Je valt laat in en slaapt onrustig",
      claim: "draagt bij aan een normale werking van het zenuwstelsel",
    },
    hubRoute: "/slaap-verbeteren-na-40",
  },
  {
    id: "energie",
    label: "Energie",
    color: "#C4873B",
    icon: "Bolt",
    lever:
      "Je energie zakt na de lunch of 's ochtends — begin bij daglicht en ritme. Na 40 verschuift je bioklok; licht en eiwit doen hier meer dan een energie-pill.",
    quickWin: {
      title: "Daglicht binnen 30 min na opstaan",
      detail:
        "10 minuten buiten binnen een half uur na opstaan zet je bioklok gelijk. Dat stabiliseert je cortisolritme — en daarmee je energiecurve overdag.",
    },
    supplement: null,
    hubRoute: "/energie-na-40",
  },
  {
    id: "stress",
    label: "Stress",
    color: "#8B6E99",
    icon: "Wind",
    lever:
      "Je blijft 'aan' staan na werk — begin bij je ademhaling, niet bij een supplement. Na 40 herstelt je stress-as trager; een korte reset helpt sneller dan je denkt.",
    quickWin: {
      title: "Box-breathing, 4 minuten",
      detail:
        "4 tellen in, 4 vast, 4 uit — herhaal 4 minuten. Verlaagt je hartslag meetbaar binnen één sessie. Doe het vóór je telefoon pakt na het werk.",
    },
    supplement: null,
    hubRoute: "/stress-verminderen-na-40",
  },
  {
    id: "voeding",
    label: "Voeding",
    color: "#5A8F6A",
    icon: "Utensils",
    lever:
      "Je ontbijt is te koolhydraat-dominant of te laat — begin bij je bord, niet bij een potje. Na 40 verliest je lichaam sneller spier en stabiliteit als eiwit tekortschiet.",
    quickWin: {
      title: "Eiwitrijk ontbijt",
      detail:
        "30 g eiwit vóór 10 uur — ei + kwark of yoghurt met noten. Eiwit stabiliseert je bloedsuiker en remt spierverlies dat na je 40e versnelt. Begin bij je bord, niet bij een potje.",
    },
    supplement: {
      name: "Omega-3",
      form: "EPA/DHA",
      grade: "A",
      signal: "Je eet zelden vette vis",
      claim: "draagt bij aan de normale werking van het hart",
    },
    hubRoute: "/voeding-na-40",
  },
  {
    id: "beweging",
    label: "Beweging",
    color: "#C26E4B",
    icon: "Footprints",
    lever:
      "Je zit te veel en beweegt te weinig overdag — begin bij een korte wandeling, niet bij een supplement. Meer dagelijkse beweging maakt slaap, herstel en energie allemaal makkelijker.",
    quickWin: {
      title: "10 min wandelen na het avondeten",
      detail:
        "Een korte wandeling direct na het eten verlaagt je bloedsuikerrespons en helpt je ontspannen richting de avond. Geen sportkleding nodig — alleen schoenen.",
    },
    supplement: null,
    hubRoute: "/beweging-na-40",
  },
  {
    id: "herstel",
    label: "Herstel",
    color: "#4A8A99",
    icon: "Heart",
    lever:
      "Je herstelt langzaam na inspanning of alcohol — begin bij rust en slaap, niet bij extra training. Herstel is waar alles samenkomt: slaap, voeding en beweging.",
    quickWin: {
      title: "Eén alcoholvrije avond extra",
      detail:
        "Alcohol verlaagt je REM-slaap en remt spierherstel. Kies één vaste avond per week zonder drank — en merk het verschil in hoe je de volgende ochtend aanvoelt.",
    },
    supplement: null,
    hubRoute: "/herstel-verbeteren-na-40",
  },
];

export const PILLAR: Record<PillarId, Pillar> = Object.fromEntries(
  PILLARS.map((pillar) => [pillar.id, pillar]),
) as Record<PillarId, Pillar>;

export const SCORE_KEY_BY_PILLAR: Record<PillarId, DomainScoreKey> = {
  slaap: "sleep_score",
  energie: "energy_score",
  stress: "stress_score",
  voeding: "nutrition_score",
  beweging: "movement_score",
  herstel: "recovery_score",
};

export const PILLAR_BY_SCORE_KEY: Record<DomainScoreKey, PillarId> = {
  sleep_score: "slaap",
  energy_score: "energie",
  stress_score: "stress",
  nutrition_score: "voeding",
  movement_score: "beweging",
  recovery_score: "herstel",
};

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

export const PILLAR_CHECKIN_ROUTES: Partial<Record<PillarId, string>> = {
  slaap: "/intake/slaap",
  stress: "/intake/stress",
  beweging: "/intake/beweging",
  voeding: "/intake/voeding",
};

/** @deprecated Derived from supplement-catalog.ts — use recommendation-engine instead. */
export const PILLAR_COMPARISON_ROUTES: Partial<Record<PillarId, string>> = {
  slaap: "/beste/magnesium",
  voeding: "/beste/omega-3-supplement",
};

export const DASHBOARD_SECTIONS: DashboardSection[] = [
  { id: "vitaalscore", type: "vitalityScore" },
  { id: "nu", type: "now" },
  { id: "prioriteit", type: "priority" },
  { id: "plan", type: "plan" },
  { id: "kompas-home", type: "kompasHome" },
  { id: "signalen", type: "signals" },
  { id: "voeding-inname", type: "nutritionIntake" },
  { id: "hertest", type: "retest" },
  { id: "identiteit", type: "identity" },
  { id: "historie", type: "history" },
  { id: "aanraders", type: "recommendations" },
  { id: "voortgang-hub", type: "voortgangHub" },
  { id: "statistieken", type: "statistics" },
  { id: "toekomst", type: "future" },
];

export const DASHBOARD_TABS: DashboardTab[] = [
  {
    id: "vandaag",
    label: "Kompas",
    icon: "Compass",
    title: "Kompas",
    subtitle: "Je volgende stap — en wat je vandaag doet.",
    emptyHint: "Doe je eerste check — dan weet je waar je begint en wat je vandaag kunt doen.",
  },
  {
    id: "voortgang",
    label: "Voortgang",
    icon: "BarChart",
    title: "Voortgang",
    subtitle: "Je vitaalscore, je ritme en je levenslijn.",
    emptyHint: "Hier volg je je scores en trends — zodra je eerste check binnen is.",
  },
  {
    id: "hermeting",
    label: "Hermeting",
    icon: "Calendar",
    title: "Hermeting",
    subtitle: "Meet of het werkt.",
    emptyHint: "Over 30 dagen meet je opnieuw of je leefstijl-stappen werken.",
  },
];

export const TAB_SECTIONS: Record<DashboardTabId, DashboardSectionType[]> = {
  vandaag: ["kompasHome"],
  voortgang: ["vitalityScore", "voortgangHub"],
  hermeting: ["retest", "future"],
};
