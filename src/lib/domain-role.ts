import type { PillarId } from "@/types/dashboard";

/** Interventie = domein waar je op stuurt (heeft een leefstijlplan). Readout = uitkomst/rapport (zoals vitaliteit) die je afleest en die naar zijn drivers wijst. */
export type DomainRole = "intervention" | "readout";

export type ReadoutPillarId = "energie" | "herstel";
export type InterventionPillarId = Exclude<PillarId, ReadoutPillarId>;

export const DOMAIN_ROLE: Record<PillarId, DomainRole> = {
  slaap: "intervention",
  stress: "intervention",
  voeding: "intervention",
  beweging: "intervention",
  verbinding: "intervention",
  energie: "readout",
  herstel: "readout",
};

/** Per rapport-domein de interventie-domeinen die het aandrijven (editoriale start-mapping, verfijnbaar). */
export const READOUT_DRIVERS: Record<ReadoutPillarId, InterventionPillarId[]> = {
  energie: ["slaap", "voeding", "beweging"],
  herstel: ["slaap", "beweging", "stress"],
};

export function getDomainRole(pillar: PillarId): DomainRole {
  return DOMAIN_ROLE[pillar];
}

export function isReadoutDomain(pillar: PillarId): pillar is ReadoutPillarId {
  return DOMAIN_ROLE[pillar] === "readout";
}

export function isInterventionDomain(
  pillar: PillarId,
): pillar is InterventionPillarId {
  return DOMAIN_ROLE[pillar] === "intervention";
}

export function getReadoutDrivers(
  pillar: ReadoutPillarId,
): InterventionPillarId[] {
  return READOUT_DRIVERS[pillar];
}
