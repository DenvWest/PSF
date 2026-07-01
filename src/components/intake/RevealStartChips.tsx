"use client";

import type { ComponentType, CSSProperties } from "react";
import * as Icons from "@/components/app/icons";
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
          const Icon = Icons[pillar.icon as keyof typeof Icons] as ComponentType<{
            s?: number;
          }>;

          return (
            <li key={pillar.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                aria-label={`Bekijk eerste stap voor ${pillar.label}`}
                onClick={() => handleSelect(index, pillar.id)}
                className={`reveal-priority-chip${isSelected ? " reveal-priority-chip--selected" : ""}`}
                style={
                  {
                    "--chip-color": pillar.color,
                    borderColor: isSelected ? pillar.color : "#ebe7e2",
                  } as CSSProperties
                }
              >
                <span
                  className="reveal-priority-chip__icon"
                  style={{ background: `${pillar.color}1f`, color: pillar.color }}
                  aria-hidden
                >
                  <Icon s={22} />
                </span>
                <span className="reveal-priority-chip__label">{pillar.label}</span>
                <span
                  className="reveal-priority-chip__score"
                  style={{ fontFamily: "var(--f-serif, Georgia, serif)" }}
                >
                  {score}
                </span>
                {isSelected ? (
                  <span
                    className="reveal-priority-chip__hint"
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
