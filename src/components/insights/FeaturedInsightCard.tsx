import Link from "next/link";
import {
  INSIGHT_TYPE_DOT,
  INSIGHT_TYPE_LABELS,
} from "@/components/insights/ContentCard";
import { PILLAR } from "@/data/dashboard";
import type { InsightItem } from "@/types/insight";

function MetaDot() {
  return (
    <span
      className="h-[3px] w-[3px] rounded-full bg-stone-300"
      aria-hidden
    />
  );
}

export default function FeaturedInsightCard({ item }: { item: InsightItem }) {
  const pijlerLabel = PILLAR[item.pijler].label;
  const typeLabel = INSIGHT_TYPE_LABELS[item.type];

  return (
    <article className="overflow-hidden rounded-[24px] border border-[#E7E5E4] bg-white transition duration-300 hover:shadow-[0_26px_54px_-22px_rgba(28,25,23,0.24)]">
      <Link
        href={item.href}
        className="group grid min-w-0 md:grid-cols-[1.05fr_1fr]"
      >
        <div
          className="flex min-h-[240px] items-end bg-[repeating-linear-gradient(135deg,#EFEDE7,#EFEDE7_13px,#F4F2EC_13px,#F4F2EC_26px)] p-5 md:min-h-[320px] md:p-[22px]"
          aria-hidden
        >
          <span className="rounded-md border border-[#E7E5E4] bg-[#F7F5F0] px-2.5 py-1 font-mono text-[11px] text-stone-400">
            redactionele hero · 16:10
          </span>
        </div>

        <div className="flex flex-col justify-center gap-[18px] p-7 md:p-11">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.05em] text-stone-600">
              <span
                className="h-[7px] w-[7px] rounded-full"
                style={{ backgroundColor: INSIGHT_TYPE_DOT[item.type] }}
                aria-hidden
              />
              {typeLabel}
            </span>
            <span className="rounded-full bg-[#EEF3EF] px-2.5 py-1 text-[11.5px] font-semibold uppercase tracking-[0.05em] text-[#5A8F6A]">
              Uitgelicht
            </span>
          </div>

          <h3 className="font-display text-[clamp(1.5rem,3vw,2.0625rem)] font-normal leading-[1.18] tracking-[-0.01em] text-stone-900 transition group-hover:text-stone-700">
            {item.title}
          </h3>

          <p className="line-clamp-3 text-base leading-[1.65] text-stone-600">
            {item.excerpt}
          </p>

          <div className="flex items-center gap-3 text-[13px] text-stone-500">
            {item.readingTime ? (
              <>
                <span>{item.readingTime}</span>
                <MetaDot />
              </>
            ) : null}
            <span>{item.niveau}</span>
            <MetaDot />
            <span>{pijlerLabel}</span>
          </div>

          <span className="text-[15px] font-semibold text-[#0E1A14]">
            Lees artikel →
          </span>
        </div>
      </Link>
    </article>
  );
}
