import { PILLAR_COMPARISON_ROUTES } from "@/data/dashboard";
import { approvedClaims } from "@/data/approved-claims";
import type { SupplementDisclosureData } from "@/components/supplements/SupplementDisclosure";
import type { Pillar } from "@/types/dashboard";

const QUALITY_RULE =
  "Kwaliteitskeuze op vorm en bron — niet het goedkoopste schap-potje";

function isSupplementOnHold(pillarId: Pillar["id"], supplementName: string): boolean {
  if (pillarId === "stress") {
    return true;
  }
  const key = supplementName.toLowerCase().split(/\s+/)[0];
  const entry = approvedClaims[key as keyof typeof approvedClaims];
  return entry?.status === "on_hold";
}

export function buildRevealSupplementDisclosure(
  priority: Pillar,
): SupplementDisclosureData | null {
  const supplement = priority.supplement;
  const route = PILLAR_COMPARISON_ROUTES[priority.id];
  if (!supplement || !route) {
    return null;
  }

  return {
    name: supplement.name,
    form: supplement.form,
    grade: supplement.grade,
    claim: supplement.claim,
    signal: supplement.signal,
    qualityRule: QUALITY_RULE,
    comparisonPath: `${route}?from=results`,
    onHold: isSupplementOnHold(priority.id, supplement.name),
  };
}
