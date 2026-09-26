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
import type { SupplementCategory } from "@/types/supplement";
import { registerSupplementClick } from "@/lib/supplement-catalog-db/register-click-client";

type Props = {
  affiliateSlug: AffiliateSlug;
  children: ReactNode;
  /**
   * Stofcategorie van de pagina waar de link staat. Landt als `categorie` in
   * affiliate_clicks en als `item_category` in GA4 — zonder dit veld valt elke
   * klik in één bak en is de readout per vergelijkingspagina niet af te lezen.
   */
  category: SupplementCategory;
  /** Welk blok op de pagina de klik opleverde (choice-hero, product-card, …). */
  sourcePage: string;
  position?: number;
  className?: string;
};

export function AffiliateLink({
  affiliateSlug,
  children,
  category,
  sourcePage,
  position,
  className,
}: Props) {
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
      rel="nofollow sponsored noopener noreferrer"
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

        const positionStr = position !== undefined ? String(position) : undefined;
        trackAffiliateClick(affiliateSlug, {
          pageType: sourcePage,
          position: positionStr,
          category,
        });
        trackAffiliateKlik({
          product_naam: affiliateSlug,
          merk: affiliateSlug.split("-").slice(0, -1).join("-") || affiliateSlug,
          positie_op_pagina: position ?? 0,
          categorie: category,
        });
        clarityTag("affiliate_click_categorie", category);
        void trackClick({
          product_id: affiliateSlug,
          product_naam: affiliateSlug,
          categorie: category,
          surface: sourcePage,
          pagina:
            typeof window !== "undefined" ? window.location.pathname : "",
          nt: getNurtureToken() ?? undefined,
        });
        registerSupplementClick({
          affiliateSlug,
          page: typeof window !== "undefined" ? window.location.pathname : "",
          position,
        });
      }}
    >
      {children}
    </a>
  );
}
