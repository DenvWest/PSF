import type { PillarId } from "@/types/dashboard";

export type ReadoutPillarId = "energie" | "herstel";

export const READOUT_DRIVERS: Record<ReadoutPillarId, PillarId[]> = {
  energie: ["slaap", "voeding", "beweging"],
  herstel: ["slaap", "beweging", "stress"],
};

export function isReadoutDomain(pillar: PillarId): pillar is ReadoutPillarId {
  return pillar === "energie" || pillar === "herstel";
}

export function getReadoutDrivers(pillar: ReadoutPillarId): PillarId[] {
  return READOUT_DRIVERS[pillar];
}
