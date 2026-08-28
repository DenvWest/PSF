"use client";

import Link from "next/link";
import { HOMEPAGE_LIFESTYLE } from "@/data/homepage";
import { clarityTag } from "@/lib/clarity";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";

/**
 * De knop die tot 27 augustus ontbrak: de sectie droeg wel een titel en
 * microcopy, maar geen uitgang. Eigen `location`, zodat te scheiden is of de
 * check vanuit de hero of vanuit dit blok wordt gestart.
 */
export default function HomeLifestyleCta({ className = "" }: { className?: string }) {
  const { cta, ctaHref } = HOMEPAGE_LIFESTYLE;

  return (
    <Link
      href={ctaHref}
      onClick={() => {
        trackEvent(GA4_EVENTS.INTAKE_CTA_CLICKED, {
          location: "homepage_leefstijlcheck",
          target: ctaHref,
        });
        clarityTag("homepage_leefstijlcheck_cta", "start");
      }}
      className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-ps-green px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-ps-green-hover focus-visible:outline focus-visible:ring-2 focus-visible:ring-ps-green/50 focus-visible:ring-offset-2 ${className}`}
    >
      {cta}
      <span aria-hidden="true">→</span>
    </Link>
  );
}
