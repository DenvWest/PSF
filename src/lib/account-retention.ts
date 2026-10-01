import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { startCronRun, completeCronRun } from "@/lib/cron-runs";

const INACTIVITY_MONTHS = 24;

export const ACCOUNT_RETENTION_CRON_NAME = "account-retention";

export type AccountRetentionRunResult = {
  anonymizedAccounts: number;
};

function monthsAgoIso(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString();
}

function anonymizedEmail(accountId: string): string {
  return `anon-${accountId}@deleted.invalid`;
}

/**
 * AVG-inactiviteitsbeleid (audit N6d, docs/plan/AUDIT_ARCHITECTUUR_SCHAAL_B2B_2026-09.md
 * C3; verwerkingsregister belooft op meerdere plekken "volgt account-retentie,
 * 24 maanden"). Anonimiseert alleen het e-mailadres — de rij en alle
 * gekoppelde gezondheidsdata (dagboek, logs, voorkeuren) blijven bestaan
 * onder het pseudonieme account_id, zoals de al-pseudonieme
 * intake-sessiedata. Geen cascade-delete: dat zou meer wissen dan het
 * register belooft en is niet terug te draaien als de gebruiker terugkomt.
 */
export async function runAccountRetention(): Promise<AccountRetentionRunResult> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    throw new Error("SUPABASE_CONFIG");
  }

  const cutoff = monthsAgoIso(INACTIVITY_MONTHS);

  const { data: inactiveAccounts, error: selectError } = await admin
    .from("accounts")
    .select("id")
    .lt("last_seen_at", cutoff)
    .not("email", "like", "anon-%@deleted.invalid");

  if (selectError) {
    console.error("[account-retention] select inactive:", selectError);
    throw selectError;
  }

  const rows = inactiveAccounts ?? [];
  let anonymized = 0;

  for (const row of rows) {
    const { error: updateError } = await admin
      .from("accounts")
      .update({ email: anonymizedEmail(row.id as string) })
      .eq("id", row.id);

    if (updateError) {
      console.error("[account-retention] anonymize failed:", {
        accountId: row.id,
        message: updateError.message,
      });
      continue;
    }
    anonymized += 1;
  }

  return { anonymizedAccounts: anonymized };
}

/** Account-inactiviteitscron met dead-man's switch in `cron_runs`. */
export async function runAccountRetentionCronJob(): Promise<AccountRetentionRunResult> {
  const runId = await startCronRun(ACCOUNT_RETENTION_CRON_NAME);

  try {
    const result = await runAccountRetention();
    await completeCronRun(runId, { status: "success", result });
    return result;
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Onbekende account-retention-fout";
    await completeCronRun(runId, { status: "error", errorMessage });
    throw err;
  }
}
