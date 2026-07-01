import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getInterventionsForTheme,
  type InterventionBuckets,
  type MatchedIntervention,
} from "@/lib/content/match-interventions";
import {
  resolveCompletedPlanPhases,
  resolveNurtureTierAction,
} from "@/lib/content/resolve-nurture-tier";
import type { ThemeSlug } from "@/lib/content/themes";
import {
  calcDomainScores,
  getDeficiencySignals,
  getProfileLabel,
  type DomainScores,
} from "@/lib/intake-engine";
import type { NurtureInterventionHighlight } from "@/lib/email-templates/nurture/helpers";
import type { NurtureEmailData } from "@/lib/email-templates/nurture/types";
import { themeHasCompletePlanContent } from "@/lib/content/plan-content";
import { buildPlanIntakeContext } from "@/lib/lifestyle-plan-eval";
import { loadIntakeSessionPayloadBySessionId } from "@/lib/intake-session-server";
import { getDefaultOrganizationId } from "@/lib/organization";
import { getVisibleTiers } from "@/lib/org-settings";
import { loadPlanProgress } from "@/lib/plan-progress";
import {
  getPrimaryTheme,
  type MeasuredPillarId,
} from "@/lib/primary-theme";
import type { QuestionId, SymptomId } from "@/data/intake-questions";

const MEASURED_PILLARS = new Set<MeasuredPillarId>([
  "sleep",
  "stress",
  "nutrition",
  "movement",
  "connection",
]);

export type NurturePlanGate = {
  completedPlanPhases: number;
  visibleTiers: number[];
  organizationId: string;
};

function parseAnswers(raw: unknown): Record<string, number> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      out[key] = value;
    }
  }
  return Object.keys(out).length > 0 ? out : null;
}

function parseSymptoms(raw: unknown): SymptomId[] | null {
  if (!Array.isArray(raw)) {
    return null;
  }
  const out: SymptomId[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      out.push(item as SymptomId);
    }
  }
  return out.length > 0 ? out : null;
}

function isDomainScores(value: unknown): value is DomainScores {
  if (!value || typeof value !== "object") {
    return false;
  }
  const keys: (keyof DomainScores)[] = [
    "sleep_score",
    "energy_score",
    "stress_score",
    "nutrition_score",
    "movement_score",
    "recovery_score",
    "connection_score",
  ];
  const o = value as Record<string, unknown>;
  return keys.every((k) => {
    const raw = o[k];
    if (k === "connection_score" && (raw === undefined || raw === null)) {
      return true;
    }
    return typeof raw === "number" && Number.isFinite(raw);
  });
}

export async function getPlanInterventionBucketsForSession(
  sessionId: string,
): Promise<InterventionBuckets | null> {
  const loaded = await loadIntakeSessionPayloadBySessionId(sessionId);
  if (!loaded.ok || !loaded.session) {
    return null;
  }

  const session = loaded.session;
  const answers = parseAnswers(session.answers);
  const symptoms = parseSymptoms(session.symptoms);
  const scores = isDomainScores(session.scores)
    ? session.scores
    : answers
      ? calcDomainScores(answers as Record<QuestionId, number>)
      : null;

  if (!scores || !answers || !symptoms) {
    return null;
  }

  const themeSlug = getPrimaryTheme(scores, answers) as ThemeSlug;
  const planReady = await themeHasCompletePlanContent(themeSlug);
  if (!planReady) {
    return null;
  }

  const deficiencySignals = getDeficiencySignals(answers as Record<QuestionId, number>);
  const profileLabel = getProfileLabel(scores);

  const plan = await getInterventionsForTheme(
    themeSlug,
    scores,
    deficiencySignals,
    profileLabel,
    answers as Record<QuestionId, number>,
  );

  if (plan.source !== "database") {
    return null;
  }

  const { buckets } = plan;
  if (
    !buckets.free_action ||
    !buckets.measurement ||
    !buckets.supplement
  ) {
    return null;
  }

  return buckets;
}

