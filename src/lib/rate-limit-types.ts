export type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export type RateLimitBackend = {
  consume(key: string, options: RateLimitOptions): Promise<RateLimitResult>;
};
