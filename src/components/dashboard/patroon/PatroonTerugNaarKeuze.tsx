"use client";

import Link from "next/link";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import { gaNaarDashboard } from "@/lib/dagboek-deeplink";
import { trackEvent } from "@/lib/ga4";
import { keuzeTerugHref, stofLabel } from "@/lib/keuze-product-keuze";
import { periodeLabel, type Periode } from "@/lib/nutrition-periode";

/**
 * De weg terug naar Keuze, alleen als je via Keuze in Patroon kwam
 * (`&van=keuze`). Hij legt uit waarom je hier bent: Patroon is het bewijs bij
 * je keuze. Zodra je zelf een andere stof of sectie kiest, verdwijnt hij.
 */
export default function PatroonTerugNaarKeuze({ stof, periode }: { stof: NutrientId; periode: Periode }) {
  const href = keuzeTerugHref(stof);
  const naam = stofLabel(stof).toLowerCase();

  return (
    <aside
      aria-label="Terug naar Keuze"
      className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-[12px] border border-dashed border-[var(--vd-line-2)] px-3 py-2"
    >
      <p className="m-0 min-w-0 flex-1 basis-60 text-[0.75rem] leading-relaxed text-[var(--vd-ink-2)]">
        Je kwam van Keuze · {stofLabel(stof)}. Hier zie je je {naam} {periodeLabel(periode).toLowerCase()}, als bewijs
        bij wat je kiest.
      </p>
      <Link
        href={href}
        onClick={(event) => {
          event.preventDefault();
          trackEvent("patroon_terug_naar_keuze", { nutrient: stof });
          gaNaarDashboard(href);
        }}
        className="inline-flex min-h-[44px] items-center gap-1.5 text-[0.8125rem] font-semibold text-[var(--vd-sage-2)] no-underline hover:underline"
      >
        <span aria-hidden>←</span> Terug naar Keuze
      </Link>
    </aside>
  );
}
