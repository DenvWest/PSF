import type { IntakeAgeRange, SymptomId } from "@/data/intake-questions";
import type { DomainScores } from "@/lib/intake-engine";
import type { IntakeAnswers } from "@/types/intake-answers";

export type IntakeSessionInsert = {
  organization_id: string;
  symptom_profile: SymptomId[];
  answers: IntakeAnswers;
  domain_scores: DomainScores;
  urgency_level: string;
  profile_label: string;
  age_range: IntakeAgeRange;
  marketing_email: string | null;
  first_name: string | null;
  rules_version: string;
};
