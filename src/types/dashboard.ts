import type { DeltaReport } from "@/types/delta-report";
import type { DomainScores } from "@/lib/intake-engine";
import type { MeasuredPillarId } from "@/lib/primary-theme";
import type { ActivePlanHabit } from "@/lib/dashboard-active-plan";
import type {
  MovementDayChoice,
  PriorityPrefSource,
  TimeBucket,
} from "@/lib/account-priority-pref";
import type { MovementPrefs } from "@/lib/movement-prefs";
import type { StoredMovementCheckinSnapshot } from "@/lib/movement-checkin-parse";
import type { MovementFactRow } from "@/lib/movement-assessment";
import type { MovementPriorityId } from "@/data/movement/lifestyle-priorities";
import type { MovementLadderCoverage, MovementLayerState } from "@/lib/movement-ladder";
import type { StoredSleepCheckinSnapshot } from "@/lib/sleep-checkin-parse";
import type { SleepFactRow } from "@/lib/sleep-checkin-readout";
import type { StressCheckReport } from "@/lib/stress-ladder";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { PlanProgress } from "@/types/lifestyle-plan";
import type { StoredSupplementVerdict } from "@/types/verdict";
import type { ProteinTargetRange } from "@/lib/protein-target";

export type { TimeBucket, PriorityPrefSource, MovementDayChoice };

export type AccountPriorityPrefData = {
  pillarId: PillarId;
  source: PriorityPrefSource;
  timeBucket: TimeBucket | null;
  scheduledTime: string | null;
  planStepDismissedDate: string | null;
  planStepsHidden: boolean;
  movementDayChoice: MovementDayChoice | null;
  movementDayChoiceDate: string | null;
  updatedAt: string;
};

export type PillarId =
  | "slaap"
  | "energie"
  | "stress"
  | "voeding"
  | "beweging"
  | "herstel"
  | "verbinding";

export type CheckId = "check1" | "check2";

export type DashboardSectionType =
  | "now"
  | "vitalityScore"
  | "priority"
  | "plan"
  | "agendaTeaser"
  | "agendaHome"
  | "kompasHome"
  | "signals"
  | "nutritionIntake"
  | "retest"
  | "identity"
  | "history"
  | "statistics"
  | "recommendations"
  | "voortgangHub"
  | "future";

export type DashboardIconName =
  | "Moon"
  | "Bolt"
  | "Wind"
  | "Footprints"
  | "Utensils"
  | "Heart"
  | "Settings"
  | "LogOut"
  | "Mail"
  | "MailOpen"
  | "ArrowRight"
  | "Check"
  | "Lock"
  | "Plus"
  | "ChevronDown"
  | "ChevronRight"
  | "User"
  | "Watch"
  | "Shield"
  | "Refresh"
  | "Scale"
  | "Ruler"
  | "Briefcase"
  | "Spark"
  | "TrendUp"
  | "Clock"
  | "Target"
  | "Leaf"
  | "Pill"
  | "Activity"
  | "ArrowDown"
  | "Dot"
  | "Home"
  | "Compass"
  | "RouteMap"
  | "BarChart"
  | "Calendar"
  | "BookOpen";

export type DashboardTabId = "vandaag" | "agenda" | "voortgang" | "hermeting";

export type VoortgangScreen =
  | "hub"
  | "leefstijlprofiel"
  /**
   * Wat jij bewaarde — de lijst uit `account_favorites`, domein-overstijgend.
   * Draagt nooit een `fav`-domein: dit scherm is er precies één.
   */
  | "favorieten"
  /**
   * Het aanbod van één domein. Draagt altijd `fav=<domein mét schap>`; zonder
   * dat domein bestaat het scherm niet en valt de route terug op de hub.
   */
  | "schap"
  /** @deprecated Legacy — redirect naar leefstijlprofiel */
  | "inzichten"
  /** @deprecated Legacy — redirect naar leefstijlprofiel&fav= */
  | "domein";

/** Vijf sub-oppervlakken van het schap, nooit tegelijk zichtbaar. */
export type SchapTabId = "leefstijl" | "producten" | "diensten" | "begeleiding" | "favorieten";

