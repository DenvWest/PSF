import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimit } from "@/lib/rate-limit";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getClientIp } from "@/lib/turnstile-verify";

const FEEDBACK_RATE = {
  limit: 10,
  windowMs: 15 * 60 * 1000,
} as const;

function toUuidOrNull(value: string | null | undefined): string | null {
  if (value == null || value === "") {
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
  console.warn("[api/intake/feedback][security]", { event, ...details });
}

function normalizeSingleLine(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/\s+/g, " ").trim();
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = consumeRateLimit(`intake_feedback:${clientIp}`, FEEDBACK_RATE);

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

  const rating = bodyRecord.rating;
  if (rating !== "positive" && rating !== "negative") {
    return NextResponse.json({ error: "Ongeldige beoordeling." }, { status: 400 });
  }

  const commentRaw = bodyRecord.comment;
  const comment =
    typeof commentRaw === "string" ? commentRaw.trim().slice(0, 500) : "";
  const sessionId = toUuidOrNull(
    typeof bodyRecord.sessionId === "string" ? bodyRecord.sessionId : null,
  );

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const { error } = await admin.from("intake_feedback").insert({
    session_id: sessionId,
    rating,
    comment: comment.length > 0 ? comment : null,
  });

  if (error) {
    console.error("[api/intake/feedback] insert error:", error);
    return NextResponse.json(
      { error: "Feedback kon niet worden opgeslagen." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
