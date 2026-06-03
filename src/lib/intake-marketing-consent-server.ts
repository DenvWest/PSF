import type { SupabaseClient } from "@supabase/supabase-js";

export async function hasActiveIntakeMarketingEmailConsent(
  admin: SupabaseClient,
  sessionId: string,
): Promise<boolean> {
  const { data, error } = await admin
    .from("consent_records")
    .select("id")
    .eq("session_id", sessionId)
    .eq("consent_type", "marketing_email")
    .eq("granted", true)
    .is("withdrawn_at", null)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[hasActiveIntakeMarketingEmailConsent]", error);
    return false;
  }

  return Boolean(data);
}
