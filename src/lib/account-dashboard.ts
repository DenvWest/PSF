import { derivePriority } from "@/lib/dashboard-model";
import { getPriorityPillar } from "@/lib/priority-pillar";
import { resolvePlanDomain } from "@/lib/dashboard-active-plan";
import { PILLAR } from "@/data/dashboard";
import {
  perfectSupplementMeasurementConfig,
} from "@/data/measurement-config";
import { nutrientReferences } from "@/data/nutrition/intake-reference";
import { buildDeltaReport } from "@/lib/delta-report";
import { compareNutritionEstimates } from "@/lib/nutrition-delta";
import type { DomainScoreKey, DomainScores } from "@/lib/intake-engine";
import type { MeasuredPillarId } from "@/lib/primary-theme";
import type { IntakeEstimate } from "@/lib/nutrition-intake-estimate";
import { ANON_PROFILE_LABEL } from "@/lib/recovery-token";
import { loadPlanProgress } from "@/lib/plan-progress";
import { loadMovementRecoveryTrend } from "@/lib/movement-recovery-context";
import { getAccountPriorityPref } from "@/lib/account-priority-pref";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { computeVitaliteit, resolveVitaliteitFacets } from "@/lib/vitaliteit";
import { parseSleepCheckinFocus } from "@/lib/sleep-assessment";
import type {
  CheckLogEntry,
  CheckScores,
  CheckSnapshot,
  CheckTrend,
  CheckTrendBaselines,
  DashboardData,
  NutritionIntakeBand,
  PillarId,
  SleepCheckinFocus,
  TrendSource,
} from "@/types/dashboard";
import type { SustainedAction } from "@/types/delta-report";
import type { PlanStepProgress } from "@/types/lifestyle-plan";

const EMPTY_DASHBOARD_DATA: DashboardData = {
  empty: true,
  current: null,
  prev: null,
  history: [],
  retest: false,
  nutritionIntake: null,
  movementRecoveryTrend: [],
  movementRcvFeel: null,
  movementRcvFeelAt: null,
  remeasure: null,
  deltaReport: null,
  profileLabel: null,
  firstName: null,
  answers: null,
  sessionId: null,
  planProgress: null,
  planDomain: null,
  priorityPref: null,
  sleepCheckinFocus: null,
};

const DOMAIN_SCORE_KEYS: DomainScoreKey[] = [
  "sleep_score",
  "energy_score",
  "stress_score",
  "nutrition_score",
  "movement_score",
  "recovery_score",
  "connection_score",
];

const PILLAR_IDS: PillarId[] = [
  "slaap",
  "energie",
  "stress",
  "voeding",
  "beweging",
  "herstel",
  "verbinding",
];

const CHECKIN_DOMAIN_TO_PILLAR: Record<string, PillarId> = {
  sleep_score: "slaap",
  stress_score: "stress",
  movement_score: "beweging",
};

const MEASURED_DOMAIN_TO_SCORE_KEY: Record<MeasuredPillarId, DomainScoreKey> = {
  sleep: "sleep_score",
  stress: "stress_score",
  nutrition: "nutrition_score",
  movement: "movement_score",
  connection: "connection_score",
};

const MEASURED_DOMAIN_TO_PILLAR: Record<MeasuredPillarId, PillarId> = {
  sleep: "slaap",
  stress: "stress",
  nutrition: "voeding",
  movement: "beweging",
  connection: "verbinding",
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type SessionRow = {
  id: string | null;
  domain_scores: unknown;
  created_at: string | null;
  profile_label: string | null;
  first_name: string | null;
  answers: unknown;
  rules_version: string | null;
};

export type AccountSessionSnapshot = {
  id: string;
  scores: CheckScores;
  vitality: number;
  date: string;
  priority: PillarId;
  ts: number;
  profileLabel: string;
  firstName: string | null;
  answers: Record<string, number> | null;
  rulesVersion: string;
};

export function mapSessionSnapshotToPrev(
  snapshot: Pick<
    AccountSessionSnapshot,
    "scores" | "vitality" | "date" | "rulesVersion"
  >,
): CheckSnapshot {
  return {
    scores: snapshot.scores,
    vitality: snapshot.vitality,
    date: snapshot.date,
    rulesVersion: snapshot.rulesVersion,
  };
}

function parseRulesVersion(value: unknown): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return "1.0.0";
}

