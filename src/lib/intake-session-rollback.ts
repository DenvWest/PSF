import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Symmetrische saga-rollback: verwijdert de al-ingevoegde consent-rows én de sessie wanneer een
 * latere stap (bv. baseline-snapshot) faalt. Zonder dit blijven consent_records zonder bijbehorende
 * intake_sessions achter (AVG-administratie inconsistent). consent_records eerst (child), dan
 * intake_sessions (parent) — veilig ongeacht FK-config.
 */
export async function rollbackIntakeSession(
  admin: SupabaseClient,
  sessionId: string,
): Promise<void> {
  const { error: consentError } = await admin
    .from("consent_records")
    .delete()
    .eq("session_id", sessionId);
  if (consentError) {
    console.error(
      "[intake-session-rollback] consent_records delete error:",
      consentError,
    );
  }

  const { error: sessionError } = await admin
    .from("intake_sessions")
    .delete()
    .eq("id", sessionId);
  if (sessionError) {
    console.error(
      "[intake-session-rollback] intake_sessions delete error:",
      sessionError,
    );
  }
}
