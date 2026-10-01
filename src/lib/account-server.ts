import { getAccountIdFromCookie } from "@/lib/account-session-cookie";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import type { SupabaseClient } from "@supabase/supabase-js";

type AccountRow = {
  id: string;
  email: string;
  status: string;
  organization_id: string;
  last_seen_at: string | null;
};

const LAST_SEEN_UPDATE_THRESHOLD_MS = 24 * 60 * 60 * 1000;

/**
 * Schrijft last_seen_at alleen bij als die >24u oud is (of ontbreekt) —
 * voorkomt een DB-write op elk request van een actieve gebruiker.
 * Fire-and-forget: een gefaalde update mag de aanroepende route niet raken.
 */
function touchLastSeen(admin: SupabaseClient, account: AccountRow): void {
  const lastSeen = account.last_seen_at ? new Date(account.last_seen_at).getTime() : 0;
  if (Date.now() - lastSeen < LAST_SEEN_UPDATE_THRESHOLD_MS) {
    return;
  }

  void admin
    .from("accounts")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", account.id)
    .then(({ error }) => {
      if (error) {
        console.error("[account-server] last_seen_at update failed:", error.message);
      }
    });
}

export async function getAccountFromCookie(): Promise<AccountRow | null> {
  const accountId = await getAccountIdFromCookie();
  if (!accountId) {
    return null;
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return null;
  }

  const { data, error } = await admin
    .from("accounts")
    .select("id,email,status,organization_id,last_seen_at")
    .eq("id", accountId)
    .maybeSingle<AccountRow>();

  if (error || !data || data.status === "revoked") {
    return null;
  }

  touchLastSeen(admin, data);

  return data;
}

export async function emailHasActiveAccount(
  admin: SupabaseClient,
  email: string,
): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  const { data, error } = await admin
    .from("accounts")
    .select("id,status")
    .eq("email", normalized)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  return (data as { status?: string }).status !== "revoked";
}
