import { describe, expect, it } from "vitest";
import {
  bannerAnalyticsConsentRow,
  bannerMarketingConsentRow,
} from "@/lib/banner-analytics-consent";
import { CONSENT_VERSION } from "@/lib/consent-texts";
import { DEFAULT_ORG_ID } from "@/config/org";

describe("bannerAnalyticsConsentRow", () => {
  it("maakt consent_records rij voor cookiebanner grant", () => {
    const row = bannerAnalyticsConsentRow({
      granted: true,
      source: "banner",
      ipHash: "ip-hash",
      uaHash: "ua-hash",
    });

    expect(row).toEqual({
      organization_id: DEFAULT_ORG_ID,
      consent_type: "anonymous_analytics",
      consent_version: CONSENT_VERSION,
      granted: true,
      consent_text: expect.stringContaining("cookiebanner"),
      ip_hash: "ip-hash",
      ua_hash: "ua-hash",
    });
  });

  it("vermeldt footer als bron", () => {
    const row = bannerAnalyticsConsentRow({
      granted: false,
      source: "footer",
      ipHash: "ip",
      uaHash: "ua",
    });
    expect(row.consent_text).toContain("footer cookievoorkeuren");
    expect(row.granted).toBe(false);
  });
});

describe("bannerMarketingConsentRow", () => {
  it("maakt affiliate_marketing consent rij", () => {
    const row = bannerMarketingConsentRow({
      granted: true,
      source: "banner",
      ipHash: "ip",
      uaHash: "ua",
    });
    expect(row.consent_type).toBe("affiliate_marketing");
    expect(row.granted).toBe(true);
  });
});
