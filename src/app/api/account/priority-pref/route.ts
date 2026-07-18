import { NextRequest, NextResponse } from "next/server";
import { getAccountFromCookie } from "@/lib/account-server";
import {
  deleteAccountPriorityPref,
  dismissPlanStepForDate,
  getAccountPriorityPref,
  isIsoDate,
  isPinablePillarId,
  isPriorityPrefSource,
  isTimeBucket,
  isValidLocalTime,
  restorePlanStep,
  setPlanStepsHidden,
  upsertAccountPriorityPref,
  updateAccountScheduledTime,
  updateAccountTimeBucket,
  type TimeBucket,
} from "@/lib/account-priority-pref";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { emitEvent } from "@/lib/events";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";
import { getPriorityPillar } from "@/lib/priority-pillar";
import { mapCheckScoresToDomainScores } from "@/lib/reveal-model";
import { loadAccountDashboardData } from "@/lib/account-dashboard";

function rateLimitedResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

export async function GET() {
  const account = await getAccountFromCookie();
  if (!account) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const pref = await getAccountPriorityPref(admin, account.id);
  return NextResponse.json(pref ?? { pillarId: null }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const rateLimit = await consumeRateLimitForIp(
    "intake_session",
    getClientIp(request),
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
  const action = typeof record.action === "string" ? record.action.trim() : "";
  const surface =
    typeof record.surface === "string" && record.surface.trim()
      ? record.surface.trim()
      : "dashboard";

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const dashboardData = await loadAccountDashboardData(account.id);
  const enginePillarId =
    dashboardData.current && dashboardData.answers != null
      ? getPriorityPillar(
          mapCheckScoresToDomainScores(dashboardData.current.scores),
          dashboardData.answers,
        ).id
      : null;

  if (action === "reset") {
    await deleteAccountPriorityPref(admin, account.id);
    return NextResponse.json({ ok: true, pillarId: null }, { status: 200 });
  }

  const resolveFallbackPref = async () => {
    const existing = await getAccountPriorityPref(admin, account.id);
    const pillarId =
      existing?.pillarId ??
      (enginePillarId && isPinablePillarId(enginePillarId) ? enginePillarId : null);
    const source = existing?.source ?? "accept_engine";
    if (!pillarId) {
      return null;
    }
    return { pillarId, source };
  };

  if (action === "dismiss_plan_step") {
    const dateRaw = typeof record.date === "string" ? record.date.trim() : "";
    if (!isIsoDate(dateRaw)) {
      return NextResponse.json({ error: "Ongeldige datum." }, { status: 400 });
    }

    const fallback = await resolveFallbackPref();
    if (!fallback) {
      return NextResponse.json({ error: "Geen focus beschikbaar." }, { status: 400 });
    }

    const pref = await dismissPlanStepForDate(
      admin,
      account.id,
      account.organization_id,
      dateRaw,
      fallback,
    );

    void emitEvent({
      eventType: "agenda.plan_step_dismissed",
      email: account.email ?? undefined,
      organizationId: account.organization_id,
      payload: {
        date: dateRaw,
        pillar_id: pref.pillarId,
        surface,
        scope: "day",
      },
    });

    return NextResponse.json({ ok: true, ...pref }, { status: 200 });
  }

  if (action === "restore_plan_step") {
    const fallback = await resolveFallbackPref();
    if (!fallback) {
      return NextResponse.json({ error: "Geen focus beschikbaar." }, { status: 400 });
    }

    const pref = await restorePlanStep(
      admin,
      account.id,
      account.organization_id,
      fallback,
    );

    void emitEvent({
      eventType: "agenda.plan_step_restored",
      email: account.email ?? undefined,
      organizationId: account.organization_id,
      payload: {
        pillar_id: pref.pillarId,
        surface,
        scope: "day",
      },
    });

    return NextResponse.json({ ok: true, ...pref }, { status: 200 });
  }

  if (action === "hide_all_plan_steps") {
    const fallback = await resolveFallbackPref();
    if (!fallback) {
      return NextResponse.json({ error: "Geen focus beschikbaar." }, { status: 400 });
    }

    const pref = await setPlanStepsHidden(
      admin,
      account.id,
      account.organization_id,
      true,
      fallback,
    );

    void emitEvent({
      eventType: "agenda.plan_step_dismissed",
      email: account.email ?? undefined,
      organizationId: account.organization_id,
      payload: {
        pillar_id: pref.pillarId,
        surface,
        scope: "all",
      },
    });

    return NextResponse.json({ ok: true, ...pref }, { status: 200 });
  }

  if (action === "show_all_plan_steps") {
    const fallback = await resolveFallbackPref();
    if (!fallback) {
      return NextResponse.json({ error: "Geen focus beschikbaar." }, { status: 400 });
    }

    const pref = await setPlanStepsHidden(
      admin,
      account.id,
      account.organization_id,
      false,
      fallback,
    );

    void emitEvent({
      eventType: "agenda.plan_step_restored",
      email: account.email ?? undefined,
      organizationId: account.organization_id,
      payload: {
        pillar_id: pref.pillarId,
        surface,
        scope: "all",
      },
    });

    return NextResponse.json({ ok: true, ...pref }, { status: 200 });
  }

  if (action === "set_time_bucket") {
    const timeBucketRaw =
      typeof record.timeBucket === "string" ? record.timeBucket.trim() : "";
    if (!isTimeBucket(timeBucketRaw)) {
      return NextResponse.json({ error: "Ongeldig tijdvak." }, { status: 400 });
    }

    const existing = await getAccountPriorityPref(admin, account.id);
    const pillarId =
      existing?.pillarId ??
      (enginePillarId && isPinablePillarId(enginePillarId) ? enginePillarId : null);
    const source = existing?.source ?? "accept_engine";

    if (!pillarId) {
      return NextResponse.json({ error: "Geen focus beschikbaar." }, { status: 400 });
    }

    const pref = await updateAccountTimeBucket(
      admin,
      account.id,
      account.organization_id,
      pillarId,
      source,
      timeBucketRaw,
    );

    void emitEvent({
      eventType: "dashboard.time_bucket_set",
      email: account.email ?? undefined,
      organizationId: account.organization_id,
      payload: {
        time_bucket: timeBucketRaw,
        scheduled_time: pref.scheduledTime,
        surface,
      },
    });

    return NextResponse.json({ ok: true, ...pref }, { status: 200 });
  }

  if (action === "set_scheduled_time") {
    const scheduledTimeRaw =
      typeof record.scheduledTime === "string" ? record.scheduledTime.trim() : "";
    if (!isValidLocalTime(scheduledTimeRaw)) {
      return NextResponse.json({ error: "Ongeldig tijdstip." }, { status: 400 });
    }

    const existing = await getAccountPriorityPref(admin, account.id);
    const pillarId =
      existing?.pillarId ??
      (enginePillarId && isPinablePillarId(enginePillarId) ? enginePillarId : null);
    const source = existing?.source ?? "accept_engine";

    if (!pillarId) {
      return NextResponse.json({ error: "Geen focus beschikbaar." }, { status: 400 });
    }

    const pref = await updateAccountScheduledTime(
      admin,
      account.id,
      account.organization_id,
      pillarId,
      source,
      scheduledTimeRaw,
    );

    void emitEvent({
      eventType: "dashboard.time_bucket_set",
      email: account.email ?? undefined,
      organizationId: account.organization_id,
      payload: {
        time_bucket: pref.timeBucket,
        scheduled_time: scheduledTimeRaw,
        surface,
      },
    });

    return NextResponse.json({ ok: true, ...pref }, { status: 200 });
  }

  const pillarIdRaw =
    typeof record.pillarId === "string" ? record.pillarId.trim() : "";
  const sourceRaw = typeof record.source === "string" ? record.source.trim() : "";

  if (!isPinablePillarId(pillarIdRaw)) {
    return NextResponse.json({ error: "Ongeldige focus." }, { status: 400 });
  }
  if (!isPriorityPrefSource(sourceRaw)) {
    return NextResponse.json({ error: "Ongeldige bron." }, { status: 400 });
  }

  const resolvedPillarId =
    sourceRaw === "accept_engine" && enginePillarId && isPinablePillarId(enginePillarId)
      ? enginePillarId
      : pillarIdRaw;

  let timeBucketRaw: TimeBucket | null | undefined = undefined;
  if (record.timeBucket === null) {
    timeBucketRaw = null;
  } else if (typeof record.timeBucket === "string") {
    const trimmed = record.timeBucket.trim();
    if (isTimeBucket(trimmed)) {
      timeBucketRaw = trimmed;
    }
  }

  let scheduledTimeRaw: string | null | undefined = undefined;
  if (record.scheduledTime === null) {
    scheduledTimeRaw = null;
  } else if (typeof record.scheduledTime === "string") {
    const trimmed = record.scheduledTime.trim();
    if (isValidLocalTime(trimmed)) {
      scheduledTimeRaw = trimmed;
    }
  }

  const pref = await upsertAccountPriorityPref(admin, account.id, account.organization_id, {
    pillarId: resolvedPillarId,
    source: sourceRaw,
    timeBucket: timeBucketRaw,
    scheduledTime: scheduledTimeRaw,
  });

  void emitEvent({
    eventType: "dashboard.priority_selected",
    email: account.email ?? undefined,
    organizationId: account.organization_id,
    payload: {
      pillar_id: resolvedPillarId,
      engine_pillar_id: enginePillarId,
      source: sourceRaw,
      surface,
    },
  });

  return NextResponse.json({ ok: true, ...pref }, { status: 200 });
}
