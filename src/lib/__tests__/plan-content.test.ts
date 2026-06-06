import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { InterventionKind } from "@/lib/content/match-interventions";
import {
  getPlanContent,
  PLAN_JOURNEY_THEME_SLUGS,
  themeHasCompletePlanContent,
} from "@/lib/content/plan-content";
import type { DeficiencySignals, DomainScores, ProfileLabel } from "@/lib/intake-engine";

const ORG_ID = "00000000-0000-0000-0000-000000000001";
const THEME_ID = "11111111-1111-1111-1111-111111111111";

const INTERVENTION_IDS = {
  free_action: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  measurement: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  supplement: "cccccccc-cccc-cccc-cccc-cccccccccccc",
} as const;

type ClaimSeed = {
  intervention_id: string;
  status: "published" | "draft";
  is_efsa_authorized: boolean;
  claim_text?: string;
};

type AdminStubOptions = {
  themeId?: string | null;
  interventions?: Array<{ id: string; kind: InterventionKind }>;
  claims?: ClaimSeed[];
};

function makeMatchedIntervention(
  kind: InterventionKind,
  tier: number,
  id = INTERVENTION_IDS[kind],
) {
  return {
    id,
    slug: `${kind}-slug`,
    name: `${kind} name`,
    kind,
    description: `${kind} description`,
    goalPhrase: null,
    affiliateUrl: kind === "supplement" ? "https://example.com/affiliate" : null,
    comparisonPath: kind === "supplement" ? "/beste/magnesium" : null,
    tier,
    isPaid: false,
    paidDisclosureKey: null,
    externalProviderLabel: null,
    externalProviderUrl: null,
    compositeScore: 10,
    scores: {
      moeite: 3,
      mechanisme: 3,
      onderbouwing: 3,
      veiligheid: 5,
    },
  };
}

function filterClaims(claims: ClaimSeed[], filters: Record<string, unknown>) {
  return claims.filter((claim) => {
    if (filters.status !== undefined && claim.status !== filters.status) {
      return false;
    }
    if (
      filters.is_efsa_authorized !== undefined &&
      claim.is_efsa_authorized !== filters.is_efsa_authorized
    ) {
      return false;
    }
    if (
      typeof filters.intervention_id === "string" &&
      claim.intervention_id !== filters.intervention_id
    ) {
      return false;
    }
    const inList = filters.intervention_id_in;
    if (Array.isArray(inList) && !inList.includes(claim.intervention_id)) {
      return false;
    }
    return true;
  });
}

function makeThenableQuery<T>(
  resolve: (filters: Record<string, unknown>) => { data: T; error: null },
) {
  const filters: Record<string, unknown> = {};
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn((column: string, value: unknown) => {
      filters[column] = value;
      return builder;
    }),
    in: vi.fn((column: string, values: string[]) => {
      filters[`${column}_in`] = values;
      return builder;
    }),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => resolve(filters)),
    then: (
      onFulfilled: (value: { data: T; error: null }) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => Promise.resolve(resolve(filters)).then(onFulfilled, onRejected),
    getFilters: () => filters,
  };
  return builder;
}

function stubPlanContentAdmin(options: AdminStubOptions = {}) {
  const themeId = options.themeId === undefined ? THEME_ID : options.themeId;
  const interventions =
    options.interventions ??
    (Object.entries(INTERVENTION_IDS).map(([kind, id]) => ({
      id,
      kind: kind as InterventionKind,
    })) as Array<{ id: string; kind: InterventionKind }>);
  const claims = options.claims ?? [];

  const claimsQueries: ReturnType<typeof makeThenableQuery<unknown>>[] = [];

  const from = vi.fn((table: string) => {
    if (table === "themes") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(async () => ({
                data: themeId ? { id: themeId } : null,
                error: null,
              })),
            })),
          })),
        })),
      };
    }

    if (table === "interventions") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(async () => ({
              data: interventions,
              error: null,
            })),
          })),
        })),
      };
    }

    if (table === "evidence_claims") {
      const query = makeThenableQuery((filters) => {
        const matched = filterClaims(claims, filters);
        if (typeof filters.intervention_id === "string") {
          const row = matched[0];
          return {
            data: row
              ? {
                  claim_text: row.claim_text ?? "EFSA claim",
                  evidence_sources: { vancouver: "Test 2024.", url: null },
                }
              : null,
            error: null,
          };
        }
        return {
          data: matched.map((row) => ({ intervention_id: row.intervention_id })),
          error: null,
        };
      });
      claimsQueries.push(query);
      return { select: vi.fn(() => query) };
    }

    throw new Error(`Unexpected table: ${table}`);
  });

  mockedCreateSupabaseAdmin.mockReturnValue({ from } as never);
  return { from, claimsQueries };
}

vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdmin: vi.fn(),
}));

vi.mock("@/lib/content/match-interventions", () => ({
  getInterventionsForTheme: vi.fn(),
}));

vi.mock("@/lib/org-settings", () => ({
  getVisibleTiers: vi.fn(),
}));

import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getInterventionsForTheme } from "@/lib/content/match-interventions";
import { getVisibleTiers } from "@/lib/org-settings";

const mockedCreateSupabaseAdmin = vi.mocked(createSupabaseAdmin);
const mockedGetInterventionsForTheme = vi.mocked(getInterventionsForTheme);
const mockedGetVisibleTiers = vi.mocked(getVisibleTiers);

