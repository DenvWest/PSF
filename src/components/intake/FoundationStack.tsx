"use client";

import Link from "next/link";
import SupplementAdviceDisclaimer from "@/components/intake/SupplementAdviceDisclaimer";
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
    <div className="mb-4 rounded-2xl border border-dashed border-intake-card-border bg-intake-bg-elevated p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-intake-sage/15 text-base">
          🧱
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-intake-ink">
            Veelgezochte vergelijkingen
          </h2>
          <p className="m-0 text-xs text-intake-ink-muted">
            Algemene opties — los van je scores en profiel.
          </p>
        </div>
      </div>

      <SupplementAdviceDisclaimer variant="foundation" />

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-[10px] border border-intake-card-border bg-white/[0.03] px-4 py-3.5"
          >
            <div className="mb-1 text-[15px] font-bold text-intake-ink">{item.name}</div>
            <p className="m-0 mb-2 text-[13px] leading-relaxed text-intake-ink-muted">
              {item.reason}
            </p>
            <p className="m-0 mb-2 text-[12px] leading-snug text-intake-ink-subtle">
              {item.claim}
            </p>
            <p className="m-0 mb-3 text-[11px] leading-snug text-intake-ink-subtle/80">
              {item.claimCondition}
            </p>
            {item.hasComparison ? (
              <Link
                href={item.href}
                className="inline-flex max-w-full items-center justify-center rounded-lg bg-intake-terra px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                {item.href.startsWith("/beste/") ? "Bekijk vergelijking →" : "Bekijk gids →"}
              </Link>
            ) : (
              <Link
                href={item.href}
                className="inline-block max-w-full break-words text-[13px] font-semibold text-intake-terra underline underline-offset-[3px]"
              >
                Meer informatie →
              </Link>
            )}
          </div>
        ))}
      </div>

      {showAffiliateDisclaimer ? (
        <p className="mt-4 text-[11px] leading-snug text-intake-ink-subtle">
          We verdienen een commissie als je via onze links koopt. Dit beïnvloedt onze
          aanbevelingen niet.
        </p>
      ) : null}
    </div>
  );
}
