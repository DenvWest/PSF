import { describe, expect, it } from "vitest";
import { getReadoutDrivers, isReadoutDomain, READOUT_DRIVERS } from "@/lib/domain-role";

describe("domain-role", () => {
  it("isReadoutDomain herkent energie en herstel", () => {
    expect(isReadoutDomain("energie")).toBe(true);
    expect(isReadoutDomain("herstel")).toBe(true);
    expect(isReadoutDomain("slaap")).toBe(false);
  });

  it("READOUT_DRIVERS mapt readouts naar interventie-drivers", () => {
    expect(READOUT_DRIVERS.energie).toEqual(["slaap", "voeding", "beweging"]);
    expect(READOUT_DRIVERS.herstel).toEqual(["slaap", "beweging", "stress"]);
  });

  it("getReadoutDrivers retourneert drivers per readout-pijler", () => {
    expect(getReadoutDrivers("energie")).toEqual(["slaap", "voeding", "beweging"]);
    expect(getReadoutDrivers("herstel")).toEqual(["slaap", "beweging", "stress"]);
  });
});