export type LeefstijlprofielView = "aanbevolen" | "mijn_keuze";

/** @deprecated Statistieken-screen is verwijderd; alleen nog voor legacy tests. */
export type StatistiekenBlik = "stand" | "advies" | "tijd";

export type DashboardTab = {
  id: DashboardTabId;
  label: string;
  icon: DashboardIconName;
  title: string;
  subtitle: string;
  emptyHint: string;
};

export type PillarSupplement = {
  name: string;
  form: string;
  grade: string;
  signal: string;
  claim: string;
};

export type PillarQuickWin = {
  title: string;
  detail: string;
};

export type Pillar = {
  id: PillarId;
  label: string;
  color: string;
  icon: DashboardIconName;
  lever: string;
  quickWin: PillarQuickWin;
  supplement: PillarSupplement | null;
  hubRoute: string;
};

export type SignalStatus = "connected" | "binnenkort";
export type SignalSource = "wearable";

export type Signal = {
  id: string;
  label: string;
  color: string;
  unit: string;
  source: SignalSource;
  status: SignalStatus;
  data: number[];
  note?: string;
};

export type CheckScores = Record<PillarId, number>;
export type CheckTrend = Record<PillarId, number[]>;
export type TrendSource = "intake" | "checkin" | "nutrition_log";
export type TrendBaseline = {
  value: number;
  source: TrendSource;
  rulesVersion: string | null;
  crossesRulesVersion: boolean;
};
export type CheckTrendBaselines = Partial<Record<PillarId, TrendBaseline>>;
export type CheckSnapshot = {
  scores: CheckScores;
  vitality: number;
  date: string;
  rulesVersion?: string;
};

export type Check = {
  seq: number;
  date: string;
  short: string;
  prevId?: CheckId;
  scores: CheckScores;
  trend: CheckTrend;
};

export type CheckLogEntry = {
  seq: number;
  date: string;
  priority: PillarId;
  vitality: number;
};

export type NutritionIntakeBand = "below" | "around" | "meets";

export type NutritionIntakeItem = {
  label: string;
  band: NutritionIntakeBand;
  nutrient: NutrientId;
  /** Alleen gezet als er een vorige log is én de band veranderde. */
  previousBand?: NutritionIntakeBand;
};

export type SleepCheckinFocus = {
  focusLabel: string | null;
  focusDimension: "inslapen" | "doorslapen" | "regelmaat" | null;
  conclusionText: string;
  actions: string[];
  chosenActions: string[];
  date: string;
};

export type MovementCheckinReadoutData = StoredMovementCheckinSnapshot & {
  date: string;
  /** Herberekend uit de opgeslagen antwoorden, niet zelf bevroren — zie R0g. */
  factRows: MovementFactRow[];
  /**
   * De prioriteitenladder, om dezelfde reden herberekend en niet bevroren:
   * een regel-fix in de engine moet ook oude rijen op Voortgang bereiken.
   * `focus` is afgeleid uit `focusDimension` hierboven — één bron voor de
   * readout-kop en de winst-prioriteit (lock 4).
   */
  ladder: {
    states: Record<MovementPriorityId, MovementLayerState>;
    focus: MovementPriorityId | null;
    /**
     * Hoeveel van de lagen die de check kán beoordelen er staan. Noemer is
     * dus niet zes — zie `resolveMovementLadderCoverage`.
     */
    coverage: MovementLadderCoverage;
  };
};

export type SleepCheckinReadoutData = StoredSleepCheckinSnapshot & {
  date: string;
  factRows: SleepFactRow[];
};

