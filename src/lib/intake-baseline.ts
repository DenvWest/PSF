import type { IntakeAgeRange, SymptomId } from "@/data/intake-questions";
import {
  type DomainScoreKey,
  type DomainScores,
  RULES_VERSION,
} from "@/lib/intake-engine";
import {
  hasMethodologyChange,
  isRecoveryDeltaComparable,
} from "@/lib/rules-version";
import { ANON_PROFILE_LABEL } from "@/lib/recovery-token";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const DOMAIN_SCORE_KEYS: DomainScoreKey[] = [
  "sleep_score",
  "energy_score",
  "stress_score",
  "nutrition_score",
  "movement_score",
  "recovery_score",
];

export type BaselineSnapshot = {
  sessionId: string;
  organizationId: string;
  frozenAt: string;
  domainScores: DomainScores;
  profileLabel: string;
  urgencyLevel: string;
  rulesVersion: string;
  primaryTheme: string | null;
  symptomProfile: SymptomId[];
  ageRange: IntakeAgeRange;
};

export type RemeasureCompletedPayload = {
  profile_label: string;
  per_domain_delta: Record<DomainScoreKey, number>;
  rules_version_baseline: string;
  rules_version_current: string;
  days_since_baseline: number;
  methodology_changed: boolean;
};

export type CreateBaselineSnapshotInput = {
  sessionId: string;
  organizationId: string;
  domainScores: DomainScores;
  profileLabel: string;
  urgencyLevel: string;
  rulesVersion?: string;
  primaryTheme: string | null;
  symptomProfile: SymptomId[];
  ageRange: IntakeAgeRange;
};

export function computePerDomainDelta(
  baseline: DomainScores,
  current: DomainScores,
): Record<DomainScoreKey, number> {
  const delta = {} as Record<DomainScoreKey, number>;
  for (const key of DOMAIN_SCORE_KEYS) {
    delta[key] = current[key] - baseline[key];
  }
  return delta;
}

export function sanitizePerDomainDelta(input: {
  baseline: DomainScores;
  current: DomainScores;
  baselineRulesVersion: string;
  currentRulesVersion: string;
}): Record<DomainScoreKey, number> {
  const delta = computePerDomainDelta(input.baseline, input.current);
  const recoveryComparable = isRecoveryDeltaComparable(
    input.baselineRulesVersion,
    input.currentRulesVersion,
  );
  if (!recoveryComparable) {
    delta.recovery_score = 0;
  }
  return delta;
}

export function buildRemeasureCompletedPayload(input: {
  baseline: BaselineSnapshot;
  currentScores: DomainScores;
  currentRulesVersion?: string;
  completedAt?: Date;
}): RemeasureCompletedPayload {
  const completedAt = input.completedAt ?? new Date();
  const frozenAt = new Date(input.baseline.frozenAt);
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysSinceBaseline = Math.max(
    0,
    Math.round((completedAt.getTime() - frozenAt.getTime()) / msPerDay),
  );

  const currentRulesVersion = input.currentRulesVersion ?? RULES_VERSION;
  const methodologyChanged = hasMethodologyChange(
    input.baseline.rulesVersion,
    currentRulesVersion,
  );

  return {
    profile_label: input.baseline.profileLabel,
    per_domain_delta: sanitizePerDomainDelta({
      baseline: input.baseline.domainScores,
      current: input.currentScores,
      baselineRulesVersion: input.baseline.rulesVersion,
      currentRulesVersion,
    }),
    rules_version_baseline: input.baseline.rulesVersion,
    rules_version_current: currentRulesVersion,
    days_since_baseline: daysSinceBaseline,
    methodology_changed: methodologyChanged,
  };
}

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

function rowToBaselineSnapshot(row: Record<string, unknown>): BaselineSnapshot | null {
  const sessionId =
    typeof row.session_id === "string" ? row.session_id.trim() : "";
  const organizationId =
    typeof row.organization_id === "string" ? row.organization_id.trim() : "";
  const frozenAt =
    typeof row.frozen_at === "string" ? row.frozen_at : "";
  const domainScores = parseDomainScores(row.domain_scores);
  const profileLabel =
    typeof row.profile_label === "string" ? row.profile_label.trim() : "";
  const urgencyLevel =
    typeof row.urgency_level === "string" ? row.urgency_level.trim() : "";
  const rulesVersion =
    typeof row.rules_version === "string" ? row.rules_version.trim() : "";
  const primaryTheme =
    typeof row.primary_theme === "string" && row.primary_theme.trim()
      ? row.primary_theme.trim()
      : null;
  const ageRange = row.age_range;

  if (
    !sessionId ||
    !organizationId ||
    !frozenAt ||
    !domainScores ||
    !profileLabel ||
    profileLabel === ANON_PROFILE_LABEL ||
    !urgencyLevel ||
    !rulesVersion ||
    typeof ageRange !== "string" ||
    !ageRange.trim()
  ) {
    return null;
  }

  const symptomProfile = Array.isArray(row.symptom_profile)
    ? row.symptom_profile.filter(
        (item): item is SymptomId => typeof item === "string",
      )
    : [];

  return {
    sessionId,
    organizationId,
    frozenAt,
    domainScores,
    profileLabel,
    urgencyLevel,
    rulesVersion,
    primaryTheme,
    symptomProfile,
    ageRange: ageRange as IntakeAgeRange,
  };
}

export async function createBaselineSnapshot(
  input: CreateBaselineSnapshotInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return { ok: false, error: "no_admin" };
  }

  const { error } = await admin.from("intake_baseline_snapshots").insert({
    session_id: input.sessionId,
    organization_id: input.organizationId,
    domain_scores: input.domainScores,
    profile_label: input.profileLabel,
    urgency_level: input.urgencyLevel,
    rules_version: input.rulesVersion ?? RULES_VERSION,
    primary_theme: input.primaryTheme,
    symptom_profile: input.symptomProfile,
    age_range: input.ageRange,
  });

  if (error) {
    console.error("[intake-baseline] create snapshot failed:", error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function loadBaselineSnapshot(
  sessionId: string,
): Promise<BaselineSnapshot | null> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return null;
  }

  const { data, error } = await admin
    .from("intake_baseline_snapshots")
    .select(
      "session_id, organization_id, frozen_at, domain_scores, profile_label, urgency_level, rules_version, primary_theme, symptom_profile, age_range",
    )
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("[intake-baseline] load snapshot failed:", error);
    }
    return null;
  }

  return rowToBaselineSnapshot(data as Record<string, unknown>);
}
