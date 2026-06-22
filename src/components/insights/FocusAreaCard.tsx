"use client";

import Link from "next/link";
import { PILLAR } from "@/data/dashboard";
import { trackEvent } from "@/lib/ga4";
import type { PillarId } from "@/types/dashboard";

export default function FocusAreaCard({ pillarId }: { pillarId: PillarId }) {
  const pillar = PILLAR[pillarId];

  return (
    <Link
      href={pillar.hubRoute}
      onClick={() => trackEvent("focus_area_click", { pillar: pillarId })}
      className="group flex min-h-[172px] flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-900/[0.04] transition duration-300 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
    >
      <div className="flex items-center gap-2.5">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: pillar.color }}
          aria-hidden
        />
        <span className="font-serif text-base font-normal text-stone-900">
          {pillar.label}
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stone-500">
        {pillar.lever}
      </p>
      <p className="mt-auto pt-4 text-sm font-medium text-stone-700 transition group-hover:text-stone-900">
        Verken {pillar.label} →
      </p>
    </Link>
  );
}
