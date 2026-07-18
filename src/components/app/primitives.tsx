"use client";

import type { ButtonHTMLAttributes, CSSProperties, InputHTMLAttributes, ReactNode } from "react";
import { useId, useMemo, useState } from "react";
import { Check } from "@/components/app/icons";

type ButtonVariant = "primary" | "secondary" | "ghost" | "terra";
type ButtonSize = "sm" | "md" | "lg";

export function Spinner({ s = 16 }: { s?: number }) {
  return (
    <svg className="animate-spin" width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "disabled" | "type">;

const buttonSizes: Record<ButtonSize, CSSProperties> = {
  sm: { padding: "9px 14px", fontSize: 13 },
  md: { padding: "13px 20px", fontSize: 14.5 },
  lg: { padding: "16px 24px", fontSize: 15.5 },
};

type ButtonColors = {
  backgroundColor: string;
  color: string;
  borderColor: string;
};

function getButtonColors(variant: ButtonVariant, hovering: boolean): ButtonColors {
  if (variant === "primary") {
    return {
      backgroundColor: hovering ? "#67a079" : "var(--sage)",
      color: "#0f1c10",
      borderColor: hovering ? "#67a079" : "var(--sage)",
    };
  }

  if (variant === "terra") {
    return {
      backgroundColor: hovering ? "var(--terra-deep)" : "var(--terra)",
      color: "#1f150e",
      borderColor: hovering ? "var(--terra-deep)" : "var(--terra)",
    };
  }

  if (variant === "ghost") {
    return {
      backgroundColor: hovering ? "rgba(255,255,255,0.05)" : "transparent",
      color: "var(--text)",
      borderColor: "transparent",
    };
  }

  return {
    backgroundColor: hovering ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
    color: "var(--text)",
    borderColor: "var(--panel-border)",
  };
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  full = false,
  icon,
  iconRight,
  loading = false,
  onClick,
  disabled = false,
  type = "button",
}: ButtonProps) {
  const [hovering, setHovering] = useState(false);
  const colors = useMemo(() => getButtonColors(variant, hovering), [hovering, variant]);
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sage)]"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        ...buttonSizes[size],
        width: full ? "100%" : undefined,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        borderRadius: 12,
        border: "1px solid",
        borderColor: colors.borderColor,
        background: colors.backgroundColor,
        color: colors.color,
        cursor: loading ? "wait" : isDisabled ? "not-allowed" : "pointer",
        opacity: loading ? 0.85 : disabled ? 0.45 : 1,
        fontWeight: variant === "primary" || variant === "terra" ? 600 : 500,
        letterSpacing: "0.01em",
        transition: "all 140ms ease",
      }}
    >
      {loading ? <Spinner s={16} /> : icon}
      <span>{children}</span>
      {iconRight}
    </button>
  );
}

type TextFieldInputType = Extract<InputHTMLAttributes<HTMLInputElement>["type"], string>;

export type TextFieldProps = {
  label?: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: TextFieldInputType;
  icon?: ReactNode;
  autoFocus?: boolean;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
};

export function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  autoFocus = false,
  inputMode,
  autoComplete,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <label style={{ display: "grid", gap: 8 }}>
      {label ? (
        <span
          style={{
            color: "var(--text-muted)",
            fontSize: 12.5,
            letterSpacing: "0.01em",
            fontWeight: 500,
          }}
        >
          {label}
        </span>
      ) : null}
      <span
        style={{
          height: 52,
          borderRadius: 14,
          border: "1px solid",
          borderColor: focused ? "var(--sage)" : "var(--panel-border)",
          background: "rgba(10, 20, 11, 0.34)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 14px",
          boxShadow: focused ? "0 0 0 3px rgba(90,143,106,0.18)" : "none",
          transition: "all 140ms ease",
        }}
      >
        {icon ? (
          <span
            style={{
              color: focused ? "var(--sage)" : "var(--text-subtle)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </span>
        ) : null}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          inputMode={inputMode}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            minWidth: 0,
            border: 0,
            outline: 0,
            background: "transparent",
            color: "var(--text)",
            fontSize: 15,
            lineHeight: 1.2,
          }}
        />
      </span>
      {hint ? (
        <span style={{ color: "var(--text-subtle)", fontSize: 12.5, lineHeight: 1.45 }}>{hint}</span>
      ) : null}
    </label>
  );
}

export type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
};