function parseDomainScores(value: unknown): DomainScores | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const scores = {} as DomainScores;

  for (const key of DOMAIN_SCORE_KEYS) {
    const raw = record[key];
    if (key === "connection_score" && (raw === undefined || raw === null)) {
      scores[key] = 0;
      continue;
    }
    if (typeof raw !== "number" || !Number.isFinite(raw)) {
      return null;
    }
    scores[key] = raw;
  }

  return scores;
}

function parseAnswers(value: unknown): Record<string, number> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const answers: Record<string, number> = {};

  for (const [key, raw] of Object.entries(record)) {
    if (typeof raw === "number" && Number.isFinite(raw)) {
      answers[key] = raw;
    }
  }

  return Object.keys(answers).length > 0 ? answers : null;
}

function formatDashboardDate(createdAt: string): string {
  return new Date(createdAt)
    .toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .replace(".", "");
}

function mapCheckScoresToDomainScores(scores: CheckScores): DomainScores {
  return {
    sleep_score: scores.slaap,
    energy_score: scores.energie,
    stress_score: scores.stress,
    nutrition_score: scores.voeding,
    movement_score: scores.beweging,
    recovery_score: scores.herstel,
    connection_score: scores.verbinding,
  };
}

function hasDoneStep(steps: Record<string, PlanStepProgress> | null): boolean {
  if (!steps) {
    return false;
  }
  return Object.values(steps).some((step) => step.state === "done");
}

function parseMeasuredDomain(value: unknown): MeasuredPillarId | null {
  if (
    value === "sleep" ||
    value === "stress" ||
    value === "nutrition" ||
    value === "movement" ||
    value === "connection"
  ) {
    return value;
  }
  return null;
}

function buildSustainedActions(
  rows: Array<{ domain: unknown; steps: unknown }>,
): SustainedAction[] {
  const seen = new Set<DomainScoreKey>();
  const actions: SustainedAction[] = [];

  for (const row of rows) {
    const measuredDomain = parseMeasuredDomain(row.domain);
    if (!measuredDomain) {
      continue;
    }

    const domainId = MEASURED_DOMAIN_TO_SCORE_KEY[measuredDomain];
    if (seen.has(domainId)) {
      continue;
    }

    const steps =
      row.steps && typeof row.steps === "object" && !Array.isArray(row.steps)
        ? (row.steps as Record<string, PlanStepProgress>)
        : null;

    if (!hasDoneStep(steps)) {
      continue;
    }

    const pillarId = MEASURED_DOMAIN_TO_PILLAR[measuredDomain];
    actions.push({
      domainId,
      action: PILLAR[pillarId].quickWin.title,
    });
    seen.add(domainId);
  }

  return actions;
}

function mapDomainScoresToCheckScores(domainScores: DomainScores): CheckScores {
  return {
    slaap: Math.round(domainScores.sleep_score),
    energie: Math.round(domainScores.energy_score),
    stress: Math.round(domainScores.stress_score),
    voeding: Math.round(domainScores.nutrition_score),
    beweging: Math.round(domainScores.movement_score),
    herstel: Math.round(domainScores.recovery_score),
    verbinding: Math.round(domainScores.connection_score),
  };
}

