import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getRateLimitConfig, parseEnvRateLimit } from "@/lib/rate-limit-config";

describe("parseEnvRateLimit", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns default when env var is missing", () => {
    expect(parseEnvRateLimit("PARTNER_INTAKE_RATE_LIMIT", 30, 60_000)).toEqual({
      limit: 30,
      windowMs: 60_000,
    });
  });

  it("parses valid env override", () => {
    vi.stubEnv("PARTNER_INTAKE_RATE_LIMIT", "50");
    expect(parseEnvRateLimit("PARTNER_INTAKE_RATE_LIMIT", 30, 60_000)).toEqual({
      limit: 50,
      windowMs: 60_000,
    });
  });

  it("falls back to default on invalid env value", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("PARTNER_INTAKE_RATE_LIMIT", "not-a-number");

    expect(parseEnvRateLimit("PARTNER_INTAKE_RATE_LIMIT", 30, 60_000)).toEqual({
      limit: 30,
      windowMs: 60_000,
    });
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});

describe("getRateLimitConfig", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("applies PARTNER_INTAKE_RATE_LIMIT override in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PARTNER_INTAKE_RATE_LIMIT", "15");

    expect(getRateLimitConfig("partner_intake")).toEqual({
      limit: 15,
      windowMs: 60_000,
    });
  });

  it("applies window override via PARTNER_INTAKE_RATE_LIMIT_WINDOW_MS", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PARTNER_INTAKE_RATE_LIMIT_WINDOW_MS", "120000");

    expect(getRateLimitConfig("partner_intake")).toEqual({
      limit: 30,
      windowMs: 120_000,
    });
  });
});
