"use client";

import { useEffect, useState } from "react";
import type { SupplementProduct } from "@/types/supplement";
import { AffiliateLink } from "@/components/supplements/AffiliateLink";

type Props = { topProduct: SupplementProduct };

export function StickyMobileCta({ topProduct }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur md:hidden transition-transform duration-200 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-sm items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {topProduct.name}
          </p>
          <p className="text-xs text-slate-500">{topProduct.variantTag}</p>
        </div>
        <AffiliateLink
          affiliateSlug={topProduct.affiliateSlug}
          sourcePage="beste-supplement-sticky-cta"
          position={1}
          className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Bekijk →
        </AffiliateLink>
      </div>
    </div>
  );
}
