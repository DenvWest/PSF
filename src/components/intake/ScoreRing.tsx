"use client";

type ScoreRingProps = {
  score: number;
  size?: number;
  stroke?: number;
  color: string;
};

export default function ScoreRing({
  score,
  size = 72,
  stroke = 5,
  color,
}: ScoreRingProps) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const bg = `${color}22`;

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
          fontSize: size * 0.28,
          fontWeight: 700,
          fill: color,
          fontFamily: "var(--font-intake-body), sans-serif",
        }}
      >
        {score}
      </text>
    </svg>
  );
}
