"use client";

import type { ComponentType } from "react";
import * as Icons from "@/components/app/icons";
import type { CheckScores, Pillar } from "@/types/dashboard";

const LADDER_ROW_H = 60;

type PriorityLadderProps = {
  ladder: Pillar[];
  scores: CheckScores;
};

export default function PriorityLadder({ ladder, scores }: PriorityLadderProps) {
  return (
    <div className="relative" style={{ height: ladder.length * LADDER_ROW_H }}>
      {ladder.slice(1).map((_, i) => (
        <div
          key={`divider-${i}`}
          className="absolute left-3 right-3 h-px"
          style={{
            top: (i + 1) * LADDER_ROW_H,
            background: "var(--divider, rgba(255,255,255,0.08))",
          }}
        />
      ))}
      {ladder.map((pillar, idx) => {
        const Icon = Icons[pillar.icon as keyof typeof Icons] as ComponentType<{ s?: number }>;
        const score = scores[pillar.id];
        const focus = idx === 0;

        return (
          <div
            key={pillar.id}
            className="absolute inset-x-0 top-0 flex items-center gap-3 px-3"
            style={{ height: LADDER_ROW_H, transform: `translateY(${idx * LADDER_ROW_H}px)` }}
          >
            <div
              className="flex h-full w-full items-center gap-3 rounded-2xl"
              style={{ background: focus ? `${pillar.color}1f` : "transparent" }}
            >
              <div
                className="w-6 text-center font-serif text-base tabular-nums"
                style={{ color: focus ? pillar.color : "var(--text-subtle, rgba(255,255,255,0.4))" }}
              >
                {idx + 1}
              </div>
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px]"
                style={{
                  background: `${pillar.color}1f`,
                  color: pillar.color,
                  border: `1px solid ${pillar.color}33`,
                }}
              >
                {Icon ? <Icon s={16} /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-[14.5px]"
                    style={{
                      color: "var(--text, rgba(255,255,255,0.95))",
                      fontWeight: focus ? 600 : 500,
                    }}
                  >
                    {pillar.label}
                  </span>
                  {focus ? (
                    <span className="text-[11px] font-semibold" style={{ color: pillar.color }}>
                      ← hier begin je nu
                    </span>
                  ) : null}
                </div>
                <div
                  className="mt-1.5 h-1 overflow-hidden rounded-sm"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                >
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: `${score}%`,
                      background: pillar.color,
                      opacity: focus ? 1 : 0.5,
                    }}
                  />
                </div>
              </div>
              <div
                className="w-7 text-right font-serif text-lg tabular-nums"
                style={{
                  color: focus
                    ? "var(--text, rgba(255,255,255,0.95))"
                    : "var(--text-muted, rgba(255,255,255,0.6))",
                }}
              >
                {score}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
