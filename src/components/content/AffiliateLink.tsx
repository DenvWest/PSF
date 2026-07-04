"use client";

import { useEffect, type ReactNode } from "react";
import { affiliateLinks, type AffiliateSlug } from "@/data/affiliate-links";
import { dispatchCookiePreferences } from "@/lib/analytics-consent-client";
import { trackAffiliateClick } from "@/lib/track-affiliate-click";
import { GA4_EVENTS, trackAffiliateKlik, trackEvent } from "@/lib/ga4";
import { trackClick } from "@/lib/track";
import {
  captureNurtureToken,
  getNurtureToken,
} from "@/lib/nurture-click-attribution";
import { readMarketingConsentStateClient } from "@/lib/marketing-consent-client";
import { clarityTag } from "@/lib/clarity";

type AffiliateLinkProps = {
  affiliateSlug: AffiliateSlug;
  className?: string;
  children: ReactNode;
  pageType?: string;
  position?: string;
};

export default function AffiliateLink({
  affiliateSlug,
  className,
  children,
  pageType,
  position,
}: AffiliateLinkProps) {
  useEffect(() => {
    captureNurtureToken();
  }, []);

  const href = affiliateLinks[affiliateSlug];

  if (!href) {
    return (
      <span className={className} role="status">
        Vergelijking volgt binnenkort
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      referrerPolicy="strict-origin"
      title="Schakel marketingcookies in via cookievoorkeuren om naar de partner te gaan"
      className={className}
      onClick={(event) => {
        if (readMarketingConsentStateClient() !== "granted") {
          event.preventDefault();
          trackEvent(GA4_EVENTS.COOKIE_MARKETING_GATE, { action: "blocked" });
          clarityTag("cookie_marketing_gate", "blocked");
          dispatchCookiePreferences({ openSettings: true });
          return;
        }

        trackAffiliateClick(affiliateSlug, { pageType, position });
        trackAffiliateKlik({
          product_naam: affiliateSlug,
          merk: affiliateSlug.split("-").slice(0, -1).join("-") || affiliateSlug,
          positie_op_pagina: parseInt(position ?? "0", 10) || 0,
        });
        trackClick({
          product_id: affiliateSlug,
          product_naam: affiliateSlug,
          categorie: pageType ?? "onbekend",
          pagina: typeof window !== "undefined" ? window.location.pathname : "",
          nt: getNurtureToken() ?? undefined,
        });
      }}
    >
      {children}
    </a>
  );
}
