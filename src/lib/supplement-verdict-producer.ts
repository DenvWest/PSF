import { buildRecommendationInput } from "@/lib/recommendation-input";
import { mapCheckScoresToDomainScores } from "@/lib/reveal-model";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { buildRecommendationsEligibility } from "@/lib/supplement-eligibility";
import { deriveSupplementVerdicts } from "@/lib/supplement-verdict";
import { recordSupplementVerdicts } from "@/lib/supplement-verdict-store";
import type { DashboardData } from "@/types/dashboard";
import type { StoredSupplementVerdict } from "@/types/verdict";

/**
 * Herleidt de oordelen uit de laatste check en legt alleen de omslagen vast.
 *
 * Idempotent: een ongewijzigd oordeel schrijft niets, dus dit mag op elke
 * dashboard-render draaien. Retourneert de geldige oordelen zodat de aanroeper
 * niet nog een keer hoeft te lezen.
 */
export async function syncSupplementVerdicts(
  accountId: string,
  data: DashboardData,
): Promise<StoredSupplementVerdict[]> {
  const admin = createSupabaseAdmin();
  if (!admin || data.empty || !data.current) {
    return [];
  }

  const input = buildRecommendationInput({
    scores: mapCheckScoresToDomainScores(data.current.scores),
    answers: data.answers ?? undefined,
  });
  const eligibility = buildRecommendationsEligibility(data.nutritionIntake);
  const verdicts = deriveSupplementVerdicts(input, eligibility);

  const { current } = await recordSupplementVerdicts(admin, accountId, verdicts, {
    sessionId: data.sessionId,
  });

  return current;
}
