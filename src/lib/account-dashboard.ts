import { derivePriority } from "@/lib/dashboard-model";
import { PILLAR } from "@/data/dashboard";
import {
  perfectSupplementMeasurementConfig,
} from "@/data/measurement-config";
import { nutrientReferences } from "@/data/nutrition/intake-reference";
import { buildDeltaReport } from "@/lib/delta-report";
import type { DomainScoreKey, DomainScores } from "@/lib/intake-engine";
import type { MeasuredPillarId } from "@/lib/primary-theme";
import type { IntakeEstimate } from "@/lib/nutrition-intake-estimate";
import { ANON_PROFILE_LABEL } from "@/lib/recovery-token";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { computeVitaliteit, resolveVitaliteitFacets } from "@/lib/vitaliteit";
import type {
  CheckLogEntry,
  CheckScores,
  CheckTrend,
  DashboardData,
  PillarId,
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
  remeasure: null,
  deltaReport: null,
  profileLabel: null,
};

const DOMAIN_SCORE_KEYS: DomainScoreKey[] = [
  "sleep_score",
  "energy_score",
  "stress_score",
  "nutrition_score",
  "movement_score",
  "recovery_score",
];

const PILLAR_IDS: PillarId[] = [
  "slaap",
  "energie",
  "stress",
  "voeding",
  "beweging",
  "herstel",
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
};

const MEASURED_DOMAIN_TO_PILLAR: Record<MeasuredPillarId, PillarId> = {
  sleep: "slaap",
  stress: "stress",
  nutrition: "voeding",
  movement: "beweging",
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type SessionRow = {
  id: string | null;
  domain_scores: unknown;
  created_at: string | null;
  profile_label: string | null;
};

type SessionSnapshot = {
  id: string;
  scores: CheckScores;
  vitality: number;
  date: string;
  priority: PillarId;
  ts: number;
  profileLabel: string;
};

function parseDomainScores(value: unknown): DomainScores | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const scores = {} as DomainScores;

  for (const key of DOMAIN_SCORE_KEYS) {
    const raw = record[key];
    if (typeof raw !== "number" || !Number.isFinite(raw)) {
      return null;
    }
    scores[key] = raw;
  }

  return scores;
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
    value === "movement"
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
    .select("id,domain_scores,created_at,profile_label")
    .eq("account_id", accountId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return EMPTY_DASHBOARD_DATA;
  }

  const snapshots: SessionSnapshot[] = (data as SessionRow[])
    .map((row) => {
      const profileLabel =
        typeof row.profile_label === "string" ? row.profile_label.trim() : "";
      const sessionId = typeof row.id === "string" ? row.id.trim() : "";
      const createdAt =
        typeof row.created_at === "string" ? row.created_at.trim() : "";
      const domainScores = parseDomainScores(row.domain_scores);
      const ts = new Date(createdAt).getTime();

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
      const priority = derivePriority(scores)[0].id;

      return {
        id: sessionId,
        scores,
        vitality,
        date: formatDashboardDate(createdAt),
        priority,
        ts,
        profileLabel,
      };
    })
    .filter((row): row is SessionSnapshot => row !== null);

  if (snapshots.length === 0) {
    return EMPTY_DASHBOARD_DATA;
  }

  const sessionIds = snapshots.map((snapshot) => snapshot.id);
  const { data: checkinData } = await admin
    .from("intake_domain_checkin")
    .select("session_id,domain_key,score,created_at")
    .in("session_id", sessionIds)
    .order("created_at", { ascending: true });
  const { data: logRows } = await admin
    .from("intake_intake_log")
    .select("estimate, logged_at")
    .in("session_id", sessionIds)
    .order("logged_at", { ascending: false })
    .limit(1);
  const { data: planProgressRows } = await admin
    .from("plan_progress")
    .select("session_id, domain, steps")
    .in("session_id", sessionIds);

  let nutritionIntake: DashboardData["nutritionIntake"] = null;
  const latestLog = logRows?.[0];
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
      }));
    if (items.length > 0 && typeof latestLog.logged_at === "string") {
      nutritionIntake = { date: formatDashboardDate(latestLog.logged_at), items };
    }
  }

  type Point = { value: number; ts: number };
  const series: Record<PillarId, Point[]> = {
    slaap: [],
    energie: [],
    stress: [],
    voeding: [],
    beweging: [],
    herstel: [],
  };

  for (const snapshot of snapshots) {
    for (const pillar of PILLAR_IDS) {
      series[pillar].push({ value: snapshot.scores[pillar], ts: snapshot.ts });
    }
  }

  type CheckinRow = {
    domain_key: string;
    score: unknown;
    created_at: string;
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

    series[pillar].push({ value: Math.round(raw), ts });
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
  };
  const currentVitality = computeVitaliteit(resolveVitaliteitFacets(currentDomainScores));
  const latestTs = Math.max(...PILLAR_IDS.map((pillar) => series[pillar][series[pillar].length - 1].ts));
  const currentDate = formatDashboardDate(new Date(latestTs).toISOString());

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
  const deltaReport =
    snapshots.length >= 2
      ? buildDeltaReport({
          baseline: baselineDomainScores,
          current: currentDomainScores,
          daysBetween,
          sustainedActions,
          config: perfectSupplementMeasurementConfig,
        })
      : null;

  return {
    empty: false,
    current: {
      scores: currentScores,
      vitality: currentVitality,
      date: currentDate,
      trend,
    },
    prev: prevSnapshot
      ? {
          scores: prevSnapshot.scores,
          vitality: prevSnapshot.vitality,
          date: prevSnapshot.date,
        }
      : null,
    history,
    retest: snapshots.length >= 2,
    nutritionIntake,
    remeasure,
    deltaReport,
    profileLabel: snapshots[snapshots.length - 1].profileLabel,
  };
}
