import { describe, expect, it, beforeEach } from "vitest";
import {
  applyMarketingConsentStateCookie,
  signMarketingConsentFlag,
  verifyMarketingConsentCookie,
} from "@/lib/marketing-consent";
import { NextResponse } from "next/server";

describe("marketing-consent", () => {
  beforeEach(() => {
    process.env.COOKIE_SECRET = "test-cookie-secret";
  });

  it("signeert en verifieert grant", () => {
    const signed = signMarketingConsentFlag(true);
    expect(signed).toBeTruthy();
    expect(verifyMarketingConsentCookie(signed ?? undefined)).toBe(true);
  });

  it("zet marketing state cookie", () => {
    const res = NextResponse.json({ ok: true });
    applyMarketingConsentStateCookie(res, true);
    const setCookie = res.headers.getSetCookie?.() ?? [];
    expect(setCookie.some((c) => c.startsWith("psf_marketing_state=granted"))).toBe(true);
  });
});
