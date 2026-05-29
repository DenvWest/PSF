import type { ThemeSlug } from "@/lib/content/themes";
import {
  computeCompositeScore,
  passesSafetyFilter,
  type InterventionScoreInput,
} from "@/lib/content/intervention-scoring";
import {
  matchesRecognitionLine,
  type RecognitionMatchOperator,
} from "@/lib/content/match-recognition";
import type {
  DeficiencySignals,
  DomainScores,
  ProfileLabel,
} from "@/lib/intake-engine";
import { getSupplementRoute } from "@/lib/getSupplementRoute";
import { getDefaultOrganizationId } from "@/lib/organization";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type InterventionKind = "free_action" | "measurement" | "supplement";

export type InterventionTriggerKind =
  | "domain_below"
  | "domain_above"
  | "deficiency_signal"
  | "profile_label"
  | "answer";

export type InterventionTriggerRow = {
  group_id: number;
  kind: InterventionTriggerKind;
  field: string;
  operator: string | null;
  value: unknown;
};

export type InterventionRow = {
  id: string;
  slug: string;
  name: string;
  kind: InterventionKind;
  description: string;
  score_moeite: number;
  score_mechanisme: number;
  score_onderbouwing: number;
  score_veiligheid: number;
  affiliate_url: string | null;
  comparison_path: string | null;
  goal_phrase: string | null;
  tier: number;
  is_paid: boolean;
  paid_disclosure_key: string | null;
  external_provider_label: string | null;
  external_provider_url: string | null;
  triggers: InterventionTriggerRow[];
};

export type MatchedIntervention = {
  id: string;
  slug: string;
  name: string;
  kind: InterventionKind;
  description: string;
  goalPhrase: string | null;
  affiliateUrl: string | null;
  comparisonPath: string | null;
  tier: number;
  isPaid: boolean;
  paidDisclosureKey: string | null;
  externalProviderLabel: string | null;
  externalProviderUrl: string | null;
  compositeScore: number;
  scores: InterventionScoreInput;
};

export type InterventionBuckets = {
  free_action: MatchedIntervention | null;
  measurement: MatchedIntervention | null;
  supplement: MatchedIntervention | null;
};

export type InterventionPlanResult = {
  source: "database" | "fallback_supplement_routes";
  themeSlug: ThemeSlug;
  buckets: InterventionBuckets;
  /** Eén interventie per tier (hoogste composite binnen tier), oplopend op tier. */
  ordered: MatchedIntervention[];
};

const DEFAULT_TIER = 1;

function parseThreshold(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    return Number(value.trim());
  }
  return null;
}

function parseStringValue(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return null;
}

function isDomainScoreKey(field: string): field is keyof DomainScores {
  return (
    field === "sleep_score" ||
    field === "energy_score" ||
    field === "stress_score" ||
    field === "nutrition_score" ||
    field === "movement_score" ||
    field === "recovery_score"
  );
}

function isDeficiencySignalKey(
  field: string,
): field is keyof DeficiencySignals {
  return (
    field === "omega3_deficiency" ||
    field === "magnesium_signal" ||
    field === "cortisol_risk" ||
    field === "creatine_signal" ||
    field === "melatonine_signal" ||
    field === "protein_gap_signal"
  );
}

function triggerMatches(
  trigger: InterventionTriggerRow,
  context: {
    scores: DomainScores;
    deficiencySignals: DeficiencySignals;
    profileLabel: ProfileLabel;
    answers: Record<string, number>;
  },
): boolean {
  switch (trigger.kind) {
    case "domain_below": {
      if (!isDomainScoreKey(trigger.field)) {
        return false;
      }
      const threshold = parseThreshold(trigger.value);
      return threshold !== null && context.scores[trigger.field] < threshold;
    }
    case "domain_above": {
      if (!isDomainScoreKey(trigger.field)) {
        return false;
      }
      const threshold = parseThreshold(trigger.value);
      return threshold !== null && context.scores[trigger.field] > threshold;
    }
    case "deficiency_signal": {
      if (!isDeficiencySignalKey(trigger.field)) {
        return false;
      }
      return context.deficiencySignals[trigger.field] === true;
    }
    case "profile_label": {
      const expected = parseStringValue(trigger.value);
      return expected !== null && context.profileLabel.name === expected;
    }
    case "answer": {
      const operator = trigger.operator;
      if (
        operator !== "<=" &&
        operator !== ">=" &&
        operator !== "=" &&
        operator !== "in"
      ) {
        return false;
      }
      return matchesRecognitionLine(
        {
          body_text: "",
          match_question_id: trigger.field,
          match_operator: operator as RecognitionMatchOperator,
          match_value: trigger.value,
          priority: 0,
        },
        context.answers,
      );
    }
    default:
      return false;
  }
}

