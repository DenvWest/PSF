import type { DomainScores } from "@/lib/intake-engine";
import { supabase } from "@/lib/supabase";

export type IntakeSessionPayload = {
  sessionId: string;
  symptoms: string[];
  answers: Record<string, number>;
  scores: DomainScores;
  urgency: string;
  profile: string;
  timestamp: number;
};

type IntakeSessionRow = {
  id: string;
  symptom_profile: string[] | null;
  answers: Record<string, number> | null;
  domain_scores: DomainScores | null;
  urgency_level: string | null;
  profile_label: string | null;
  created_at: string | null;
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

  return {
    sessionId: row.id,
    symptoms: row.symptom_profile,
    answers: row.answers,
    scores: row.domain_scores,
    urgency: row.urgency_level,
    profile: row.profile_label,
    timestamp: new Date(row.created_at).getTime(),
  };
}

export async function saveIntakeSession(data: {
  symptoms: string[];
  answers: Record<string, number>;
  scores: DomainScores;
  urgency: string;
  profile: string;
}): Promise<string | null> {
  const { data: row, error } = await supabase
    .from("intake_sessions")
    .insert({
      symptom_profile: data.symptoms,
      answers: data.answers,
      domain_scores: data.scores,
      urgency_level: data.urgency,
      profile_label: data.profile,
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
  sessionId: string,
  rating: "positive" | "negative",
  comment: string | null,
) {
  const trimmed = comment?.trim();
  const { error } = await supabase.from("intake_feedback").insert({
    session_id: sessionId,
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
