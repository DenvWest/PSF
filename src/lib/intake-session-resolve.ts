import { getAccountFromCookie } from "@/lib/account-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { BROAD_CHECK_SESSION_KINDS } from "@/types/intake-session-insert";

export type CheckSubject = {
  accountId: string | null;
  /** Ingelogd: alle sessie-ids van het account. Anoniem: de cookie-sessie (of leeg). */
  sessionIds: string[];
};

/**
 * "Wie is dit?" vóór "welke sessie?" — ongeacht `session_kind`, in tegenstelling
 * tot `resolveActiveIntakeSessionId` (alleen de brede check). Lost P4/P5 op voor
 * ingelogde gebruikers. Zie BESLUITDOCUMENT_SESSIE_ARCHITECTUUR_2026-09.md §3.4.
 */
export async function resolveCheckSubject(
  cookieSessionId: string | null,
): Promise<CheckSubject> {
  const account = await getAccountFromCookie();
  if (!account) {
    return { accountId: null, sessionIds: cookieSessionId ? [cookieSessionId] : [] };
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return { accountId: account.id, sessionIds: cookieSessionId ? [cookieSessionId] : [] };
  }

  const { data, error } = await admin
    .from("intake_sessions")
    .select("id")
    .eq("account_id", account.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[resolveCheckSubject] lookup error:", error);
    return { accountId: account.id, sessionIds: cookieSessionId ? [cookieSessionId] : [] };
  }

  const sessionIds = (data ?? [])
    .map((row) => (typeof row.id === "string" ? row.id : ""))
    .filter((id) => id.length > 0);

  if (sessionIds.length > 0) {
    return { accountId: account.id, sessionIds };
  }

  return { accountId: account.id, sessionIds: cookieSessionId ? [cookieSessionId] : [] };
}

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
