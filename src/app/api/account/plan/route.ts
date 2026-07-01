import { NextRequest, NextResponse } from "next/server";
import { getPlanTemplate } from "@/data/lifestyle-plans";
import { emitEvent } from "@/lib/events";
import { getAccountFromCookie } from "@/lib/account-server";
import { buildPlanIntakeContext } from "@/lib/lifestyle-plan-eval";
import { buildHabitScoreKernel } from "@/lib/vitality-habit-kernel";
import { loadIntakeSessionPayloadBySessionId } from "@/lib/intake-session-server";
import { ANON_PROFILE_LABEL } from "@/lib/recovery-token";
import { getDefaultOrganizationId } from "@/lib/organization";
import { upsertStepState } from "@/lib/plan-progress";
import { getPrimaryTheme, type MeasuredPillarId } from "@/lib/primary-theme";
import { mapCheckScoresToDomainScores } from "@/lib/reveal-model";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getClientIp } from "@/lib/turnstile-verify";
import { getPriorityPillar } from "@/lib/priority-pillar";
import { computeVitaliteit, resolveVitaliteitFacets } from "@/lib/vitaliteit";
import type { DomainScores } from "@/lib/intake-engine";
import type { CheckScores } from "@/types/dashboard";
import type { PlanStepState } from "@/types/lifestyle-plan";

const MEASURED_PILLARS = ["sleep", "stress", "nutrition", "movement", "connection"] as const;
const STEP_STATES = ["todo", "doing", "done", "skipped"] as const;
const KERNEL_MODE = "kernel";

function isMeasuredPillarId(value: string): value is MeasuredPillarId {
  return (MEASURED_PILLARS as readonly string[]).includes(value);
}

function isPlanStepState(value: string): value is PlanStepState {
  return (STEP_STATES as readonly string[]).includes(value);
}

function rateLimitedResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    },
  );
}

function mapSessionScoresToCheckScores(scores: DomainScores): CheckScores {
  return {
    slaap: Math.round(scores.sleep_score ?? 0),
    energie: Math.round(scores.energy_score ?? 0),
    stress: Math.round(scores.stress_score ?? 0),
    voeding: Math.round(scores.nutrition_score ?? 0),
    beweging: Math.round(scores.movement_score ?? 0),
    herstel: Math.round(scores.recovery_score ?? 0),
    verbinding: Math.round(scores.connection_score ?? 0),
  };
}

function buildDriverPayload(
  scores: CheckScores,
  domainScores: ReturnType<typeof mapCheckScoresToDomainScores>,
  answers: Record<string, number>,
) {
  const priority = getPriorityPillar(domainScores, answers);
  const vitality = computeVitaliteit(resolveVitaliteitFacets(domainScores));
  const kernel = buildHabitScoreKernel({
    vitality,
    priorityId: priority.id,
    priorityScore: scores[priority.id],
    answers,
    domainScores,
  });

  return {
    driver_pillar: kernel.driverPillarId,
    driver_habit_id: kernel.driverHabitId,
    vitality_band: kernel.vitalityBand,
    confidence: kernel.confidence,
  };
}

