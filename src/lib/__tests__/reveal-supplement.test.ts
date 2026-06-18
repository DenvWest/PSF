import { describe, expect, it } from "vitest";
import { buildRevealSupplementDisclosure } from "@/lib/reveal-supplement";
import { PILLAR } from "@/data/dashboard";

describe("buildRevealSupplementDisclosure", () => {
  it("returns omega-3 disclosure for voeding priority", () => {
    const data = buildRevealSupplementDisclosure(PILLAR.voeding);
    expect(data).not.toBeNull();
    expect(data?.name).toBe("Omega-3");
    expect(data?.comparisonPath).toBe("/beste/omega-3-supplement?from=results");
    expect(data?.onHold).toBe(false);
  });

  it("returns on-hold ashwagandha for stress priority", () => {
    const data = buildRevealSupplementDisclosure(PILLAR.stress);
    expect(data).not.toBeNull();
    expect(data?.onHold).toBe(true);
    expect(data?.comparisonPath).toBe("/beste/ashwagandha?from=results");
  });

  it("returns null when pillar has no supplement", () => {
    expect(buildRevealSupplementDisclosure(PILLAR.energie)).toBeNull();
  });
});
