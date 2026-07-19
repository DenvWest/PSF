import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsConsentFromRequest } from "@/lib/analytics-consent";
import { emitEvent, isDomainEventType, type DomainEventType } from "@/lib/events";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";
import {
  INTAKE_SESSION_COOKIE_NAME,
  verifySignedIntakeSessionCookie,
} from "@/lib/intake-session-cookie";

const CLIENT_EMIT_TYPES = new Set<DomainEventType>([
  "guide.sleep_analysis.started",
  "guide.sleep_analysis.completed",
  "dashboard.cta.clicked",
]);

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

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimitForIp(
    "intake_session",
    clientIp,
    getRateLimitConfig("intake_session"),
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
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
  const eventTypeRaw =
    typeof record.event_type === "string" ? record.event_type.trim() : "";

  if (!isDomainEventType(eventTypeRaw) || !CLIENT_EMIT_TYPES.has(eventTypeRaw)) {
    return NextResponse.json({ error: "Event niet toegestaan." }, { status: 403 });
  }

  if (!getAnalyticsConsentFromRequest(request)) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const rawCookie = request.cookies.get(INTAKE_SESSION_COOKIE_NAME)?.value;
  const sessionId = verifySignedIntakeSessionCookie(rawCookie);
  const payload = normalizePayload(record.payload);

  void emitEvent({
    eventType: eventTypeRaw,
    sessionId,
    payload,
    deliveredTo: ["posthog"],
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