export function interventionForNurtureDay(
  buckets: InterventionBuckets,
  sequenceDay: number,
  gate?: Pick<NurturePlanGate, "completedPlanPhases" | "visibleTiers">,
): MatchedIntervention | null {
  if (gate) {
    return resolveNurtureTierAction(
      buckets,
      gate.visibleTiers,
      gate.completedPlanPhases,
      sequenceDay,
    ).intervention;
  }

  switch (sequenceDay) {
    case 3:
      return buckets.free_action;
    case 14:
      return buckets.measurement;
    case 21:
      return buckets.supplement;
    default:
      return null;
  }
}

function parseMeasuredPillar(domain: string): MeasuredPillarId | null {
  const normalized = domain.trim().toLowerCase();
  if (MEASURED_PILLARS.has(normalized as MeasuredPillarId)) {
    return normalized as MeasuredPillarId;
  }
  return null;
}

export async function loadNurturePlanGate(
  admin: SupabaseClient,
  sessionId: string,
  primaryDomain: string,
): Promise<NurturePlanGate> {
  const { data: sessionRow, error: sessionError } = await admin
    .from("intake_sessions")
    .select("organization_id")
    .eq("id", sessionId)
    .maybeSingle<{ organization_id: string | null }>();

  if (sessionError) {
    throw sessionError;
  }

  const organizationId = sessionRow?.organization_id ?? getDefaultOrganizationId();
  const visibleTiers = await getVisibleTiers(organizationId);
  const measuredDomain = parseMeasuredPillar(primaryDomain);

  if (!measuredDomain) {
    return {
      completedPlanPhases: 0,
      visibleTiers,
      organizationId,
    };
  }

  const loaded = await loadIntakeSessionPayloadBySessionId(sessionId);
  if (!loaded.ok || !loaded.session) {
    return {
      completedPlanPhases: 0,
      visibleTiers,
      organizationId,
    };
  }

  const session = loaded.session;
  const answers = parseAnswers(session.answers);
  const scores = isDomainScores(session.scores)
    ? session.scores
    : answers
      ? calcDomainScores(answers as Record<QuestionId, number>)
      : null;

  if (!scores || !answers) {
    return {
      completedPlanPhases: 0,
      visibleTiers,
      organizationId,
    };
  }

  const progress = await loadPlanProgress(admin, sessionId, measuredDomain);
  const ctx = buildPlanIntakeContext(scores, answers, measuredDomain);

  return {
    completedPlanPhases: resolveCompletedPlanPhases(
      measuredDomain,
      ctx,
      progress?.steps ?? null,
    ),
    visibleTiers,
    organizationId,
  };
}

export function nurtureInterventionHighlight(
  intervention: MatchedIntervention,
): NurtureInterventionHighlight {
  const kindLabel =
    intervention.kind === "free_action"
      ? "Gratis actie"
      : intervention.kind === "measurement"
        ? "Meten"
        : "Supplement";
  const body =
    intervention.goalPhrase?.trim() || intervention.description.trim();
  return {
    title: intervention.name,
    body,
    kindLabel,
    comparePath: intervention.comparisonPath,
  };
}

export function resolveNurtureInterventionHighlight(
  data: Pick<
    NurtureEmailData,
    | "interventionBuckets"
    | "sequenceDay"
    | "completedPlanPhases"
    | "visibleTiers"
  >,
): NurtureInterventionHighlight | null {
  const buckets = data.interventionBuckets;
  if (!buckets) {
    return null;
  }

  const gate =
    data.visibleTiers !== undefined
      ? {
          completedPlanPhases: data.completedPlanPhases ?? 0,
          visibleTiers: data.visibleTiers,
        }
      : undefined;

  const intervention = interventionForNurtureDay(
    buckets,
    data.sequenceDay,
    gate,
  );
  if (!intervention) {
    return null;
  }
  return nurtureInterventionHighlight(intervention);
}
