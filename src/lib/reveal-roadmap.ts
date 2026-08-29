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
