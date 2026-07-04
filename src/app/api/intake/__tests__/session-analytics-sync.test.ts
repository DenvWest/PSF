import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("intake session analytics sync", () => {
  it("zet zowel httpOnly consent als client state cookie bij submit", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/api/intake/session/route.ts"),
      "utf8",
    );
    expect(source).toContain("applyAnalyticsConsentCookie(res, consent.anonymousAnalytics)");
    expect(source).toContain(
      "applyAnalyticsConsentStateCookie(res, consent.anonymousAnalytics)",
    );
  });
});