export type DashboardData = {
  empty: boolean;
  current: (CheckSnapshot & { trend: CheckTrend; trendBaselines?: CheckTrendBaselines }) | null;
  prev: CheckSnapshot | null;
  history: CheckLogEntry[];
  retest: boolean;
  nutritionIntake: { date: string; items: NutritionIntakeItem[] } | null;
  /** ISO-timestamp van de laatste voedingslog; null zonder log. */
  nutritionLastLoggedAt: string | null;
  /** True wanneer de laatste log ≥14 dagen geleden is — in-app her-log-nudge. */
  nutritionRelogDue: boolean;
  /** Dagen sinds nutritionLastLoggedAt; null zonder log. */
  daysSinceNutritionLog: number | null;
  movementRecoveryTrend: { date: string; value: number }[];
  movementRcvFeel: number | null;
  movementRcvFeelAt: string | null;
  remeasure: { dueDate: string; daysUntil: number } | null;
  cycleEvidence: {
    activeDays: number;
    cycleDay: number;
    daysUntilRemeasure: number;
    cycleStartDate: string;
    cycleEndDate: string;
  } | null;
  deltaReport: DeltaReport | null;
  profileLabel: string | null;
  firstName: string | null;
  answers: Record<string, number> | null;
  sessionId: string | null;
  planProgress: PlanProgress | null;
  movementPlanProgress: PlanProgress | null;
  planDomain: MeasuredPillarId | null;
  priorityPref: AccountPriorityPrefData | null;
  sleepCheckinFocus: SleepCheckinFocus | null;
  sleepCheckinSnapshot: SleepCheckinReadoutData | null;
  movementCheckinSnapshot: MovementCheckinReadoutData | null;
  hasStressCheckin: boolean;
  /** Ruwe antwoorden van de laatste stress-check — herberekend tot ladderstaten, niet bevroren. */
  stressCheckinReport: StressCheckReport | null;
  /** Dagen sinds de laatste eigen domeincheck; ontbreekt = nog nooit gedaan. */
  domainCheckDaysAgo: Partial<Record<PillarId, number>>;
  movementPrefs: MovementPrefs;
  /** Geldige supplementoordelen — ook de ingrediënten die op "nee" uitkomen. */
  supplementVerdicts: StoredSupplementVerdict[];
  /**
   * Gepersonaliseerde eiwit-dagrange (g/kg × gewicht), server-side berekend.
   * Nooit het ruwe gewicht — alleen de afgeleide range bereikt de client.
   * Null zonder ProteinTargetCard-invoer deze cyclus (compute-op-de-server,
   * geen personalisatie voor magnesium/zink/vitD/omega-3 — zie
   * src/lib/nutrient-personalization.ts).
   */
  proteinTarget: ProteinTargetRange | null;
};

export type IdentityField = {
  id: string;
  label: string;
  icon: DashboardIconName;
  value: string | null;
  unlocks: string;
  outcome: string | null;
};

export type DashboardSection = {
  id: string;
  type: DashboardSectionType;
};

export type LifestyleItemRole = "prioriteit" | "kracht";

export type LifestyleItem = {
  pillar: Pillar;
  win: PillarQuickWin;
  role: LifestyleItemRole;
};

export type DashboardModel = {
  scores: CheckScores;
  domainScores: DomainScores;
  ladder: Pillar[];
  enginePriority: Pillar;
  priority: Pillar;
  priorityIsUserChosen: boolean;
  timeBucket: TimeBucket | null;
  scheduledTime: string | null;
  planStepDismissedDate: string | null;
  planStepsHidden: boolean;
  /**
   * Gekozen belastings-tier voor vandaag (herstel/matig/trainen), al geresolved
   * tegen de datum. Null = nog niet gekozen vandaag. Eén bron voor Beweging én
   * Mijn Dag — nooit afleiden uit welk vinkje aanstaat.
   */
  movementDayChoice: MovementDayChoice | null;
  strongest: Pillar;
  vitality: number;
  vitalityDelta: number | null;
  vitalityDeltaNote: string | null;
  lifestyle: LifestyleItem[];
  supplement: PillarSupplement | null;
  trend: CheckTrend;
  trendBaselines?: CheckTrendBaselines;
  prevScores: CheckScores | null;
  history: CheckLogEntry[];
  retest: boolean;
  answers: Record<string, number> | null;
  date: string;
  deltaOf: (id: PillarId) => number;
  activeHabit: ActivePlanHabit | null;
  planDomain: MeasuredPillarId | null;
  planProgress: PlanProgress | null;
  movementPlanProgress: PlanProgress | null;
  sleepFocus: SleepCheckinFocus | null;
  movementRcvFeel: number | null;
  movementRcvFeelAt: string | null;
  movementPrefs: MovementPrefs;
};
