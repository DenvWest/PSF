import { describe, it, expect } from "vitest";
import {
  normalizeRef,
  resolveAffiliateForRef,
} from "@/lib/affiliate/attribution";
import type { AffiliateStatus } from "@/types/affiliate";

function aff(
  over: Partial<{ id: string; ref: string; status: AffiliateStatus; archived_at: string | null }> = {},
) {
  return {
    id: "a1",
    ref: "jan",
    status: "active" as AffiliateStatus,
    archived_at: null as string | null,
    ...over,
  };
}

describe("normalizeRef", () => {
  it("trimt, lowercased en kapt af; leeg → null", () => {
    expect(normalizeRef("  Jan  ")).toBe("jan");
    expect(normalizeRef("")).toBeNull();
    expect(normalizeRef(null)).toBeNull();
    expect(normalizeRef(undefined)).toBeNull();
  });
});

describe("resolveAffiliateForRef", () => {
  const affiliates = [aff({ id: "a1", ref: "jan" }), aff({ id: "a2", ref: "piet" })];

  it("matcht een actieve affiliate (case-insensitief)", () => {
    expect(resolveAffiliateForRef("JAN", affiliates)?.id).toBe("a1");
    expect(resolveAffiliateForRef("piet", affiliates)?.id).toBe("a2");
  });

  it("geeft null bij geen match of lege ref", () => {
    expect(resolveAffiliateForRef("onbekend", affiliates)).toBeNull();
    expect(resolveAffiliateForRef("", affiliates)).toBeNull();
  });

  it("attribueert niet naar een gepauzeerde of beëindigde affiliate", () => {
    expect(resolveAffiliateForRef("jan", [aff({ ref: "jan", status: "paused" })])).toBeNull();
    expect(resolveAffiliateForRef("jan", [aff({ ref: "jan", status: "ended" })])).toBeNull();
  });

  it("attribueert niet naar een gearchiveerde affiliate", () => {
    expect(
      resolveAffiliateForRef("jan", [aff({ ref: "jan", archived_at: "2026-01-01T00:00:00Z" })]),
    ).toBeNull();
  });
});
