import type { AffiliateSlug } from "@/data/affiliate-links";

declare global {
  interface Window {
    gtag?: (
      command: "event",
      action: string,
      params?: Record<string, string | number | boolean>
    ) => void;
  }
}

/** GA4 event_label, e.g. arctic_blue_visolie */
export function affiliateGaEventLabel(slug: AffiliateSlug): string {
  return slug.replace(/-/g, "_");
}

export type AffiliateClickOptions = {
  pageType?: string;
  position?: string;
};

export function trackAffiliateClick(
  slug: AffiliateSlug,
  options?: AffiliateClickOptions
): void {
  const label = affiliateGaEventLabel(slug);
  const pageType = options?.pageType;
  const position = options?.position;

  if (typeof window === "undefined") return;

  const gtag = window.gtag;
  if (typeof gtag !== "function") return;

  const params: Record<string, string | number | boolean> = {
    event_category: "affiliate",
    event_label: label,
    transport_type: "beacon",
  };

  if (pageType !== undefined) {
    params.page_type = pageType;
  }
  if (position !== undefined) {
    params.product_position = position;
  }

  gtag("event", "affiliate_click", params);
}
