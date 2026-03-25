"use client";

import type { ReactNode } from "react";
import { affiliateLinks, type AffiliateSlug } from "@/data/affiliate-links";
import { trackAffiliateClick } from "@/lib/track-affiliate-click";

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
  return (
    <a
      href={affiliateLinks[affiliateSlug]}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={className}
      onClick={() => {
        trackAffiliateClick(affiliateSlug, { pageType, position });
      }}
    >
      {children}
    </a>
  );
}
