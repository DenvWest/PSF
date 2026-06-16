"use client";

import type { ButtonHTMLAttributes, CSSProperties, InputHTMLAttributes, ReactNode } from "react";
import { useMemo, useState } from "react";
import { Check } from "@/components/app/icons";

type ButtonVariant = "primary" | "secondary" | "ghost" | "terra";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
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
  onClick,
  disabled = false,
  type = "button",
}: ButtonProps) {
  const [hovering, setHovering] = useState(false);
  const colors = useMemo(() => getButtonColors(variant, hovering), [hovering, variant]);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
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
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        fontWeight: variant === "primary" || variant === "terra" ? 600 : 500,
        letterSpacing: "0.01em",
        transition: "all 140ms ease",
      }}
    >
      {icon}
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
