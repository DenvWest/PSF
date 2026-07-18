import { NextRequest, NextResponse } from "next/server";
import { getAccountFromCookie } from "@/lib/account-server";
import { getAnalyticsConsentFromRequest } from "@/lib/analytics-consent";
import { emitEvent, isDomainEventType, type DomainEventType } from "@/lib/events";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";

const CLIENT_EMIT_TYPES = new Set<DomainEventType>([
  "domain_tool.snapshot_viewed",
  "domain_tool.tier_preview_clicked",
  "focus.viewed",
  "wearable.interest_clicked",
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
  const eventTypeRaw =
    typeof record.event_type === "string" ? record.event_type.trim() : "";

  if (!isDomainEventType(eventTypeRaw)) {
    return NextResponse.json({ error: "Ongeldig event." }, { status: 400 });
  }

  if (!CLIENT_EMIT_TYPES.has(eventTypeRaw)) {
    return NextResponse.json({ error: "Event niet toegestaan." }, { status: 403 });
  }

  const payload = normalizePayload(record.payload);

  // Consent-bias: zonder analytics-consent geen durable insert (200 = silent drop).
  // Funnel-ratio's alleen binnen consented cohort vergelijken.
  if (!getAnalyticsConsentFromRequest(request)) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  void emitEvent({
    eventType: eventTypeRaw,
    email: account.email,
    organizationId: account.organization_id,
    payload,
    deliveredTo: ["posthog"],
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
