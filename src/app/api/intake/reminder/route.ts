import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { sha256Hex } from "@/lib/consent-hashing";
import { getDefaultOrganizationId } from "@/lib/organization";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import {
  INTAKE_SESSION_COOKIE_NAME,
  verifySignedIntakeSessionCookie,
} from "@/lib/intake-session-cookie";
import { measurementReminderConsentRow } from "@/lib/measurement-reminder-consent";
import { getClientIp } from "@/lib/turnstile-verify";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

function toUuidOrNull(value: unknown): string | null {
  if (typeof value !== "string" || value === "") {
    return null;
  }
  const ok = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
  return ok ? value : null;
}

function logSecurityEvent(
  event: string,
  details: Record<string, unknown> = {},
) {
  console.warn("[api/intake/reminder][security]", { event, ...details });
}

function normalizeSingleLine(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/\s+/g, " ").trim();
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimitForIp("intake_reminder", clientIp, getRateLimitConfig("intake_reminder"));

  if (!rateLimit.allowed) {
    logSecurityEvent("rate_limited", { remoteIp: clientIp });
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
  }

  const bodyRecord = body as Record<string, unknown>;
  const website = normalizeSingleLine(bodyRecord.website);

  if (website) {
    logSecurityEvent("honeypot_hit", { remoteIp: clientIp });
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const email = normalizeSingleLine(bodyRecord.email);
  if (!email || email.length > MAX_EMAIL_LENGTH) {
    return NextResponse.json({ error: "Ongeldig e-mailadres." }, { status: 400 });
  }
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Ongeldig e-mailadres." }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const reminderDate = new Date();
  reminderDate.setDate(reminderDate.getDate() + 30);

  const sessionIdFromBody = toUuidOrNull(bodyRecord.sessionId);
  let sessionId: string | null = null;

  if (sessionIdFromBody) {
    const cookieSessionId = verifySignedIntakeSessionCookie(
      request.cookies.get(INTAKE_SESSION_COOKIE_NAME)?.value,
    );
    if (!cookieSessionId || cookieSessionId !== sessionIdFromBody) {
      return NextResponse.json(
        { error: "Sessie ongeldig. Doe de intake opnieuw via /intake." },
        { status: 401 },
      );
    }
    sessionId = sessionIdFromBody;

    const ua = request.headers.get("user-agent") ?? "";
    const ipHash = sha256Hex(clientIp);
    const uaHash = sha256Hex(ua);
    const organizationId = getDefaultOrganizationId();
    const grantedAt = new Date().toISOString();

    const consentRow = measurementReminderConsentRow({
      sessionId,
      organizationId,
      ipHash,
      uaHash,
      grantedAt,
    });

    const { error: consentError } = await admin
      .from("consent_records")
      .insert(consentRow);

    if (consentError) {
      console.error("[api/intake/reminder] consent insert error:", consentError);
      return NextResponse.json(
        { error: "Kon toestemming niet vastleggen. Probeer het opnieuw." },
        { status: 500 },
      );
    }
  }

  const { error } = await admin.from("intake_reminders").insert({
    organization_id: getDefaultOrganizationId(),
    email,
    reminder_date: reminderDate.toISOString(),
    reminder_type: "day30",
    session_id: sessionId,
  });

  if (error) {
    console.error("[api/intake/reminder] insert error:", error);
    return NextResponse.json(
      { error: "Herinnering kon niet worden opgeslagen." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
