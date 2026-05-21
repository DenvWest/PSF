import type { SupabaseClient } from "@supabase/supabase-js";
import { ANON_PROFILE_LABEL } from "@/lib/recovery-token";

const ANON_DOMAIN_SCORES = {
  sleep_score: 0,
  energy_score: 0,
  stress_score: 0,
  nutrition_score: 0,
  movement_score: 0,
  recovery_score: 0,
} as const;

export async function revokeIntakeConsentForSession(
  admin: SupabaseClient,
  sessionId: string,
): Promise<{ ok: true } | { ok: false; step: string; error: unknown }> {
  const now = new Date().toISOString();

  const { error: withdrawError } = await admin
    .from("consent_records")
    .update({ withdrawn_at: now })
    .eq("session_id", sessionId)
    .is("withdrawn_at", null);

  if (withdrawError) {
    return { ok: false, step: "consent_records", error: withdrawError };
  }

  const { error: nurtureError } = await admin
    .from("nurture_emails")
    .delete()
    .eq("session_id", sessionId);

  if (nurtureError) {
    return { ok: false, step: "nurture_emails", error: nurtureError };
  }

  const { error: remindersError } = await admin
    .from("intake_reminders")
    .delete()
    .eq("session_id", sessionId);

  if (remindersError) {
    return { ok: false, step: "intake_reminders", error: remindersError };
  }

  const { error: tokensError } = await admin
    .from("recovery_tokens")
    .delete()
    .eq("session_id", sessionId);

  if (tokensError) {
    return { ok: false, step: "recovery_tokens", error: tokensError };
  }

  const { error: anonError } = await admin
    .from("intake_sessions")
    .update({
      symptom_profile: [],
      answers: {},
      domain_scores: ANON_DOMAIN_SCORES,
      urgency_level: ANON_PROFILE_LABEL,
      profile_label: ANON_PROFILE_LABEL,
      age_range: null,
      marketing_email: null,
      first_name: null,
    })
    .eq("id", sessionId);

  if (anonError) {
    return { ok: false, step: "intake_sessions", error: anonError };
  }

  return { ok: true };
}
