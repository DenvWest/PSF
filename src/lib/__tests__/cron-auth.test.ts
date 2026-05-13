import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createHmac } from "crypto";
import { verifyCronRequest } from "@/lib/cron-auth";

const TEST_SECRET = "test-cron-secret-abc123";

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/cron/nurture", {
    method: "POST",
    headers,
  });
}

describe("verifyCronRequest", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", TEST_SECRET);
    vi.stubEnv("CRON_ALLOWED_IPS", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects when CRON_SECRET is not set", () => {
    vi.stubEnv("CRON_SECRET", "");
    const result = verifyCronRequest(makeRequest());
    expect(result.authorized).toBe(false);
    expect(result.error).toBe("CRON_SECRET ontbreekt");
  });

  it("authorizes valid bearer token", () => {
    const result = verifyCronRequest(
      makeRequest({ Authorization: `Bearer ${TEST_SECRET}` }),
    );
    expect(result.authorized).toBe(true);
  });

  it("rejects invalid bearer token", () => {
    const result = verifyCronRequest(
      makeRequest({ Authorization: "Bearer wrong-token" }),
    );
    expect(result.authorized).toBe(false);
  });

  it("authorizes valid HMAC signature", () => {
    const timestamp = Date.now().toString();
    const signature = createHmac("sha256", TEST_SECRET)
      .update(timestamp)
      .digest("hex");

    const result = verifyCronRequest(
      makeRequest({
        "x-cron-signature": signature,
        "x-cron-timestamp": timestamp,
      }),
    );
    expect(result.authorized).toBe(true);
  });

  it("rejects expired HMAC timestamp (> 5 min old)", () => {
    const oldTimestamp = (Date.now() - 6 * 60 * 1000).toString();
    const signature = createHmac("sha256", TEST_SECRET)
      .update(oldTimestamp)
      .digest("hex");

    const result = verifyCronRequest(
      makeRequest({
        "x-cron-signature": signature,
        "x-cron-timestamp": oldTimestamp,
      }),
    );
    expect(result.authorized).toBe(false);
    expect(result.error).toBe("Ongeldige HMAC signature");
  });

  it("rejects tampered HMAC signature", () => {
    const timestamp = Date.now().toString();
    const result = verifyCronRequest(
      makeRequest({
        "x-cron-signature": "deadbeef".repeat(8),
        "x-cron-timestamp": timestamp,
      }),
    );
    expect(result.authorized).toBe(false);
  });

  it("rejects request from non-allowed IP", () => {
    vi.stubEnv("CRON_ALLOWED_IPS", "10.0.0.1,10.0.0.2");
    const result = verifyCronRequest(
      makeRequest({
        Authorization: `Bearer ${TEST_SECRET}`,
        "x-forwarded-for": "192.168.1.100",
      }),
    );
    expect(result.authorized).toBe(false);
    expect(result.error).toBe("IP niet toegestaan");
  });

  it("allows request from allowed IP", () => {
    vi.stubEnv("CRON_ALLOWED_IPS", "10.0.0.1,192.168.1.100");
    const result = verifyCronRequest(
      makeRequest({
        Authorization: `Bearer ${TEST_SECRET}`,
        "x-forwarded-for": "192.168.1.100",
      }),
    );
    expect(result.authorized).toBe(true);
  });

  it("skips IP check when CRON_ALLOWED_IPS is empty", () => {
    vi.stubEnv("CRON_ALLOWED_IPS", "");
    const result = verifyCronRequest(
      makeRequest({ Authorization: `Bearer ${TEST_SECRET}` }),
    );
    expect(result.authorized).toBe(true);
  });

  it("rejects request with no auth headers at all", () => {
    const result = verifyCronRequest(makeRequest());
    expect(result.authorized).toBe(false);
  });
});
