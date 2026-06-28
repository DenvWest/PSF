"use client";

import type { ComponentType, CSSProperties } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import type { CheckScores, Pillar, PillarId } from "@/types/dashboard";

export const LADDER_ROW_H = 60;

type PriorityLadderProps = {
  ladder: Pillar[];
  scores: CheckScores;
  positions?: Record<PillarId, number>;
  focusRowHref?: string;
  focusRowAriaLabel?: string;
  focusHint?: string;
  onFocusRowClick?: () => void;
};

function LadderRowContent({
  pillar,
  rank,
  score,
  focus,
  focusHint = "← hier begin je nu",
}: {
  pillar: Pillar;
  rank: number;
  score: number;
  focus: boolean;
  focusHint?: string;
}) {
  const Icon = Icons[pillar.icon as keyof typeof Icons] as ComponentType<{ s?: number }>;

  return (
    <>
      <div
        style={{
          width: 24,
          fontFamily: "var(--f-serif)",
          fontSize: 16,
          color: focus ? pillar.color : "var(--text-subtle)",
          textAlign: "center",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {rank}
      </div>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `${pillar.color}1f`,
          color: pillar.color,
          border: `1px solid ${pillar.color}33`,
        }}
      >
        {Icon ? <Icon s={16} /> : null}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 14.5,
              color: "var(--text)",
              fontWeight: focus ? 600 : 500,
            }}
          >
            {pillar.label}
          </span>
          {focus ? (
            <span style={{ fontSize: 11, color: pillar.color, fontWeight: 600 }}>
              {focusHint}
            </span>
          ) : null}
        </div>
        <div
          style={{
            height: 4,
            borderRadius: 3,
            background: "rgba(255,255,255,0.07)",
            overflow: "hidden",
            marginTop: 7,
          }}
        >
          <div
            style={{
              width: `${score}%`,
              height: "100%",
              background: pillar.color,
              opacity: focus ? 1 : 0.5,
              borderRadius: 3,
              transition: "opacity .5s",
            }}
          />
        </div>
      </div>
      <div
        style={{
          fontFamily: "var(--f-serif)",
          fontSize: 19,
          color: focus ? "var(--text)" : "var(--text-muted)",
          fontVariantNumeric: "tabular-nums",
          width: 28,
          textAlign: "right",
        }}
      >
        {score}
      </div>
    </>
  );
}

export default function PriorityLadder({
  ladder,
  scores,
  positions,
  focusRowHref,
  focusRowAriaLabel,
  focusHint,
  onFocusRowClick,
}: PriorityLadderProps) {
  const animated = positions != null;

  const rowInnerStyle = (focus: boolean, pillar: Pillar): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    height: "100%",
    padding: "0 12px",
    borderRadius: 16,
    background: focus ? `${pillar.color}1f` : "transparent",
    transition: "background .5s",
    textDecoration: "none",
    color: "inherit",
    width: "100%",
    minHeight: 44,
    boxSizing: "border-box",
  });

  return (
    <div style={{ position: "relative", height: ladder.length * LADDER_ROW_H }}>
      {ladder.slice(1).map((_, i) => (
        <div
          key={`divider-${i}`}
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            top: (i + 1) * LADDER_ROW_H,
            height: 1,
            background: "var(--divider)",
          }}
        />
      ))}
      {ladder.map((pillar, staticIdx) => {
        const idx = positions ? positions[pillar.id] : staticIdx;
        const focus = idx === 0;
        const score = scores[pillar.id];
        const rank = idx + 1;

        return (
          <div
            key={pillar.id}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: LADDER_ROW_H,
              transform: `translateY(${idx * LADDER_ROW_H}px)`,
              transition: animated ? "transform .85s cubic-bezier(.4,0,.2,1)" : undefined,
            }}
          >
            {focus && focusRowHref ? (
              <Link
                href={focusRowHref}
                onClick={onFocusRowClick}
                aria-label={
                  focusRowAriaLabel ??
                  `Bewaar dit overzicht — begin bij ${pillar.label.toLowerCase()}`
                }
                style={rowInnerStyle(focus, pillar)}
              >
                <LadderRowContent
                  pillar={pillar}
                  rank={rank}
                  score={score}
                  focus={focus}
                  focusHint={focusHint}
                />
              </Link>
            ) : (
              <div style={rowInnerStyle(focus, pillar)}>
                <LadderRowContent
                  pillar={pillar}
                  rank={rank}
                  score={score}
                  focus={focus}
                  focusHint={focusHint}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
