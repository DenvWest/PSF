"use client";

import Link from "next/link";
import { useState } from "react";
import OnderbouwingPanel from "@/components/supplement-hub/OnderbouwingPanel";
import { IntakeCtaMicro } from "@/components/common/IntakeCtaMicro";
import type { ThemaTag } from "@/data/supplement-hub/catalog";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";

export type GuideTocItem = {
  id: string;
  label: string;
};

type GuideSidebarProps = {
  items: GuideTocItem[];
  naam: string;
  slug: string;
  nadrukThemas: readonly ThemaTag[];
  vergelijking?: { href: string; linkLabel: string };
};

/**
 * De keuzekolom naast een gids: waar je bent in het stuk, of dit supplement bij
 * jou past, en de onderbouwing eronder. Zelfde rolverdeling als op de
 * catalogus — knoppen aan de zijkant, tekst in het midden.
 */
export default function GuideSidebar({
  items,
  naam,
  slug,
  nadrukThemas,
  vergelijking,
}: GuideSidebarProps) {
  const [tocOpen, setTocOpen] = useState(false);
  const naamKlein = naam.charAt(0).toLowerCase() + naam.slice(1);

  return (
    <aside
      aria-label="Bij deze gids"
      className="space-y-5 lg:sticky lg:top-24 lg:h-[calc(100dvh-7rem)] lg:space-y-6 lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:pb-10 lg:pr-2 lg:scrollbar-slim"
    >
      {items.length > 0 ? (
        <nav
          aria-label="Op deze pagina"
          className="rounded-2xl border border-stone-200 bg-white"
        >
          <button
            type="button"
            onClick={() => setTocOpen(!tocOpen)}
            aria-expanded={tocOpen}
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left lg:hidden"
          >
            <span className="font-display text-sm font-semibold text-stone-900">
              Op deze pagina
            </span>
            <span
              className={`text-stone-400 transition-transform ${tocOpen ? "rotate-90" : ""}`}
              aria-hidden
            >
              ›
            </span>
          </button>

          <div
            className={`px-3 pb-3 lg:block lg:pt-4 ${tocOpen ? "block" : "hidden"}`}
          >
            <p className="mb-1 hidden px-2 font-display text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-stone-400 lg:block">
              Op deze pagina
            </p>
            <ul role="list">
              {items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="block rounded-lg px-2 py-1.5 text-xs leading-relaxed text-stone-600 transition-colors hover:bg-stone-100/70 hover:text-ps-green"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      ) : null}

      <div className="rounded-2xl border border-[#5A8F6A]/25 bg-[#F0FAF3] px-5 py-5">
        <h2 className="font-display text-base font-semibold leading-snug text-stone-900">
          Past {naamKlein} bij jou?
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
          De meeste klachten beginnen niet bij een tekort, maar bij leefstijl.
          De gratis check laat zien wat er speelt — en of een supplement zinvol
          is.
        </p>
        <Link
          href="/intake"
          onClick={() =>
            trackEvent(GA4_EVENTS.INTAKE_CTA_CLICKED, {
              locatie: `gids_zijbalk_${slug}`,
            })
          }
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ps-green px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-ps-green-hover hover:shadow-md"
        >
          Doe de Leefstijlcheck →
        </Link>
        <IntakeCtaMicro className="mt-2 text-xs text-stone-500" />

        {vergelijking ? (
          <Link
            href={vergelijking.href}
            onClick={() =>
              trackEvent(GA4_EVENTS.SUPPLEMENTEN_PRODUCT_UITGAAND, {
                product: slug,
                bestemming: "vergelijking",
              })
            }
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-ps-green/40 bg-white px-5 py-2.5 text-xs font-semibold text-ps-green transition-all hover:border-ps-green hover:bg-white/70"
          >
            {vergelijking.linkLabel}
          </Link>
        ) : null}
      </div>

      <OnderbouwingPanel
        bron={`gids_${slug}`}
        actieveGidsSlug={slug}
        nadrukThemas={nadrukThemas}
      />
    </aside>
  );
}
