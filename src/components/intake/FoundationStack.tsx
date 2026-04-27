"use client";

import Link from "next/link";
import { FOUNDATION_STACK } from "@/data/foundation-stack";

type FoundationStackProps = {
  excludeIds: string[];
};

export default function FoundationStack({ excludeIds }: FoundationStackProps) {
  const items = FOUNDATION_STACK.filter((f) => !excludeIds.includes(f.id));

  if (items.length === 0) {
    return null;
  }

  const showAffiliateDisclaimer = items.some((i) => i.hasComparison);

  return (
    <div
      className="mb-4 rounded-2xl border border-dashed border-[#d8d4cc] bg-[#f7f6f3] p-6"
      style={{ fontFamily: "var(--font-intake-body), sans-serif" }}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8B735518] text-base">
          🧱
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-[#1a1a1a]">
            Basisadvies voor elke man 40+
          </h2>
          <p className="m-0 text-xs text-[#777]">
            Los van je scores — deze supplementen zijn voor de meeste mannen een goede basis.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-[10px] border border-[#e8e4dc] bg-white/80 px-4 py-3.5"
          >
            <div className="mb-1 text-[15px] font-bold text-[#1a1a1a]">{item.name}</div>
            <p className="m-0 mb-2 text-[13px] leading-relaxed text-[#555]">{item.reason}</p>
            <p className="m-0 mb-2 text-[12px] leading-snug text-[#888]">{item.claim}</p>
            <p className="m-0 mb-3 text-[11px] leading-snug text-[#999]">{item.claimCondition}</p>
            {item.hasComparison ? (
              <Link
                href={item.href}
                className="inline-flex max-w-full items-center justify-center rounded-lg bg-[#C4873B] px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                Bekijk vergelijking →
              </Link>
            ) : (
              <Link
                href={item.href}
                className="inline-block max-w-full break-words text-[13px] font-semibold text-[#C4873B] underline underline-offset-[3px]"
              >
                Meer informatie →
              </Link>
            )}
          </div>
        ))}
      </div>

      {showAffiliateDisclaimer ? (
        <p className="mt-4 text-[11px] leading-snug text-[#aaa]">
          We verdienen een commissie als je via onze links koopt. Dit beïnvloedt onze
          aanbevelingen niet.
        </p>
      ) : null}
    </div>
  );
}
