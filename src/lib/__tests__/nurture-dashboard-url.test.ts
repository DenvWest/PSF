import { describe, it, expect, vi } from "vitest";
import {
  NURTURE_DAY0_DASHBOARD_REF,
  resolveNurtureDashboardUrl,
} from "@/lib/nurture-dashboard-url";

vi.mock("@/lib/public-site-url", () => ({
  getPublicSiteUrl: () => "https://www.perfectsupplement.nl",
}));

describe("resolveNurtureDashboardUrl", () => {
  it("geeft login-URL met from=intake en ref zonder account", () => {
    expect(resolveNurtureDashboardUrl(false)).toBe(
      `https://www.perfectsupplement.nl/account/login?from=intake&ref=${NURTURE_DAY0_DASHBOARD_REF}`,
    );
  });

  it("geeft dashboard-URL met ref bij account", () => {
    expect(resolveNurtureDashboardUrl(true)).toBe(
      `https://www.perfectsupplement.nl/dashboard?ref=${NURTURE_DAY0_DASHBOARD_REF}`,
    );
  });
});
