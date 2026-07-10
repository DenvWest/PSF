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
