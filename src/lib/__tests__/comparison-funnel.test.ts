import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));

vi.mock("@/lib/organization", () => ({
  getDefaultOrganizationId: () => "org-uuid-default",
}));
vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdmin: () => ({ from: mockFrom }),
}));

type Filters = Record<string, string>;

/**
 * Minimale PostgREST-keten voor een head-count: filters worden verzameld,
 * await levert het aantal dat bij die combinatie hoort.
 */
function countQuery(resolve: (filters: Filters) => number) {
  const filters: Filters = {};
  const chain = {
    select: () => chain,
    eq: (column: string, value: string) => {
      filters[column] = value;
      return chain;
    },
    then: (
      onFulfilled: (value: { count: number; error: null }) => unknown,
    ) => onFulfilled({ count: resolve(filters), error: null }),
  };
  return chain;
}

function stubCounts(options: {
  views?: Record<string, number>;
  clicks?: Record<string, number>;
}) {
  mockFrom.mockImplementation((table: string) => {
    if (table === "domain_events") {
      return countQuery(
        (filters) => options.views?.[filters["payload->>slug"]] ?? 0,
      );
    }
    if (table === "affiliate_clicks") {
      return countQuery((filters) => options.clicks?.[filters.pagina] ?? 0);
    }
    throw new Error(`Onverwachte tabel: ${table}`);
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getComparisonFunnel", () => {
  it("koppelt weergaves aan klikken per vergelijkingspagina", async () => {
    stubCounts({
      views: { magnesium: 3, "vitamine-d": 1 },
      clicks: { "/beste/magnesium": 1 },
    });

    const { getComparisonFunnel } = await import("@/lib/affiliate-analytics");
    const rows = await getComparisonFunnel();

    const magnesium = rows.find((row) => row.slug === "magnesium");
    expect(magnesium).toMatchObject({
      path: "/beste/magnesium",
      views: 3,
      clicks: 1,
    });
    expect(magnesium?.ctr).toBeCloseTo(1 / 3);

    expect(rows.find((row) => row.slug === "vitamine-d")).toMatchObject({
      views: 1,
      clicks: 0,
      ctr: 0,
    });
  });

  it("filtert op de standaard-organisatie en op het weergave-event", async () => {
    const gezien: Filters[] = [];
    mockFrom.mockImplementation((table: string) => {
      if (table === "domain_events") {
        return countQuery((filters) => {
          gezien.push({ ...filters });
          return 0;
        });
      }
      return countQuery(() => 0);
    });

    const { getComparisonFunnel } = await import("@/lib/affiliate-analytics");
    await getComparisonFunnel();

    for (const filters of gezien) {
      expect(filters.organization_id).toBe("org-uuid-default");
      expect(filters.event_type).toBe("comparison.page_viewed");
    }
  });

  it("toont alle zeven pagina's, ook zonder enige meting", async () => {
    stubCounts({});

    const { getComparisonFunnel } = await import("@/lib/affiliate-analytics");
    const { SUPPLEMENT_SLUGS } = await import("@/data/supplements");
    const rows = await getComparisonFunnel();

    expect(rows.map((row) => row.slug).sort()).toEqual(
      [...SUPPLEMENT_SLUGS].sort(),
    );
    for (const row of rows) {
      expect(row.views).toBe(0);
      expect(row.clicks).toBe(0);
      // Zonder weergaves is de CTR onbekend, niet nul.
      expect(row.ctr).toBeNull();
    }
  });

  it("sorteert de pagina die het eerst aandacht verdient bovenaan", async () => {
    stubCounts({ views: { zink: 2, creatine: 1 } });

    const { getComparisonFunnel } = await import("@/lib/affiliate-analytics");
    const rows = await getComparisonFunnel();

    expect(rows[0].slug).toBe("zink");
    expect(rows[1].slug).toBe("creatine");
  });

  it("telt geen klikken mee van buiten de vergelijkingspagina", async () => {
    stubCounts({
      views: { magnesium: 4 },
      clicks: { "/product/vitaminstore-super-magnesium": 9 },
    });

    const { getComparisonFunnel } = await import("@/lib/affiliate-analytics");
    const rows = await getComparisonFunnel();

    expect(rows.every((row) => row.clicks === 0)).toBe(true);
  });
});
