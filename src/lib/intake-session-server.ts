import { cookies } from "next/headers";
import {
  INTAKE_SESSION_COOKIE_NAME,
  verifySignedIntakeSessionCookie,
} from "@/lib/intake-session-cookie";
import {
  type IntakeSessionPayload,
  intakeSessionRowToPayload,
} from "@/lib/intake-session-payload";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * Liest een gevalideerd intake-sessie-record uit Supabase.
 * O.a. bedoeld voor de GET-handler van `/api/intake/session` (503/500-afhandeling buiten deze functie).
 */
export async function loadIntakeSessionPayloadBySessionId(
  sessionId: string,
): Promise<
  | { ok: true; session: IntakeSessionPayload | null }
  | { ok: false; error: "no_admin" | "db" }
> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return { ok: false, error: "no_admin" };
  }

  const { data, error } = await admin
    .from("intake_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();

  if (error) {
    console.error("[loadIntakeSessionPayloadBySessionId] error:", error);
    return { ok: false, error: "db" };
  }

  if (!data) {
    return { ok: true, session: null };
  }

  return { ok: true, session: intakeSessionRowToPayload(data) };
}

/**
 * Leest de ondertekende `psf_intake_sid`-cookie en haalt de sessie op.
 * Geeft `null` terug zonder te throwen (geen cookie, ongeldige cookie, geen data, of tijdelijke serverfout).
 */
export async function getIntakeSessionServer(): Promise<IntakeSessionPayload | null> {
  const store = await cookies();
  const rawCookie = store.get(INTAKE_SESSION_COOKIE_NAME)?.value;
  const sessionId = verifySignedIntakeSessionCookie(rawCookie);
  if (!sessionId) {
    return null;
  }

  const loaded = await loadIntakeSessionPayloadBySessionId(sessionId);
  if (!loaded.ok) {
    return null;
  }
  return loaded.session;
}
