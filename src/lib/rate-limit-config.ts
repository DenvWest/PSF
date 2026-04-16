type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

export type RateLimitRoute =
  | "contact"
  | "intake_session"
  | "intake_feedback"
  | "intake_reminder";

const PRODUCTION_LIMITS: Record<RateLimitRoute, RateLimitConfig> = {
  contact: { limit: 5, windowMs: 10 * 60 * 1000 },
  intake_session: { limit: 20, windowMs: 15 * 60 * 1000 },
  intake_feedback: { limit: 10, windowMs: 15 * 60 * 1000 },
  intake_reminder: { limit: 10, windowMs: 15 * 60 * 1000 },
};

const DEVELOPMENT_LIMITS: Record<RateLimitRoute, RateLimitConfig> = {
  contact: { limit: 1000, windowMs: 60 * 1000 },
  intake_session: { limit: 1000, windowMs: 60 * 1000 },
  intake_feedback: { limit: 1000, windowMs: 60 * 1000 },
  intake_reminder: { limit: 1000, windowMs: 60 * 1000 },
};

export function getRateLimitConfig(route: RateLimitRoute): RateLimitConfig {
  const isDev = process.env.NODE_ENV === "development";
  return isDev ? DEVELOPMENT_LIMITS[route] : PRODUCTION_LIMITS[route];
}

export function isWhitelistedIp(ip: string): boolean {
  if (!ip || ip === "unknown") {
    return false;
  }
  const raw = process.env.RATE_LIMIT_WHITELIST;
  if (!raw) {
    return false;
  }
  const whitelist = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return whitelist.includes(ip);
}
