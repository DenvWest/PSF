import { buildRecommendationInput } from "@/lib/recommendation-input";
import { mapCheckScoresToDomainScores } from "@/lib/reveal-model";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { buildRecommendationsEligibility } from "@/lib/supplement-eligibility";
import { deriveSupplementVerdicts } from "@/lib/supplement-verdict";
import {
  getCurrentSupplementVerdicts,
  recordSupplementVerdicts,
  selectChangedVerdicts,
} from "@/lib/supplement-verdict-store";
import type { DashboardData } from "@/types/dashboard";
import type { StoredSupplementVerdict } from "@/types/verdict";

/**
 * De geldige oordelen, los van de sync. De dashboard-render heeft ze altijd
 * nodig en ze hangen alleen aan `accountId` — dus mogen ze parallel aan
 * `loadAccountDashboardData` lopen in plaats van erachter.
 */
export async function loadSupplementVerdicts(
  accountId: string,
): Promise<StoredSupplementVerdict[]> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return [];
  }
  return getCurrentSupplementVerdicts(admin, accountId);
}

/**
 * Herleidt de oordelen uit de laatste check en legt alleen de omslagen vast.
 *
 * Idempotent: een ongewijzigd oordeel schrijft niets, dus dit mag op elke
 * dashboard-render draaien. Retourneert de geldige oordelen zodat de aanroeper
 * niet nog een keer hoeft te lezen.
 *
 * Geef `previous` mee als je de geldige oordelen al gelezen hebt (zie
 * `loadSupplementVerdicts`). Zonder omslag doet deze functie dan géén enkele
 * query — en dat is het normale geval, want oordelen wisselen alleen na een
 * check. Alleen de zeldzame omslag betaalt nog voor schrijven + herlezen.
 */
export async function syncSupplementVerdicts(
  accountId: string,
  data: DashboardData,
  previous?: StoredSupplementVerdict[],
): Promise<StoredSupplementVerdict[]> {
  const admin = createSupabaseAdmin();
  if (!admin || data.empty || !data.current) {
    return previous ?? [];
  }

  const input = buildRecommendationInput({
    scores: mapCheckScoresToDomainScores(data.current.scores),
    answers: data.answers ?? undefined,
  });
  const eligibility = buildRecommendationsEligibility(data.nutritionIntake);
  const verdicts = deriveSupplementVerdicts(input, eligibility);

  if (previous && selectChangedVerdicts(previous, verdicts).length === 0) {
    return previous;
  }

  const { current } = await recordSupplementVerdicts(admin, accountId, verdicts, {
    sessionId: data.sessionId,
    previous,
  });

  return current;
}
