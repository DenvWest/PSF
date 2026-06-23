import type { DeltaReport } from "@/types/delta-report";
import type { DomainScores } from "@/lib/intake-engine";

export type PillarId =
  | "slaap"
  | "energie"
  | "stress"
  | "voeding"
  | "beweging"
  | "herstel";

export type CheckId = "check1" | "check2";

export type DashboardSectionType =
  | "now"
  | "priority"
  | "plan"
  | "signals"
  | "nutritionIntake"
  | "retest"
  | "identity"
  | "history"
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
  | "RouteMap"
  | "BarChart"
  | "Calendar"
  | "BookOpen";

export type DashboardTabId =
  | "vandaag"
  | "roadmap"
  | "voortgang"
  | "hermeting"
  | "adviezen";

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
export type CheckSnapshot = { scores: CheckScores; vitality: number; date: string };

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
};

export type DashboardData = {
  empty: boolean;
  current: (CheckSnapshot & { trend: CheckTrend }) | null;
  prev: CheckSnapshot | null;
  history: CheckLogEntry[];
  retest: boolean;
  nutritionIntake: { date: string; items: NutritionIntakeItem[] } | null;
  remeasure: { dueDate: string; daysUntil: number } | null;
  deltaReport: DeltaReport | null;
  profileLabel: string | null;
  answers: Record<string, number> | null;
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
  priority: Pillar;
  strongest: Pillar;
  vitality: number;
  vitalityDelta: number | null;
  lifestyle: LifestyleItem[];
  supplement: PillarSupplement | null;
  trend: CheckTrend;
  prevScores: CheckScores | null;
  history: CheckLogEntry[];
  retest: boolean;
  answers: Record<string, number> | null;
  date: string;
  deltaOf: (id: PillarId) => number;
};
