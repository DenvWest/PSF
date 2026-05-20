import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  parsePartnerApiKeys,
  resolvePartnerOrgId,
  withPartnerApi,
} from "@/lib/api-middleware";

const PARTNER_ORG = "22222222-2222-2222-2222-222222222222";
const DEFAULT_ORG = "11111111-1111-1111-1111-111111111111";

function makePartnerRequest(
  apiKey: string,
  extraHeaders: Record<string, string> = {},
): Request {
  return new Request("http://localhost/api/partner/intake", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      ...extraHeaders,
    },
  });
}

describe("parsePartnerApiKeys", () => {
  it("parses key:orgId pairs and bare keys", () => {
    expect(
      parsePartnerApiKeys(`alpha:${PARTNER_ORG},beta`),
    ).toEqual([
      { key: "alpha", orgId: PARTNER_ORG },
      { key: "beta" },
    ]);
  });
});

describe("withPartnerApi", () => {
  beforeEach(() => {
    vi.stubEnv("ORGANIZATION_ID", DEFAULT_ORG);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects missing API key", async () => {
    const result = withPartnerApi(new Request("http://localhost"));
    expect(result.authorized).toBe(false);
    expect(result.response?.status).toBe(401);
  });

  it("rejects invalid API key", () => {
    vi.stubEnv("PARTNER_API_KEYS", `valid:${PARTNER_ORG}`);
    const result = withPartnerApi(makePartnerRequest("invalid"));
    expect(result.authorized).toBe(false);
    expect(result.response?.status).toBe(403);
  });

  it("returns orgId from key mapping", () => {
    vi.stubEnv("PARTNER_API_KEYS", `valid:${PARTNER_ORG}`);
    const result = withPartnerApi(makePartnerRequest("valid"));
    expect(result.authorized).toBe(true);
    expect(result.orgId).toBe(PARTNER_ORG);
  });

  it("uses default org for legacy key-only entries", () => {
    vi.stubEnv("PARTNER_API_KEYS", "legacy-only");
    const result = withPartnerApi(makePartnerRequest("legacy-only"));
    expect(result.authorized).toBe(true);
    expect(result.orgId).toBe(DEFAULT_ORG);
  });

  it("ignores spoofed x-org-id header", () => {
    vi.stubEnv("PARTNER_API_KEYS", `valid:${PARTNER_ORG}`);
    const result = withPartnerApi(
      makePartnerRequest("valid", {
        "x-org-id": "99999999-9999-9999-9999-999999999999",
      }),
    );
    expect(result.authorized).toBe(true);
    expect(result.orgId).toBe(PARTNER_ORG);
  });
});

describe("resolvePartnerOrgId", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns undefined for unknown keys", () => {
    vi.stubEnv("PARTNER_API_KEYS", "known:uuid");
    expect(resolvePartnerOrgId("unknown")).toBeUndefined();
  });
});
