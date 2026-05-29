import { NextRequest, NextResponse } from "next/server";
import {
  INTAKE_SESSION_COOKIE_NAME,
  verifySignedIntakeSessionCookie,
} from "@/lib/intake-session-cookie";
import { emitEvent } from "@/lib/events";
import { revokeIntakeConsentForSession } from "@/lib/intake-consent-revoke";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

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

  const result = await revokeIntakeConsentForSession(admin, sessionId);
  if (result.ok) {
    void emitEvent({
      eventType: "consent.revoked",
      sessionId,
      payload: { source: "intake_consent_delete" },
      deliveredTo: ["nurture"],
    });
  }

  if (!result.ok) {
    console.error(
      `[api/intake/consent] revoke failed at ${result.step}:`,
      result.error,
    );
    return NextResponse.json(
      { error: "Toestemming kon niet volledig worden ingetrokken." },
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
