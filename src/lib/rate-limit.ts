type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type RateLimitStore = Map<string, number[]>;

declare global {
  var __rateLimitStore__: RateLimitStore | undefined;
}

function getStore(): RateLimitStore {
  if (!globalThis.__rateLimitStore__) {
    globalThis.__rateLimitStore__ = new Map<string, number[]>();
  }

  return globalThis.__rateLimitStore__;
}

export function consumeRateLimit(
  key: string,
  options: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - options.windowMs;
  const store = getStore();
  const existing = store.get(key) ?? [];
  const active = existing.filter((timestamp) => timestamp > windowStart);

  if (active.length >= options.limit) {
    const oldestActive = active[0];
    const retryAfterMs = Math.max(oldestActive + options.windowMs - now, 0);

    store.set(key, active);

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  active.push(now);
  store.set(key, active);

  return {
    allowed: true,
    remaining: Math.max(options.limit - active.length, 0),
    retryAfterSeconds: 0,
  };
}
