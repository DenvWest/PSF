import { afterEach, describe, expect, it, vi } from "vitest";

const { mockGte } = vi.hoisted(() => ({ mockGte: vi.fn() }));

vi.mock("@/lib/organization", () => ({
  getDefaultOrganizationId: () => "org-uuid-default",
}));

vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdmin: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          gte: mockGte,
        }),
      }),
    }),
  }),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("getClicksPerBesteCategory", () => {
  it("geeft alle 7 /beste/*-stoffen terug in vaste volgorde, ook zonder klikken", async () => {
    mockGte.mockResolvedValue({ data: [], error: null });

    const { getClicksPerBesteCategory } = await import(
      "@/lib/affiliate-analytics"
    );
    const { SUPPLEMENT_SLUGS, getSupplementComparisonData } = await import(
      "@/data/supplements"
    );

    const rows = await getClicksPerBesteCategory(30);

    expect(rows).toHaveLength(SUPPLEMENT_SLUGS.length);
    for (const row of rows) {
      expect(row.count).toBe(0);
    }
    const expectedKeys = SUPPLEMENT_SLUGS.map(
      (slug) => getSupplementComparisonData(slug)?.category,
    );
    expect(rows.map((r) => r.key)).toEqual(expectedKeys);
  });

  it("telt klikken per categorie correct en laat 'vergelijking' (oude, ongefixte klikken) buiten de rijen", async () => {
    mockGte.mockResolvedValue({
      data: [
        { categorie: "magnesium", timestamp: "2026-09-10T10:00:00Z" },
        { categorie: "magnesium", timestamp: "2026-09-11T10:00:00Z" },
        { categorie: "omega-3", timestamp: "2026-09-11T10:00:00Z" },
        { categorie: "vergelijking", timestamp: "2026-09-11T10:00:00Z" },
      ],
      error: null,
    });

    const { getClicksPerBesteCategory } = await import(
      "@/lib/affiliate-analytics"
    );

    const rows = await getClicksPerBesteCategory(30);
    const byKey = Object.fromEntries(rows.map((r) => [r.key, r.count]));

    expect(byKey.magnesium).toBe(2);
    expect(byKey["omega-3"]).toBe(1);
    expect(byKey.creatine).toBe(0);
    // "vergelijking" is geen van de 7 stof-categorieën en verschijnt niet als eigen rij
    expect(Object.keys(byKey)).not.toContain("vergelijking");
  });

  it("propageert een query-error i.p.v. hem te verslikken", async () => {
    mockGte.mockResolvedValue({
      data: null,
      error: { message: "boom" },
    });

    const { getClicksPerBesteCategory } = await import(
      "@/lib/affiliate-analytics"
    );

    await expect(getClicksPerBesteCategory(30)).rejects.toBeTruthy();
  });
});
