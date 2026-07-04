import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_ORG_ID } from "@/config/org";
import {
  clearOrgResolverCache,
  extractSubdomainFromHost,
  resolveOrgIdFromHost,
  resolveOrgIdFromSubdomain,
} from "@/lib/org-resolver";

const PARTNER_ORG_ID = "22222222-2222-2222-2222-222222222222";

vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdmin: vi.fn(),
}));

import { createSupabaseAdmin } from "@/lib/supabase-admin";

const mockedCreateSupabaseAdmin = vi.mocked(createSupabaseAdmin);

function stubAdminSlugLookup(orgId: string | null, error: Error | null = null) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: orgId ? { id: orgId } : null,
    error,
  });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });
  mockedCreateSupabaseAdmin.mockReturnValue({ from } as never);
  return { from, select, eq, maybeSingle };
}

describe("extractSubdomainFromHost", () => {
  it("returns null for apex and www hosts", () => {
    expect(extractSubdomainFromHost("perfectsupplement.nl")).toBeNull();
    expect(extractSubdomainFromHost("www.perfectsupplement.nl")).toBeNull();
    expect(extractSubdomainFromHost("perfectsupplement.example.com")).toBeNull();
  });

  it("returns subdomain for tenant hosts", () => {
    expect(extractSubdomainFromHost("acme.perfectsupplement.nl")).toBe("acme");
  });
});

describe("resolveOrgIdFromSubdomain", () => {
  beforeEach(() => {
    clearOrgResolverCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockedCreateSupabaseAdmin.mockReset();
    clearOrgResolverCache();
  });

  it("returns org id for known slug", async () => {
    stubAdminSlugLookup(PARTNER_ORG_ID);
    await expect(resolveOrgIdFromSubdomain("acme")).resolves.toBe(PARTNER_ORG_ID);
  });

  it("returns DEFAULT_ORG_ID for unknown slug", async () => {
    stubAdminSlugLookup(null);
    await expect(resolveOrgIdFromSubdomain("unknown")).resolves.toBe(DEFAULT_ORG_ID);
  });

  it("returns DEFAULT_ORG_ID when admin client is unavailable", async () => {
    mockedCreateSupabaseAdmin.mockReturnValue(null);
    await expect(resolveOrgIdFromSubdomain("acme")).resolves.toBe(DEFAULT_ORG_ID);
  });

  it("caches slug lookups within TTL", async () => {
    const stubs = stubAdminSlugLookup(PARTNER_ORG_ID);
    await resolveOrgIdFromSubdomain("acme");
    await resolveOrgIdFromSubdomain("acme");
    expect(stubs.from).toHaveBeenCalledTimes(1);
  });
});

describe("resolveOrgIdFromHost", () => {
  beforeEach(() => {
    clearOrgResolverCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockedCreateSupabaseAdmin.mockReset();
    clearOrgResolverCache();
  });

  it("ignores spoofed x-org-id header", async () => {
    stubAdminSlugLookup(PARTNER_ORG_ID);
    await expect(
      resolveOrgIdFromHost(
        "acme.perfectsupplement.nl",
        "99999999-9999-9999-9999-999999999999",
      ),
    ).resolves.toBe(PARTNER_ORG_ID);
  });

  it("returns DEFAULT_ORG_ID for apex host even with spoof header", async () => {
    await expect(
      resolveOrgIdFromHost(
        "perfectsupplement.nl",
        "99999999-9999-9999-9999-999999999999",
      ),
    ).resolves.toBe(DEFAULT_ORG_ID);
    expect(mockedCreateSupabaseAdmin).not.toHaveBeenCalled();
  });
});
