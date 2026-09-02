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
import type {
  NutritionFactRow,
  NutritionGate,
  NutritionLadderLayerId,
} from "@/lib/nutrition-ladder";
import type { NutrientRouteStatus } from "@/lib/nutrition-route-status";
import type { LeefstijlLayerState } from "@/lib/leefstijl-ladder";
import type { NutrientContribution } from "@/lib/nutrition-contribution";
import type {
  NutritionPersonalizationContext,
  NutritionSufficiencySummary,
} from "@/lib/nutrition-sufficiency";
import type { NutritionLadderReport } from "@/lib/nutrition-ladder";
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
  | "keuze"
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
  | "Pill"
  | "BookOpen";

/**
 * De vier bestemmingen in de hoofdnavigatie (header op sm+, footer daaronder).
 *
 * **27 augustus: Hermeting eruit, Keuze erin.** Hermeting is een moment — één
 * keer per ~30 dagen — en stond permanent een kwart van de hoofdnavigatie te
 * bezetten; hij woont nu waar hij thuishoort, als scherm binnen Voortgang
 * (`screen=hermeting`), naast de meetreeksen die hij voedt. Keuze — het schap,
 * het aanbod per domein plus wat je daaruit koos — is wél een dagelijkse
 * bestemming en kwam alleen via Voortgang binnen. Die ruil is de reden dat
 * `keuze` een eigen tab-id heeft in plaats van een deeplink naar Voortgang:
 * een hoofdnavigatie-item moet een eigen URL-ruimte hebben, anders licht de
 * verkeerde tab op en kan de bestemming later geen tweede scherm dragen.
 */
export type DashboardTabId = "vandaag" | "agenda" | "voortgang" | "keuze";

export type VoortgangScreen =
  | "hub"
  | "leefstijlprofiel"
  /**
   * Meet of het werkt: het aftellen naar je hermeting én het verslag erna.
   * Stond tot 27 augustus als vierde tab in de hoofdnavigatie.
   */
  | "hermeting"
  /** @deprecated Legacy — het schap is de Keuze-tab geworden (`tab=keuze`). */
  | "schap"
  /** @deprecated Legacy — redirect naar leefstijlprofiel */
  | "inzichten"
  /** @deprecated Legacy — redirect naar leefstijlprofiel&fav= */
  | "domein";

/**
 * Vier sub-oppervlakken van de Keuze-tab, nooit tegelijk zichtbaar.
 *
 * In de URL heet dit `deel`; in code houdt het schap zijn eigen naam. De
 * route-taal (Keuze) en de inhoudstaal (schap = het aanbod van één domein)
 * zijn bewust gescheiden: durable events (`choice.shelf_opened`) en
 * surface-strings (`schap_slaap`) dragen meetreeksen die niet mogen breken
 * omdat een label verandert.
 */
export type SchapTabId =
  | "producten"
  | "diensten"
  | "begeleiding"
  | "logboek"
  | "favorieten";

export type LeefstijlprofielView = "aanbevolen" | "mijn_keuze";

/** @deprecated Statistieken-screen is verwijderd; alleen nog voor legacy tests. */
export type StatistiekenBlik = "stand" | "advies" | "tijd";