const baseScores: DomainScores = {
  sleep_score: 40,
  energy_score: 50,
  stress_score: 45,
  nutrition_score: 50,
  movement_score: 55,
  recovery_score: 45,
};

const baseSignals: DeficiencySignals = {
  omega3_deficiency: false,
  magnesium_signal: true,
  cortisol_risk: false,
  creatine_signal: false,
  melatonine_signal: false,
  protein_gap_signal: false,
};

const profile: ProfileLabel = {
  name: "Onrustige Slaper",
  domain: "sleep",
  score: 40,
};

describe("themeHasCompletePlanContent EFSA gating", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockedCreateSupabaseAdmin.mockReset();
  });

  it("returns false when claims are published but not EFSA-authorized", async () => {
    stubPlanContentAdmin({
      claims: Object.values(INTERVENTION_IDS).map((intervention_id) => ({
        intervention_id,
        status: "published",
        is_efsa_authorized: false,
      })),
    });

    await expect(themeHasCompletePlanContent("sleep", ORG_ID)).resolves.toBe(false);
  });

  it("returns true when each kind has a published EFSA-authorized claim", async () => {
    const { claimsQueries } = stubPlanContentAdmin({
      claims: Object.values(INTERVENTION_IDS).map((intervention_id) => ({
        intervention_id,
        status: "published",
        is_efsa_authorized: true,
      })),
    });

    await expect(themeHasCompletePlanContent("sleep", ORG_ID)).resolves.toBe(true);

    const bulkClaimQuery = claimsQueries[0];
    expect(bulkClaimQuery?.getFilters()).toMatchObject({
      status: "published",
      is_efsa_authorized: true,
    });
  });

  it("applies is_efsa_authorized filter on bulk claim lookup", async () => {
    const { claimsQueries } = stubPlanContentAdmin({
      claims: Object.values(INTERVENTION_IDS).map((intervention_id) => ({
        intervention_id,
        status: "published",
        is_efsa_authorized: true,
      })),
    });

    await themeHasCompletePlanContent("stress", ORG_ID);

    expect(claimsQueries[0]?.getFilters()).toMatchObject({
      status: "published",
      is_efsa_authorized: true,
    });
  });
});

describe("getPlanContent tier-3 anti-lek invariant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetVisibleTiers.mockResolvedValue([1, 2, 3]);
  });

  afterEach(() => {
    mockedCreateSupabaseAdmin.mockReset();
    mockedGetInterventionsForTheme.mockReset();
    mockedGetVisibleTiers.mockReset();
  });

  function stubReadyPlan(claims: ClaimSeed[]) {
    stubPlanContentAdmin({ claims });
    mockedGetInterventionsForTheme.mockResolvedValue({
      source: "database",
      buckets: {
        free_action: makeMatchedIntervention("free_action", 1),
        measurement: makeMatchedIntervention("measurement", 2),
        supplement: makeMatchedIntervention("supplement", 3),
      },
      ordered: [
        makeMatchedIntervention("free_action", 1),
        makeMatchedIntervention("measurement", 2),
        makeMatchedIntervention("supplement", 3),
      ],
    });
  }

  it("does not render tier-3 supplement when matched intervention lacks EFSA claim", async () => {
    stubReadyPlan([
      {
        intervention_id: INTERVENTION_IDS.free_action,
        status: "published",
        is_efsa_authorized: true,
      },
      {
        intervention_id: INTERVENTION_IDS.measurement,
        status: "published",
        is_efsa_authorized: true,
      },
      {
        intervention_id: INTERVENTION_IDS.supplement,
        status: "published",
        is_efsa_authorized: false,
      },
    ]);

    const result = await getPlanContent(
      "sleep",
      baseScores,
      baseSignals,
      profile,
      {},
      ORG_ID,
    );

    expect(result.ready).toBe(false);
    expect(result.actions).toEqual([]);
    expect(result.actions.some((action) => action.kind === "supplement")).toBe(false);
  });

  it("renders tier-3 supplement only with published EFSA-authorized claim", async () => {
    stubReadyPlan(
      Object.values(INTERVENTION_IDS).map((intervention_id) => ({
        intervention_id,
        status: "published" as const,
        is_efsa_authorized: true,
        claim_text: "Goedgekeurde claim.",
      })),
    );

    const result = await getPlanContent(
      "sleep",
      baseScores,
      baseSignals,
      profile,
      {},
      ORG_ID,
    );

    expect(result.ready).toBe(true);
    const supplement = result.actions.find((action) => action.kind === "supplement");
    expect(supplement).toBeDefined();
    expect(supplement?.tier).toBe(3);
    expect(supplement?.claimText).toBe("Goedgekeurde claim.");
  });

  it.each([...PLAN_JOURNEY_THEME_SLUGS])(
    "never exposes tier-3 supplement without EFSA claim for theme %s",
    async (themeSlug) => {
      stubReadyPlan([
        {
          intervention_id: INTERVENTION_IDS.free_action,
          status: "published",
          is_efsa_authorized: true,
        },
        {
          intervention_id: INTERVENTION_IDS.measurement,
          status: "published",
          is_efsa_authorized: true,
        },
        {
          intervention_id: INTERVENTION_IDS.supplement,
          status: "published",
          is_efsa_authorized: false,
        },
      ]);

      const result = await getPlanContent(
        themeSlug,
        baseScores,
        baseSignals,
        profile,
        {},
        ORG_ID,
      );

      expect(result.actions.filter((action) => action.tier === 3)).toEqual([]);
    },
  );
});
