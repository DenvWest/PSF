"use client";

import type { CSSProperties } from "react";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";
import type { RevealModel } from "@/lib/reveal-model";

type RevealStartChipsProps = {
  model: RevealModel;
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export default function RevealStartChips({
  model,
  selectedIndex,
  onSelect,
}: RevealStartChipsProps) {
  function handleSelect(index: number, pillarId: string) {
    if (index === selectedIndex) {
      return;
    }
    onSelect(index);
    trackEvent("reveal_priority_selected", { pillar_id: pillarId, rank: index + 1 });
    clarityTag("reveal_priority", pillarId);
  }

  return (
    <div className="grid gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#78716c]">
        {REVEAL_COPY.startChipsHint}
      </p>
      <ul className="grid grid-cols-3 gap-2" aria-label="Je drie prioriteiten">
        {model.topLadder.map((pillar, index) => {
          const score = model.scores[pillar.id];
          const isSelected = selectedIndex === index;
          return (
            <li key={pillar.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                aria-label={`Bekijk eerste stap voor ${pillar.label}`}
                onClick={() => handleSelect(index, pillar.id)}
                className="flex h-full w-full cursor-pointer flex-col gap-1 rounded-[14px] border bg-white px-2.5 py-2.5 text-left transition active:scale-[0.98]"
                style={
                  {
                    borderColor: isSelected ? pillar.color : "#ebe7e2",
                    boxShadow: isSelected ? `inset 0 0 0 1px ${pillar.color}` : "none",
                  } as CSSProperties
                }
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ background: pillar.color }}
                    aria-hidden
                  />
                  <span className="truncate text-[13px] font-semibold text-[#1c1917]">
                    {pillar.label}
                  </span>
                </span>
                <span
                  className="text-[18px] leading-none text-[#1c1917]"
                  style={{ fontFamily: "var(--f-serif, Georgia, serif)" }}
                >
                  {score}
                </span>
                {isSelected ? (
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.06em]"
                    style={{ color: pillar.color }}
                  >
                    {REVEAL_COPY.ladderFocusHint}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