export type DashboardTab = {
  id: DashboardTabId;
  label: string;
  icon: DashboardIconName;
  title: string;
  /** Optioneel: alleen waar een ondertitel iets toevoegt dat de pagina zelf niet toont. */
  subtitle?: string;
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

/** Eén opgegeven waarde uit een domeincheck — letterlijk wat hij aanklikte. */
export type DomainMeasurementValue = {
  key: string;
  label: string;
  answerLabel: string;
  benchmarkLabel: string | null;
  /**
   * Waar dit antwoord staat op zijn eigen schaal, hoger is beter. Null wanneer
   * er niets is om tegen af te zetten ("je eigen antwoord is de meetlat") — dan
   * mag er geen lijn door, dat zou schijnprecisie zijn.
   */
  level: number | null;
  /** Lengte van die schaal — verschilt per bron, zie `scale`. */
  levelMax: number;
  /**
   * Waar de positie op rust. Bepaalt wat de UI mag zeggen: alleen `richtlijn`
   * mag norm-taal voeren, want alleen daar staat een gebronde grens onder de
   * indeling. `zelfrapportage` is puur zijn eigen antwoord. Voeding draagt
   * geen eigen stand meer: de drempels onder de nutriëntbanden zijn voorstellen
   * (zie de kop van `intake-reference.ts`), dus die rijen komen zonder `level`
   * binnen en krijgen daarom geen lijn.
   */
  scale: "richtlijn" | "zelfrapportage";
};

/**
 * Eén meetmoment van één domein. De reeks hiervan is wat Voortgang per domein
 * over tijd toont: de score én de waarden die eronder liggen.
 */
export type DomainMeasurement = {
  /**
   * Uniek per meetmoment, afgeleid van het tijdstip. Twee checks op één dag
   * delen wél een `dateIso` maar nooit een `id` — die deelt de dag niet op.
   */
  id: string;
  /** ISO-dag (YYYY-MM-DD) — de vorm om mee te rekenen. */
  dateIso: string;
  /** Weergavevorm, bijv. "12 aug 2026" — nooit parsen. */
  dateLabel: string;
  daysAgo: number;
  /** Domeinscore op dat moment, 0-100. */
  score: number;
  source: TrendSource;
  /** Leeg bij een leefstijlcheck-punt: die draagt alleen de score. */
  values: DomainMeasurementValue[];
};
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
  /**
   * Neutraal antwoord uit de voedingscheck (slider-stop), als raw_inputs
   * beschikbaar is. Geen band-oordeel.
   */
  answerLabel?: string;
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

/**
 * De voedingscheck als laduitlezing. Anders dan beweging en slaap bevriest
 * voeding geen conclusie in `raw_inputs`: de rijen én de kop worden allebei
 * herberekend uit de opgeslagen antwoorden, zodat een regel-fix in de engine
 * ook oude logs op Voortgang bereikt. Zie `nutrition-ladder.ts`.
 */
export type NutritionCheckinReadoutData = {
  date: string;
  headline: string;
  factRows: NutritionFactRow[];
  focusLayer: NutritionLadderLayerId | null;
  layerStates: Record<NutritionLadderLayerId, LeefstijlLayerState>;
  gate: NutritionGate;
  /**
   * Per nutriënt: haal je hem uit je eten, wat eet je ervoor, en mag de
   * vergelijk-deur open. Server-side berekend zodat het seizoen (vitamine D)
   * uit één klok komt en niet uit de browser van de bezoeker.
   */
  routes: NutrientRouteStatus[];
  /** Ruwe ladder-antwoorden — voor P1-categorie-split (groente vs. fruit). */
  ladderReport: NutritionLadderReport;
  sufficiency: NutritionSufficiencySummary;
  contribution: readonly NutrientContribution[];
  personalization: NutritionPersonalizationContext;
};

export type DashboardData = {
  empty: boolean;
  current: (CheckSnapshot & { trend: CheckTrend; trendBaselines?: CheckTrendBaselines }) | null;
  prev: CheckSnapshot | null;
  history: CheckLogEntry[];
  retest: boolean;
  nutritionIntake: { date: string; items: NutritionIntakeItem[] } | null;
  /** De eetbasis-ladder uit de laatste voedingscheck; null zonder log. */
  nutritionCheckinReadout: NutritionCheckinReadoutData | null;
  /** ISO-timestamp van de laatste voedingslog; null zonder log. */
  nutritionLastLoggedAt: string | null;
  /** True wanneer de laatste log ≥14 dagen geleden is — in-app her-log-nudge. */
  nutritionRelogDue: boolean;
  /** Dagen sinds nutritionLastLoggedAt; null zonder log. */
  daysSinceNutritionLog: number | null;
  movementRecoveryTrend: { date: string; value: number }[];
  movementRcvFeel: number | null;
  movementRcvFeelAt: string | null;
  remeasure: {
    /** Weergavevorm, bijv. "4 aug 2026" — nooit parsen. */
    dueDate: string;
    /** Dezelfde dag als ISO (YYYY-MM-DD) — dit is de vorm om mee te rekenen. */
    dueDateIso: string;
    daysUntil: number;
  } | null;
  cycleEvidence: {
    activeDays: number;
    /** Dag op de band: geklemd op [1, 30]. */
    cycleDay: number;
    /** Dagen sinds de start, ongeklemd — >30 zodra de cyclus verlopen is. */
    cycleDayRaw: number;
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
  /**
   * Per domein de meetmomenten over tijd, oudste eerst. Hoogstens de laatste
   * acht — Voortgang leest een reeks, geen archief.
   */
  domainMeasurements: Partial<Record<PillarId, DomainMeasurement[]>>;
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
  /**
   * De leeftijdsband uit de check ("40–44" … "55+"), of null zonder check.
   *
   * Alleen de eiwitrij in het voedingslogboek leest hem, om uit te leggen
   * waarom de ondergrens daar hoger ligt. Een band is grof genoeg om geen
   * geboortedatum te zijn en fijn genoeg voor die ene uitleg — het ruwe
   * gewicht blijft server-side (zie `nutrition-protein-personal.ts`).
   */
  ageRange: string | null;
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
