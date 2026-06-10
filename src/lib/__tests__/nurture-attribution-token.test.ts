import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildNurtureAttributionToken,
  resolveNurtureAttributionToken,
} from "@/lib/nurture-attribution-token";

const TEST_PAYLOAD = {
  sessionId: "test-session-uuid-123",
  sequenceDay: 14,
  profileLabel: "Onrustige Slaper",
};

describe("nurture-attribution-token: round-trip", () => {
  beforeEach(() => {
    process.env.COOKIE_SECRET = "test-secret-32-bytes-long-enough!!";
    delete process.env.NURTURE_ATTRIBUTION_SECRET;
  });

  afterEach(() => {
    delete process.env.COOKIE_SECRET;
    delete process.env.NURTURE_ATTRIBUTION_SECRET;
  });

  it("build → resolve geeft oorspronkelijke payload terug", () => {
    const token = buildNurtureAttributionToken(TEST_PAYLOAD);
    expect(token).toBeTruthy();

    const result = resolveNurtureAttributionToken(token);
    expect(result).not.toBeNull();
    expect(result!.sessionId).toBe(TEST_PAYLOAD.sessionId);
    expect(result!.sequenceDay).toBe(TEST_PAYLOAD.sequenceDay);
    expect(result!.profileLabel).toBe(TEST_PAYLOAD.profileLabel);
  });

  it("token is opaque (bevat geen leesbare session_id in de string)", () => {
    const token = buildNurtureAttributionToken(TEST_PAYLOAD);
    expect(token).not.toContain(TEST_PAYLOAD.sessionId);
  });

  it("NURTURE_ATTRIBUTION_SECRET heeft voorrang boven COOKIE_SECRET", () => {
    process.env.NURTURE_ATTRIBUTION_SECRET = "nurture-specific-secret-32chars!";

    const token = buildNurtureAttributionToken(TEST_PAYLOAD);
    const result = resolveNurtureAttributionToken(token);
    expect(result).not.toBeNull();
    expect(result!.sessionId).toBe(TEST_PAYLOAD.sessionId);
  });

  it("token met verkeerd secret → null", () => {
    const token = buildNurtureAttributionToken(TEST_PAYLOAD);

    process.env.COOKIE_SECRET = "different-secret-32-bytes-long!!";
    const result = resolveNurtureAttributionToken(token);
    expect(result).toBeNull();
  });

  it("gemanipuleerde payload → null", () => {
    const token = buildNurtureAttributionToken(TEST_PAYLOAD);
    const parts = token.split(".");
    // Verander één karakter in de body
    parts[1] = parts[1]!.slice(0, -1) + (parts[1]!.slice(-1) === "A" ? "B" : "A");
    const tampered = parts.join(".");
    expect(resolveNurtureAttributionToken(tampered)).toBeNull();
  });

  it("leeg token → null", () => {
    expect(resolveNurtureAttributionToken("")).toBeNull();
  });

  it("ongeldig formaat → null", () => {
    expect(resolveNurtureAttributionToken("not.a.valid.token.format")).toBeNull();
    expect(resolveNurtureAttributionToken("v1.onlyone")).toBeNull();
  });

  it("verkeerde versie → null", () => {
    const token = buildNurtureAttributionToken(TEST_PAYLOAD);
    const parts = token.split(".");
    const wrongVersion = "v0." + parts.slice(1).join(".");
    expect(resolveNurtureAttributionToken(wrongVersion)).toBeNull();
  });
});

describe("nurture-attribution-token: expiry", () => {
  beforeEach(() => {
    process.env.COOKIE_SECRET = "test-secret-32-bytes-long-enough!!";
  });

  afterEach(() => {
    delete process.env.COOKIE_SECRET;
  });

  it("verlopen token (gemockte tijd) → null", () => {
    const now = Date.now();

    // Bouw een token aan met exp in het verleden
    vi.spyOn(Date, "now").mockReturnValueOnce(now - 61 * 24 * 60 * 60 * 1000);
    const expiredToken = buildNurtureAttributionToken(TEST_PAYLOAD);

    // Resolve met huidige tijd
    vi.spyOn(Date, "now").mockReturnValue(now);
    const result = resolveNurtureAttributionToken(expiredToken);
    expect(result).toBeNull();

    vi.restoreAllMocks();
  });

  it("geldig token (tijd nog niet verlopen) → payload", () => {
    const token = buildNurtureAttributionToken(TEST_PAYLOAD);
    const result = resolveNurtureAttributionToken(token);
    expect(result).not.toBeNull();
    expect(result!.sessionId).toBe(TEST_PAYLOAD.sessionId);
  });
});

describe("nurture-attribution-token: geen secret geconfigureerd", () => {
  beforeEach(() => {
    delete process.env.COOKIE_SECRET;
    delete process.env.NURTURE_ATTRIBUTION_SECRET;
  });

  it("buildNurtureAttributionToken geeft lege string als geen secret", () => {
    const token = buildNurtureAttributionToken(TEST_PAYLOAD);
    expect(token).toBe("");
  });

  it("resolveNurtureAttributionToken geeft null als geen secret", () => {
    expect(resolveNurtureAttributionToken("v1.some.token")).toBeNull();
  });
});

describe("nurture-attribution-token: affiliate.click payload-veiligheid", () => {
  beforeEach(() => {
    process.env.COOKIE_SECRET = "test-secret-32-bytes-long-enough!!";
  });

  afterEach(() => {
    delete process.env.COOKIE_SECRET;
  });

  it("payload bevat geen PII (geen email, geen naam)", () => {
    const token = buildNurtureAttributionToken({
      sessionId: "session-uuid",
      sequenceDay: 21,
      profileLabel: "Stressdrager",
    });
    const result = resolveNurtureAttributionToken(token);
    expect(result).not.toBeNull();

    const keys = Object.keys(result!);
    const ALLOWED = new Set(["sessionId", "sequenceDay", "profileLabel"]);
    for (const key of keys) {
      expect(ALLOWED.has(key), `Onverwachte sleutel: ${key}`).toBe(true);
    }
  });

  it("alle sequence_days werken correct", () => {
    for (const day of [0, 3, 7, 14, 21, 30]) {
      const token = buildNurtureAttributionToken({
        sessionId: "session-uuid",
        sequenceDay: day,
        profileLabel: "Lage Batterij",
      });
      const result = resolveNurtureAttributionToken(token);
      expect(result).not.toBeNull();
      expect(result!.sequenceDay).toBe(day);
    }
  });
});
