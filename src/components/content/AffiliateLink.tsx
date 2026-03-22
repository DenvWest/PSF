import type { ReactNode } from "react";
import { affiliateLinks, type AffiliateSlug } from "@/data/affiliate-links";

declare global {
  interface Window {
    gtag?: (
      command: "event",
      action: string,
      params?: Record<string, string>
    ) => void;
  }
}

type AffiliateLinkProps = {
  affiliateSlug: AffiliateSlug;
  className?: string;
  children: ReactNode;
};

export default function AffiliateLink({
  affiliateSlug,
  className,
  children,
}: AffiliateLinkProps) {
  return (
    <a
      href={affiliateLinks[affiliateSlug]}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={className}
      onClick={() => {
        window.gtag?.("event", "affiliate_click", {
          event_category: "affiliate",
          event_label: affiliateSlug,
        });
      }}
    >
      {children}
    </a>
  );
}