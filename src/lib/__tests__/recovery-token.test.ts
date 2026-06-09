import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { buildRecoveryUrl } from "@/lib/recovery-token";

describe("buildRecoveryUrl", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.perfectsupplement.nl";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it("includes mode=remeasure when requested", () => {
    const url = buildRecoveryUrl("abc123", { mode: "remeasure" });
    expect(url).toContain("mode=remeasure");
    expect(url).toContain("token=abc123");
  });

  it("omits mode for view recovery", () => {
    const url = buildRecoveryUrl("abc123");
    expect(url).not.toContain("mode=");
  });
});
