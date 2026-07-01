import type { MeasuredPillarId } from "@/lib/primary-theme";

export const DOMAIN_CHECKIN: Record<MeasuredPillarId, { href: string; label: string }> = {
  sleep: { href: "/intake/slaap", label: "slaap" },
  stress: { href: "/intake/stress", label: "stress" },
  nutrition: { href: "/intake/voeding", label: "voeding" },
  movement: { href: "/intake/beweging", label: "beweging" },
  connection: { href: "/inzichten", label: "verbinding" },
};

export const PRIMARY_REASON: Record<MeasuredPillarId, string> = {
  nutrition:
    "Zonder een stevige voedingsbasis (genoeg eiwit en micronutrienten) werkt elke andere stap minder goed.",
  stress:
    "Bij aanhoudende stress is eerst rust en herstel zinvoller dan er beweging of supplementen bovenop.",
  sleep:
    "Slaap is het herstelvenster waar al je andere stappen op leunen — daarom eerst hier.",
  movement:
    "Met je basis op orde is beweging de hefboom die kracht, energie en stofwisseling terugbrengt.",
  connection:
    "Sociale steun draagt je veerkracht — begin klein met één betekenisvol contactmoment per week.",
};
