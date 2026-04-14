import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getDefaultOrganizationId } from "@/lib/organization";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getClientIp } from "@/lib/turnstile-verify";

const REMINDER_RATE = {
  limit: 10,
  windowMs: 15 * 60 * 1000,
} as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

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
  const rateLimit = consumeRateLimit(`intake_reminder:${clientIp}`, REMINDER_RATE);

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

  const { error } = await admin.from("intake_reminders").insert({
    organization_id: getDefaultOrganizationId(),
    email,
    reminder_date: reminderDate.toISOString(),
    reminder_type: "day30",
    session_id: null,
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
