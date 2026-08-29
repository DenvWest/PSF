"use client";

import Link from "next/link";
import { HOMEPAGE_HERO } from "@/data/homepage";
import { clarityTag } from "@/lib/clarity";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";

/**
 * De enige knop op de homepage. Hij staat twee keer op de pagina (hero en
 * afsluiting) en draagt per plek zijn eigen `location`, zodat af te lezen is
 * of de rustige pagina bovenaan of onderaan wordt gestart.
 */
export default function HomeCheckCta({
  location,
  className = "",
}: {
  location: "homepage_hero" | "homepage_closing";
  className?: string;
}) {
  const { primaryCta, primaryCtaHref } = HOMEPAGE_HERO;

  return (
    <Link
      href={primaryCtaHref}
      onClick={() => {
        trackEvent(GA4_EVENTS.INTAKE_CTA_CLICKED, {
          location,
          target: primaryCtaHref,
        });
        clarityTag("homepage_cta", location);
      }}
      className={`inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-lg bg-ps-green px-6 py-3.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-ps-green-hover focus-visible:outline focus-visible:ring-2 focus-visible:ring-ps-green/50 focus-visible:ring-offset-2 ${className}`}
    >
      {primaryCta}
      <span aria-hidden="true">→</span>
    </Link>
  );
}
