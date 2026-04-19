"use client";

import type { ReactNode } from "react";
import { affiliateLinks, type AffiliateSlug } from "@/data/affiliate-links";
import { trackAffiliateClick } from "@/lib/track-affiliate-click";
import { trackAffiliateKlik } from "@/lib/ga4";
import { trackClick } from "@/lib/track";

type Props = {
  affiliateSlug: AffiliateSlug;
  children: ReactNode;
  /** Optioneel: extra context voor GA-affiliate_click (page_type). */
  sourcePage?: string;
  position?: number;
  className?: string;
};

const SUPABASE_CLICK_SOURCE = "vergelijking";

export function AffiliateLink({
  affiliateSlug,
  children,
  sourcePage,
  position,
  className,
}: Props) {
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
      className={className}
      onClick={() => {
        const positionStr = position !== undefined ? String(position) : undefined;
        trackAffiliateClick(affiliateSlug, {
          pageType: sourcePage ?? SUPABASE_CLICK_SOURCE,
          position: positionStr,
        });
        trackAffiliateKlik({
          product_naam: affiliateSlug,
          merk: affiliateSlug.split("-").slice(0, -1).join("-") || affiliateSlug,
          positie_op_pagina: position ?? 0,
        });
        void trackClick({
          product_id: affiliateSlug,
          product_naam: affiliateSlug,
          categorie: SUPABASE_CLICK_SOURCE,
          pagina:
            typeof window !== "undefined" ? window.location.pathname : "",
        });
      }}
    >
      {children}
    </a>
  );
}
