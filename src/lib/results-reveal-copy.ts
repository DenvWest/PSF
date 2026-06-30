/** Copy voor REVEAL — zie docs/copy/results-reveal.md */
export const REVEAL_COPY = {
  eyebrow: "JOUW MOMENTOPNAME · ANONIEM",
  heroTitle: "Dit is waar je nu staat.",
  contextLine: "Datapunt op basis van je antwoorden — geen diagnose, wel richting.",
  pathIntro: "Dit is je leefstijlverhaal — van herkennen waar je staat naar je eerste stap.",
  pathStepProfile: "Herkenning",
  pathStepPriority: "Prioriteit",
  pathStepAction: "Eerste stap",
  pathStepStart: "Jouw startpunt",
  pathStepDashboard: "Jouw dashboard",
  pathStepSave: "Bewaren",
  whereYouStartTitle: "Waar je begint",
  priorityHint: "laagste score bovenaan",
  ladderFocusHint: "Hier begin je",
  lifestyleTrack: "Spoor A · Leefstijl",
  durationBadge: "± 2 minuten",
  dashboardTeaseTitle: "Dit wacht op je in je dashboard",
  dashboardTeaseLead: "Na inloggen staat dit in je dashboard.",
  dashboardMockLabel: "Jouw dashboard",
  dashboardScoreStartHint: "start",
  profileEyebrow: "JOUW STARTPROFIEL",
  profileStepTitle: "Waar je nu staat",
  startStepTitle: "Waar je begint — en je eerste stap",
  startChipsHint: "Je grootste prioriteiten — begin bij de eerste.",
  priorityBridgePrefix: "Je startpunt:",
  dashboardRowPrioritySubProduct: "Je startpunt — supplementen objectief vergeleken op kwaliteit",
  dashboardRowPrioritySubLifestyle: "Je startpunt, plan en voortgang staan klaar",
  firstStepTitle: "Dit heb je nu — en wat er op je wacht",
  firstStepNowLabel: "Nu · leefstijl",
  firstStepNowMeta: "Direct toepasbaar",
  firstStepLaterLabel: "Pas daarna · aanvulling",
  firstStepUpcomingLabel: "In je dashboard",
  firstStepQualifyLabel: "Je profiel past bij:",
  firstStepNoSupplementLead:
    "Eerst je bord en ritme — in je dashboard zie je later of een gerichte aanvulling logisch is.",
  firstStepSupplementHint: "Supplement pas als je bord op orde is",
  firstStepDashboardBridge: "Open je dashboard — stappenplan en vergelijking staan klaar",
  cta: "Bewaar dit in je dashboard →",
  ctaSubtext: "Gratis inloggen — alles staat klaar wanneer jij er tijd voor hebt.",
  ctaTrustLine: "Adviezen, geen diagnoses",
  feedbackBadge: "Validatie",
  feedbackMeta: "5 seconden",
  feedbackEyebrow: "Jouw oordeel",
  feedbackTitle: "Herken je jezelf in dit overzicht?",
  feedbackSubtext: "Eén vraag — helpt ons de index scherper te maken.",
  footerPanelSummary: "Hoe komt dit overzicht tot stand?",
  footerMethodIntro:
    "Leefstijl eerst — van herkenning naar één concrete stap, daarna volg je je voortgang in je dashboard.",
  stepTitleRecognition: "Herkenning — waar je nu staat",
  stepTitleStart: "Je startpunt — en eerste stap",
  stepTitleDashboard: "Je dashboard — wat klaarstaat",
  stepTitleSave: "Klaar om door te gaan?",
  firstStepApproachTitle: "Zo kozen we je eerste stap",
} as const;

export const REVEAL_FIRST_STEP_APPROACH = [
  { label: "Grootste prioriteit", detail: "je laagste score eerst" },
  { label: "Minste moeite", detail: "een stap die vandaag al past" },
  { label: "Meeste bewijs", detail: "wat aantoonbaar werkt" },
] as const;

export type RevealDashboardRow = {
  key: string;
  dotColor: string;
  title: string;
  subtitle: string;
  soon: boolean;
};

export const REVEAL_DASHBOARD_ROWS: RevealDashboardRow[] = [
  {
    key: "voortgang",
    dotColor: "#78716c",
    title: "Voortgang & trend",
    subtitle: "Zie of je stappen blijven hangen",
    soon: true,
  },
  {
    key: "hermeting",
    dotColor: "#78716c",
    title: "Hermeting ~30 dagen",
    subtitle: "Je volgende meetmoment staat klaar",
    soon: true,
  },
  {
    key: "afstemmer",
    dotColor: "#78716c",
    title: "Leefstijl & supplement afgestemd",
    subtitle: "Je plan en aanvulling op elkaar afgestemd",
    soon: true,
  },
];

export const REVEAL_DASHBOARD_WINS = [
  "Je score blijft bewaard — geen opnieuw invullen",
  "Prioriteit en volgende stap staan klaar in Kompas",
  "Hermeting over ~30 dagen ingepland",
] as const;

export const REVEAL_FIRST_STEP_UPCOMING = [
  {
    label: "Prijs-kwaliteit vergelijking",
    detail: "Per supplement — onafhankelijk, geen schap-potje",
  },
  {
    label: "Voortgang & trend",
    detail: "Zie of je stappen blijven hangen",
  },
  {
    label: "Hermeting ~30 dagen",
    detail: "Volgende meetmoment automatisch klaar",
  },
] as const;

export const REVEAL_CARD_SHADOW =
  "0 40px 90px -40px rgba(15,28,16,0.55), 0 0 0 1px rgba(255,255,255,0.04)";
