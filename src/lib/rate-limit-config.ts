type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

export type RateLimitRoute =
  | "contact"
  | "evidence_chat"
  | "intake_session"
  | "intake_log_read"
  | "intake_chat"
  | "intake_feedback"
  | "intake_reminder"
  | "thema_download"
  | "gids_opt_in"
  | "admin_auth"
  | "unsubscribe"
  | "thema_unsubscribe"
  | "partner_intake"
  | "partner_analytics"
  | "intake_consent_delete"
  | "admin_data"
  | "account_request_link"
  | "account_login_eligibility"
  | "account_verify"
  | "account_verify_code"
  | "account_claim"
  | "account_revoke";

const ENV_LIMIT_KEYS: Record<RateLimitRoute, string> = {
  contact: "CONTACT_RATE_LIMIT",
  evidence_chat: "EVIDENCE_CHAT_RATE_LIMIT",
  intake_session: "INTAKE_SESSION_RATE_LIMIT",
  intake_log_read: "INTAKE_LOG_READ_RATE_LIMIT",
  intake_chat: "INTAKE_CHAT_RATE_LIMIT",
  intake_feedback: "INTAKE_FEEDBACK_RATE_LIMIT",
  intake_reminder: "INTAKE_REMINDER_RATE_LIMIT",
  thema_download: "THEMA_DOWNLOAD_RATE_LIMIT",
  gids_opt_in: "GIDS_OPT_IN_RATE_LIMIT",
  admin_auth: "ADMIN_AUTH_RATE_LIMIT",
  unsubscribe: "UNSUBSCRIBE_RATE_LIMIT",
  thema_unsubscribe: "THEMA_UNSUBSCRIBE_RATE_LIMIT",
  partner_intake: "PARTNER_INTAKE_RATE_LIMIT",
  partner_analytics: "PARTNER_ANALYTICS_RATE_LIMIT",
  intake_consent_delete: "INTAKE_CONSENT_DELETE_RATE_LIMIT",
  admin_data: "ADMIN_DATA_RATE_LIMIT",
  account_request_link: "ACCOUNT_REQUEST_LINK_RATE_LIMIT",
  account_login_eligibility: "ACCOUNT_LOGIN_ELIGIBILITY_RATE_LIMIT",
  account_verify: "ACCOUNT_VERIFY_RATE_LIMIT",
  account_verify_code: "ACCOUNT_VERIFY_CODE_RATE_LIMIT",
  account_claim: "ACCOUNT_CLAIM_RATE_LIMIT",
  account_revoke: "ACCOUNT_REVOKE_RATE_LIMIT",
};

const ENV_WINDOW_KEYS: Record<RateLimitRoute, string> = {
  contact: "CONTACT_RATE_LIMIT_WINDOW_MS",
  evidence_chat: "EVIDENCE_CHAT_RATE_LIMIT_WINDOW_MS",
  intake_session: "INTAKE_SESSION_RATE_LIMIT_WINDOW_MS",
  intake_log_read: "INTAKE_LOG_READ_RATE_LIMIT_WINDOW_MS",
  intake_chat: "INTAKE_CHAT_RATE_LIMIT_WINDOW_MS",
  intake_feedback: "INTAKE_FEEDBACK_RATE_LIMIT_WINDOW_MS",
  intake_reminder: "INTAKE_REMINDER_RATE_LIMIT_WINDOW_MS",
  thema_download: "THEMA_DOWNLOAD_RATE_LIMIT_WINDOW_MS",
  gids_opt_in: "GIDS_OPT_IN_RATE_LIMIT_WINDOW_MS",
  admin_auth: "ADMIN_AUTH_RATE_LIMIT_WINDOW_MS",
  unsubscribe: "UNSUBSCRIBE_RATE_LIMIT_WINDOW_MS",
  thema_unsubscribe: "THEMA_UNSUBSCRIBE_RATE_LIMIT_WINDOW_MS",
  partner_intake: "PARTNER_INTAKE_RATE_LIMIT_WINDOW_MS",
  partner_analytics: "PARTNER_ANALYTICS_RATE_LIMIT_WINDOW_MS",
  intake_consent_delete: "INTAKE_CONSENT_DELETE_RATE_LIMIT_WINDOW_MS",
  admin_data: "ADMIN_DATA_RATE_LIMIT_WINDOW_MS",
  account_request_link: "ACCOUNT_REQUEST_LINK_RATE_LIMIT_WINDOW_MS",
  account_login_eligibility: "ACCOUNT_LOGIN_ELIGIBILITY_RATE_LIMIT_WINDOW_MS",
  account_verify: "ACCOUNT_VERIFY_RATE_LIMIT_WINDOW_MS",
  account_verify_code: "ACCOUNT_VERIFY_CODE_RATE_LIMIT_WINDOW_MS",
  account_claim: "ACCOUNT_CLAIM_RATE_LIMIT_WINDOW_MS",
  account_revoke: "ACCOUNT_REVOKE_RATE_LIMIT_WINDOW_MS",
};