async function resolveLatestSessionId(
  admin: NonNullable<ReturnType<typeof createSupabaseAdmin>>,
  accountId: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from("intake_sessions")
    .select("id,created_at,profile_label")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error || !data) {
    return null;
  }

  for (const row of data) {
    const sessionId = typeof row.id === "string" ? row.id.trim() : "";
    const profileLabel =
      typeof row.profile_label === "string" ? row.profile_label.trim() : "";
    if (sessionId && profileLabel && profileLabel !== ANON_PROFILE_LABEL) {
      return sessionId;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimitForIp(
    "intake_session",
    clientIp,
    getRateLimitConfig("intake_session"),
  );

  if (!rateLimit.allowed) {
    return rateLimitedResponse(rateLimit.retryAfterSeconds);
  }

  const account = await getAccountFromCookie();
  if (!account) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const mode = typeof record.mode === "string" ? record.mode.trim() : "";
  const stepId =
    typeof record.stepId === "string" ? record.stepId.trim() : "";
  const toStateRaw =
    typeof record.toState === "string" ? record.toState.trim() : "";

  if (!stepId || !isPlanStepState(toStateRaw)) {
    return NextResponse.json({ error: "Ongeldige payload." }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const sessionId = await resolveLatestSessionId(admin, account.id);
  if (!sessionId) {
    return NextResponse.json({ error: "Geen sessie gevonden." }, { status: 404 });
  }

  const loaded = await loadIntakeSessionPayloadBySessionId(sessionId);
  if (!loaded.ok || !loaded.session) {
    return NextResponse.json({ error: "Kon sessie niet laden." }, { status: 500 });
  }

  const checkScores = mapSessionScoresToCheckScores(loaded.session.scores);
  const domainScores = mapCheckScoresToDomainScores(checkScores);
  const driverPayload = buildDriverPayload(
    checkScores,
    domainScores,
    loaded.session.answers,
  );

  if (mode === KERNEL_MODE) {
    void emitEvent({
      eventType: "plan.step_state_changed",
      sessionId,
      organizationId: getDefaultOrganizationId(),
      payload: {
        source: "dashboard_kernel",
        step_id: stepId,
        from: "todo",
        to: toStateRaw,
        ...driverPayload,
      },
      deliveredTo: ["n8n_webhook", "posthog"],
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const domainRaw =
    typeof record.domain === "string" ? record.domain.trim() : "";
  const phaseId =
    typeof record.phaseId === "string" ? record.phaseId.trim() : "";

  if (!isMeasuredPillarId(domainRaw) || !phaseId) {
    return NextResponse.json({ error: "Ongeldige payload." }, { status: 400 });
  }

  const template = getPlanTemplate(domainRaw);
  if (!template) {
    return NextResponse.json({ error: "Geen plan voor dit domein." }, { status: 404 });
  }

  const primaryTheme = getPrimaryTheme(loaded.session.scores, loaded.session.answers);
  const ctx = buildPlanIntakeContext(
    loaded.session.scores,
    loaded.session.answers,
    primaryTheme,
  );

  try {
    const result = await upsertStepState({
      admin,
      sessionId,
      organizationId: getDefaultOrganizationId(),
      domain: domainRaw,
      template,
      ctx,
      phaseId,
      stepId,
      toState: toStateRaw,
    });

    if (result.previousStepState !== toStateRaw) {
      void emitEvent({
        eventType: "plan.step_state_changed",
        sessionId,
        organizationId: getDefaultOrganizationId(),
        payload: {
          source: "dashboard",
          domain: domainRaw,
          phase_id: phaseId,
          step_id: stepId,
          from: result.previousStepState,
          to: toStateRaw,
          template_version: template.version,
          ...driverPayload,
        },
        deliveredTo: ["n8n_webhook", "posthog"],
      });
    }

    if (result.phaseCompleted) {
      void emitEvent({
        eventType: "plan.phase_completed",
        sessionId,
        organizationId: getDefaultOrganizationId(),
        payload: {
          source: "dashboard",
          domain: domainRaw,
          phase_id: result.phaseCompleted.phaseId,
          template_version: template.version,
          ...driverPayload,
        },
        deliveredTo: ["n8n_webhook"],
      });
    }

    if (result.checkinCompleted) {
      void emitEvent({
        eventType: "plan.checkin_completed",
        sessionId,
        organizationId: getDefaultOrganizationId(),
        payload: {
          source: "dashboard",
          domain: domainRaw,
          week_bucket: result.checkinCompleted.weekBucket,
          ...driverPayload,
        },
        deliveredTo: ["n8n_webhook"],
      });
    }

    return NextResponse.json({ progress: result.progress }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "invalid_phase" || error.message === "invalid_step") {
        return NextResponse.json({ error: "Ongeldige stap." }, { status: 400 });
      }
    }
    return NextResponse.json(
      { error: "Kon voortgang niet opslaan." },
      { status: 500 },
    );
  }
}
