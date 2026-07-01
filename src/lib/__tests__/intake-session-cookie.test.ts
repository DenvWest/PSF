import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createHmac } from "node:crypto";
import {
  signIntakeSessionId,
  verifySignedIntakeSessionCookie,
  INTAKE_COOKIE_MAX_AGE_SECONDS,
} from "@/lib/intake-session-cookie";

const SECRET = "test-cookie-secret";
const SID = "11111111-1111-4111-8111-111111111111";

describe("intake-session-cookie", () => {
  beforeEach(() => {
    vi.stubEnv("COOKIE_SECRET", SECRET);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sign→verify roundtrip is 3-delig met issued-at", () => {
    const signed = signIntakeSessionId(SID);
    expect(signed?.split(".")).toHaveLength(3);
    expect(verifySignedIntakeSessionCookie(signed!)).toBe(SID);
  });

  it("weigert een verlopen cookie", () => {
    const old =
      Math.floor(Date.now() / 1000) - INTAKE_COOKIE_MAX_AGE_SECONDS - 60;
    const signed = signIntakeSessionId(SID, old);
    expect(verifySignedIntakeSessionCookie(signed!)).toBeNull();
  });

  it("weigert een future-dated cookie buiten klok-skew", () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    const signed = signIntakeSessionId(SID, future);
    expect(verifySignedIntakeSessionCookie(signed!)).toBeNull();
  });

  it("weigert een getamperde signature", () => {
    const signed = signIntakeSessionId(SID)!;
    const tampered = signed.slice(0, -1) + (signed.endsWith("a") ? "b" : "a");
    expect(verifySignedIntakeSessionCookie(tampered)).toBeNull();
  });

  it("accepteert nog een legacy 2-delige cookie (grandfathered)", () => {
    const legacySig = createHmac("sha256", SECRET).update(SID).digest("hex");
    expect(verifySignedIntakeSessionCookie(`${SID}.${legacySig}`)).toBe(SID);
  });
});
