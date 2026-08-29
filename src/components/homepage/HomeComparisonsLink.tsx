"use client";

import Link from "next/link";
import { HOMEPAGE_TRUST } from "@/data/homepage";
import { trackEvent } from "@/lib/ga4";

/**
 * De tweede deur. Stond tot 29 augustus als raster van zes tegels bovenaan en
 * daarna als losse regel onder de hero; hij hoort hier, direct na de uitleg
 * hoe we oordelen. Eigen `source`, zodat het effect van die verhuizing te
 * meten is.
 */
export default function HomeComparisonsLink({ className = "" }: { className?: string }) {
  const { comparisonsLabel, comparisonsHref } = HOMEPAGE_TRUST;

  return (
    <Link
      href={comparisonsHref}
      onClick={() =>
        trackEvent("supplements_route_click", {
          source: "homepage_inline",
          supplement: "hub",
        })
      }
      className={`inline-flex min-h-[44px] items-center text-sm font-semibold text-stone-700 transition hover:text-stone-900 focus-visible:outline focus-visible:ring-2 focus-visible:ring-stone-400/40 ${className}`}
    >
      {comparisonsLabel} →
    </Link>
  );
}
