import { FOOD_SOURCES } from "@/data/nutrition/food-sources";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import { nutrientRoute } from "@/data/nutrition/nutrient-routes";
import { PILLAR } from "@/data/dashboard";
import { getDeficiencySignals } from "@/lib/intake-engine";
import { KOMPAS_RAIL_PILLAR_IDS } from "@/lib/context-rail";
import { withIntakeReturn } from "@/lib/intake-return-link";
import { KOMPAS_PILLAR_DESCRIPTORS } from "@/lib/kompas-home";
import { buildDomainBasis, type RevealDomainBasis } from "@/lib/reveal-domain-basis";
import { THEME_SUPPLEMENT_PILLAR } from "@/lib/reveal-first-step";
import { buildSupplementDisclosure } from "@/lib/reveal-supplement";
import {
  REVEAL_ROADMAP_COPY,
  REVEAL_ROADMAP_DASHBOARD_LANES,
  type RevealDashboardLane,
} from "@/lib/results-reveal-copy";
import type { RevealModel } from "@/lib/reveal-model";
import type { DashboardIconName, Pillar, PillarId } from "@/types/dashboard";
import type { RecommendationInput } from "@/types/recommendation";

export type RevealRingRow = {
  id: PillarId;
  label: string;
  descriptor: string;
  color: string;
  score: number;
  isFocus: boolean;
};

export type RevealRoadmapSupplement = {
  name: string;
  form: string;
  /** Goedgekeurde EU-claim op stofniveau; `buildSupplementDisclosure` gate't hierop. */
  claim: string;
  rationale: string;
  trustLine: string;
  href: string;
  /** Categorie in de supplementengids, voor de link naar /supplementen. */
  hubSlug: string | null;
  /** Gezet als dit supplement bij een ander domein hoort en daar al staat. */
  shownAt: string | null;
  /**
   * De voedingsroute achter dit potje: de drempel, wie hem publiceerde en de
   * sterkste bronnen. `null` wanneer de voedingscheck deze stof niet meet.
   *
   * Dit blok gaat vóór de vergelijkknop staan, niet erna. De leefstijlcheck
   * kent de voedingsroute van deze persoon niet — dat vraagt de voedingscheck —
   * dus het is kennis met een uitnodiging, geen oordeel over zijn inname.
   */
  voedingsroute: {
    thresholdNl: string;
    bronNl: string | null;
    bronnen: readonly string[];
  } | null;
};

export type RevealRoadmapDomain = {
  id: PillarId;
  label: string;
  color: string;
  icon: DashboardIconName;
  descriptor: string;
  score: number;
  rank: number;
  isFocus: boolean;
  basis: RevealDomainBasis;
  now: { title: string };
  supplement: RevealRoadmapSupplement | null;
  supplementNote: string | null;
  later: RevealDashboardLane[];
};

function descriptorFor(id: PillarId): string {
  return KOMPAS_PILLAR_DESCRIPTORS[id as keyof typeof KOMPAS_PILLAR_DESCRIPTORS] ?? "";
}

/**
 * De vijf ringen van de leefstijlring — dezelfde volgorde en dezelfde domeinen
 * als het dashboard (`buildKompasDomainRows`), zodat de straal per domein op
 * beide oppervlakken hetzelfde is. Zonder hermeting is er nog geen delta of
 * trend: dit is de nulmeting.
 */
export function buildRevealRingRows(model: RevealModel): RevealRingRow[] {
  return KOMPAS_RAIL_PILLAR_IDS.map((id) => ({
    id,
    label: PILLAR[id].label,
    descriptor: descriptorFor(id),
    color: PILLAR[id].color,
    score: Math.round(model.scores[id] ?? 0),
    isFocus: id === model.priority.id,
  }));
}

/**
 * De aanvulling per domein, altijd gekoppeld aan de leefstijlstap ervoor.
 * Domeinen zonder eigen supplement lenen het thema-supplement dat hun EFSA-claim
 * dekt (zie THEME_SUPPLEMENT_PILLAR); levert dat niets op, dan blijft het domein
 * bewust leeg met een uitlegregel. `buildSupplementDisclosure` gate't zelf op
 * goedgekeurde claims, dus hier komt nooit een niet-toegestane bewering binnen.
 */
