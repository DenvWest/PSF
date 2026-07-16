import { describe, expect, it } from "vitest";
import type { ErrorEvent } from "@sentry/core";
import {
  scrubSentryEvent,
  shouldDropSentryEvent,
} from "@/lib/sentry-scrub";

function makeEvent(partial: Partial<ErrorEvent> = {}): ErrorEvent {
  return {
    event_id: "test",
    platform: "node",
    timestamp: Date.now() / 1000,
    ...partial,
  } as ErrorEvent;
}

describe("sentry-scrub", () => {
  it("dropt events van gevoelige intake-session route", () => {
    const event = makeEvent({
      request: { url: "https://perfectsupplement.nl/api/intake/session" },
    });
    expect(shouldDropSentryEvent(event)).toBe(true);
    expect(scrubSentryEvent(event)).toBeNull();
  });

  it("laat generieke serverfouten door", () => {
    const event = makeEvent({
      message: "Internal server error",
      request: { url: "https://perfectsupplement.nl/api/health" },
    });
    expect(shouldDropSentryEvent(event)).toBe(false);
    expect(scrubSentryEvent(event)).not.toBeNull();
  });

  it("dropt events met health-velden in payload", () => {
    const event = makeEvent({
      extra: { snapshot: { domain_scores: { sleep_score: 40 } } },
    });
    expect(shouldDropSentryEvent(event)).toBe(true);
  });

  it("scrubt e-mail en cookies uit extra en headers", () => {
    const event = makeEvent({
      request: {
        url: "https://perfectsupplement.nl/dashboard",
        headers: {
          cookie: "psf_account=secret; psf_analytics_consent=1",
        },
      },
      extra: {
        email: "user@example.com",
        route: "dashboard",
      },
    });
    const scrubbed = scrubSentryEvent(event);
    expect(scrubbed).not.toBeNull();
    expect(scrubbed?.extra?.email).toBe("[redacted]");
    expect(scrubbed?.extra?.route).toBe("dashboard");
    expect(scrubbed?.request?.headers?.cookie).toBe("[redacted]");
  });
});
