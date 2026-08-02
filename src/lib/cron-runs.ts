import { createSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * Dead-man's-switch audit trail (`cron_runs`, migratie db/migrations/006_cron_runs.sql).
 * Best-effort: een healthcheck-schrijffout mag de cron zelf nooit breken.
 */

export async function startCronRun(cronName: string): Promise<string | null> {
  try {
    const admin = createSupabaseAdmin();
    if (!admin) {
      return null;
    }

    const { data, error } = await admin
      .from("cron_runs")
      .insert({ cron_name: cronName, status: "running" })
      .select("id")
      .single();

    if (error) {
      console.error("[cron-runs] insert start failed:", error);
      return null;
    }

    return typeof data?.id === "string" ? data.id : null;
  } catch (err) {
    console.error("[cron-runs] insert start unexpected:", err);
    return null;
  }
}

type CompleteCronRunPayload =
  | { status: "success"; result: Record<string, unknown> }
  | {
      status: "error";
      errorMessage: string;
      result?: Record<string, unknown>;
    };

export async function completeCronRun(
  runId: string | null,
  payload: CompleteCronRunPayload,
): Promise<void> {
  if (!runId) {
    return;
  }

  try {
    const admin = createSupabaseAdmin();
    if (!admin) {
      return;
    }

    const now = new Date().toISOString();
    const update =
      payload.status === "success"
        ? {
            status: "success" as const,
            completed_at: now,
            result: payload.result,
            error_message: null,
          }
        : {
            status: "error" as const,
            completed_at: now,
            result: payload.result ?? null,
            error_message: payload.errorMessage,
          };

    const { error } = await admin
      .from("cron_runs")
      .update(update)
      .eq("id", runId);

    if (error) {
      console.error("[cron-runs] complete failed:", error);
    }
  } catch (err) {
    console.error("[cron-runs] complete unexpected:", err);
  }
}
