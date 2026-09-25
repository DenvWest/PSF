import { getAccountFromCookie } from "@/lib/account-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { BROAD_CHECK_SESSION_KINDS } from "@/types/intake-session-insert";

/**
 * Voor ingelogde accounts: nieuwste gekoppelde intake-sessie (zelfde als dashboard).
 * Anders: val terug op de intake-cookie-sessie.
 */
export async function resolveActiveIntakeSessionId(
  cookieSessionId: string | null,
): Promise<string | null> {
  const account = await getAccountFromCookie();
  if (!account) {
    return cookieSessionId;
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return cookieSessionId;
  }

  const { data, error } = await admin
    .from("intake_sessions")
    .select("id")
    .eq("account_id", account.id)
    .in("session_kind", [...BROAD_CHECK_SESSION_KINDS])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[resolveActiveIntakeSessionId] lookup error:", error);
    return cookieSessionId;
  }

  const accountSessionId = typeof data?.id === "string" ? data.id.trim() : "";
  if (accountSessionId) {
    return accountSessionId;
  }

  return cookieSessionId;
}