export function interventionTriggersMatch(
  triggers: InterventionTriggerRow[],
  context: {
    scores: DomainScores;
    deficiencySignals: DeficiencySignals;
    profileLabel: ProfileLabel;
    answers: Record<string, number>;
  },
): boolean {
  if (triggers.length === 0) {
    return true;
  }

  const groups = new Map<number, InterventionTriggerRow[]>();
  for (const trigger of triggers) {
    const entry = groups.get(trigger.group_id) ?? [];
    entry.push(trigger);
    groups.set(trigger.group_id, entry);
  }

  for (const groupTriggers of groups.values()) {
    if (groupTriggers.every((trigger) => triggerMatches(trigger, context))) {
      return true;
    }
  }

  return false;
}

function toMatchedIntervention(row: InterventionRow): MatchedIntervention | null {
  const scores: InterventionScoreInput = {
    scoreMoeite: row.score_moeite,
    scoreMechanisme: row.score_mechanisme,
    scoreOnderbouwing: row.score_onderbouwing,
    scoreVeiligheid: row.score_veiligheid,
  };

  if (!passesSafetyFilter(scores)) {
    return null;
  }

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    kind: row.kind,
    description: row.description,
    goalPhrase: row.goal_phrase,
    affiliateUrl: row.affiliate_url,
    comparisonPath: row.comparison_path,
    tier: Number.isFinite(row.tier) ? row.tier : DEFAULT_TIER,
    isPaid: row.is_paid === true,
    paidDisclosureKey: row.paid_disclosure_key,
    externalProviderLabel: row.external_provider_label,
    externalProviderUrl: row.external_provider_url,
    compositeScore: computeCompositeScore(scores),
    scores,
  };
}

/** Eén interventie per tier (hoogste composite), oplopend gesorteerd op tier. */
function pickTopPerTier(matched: MatchedIntervention[]): MatchedIntervention[] {
  const byTier = new Map<number, MatchedIntervention>();
  for (const item of matched) {
    const current = byTier.get(item.tier);
    if (!current || item.compositeScore > current.compositeScore) {
      byTier.set(item.tier, item);
    }
  }
  return [...byTier.values()].sort((a, b) => a.tier - b.tier);
}

function pickTopPerKind(
  matched: MatchedIntervention[],
): InterventionBuckets {
  const buckets: InterventionBuckets = {
    free_action: null,
    measurement: null,
    supplement: null,
  };

  const byKind: Record<InterventionKind, MatchedIntervention[]> = {
    free_action: [],
    measurement: [],
    supplement: [],
  };

  for (const item of matched) {
    byKind[item.kind].push(item);
  }

  for (const kind of Object.keys(byKind) as InterventionKind[]) {
    const sorted = byKind[kind].sort(
      (a, b) => b.compositeScore - a.compositeScore,
    );
    buckets[kind] = sorted[0] ?? null;
  }

  return buckets;
}

function buildFallbackBuckets(
  scores: DomainScores,
  deficiencySignals: DeficiencySignals,
  profileLabel: ProfileLabel,
  answers: Record<string, number>,
): InterventionBuckets {
  const routes = getSupplementRoute(
    scores,
    deficiencySignals,
    profileLabel,
    answers,
  );
  const top = routes[0];
  if (!top) {
    return { free_action: null, measurement: null, supplement: null };
  }

  return {
    free_action: null,
    measurement: null,
    supplement: {
      id: top.id,
      slug: top.id,
      name: top.name,
      kind: "supplement",
      description: top.reason,
      goalPhrase: null,
      affiliateUrl: top.affiliateUrl,
      comparisonPath: top.hasComparison ? top.affiliateUrl : null,
      tier: 3,
      isPaid: true,
      paidDisclosureKey: "paid_action_default",
      externalProviderLabel: null,
      externalProviderUrl: null,
      compositeScore: 0,
      scores: {
        scoreMoeite: 3,
        scoreMechanisme: 3,
        scoreOnderbouwing: 3,
        scoreVeiligheid: 4,
      },
    },
  };
}

