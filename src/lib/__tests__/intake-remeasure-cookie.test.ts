import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  signRemeasureBaselineSessionId,
  verifyRemeasureBaselineCookie,
} from "@/lib/intake-remeasure-cookie";

const SESSION_ID = "00000000-0000-4000-8000-000000000001";

describe("intake-remeasure-cookie", () => {
  beforeEach(() => {
    process.env.COOKIE_SECRET = "test-cookie-secret-for-remeasure";
  });

  afterEach(() => {
    delete process.env.COOKIE_SECRET;
  });

  it("signs and verifies baseline session id", () => {
    const signed = signRemeasureBaselineSessionId(SESSION_ID);
    expect(signed).toBeTruthy();
    expect(verifyRemeasureBaselineCookie(signed!)).toBe(SESSION_ID);
  });

  it("rejects tampered cookie", () => {
    const signed = signRemeasureBaselineSessionId(SESSION_ID);
    expect(verifyRemeasureBaselineCookie(undefined)).toBeNull();
    expect(verifyRemeasureBaselineCookie("not-a-valid-cookie")).toBeNull();
    expect(verifyRemeasureBaselineCookie(signed!.replace("0", "1"))).toBeNull();
  });
});
