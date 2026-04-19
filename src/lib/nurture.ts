import { createSupabaseAdmin } from "@/lib/supabase-admin";

const SEQUENCE_DAYS = [0, 3, 7, 14, 21, 30] as const;

interface NurtureScheduleInput {
  sessionId: string;
  email: string;
  profileLabel: string;
  primaryDomain: string;
  domainScores: Record<string, number>;
}

export async function scheduleNurtureSequence(input: NurtureScheduleInput) {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    console.error("scheduleNurtureSequence: Supabase admin not configured");
    throw new Error("SUPABASE_CONFIG");
  }

  const now = new Date();

  const rows = SEQUENCE_DAYS.map((day) => ({
    session_id: input.sessionId,
    email: input.email,
    sequence_day: day,
    scheduled_at: new Date(
      now.getTime() + day * 24 * 60 * 60 * 1000,
    ).toISOString(),
    profile_label: input.profileLabel,
    primary_domain: input.primaryDomain,
    domain_scores: input.domainScores,
    status: "pending" as const,
  }));

  const { error } = await supabase.from("nurture_emails").insert(rows);

  if (error) {
    console.error("Failed to schedule nurture sequence:", error);
    throw error;
  }

  return rows.length;
}
