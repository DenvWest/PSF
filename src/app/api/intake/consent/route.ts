import { NextRequest, NextResponse } from "next/server";
import {
  INTAKE_SESSION_COOKIE_NAME,
  verifySignedIntakeSessionCookie,
} from "@/lib/intake-session-cookie";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const ANON_DOMAIN_SCORES = {
  sleep_score: 0,
  energy_score: 0,
  stress_score: 0,
  nutrition_score: 0,
  movement_score: 0,
  recovery_score: 0,
} as const;

function logSecurityEvent(
  event: string,
  details: Record<string, unknown> = {},
) {
  console.warn("[api/intake/consent][security]", { event, ...details });
}

export async function DELETE(request: NextRequest) {
  const rawCookie = request.cookies.get(INTAKE_SESSION_COOKIE_NAME)?.value;
  const sessionId = verifySignedIntakeSessionCookie(rawCookie);

  if (!sessionId) {
    logSecurityEvent("missing_session");
    return NextResponse.json(
      { error: "Geen geldige intake-sessie." },
      { status: 401 },
    );
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const now = new Date().toISOString();

  const { error: withdrawError } = await admin
    .from("consent_records")
    .update({ withdrawn_at: now })
    .eq("session_id", sessionId)
    .is("withdrawn_at", null);

  if (withdrawError) {
    console.error("[api/intake/consent] withdraw error:", withdrawError);
    return NextResponse.json(
      { error: "Toestemming kon niet worden ingetrokken." },
      { status: 500 },
    );
  }

  const { error: anonError } = await admin
    .from("intake_sessions")
    .update({
      symptom_profile: [],
      answers: {},
      domain_scores: ANON_DOMAIN_SCORES,
      urgency_level: "—",
      profile_label: "—",
      age_range: null,
      marketing_email: null,
    })
    .eq("id", sessionId);

  if (anonError) {
    console.error("[api/intake/consent] anonymize error:", anonError);
    return NextResponse.json(
      { error: "Sessie kon niet worden geanonimiseerd." },
      { status: 500 },
    );
  }

  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set(INTAKE_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return res;
}
