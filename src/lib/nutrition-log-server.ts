import { createSupabaseAdmin } from "@/lib/supabase-admin";

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

export async function getLatestNutritionLogRawInputs(
  sessionId: string,
): Promise<unknown | null> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return null;
  }

  const { data, error } = await admin
    .from("intake_intake_log")
    .select("raw_inputs")
    .eq("session_id", sessionId)
    .order("logged_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("[nutrition-log-server] getLatestNutritionLogRawInputs:", error);
    return null;
  }

  return data?.[0]?.raw_inputs ?? null;
}
