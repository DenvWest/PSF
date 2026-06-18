import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ACCOUNT_COOKIE_MAX_AGE_SECONDS,
  signAccountCookie,
  verifyAccountCookie,
} from "@/lib/account-session-cookie";

const TEST_ACCOUNT_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

describe("account-session-cookie", () => {
  beforeEach(() => {
    process.env.ACCOUNT_COOKIE_SECRET = "test-secret";
  });

  afterEach(() => {
    delete process.env.ACCOUNT_COOKIE_SECRET;
  });

  it("geldige roundtrip geeft id terug", () => {
    const token = signAccountCookie(TEST_ACCOUNT_ID);
    expect(token).toBeTruthy();
    expect(verifyAccountCookie(token!)).toBe(TEST_ACCOUNT_ID);
  });

  it("gemanipuleerde sig geeft null", () => {
    const token = signAccountCookie(TEST_ACCOUNT_ID)!;
    const parts = token.split(".");
    const sig = parts[2]!;
    parts[2] = sig.slice(0, -1) + (sig.slice(-1) === "a" ? "b" : "a");
    expect(verifyAccountCookie(parts.join("."))).toBeNull();
  });

  it("verlopen token (91 dagen) geeft null", () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const expiredIssuedAt = nowSec - 91 * 24 * 60 * 60;
    const token = signAccountCookie(TEST_ACCOUNT_ID, expiredIssuedAt);
    expect(token).toBeTruthy();
    expect(verifyAccountCookie(token!)).toBeNull();
  });

  it("toekomstige issuedAt (now + 1 uur) geeft null", () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const futureIssuedAt = nowSec + 3600;
    const token = signAccountCookie(TEST_ACCOUNT_ID, futureIssuedAt);
    expect(token).toBeTruthy();
    expect(verifyAccountCookie(token!)).toBeNull();
  });

  it("oud 2-delig formaat id.sig geeft null", () => {
    const secret = process.env.ACCOUNT_COOKIE_SECRET!;
    const oldSig = createHmac("sha256", secret).update(TEST_ACCOUNT_ID).digest("hex");
    const oldFormat = `${TEST_ACCOUNT_ID}.${oldSig}`;
    expect(verifyAccountCookie(oldFormat)).toBeNull();
  });

  it("niet-UUID geeft null", () => {
    expect(signAccountCookie("not-a-uuid")).toBeNull();

    const nowSec = Math.floor(Date.now() / 1000);
    const secret = process.env.ACCOUNT_COOKIE_SECRET!;
    const sig = createHmac("sha256", secret)
      .update(`not-a-uuid.${nowSec}`)
      .digest("hex");
    expect(verifyAccountCookie(`not-a-uuid.${nowSec}.${sig}`)).toBeNull();
  });
});

describe("account-session-cookie: max age constant", () => {
  it("ACCOUNT_COOKIE_MAX_AGE_SECONDS is 90 dagen", () => {
    expect(ACCOUNT_COOKIE_MAX_AGE_SECONDS).toBe(90 * 24 * 60 * 60);
  });
});
