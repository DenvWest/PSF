import { buildRecommendations } from "@/lib/build-recommendations";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";
import type { SupplementCategory } from "@/types/supplement";

export type HubPersonalMatch = {
  category: SupplementCategory;
  name: string;
  reason: string;
};

export type HubPersonalization =
  | { state: "no_intake" }
  | { state: "needs_nutrition" }
  | { state: "geen_prioriteit" }
  | { state: "ready"; matches: HubPersonalMatch[] };

type BuildHubPersonalizationArgs = {
  session: IntakeSessionPayload | null;
  hasIntakeCookie: boolean;
  nutritionLogCompleted: boolean;
};

/**
 * Vertaalt de aanbevelingen uit de check naar categorieen in de
 * productcatalogus. De `hubSlug` van een aanbeveling en `SupplementCategory`
 * delen hun waarden, dus een match markeert elk product in die categorie.
 *
 * De voedingspoort blijft staan: zonder voedingscheck geen persoonlijke
 * markering, alleen de neutrale catalogus.
 */
export function buildHubPersonalization({
  session,
  hasIntakeCookie,
  nutritionLogCompleted,
}: BuildHubPersonalizationArgs): HubPersonalization {
  if (!hasIntakeCookie || !session) {
    return { state: "no_intake" };
  }

  if (!nutritionLogCompleted) {
    return { state: "needs_nutrition" };
  }

  const matches: HubPersonalMatch[] = buildRecommendations(session, {
    nutritionLogCompleted: true,
  }).map((recommendation) => ({
    category: recommendation.slug as SupplementCategory,
    name: recommendation.name,
    reason: recommendation.reason || recommendation.wiifm,
  }));

  if (matches.length === 0) {
    return { state: "geen_prioriteit" };
  }

  return { state: "ready", matches };
}
