import { describe, expect, it } from "vitest";
import { gateAdviceSupplements } from "@/lib/intake-strategy";
import type { AdviceResult } from "@/lib/intake-engine";

describe("gateAdviceSupplements", () => {
  it("filtert on_hold /beste-links weg, behoudt approved en niet-/beste links", () => {
    const advice: AdviceResult = {
      quickWins: [],
      longTerm: [],
      supplements: [
        { name: "Magnesium glycinaat", reason: "reden", link: "/beste/magnesium" },
        { name: "Ashwagandha", reason: "reden", link: "/beste/ashwagandha" },
        { name: "Losse tip", reason: "reden", link: "/energie-na-40" },
      ],
    };

    const gated = gateAdviceSupplements(advice);

    expect(gated.supplements.map((s) => s.name)).toEqual([
      "Magnesium glycinaat",
      "Losse tip",
    ]);
  });
});
