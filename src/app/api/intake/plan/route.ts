import { NextRequest, NextResponse } from "next/server";
import { getPlanTemplate } from "@/data/lifestyle-plans";
import { emitEvent } from "@/lib/events";
import { buildPlanIntakeContext } from "@/lib/lifestyle-plan-eval";
import {
  INTAKE_SESSION_COOKIE_NAME,
  verifySignedIntakeSessionCookie,
} from "@/lib/intake-session-cookie";
import { loadIntakeSessionPayloadBySessionId } from "@/lib/intake-session-server";
import { getDefaultOrganizationId } from "@/lib/organization";
import { loadPlanProgress, upsertStepState } from "@/lib/plan-progress";
import { getPrimaryTheme, type MeasuredPillarId } from "@/lib/primary-theme";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getClientIp } from "@/lib/turnstile-verify";
import type { PlanStepState } from "@/types/lifestyle-plan";

const MEASURED_PILLARS = ["sleep", "stress", "nutrition", "movement"] as const;
const STEP_STATES = ["todo", "doing", "done", "skipped"] as const;

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

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = consumeRateLimitForIp(
    "intake_session",
    clientIp,
    getRateLimitConfig("intake_session"),
  );

  if (!rateLimit.allowed) {
    return rateLimitedResponse(rateLimit.retryAfterSeconds);
  }

  const rawCookie = request.cookies.get(INTAKE_SESSION_COOKIE_NAME)?.value;
  const sessionId = verifySignedIntakeSessionCookie(rawCookie);

  if (!sessionId) {
    return NextResponse.json({ error: "Geen geldige sessie." }, { status: 401 });
  }

  const domainRaw = request.nextUrl.searchParams.get("domain")?.trim() ?? "";
  if (!isMeasuredPillarId(domainRaw)) {
    return NextResponse.json({ error: "Ongeldig domein." }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  try {
    const progress = await loadPlanProgress(admin, sessionId, domainRaw);
    return NextResponse.json({ progress }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Kon voortgang niet laden." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = consumeRateLimitForIp(
    "intake_session",
    clientIp,
    getRateLimitConfig("intake_session"),
  );

  if (!rateLimit.allowed) {
    return rateLimitedResponse(rateLimit.retryAfterSeconds);
  }

  const rawCookie = request.cookies.get(INTAKE_SESSION_COOKIE_NAME)?.value;
  const sessionId = verifySignedIntakeSessionCookie(rawCookie);

  if (!sessionId) {
    return NextResponse.json({ error: "Geen geldige sessie." }, { status: 401 });
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
  const domainRaw =
    typeof record.domain === "string" ? record.domain.trim() : "";
  const phaseId =
    typeof record.phaseId === "string" ? record.phaseId.trim() : "";
  const stepId =
    typeof record.stepId === "string" ? record.stepId.trim() : "";
  const toStateRaw =
    typeof record.toState === "string" ? record.toState.trim() : "";

  if (
    !isMeasuredPillarId(domainRaw) ||
    !phaseId ||
    !stepId ||
    !isPlanStepState(toStateRaw)
  ) {
    return NextResponse.json({ error: "Ongeldige payload." }, { status: 400 });
  }

  const template = getPlanTemplate(domainRaw);
  if (!template) {
    return NextResponse.json({ error: "Geen plan voor dit domein." }, { status: 404 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const loaded = await loadIntakeSessionPayloadBySessionId(sessionId);
  if (!loaded.ok) {
    return NextResponse.json(
      { error: "Kon sessie niet laden." },
      { status: loaded.error === "no_admin" ? 503 : 500 },
    );
  }

  if (!loaded.session) {
    return NextResponse.json({ error: "Sessie niet gevonden." }, { status: 404 });
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

    if (result.phaseCompleted) {
      void emitEvent({
        eventType: "plan.phase_completed",
        sessionId,
        payload: {
          domain: domainRaw,
          phase_id: result.phaseCompleted.phaseId,
          template_version: template.version,
        },
        deliveredTo: ["n8n_webhook"],
      });
    }

    if (result.checkinCompleted) {
      void emitEvent({
        eventType: "plan.checkin_completed",
        sessionId,
        payload: {
          domain: domainRaw,
          week_bucket: result.checkinCompleted.weekBucket,
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
