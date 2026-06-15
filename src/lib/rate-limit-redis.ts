import { Redis as UpstashRedis } from "@upstash/redis";
import Redis from "ioredis";
import type { RateLimitBackend, RateLimitResult } from "./rate-limit-types";

const REDIS_KEY_PREFIX = "rl:";

function buildDeniedResult(
  oldestScore: number | null,
  now: number,
  windowMs: number,
): RateLimitResult {
  const retryAfterMs =
    oldestScore != null ? Math.max(oldestScore + windowMs - now, 0) : windowMs;
  return {
    allowed: false,
    remaining: 0,
    retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
  };
}

const SLIDING_WINDOW_LUA = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local windowStart = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member = ARGV[4]
local ttlSeconds = tonumber(ARGV[5])

redis.call('ZREMRANGEBYSCORE', key, '-inf', windowStart)
local count = redis.call('ZCARD', key)

if count >= limit then
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  local oldestScore = 0
  if oldest[2] then
    oldestScore = tonumber(oldest[2])
  end
  return {0, count, oldestScore}
end

redis.call('ZADD', key, now, member)
redis.call('EXPIRE', key, ttlSeconds)
return {1, count + 1, 0}
`;

function parseEvalResult(
  raw: unknown,
  limit: number,
  now: number,
  windowMs: number,
): RateLimitResult {
  const result = raw as [number, number, number];
  const allowed = result[0] === 1;
  const count = result[1];
  const oldestScore = result[2] > 0 ? result[2] : null;

  if (!allowed) {
    return buildDeniedResult(oldestScore, now, windowMs);
  }

  return {
    allowed: true,
    remaining: Math.max(limit - count, 0),
    retryAfterSeconds: 0,
  };
}

function createUpstashBackend(url: string, token: string): RateLimitBackend {
  const client = new UpstashRedis({ url, token });

  return {
    async consume(key, options) {
      const now = Date.now();
      const windowStart = now - options.windowMs;
      const redisKey = `${REDIS_KEY_PREFIX}${key}`;
      const member = `${now}:${Math.random().toString(36).slice(2, 10)}`;
      const ttlSeconds = Math.ceil(options.windowMs / 1000) + 1;

      const raw = await client.eval(
        SLIDING_WINDOW_LUA,
        [redisKey],
        [now, windowStart, options.limit, member, ttlSeconds],
      );

      return parseEvalResult(raw, options.limit, now, options.windowMs);
    },
  };
}

function createIoredisBackend(redisUrl: string): RateLimitBackend {
  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });

  return {
    async consume(key, options) {
      const now = Date.now();
      const windowStart = now - options.windowMs;
      const redisKey = `${REDIS_KEY_PREFIX}${key}`;
      const member = `${now}:${Math.random().toString(36).slice(2, 10)}`;
      const ttlSeconds = Math.ceil(options.windowMs / 1000) + 1;

      const raw = await client.eval(
        SLIDING_WINDOW_LUA,
        1,
        redisKey,
        now,
        windowStart,
        options.limit,
        member,
        ttlSeconds,
      );

      return parseEvalResult(raw, options.limit, now, options.windowMs);
    },
  };
}

export function createRedisRateLimitBackend(): RateLimitBackend | null {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  const hasUpstashUrl = Boolean(upstashUrl);
  const hasUpstashToken = Boolean(upstashToken);

  if (hasUpstashUrl !== hasUpstashToken) {
    throw new Error(
      "[rate-limit] UPSTASH_REDIS_REST_URL en UPSTASH_REDIS_REST_TOKEN moeten beide gezet zijn of beide leeg.",
    );
  }

  if (hasUpstashUrl && hasUpstashToken) {
    return createUpstashBackend(upstashUrl!, upstashToken!);
  }

  const redisUrl = process.env.REDIS_URL?.trim();
  if (redisUrl) {
    if (!/^rediss?:\/\//i.test(redisUrl)) {
      throw new Error(
        "[rate-limit] REDIS_URL moet beginnen met redis:// of rediss://",
      );
    }
    return createIoredisBackend(redisUrl);
  }

  return null;
}
