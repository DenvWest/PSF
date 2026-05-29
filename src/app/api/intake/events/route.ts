import { NextRequest, NextResponse } from "next/server";
import { emitEvent, isDomainEventType, type DomainEventType } from "@/lib/events";
import {
  INTAKE_SESSION_COOKIE_NAME,
  verifySignedIntakeSessionCookie,
} from "@/lib/intake-session-cookie";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";

const CLIENT_EMIT_TYPES = new Set<DomainEventType>([
  "intake.theme_revealed",
  "plan.action_clicked",
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

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = consumeRateLimitForIp(
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

  const rawCookie = request.cookies.get(INTAKE_SESSION_COOKIE_NAME)?.value;
  const cookieSessionId = verifySignedIntakeSessionCookie(rawCookie);

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

  if (!isDomainEventType(eventTypeRaw)) {
    return NextResponse.json({ error: "Ongeldig event." }, { status: 400 });
  }

  if (!CLIENT_EMIT_TYPES.has(eventTypeRaw)) {
    return NextResponse.json({ error: "Event niet toegestaan." }, { status: 403 });
  }

  const bodySessionId =
    typeof record.session_id === "string" ? record.session_id.trim() : "";
  const sessionId = cookieSessionId ?? (bodySessionId || null);

  if (!sessionId) {
    return NextResponse.json({ error: "Geen geldige sessie." }, { status: 401 });
  }

  if (cookieSessionId && bodySessionId && bodySessionId !== cookieSessionId) {
    return NextResponse.json({ error: "Sessie komt niet overeen." }, { status: 403 });
  }

  const emailRaw = typeof record.email === "string" ? record.email.trim() : "";
  const email =
    emailRaw && EMAIL_REGEX.test(emailRaw) ? emailRaw.toLowerCase() : undefined;

  const payload = normalizePayload(record.payload);

  void emitEvent({
    eventType: eventTypeRaw,
    sessionId,
    email,
    payload,
    deliveredTo: ["posthog"],
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
