import type { BrowserOptions, EdgeOptions, NodeOptions } from "@sentry/nextjs";
import { scrubSentryEvent } from "@/lib/sentry-scrub";

export function getSentryDsn(): string | undefined {
  const dsn = process.env.SENTRY_DSN?.trim();
  return dsn && dsn.length > 0 ? dsn : undefined;
}

export function isSentryEnabled(): boolean {
  return Boolean(getSentryDsn());
}

function getSharedOptions(): Pick<
  NodeOptions,
  "dsn" | "enabled" | "environment" | "tracesSampleRate" | "sendDefaultPii" | "beforeSend"
> {
  const dsn = getSentryDsn();
  return {
    dsn,
    enabled: Boolean(dsn),
    environment:
      process.env.SENTRY_ENVIRONMENT?.trim() ||
      process.env.NODE_ENV ||
      "development",
    tracesSampleRate: 0,
    sendDefaultPii: false,
    beforeSend: scrubSentryEvent,
  };
}

export function getSentryServerOptions(): NodeOptions {
  return getSharedOptions();
}

export function getSentryEdgeOptions(): EdgeOptions {
  return getSharedOptions();
}

export function getSentryClientOptions(): BrowserOptions {
  return getSharedOptions();
}
