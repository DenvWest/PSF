"use client";

import Link from "next/link";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";

export default function RevealCtaStack() {
  return (
    <div className="reveal-path-cta">
      <Link
        href="/account/login?from=intake"
        onClick={() => trackEvent(GA4_EVENTS.INTAKE_CTA_CLICKED)}
        className="reveal-path-cta__button"
      >
        {REVEAL_COPY.cta}
      </Link>
      <p className="reveal-path-cta__sub">{REVEAL_COPY.ctaSubtext}</p>
      <p className="reveal-path-cta__trust">{REVEAL_COPY.ctaTrustLine}</p>
    </div>
  );
}
