import type { ReactNode } from "react";
import { affiliateLinks, type AffiliateSlug } from "@/data/affiliate-links";

type AffiliateLinkProps = {
  affiliateSlug: AffiliateSlug;
  className?: string;
  children: ReactNode;
};

/**
 * Directe affiliate-URL uit `affiliate-links.ts` (commissie-parameter behouden).
 */
export default function AffiliateLink({
  affiliateSlug,
  className,
  children,
}: AffiliateLinkProps) {
  return (
    <>
      <a
        href={affiliateLinks[affiliateSlug]}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={className}
      >
        {children}
      </a>
      <p className="mt-2 break-all text-xs text-rose-600">
        DEBUG href: {affiliateLinks[affiliateSlug]}
      </p>
    </>
  );
}
