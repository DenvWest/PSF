import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { consumeRateLimitMemory } from "@/lib/rate-limit-memory";
import {
  consumeRateLimit,
  resetRateLimitBackendForTests,
} from "@/lib/rate-limit";

describe("consumeRateLimitMemory", () => {
  it("allows requests within the limit", () => {
    const options = { limit: 3, windowMs: 60_000 };
    const key = `test-${Date.now()}-allow`;

    for (let i = 0; i < 3; i += 1) {
      const result = consumeRateLimitMemory(key, options);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(3 - i - 1);
    }
  });

  it("blocks requests over the limit with retryAfterSeconds", () => {
    const options = { limit: 2, windowMs: 60_000 };
    const key = `test-${Date.now()}-block`;

    consumeRateLimitMemory(key, options);
    consumeRateLimitMemory(key, options);
    const blocked = consumeRateLimitMemory(key, options);

    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("expires timestamps outside the sliding window", () => {
    vi.useFakeTimers();
    const options = { limit: 1, windowMs: 1_000 };
    const key = "test-window-expiry";

    consumeRateLimitMemory(key, options);
    const blocked = consumeRateLimitMemory(key, options);
    expect(blocked.allowed).toBe(false);

    vi.advanceTimersByTime(1_001);

    const allowed = consumeRateLimitMemory(key, options);
    expect(allowed.allowed).toBe(true);

    vi.useRealTimers();
  });
});

describe("consumeRateLimit entrypoint", () => {
  beforeEach(() => {
    resetRateLimitBackendForTests();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.REDIS_URL;
  });

  afterEach(() => {
    resetRateLimitBackendForTests();
  });

  it("uses in-memory fallback when Redis is not configured", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const options = { limit: 2, windowMs: 60_000 };
    const key = `entry-${Date.now()}`;

    await consumeRateLimit(key, options);
    await consumeRateLimit(key, options);
    const blocked = await consumeRateLimit(key, options);

    expect(blocked.allowed).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith(
      "[rate-limit] Geen Redis-config — rate limiting is NIET cross-process veilig",
    );

    warnSpy.mockRestore();
  });

  it("throws when Upstash env vars are partially set", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    resetRateLimitBackendForTests();

    await expect(
      consumeRateLimit("key", { limit: 1, windowMs: 1000 }),
    ).rejects.toThrow("UPSTASH_REDIS_REST_URL en UPSTASH_REDIS_REST_TOKEN");
  });
});
