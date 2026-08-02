import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { startCronRun, completeCronRun } from "@/lib/cron-runs";

const SESSION_RETENTION_MONTHS = 24;
const NURTURE_RETENTION_MONTHS = 12;
const ORPHAN_PENDING_MONTHS = 3;

export const RETENTION_CRON_NAME = "retention";

export type RetentionRunResult = {
  deletedSessions: number;
  deletedNurture: number;
  deletedOrphanPending: number;
};

function monthsAgoIso(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString();
}

export async function runIntakeRetention(): Promise<RetentionRunResult> {
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

/** Retention-cleanup met dead-man's switch in `cron_runs`. */
export async function runRetentionCronJob(): Promise<RetentionRunResult> {
  const runId = await startCronRun(RETENTION_CRON_NAME);

  try {
    const result = await runIntakeRetention();
    await completeCronRun(runId, { status: "success", result });
    return result;
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Onbekende retention-fout";
    await completeCronRun(runId, { status: "error", errorMessage });
    throw err;
  }
}
