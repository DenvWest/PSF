import type { IntakeAgeRange, IntakeGender, SymptomId } from "@/data/intake-questions";
import type { DomainScores } from "@/lib/intake-engine";
import type { StoredIntakeAnswers } from "@/types/intake-answers";

/** Een sessie van de brede check (`/intake/leefstijl`): alle meetkolommen verplicht. */
export type BroadCheckSessionInsert = {
  organization_id: string;
  symptom_profile: SymptomId[];
  answers: StoredIntakeAnswers;
  domain_scores: DomainScores;
  urgency_level: string;
  profile_label: string;
  age_range: IntakeAgeRange;
  gender: IntakeGender;
  marketing_email: string | null;
  first_name: string | null;
  rules_version: string;
  session_kind?: "initial" | "remeasure";
  baseline_session_id?: string | null;
  recommendations?: {
    supplements: string[];
    quick_wins: string[];
    urgency: string;
    profile_label: string;
    rules_version: string;
  } | null;
  referral_source?: string | null;
};

/**
 * Een sessie van de check op `/intake`: alleen het pseudonieme anker. De
 * kolommen van de brede check blijven leeg; de check zelf staat in
 * `intake_intake_log`. Zie BESLUITDOCUMENT_SESSIE_ARCHITECTUUR_2026-09.md §3.
 */
export type NutritionCheckSessionInsert = {
  organization_id: string;
  session_kind: "nutrition";
  account_id: string | null;
  referral_source: string | null;
};

export type IntakeSessionInsert = BroadCheckSessionInsert | NutritionCheckSessionInsert;

/** De soorten die een meting van de brede check dragen. */
export const BROAD_CHECK_SESSION_KINDS = ["initial", "remeasure"] as const;
