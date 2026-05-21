import { createSupabaseAdmin } from "@/lib/supabase-admin";

const SESSION_RETENTION_MONTHS = 24;
const NURTURE_RETENTION_MONTHS = 12;
const ORPHAN_PENDING_MONTHS = 3;

function monthsAgoIso(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString();
}

export async function runIntakeRetention(): Promise<{
  deletedSessions: number;
  deletedNurture: number;
  deletedOrphanPending: number;
}> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    throw new Error("SUPABASE_CONFIG");
  }

  const sessionCutoff = monthsAgoIso(SESSION_RETENTION_MONTHS);
  const nurtureCutoff = monthsAgoIso(NURTURE_RETENTION_MONTHS);
  const orphanCutoff = monthsAgoIso(ORPHAN_PENDING_MONTHS);

  const { data: oldSessions, error: sessionsError } = await admin
    .from("intake_sessions")
    .delete()
    .lt("created_at", sessionCutoff)
    .select("id");

  if (sessionsError) {
    console.error("[intake-retention] delete sessions:", sessionsError);
    throw sessionsError;
  }

  const { data: oldNurture, error: nurtureError } = await admin
    .from("nurture_emails")
    .delete()
    .lt("created_at", nurtureCutoff)
    .neq("status", "pending")
    .select("id");

  if (nurtureError) {
    console.error("[intake-retention] delete nurture:", nurtureError);
    throw nurtureError;
  }

  const { data: orphanPending, error: orphanError } = await admin
    .from("nurture_emails")
    .delete()
    .eq("status", "pending")
    .lt("scheduled_at", orphanCutoff)
    .select("id");

  if (orphanError) {
    console.error("[intake-retention] delete orphan pending:", orphanError);
    throw orphanError;
  }

  return {
    deletedSessions: oldSessions?.length ?? 0,
    deletedNurture: oldNurture?.length ?? 0,
    deletedOrphanPending: orphanPending?.length ?? 0,
  };
}
