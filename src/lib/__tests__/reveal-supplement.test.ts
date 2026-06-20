import { describe, expect, it, vi } from "vitest";
import { buildRevealSupplementDisclosure, buildSupplementDisclosure } from "@/lib/reveal-supplement";
import { PILLAR } from "@/data/dashboard";

describe("buildSupplementDisclosure", () => {
  it("returns omega-3 disclosure for voeding priority", () => {
    const data = buildSupplementDisclosure(PILLAR.voeding);
    expect(data).not.toBeNull();
    expect(data?.name).toBe("Omega-3");
    expect(data?.comparisonPath).toBe("/beste/omega-3-supplement?from=results");
    expect(data?.onHold).toBe(false);
  });

  it("uses dashboard from param in comparison path", () => {
    const data = buildSupplementDisclosure(PILLAR.voeding, "dashboard");
    expect(data?.comparisonPath).toBe("/beste/omega-3-supplement?from=dashboard");
  });

  it("returns null for stress priority (leefstijl-only, no supplement CTA)", () => {
    expect(buildSupplementDisclosure(PILLAR.stress)).toBeNull();
  });

  it("returns null when pillar has no supplement", () => {
    expect(buildSupplementDisclosure(PILLAR.energie)).toBeNull();
  });

  it("returns null when supplement is disabled via killswitch", async () => {
    vi.resetModules();
    vi.doMock("@/lib/supplement-availability", () => ({
      isSupplementAvailable: () => false,
    }));
    const { buildSupplementDisclosure: buildWithKillswitch } = await import("@/lib/reveal-supplement");
    expect(buildWithKillswitch(PILLAR.slaap)).toBeNull();
    vi.resetModules();
  });
});

describe("buildRevealSupplementDisclosure", () => {
  it("delegates to buildSupplementDisclosure with results from param", () => {
    const data = buildRevealSupplementDisclosure(PILLAR.voeding);
    expect(data?.comparisonPath).toBe("/beste/omega-3-supplement?from=results");
  });
});
