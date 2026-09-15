"use client";

import { useEffect, useState } from "react";
import type { SupplementProduct } from "@/types/supplement";
import { AffiliateLink } from "@/components/supplements/AffiliateLink";
import {
  buildAffiliateCtaLabel,
  getProductPricePerDay,
} from "@/lib/comparison-cta-label";

type Props = { topProduct: SupplementProduct };

export function StickyMobileCta({ topProduct }: Props) {
  const [visible, setVisible] = useState(false);
  const price = getProductPricePerDay(topProduct);
  const ctaLabel = buildAffiliateCtaLabel(topProduct.bestFor, price);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      role="complementary"
      aria-label="Snel naar topkeuze"
      aria-hidden={!visible}
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-4 pt-3 shadow-lg backdrop-blur md:hidden transition-transform duration-200 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] ${
        visible ? "translate-y-0" : "translate-y-full pointer-events-none"
      }`}
    >
      <div className="mx-auto flex max-w-sm items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {topProduct.bestFor}
          </p>
          <p className="truncate text-xs text-slate-500">{topProduct.name}</p>
        </div>
        <AffiliateLink
          affiliateSlug={topProduct.affiliateSlug}
          sourcePage="sticky-cta"
          position={1}
          className="inline-flex min-h-11 max-w-[min(200px,48vw)] shrink-0 items-center justify-center truncate whitespace-nowrap rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 sm:max-w-none sm:px-4 sm:text-sm"
        >
          {ctaLabel} →
        </AffiliateLink>
      </div>
    </div>
  );
}
