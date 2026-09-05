"use client";

import DomainReflectiePaneel from "@/components/dashboard/voortgang/DomainReflectiePaneel";

/** Voeding-P5 terugblik — dunne wrapper rond de gedeelde reflectie-lus. */
export default function NutritionReflectiePaneel({ surface }: { surface: string }) {
  return <DomainReflectiePaneel domain="voeding" surface={surface} />;
}