/**
 * De voedingsroute bij een stof, in de vorm die de kaart toont.
 *
 * Alleen namen en een drempel — geen milligrammen. `food-sources.ts` en
 * `nutrient-rail.ts` verbieden een opgeteld getal, en een puntwaarde per portie
 * zou hier schijnprecisie zijn: we weten van deze persoon nog niet eens hoe
 * vaak hij het eet. De drempel is wél bruikbaar, want daar kan hij zijn eigen
 * week naast leggen.
 */
function buildVoedingsroute(
  nutrient: NutrientId | null,
): RevealRoadmapSupplement["voedingsroute"] {
  if (!nutrient) return null;
  const route = nutrientRoute(nutrient);
  const bronnen = route.sources
    .map((source) => foodSourceLabel(nutrient, source.foodSourceKey))
    .filter((label): label is string => label !== null)
    .slice(0, 3);
  if (bronnen.length === 0) return null;
  return {
    thresholdNl: route.thresholdNl,
    // Alleen noemen wie hem publiceerde als dat echt iemand is: bij een
    // vuistregel en een proxy is `sourceNl` null, en dan hoort er geen
    // autoriteit te staan die er niet is.
    bronNl: route.sourceNl,
    bronnen,
  };
}

function foodSourceLabel(nutrient: NutrientId, key: string): string | null {
  return FOOD_SOURCES[nutrient].find((row) => row.key === key)?.labelNl ?? null;
}

function resolveSupplement(
  pillar: Pillar,
  input: RecommendationInput,
): RevealRoadmapSupplement | null {
  const themePillarId = THEME_SUPPLEMENT_PILLAR[pillar.id];
  const disclosure =
    buildSupplementDisclosure(pillar, input, "results") ??
    (themePillarId
      ? buildSupplementDisclosure(PILLAR[themePillarId], input, "results")
      : null);

  if (!disclosure || disclosure.onHold) {
    return null;
  }

  return {
    name: disclosure.name,
    form: disclosure.form,
    claim: disclosure.claim,
    rationale: disclosure.explanation.supplementRationale,
    trustLine: disclosure.explanation.trustLine,
    href: withIntakeReturn(disclosure.comparisonPath),
    hubSlug: disclosure.hubSlug ?? null,
    shownAt: null,
    voedingsroute: buildVoedingsroute(disclosure.nutrient ?? null),
  };
}

/**
 * Per domein één route: je leefstijlstap nu, de aanvulling die daarop volgt, en
 * wat je dashboard met het domein doet. Volgorde = urgentie (focusdomein eerst,
 * daarna laagste score). Dezelfde aanvulling verschijnt maar één keer: leent een
 * domein het supplement van een ander domein, dan verwijst het daarheen in
 * plaats van de keuze te herhalen.
 */
export function buildRevealRoadmap(
  model: RevealModel,
  input: RecommendationInput,
): RevealRoadmapDomain[] {
  const signals = getDeficiencySignals(input.answers);

  const ordered = KOMPAS_RAIL_PILLAR_IDS.map((id) => {
    const pillar = PILLAR[id];
    const score = Math.round(model.scores[id] ?? 0);

    return {
      id,
      label: pillar.label,
      color: pillar.color,
      icon: pillar.icon,
      descriptor: descriptorFor(id),
      score,
      rank: 0,
      isFocus: id === model.priority.id,
      basis: buildDomainBasis(id, pillar.label, score, signals),
      now: { title: pillar.quickWin.title },
      supplement: resolveSupplement(pillar, input),
      supplementNote: null as string | null,
      later: REVEAL_ROADMAP_DASHBOARD_LANES[id] ?? [],
    };
  })
    .sort((a, b) => {
      if (a.isFocus !== b.isFocus) {
        return a.isFocus ? -1 : 1;
      }
      return a.score - b.score;
    })
    .map((domain, index) => ({ ...domain, rank: index + 1 }));

  const seen = new Map<string, string>();
  return ordered.map((domain) => {
    if (!domain.supplement) {
      return { ...domain, supplementNote: REVEAL_ROADMAP_COPY.noSupplementNote };
    }

    const owner = seen.get(domain.supplement.name);
    if (owner) {
      return {
        ...domain,
        supplement: null,
        supplementNote: REVEAL_ROADMAP_COPY.supplementElsewhereNote(
          domain.supplement.name,
          owner,
        ),
      };
    }

    seen.set(domain.supplement.name, domain.label);
    return domain;
  });
}
