"use client";

import { getScoreBandShortLabel } from "@/lib/score-bands";

type ScoreRingProps = {
  score: number;
  size?: number;
  stroke?: number;
  color: string;
  /** Toon kwalitatieve band i.p.v. numerieke score. */
  showBand?: boolean;
};

export default function ScoreRing({
  score,
  size = 72,
  stroke = 5,
  color,
  showBand = false,
}: ScoreRingProps) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const bg = `${color}22`;
  const centerLabel = showBand ? getScoreBandShortLabel(score) : String(score);
  const fontSize = showBand ? size * 0.16 : size * 0.28;

  return (
    <svg
      width={size}
      height={size}
      className="shrink-0"
      style={{ transform: "rotate(-90deg)" }}
      aria-hidden
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={bg}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        transform={`rotate(90 ${size / 2} ${size / 2})`}
        style={{
          fontSize,
          fontWeight: 700,
          fill: color,
          fontFamily: "var(--font-intake-body), sans-serif",
        }}
      >
        {centerLabel}
      </text>
    </svg>
  );
}
