import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getVisibleTiers } from "@/lib/org-settings";

const ORG_ID = "00000000-0000-0000-0000-000000000001";

vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdmin: vi.fn(),
}));

import { createSupabaseAdmin } from "@/lib/supabase-admin";

const mockedCreateSupabaseAdmin = vi.mocked(createSupabaseAdmin);

function stubAdmin(settings: Record<string, unknown> | null, error: Error | null = null) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: settings === null ? null : { settings },
    error,
  });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });
  mockedCreateSupabaseAdmin.mockReturnValue({ from } as never);
}

describe("getVisibleTiers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockedCreateSupabaseAdmin.mockReset();
  });

  it("returns tier 1 when admin client is unavailable", async () => {
    mockedCreateSupabaseAdmin.mockReturnValue(null);
    await expect(getVisibleTiers(ORG_ID)).resolves.toEqual([1]);
  });

  it("returns tier 1 when settings are missing", async () => {
    stubAdmin(null);
    await expect(getVisibleTiers(ORG_ID)).resolves.toEqual([1]);
  });

  it("returns tiers 1 through maxTier when maxTier is 3", async () => {
    stubAdmin({ maxTier: 3 });
    await expect(getVisibleTiers(ORG_ID)).resolves.toEqual([1, 2, 3]);
  });

  it("returns tier 1 for invalid maxTier values", async () => {
    stubAdmin({ maxTier: 0 });
    await expect(getVisibleTiers(ORG_ID)).resolves.toEqual([1]);

    stubAdmin({ maxTier: 6 });
    await expect(getVisibleTiers(ORG_ID)).resolves.toEqual([1]);

    stubAdmin({ maxTier: "3" });
    await expect(getVisibleTiers(ORG_ID)).resolves.toEqual([1]);
  });

  it("returns tier 1 on database error", async () => {
    stubAdmin({ maxTier: 3 }, new Error("db down"));
    await expect(getVisibleTiers(ORG_ID)).resolves.toEqual([1]);
  });
});
