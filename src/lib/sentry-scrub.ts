import type { ErrorEvent } from "@sentry/core";

const SENSITIVE_PATHS = [
  "/api/intake/session",
  "/api/intake/consent",
  "/api/account/waitlist",
  "/api/contact",
] as const;

const HEALTH_FIELD_PATTERNS = [
  "domain_scores",
  "symptom_profile",
  '"answers"',
  "marketing_email",
] as const;

const SENSITIVE_KEYS = new Set([
  "email",
  "firstname",
  "first_name",
  "marketing_email",
  "marketingemail",
  "cookie",
  "authorization",
  "set-cookie",
]);

const SENSITIVE_COOKIE_PREFIXES = [
  "psf_account",
  "psf_intake_sid",
  "psf_analytics",
] as const;

const REDACTED = "[redacted]";

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/-/g, "_");
}

function isSensitiveKey(key: string): boolean {
  const normalized = normalizeKey(key);
  if (SENSITIVE_KEYS.has(normalized)) {
    return true;
  }
  return SENSITIVE_COOKIE_PREFIXES.some((prefix) => normalized.includes(prefix));
}

function scrubString(value: string): string {
  let out = value;
  for (const prefix of SENSITIVE_COOKIE_PREFIXES) {
    const pattern = new RegExp(`${prefix}=[^;\\s]+`, "gi");
    out = out.replace(pattern, `${prefix}=${REDACTED}`);
  }
  return out;
}

function scrubValue(value: unknown): unknown {
  if (typeof value === "string") {
    return scrubString(value);
  }
  if (Array.isArray(value)) {
    return value.map(scrubValue);
  }
  if (value && typeof value === "object") {
    return scrubRecord(value as Record<string, unknown>);
  }
  return value;
}

function scrubRecord(record: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    out[key] = isSensitiveKey(key) ? REDACTED : scrubValue(value);
  }
  return out;
}

export function serializeEventBlob(event: ErrorEvent): string {
  try {
    return JSON.stringify({
      message: event.message,
      request: event.request,
      extra: event.extra,
      breadcrumbs: event.breadcrumbs,
      exception: event.exception,
    });
  } catch {
    return String(event.message ?? "");
  }
}

export function shouldDropSentryEvent(event: ErrorEvent): boolean {
  const url = event.request?.url ?? "";
  if (SENSITIVE_PATHS.some((path) => url.includes(path))) {
    return true;
  }
  const blob = serializeEventBlob(event);
  return HEALTH_FIELD_PATTERNS.some((pattern) => blob.includes(pattern));
}

function scrubRequest(event: ErrorEvent): void {
  if (!event.request) {
    return;
  }
  if (event.request.headers) {
    event.request.headers = scrubRecord(
      event.request.headers as Record<string, unknown>,
    ) as typeof event.request.headers;
  }
  if (typeof event.request.data === "string") {
    event.request.data = REDACTED;
  }
  if (event.request.query_string && typeof event.request.query_string === "string") {
    event.request.query_string = REDACTED;
  }
}

function scrubBreadcrumbs(event: ErrorEvent): void {
  if (!event.breadcrumbs) {
    return;
  }
  event.breadcrumbs = event.breadcrumbs.map((crumb) => {
    const data =
      crumb.data && typeof crumb.data === "object"
        ? scrubRecord(crumb.data as Record<string, unknown>)
        : crumb.data;
    const message =
      typeof crumb.message === "string" ? scrubString(crumb.message) : crumb.message;
    return { ...crumb, data, message };
  });
}

function scrubExtra(event: ErrorEvent): void {
  if (!event.extra || typeof event.extra !== "object") {
    return;
  }
  event.extra = scrubRecord(event.extra as Record<string, unknown>);
}

export function scrubSentryEvent(event: ErrorEvent): ErrorEvent | null {
  if (shouldDropSentryEvent(event)) {
    return null;
  }
  scrubRequest(event);
  scrubBreadcrumbs(event);
  scrubExtra(event);
  if (typeof event.message === "string") {
    event.message = scrubString(event.message);
  }
  return event;
}
