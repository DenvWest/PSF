"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/ga4";
import { keuzeTerugHref, leesKeuzeDeel, leesKeuzeHerkomst, stofLabel } from "@/lib/keuze-product-keuze";

/**
 * De weg terug naar het dashboard, alleen als je via Keuze op deze pagina
 * kwam (`?van=keuze&stof=…`) — op de productpagina, de catalogus
 * (`/supplementen`) en de prijsvergelijking (`/beste/*`). Zonder die herkomst
 * rendert hij niets: een bezoeker uit Google heeft geen keuze om naar terug
 * te gaan.
 *
 * Bovenaan staat hij als rustige tekstlink boven de koopkaart (één blok met die kaart). Op mobiel komt er, zodra die knop uit beeld
 * scrolt, een zwevende knop linksonder bij — op `/beste/*` boven de vaste
 * koopbalk (`boven`), zodat ze niet over elkaar vallen.
 */
export default function TerugNaarKeuze({
  surface,
  slug,
  boven = false,
}: {
  surface: "product" | "supplementen" | "beste";
  slug?: string;
  boven?: boolean;
}) {
  const zoek = useSearchParams();
  const stof = leesKeuzeHerkomst(zoek);
  const deel = leesKeuzeDeel(zoek);
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

  const href = keuzeTerugHref(stof, deel);
  const klik = (plek: "boven" | "zwevend") =>
    trackEvent("keuze_terug_van_product", { nutrient: stof, surface, plek, ...(slug ? { product: slug } : {}) });

  return (
    <>
      <nav ref={anker} aria-label="Terug naar je dashboard" className="mb-3">
        <Link
          href={href}
          onClick={() => klik("boven")}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-stone-700 no-underline transition-colors hover:text-stone-900"
        >
          <span aria-hidden="true">←</span> Terug naar {deel === "favorieten" ? "Mijn keuzes" : "je keuze"} · {stofLabel(stof)}
        </Link>
      </nav>

      {uitBeeld ? (
        <Link
          href={href}
          onClick={() => klik("zwevend")}
          aria-label={`Terug naar ${deel === "favorieten" ? "Mijn keuzes" : "je keuze"} · ${stofLabel(stof)}`}
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