export function Checkbox({ checked, onChange, children }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sage)]"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        color: "var(--text-muted)",
        background: "transparent",
        border: 0,
        padding: 0,
        textAlign: "left",
        cursor: "pointer",
        width: "100%",
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 7,
          border: "1px solid",
          borderColor: checked ? "var(--sage)" : "var(--panel-border)",
          background: checked ? "var(--sage)" : "rgba(255,255,255,0.03)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#0f1c10",
          flexShrink: 0,
          marginTop: 1,
          transition: "all 140ms ease",
        }}
      >
        {checked ? <Check s={14} sw={2.4} /> : null}
      </span>
      <span style={{ fontSize: 13.5, lineHeight: 1.5 }}>{children}</span>
    </button>
  );
}

export type EyebrowProps = {
  children: ReactNode;
  color?: string;
};

export function Eyebrow({ children, color }: EyebrowProps) {
  return (
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
      <span style={{ width: 18, height: 1, background: color || "var(--divider-strong)" }} />
      <span style={{ color: color || "var(--text-muted)" }}>{children}</span>
    </div>
  );
}

export type SectionHeaderProps = {
  eyebrow?: string;
  title?: string;
  action?: ReactNode;
  color?: string;
};

export function SectionHeader({ eyebrow, title, action, color }: SectionHeaderProps) {
  return (
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
        {eyebrow ? (
          <div style={{ marginBottom: 8 }}>
            <Eyebrow color={color}>{eyebrow}</Eyebrow>
          </div>
        ) : null}
        {title ? (
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
        ) : null}
      </div>
      {action}
    </div>
  );
}

export type CardProps = {
  children: ReactNode;
  style?: CSSProperties;
  pad?: number;
  glow?: string;
  surface?: "dark" | "light";
  onClick?: () => void;
};

export function Card({
  children,
  style,
  pad = 22,
  glow,
  surface = "dark",
  onClick,
}: CardProps) {
  const [hovering, setHovering] = useState(false);
  const interactive = Boolean(onClick);
  const light = surface === "light";

  const baseBackground = light ? "#ffffff" : "var(--panel)";
  const baseBorder = light ? "1px solid #e4e0da" : "1px solid var(--panel-border)";
  const hoverStyles: CSSProperties =
    interactive && hovering
      ? light
        ? { borderColor: "#5A8F6A", background: "#faf9f7" }
        : { borderColor: "rgba(255,255,255,0.22)", background: "rgba(255,255,255,0.07)" }
      : {};

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={
        interactive
          ? "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sage)]"
          : undefined
      }
      onClick={onClick}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        background: baseBackground,
        border: baseBorder,
        borderRadius: 24,
        padding: pad,
        position: "relative",
        overflow: "hidden",
        cursor: interactive ? "pointer" : "default",
        transition: "border-color .2s, background .2s, transform .2s",
        ...hoverStyles,
        ...style,
      }}
    >
      {glow ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `radial-gradient(120% 90% at 85% -10%, ${glow}22, transparent 60%)`,
          }}
        />
      ) : null}
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}

export type SparklineProps = {
  data?: number[] | null;
  color?: string;
  w?: number;
  h?: number;
  empty?: boolean;
};

export function Sparkline({ data, color = "var(--sage)", w = 132, h = 40, empty }: SparklineProps) {
  const gradientId = useId().replace(/:/g, "");

  if (empty || !data || data.length < 2) {
    return (
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <line
          x1="0"
          y1={h - 6}
          x2={w}
          y2={h - 6}
          stroke="var(--divider-strong)"
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
  const points = data.map((datum, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (datum - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = points
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${points[points.length - 1][0].toFixed(1)} ${h} L${points[0][0].toFixed(1)} ${h} Z`;
  const last = points[points.length - 1];

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
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
}

export type DeltaBadgeProps = {
  delta?: number | null;
  empty?: boolean;
};

export function DeltaBadge({ delta, empty }: DeltaBadgeProps) {
  if (empty || delta == null) {
    return (
      <span style={{ fontSize: 12, color: "var(--text-subtle)", fontVariantNumeric: "tabular-nums" }}>
        -
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
}

export type SlotGridProps = {
  children: ReactNode;
  min?: number;
  gap?: number;
  cols?: number;
};

export function SlotGrid({ children, min = 150, gap = 12, cols }: SlotGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gap,
        gridTemplateColumns: cols ? `repeat(${cols}, 1fr)` : `repeat(auto-fit, minmax(${min}px, 1fr))`,
      }}
    >
      {children}
    </div>
  );
}
