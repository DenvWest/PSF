import type { MeasuredPillarId } from "@/lib/primary-theme";
import type { PillarId } from "@/types/dashboard";

export const MEASURED_DOMAIN_TO_PILLAR: Record<MeasuredPillarId, PillarId> = {
  sleep: "slaap",
  stress: "stress",
  nutrition: "voeding",
  movement: "beweging",
};
