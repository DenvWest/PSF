import { getAccountIdFromCookie } from "@/lib/account-session-cookie";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

type AccountRow = {
  id: string;
  email: string;
  status: string;
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
    .select("id,email,status")
    .eq("id", accountId)
    .maybeSingle<AccountRow>();

  if (error || !data || data.status === "revoked") {
    return null;
  }

  return data;
}
