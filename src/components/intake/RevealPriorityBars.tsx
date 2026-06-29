"use client";

import type { CSSProperties } from "react";
import type { CheckScores, Pillar } from "@/types/dashboard";

type RevealPriorityBarsProps = {
  ladder: Pillar[];
  scores: CheckScores;
  startHint?: string;
  ariaLabel?: string;
  compact?: boolean;
};

export default function RevealPriorityBars({
  ladder,
  scores,
  startHint,
  ariaLabel = "Prioriteiten",
  compact = false,
}: RevealPriorityBarsProps) {
  return (
    <ul
      className={`reveal-priority-bars${compact ? " reveal-priority-bars--compact" : ""}`}
      aria-label={ariaLabel}
    >
      {ladder.map((pillar, index) => {
        const score = scores[pillar.id];
        const isStart = index === 0;

        return (
          <li
            key={pillar.id}
            className={`reveal-priority-bar${isStart ? " reveal-priority-bar--start" : ""}`}
          >
            <div className="reveal-priority-bar__head">
              <span className="reveal-priority-bar__label">{pillar.label}</span>
              {isStart && startHint ? (
                <span className="reveal-priority-bar__hint">{startHint}</span>
              ) : null}
              <span className="reveal-priority-bar__value">{score}</span>
            </div>
            <div className="reveal-priority-bar__track" aria-hidden>
              <span
                className="reveal-priority-bar__fill"
                style={
                  {
                    width: `${Math.max(4, Math.min(100, score))}%`,
                    "--score-fill-color": pillar.color,
                  } as CSSProperties
                }
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
