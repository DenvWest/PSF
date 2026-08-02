"use client";

import * as Icons from "@/components/app/icons";
import { PILLAR } from "@/data/dashboard";
import { clarityTag } from "@/lib/clarity";
import type { TimelineBlock } from "@/types/agenda";

type AgendaPlanStepStripProps = {
  block: TimelineBlock;
  onOpenDetail: () => void;
};

/**
 * De tray: je dagstap zónder gezet moment. Hij hangt bewust bóven het raster —
 * een blok in het uurraster claimt een tijd die je zelf gekozen moet hebben
 * (verdict §A2c).
 */
export default function AgendaPlanStepStrip({
  block,
  onOpenDetail,
}: AgendaPlanStepStripProps) {
  const accentColor = block.domain ? PILLAR[block.domain].color : "var(--sage)";

  return (
    <button
      type="button"
      onClick={() => {
        clarityTag("agenda_plan_step", "pinned_strip_open");
        onOpenDetail();
      }}
      aria-label={`Open plan-stap: ${block.title}`}
      className="flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left transition-colors hover:border-white/20 hover:bg-white/[0.06]"
      style={{ borderLeftWidth: 3, borderLeftColor: accentColor }}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: accentColor }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="m-0 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#9FB0A6]">
          Uit je plan
        </p>
        <p
          className="m-0 truncate text-[14px] font-medium leading-snug text-[#F1EFE8]"
          style={{ fontFamily: "var(--f-serif)" }}
        >
          {block.title}
        </p>
        <p className="m-0 mt-0.5 text-[11.5px] text-[#9FB0A6]">Nog geen moment gekozen</p>
      </div>
      <span
        className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-[var(--sage)]"
        aria-hidden
      >
        Kies een moment
        <Icons.ChevronRight s={13} />
      </span>
    </button>
  );
}
