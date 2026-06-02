import type { SupabaseClient } from "@supabase/supabase-js";
import {
  computeCurrentPhaseId,
  isPhaseComplete,
  isPlanComplete,
  selectVisibleSteps,
} from "@/lib/lifestyle-plan-eval";
import type { MeasuredPillarId } from "@/lib/primary-theme";
import type {
  LifestylePlanTemplate,
  PlanIntakeContext,
  PlanProgress,
  PlanStepProgress,
  PlanStepState,
} from "@/types/lifestyle-plan";

export const CHECKIN_STEP_ID = "slp-weekelijkse-check-in";

type PlanProgressRow = {
  session_id: string;
  organization_id: string;
  domain: string;
  template_version: string;
  current_phase_id: string;
  steps: Record<string, PlanStepProgress> | null;
  started_at: string;
  updated_at: string;
  completed_at: string | null;
};

export type UpsertStepResult = {
  progress: PlanProgress;
  previousStepState: PlanStepState;
  phaseCompleted: { phaseId: string } | null;
  checkinCompleted: { weekBucket: string } | null;
};

function mapRowToProgress(row: PlanProgressRow): PlanProgress {
  return {
    sessionId: row.session_id,
    organizationId: row.organization_id,
    domain: row.domain as MeasuredPillarId,
    templateVersion: row.template_version,
    currentPhaseId: row.current_phase_id,
    steps: row.steps ?? {},
    startedAt: row.started_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  };
}

function defaultStepState(): PlanStepState {
  return "todo";
}

function getStepState(
  steps: Record<string, PlanStepProgress>,
  stepId: string,
): PlanStepState {
  const entry = steps[stepId];
  if (
    entry?.state === "todo" ||
    entry?.state === "doing" ||
    entry?.state === "done" ||
    entry?.state === "skipped"
  ) {
    return entry.state;
  }
  return defaultStepState();
}

export function getCheckinWeekBucket(startedAt: string): string {
  const startedMs = new Date(startedAt).getTime();
  if (!Number.isFinite(startedMs)) {
    return "week-1";
  }
  const days = Math.max(
    0,
    Math.floor((Date.now() - startedMs) / (1000 * 60 * 60 * 24)),
  );
  if (days < 14) {
    return "week-1";
  }
  if (days < 28) {
    return "week-2";
  }
  if (days < 42) {
    return "week-4";
  }
  if (days < 56) {
    return "week-6";
  }
  if (days < 70) {
    return "week-8";
  }
  return "week-12";
}

export function isPhaseCompleteForTemplate(
  template: LifestylePlanTemplate,
  phaseId: string,
  ctx: PlanIntakeContext,
  steps: Record<string, PlanStepProgress>,
): boolean {
  const phase = template.phases.find((entry) => entry.id === phaseId);
  if (!phase) {
    return false;
  }
  return isPhaseComplete(phase, ctx, steps);
}

export async function loadPlanProgress(
  admin: SupabaseClient,
  sessionId: string,
  domain: MeasuredPillarId,
): Promise<PlanProgress | null> {
  const { data, error } = await admin
    .from("plan_progress")
    .select(
      "session_id, organization_id, domain, template_version, current_phase_id, steps, started_at, updated_at, completed_at",
    )
    .eq("session_id", sessionId)
    .eq("domain", domain)
    .maybeSingle();

  if (error) {
    console.error("[loadPlanProgress] error:", error);
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapRowToProgress(data as PlanProgressRow);
}

export async function upsertStepState(options: {
  admin: SupabaseClient;
  sessionId: string;
  organizationId: string;
  domain: MeasuredPillarId;
  template: LifestylePlanTemplate;
  ctx: PlanIntakeContext;
  phaseId: string;
  stepId: string;
  toState: PlanStepState;
}): Promise<UpsertStepResult> {
  const {
    admin,
    sessionId,
    organizationId,
    domain,
    template,
    ctx,
    phaseId,
    stepId,
    toState,
  } = options;

  const phase = template.phases.find((entry) => entry.id === phaseId);
  if (!phase) {
    throw new Error("invalid_phase");
  }

  const visibleSteps = selectVisibleSteps(phase, ctx);
  if (!visibleSteps.some((step) => step.id === stepId)) {
    throw new Error("invalid_step");
  }

  const existing = await loadPlanProgress(admin, sessionId, domain);
  const now = new Date().toISOString();
  const previousStepState = existing
    ? getStepState(existing.steps, stepId)
    : defaultStepState();

  const steps: Record<string, PlanStepProgress> = {
    ...(existing?.steps ?? {}),
    [stepId]: {
      stepId,
      state: toState,
      updatedAt: now,
    },
  };

  const phaseWasCompleteBefore = isPhaseComplete(phase, ctx, existing?.steps ?? {});
  const phaseIsCompleteAfter = isPhaseComplete(phase, ctx, steps);

  const currentPhaseId = computeCurrentPhaseId(template.phases, ctx, steps);
  const planComplete = isPlanComplete(template.phases, ctx, steps);

  const row = {
    session_id: sessionId,
    organization_id: organizationId,
    domain,
    template_version: template.version,
    current_phase_id: currentPhaseId,
    steps,
    started_at: existing?.startedAt ?? now,
    updated_at: now,
    completed_at: planComplete ? (existing?.completedAt ?? now) : null,
  };

  const { data, error } = await admin
    .from("plan_progress")
    .upsert(row, { onConflict: "session_id,domain" })
    .select(
      "session_id, organization_id, domain, template_version, current_phase_id, steps, started_at, updated_at, completed_at",
    )
    .single();

  if (error || !data) {
    console.error("[upsertStepState] error:", error);
    throw error ?? new Error("upsert_failed");
  }

  const progress = mapRowToProgress(data as PlanProgressRow);

  const phaseCompleted =
    !phaseWasCompleteBefore && phaseIsCompleteAfter
      ? { phaseId }
      : null;

  const checkinCompleted =
    stepId === CHECKIN_STEP_ID &&
    toState === "done" &&
    previousStepState !== "done"
      ? { weekBucket: getCheckinWeekBucket(progress.startedAt) }
      : null;

  return {
    progress,
    previousStepState,
    phaseCompleted,
    checkinCompleted,
  };
}
