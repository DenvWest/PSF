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

const MOVEMENT_SUPPLEMENT_SLUGS = new Set(["creatine", "eiwitpoeder"]);
const STRESS_SUPPLEMENT_SLUGS = new Set(["magnesium"]);
const SLEEP_SUPPLEMENT_SLUGS = new Set(["magnesium", "melatonine"]);

export function getMovementNutritionHint(session: IntakeSessionPayload): string {
  const signals = getDeficiencySignals(session.answers);
  if (signals.protein_gap_signal) {
    return "Je eiwit uit voeding lijkt laag terwijl je traint — kracht zonder eiwit is half werk.";
  }
  if (session.scores.nutrition_score < 50) {
    return "Je voedingsscore laat ruimte — check of je bord je training ondersteunt.";
  }
  return "Check of je voeding je training ondersteunt — eerst tafel, dan potje.";
}

export function buildMovementRecommendations(
  session: IntakeSessionPayload,
): RecommendedSupplement[] {
  return buildRecommendations(session).filter((rec) => {
    if (rec.slug === "magnesium") {
      return session.scores.recovery_score < 50;
    }
    return MOVEMENT_SUPPLEMENT_SLUGS.has(rec.slug);
  });
}

export function getStressNutritionHint(session: IntakeSessionPayload): string {
  const signals = getDeficiencySignals(session.answers);
  if (signals.cortisol_risk) {
    return "Kies op drukke dagen voor regelmaat met eiwit en vezels; stabiel eten helpt je stress-as rustiger schakelen.";
  }
  if (session.scores.nutrition_score < 50) {
    return "Je voedingsscore laat ruimte: begin met vaste maaltijden, voldoende eiwit en vezels.";
  }
  return "Je basis staat redelijk; houd regelmaat en volwaardige voeding vast voor beter stressherstel.";
}

export function buildStressRecommendations(
  session: IntakeSessionPayload,
): RecommendedSupplement[] {
  return buildRecommendations(session).filter((rec) =>
    STRESS_SUPPLEMENT_SLUGS.has(rec.slug),
  );
}

export function getSleepNutritionHint(session: IntakeSessionPayload): string {
  if (session.scores.nutrition_score < 50) {
    return "Je voedingsscore laat ruimte: bouw je avond rustiger op met regelmaat, eiwit en vezelrijke maaltijden.";
  }
  if (session.scores.stress_score < 50) {
    return "Je basisvoeding staat redelijk. Houd avondprikkels laag en kies voor voorspelbare maaltijden op drukke dagen.";
  }
  return "Je basis staat redelijk; houd je avond simpel en voorspelbaar zodat je slaapdruk beter kan opbouwen.";
}

export function buildSleepRecommendations(
  session: IntakeSessionPayload,
): RecommendedSupplement[] {
  return buildRecommendations(session).filter((rec) =>
    SLEEP_SUPPLEMENT_SLUGS.has(rec.slug),
  );
}
