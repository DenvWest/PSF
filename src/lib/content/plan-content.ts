import type { ThemeSlug } from "@/lib/content/themes";
import {
  getInterventionsForTheme,
  type InterventionKind,
  type MatchedIntervention,
} from "@/lib/content/match-interventions";
import type {
  DeficiencySignals,
  DomainScores,
  ProfileLabel,
} from "@/lib/intake-engine";
import { getDefaultOrganizationId } from "@/lib/organization";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const PLAN_KINDS: InterventionKind[] = [
  "free_action",
  "measurement",
  "supplement",
];

/** Thema's met volledige PLAN-journey (DB interventies + published claims). */
export const PLAN_JOURNEY_THEME_SLUGS = [
  "sleep",
  "stress",
  "nutrition",
  "movement",
] as const satisfies readonly ThemeSlug[];

export type PlanAction = {
  kind: InterventionKind;
  slug: string;
  name: string;
  description: string;
  goalPhrase: string | null;
  claimText: string;
  sourceLabel: string;
  sourceUrl: string | null;
  affiliateUrl: string | null;
  comparisonPath: string | null;
};

export type PlanContent = {
  ready: boolean;
  themeSlug: ThemeSlug;
  source: "database" | "fallback_supplement_routes";
  actions: PlanAction[];
};

type EvidenceClaimRow = {
  claim_text: string;
  evidence_sources: { vancouver: string; url: string | null } | null;
};

export async function themeHasCompletePlanContent(
  themeSlug: ThemeSlug,
  orgId?: string,
): Promise<boolean> {
  const organizationId = orgId ?? getDefaultOrganizationId();
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return false;
  }

  const { data: themeRow, error: themeError } = await supabase
    .from("themes")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("slug", themeSlug)
    .maybeSingle<{ id: string }>();

  if (themeError || !themeRow) {
    return false;
  }

  const { data: interventions, error: interventionsError } = await supabase
    .from("interventions")
    .select("id, kind")
    .eq("organization_id", organizationId)
    .eq("theme_id", themeRow.id);

  if (interventionsError || !interventions?.length) {
    return false;
  }

  const kindsPresent = new Set(
    interventions.map((row) => row.kind as InterventionKind),
  );
  if (!PLAN_KINDS.every((kind) => kindsPresent.has(kind))) {
    return false;
  }

  const interventionIds = interventions.map((row) => row.id);
  const { data: claims, error: claimsError } = await supabase
    .from("evidence_claims")
    .select("intervention_id")
    .eq("organization_id", organizationId)
    .eq("status", "published")
    .in("intervention_id", interventionIds);

  if (claimsError || !claims?.length) {
    return false;
  }

  const claimedIds = new Set(
    claims
      .map((row) => row.intervention_id)
      .filter((id): id is string => typeof id === "string"),
  );

  for (const kind of PLAN_KINDS) {
    const idsForKind = interventions
      .filter((row) => row.kind === kind)
      .map((row) => row.id);
    if (!idsForKind.some((id) => claimedIds.has(id))) {
      return false;
    }
  }

  return true;
}

async function getPublishedClaimForIntervention(
  interventionId: string,
  orgId: string,
): Promise<{ claimText: string; sourceLabel: string; sourceUrl: string | null } | null> {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("evidence_claims")
    .select("claim_text, evidence_sources ( vancouver, url )")
    .eq("organization_id", orgId)
    .eq("intervention_id", interventionId)
    .eq("status", "published")
    .limit(1)
    .maybeSingle<EvidenceClaimRow>();

  if (error || !data) {
    return null;
  }

  return {
    claimText: data.claim_text,
    sourceLabel: data.evidence_sources?.vancouver ?? "Bron",
    sourceUrl: data.evidence_sources?.url ?? null,
  };
}

function interventionToAction(
  item: MatchedIntervention,
  evidence: { claimText: string; sourceLabel: string; sourceUrl: string | null },
): PlanAction {
  const affiliateUrl = item.affiliateUrl ?? item.comparisonPath;
  return {
    kind: item.kind,
    slug: item.slug,
    name: item.name,
    description: item.description,
    goalPhrase: item.goalPhrase,
    claimText: evidence.claimText,
    sourceLabel: evidence.sourceLabel,
    sourceUrl: evidence.sourceUrl,
    affiliateUrl,
    comparisonPath: item.comparisonPath,
  };
}

export async function getPlanContent(
  themeSlug: ThemeSlug,
  scores: DomainScores,
  deficiencySignals: DeficiencySignals,
  profileLabel: ProfileLabel,
  answers: Record<string, number>,
  orgId?: string,
): Promise<PlanContent> {
  const organizationId = orgId ?? getDefaultOrganizationId();
  const ready = await themeHasCompletePlanContent(themeSlug, organizationId);

  if (!ready) {
    const fallback = await getInterventionsForTheme(
      themeSlug,
      scores,
      deficiencySignals,
      profileLabel,
      answers,
      organizationId,
    );
    const supplement = fallback.buckets.supplement;
    const actions: PlanAction[] = [];

    if (supplement) {
      actions.push({
        kind: "supplement",
        slug: supplement.slug,
        name: supplement.name,
        description: supplement.description,
        goalPhrase: supplement.goalPhrase,
        claimText: supplement.description,
        sourceLabel: "Zie vergelijkingspagina",
        sourceUrl: supplement.comparisonPath ?? supplement.affiliateUrl,
        affiliateUrl: supplement.affiliateUrl ?? supplement.comparisonPath,
        comparisonPath: supplement.comparisonPath,
      });
    }

    return {
      ready: false,
      themeSlug,
      source: fallback.source,
      actions,
    };
  }

  const matched = await getInterventionsForTheme(
    themeSlug,
    scores,
    deficiencySignals,
    profileLabel,
    answers,
    organizationId,
  );

  const actions: PlanAction[] = [];

  for (const kind of PLAN_KINDS) {
    const item = matched.buckets[kind];
    if (!item) {
      return {
        ready: false,
        themeSlug,
        source: matched.source,
        actions: [],
      };
    }

    const evidence = await getPublishedClaimForIntervention(item.id, organizationId);
    if (!evidence) {
      return {
        ready: false,
        themeSlug,
        source: matched.source,
        actions: [],
      };
    }

    actions.push(interventionToAction(item, evidence));
  }

  return {
    ready: true,
    themeSlug,
    source: matched.source,
    actions,
  };
}
