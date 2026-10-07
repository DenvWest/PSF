"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/ga4";
import { keuzeTerugHref, leesKeuzeHerkomst, stofLabel } from "@/lib/keuze-product-keuze";
import { categorieInZin } from "@/lib/supplement-hub/hub-link";

/**
 * De weg terug naar het dashboard, alleen als je via Keuze op deze
 * productpagina kwam (`?van=keuze&stof=…`). Zonder die herkomst rendert hij
 * niets: een bezoeker uit Google heeft geen keuze om naar terug te gaan.
 */
export default function TerugNaarKeuze({
  slug,
  catalogusHref,
  categorieLabel,
}: {
  slug: string;
  catalogusHref: string;
  categorieLabel: string;
}) {
  const stof = leesKeuzeHerkomst(useSearchParams());
  if (!stof) return null;

  return (
    <nav aria-label="Terug naar je dashboard" className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
      <Link
        href={keuzeTerugHref(stof)}
        onClick={() => trackEvent("keuze_terug_van_product", { nutrient: stof, product: slug })}
        className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-800 no-underline transition-colors hover:border-ps-green hover:text-ps-green"
      >
        ← Terug naar je keuze · {stofLabel(stof)}
      </Link>
      <Link
        href={catalogusHref}
        onClick={() => trackEvent("keuze_product_naar_catalogus", { nutrient: stof, product: slug })}
        className="text-sm font-semibold text-ps-green no-underline transition-colors hover:text-ps-green-hover"
      >
        Alle {categorieInZin(categorieLabel)}-producten met PS-Score →
      </Link>
    </nav>
  );
}
