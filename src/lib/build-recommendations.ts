import { SUPPLEMENT_ROUTE_DEFINITIONS } from "@/data/supplement-routes";
import { catalogBySlug } from "@/data/supplementen-hub/catalog";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";
import { isSupplementAvailable } from "@/lib/supplement-availability";

export type RecommendedSupplement = {
  slug: string;
  name: string;
  wiifm: string;
  reason: string;
  guideHref: string;
  comparisonHref: string | null;
  icon: string;
};

/** Maps hub catalog slugs to `supplement-routes` definition ids. */
const HUB_SLUG_TO_ROUTE_ID: Record<string, string> = {
  magnesium: "magnesium-glycinaat",
  "omega-3": "omega-3",
  ashwagandha: "ashwagandha",
  zink: "zink",
  creatine: "creatine",
  "vitamine-d": "vitamine-d3",
};

function comparisonHrefFromSupplementRoutes(slug: string): string | null {
  const routeId = HUB_SLUG_TO_ROUTE_ID[slug];
  const def = routeId
    ? SUPPLEMENT_ROUTE_DEFINITIONS.find((d) => d.id === routeId)
    : undefined;
  if (!def) return null;
  if (def.affiliateUrl.startsWith("/beste/")) return def.affiliateUrl;
  return null;
}

type LegacyPick = { slug: string; name: string; icon: string; reason: string };

/**
 * Bepaalt welke supplementen op de hub worden aanbevolen (legacy regels,
 * gelijk aan de eerdere `getPersonalizedRecommendations`).
 * `comparisonHref` wordt waar mogelijk aangevuld via `supplement-routes`
 * (`affiliateUrl` voor /beste/* pagina's).
 */
function selectLegacyHubRecommendations(
  session: IntakeSessionPayload,
): LegacyPick[] {
  const { scores, answers } = session;
  const recommendations: LegacyPick[] = [];

  if (scores.sleep_score < 50 || scores.stress_score < 50) {
    recommendations.push({
      slug: "magnesium",
      name: "Magnesium",
      icon: "⚡",
      reason:
        scores.sleep_score < 50 && scores.stress_score < 50
          ? "Magnesium draagt bij tot normale psychologische functie en tot vermindering van vermoeidheid — passend bij je scores, neven leefstijl."
          : scores.sleep_score < 50
            ? "Magnesium draagt bij tot een normale psychologische functie; check je routine naast andere slaaphygiëne."
            : "Magnesium draagt bij tot de normale werking van het zenuwstelsel en een normale psychologische functie.",
    });
  }

  if (scores.stress_score < 50 && isSupplementAvailable("ashwagandha")) {
    recommendations.push({
      slug: "ashwagandha",
      name: "Ashwagandha",
      icon: "🌿",
      reason:
        "EU-claims voor ashwagandha zijn nog niet definitief; op jouw stressscore is vergelijken van extractkwaliteit desgewenst interessant.",
    });
  }

  const omega3Answer = answers["NUT_O3"] ?? 0;
  if (omega3Answer <= 1 || scores.nutrition_score < 40) {
    recommendations.push({
      slug: "omega-3",
      name: "Omega-3",
      icon: "🐟",
      reason:
        omega3Answer <= 1
          ? "Je eet zelden vette vis — een omega-3 supplement kan dat aanvullen."
          : "Je voedingspatroon heeft ruimte voor verbetering — omega-3 is een goede basis.",
    });
  }

  if (scores.energy_score < 40) {
    recommendations.push({
      slug: "creatine",
      name: "Creatine",
      icon: "💪",
      reason:
        "Creatine ondersteunt korte, intense spieroutput bij voldoende dagdosis (EU‑claimcontext) — geen algemene energiebelofte.",
    });
  }

  if (
    scores.recovery_score < 40 &&
    !recommendations.find((r) => r.slug === "magnesium")
  ) {
    recommendations.push({
      slug: "magnesium",
      name: "Magnesium",
      icon: "⚡",
      reason:
        "Magnesium draagt bij tot normale spierfunctie — relevant naast je herstelscore.",
    });
  }

  if (recommendations.length < 2) {
    recommendations.push({
      slug: "vitamine-d",
      name: "Vitamine D3 + K2",
      icon: "☀️",
      reason:
        "In Nederland krijgen de meeste mannen te weinig vitamine D — een goede basislijn.",
    });
  }

  return recommendations.slice(0, 3);
}

export function buildRecommendations(
  session: IntakeSessionPayload,
): RecommendedSupplement[] {
  const picks = selectLegacyHubRecommendations(session);
  const out: RecommendedSupplement[] = [];

  for (const pick of picks) {
    const catalog = catalogBySlug[pick.slug];
    if (!catalog) continue;

    const comparisonHref =
      catalog.comparisonHref ?? comparisonHrefFromSupplementRoutes(pick.slug);

    out.push({
      slug: pick.slug,
      name: pick.name,
      wiifm: catalog.wiifm,
      reason: pick.reason,
      guideHref: catalog.guideHref,
      comparisonHref,
      icon: catalog.icon,
    });
  }

  return out;
}
