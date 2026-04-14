"use client";

import Link from "next/link";
import type { SupplementRecommendation } from "@/data/supplement-routes";

type SupplementRouteProps = {
  recommendations: SupplementRecommendation[];
};

export default function SupplementRoute({ recommendations }: SupplementRouteProps) {
  return (
    <div className="space-y-2" style={{ fontFamily: "var(--font-intake-body), sans-serif" }}>
      {recommendations.map((rec) => (
        <div
          key={rec.id}
          className="rounded-[10px] border border-[#f0ede8] bg-[#FAFAF7] px-4 py-3.5"
        >
          <div className="mb-1 text-[15px] font-bold text-[#1a1a1a]">{rec.name}</div>
          <p className="m-0 mb-3 text-[13px] leading-relaxed text-[#777]">{rec.reason}</p>
          <Link
            href={rec.affiliateUrl}
            className="inline-flex items-center justify-center rounded-lg bg-[#C4873B] px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            Bekijk vergelijking
          </Link>
        </div>
      ))}
      <p className="mt-4 text-[11px] leading-snug text-[#aaa]">
        We verdienen een commissie als je via onze links koopt. Dit beïnvloedt onze
        aanbevelingen niet.
      </p>
    </div>
  );
}