async function loadInterventionsForTheme(
  themeSlug: ThemeSlug,
  orgId: string,
): Promise<InterventionRow[]> {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return [];
  }

  const { data: themeRow, error: themeError } = await supabase
    .from("themes")
    .select("id")
    .eq("organization_id", orgId)
    .eq("slug", themeSlug)
    .maybeSingle<{ id: string }>();

  if (themeError || !themeRow) {
    return [];
  }

  const { data: interventions, error: interventionsError } = await supabase
    .from("interventions")
    .select(
      "id, slug, name, kind, description, score_moeite, score_mechanisme, score_onderbouwing, score_veiligheid, affiliate_url, comparison_path, goal_phrase, tier, is_paid, paid_disclosure_key, external_provider_label, external_provider_url",
    )
    .eq("organization_id", orgId)
    .eq("theme_id", themeRow.id);

  if (interventionsError || !interventions?.length) {
    return [];
  }

  const ids = interventions.map((row) => row.id);
  const { data: triggers, error: triggersError } = await supabase
    .from("intervention_triggers")
    .select("intervention_id, group_id, kind, field, operator, value")
    .eq("organization_id", orgId)
    .in("intervention_id", ids);

  if (triggersError) {
    return [];
  }

  const triggersByIntervention = new Map<string, InterventionTriggerRow[]>();
  for (const trigger of triggers ?? []) {
    const entry = triggersByIntervention.get(trigger.intervention_id) ?? [];
    entry.push({
      group_id: trigger.group_id,
      kind: trigger.kind as InterventionTriggerKind,
      field: trigger.field,
      operator: trigger.operator,
      value: trigger.value,
    });
    triggersByIntervention.set(trigger.intervention_id, entry);
  }

  return interventions.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    kind: row.kind as InterventionKind,
    description: row.description,
    score_moeite: row.score_moeite,
    score_mechanisme: row.score_mechanisme,
    score_onderbouwing: row.score_onderbouwing,
    score_veiligheid: row.score_veiligheid,
    affiliate_url: row.affiliate_url,
    comparison_path: row.comparison_path,
    goal_phrase: row.goal_phrase,
    tier: typeof row.tier === "number" ? row.tier : DEFAULT_TIER,
    is_paid: row.is_paid === true,
    paid_disclosure_key: row.paid_disclosure_key ?? null,
    external_provider_label: row.external_provider_label ?? null,
    external_provider_url: row.external_provider_url ?? null,
    triggers: triggersByIntervention.get(row.id) ?? [],
  }));
}

export async function getInterventionsForTheme(
  themeSlug: ThemeSlug,
  scores: DomainScores,
  deficiencySignals: DeficiencySignals,
  profileLabel: ProfileLabel,
  answers: Record<string, number>,
  orgId?: string,
): Promise<InterventionPlanResult> {
  const organizationId = orgId ?? getDefaultOrganizationId();
  const context = { scores, deficiencySignals, profileLabel, answers };

  const rows = await loadInterventionsForTheme(themeSlug, organizationId);
  const matched = rows
    .filter((row) => interventionTriggersMatch(row.triggers, context))
    .map(toMatchedIntervention)
    .filter((item): item is MatchedIntervention => item !== null);

  if (matched.length > 0) {
    return {
      source: "database",
      themeSlug,
      buckets: pickTopPerKind(matched),
      ordered: pickTopPerTier(matched),
    };
  }

  const fallbackBuckets = buildFallbackBuckets(
    scores,
    deficiencySignals,
    profileLabel,
    answers,
  );

  return {
    source: "fallback_supplement_routes",
    themeSlug,
    buckets: fallbackBuckets,
    ordered: fallbackBuckets.supplement ? [fallbackBuckets.supplement] : [],
  };
}
