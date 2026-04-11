import type { IntakeAgeRange } from "@/data/intake-questions";
import type { DomainScores } from "@/lib/intake-engine";
import { supabase } from "@/lib/supabase";

/** Geldige Postgres uuid (lowercase hex + v4-variant); anders geen session_id naar Supabase. */
function toUuidOrNull(value: string | null | undefined): string | null {
  if (value == null || value === "") {
    return null;
  }
  const ok = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
  return ok ? value : null;
}

export type IntakeSessionPayload = {
  sessionId: string;
  symptoms: string[];
  answers: Record<string, number>;
  scores: DomainScores;
  urgency: string;
  profile: string;
  timestamp: number;
  ageRange: IntakeAgeRange | null;
};

type IntakeSessionRow = {
  id: string;
  symptom_profile: string[] | null;
  answers: Record<string, number> | null;
  domain_scores: DomainScores | null;
  urgency_level: string | null;
  profile_label: string | null;
  created_at: string | null;
  age_range: string | null;
};

function rowToPayload(row: IntakeSessionRow): IntakeSessionPayload | null {
  if (
    !row.id ||
    !row.symptom_profile ||
    !row.answers ||
    !row.domain_scores ||
    typeof row.urgency_level !== "string" ||
    typeof row.profile_label !== "string" ||
    !row.created_at
  ) {
    return null;
  }

  const ar = row.age_range;
  const ageRange: IntakeAgeRange | null =
    ar === "40–44" || ar === "45–49" || ar === "50–54" || ar === "55+"
      ? ar
      : null;

  return {
    sessionId: row.id,
    symptoms: row.symptom_profile,
    answers: row.answers,
    scores: row.domain_scores,
    urgency: row.urgency_level,
    profile: row.profile_label,
    timestamp: new Date(row.created_at).getTime(),
    ageRange,
  };
}

export async function saveIntakeSession(data: {
  symptoms: string[];
  answers: Record<string, number>;
  scores: DomainScores;
  urgency: string;
  profile: string;
  ageRange: IntakeAgeRange;
}): Promise<string | null> {
  const { data: row, error } = await supabase
    .from("intake_sessions")
    .insert({
      symptom_profile: data.symptoms,
      answers: data.answers,
      domain_scores: data.scores,
      urgency_level: data.urgency,
      profile_label: data.profile,
      age_range: data.ageRange,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Save session error:", error);
    return null;
  }
  return row?.id ?? null;
}

export async function saveIntakeFeedback(
  sessionId: string | null,
  rating: "positive" | "negative",
  comment: string | null,
) {
  const trimmed = comment?.trim();
  const session_id = toUuidOrNull(sessionId);

  const { error } = await supabase.from("intake_feedback").insert({
    session_id,
    rating,
    comment: trimmed && trimmed.length > 0 ? trimmed : null,
  });
  if (error) console.error("Save intake feedback error:", error);
}

export async function saveReminderEmail(email: string) {
  const reminderDate = new Date();
  reminderDate.setDate(reminderDate.getDate() + 30);

  const { error } = await supabase.from("intake_reminders").insert({
    email,
    reminder_date: reminderDate.toISOString(),
  });
  if (error) console.error("Save reminder error:", error);
}

export async function getLastSession(): Promise<IntakeSessionPayload | null> {
  const { data, error } = await supabase
    .from("intake_sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return rowToPayload(data as IntakeSessionRow);
}

export async function getAllSessions(): Promise<IntakeSessionPayload[]> {
  const { data, error } = await supabase
    .from("intake_sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as IntakeSessionRow[])
    .map(rowToPayload)
    .filter((p): p is IntakeSessionPayload => p !== null);
}
