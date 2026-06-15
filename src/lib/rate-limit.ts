import { isWhitelistedIp } from "./rate-limit-config";
import { memoryRateLimitBackend } from "./rate-limit-memory";
import { createRedisRateLimitBackend } from "./rate-limit-redis";
import type { RateLimitBackend, RateLimitOptions, RateLimitResult } from "./rate-limit-types";

export type { RateLimitOptions, RateLimitResult } from "./rate-limit-types";

let backend: RateLimitBackend | null | undefined;
let memoryFallbackWarned = false;

function resolveBackend(): RateLimitBackend {
  if (backend !== undefined) {
    return backend ?? memoryRateLimitBackend;
  }

  const redisBackend = createRedisRateLimitBackend();
  if (redisBackend) {
    backend = redisBackend;
    return redisBackend;
  }

  backend = null;
  return memoryRateLimitBackend;
}

function warnMemoryFallback(): void {
  if (memoryFallbackWarned) {
    return;
  }
  memoryFallbackWarned = true;
  console.warn(
    "[rate-limit] Geen Redis-config — rate limiting is NIET cross-process veilig",
  );
}

export async function consumeRateLimit(
  key: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const activeBackend = resolveBackend();
  if (activeBackend === memoryRateLimitBackend) {
    warnMemoryFallback();
  }
  return activeBackend.consume(key, options);
}

export async function consumeRateLimitForIp(
  keyPrefix: string,
  ip: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  if (isWhitelistedIp(ip)) {
    return {
      allowed: true,
      remaining: Number.MAX_SAFE_INTEGER,
      retryAfterSeconds: 0,
    };
  }
  return consumeRateLimit(`${keyPrefix}:${ip}`, options);
}

export function resetRateLimitBackendForTests(): void {
  backend = undefined;
  memoryFallbackWarned = false;
}
