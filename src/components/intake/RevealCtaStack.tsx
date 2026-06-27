"use client";

import Link from "next/link";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";

export default function RevealCtaStack() {
  return (
    <section aria-label="Bewaar je overzicht" style={{ margin: "20px 0" }}>
      <div style={{ maxWidth: 448, margin: "0 auto", width: "100%" }}>
        <Link
          href="/account/login?from=intake"
          onClick={() => trackEvent(GA4_EVENTS.INTAKE_CTA_CLICKED)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 52,
            width: "100%",
            borderRadius: 14,
            background: "var(--sage)",
            padding: "0 24px",
            fontSize: 15.5,
            fontWeight: 600,
            color: "#0f1c10",
            textDecoration: "none",
          }}
        >
          {REVEAL_COPY.cta}
        </Link>
        <p
          style={{
            marginTop: 12,
            textAlign: "center",
            fontSize: 16,
            lineHeight: 1.55,
            color: "var(--text-muted)",
          }}
        >
          {REVEAL_COPY.ctaSubtext}
        </p>
      </div>
    </section>
  );
}
