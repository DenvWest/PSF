import { PILLAR, PILLAR_CHECKIN_ROUTES } from "@/data/dashboard";
import { getReadoutDrivers, type ReadoutPillarId } from "@/lib/domain-role";
import type { PillarId } from "@/types/dashboard";

export type ReadoutDriverCta = { pillarId: PillarId; label: string; route: string };
export type ReadoutPresentation = {
  /** Driver-labels voor de "aangedreven door"-regel, bv. ["Slaap","Voeding","Beweging"]. */
  driverLabels: string[];
  /** Eerste driver met een check-in-route — de lever waar de gebruiker heen gaat. */
  primaryCta: ReadoutDriverCta | null;
};

export function getReadoutPresentation(pillar: ReadoutPillarId): ReadoutPresentation {
  const drivers = getReadoutDrivers(pillar);
  const driverLabels = drivers.map((d) => PILLAR[d].label);
  let primaryCta: ReadoutDriverCta | null = null;
  for (const d of drivers) {
    const route = PILLAR_CHECKIN_ROUTES[d];
    if (route) {
      primaryCta = { pillarId: d, label: PILLAR[d].label, route };
      break;
    }
  }
  return { driverLabels, primaryCta };
}
