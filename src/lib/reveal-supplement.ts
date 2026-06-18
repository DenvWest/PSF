import { PILLAR_COMPARISON_ROUTES } from "@/data/dashboard";
import { approvedClaims } from "@/data/approved-claims";
import type { SupplementDisclosureData } from "@/components/supplements/SupplementDisclosure";
import { isSupplementAvailable } from "@/lib/supplement-availability";
import type { Pillar } from "@/types/dashboard";

const QUALITY_RULE =
  "Kwaliteitskeuze op vorm en bron — niet het goedkoopste schap-potje";

const SUPPLEMENT_SLUG: Partial<Record<Pillar["id"], string>> = {
  slaap: "magnesium",
  stress: "ashwagandha",
  voeding: "omega-3-supplement",
};

function isSupplementOnHold(pillarId: Pillar["id"], supplementName: string): boolean {
  if (pillarId === "stress") {
    return true;
  }
  const key = supplementName.toLowerCase().split(/\s+/)[0];
  const entry = approvedClaims[key as keyof typeof approvedClaims];
  return entry?.status === "on_hold";
}

export function buildSupplementDisclosure(
  priority: Pillar,
  from: "results" | "dashboard" = "results",
): SupplementDisclosureData | null {
  const supplement = priority.supplement;
  const route = PILLAR_COMPARISON_ROUTES[priority.id];
  if (!supplement || !route) {
    return null;
  }

  const slug = SUPPLEMENT_SLUG[priority.id];
  if (slug && !isSupplementAvailable(slug)) {
    return null;
  }

  return {
    name: supplement.name,
    form: supplement.form,
    grade: supplement.grade,
    claim: supplement.claim,
    signal: supplement.signal,
    qualityRule: QUALITY_RULE,
    comparisonPath: `${route}?from=${from}`,
    onHold: isSupplementOnHold(priority.id, supplement.name),
  };
}

/** @deprecated Use buildSupplementDisclosure */
export function buildRevealSupplementDisclosure(
  priority: Pillar,
): SupplementDisclosureData | null {
  return buildSupplementDisclosure(priority, "results");
}
