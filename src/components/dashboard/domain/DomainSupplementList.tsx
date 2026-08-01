"use client";

import Link from "next/link";
import * as Icons from "@/components/app/icons";
import type { RecommendedSupplement } from "@/lib/build-recommendations";

type DomainSupplementListProps = {
  recommendations: RecommendedSupplement[];
  emptyText: string;
  onItemClick: (rec: RecommendedSupplement, href: string) => void;
};

export default function DomainSupplementList({
  recommendations,
  emptyText,
  onItemClick,
}: DomainSupplementListProps) {
  if (recommendations.length === 0) {
    return <p className="text-[13.5px] leading-relaxed text-[#9FB0A6] text-pretty">{emptyText}</p>;
  }

  return (
    <div className="flex flex-col">
      {recommendations.map((rec, index) => {
        const href = rec.comparisonHref ?? rec.guideHref;
        return (
          <Link
            key={rec.slug}
            href={href}
            onClick={() => onItemClick(rec, href)}
            className={`flex items-center gap-3 py-3 no-underline text-inherit ${
              index ? "border-t border-white/10" : ""
            }`}
          >
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/25 text-[20px]"
            >
              {rec.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-serif text-[16px] leading-tight text-[#F1EFE8]">
                {rec.name}
              </div>
              <div className="mt-0.5 text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
                {rec.wiifm}
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-0.5 text-[12px] font-semibold text-[#5A8F6A]">
              Vergelijk <Icons.ChevronRight s={15} />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
