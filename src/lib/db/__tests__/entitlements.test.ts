import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveTrendsAccess } from "@/lib/entitlement-access";
import {
  getEntitlements,
  hasFeature,
  type EntitlementFeature,
} from "@/lib/db/entitlements";

const ACCOUNT_ID = "00000000-0000-0000-0000-000000000099";

vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdmin: vi.fn(),
}));

import { createSupabaseAdmin } from "@/lib/supabase-admin";

const mockedCreateSupabaseAdmin = vi.mocked(createSupabaseAdmin);

type EntitlementStubRow = {
  feature: string;
  valid_until: string | null;
};

function stubEntitlements(
  rows: EntitlementStubRow[],
  error: { code?: string; message: string } | null = null,
) {
  const eq = vi.fn().mockResolvedValue({ data: rows, error });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });
  mockedCreateSupabaseAdmin.mockReturnValue({ from } as never);
}

describe("getEntitlements / hasFeature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockedCreateSupabaseAdmin.mockReset();
  });

  it("returns true when trends row exists with null valid_until", async () => {
    stubEntitlements([{ feature: "trends", valid_until: null }]);
    await expect(hasFeature(ACCOUNT_ID, "trends")).resolves.toBe(true);
  });

  it("returns true when valid_until is in the future", async () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    stubEntitlements([{ feature: "trends", valid_until: future }]);
    await expect(hasFeature(ACCOUNT_ID, "trends")).resolves.toBe(true);
  });

  it("returns false when no rows exist", async () => {
    stubEntitlements([]);
    await expect(hasFeature(ACCOUNT_ID, "trends")).resolves.toBe(false);
  });

  it("returns false when valid_until is in the past", async () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    stubEntitlements([{ feature: "trends", valid_until: past }]);
    await expect(hasFeature(ACCOUNT_ID, "trends")).resolves.toBe(false);
  });

  it("returns false on database error", async () => {
    stubEntitlements([], { message: "db down" });
    await expect(hasFeature(ACCOUNT_ID, "trends")).resolves.toBe(false);
  });

  it("returns false silently when account_entitlements table is missing", async () => {
    stubEntitlements([], {
      code: "PGRST205",
      message:
        "Could not find the table 'public.account_entitlements' in the schema cache",
    });
    await expect(hasFeature(ACCOUNT_ID, "trends")).resolves.toBe(false);
  });

  it("returns empty set when admin client is unavailable", async () => {
    mockedCreateSupabaseAdmin.mockReturnValue(null);
    await expect(getEntitlements(ACCOUNT_ID)).resolves.toEqual(new Set());
    await expect(hasFeature(ACCOUNT_ID, "coach")).resolves.toBe(false);
  });

  it("ignores invalid feature values from the database", async () => {
    stubEntitlements([
      { feature: "trends", valid_until: null },
      { feature: "invalid", valid_until: null },
    ]);
    await expect(getEntitlements(ACCOUNT_ID)).resolves.toEqual(
      new Set<EntitlementFeature>(["trends"]),
    );
  });
});

describe("resolveTrendsAccess", () => {
  it("follows isMember when DARK_LAUNCH is true", () => {
    expect(resolveTrendsAccess(true, false)).toBe(false);
    expect(resolveTrendsAccess(false, true)).toBe(true);
    expect(resolveTrendsAccess(true, true)).toBe(true);
  });
});
