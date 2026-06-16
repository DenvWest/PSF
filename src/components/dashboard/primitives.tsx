"use client";

import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { useState } from "react";

type EyebrowProps = { children: ReactNode; color?: string };
type SectionHeaderProps = {
  eyebrow?: string;
  title?: string;
  action?: ReactNode;
  color?: string;
};
type CardProps = {
  children: ReactNode;
  style?: CSSProperties;
  pad?: number;
  glow?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
};
type ButtonVariant = "primary" | "secondary" | "ghost" | "terra";
type ButtonSize = "sm" | "md" | "lg";
type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};
type SparklineProps = {
  data?: number[] | null;
  color?: string;
  w?: number;
  h?: number;
  empty?: boolean;
};
type DeltaBadgeProps = {
  delta: number | null;
  empty?: boolean;
};
type SlotGridProps = {
  children: ReactNode;
  min?: number;
  gap?: number;
  cols?: number;
};

export const Eyebrow = ({ children, color }: EyebrowProps) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontFamily: "var(--f-sans)",
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: "var(--text-subtle)",
    }}
  >
    <span
      style={{ width: 18, height: 1, background: color || "var(--divider-strong)" }}
    />
    <span style={{ color: color || "var(--text-muted)" }}>{children}</span>
  </div>
);

export const SectionHeader = ({ eyebrow, title, action, color }: SectionHeaderProps) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: 16,
      marginBottom: 14,
    }}
  >
    <div>
      {eyebrow && (
        <div style={{ marginBottom: 8 }}>
          <Eyebrow color={color}>{eyebrow}</Eyebrow>
        </div>
      )}
      {title && (
        <div
          style={{
            fontFamily: "var(--f-serif)",
            fontSize: 21,
            color: "var(--text)",
            letterSpacing: "0.01em",
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
      )}
    </div>
    {action}
  </div>
);

export const Card = ({ children, style, pad = 22, glow, onClick }: CardProps) => {
  const [hover, setHover] = useState(false);
  const interactive = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "var(--panel)",
        border: "1px solid var(--panel-border)",
        borderRadius: 24,
        padding: pad,
        position: "relative",
        overflow: "hidden",
        cursor: interactive ? "pointer" : "default",
        transition: "border-color .2s, background .2s, transform .2s",
        ...(interactive && hover
          ? {
              borderColor: "rgba(255,255,255,0.22)",
              background: "rgba(255,255,255,0.07)",
            }
          : null),
        ...style,
      }}
    >
      {glow && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `radial-gradient(120% 90% at 85% -10%, ${glow}22, transparent 60%)`,
          }}
        />
      )}
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
};

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  full,
  icon,
  iconRight,
  onClick,
  disabled,
  type,
}: ButtonProps) => {
  const [hover, setHover] = useState(false);
  const pads: Record<ButtonSize, string> = { sm: "9px 14px", md: "13px 20px", lg: "16px 24px" };
  const fs: Record<ButtonSize, number> = { sm: 13, md: 14.5, lg: 15.5 };
  const variants: Record<ButtonVariant, CSSProperties> = {
    primary: {
      background: hover && !disabled ? "#67a079" : "var(--sage)",
      color: "#0f1c10",
      border: "1px solid transparent",
      fontWeight: 600,
    },
    secondary: {
      background: hover && !disabled ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.04)",
      color: "var(--text)",
      border: "1px solid var(--panel-border)",
      fontWeight: 500,
    },
    ghost: {
      background: hover && !disabled ? "rgba(255,255,255,0.06)" : "transparent",
      color: "var(--text-muted)",
      border: "1px solid transparent",
      fontWeight: 500,
    },
    terra: {
      background: hover && !disabled ? "var(--terra-deep)" : "var(--terra)",
      color: "#1c130a",
      border: "1px solid transparent",
      fontWeight: 600,
    },
  };

  return (
    <button
      type={type || "button"}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        width: full ? "100%" : "auto",
        padding: pads[size],
        fontSize: fs[size],
        fontFamily: "var(--f-sans)",
        borderRadius: 14,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        letterSpacing: "0.005em",
        transition: "background .18s, transform .12s, opacity .2s",
        ...variants[variant],
      }}
    >
      {icon}
      <span>{children}</span>
      {iconRight}
    </button>
  );
};

export const Sparkline = ({ data, color = "var(--sage)", w = 132, h = 40, empty }: SparklineProps) => {
  if (empty || !data || data.length < 2) {
    return (
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <line
          x1="0"
          y1={h - 6}
          x2={w}
          y2={h - 6}
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1.5"
          strokeDasharray="3 5"
        />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pad = 4;
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (d - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${h} L${pts[0][0].toFixed(1)} ${h} Z`;
  const gid = `sg${Math.abs(w + h + data.length + data[0])}`;
  const last = pts[pts.length - 1];

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last[0]} cy={last[1]} r="2.6" fill={color} />
    </svg>
  );
};

export const DeltaBadge = ({ delta, empty }: DeltaBadgeProps) => {
  if (empty || delta == null) {
    return (
      <span style={{ fontSize: 12, color: "var(--text-subtle)", fontVariantNumeric: "tabular-nums" }}>
        —
      </span>
    );
  }
  const up = delta >= 0;
  const color = delta === 0 ? "var(--text-muted)" : up ? "var(--sage)" : "var(--terra)";
  return (
    <span style={{ fontSize: 12.5, color, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
      {up ? "+" : ""}
      {delta}
    </span>
  );
};

export const SlotGrid = ({ children, min = 150, gap = 12, cols }: SlotGridProps) => (
  <div
    style={{
      display: "grid",
      gap,
      gridTemplateColumns: cols
        ? `repeat(${cols}, 1fr)`
        : `repeat(auto-fit, minmax(${min}px, 1fr))`,
    }}
  >
    {children}
  </div>
);
