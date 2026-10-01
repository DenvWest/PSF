import { createSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * Accepteert één of meerdere sessie-ids: een ingelogde bezoeker met meerdere
 * sessies (brede check + check) leest zo de nieuwste log over al zijn sessies.
 * Zie BESLUITDOCUMENT_SESSIE_ARCHITECTUUR_2026-09.md §3.4.
 */
export async function getLatestNutritionLogAt(
  sessionId: string | string[],
): Promise<string | null> {
  const sessionIds = Array.isArray(sessionId) ? sessionId : [sessionId];
  if (sessionIds.length === 0) {
    return null;
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return null;
  }

  const { data, error } = await admin
    .from("intake_intake_log")
    .select("logged_at")
    .in("session_id", sessionIds)
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
  sessionId: string | string[],
): Promise<unknown | null> {
  const sessionIds = Array.isArray(sessionId) ? sessionId : [sessionId];
  if (sessionIds.length === 0) {
    return null;
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return null;
  }

  const { data, error } = await admin
    .from("intake_intake_log")
    .select("raw_inputs")
    .in("session_id", sessionIds)
    .order("logged_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("[nutrition-log-server] getLatestNutritionLogRawInputs:", error);
    return null;
  }

  return data?.[0]?.raw_inputs ?? null;
}
