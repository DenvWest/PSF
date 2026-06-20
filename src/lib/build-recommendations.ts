import { catalogBySlug } from "@/data/supplement-hub/catalog";
import { getCatalogEntryByHubSlug } from "@/data/supplement-catalog";
import { RULES_VERSION, getDeficiencySignals, getProfileLabel } from "@/lib/intake-engine";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";
import { getRecommendations } from "@/lib/recommendation-engine";

export type RecommendedSupplement = {
  slug: string;
  name: string;
  wiifm: string;
  reason: string;
  guideHref: string;
  comparisonHref: string | null;
  icon: string;
};

const HUB_REASON_BY_SLUG: Record<string, string> = {
  magnesium:
    "Magnesium draagt bij tot normale psychologische functie en tot vermindering van vermoeidheid — passend bij je scores, naast leefstijl.",
  "omega-3":
    "Je eet zelden vette vis — een omega-3 supplement kan dat aanvullen.",
  eiwitpoeder:
    "Je eiwitinname uit voeding lijkt laag terwijl je traint of traag herstelt — poeder kan helpen je dagdoel te halen naast volwaardige maaltijden.",
  creatine:
    "Creatine ondersteunt korte, intense spieroutput bij voldoende dagdosis (EU‑claimcontext) — geen algemene energiebelofte.",
  "vitamine-d":
    "In Nederland krijgen de meeste mannen te weinig vitamine D — een goede basislijn.",
};

function hubReasonForSlug(
  slug: string,
  session: IntakeSessionPayload,
): string {
  if (slug === "magnesium") {
    const { scores } = session;
    if (scores.sleep_score < 50 && scores.stress_score < 50) {
      return HUB_REASON_BY_SLUG.magnesium;
    }
    if (scores.sleep_score < 50) {
      return "Magnesium draagt bij tot een normale psychologische functie; check je routine naast andere slaaphygiëne.";
    }
    if (scores.stress_score < 50) {
      return "Magnesium draagt bij tot de normale werking van het zenuwstelsel en een normale psychologische functie.";
    }
    return "Magnesium draagt bij tot normale spierfunctie — relevant naast je herstelscore.";
  }

  if (slug === "omega-3") {
    const omega3Answer = session.answers.NUT_O3 ?? 0;
    return omega3Answer <= 1
      ? HUB_REASON_BY_SLUG["omega-3"]
      : "Je voedingspatroon heeft ruimte voor verbetering — omega-3 is een goede basis.";
  }

  return HUB_REASON_BY_SLUG[slug] ?? "";
}

export function buildRecommendations(
  session: IntakeSessionPayload,
): RecommendedSupplement[] {
  const input = {
    scores: session.scores,
    signals: getDeficiencySignals(session.answers),
    profileLabel: getProfileLabel(session.scores),
    answers: session.answers,
    rulesVersion: RULES_VERSION,
  };

  const recommendations = getRecommendations(input, { source: "hub" });
  const out: RecommendedSupplement[] = [];

  for (const recommendation of recommendations) {
    const slug = recommendation.hubSlug;
    if (!slug) {
      continue;
    }

    const catalog = catalogBySlug[slug];
    if (!catalog) {
      continue;
    }

    const catalogEntry = getCatalogEntryByHubSlug(slug);
    const comparisonHref =
      catalog.comparisonHref ??
      (catalogEntry?.comparisonPath?.startsWith("/beste/")
        ? catalogEntry.comparisonPath
        : null);

    out.push({
      slug,
      name: catalog.name,
      wiifm: catalog.wiifm,
      reason: hubReasonForSlug(slug, session),
      guideHref: catalog.guideHref,
      comparisonHref,
      icon: catalog.icon,
    });
  }

  return out;
}
