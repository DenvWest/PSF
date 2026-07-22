"use client";

import { useEffect, useRef } from "react";
import * as Icons from "@/components/app/icons";
import { PILLAR } from "@/data/dashboard";
import type { PillarId } from "@/types/dashboard";

const KOMPAS_TOPNAV_PILLAR_IDS: PillarId[] = [
  "slaap",
  "beweging",
  "voeding",
  "stress",
  "verbinding",
];

export type DomainNavApi = {
  onBack: () => void;
  onSwitch: (domain: PillarId) => void;
};

type DomainTopNavProps = {
  activeDomain: PillarId;
  onBack: () => void;
  onSwitch: (domain: PillarId) => void;
};

export default function DomainTopNav({
  activeDomain,
  onBack,
  onSwitch,
}: DomainTopNavProps) {
  const activeTabRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [activeDomain]);

  return (
    <nav
      aria-label="Domein-navigatie"
      className="flex min-w-0 items-center gap-2 overflow-x-auto scrollbar-hide"
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Terug naar Kompas-overzicht"
        className="flex shrink-0 items-center gap-0.5 rounded-[8px] px-1 py-1 text-[13.5px] font-medium text-[#9FB0A6] transition hover:text-[#F1EFE8]"
      >
        <Icons.ChevronLeft s={15} sw={2} style={{ color: "currentColor" }} />
        <span>Kompas</span>
      </button>

      <span className="h-4 w-px shrink-0 bg-white/15" aria-hidden />

      <div
        className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-hide"
        role="tablist"
        aria-label="Wissel domein"
      >
        {KOMPAS_TOPNAV_PILLAR_IDS.map((id) => {
          const pillar = PILLAR[id];
          const active = id === activeDomain;

          return (
            <button
              key={id}
              ref={active ? activeTabRef : undefined}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={active}
              onClick={() => onSwitch(id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition ${
                active
                  ? "cursor-default bg-white/10 text-[#F1EFE8]"
                  : "text-[#9FB0A6] hover:bg-white/[0.05] hover:text-[#F1EFE8]"
              }`}
            >
              {pillar.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
