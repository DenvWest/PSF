import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function hasNutritionLogForSession(
  sessionId: string,
): Promise<boolean> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return false;
  }

  const { data, error } = await admin
    .from("intake_intake_log")
    .select("session_id")
    .eq("session_id", sessionId)
    .limit(1);

  if (error) {
    console.error("[nutrition-log-server] hasNutritionLogForSession:", error);
    return false;
  }

  return (data?.length ?? 0) > 0;
}

export async function getLatestNutritionLogAt(
  sessionId: string,
): Promise<string | null> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return null;
  }

  const { data, error } = await admin
    .from("intake_intake_log")
    .select("logged_at")
    .eq("session_id", sessionId)
    .order("logged_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("[nutrition-log-server] getLatestNutritionLogAt:", error);
    return null;
  }

  const loggedAt = data?.[0]?.logged_at;
  return typeof loggedAt === "string" ? loggedAt : null;
}
