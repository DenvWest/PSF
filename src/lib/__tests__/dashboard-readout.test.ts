import { describe, expect, it } from "vitest";
import { getReadoutPresentation } from "@/lib/dashboard-readout";
import { PILLAR_CHECKIN_ROUTES } from "@/data/dashboard";

describe("getReadoutPresentation", () => {
  it("energie: drivers en primary CTA naar slaap", () => {
    const result = getReadoutPresentation("energie");
    expect(result.driverLabels).toEqual(["Slaap", "Voeding", "Beweging"]);
    expect(result.primaryCta?.pillarId).toBe("slaap");
    expect(result.primaryCta?.route).toBe("/intake/slaap");
    expect(result.primaryCta?.label).toBe("Slaap");
  });

  it("herstel: drivers en primary CTA met check-in-route", () => {
    const result = getReadoutPresentation("herstel");
    expect(result.driverLabels[0]).toBe("Slaap");
    expect(result.primaryCta).not.toBeNull();
    expect(Object.values(PILLAR_CHECKIN_ROUTES)).toContain(result.primaryCta?.route);
  });

  it("elke readout heeft een primary CTA (drivers zijn interventies)", () => {
    expect(getReadoutPresentation("energie").primaryCta).not.toBeNull();
    expect(getReadoutPresentation("herstel").primaryCta).not.toBeNull();
  });
});
