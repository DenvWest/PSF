"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/ga4";
import { keuzeTerugHref, leesKeuzeHerkomst, stofLabel } from "@/lib/keuze-product-keuze";
import { categorieInZin } from "@/lib/supplement-hub/hub-link";

/**
 * De weg terug naar het dashboard, alleen als je via Keuze op deze pagina
 * kwam (`?van=keuze&stof=…`) — op de productpagina, de catalogus
 * (`/supplementen`) en de prijsvergelijking (`/beste/*`). Zonder die herkomst
 * rendert hij niets: een bezoeker uit Google heeft geen keuze om naar terug
 * te gaan.
 *
 * Bovenaan staat hij als knop. Op mobiel komt er, zodra die knop uit beeld
 * scrolt, een zwevende knop linksonder bij — op `/beste/*` boven de vaste
 * koopbalk (`boven`), zodat ze niet over elkaar vallen.
 */
export default function TerugNaarKeuze({
  surface,
  slug,
  catalogusHref,
  categorieLabel,
  boven = false,
}: {
  surface: "product" | "supplementen" | "beste";
  slug?: string;
  catalogusHref?: string;
  categorieLabel?: string;
  boven?: boolean;
}) {
  const stof = leesKeuzeHerkomst(useSearchParams());
  const anker = useRef<HTMLElement>(null);
  const [uitBeeld, setUitBeeld] = useState(false);

  useEffect(() => {
    const element = anker.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setUitBeeld(!entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, [stof]);

  if (!stof) return null;

  const href = keuzeTerugHref(stof);
  const klik = (plek: "boven" | "zwevend") =>
    trackEvent("keuze_terug_van_product", { nutrient: stof, surface, plek, ...(slug ? { product: slug } : {}) });

  return (
    <>
      <nav ref={anker} aria-label="Terug naar je dashboard" className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          href={href}
          onClick={() => klik("boven")}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-stone-900 px-4 text-sm font-semibold text-white no-underline transition-colors hover:bg-stone-800"
        >
          ← Terug naar je keuze · {stofLabel(stof)}
        </Link>
        {catalogusHref && categorieLabel ? (
          <Link
            href={catalogusHref}
            onClick={() => trackEvent("keuze_product_naar_catalogus", { nutrient: stof, ...(slug ? { product: slug } : {}) })}
            className="text-sm font-semibold text-ps-green no-underline transition-colors hover:text-ps-green-hover"
          >
            Alle {categorieInZin(categorieLabel)}-producten met PS-Score →
          </Link>
        ) : null}
      </nav>

      {uitBeeld ? (
        <Link
          href={href}
          onClick={() => klik("zwevend")}
          aria-label={`Terug naar je keuze · ${stofLabel(stof)}`}
          className={`fixed left-4 z-40 inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-stone-900 px-4 text-sm font-semibold text-white no-underline shadow-lg md:hidden ${
            boven
              ? "bottom-[calc(6.5rem+env(safe-area-inset-bottom,0px))]"
              : "bottom-[calc(1rem+env(safe-area-inset-bottom,0px))]"
          }`}
        >
          ← Je keuze
        </Link>
      ) : null}
    </>
  );
}
