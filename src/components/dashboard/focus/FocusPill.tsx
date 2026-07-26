"use client";

import { formatFocusLabel } from "@/lib/focus-label";
import type { DashboardModel } from "@/types/dashboard";

export type FocusSurfaceVariant = "agenda" | "kompas";
export type FocusPillPlacement = "header" | "panel";

type FocusPillProps = {
  model: DashboardModel;
  busy: boolean;
  expanded: boolean;
  onToggle: () => void;
  variant?: FocusSurfaceVariant;
  placement?: FocusPillPlacement;
};

const headerVariantClasses: Record<FocusSurfaceVariant, string> = {
  agenda: "max-w-[9.5rem] shrink-0 border-[#e4e0da] bg-white text-[var(--sage)]",
  kompas: "max-w-[9.5rem] shrink-0 border-white/12 bg-black/20 text-[#5A8F6A]",
};

export default function FocusPill({
  model,
  busy,
  expanded,
  onToggle,
  variant = "agenda",
  placement = "header",
}: FocusPillProps) {
  const focusLabel = formatFocusLabel(model.priority.label);
  const isPanelPlacement = placement === "panel" && variant === "kompas";
  const panelClasses = isPanelPlacement
    ? "w-fit border bg-black/20 text-[13px]"
    : headerVariantClasses[variant];

  return (
    <button
      type="button"
      disabled={busy}
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={`Wijzig focus, nu ${model.priority.label}`}
      className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-3 font-semibold transition-colors disabled:opacity-60 ${panelClasses}`}
      style={{
        fontFamily: "var(--f-sans)",
        ...(isPanelPlacement
          ? {
              color: model.priority.color,
              borderColor: `${model.priority.color}55`,
              background: `${model.priority.color}12`,
            }
          : {}),
      }}
    >
      {isPanelPlacement && !expanded ? (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: model.priority.color }}
          aria-hidden
        />
      ) : null}
      <span className={isPanelPlacement ? "whitespace-nowrap" : "truncate"}>
        {expanded ? "Sluit" : focusLabel}
      </span>
    </button>
  );
}
