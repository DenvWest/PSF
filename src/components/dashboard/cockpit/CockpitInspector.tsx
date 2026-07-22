"use client";

import type { ComponentType, CSSProperties } from "react";
import * as Icons from "@/components/app/icons";
import type { InspectorCard } from "@/lib/cockpit-inspector";

type IconComp = ComponentType<{ s?: number; style?: CSSProperties }>;

type CockpitInspectorProps = {
  cards: InspectorCard[];
};

const ACCENT: Record<
  InspectorCard["accent"],
  { border: string; kicker: string; icon: string }
> = {
  sage: { border: "border-white/10", kicker: "text-[#9FB0A6]", icon: "#5A8F6A" },
  terra: {
    border: "border-[rgba(200,149,108,0.4)]",
    kicker: "text-[#C8956C]",
    icon: "#C8956C",
  },
  neutral: { border: "border-white/10", kicker: "text-[#9FB0A6]", icon: "#9FB0A6" },
};

const ICON_BY_KIND: Record<InspectorCard["kind"], keyof typeof Icons> = {
  why: "Target",
  tip: "Check",
  meet: "Refresh",
  doel: "Spark",
};

export default function CockpitInspector({ cards }: CockpitInspectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#7E8C82]">
        Context bij vandaag
      </span>

      {cards.map((card, index) => {
        const accent = ACCENT[card.accent];
        const Icon = Icons[ICON_BY_KIND[card.kind]] as IconComp;
        return (
          <div
            key={`${card.kind}-${index}`}
            className={`rounded-[14px] border ${accent.border} bg-black/20 p-4`}
          >
            <span
              className={`mb-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] ${accent.kicker}`}
            >
              <Icon s={13} style={{ color: accent.icon }} /> {card.kicker}
            </span>
            <h3 className="mb-2 font-serif text-[16px] leading-tight text-[#F1EFE8]">
              {card.title}
            </h3>
            <p className="text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
              {card.body}
            </p>
          </div>
        );
      })}
    </div>
  );
}
