import { createSupabaseAdmin } from "@/lib/supabase-admin";

type SupabaseAdmin = NonNullable<ReturnType<typeof createSupabaseAdmin>>;

const APP_TIMEZONE = "Europe/Amsterdam";

export function todayInAppTimezone(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export type DailyActionState = {
  date: string;
  keys: string[];
  streak: number;
};

export async function toggleDailyAction(
  admin: SupabaseAdmin,
  accountId: string,
  domain: string,
  actionKey: string,
  done: boolean,
): Promise<void> {
  const logDate = todayInAppTimezone();
  if (done) {
    await admin.from("daily_action_log").upsert(
      { account_id: accountId, domain, action_key: actionKey, log_date: logDate },
      { onConflict: "account_id,domain,action_key,log_date", ignoreDuplicates: true },
    );
  } else {
    await admin
      .from("daily_action_log")
      .delete()
      .eq("account_id", accountId)
      .eq("domain", domain)
      .eq("action_key", actionKey)
      .eq("log_date", logDate);
  }
}

export async function getDailyActionState(
  admin: SupabaseAdmin,
  accountId: string,
  domain: string,
): Promise<DailyActionState> {
  const today = todayInAppTimezone();

  const { data: todayRows } = await admin
    .from("daily_action_log")
    .select("action_key")
    .eq("account_id", accountId)
    .eq("domain", domain)
    .eq("log_date", today);

  const keys = (todayRows ?? []).map((row) => row.action_key as string);

  const { data: dateRows } = await admin
    .from("daily_action_log")
    .select("log_date")
    .eq("account_id", accountId)
    .eq("domain", domain)
    .order("log_date", { ascending: false })
    .limit(400);

  const distinctDates = Array.from(
    new Set((dateRows ?? []).map((row) => row.log_date as string)),
  );

  return { date: today, keys, streak: computeStreak(distinctDates, today) };
}

function computeStreak(distinctDatesDesc: string[], today: string): number {
  if (distinctDatesDesc.length === 0) {
    return 0;
  }
  const set = new Set(distinctDatesDesc);
  const dayMs = 24 * 60 * 60 * 1000;
  let cursor = new Date(`${today}T12:00:00.000Z`).getTime();
  if (!set.has(today)) {
    cursor -= dayMs;
  }
  let streak = 0;
  while (set.has(new Date(cursor).toISOString().slice(0, 10))) {
    streak += 1;
    cursor -= dayMs;
  }
  return streak;
}
