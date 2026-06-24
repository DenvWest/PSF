import { describe, expect, it } from "vitest";
import { PILLARS } from "@/data/dashboard";
import {
  DOMAIN_ROLE,
  getDomainRole,
  getReadoutDrivers,
  isInterventionDomain,
  isReadoutDomain,
  READOUT_DRIVERS,
  type ReadoutPillarId,
} from "@/lib/domain-role";
import type { PillarId } from "@/types/dashboard";

const INTERVENTION_IDS = new Set<PillarId>([
  "slaap",
  "stress",
  "voeding",
  "beweging",
]);
const READOUT_IDS: ReadoutPillarId[] = ["energie", "herstel"];

describe("domain-role", () => {
  it("DOMAIN_ROLE is exhaustief gedefinieerd voor elke PILLARS-id", () => {
    for (const p of PILLARS) {
      const role = DOMAIN_ROLE[p.id];
      expect(role === "intervention" || role === "readout").toBe(true);
    }
  });

  it("partitie: interventie = slaap/stress/voeding/beweging; readout = energie/herstel", () => {
    const interventionIds = PILLARS.filter(
      (p) => DOMAIN_ROLE[p.id] === "intervention",
    ).map((p) => p.id);
    const readoutIds = PILLARS.filter(
      (p) => DOMAIN_ROLE[p.id] === "readout",
    ).map((p) => p.id);

    expect(new Set(interventionIds)).toEqual(INTERVENTION_IDS);
    expect(new Set(readoutIds)).toEqual(new Set(READOUT_IDS));
  });

  it("getDomainRole/isReadoutDomain/isInterventionDomain zijn consistent met DOMAIN_ROLE", () => {
    for (const p of PILLARS) {
      const role = DOMAIN_ROLE[p.id];
      expect(getDomainRole(p.id)).toBe(role);
      expect(isReadoutDomain(p.id)).toBe(role === "readout");
      expect(isInterventionDomain(p.id)).toBe(role === "intervention");
    }
  });

  it("READOUT_DRIVERS: elke driver is een interventie-domein, niet het readout zelf", () => {
    for (const readoutId of READOUT_IDS) {
      const drivers = getReadoutDrivers(readoutId);
      expect(drivers.length).toBeGreaterThanOrEqual(1);
      expect(drivers).toEqual(READOUT_DRIVERS[readoutId]);

      for (const driver of drivers) {
        expect(isInterventionDomain(driver)).toBe(true);
        expect(driver).not.toBe(readoutId);
      }
    }
  });
});
