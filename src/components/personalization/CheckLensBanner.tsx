import { Suspense } from "react";
import CheckLens from "@/components/personalization/CheckLens";
import type { CheckLensTarget } from "@/lib/check-lens";

/**
 * Vervangt de kale terugkeerlink op gids- en profielpagina's: leest de zojuist
 * gemaakte leefstijlcheck en legt uit hoe déze pagina zich tot die uitkomst
 * verhoudt. Zonder `?from=intake` rendert hij niets, zodat koud verkeer geen
 * sessie-fetch triggert.
 */
export function CheckLensBanner({ target }: { target: CheckLensTarget }) {
  return (
    <Suspense fallback={null}>
      <CheckLens target={target} />
    </Suspense>
  );
}
