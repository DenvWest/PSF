import type { IntakeAgeRange } from "@/data/intake-questions";
import type { DomainScores } from "@/lib/intake-engine";
import { ANON_PROFILE_LABEL } from "@/lib/recovery-token";

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

export function intakeSessionRowToPayload(
  row: IntakeSessionRow,
): IntakeSessionPayload | null {
  const profileLabel =
    typeof row.profile_label === "string" ? row.profile_label.trim() : "";

  if (
    !row.id ||
    !row.symptom_profile ||
    row.symptom_profile.length === 0 ||
    !row.answers ||
    !row.domain_scores ||
    typeof row.urgency_level !== "string" ||
    profileLabel.length === 0 ||
    profileLabel === ANON_PROFILE_LABEL ||
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
    profile: profileLabel,
    timestamp: new Date(row.created_at).getTime(),
    ageRange,
  };
}
