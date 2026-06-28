"use client";

import Link from "next/link";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";

export default function RevealCtaStack() {
  return (
    <section aria-label="Bewaar je overzicht" className="reveal-cta-premium reveal-premium-panel">
      <div className="reveal-cta-premium__inner">
        <div className="reveal-cta-premium__top">
          <span className="reveal-premium-panel__badge">{REVEAL_COPY.ctaBadge}</span>
          <div className="reveal-cta-premium__journey" aria-hidden>
            <span className="reveal-cta-premium__journey-active">
              <span className="reveal-cta-premium__journey-dot" />
              {REVEAL_COPY.ctaJourneyActive}
            </span>
            {REVEAL_COPY.ctaJourneySteps.map((step) => (
              <span key={step}>· {step}</span>
            ))}
          </div>
        </div>

        <div>
          <p className="reveal-premium-panel__eyebrow">{REVEAL_COPY.ctaEyebrow}</p>
          <h2 className="reveal-cta-premium__headline">{REVEAL_COPY.ctaHeadline}</h2>
        </div>

        <ul className="reveal-cta-premium__benefits" aria-label="Wat je dashboard biedt">
          {REVEAL_COPY.ctaBenefits.map((benefit) => (
            <li key={benefit} className="reveal-cta-premium__benefit">
              <span className="reveal-cta-premium__benefit-mark" aria-hidden>
                ✓
              </span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        <Link
          href="/account/login?from=intake"
          onClick={() => trackEvent(GA4_EVENTS.INTAKE_CTA_CLICKED)}
          className="reveal-cta-premium__button"
        >
          {REVEAL_COPY.cta}
        </Link>

        <p className="reveal-cta-premium__sub">{REVEAL_COPY.ctaSubtext}</p>
        <p className="reveal-cta-premium__trust">{REVEAL_COPY.ctaTrustLine}</p>
      </div>
    </section>
  );
}