const PRODUCTION_LIMITS: Record<RateLimitRoute, RateLimitConfig> = {
  contact: { limit: 5, windowMs: 10 * 60 * 1000 },
  evidence_chat: { limit: 20, windowMs: 15 * 60 * 1000 },
  intake_session: { limit: 20, windowMs: 15 * 60 * 1000 },
  intake_log_read: { limit: 60, windowMs: 15 * 60 * 1000 },
  intake_chat: { limit: 30, windowMs: 15 * 60 * 1000 },
  intake_feedback: { limit: 10, windowMs: 15 * 60 * 1000 },
  intake_reminder: { limit: 10, windowMs: 15 * 60 * 1000 },
  thema_download: { limit: 5, windowMs: 15 * 60 * 1000 },
  gids_opt_in: { limit: 5, windowMs: 15 * 60 * 1000 },
  admin_auth: { limit: 5, windowMs: 15 * 60 * 1000 },
  unsubscribe: { limit: 10, windowMs: 15 * 60 * 1000 },
  thema_unsubscribe: { limit: 10, windowMs: 15 * 60 * 1000 },
  partner_intake: { limit: 30, windowMs: 60 * 1000 },
  partner_analytics: { limit: 120, windowMs: 60 * 1000 },
  intake_consent_delete: { limit: 5, windowMs: 60 * 1000 },
  admin_data: { limit: 60, windowMs: 60 * 1000 },
  account_request_link: { limit: 5, windowMs: 15 * 60 * 1000 },
  account_login_eligibility: { limit: 20, windowMs: 15 * 60 * 1000 },
  account_verify: { limit: 30, windowMs: 15 * 60 * 1000 },
  account_verify_code: { limit: 6, windowMs: 15 * 60 * 1000 },
  account_claim: { limit: 20, windowMs: 15 * 60 * 1000 },
  account_revoke: { limit: 10, windowMs: 15 * 60 * 1000 },
};

const DEVELOPMENT_LIMITS: Record<RateLimitRoute, RateLimitConfig> = {
  contact: { limit: 1000, windowMs: 60 * 1000 },
  evidence_chat: { limit: 1000, windowMs: 60 * 1000 },
  intake_session: { limit: 1000, windowMs: 60 * 1000 },
  intake_log_read: { limit: 1000, windowMs: 60 * 1000 },
  intake_chat: { limit: 1000, windowMs: 60 * 1000 },
  intake_feedback: { limit: 1000, windowMs: 60 * 1000 },
  intake_reminder: { limit: 1000, windowMs: 60 * 1000 },
  thema_download: { limit: 1000, windowMs: 60 * 1000 },
  gids_opt_in: { limit: 1000, windowMs: 60 * 1000 },
  admin_auth: { limit: 1000, windowMs: 60 * 1000 },
  unsubscribe: { limit: 1000, windowMs: 60 * 1000 },
  thema_unsubscribe: { limit: 1000, windowMs: 60 * 1000 },
  partner_intake: { limit: 1000, windowMs: 60 * 1000 },
  partner_analytics: { limit: 1000, windowMs: 60 * 1000 },
  intake_consent_delete: { limit: 1000, windowMs: 60 * 1000 },
  admin_data: { limit: 1000, windowMs: 60 * 1000 },
  account_request_link: { limit: 1000, windowMs: 60 * 1000 },
  account_login_eligibility: { limit: 1000, windowMs: 60 * 1000 },
  account_verify: { limit: 1000, windowMs: 60 * 1000 },
  account_verify_code: { limit: 1000, windowMs: 60 * 1000 },
  account_claim: { limit: 1000, windowMs: 60 * 1000 },
  account_revoke: { limit: 1000, windowMs: 60 * 1000 },
};

export function parseEnvRateLimit(
  envVar: string,
  defaultLimit: number,
  defaultWindowMs: number,
): RateLimitConfig {
  const rawLimit = process.env[envVar]?.trim();
  let limit = defaultLimit;

  if (rawLimit) {
    const parsed = Number.parseInt(rawLimit, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      limit = parsed;
    } else {
      console.warn(
        `[rate-limit-config] Ongeldige waarde voor ${envVar}="${rawLimit}", fallback naar ${defaultLimit}`,
      );
    }
  }

  return { limit, windowMs: defaultWindowMs };
}

function applyEnvOverrides(
  route: RateLimitRoute,
  base: RateLimitConfig,
): RateLimitConfig {
  const limitKey = ENV_LIMIT_KEYS[route];
  const windowKey = ENV_WINDOW_KEYS[route];
  const withLimit = parseEnvRateLimit(limitKey, base.limit, base.windowMs);

  const rawWindow = process.env[windowKey]?.trim();
  if (!rawWindow) {
    return withLimit;
  }

  const parsedWindow = Number.parseInt(rawWindow, 10);
  if (Number.isFinite(parsedWindow) && parsedWindow > 0) {
    return { ...withLimit, windowMs: parsedWindow };
  }

  console.warn(
    `[rate-limit-config] Ongeldige waarde voor ${windowKey}="${rawWindow}", fallback naar ${base.windowMs}ms`,
  );
  return withLimit;
}

export function getRateLimitConfig(route: RateLimitRoute): RateLimitConfig {
  const isDev = process.env.NODE_ENV === "development";
  const base = isDev ? DEVELOPMENT_LIMITS[route] : PRODUCTION_LIMITS[route];
  return applyEnvOverrides(route, base);
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
