"use client";

import Link from "next/link";
import { HOMEPAGE_HERO } from "@/data/homepage";
import { clarityTag } from "@/lib/clarity";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";

/**
 * De twee deuren uit de hero. Sinds de omkering is de vergelijking de primaire
 * en de check de secundaire — beide krijgen hun eigen `source`, zodat af te
 * lezen is of het omdraaien de klik naar `/beste/*` daadwerkelijk verplaatst.
 */
export default function HomeHeroCtas() {
  const {
    primaryCta,
    primaryCtaHref,
    secondaryCta,
    secondaryCtaHref,
  } = HOMEPAGE_HERO;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Link
        href={primaryCtaHref}
        onClick={() => {
          trackEvent("supplements_route_click", {
            source: "homepage_hero",
            supplement: "hub",
          });
          clarityTag("homepage_hero_cta", "vergelijkingen");
        }}
        className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-ps-green px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-ps-green-hover focus-visible:outline focus-visible:ring-2 focus-visible:ring-ps-green/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F5F0]"
      >
        {primaryCta}
        <span aria-hidden="true">→</span>
      </Link>
      <Link
        href={secondaryCtaHref}
        onClick={() => {
          trackEvent(GA4_EVENTS.INTAKE_CTA_CLICKED, {
            location: "homepage_hero",
            target: secondaryCtaHref,
          });
          clarityTag("homepage_hero_cta", "leefstijlcheck");
        }}
        className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-stone-300 bg-white px-6 py-3.5 text-sm font-medium text-stone-700 shadow-sm transition hover:border-stone-400 hover:bg-stone-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-stone-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F5F0]"
      >
        {secondaryCta}
      </Link>
    </div>
  );
}
