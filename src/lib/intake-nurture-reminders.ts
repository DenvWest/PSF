import type { QuestionId, SymptomId } from "@/data/intake-questions";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DomainScores } from "@/lib/intake-engine";

export const NURTURE_REMINDER_TYPES = [
  "welcome",
  "day3",
  "day7",
  "day14",
  "day21",
  "day30",
] as const;

export type NurtureReminderType = (typeof NURTURE_REMINDER_TYPES)[number];

function addDaysUtc(d: Date, days: number): Date {
  const x = new Date(d.getTime());
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

export function normalizeReminderType(raw: string): NurtureReminderType {
  if (raw === "30d") {
    return "day30";
  }
  if (NURTURE_REMINDER_TYPES.includes(raw as NurtureReminderType)) {
    return raw as NurtureReminderType;
  }
  return "day30";
}

type AdminClient = SupabaseClient;

/**
 * Plant 6 nurture-mails vanaf het moment van intake (marketing e-mail).
 */
export async function insertNurtureRemindersForSession(params: {
  admin: AdminClient;
  organizationId: string;
  sessionId: string;
  email: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = params.email.trim().toLowerCase();
  if (!trimmed) {
    return { ok: false, error: "empty_email" };
  }

  const base = new Date();

  const rows = [
    {
      organization_id: params.organizationId,
      email: trimmed,
      session_id: params.sessionId,
      reminder_type: "welcome" as const,
      reminder_date: base.toISOString(),
      sent: false,
    },
    {
      organization_id: params.organizationId,
      email: trimmed,
      session_id: params.sessionId,
      reminder_type: "day3" as const,
      reminder_date: addDaysUtc(base, 3).toISOString(),
      sent: false,
    },
    {
      organization_id: params.organizationId,
      email: trimmed,
      session_id: params.sessionId,
      reminder_type: "day7" as const,
      reminder_date: addDaysUtc(base, 7).toISOString(),
      sent: false,
    },
    {
      organization_id: params.organizationId,
      email: trimmed,
      session_id: params.sessionId,
      reminder_type: "day14" as const,
      reminder_date: addDaysUtc(base, 14).toISOString(),
      sent: false,
    },
    {
      organization_id: params.organizationId,
      email: trimmed,
      session_id: params.sessionId,
      reminder_type: "day21" as const,
      reminder_date: addDaysUtc(base, 21).toISOString(),
      sent: false,
    },
    {
      organization_id: params.organizationId,
      email: trimmed,
      session_id: params.sessionId,
      reminder_type: "day30" as const,
      reminder_date: addDaysUtc(base, 30).toISOString(),
      sent: false,
    },
  ];

  const { error } = await params.admin.from("intake_reminders").insert(rows);

  if (error) {
    console.error("[intake-nurture-reminders] insert error:", error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export type IntakeSessionNurtureFields = {
  profile_label: string | null;
  domain_scores: DomainScores | null;
  urgency_level: string | null;
  answers: Record<QuestionId, number> | null;
  symptom_profile: SymptomId[] | null;
};
