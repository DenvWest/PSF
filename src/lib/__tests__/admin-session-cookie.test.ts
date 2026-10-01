import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ADMIN_SESSION_MAX_AGE_SECONDS,
  signAdminCookie,
  verifyAdminCookie,
} from "@/lib/admin-session-cookie";
import {
  getAdminTotpSecret,
  isAdminTotpEnabled,
  verifyAdminPassword,
} from "@/lib/admin-auth";

describe("admin-session-cookie", () => {
  beforeEach(() => {
    process.env.ADMIN_SECRET = "test-admin-secret";
  });

  afterEach(() => {
    delete process.env.ADMIN_SECRET;
  });

  it("geldige roundtrip geeft admin terug", () => {
    const token = signAdminCookie();
    expect(token).toBeTruthy();
    expect(verifyAdminCookie(token!)).toBe("admin");
  });

  it("gemanipuleerde sig geeft null", () => {
    const token = signAdminCookie()!;
    const parts = token.split(".");
    const sig = parts[2]!;
    parts[2] = sig.slice(0, -1) + (sig.slice(-1) === "a" ? "b" : "a");
    expect(verifyAdminCookie(parts.join("."))).toBeNull();
  });

  it("verlopen token (> 12 uur) geeft null", () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const expiredIssuedAt = nowSec - ADMIN_SESSION_MAX_AGE_SECONDS - 1;
    const token = signAdminCookie("admin", expiredIssuedAt);
    expect(token).toBeTruthy();
    expect(verifyAdminCookie(token!)).toBeNull();
  });

  it("toekomstige issuedAt geeft null", () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const futureIssuedAt = nowSec + 3600;
    const token = signAdminCookie("admin", futureIssuedAt);
    expect(token).toBeTruthy();
    expect(verifyAdminCookie(token!)).toBeNull();
  });

  it("oud raw-secret formaat geeft null", () => {
    expect(verifyAdminCookie("test-admin-secret")).toBeNull();
  });
});

describe("verifyAdminPassword", () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = "correct-password";
  });

  afterEach(() => {
    delete process.env.ADMIN_PASSWORD;
  });

  it("accepteert correct wachtwoord", () => {
    expect(verifyAdminPassword("correct-password", "correct-password")).toBe(true);
  });

  it("weigert incorrect wachtwoord", () => {
    expect(verifyAdminPassword("wrong-password", "correct-password")).toBe(false);
  });

  it("vergelijkt via hash zonder length leak op verschillende lengtes", () => {
    expect(verifyAdminPassword("short", "correct-password")).toBe(false);
    expect(verifyAdminPassword("much-longer-than-expected", "correct-password")).toBe(
      false,
    );
  });
});

describe("admin TOTP-configuratie (audit N8)", () => {
  afterEach(() => {
    delete process.env.ADMIN_TOTP_SECRET;
  });

  it("is uit zolang ADMIN_TOTP_SECRET niet gezet is (geen breaking change)", () => {
    delete process.env.ADMIN_TOTP_SECRET;
    expect(getAdminTotpSecret()).toBeUndefined();
    expect(isAdminTotpEnabled()).toBe(false);
  });

  it("is aan zodra ADMIN_TOTP_SECRET gezet is", () => {
    process.env.ADMIN_TOTP_SECRET = "JBSWY3DPEHPK3PXP";
    expect(getAdminTotpSecret()).toBe("JBSWY3DPEHPK3PXP");
    expect(isAdminTotpEnabled()).toBe(true);
  });

  it("behandelt een lege string als niet-geconfigureerd", () => {
    process.env.ADMIN_TOTP_SECRET = "   ";
    expect(getAdminTotpSecret()).toBeUndefined();
    expect(isAdminTotpEnabled()).toBe(false);
  });
});
