import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetAccount, mockIn, mockBaseline } = vi.hoisted(() => ({
  mockGetAccount: vi.fn(),
  mockIn: vi.fn(),
  mockBaseline: vi.fn(),
}));

vi.mock("@/lib/account-server", () => ({
  getAccountFromCookie: mockGetAccount,
}));
vi.mock("@/lib/public-site-url", () => ({
  getPublicSiteUrl: () => "https://example.nl",
}));
vi.mock("@/lib/intake-remeasure-cookie", () => ({
  INTAKE_REMEASURE_BASELINE_COOKIE_NAME: "psf_remeasure_base",
  REMEASURE_BASELINE_COOKIE_MAX_AGE_SEC: 60,
  signRemeasureBaselineSessionId: (id: string) => `signed.${id}`,
}));
vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdmin: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          in: (column: string, values: string[]) => {
            mockIn(column, values);
            return {
              order: () => ({
                limit: () => ({ maybeSingle: mockBaseline }),
              }),
            };
          },
        }),
      }),
    }),
  }),
}));

import { GET } from "@/app/api/account/remeasure/start/route";

describe("GET /api/account/remeasure/start", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccount.mockResolvedValue({ id: "account-1" });
  });

  it("kiest het startpunt alleen uit sessies van de brede check (F2)", async () => {
    mockBaseline.mockResolvedValue({ data: { id: "brede-check-1" }, error: null });

    const res = await GET();

    expect(mockIn).toHaveBeenCalledWith("session_kind", ["initial", "remeasure"]);
    expect(res.headers.get("set-cookie")).toContain("psf_remeasure_base=signed.brede-check-1");
  });

  it("zonder brede check: terug naar het dashboard met 'geen_baseline'", async () => {
    mockBaseline.mockResolvedValue({ data: null, error: null });

    const res = await GET();

    expect(res.headers.get("location")).toContain("hermeting=geen_baseline");
  });
});
