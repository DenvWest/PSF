"use client";

import Link from "next/link";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";

export default function RevealCtaStack() {
  return (
    <section
      aria-label="Bewaar je overzicht"
      style={{
        borderRadius: 22,
        background: "var(--panel)",
        border: "1px solid var(--panel-border)",
        boxShadow: "0 20px 48px -26px rgba(15,28,16,0.5)",
        padding: "22px 20px",
        display: "grid",
        gap: 12,
        textAlign: "center",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--sage)",
        }}
      >
        Bewaar je overzicht
      </p>
      <Link
        href="/account/login?from=intake"
        onClick={() => trackEvent(GA4_EVENTS.INTAKE_CTA_CLICKED)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 54,
          width: "100%",
          borderRadius: 14,
          background: "var(--sage)",
          padding: "0 24px",
          fontSize: 16,
          fontWeight: 700,
          color: "#0f1c10",
          textDecoration: "none",
        }}
      >
        {REVEAL_COPY.cta}
      </Link>
      <p
        style={{
          margin: 0,
          fontSize: 14.5,
          lineHeight: 1.55,
          color: "var(--text-muted)",
        }}
      >
        {REVEAL_COPY.ctaSubtext}
      </p>
    </section>
  );
}
