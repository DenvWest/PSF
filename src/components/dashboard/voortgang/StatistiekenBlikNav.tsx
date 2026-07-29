"use client";

import { useEffect, useRef } from "react";
import * as Icons from "@/components/app/icons";
import {
  STATISTIEKEN_BLIK_LABELS,
} from "@/lib/statistieken-blik";
import type { StatistiekenBlik } from "@/types/dashboard";

type StatistiekenBlikNavProps = {
  activeBlik: StatistiekenBlik;
  onSwitch: (blik: StatistiekenBlik) => void;
};

const BLIK_ORDER: StatistiekenBlik[] = ["stand", "advies", "tijd"];

export default function StatistiekenBlikNav({
  activeBlik,
  onSwitch,
}: StatistiekenBlikNavProps) {
  const activeTabRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [activeBlik]);

  return (
    <nav
      aria-label="Statistieken-weergave"
      className="sticky top-0 z-10 -mx-1 bg-[var(--bg)]/95 px-1 py-2 backdrop-blur-sm"
    >
      <div
        className="flex min-w-0 items-center gap-1 overflow-x-auto scrollbar-hide"
        role="tablist"
      >
        {BLIK_ORDER.map((blik) => {
          const active = blik === activeBlik;
          return (
            <button
              key={blik}
              ref={active ? activeTabRef : undefined}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                if (!active) {
                  onSwitch(blik);
                }
              }}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition ${
                active
                  ? "cursor-default bg-white/10 text-[#F1EFE8]"
                  : "text-[#9FB0A6] hover:bg-white/[0.05] hover:text-[#F1EFE8]"
              }`}
            >
              {STATISTIEKEN_BLIK_LABELS[blik]}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function StatistiekenBlikCrossLinks({
  onSwitch,
}: {
  onSwitch: (blik: StatistiekenBlik) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px 20px",
        marginTop: 4,
      }}
    >
      <CrossLink label="Bekijk advies" onClick={() => onSwitch("advies")} />
      <CrossLink label="Over tijd" onClick={() => onSwitch("tijd")} />
    </div>
  );
}

function CrossLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: 0,
        border: "none",
        background: "none",
        fontSize: 13,
        fontWeight: 600,
        color: "var(--sage)",
        cursor: "pointer",
      }}
    >
      {label}
      <Icons.ChevronRight s={14} />
    </button>
  );
}
