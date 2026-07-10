export type DailyLogState = {
  keys: string[];
  streak: number;
};

const CACHE_TTL_MS = 45_000;

const cache = new Map<string, { state: DailyLogState; expiresAt: number }>();

export function getCachedDailyLog(domain: string): DailyLogState | null {
  const entry = cache.get(domain);
  if (!entry || entry.expiresAt <= Date.now()) {
    if (entry) {
      cache.delete(domain);
    }
    return null;
  }
  return entry.state;
}

export function setCachedDailyLog(domain: string, state: DailyLogState): void {
  cache.set(domain, {
    state,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export function invalidateDailyLogCache(domain: string): void {
  cache.delete(domain);
}
