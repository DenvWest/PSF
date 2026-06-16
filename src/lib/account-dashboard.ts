import { derivePriority } from "@/lib/dashboard-model";
import type { DomainScoreKey, DomainScores } from "@/lib/intake-engine";
import { ANON_PROFILE_LABEL } from "@/lib/recovery-token";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { computeVitaliteit, resolveVitaliteitFacets } from "@/lib/vitaliteit";
import type {
  CheckLogEntry,
  CheckScores,
  DashboardData,
  PillarId,
} from "@/types/dashboard";

const EMPTY_DASHBOARD_DATA: DashboardData = {
  empty: true,
  current: null,
  prev: null,
  history: [],
  retest: false,
};

const DOMAIN_SCORE_KEYS: DomainScoreKey[] = [
  "sleep_score",
  "energy_score",
  "stress_score",
  "nutrition_score",
  "movement_score",
  "recovery_score",
];

type SessionRow = {
  domain_scores: unknown;
  created_at: string | null;
  profile_label: string | null;
};

type SessionSnapshot = {
  scores: CheckScores;
  vitality: number;
  date: string;
  priority: PillarId;
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
    .select("domain_scores,created_at,profile_label")
    .eq("account_id", accountId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return EMPTY_DASHBOARD_DATA;
  }

  const snapshots: SessionSnapshot[] = (data as SessionRow[])
    .map((row) => {
      const profileLabel =
        typeof row.profile_label === "string" ? row.profile_label.trim() : "";
      const createdAt =
        typeof row.created_at === "string" ? row.created_at.trim() : "";
      const domainScores = parseDomainScores(row.domain_scores);

      if (
        !domainScores ||
        !createdAt ||
        !profileLabel ||
        profileLabel === ANON_PROFILE_LABEL
      ) {
        return null;
      }

      const scores = mapDomainScoresToCheckScores(domainScores);
      const vitality = computeVitaliteit(resolveVitaliteitFacets(domainScores));
      const priority = derivePriority(scores)[0].id;

      return {
        scores,
        vitality,
        date: formatDashboardDate(createdAt),
        priority,
      };
    })
    .filter((row): row is SessionSnapshot => row !== null);

  if (snapshots.length === 0) {
    return EMPTY_DASHBOARD_DATA;
  }

  const currentSnapshot = snapshots[snapshots.length - 1];
  const prevSnapshot =
    snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;
  const trendSource = snapshots.slice(-6);
  const trend = {
    slaap: trendSource.map((snapshot) => snapshot.scores.slaap),
    energie: trendSource.map((snapshot) => snapshot.scores.energie),
    stress: trendSource.map((snapshot) => snapshot.scores.stress),
    voeding: trendSource.map((snapshot) => snapshot.scores.voeding),
    beweging: trendSource.map((snapshot) => snapshot.scores.beweging),
    herstel: trendSource.map((snapshot) => snapshot.scores.herstel),
  };

  const history: CheckLogEntry[] = snapshots.map((snapshot, index) => ({
    seq: index + 1,
    date: snapshot.date,
    priority: snapshot.priority,
    vitality: snapshot.vitality,
  }));

  return {
    empty: false,
    current: {
      scores: currentSnapshot.scores,
      vitality: currentSnapshot.vitality,
      date: currentSnapshot.date,
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
  };
}
