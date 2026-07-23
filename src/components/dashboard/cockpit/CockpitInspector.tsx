"use client";

import type { ComponentType, CSSProperties, ReactNode } from "react";
import * as Icons from "@/components/app/icons";
import type { InspectorCard } from "@/lib/cockpit-inspector";

type IconComp = ComponentType<{ s?: number; style?: CSSProperties }>;

type CockpitInspectorProps = {
  cards: InspectorCard[];
  /** Maakt de "meet"-kaart actionable (universeel, niet domein-gebonden). */
  remeasureAction?: { due: boolean; onClick: () => void };
  /** Domein-specifieke compacte widget (bv. week-ritme) — zelfde kaart-look
   * als hierboven, zodat het écht als inspector-inhoud leest i.p.v. een los
   * blok. Eén stuk, telt mee voor de rustige, beperkte totaalindruk. */
  extra?: ReactNode;
  /** Koppelt aria-labelledby op de context-drawer. */
  titleId?: string;
  /** Sluitknop in drawer-modus; niet getoond in vaste sidebar. */
  onClose?: () => void;
  /** Inklapknop in sidebar-modus; geeft de midden-zone de vrijgekomen ruimte. */
  onCollapse?: () => void;
  /** Compactere typografie/spacing in bottom sheet (mobiel). */
  compact?: boolean;
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

export default function CockpitInspector({
  cards,
  remeasureAction,
  extra,
  titleId,
  onClose,
  onCollapse,
  compact = false,
}: CockpitInspectorProps) {
  return (
    <div className={`flex flex-col ${compact ? "gap-2.5" : "gap-3"}`}>
      <div className="flex items-center justify-between gap-3">
        <span
          id={titleId}
          className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#7E8C82]"
        >
          Context bij vandaag
        </span>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Sluit context"
            className="inline-flex min-h-9 shrink-0 cursor-pointer items-center rounded-lg border-none bg-transparent px-2 text-[18px] leading-none text-[#9FB0A6] transition hover:text-[#F1EFE8]"
          >
            ✕
          </button>
        ) : null}
        {onCollapse ? (
          <button
            type="button"
            onClick={onCollapse}
            aria-label="Klap context in"
            title="Klap context in"
            className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#9FB0A6] transition hover:border-white/20 hover:text-[#F1EFE8]"
          >
            <Icons.ChevronRight s={15} />
          </button>
        ) : null}
      </div>

      {cards.map((card, index) => {
        const accent = ACCENT[card.accent];
        const Icon = Icons[ICON_BY_KIND[card.kind]] as IconComp;
        const showRemeasureAction = card.kind === "meet" && remeasureAction;
        return (
          <div
            key={`${card.kind}-${index}`}
            className={`rounded-[14px] border ${accent.border} bg-black/20 ${compact ? "p-3" : "p-4"}`}
          >
            <span
              className={`mb-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] ${accent.kicker}`}
            >
              <Icon s={13} style={{ color: accent.icon }} /> {card.kicker}
            </span>
            <h3
              className={`mb-2 font-serif leading-tight text-[#F1EFE8] ${compact ? "text-[15px]" : "text-[16px]"}`}
            >
              {card.title}
            </h3>
            <p
              className={`leading-relaxed text-[#9FB0A6] text-pretty ${compact ? "text-[12px]" : "text-[12.5px]"}`}
            >
              {card.body}
            </p>
            {showRemeasureAction ? (
              remeasureAction.due ? (
                <button
                  type="button"
                  onClick={remeasureAction.onClick}
                  className="mt-3 inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border-none bg-[#5A8F6A] px-3 text-[13px] font-semibold text-[#0f1c10]"
                >
                  Doe de hermeting <Icons.ArrowRight s={13} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={remeasureAction.onClick}
                  className="mt-2 inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[12.5px] font-semibold text-[#C8956C]"
                >
                  Zo werkt je hermeting <Icons.ArrowRight s={12} />
                </button>
              )
            ) : null}
          </div>
        );
      })}

      {extra ? (
        <div className="flex flex-col gap-3 border-t border-white/10 pt-3">{extra}</div>
      ) : null}
    </div>
  );
}
