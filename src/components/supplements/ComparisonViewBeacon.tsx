"use client";

import { useEffect, useRef } from "react";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import type { SupplementCategory } from "@/types/supplement";

type Props = {
  slug: string;
  category: SupplementCategory;
};

/**
 * Telt één weergave per vergelijkingspagina. Dit is de noemer onder de
 * affiliate-klik: zonder weergaves is "0 klikken" niet te onderscheiden van
 * "0 bezoekers", en wijst de readout in /admin/affiliate geen pagina aan.
 *
 * Server-side tellen kan niet — /beste/[supplement] is statisch gegenereerd.
 */
export function ComparisonViewBeacon({ slug, category }: Props) {
  const gemeten = useRef<string | null>(null);

  useEffect(() => {
    if (gemeten.current === slug) return;
    gemeten.current = slug;
    emitIntakeClientEvent("comparison.page_viewed", {
      slug,
      categorie: category,
    });
  }, [slug, category]);

  return null;
}
