"use client";

import Link from "next/link";
import { PILLAR } from "@/data/dashboard";
import { trackEvent } from "@/lib/ga4";
import type { PillarId } from "@/types/dashboard";

type FocusAreaCardProps = {
  pillarId: PillarId;
  articleCount?: number;
  highlight?: boolean;
};

export default function FocusAreaCard({
  pillarId,
  articleCount,
  highlight = false,
}: FocusAreaCardProps) {
  const pillar = PILLAR[pillarId];
  const initial = pillar.label.charAt(0);

  return (
    <article
      className={`flex min-h-[172px] flex-col rounded-[18px] border bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-stone-300 hover:shadow-[0_16px_32px_-16px_rgba(28,25,23,0.2)] ${
        highlight
          ? "border-[#5A8F6A] ring-2 ring-[#5A8F6A]/25"
          : "border-[#E7E5E4]"
      }`}
    >
      <Link
        href={`/inzichten?pijler=${pillarId}`}
        onClick={() =>
          trackEvent("focus_area_click", {
            pillar: pillarId,
            destination: "feed",
          })
        }
        className="group flex min-h-0 flex-1 flex-col gap-3"
      >
        <div className="flex items-start justify-between">
          <span className="grid h-[42px] w-[42px] place-items-center rounded-xl bg-[#EEF3EF] font-display text-xl text-[#5A8F6A]">
            {initial}
          </span>
          {highlight ? (
            <span className="rounded-full bg-[#EEF3EF] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A8F6A]">
              Begin hier
            </span>
          ) : null}
        </div>
        <div>
          <h3 className="font-display text-[19px] font-normal text-stone-900">
            {pillar.label}
          </h3>
          <p className="mt-1 line-clamp-2 text-[13px] leading-[1.45] text-stone-500">
            {pillar.lever}
          </p>
        </div>
        {articleCount !== undefined ? (
          <span className="mt-auto text-[12.5px] text-stone-400">
            {articleCount} {articleCount === 1 ? "artikel" : "artikelen"}
          </span>
        ) : null}
      </Link>
    </article>
  );
}
