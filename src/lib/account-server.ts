import { getAccountIdFromCookie } from "@/lib/account-session-cookie";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import type { SupabaseClient } from "@supabase/supabase-js";

type AccountRow = {
  id: string;
  email: string;
  status: string;
  organization_id: string;
};

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
    .select("id,email,status,organization_id")
    .eq("id", accountId)
    .maybeSingle<AccountRow>();

  if (error || !data || data.status === "revoked") {
    return null;
  }

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
