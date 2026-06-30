"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import type { CheckScores, Pillar } from "@/types/dashboard";

type RevealPriorityBarsProps = {
  ladder: Pillar[];
  scores: CheckScores;
  startHint?: string;
  startHref?: string;
  ariaLabel?: string;
};

export default function RevealPriorityBars({
  ladder,
  scores,
  startHint,
  startHref,
  ariaLabel = "Prioriteiten",
}: RevealPriorityBarsProps) {
  return (
    <ul className="reveal-priority-bars" aria-label={ariaLabel}>
      {ladder.map((pillar, index) => {
        const score = scores[pillar.id];
        const isStart = index === 0;
        const body = (
          <>
            <div className="reveal-priority-bar__head">
              <span className="reveal-priority-bar__label">{pillar.label}</span>
              {isStart && startHint ? (
                <span
                  className="reveal-priority-bar__hint"
                  style={{ "--hint-color": pillar.color } as CSSProperties}
                >
                  {startHint}
                </span>
              ) : null}
              <span className="reveal-priority-bar__value">{score}</span>
              {isStart && startHref ? (
                <span className="reveal-priority-bar__chevron" aria-hidden>
                  →
                </span>
              ) : null}
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
          </>
        );

        if (isStart && startHref) {
          return (
            <li
              key={pillar.id}
              className="reveal-priority-bar reveal-priority-bar--start reveal-priority-bar--link"
            >
              <Link
                href={startHref}
                className="reveal-priority-bar__link"
                aria-label={`Begin bij ${pillar.label} — bewaar dit in je dashboard`}
                onClick={() => trackEvent(GA4_EVENTS.INTAKE_CTA_CLICKED)}
              >
                {body}
              </Link>
            </li>
          );
        }

        return (
          <li
            key={pillar.id}
            className={`reveal-priority-bar${isStart ? " reveal-priority-bar--start" : ""}`}
          >
            {body}
          </li>
        );
      })}
    </ul>
  );
}
