import { describe, expect, it } from "vitest";
import {
  normalizeMarketingEmail,
  shouldSteerToDashboard,
} from "@/lib/intake-marketing-continuity";

describe("intake-marketing-continuity", () => {
  it("normalizes email for lookup", () => {
    expect(normalizeMarketingEmail("  Test@Example.com ")).toBe("test@example.com");
  });

  it("steers when main nurture or account is active", () => {
    expect(
      shouldSteerToDashboard({ mainNurtureActive: true, hasActiveAccount: false }),
    ).toBe(true);
    expect(
      shouldSteerToDashboard({ mainNurtureActive: false, hasActiveAccount: true }),
    ).toBe(true);
    expect(
      shouldSteerToDashboard({ mainNurtureActive: false, hasActiveAccount: false }),
    ).toBe(false);
  });
});
