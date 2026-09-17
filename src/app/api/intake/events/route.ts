import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsConsentFromRequest } from "@/lib/analytics-consent";
import { emitEvent, isDomainEventType, type DomainEventType } from "@/lib/events";
import {
  INTAKE_SESSION_COOKIE_NAME,
  verifySignedIntakeSessionCookie,
} from "@/lib/intake-session-cookie";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import {
  getRateLimitConfig,
  type RateLimitRoute,
} from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";

const CLIENT_EMIT_TYPES = new Set<DomainEventType>([
  "dashboard.first_checkin_started",
  "dashboard.vitality_scored",
  "dashboard.cta_to_hub",
  "dashboard.cta.clicked",
  "dashboard.aanrader_clicked",
  "dashboard.schap_vergelijking_click",
  "dashboard.schap_getoond",
  "dashboard.advies_gate_passed",
  "dashboard.afleiding_opened",
  "comparison.page_viewed",
  "intake.started",
  "intake.phase_completed",
  "intake.theme_revealed",
  "intake.cta_to_pillar",
  "intake.cta_to_primary_checkin",
  "intake.cta_to_comparison",
  "intake.track_chosen",
  "focus.viewed",
  "plan.viewed",
  "plan.action_clicked",
  "plan.tier_action_clicked",
  "plan.evidence_clicked",
  "plan.theme_switched",
  "plan.step_state_changed",
  "plan.step_link_clicked",
  "plan.phase_expanded",
  "plan.phase_opened",
  "plan.daily_rhythm_clicked",
  "plan.week_category_selected",
  "measurement.protein_cta_clicked",
  "nutrition.schap_bronnen_getoond",
  "nutrition.schap_bron_clicked",
  "nutrition.schap_categorie_gefilterd",
  "content.next_step_shown",
  "content.next_step_clicked",
  "content.related_clicked",
]);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePayload(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof key === "string" && key.length <= 64) {
      out[key] = value;
    }
  }
  return out;
}

/**
 * Welke emmer dit event uit eet. Een paginaweergave op /beste/* komt van koud
 * verkeer dat nog niets gekozen heeft; die mag het krappe intake-budget van
 * 20 verzoeken niet opsouperen, anders verliest de trechtermeting events juist
 * bij de bezoeker die wél doorklikt.
 */
function rateLimitRouteFor(eventType: string): RateLimitRoute {
  return eventType === "comparison.page_viewed"
    ? "comparison_view"
    : "intake_session";
}

function tooManyRequests(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    },
  );
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);

  const rawCookie = request.cookies.get(INTAKE_SESSION_COOKIE_NAME)?.value;
  const cookieSessionId = verifySignedIntakeSessionCookie(rawCookie);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    // Onleesbare body telt mee in de strengste emmer — anders is dit een gratis
    // manier om de limiet te omzeilen.
    await consumeRateLimitForIp(
      "intake_session",
      clientIp,
      getRateLimitConfig("intake_session"),
    );
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    await consumeRateLimitForIp(
      "intake_session",
      clientIp,
      getRateLimitConfig("intake_session"),
    );
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const eventTypeRaw =
    typeof record.event_type === "string" ? record.event_type.trim() : "";

  const isToegestaan =
    isDomainEventType(eventTypeRaw) && CLIENT_EMIT_TYPES.has(eventTypeRaw);
  const emmer: RateLimitRoute = isToegestaan
    ? rateLimitRouteFor(eventTypeRaw)
    : "intake_session";
  const rateLimit = await consumeRateLimitForIp(
    emmer,
    clientIp,
    getRateLimitConfig(emmer),
  );

  if (!rateLimit.allowed) {
    return tooManyRequests(rateLimit.retryAfterSeconds);
  }

  if (!isDomainEventType(eventTypeRaw)) {
    return NextResponse.json({ error: "Ongeldig event." }, { status: 400 });
  }

  if (!CLIENT_EMIT_TYPES.has(eventTypeRaw)) {
    return NextResponse.json({ error: "Event niet toegestaan." }, { status: 403 });
  }

  const bodySessionId =
    typeof record.session_id === "string" ? record.session_id.trim() : "";
  const sessionId = cookieSessionId ?? (bodySessionId || null);

  // comparison.page_viewed komt van koud extern verkeer op /beste/* — daar is per
  // definitie nog geen intake-sessie. Zonder deze uitzondering telt de noemer niets.
  const sessionOptionalEvent =
    eventTypeRaw === "dashboard.first_checkin_started" ||
    eventTypeRaw === "dashboard.vitality_scored" ||
    eventTypeRaw === "comparison.page_viewed" ||
    eventTypeRaw === "intake.started" ||
    eventTypeRaw === "intake.phase_completed";
  if (!sessionId && !sessionOptionalEvent) {
    return NextResponse.json({ error: "Geen geldige sessie." }, { status: 401 });
  }

  if (cookieSessionId && bodySessionId && bodySessionId !== cookieSessionId) {
    return NextResponse.json({ error: "Sessie komt niet overeen." }, { status: 403 });
  }

  const emailRaw = typeof record.email === "string" ? record.email.trim() : "";
  const email =
    emailRaw && EMAIL_REGEX.test(emailRaw) ? emailRaw.toLowerCase() : undefined;

  const payload = normalizePayload(record.payload);

  if (!getAnalyticsConsentFromRequest(request)) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  void emitEvent({
    eventType: eventTypeRaw,
    sessionId: sessionId ?? null,
    email,
    payload,
    deliveredTo: ["posthog"],
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
