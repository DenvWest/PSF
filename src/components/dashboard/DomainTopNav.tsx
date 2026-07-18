"use client";

import { useEffect, useRef } from "react";
import type { ComponentType, CSSProperties } from "react";
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

const TOPNAV_ICON_OVERRIDES: Partial<Record<PillarId, keyof typeof Icons>> = {
  beweging: "Activity",
  voeding: "Leaf",
};

const TRACK_CLASS =
  "flex gap-0.5 rounded-[14px] border border-white/[0.08] bg-black/30 p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)]";

const TAB_INACTIVE_CLASS =
  "text-stone-400 hover:bg-white/[0.06] hover:text-stone-200";

const TAB_BASE_CLASS =
  "relative flex flex-col items-center justify-center gap-1 overflow-hidden rounded-[11px] px-1.5 py-2 transition";

type DomainTopNavProps = {
  activeDomain: PillarId;
  onBack: () => void;
  onSwitch: (domain: PillarId) => void;
};

function NavIcon({
  icon,
  color,
  size = 14,
}: {
  icon: keyof typeof Icons;
  color: string;
  size?: number;
}) {
  const Icon = Icons[icon] as ComponentType<{
    s?: number;
    sw?: number;
    style?: CSSProperties;
  }>;

  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
      <Icon
        s={size}
        sw={2}
        style={{
          color,
          display: "block",
          shapeRendering: "geometricPrecision",
        }}
      />
    </span>
  );
}

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
      className="rounded-[20px] border border-white/10 bg-white/[0.045] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-md"
    >
      <div className={TRACK_CLASS}>
        <button
          type="button"
          onClick={onBack}
          aria-label="Terug naar Kompas-overzicht"
          className={`${TAB_BASE_CLASS} shrink-0 px-3 md:min-w-[4.75rem] ${TAB_INACTIVE_CLASS}`}
        >
          <NavIcon icon="Compass" color="rgba(245,243,240,0.72)" />
          <span className="max-w-full truncate text-[10.5px] font-semibold leading-none tracking-[0.01em]">
            Kompas
          </span>
        </button>

        <span
          className="w-px shrink-0 self-stretch bg-white/10"
          aria-hidden
        />

        <div
          className="flex min-w-0 flex-1 gap-0.5 overflow-x-auto scrollbar-hide"
          role="tablist"
          aria-label="Wissel domein"
        >
          {KOMPAS_TOPNAV_PILLAR_IDS.map((id) => {
            const pillar = PILLAR[id];
            const active = id === activeDomain;
            const icon =
              TOPNAV_ICON_OVERRIDES[id] ?? (pillar.icon as keyof typeof Icons);

            return (
              <button
                key={id}
                ref={active ? activeTabRef : undefined}
                type="button"
                role="tab"
                aria-selected={active}
                disabled={active}
                onClick={() => onSwitch(id)}
                className={`${TAB_BASE_CLASS} min-w-[4.75rem] flex-1 ${
                  active
                    ? "cursor-default bg-gradient-to-b from-[#fefdfb] to-[#f5f2ec] text-[#1c1917] shadow-[0_2px_10px_rgba(0,0,0,0.14)]"
                    : TAB_INACTIVE_CLASS
                }`}
                style={
                  active
                    ? {
                        boxShadow: `inset 0 -2px 0 0 ${pillar.color}, 0 4px 14px rgba(0,0,0,0.16)`,
                      }
                    : undefined
                }
              >
                <NavIcon
                  icon={icon}
                  color={active ? pillar.color : "rgba(245,243,240,0.72)"}
                />
                <span className="max-w-full truncate text-[10.5px] font-semibold leading-none tracking-[0.01em]">
                  {pillar.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