export async function loadAccountDashboardData(
  accountId: string,
): Promise<DashboardData> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return EMPTY_DASHBOARD_DATA;
  }

  const { data, error } = await admin
    .from("intake_sessions")
    .select("id,domain_scores,created_at,profile_label,first_name,answers,rules_version")
    .eq("account_id", accountId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return EMPTY_DASHBOARD_DATA;
  }

  const snapshots: AccountSessionSnapshot[] = (data as SessionRow[])
    .map((row) => {
      const profileLabel =
        typeof row.profile_label === "string" ? row.profile_label.trim() : "";
      const sessionId = typeof row.id === "string" ? row.id.trim() : "";
      const createdAt =
        typeof row.created_at === "string" ? row.created_at.trim() : "";
      const domainScores = parseDomainScores(row.domain_scores);
      const ts = new Date(createdAt).getTime();

      const answers = parseAnswers(row.answers);
      const rawFirstName =
        typeof row.first_name === "string" ? row.first_name.trim() : "";
      const firstName = rawFirstName.length > 0 ? rawFirstName : null;

      if (
        !sessionId ||
        !domainScores ||
        !createdAt ||
        !Number.isFinite(ts) ||
        !profileLabel ||
        profileLabel === ANON_PROFILE_LABEL
      ) {
        return null;
      }

      const scores = mapDomainScoresToCheckScores(domainScores);
      const vitality = computeVitaliteit(resolveVitaliteitFacets(domainScores));
      const priority = getPriorityPillar(domainScores, answers ?? {}).id;

      return {
        id: sessionId,
        scores,
        vitality,
        date: formatDashboardDate(createdAt),
        priority,
        ts,
        profileLabel,
        answers,
        firstName,
        rulesVersion: parseRulesVersion(row.rules_version),
      };
    })
    .filter((row): row is AccountSessionSnapshot => row !== null);

  if (snapshots.length === 0) {
    return EMPTY_DASHBOARD_DATA;
  }

  const sessionIds = snapshots.map((snapshot) => snapshot.id);
  const [
    { data: checkinData },
    { data: logRows },
    { data: planProgressRows },
    movementRecoveryTrend,
  ] = await Promise.all([
    admin
      .from("intake_domain_checkin")
      .select("session_id,domain_key,score,created_at,rules_version,raw_inputs")
      .in("session_id", sessionIds)
      .order("created_at", { ascending: true }),
    admin
      .from("intake_intake_log")
      .select("estimate, logged_at, nutrition_score")
      .in("session_id", sessionIds)
      .order("logged_at", { ascending: true }),
    admin
      .from("plan_progress")
      .select("session_id, domain, steps")
      .in("session_id", sessionIds),
    loadMovementRecoveryTrend(sessionIds),
  ]);

  let nutritionIntake: DashboardData["nutritionIntake"] = null;
  const latestLog = logRows?.[logRows.length - 1];
  const previousLog = logRows?.[logRows.length - 2];

  let changedBandByNutrient: Map<string, NutritionIntakeBand> | undefined;
  if (
    previousLog &&
    latestLog &&
    Array.isArray(previousLog.estimate) &&
    Array.isArray(latestLog.estimate)
  ) {
    const deltas = compareNutritionEstimates(
      previousLog.estimate as IntakeEstimate[],
      latestLog.estimate as IntakeEstimate[],
    );
    changedBandByNutrient = new Map(
      deltas
        .filter((d) => d.direction !== "unchanged")
        .map((d) => [d.nutrient, d.from as NutritionIntakeBand]),
    );
  }

  if (latestLog && Array.isArray(latestLog.estimate)) {
    const items = (latestLog.estimate as IntakeEstimate[])
      .filter(
        (entry) =>
          entry &&
          (entry.band === "below" || entry.band === "around" || entry.band === "meets") &&
          typeof entry.nutrient === "string",
      )
      .map((entry) => ({
        label:
          nutrientReferences[entry.nutrient]?.label ?? String(entry.nutrient),
        band: entry.band,
        ...(changedBandByNutrient?.has(entry.nutrient)
          ? { previousBand: changedBandByNutrient.get(entry.nutrient)! }
          : {}),
      }));
    if (items.length > 0 && typeof latestLog.logged_at === "string") {
      nutritionIntake = { date: formatDashboardDate(latestLog.logged_at), items };
    }
  }

  type Point = {
    value: number;
    ts: number;
    source: TrendSource;
    rulesVersion: string | null;
  };
  const series: Record<PillarId, Point[]> = {
    slaap: [],
    energie: [],
    stress: [],
    voeding: [],
    beweging: [],
    herstel: [],
    verbinding: [],
  };

  for (const snapshot of snapshots) {
    for (const pillar of PILLAR_IDS) {
      series[pillar].push({
        value: snapshot.scores[pillar],
        ts: snapshot.ts,
        source: "intake",
        rulesVersion: snapshot.rulesVersion,
      });
    }
  }

  type CheckinRow = {
    session_id?: string;
    domain_key: string;
    score: unknown;
    created_at: string;
    rules_version: unknown;
    raw_inputs?: unknown;
  };

  for (const row of (checkinData ?? []) as CheckinRow[]) {
    const pillar = CHECKIN_DOMAIN_TO_PILLAR[row.domain_key];
    if (!pillar) {
      continue;
    }

    const scoreObj = row.score;
    const raw =
      scoreObj && typeof scoreObj === "object"
        ? (scoreObj as Record<string, unknown>)[row.domain_key]
        : undefined;
    const ts = new Date(row.created_at).getTime();

    if (typeof raw !== "number" || !Number.isFinite(raw) || !Number.isFinite(ts)) {
      continue;
    }

    series[pillar].push({
      value: Math.round(raw),
      ts,
      source: "checkin",
      rulesVersion: typeof row.rules_version === "string" ? row.rules_version : null,
    });
  }

  type LogRow = { logged_at: unknown; nutrition_score: unknown };
  for (const row of (logRows ?? []) as LogRow[]) {
    if (typeof row.nutrition_score !== "number" || !Number.isFinite(row.nutrition_score)) {
      continue;
    }
    if (typeof row.logged_at !== "string") {
      continue;
    }
    const ts = new Date(row.logged_at).getTime();
    if (!Number.isFinite(ts)) {
      continue;
    }
    series.voeding.push({
      value: Math.round(row.nutrition_score),
      ts,
      source: "nutrition_log",
      rulesVersion: null,
    });
  }

  for (const pillar of PILLAR_IDS) {
    series[pillar].sort((a, b) => a.ts - b.ts);
  }

  const currentScores = Object.fromEntries(
    PILLAR_IDS.map((pillar) => [pillar, series[pillar][series[pillar].length - 1].value]),
  ) as CheckScores;
  const trend = Object.fromEntries(
    PILLAR_IDS.map((pillar) => [pillar, series[pillar].slice(-6).map((point) => point.value)]),
  ) as CheckTrend;
  const currentDomainScores: DomainScores = {
    sleep_score: currentScores.slaap,
    energy_score: currentScores.energie,
    stress_score: currentScores.stress,
    nutrition_score: currentScores.voeding,
    movement_score: currentScores.beweging,
    recovery_score: currentScores.herstel,
    connection_score: currentScores.verbinding,
  };
  const currentVitality = computeVitaliteit(resolveVitaliteitFacets(currentDomainScores));
  const latestTs = Math.max(...PILLAR_IDS.map((pillar) => series[pillar][series[pillar].length - 1].ts));
  const currentDate = formatDashboardDate(new Date(latestTs).toISOString());

  const latestSnapshot = snapshots[snapshots.length - 1];

  let movementRcvFeel: number | null = null;
  let movementRcvFeelAt: string | null = null;
  const movementCheckins = ((checkinData ?? []) as CheckinRow[])
    .filter(
      (row) =>
        row.domain_key === "movement_score" &&
        row.session_id === latestSnapshot.id &&
        typeof row.created_at === "string",
    )
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  const latestMovementCheckin = movementCheckins[movementCheckins.length - 1];
  if (latestMovementCheckin?.raw_inputs) {
    const raw = latestMovementCheckin.raw_inputs;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const rcvFeel = (raw as Record<string, unknown>).RCV_FEEL;
      if (
        typeof rcvFeel === "number" &&
        Number.isInteger(rcvFeel) &&
        rcvFeel >= 1 &&
        rcvFeel <= 5
      ) {
        movementRcvFeel = rcvFeel;
        movementRcvFeelAt = latestMovementCheckin.created_at;
      }
    }
  }

  let sleepCheckinFocus: SleepCheckinFocus | null = null;
  const sleepCheckins = ((checkinData ?? []) as CheckinRow[])
    .filter(
      (row) =>
        row.domain_key === "sleep_score" &&
        row.session_id === latestSnapshot.id &&
        typeof row.created_at === "string",
    )
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  const latestSleepCheckin = sleepCheckins[sleepCheckins.length - 1];
  if (latestSleepCheckin) {
    const parsed = parseSleepCheckinFocus(latestSleepCheckin.raw_inputs);
    if (parsed) {
      sleepCheckinFocus = {
        ...parsed,
        date: formatDashboardDate(latestSleepCheckin.created_at),
      };
    }
  }

  const trendBaselines = Object.fromEntries(
    PILLAR_IDS.flatMap((pillar) => {
      const firstPoint = series[pillar][0];
      if (!firstPoint) {
        return [];
      }
      return [
        [
          pillar,
          {
            value: firstPoint.value,
            source: firstPoint.source,
            rulesVersion: firstPoint.rulesVersion,
            crossesRulesVersion:
              firstPoint.rulesVersion != null &&
              firstPoint.rulesVersion !== latestSnapshot.rulesVersion,
          },
        ],
      ];
    }),
  ) as CheckTrendBaselines;

  const prevSnapshot =
    snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;

  const history: CheckLogEntry[] = snapshots.map((snapshot, index) => ({
    seq: index + 1,
    date: snapshot.date,
    priority: snapshot.priority,
    vitality: snapshot.vitality,
  }));

  const firstSessionTs = snapshots[0].ts;
  const due = new Date(firstSessionTs);
  due.setUTCDate(due.getUTCDate() + 30);
  const daysUntil = Math.ceil((due.getTime() - Date.now()) / 86_400_000);
  const remeasure = {
    dueDate: formatDashboardDate(due.toISOString()),
    daysUntil,
  };

  const baselineDomainScores = mapCheckScoresToDomainScores(snapshots[0].scores);
  const daysBetween = Math.max(
    0,
    Math.round((latestTs - firstSessionTs) / MS_PER_DAY),
  );
  const sustainedActions = buildSustainedActions(planProgressRows ?? []);
  const latestAnswers = latestSnapshot.answers;
  const latestDomainScores = mapCheckScoresToDomainScores(currentScores);
  const planDomain =
    latestAnswers != null
      ? resolvePlanDomain(
          derivePriority(currentScores)[0].id,
          latestDomainScores,
          latestAnswers,
        )
      : null;
  let planProgress = null;
  if (planDomain && latestSnapshot.id) {
    try {
      planProgress = await loadPlanProgress(
        admin,
        latestSnapshot.id,
        planDomain,
      );
    } catch {
      planProgress = null;
    }
  }

  const deltaReport =
    snapshots.length >= 2
      ? buildDeltaReport({
          baseline: baselineDomainScores,
          current: currentDomainScores,
          daysBetween,
          sustainedActions,
          config: perfectSupplementMeasurementConfig,
          baselineRulesVersion: snapshots[0].rulesVersion,
          currentRulesVersion: latestSnapshot.rulesVersion,
        })
      : null;

  const priorityPrefRow = await getAccountPriorityPref(admin, accountId);
  const priorityPref = priorityPrefRow
    ? {
        pillarId: priorityPrefRow.pillarId,
        source: priorityPrefRow.source,
        timeBucket: priorityPrefRow.timeBucket,
        scheduledTime: priorityPrefRow.scheduledTime,
        planStepDismissedDate: priorityPrefRow.planStepDismissedDate,
        planStepsHidden: priorityPrefRow.planStepsHidden,
        updatedAt: priorityPrefRow.updatedAt,
      }
    : null;

  return {
    empty: false,
    current: {
      scores: currentScores,
      vitality: currentVitality,
      date: currentDate,
      trend,
      trendBaselines,
    },
    prev: prevSnapshot ? mapSessionSnapshotToPrev(prevSnapshot) : null,
    history,
    retest: snapshots.length >= 2,
    nutritionIntake,
    movementRecoveryTrend,
    movementRcvFeel,
    movementRcvFeelAt,
    remeasure,
    deltaReport,
    profileLabel: latestSnapshot.profileLabel,
    firstName: latestSnapshot.firstName,
    answers: latestAnswers,
    sessionId: latestSnapshot.id,
    planProgress,
    planDomain,
    priorityPref,
    sleepCheckinFocus,
  };
}
