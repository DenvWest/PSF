"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  adjustPickerTime,
  buildQuarterHourSlots,
} from "@/lib/agenda-time-picker";

const QUARTER_HOUR_SLOTS = buildQuarterHourSlots();
const POPOVER_MARGIN_PX = 6;
const POPOVER_Z_INDEX = 110;

function useClientMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export type AgendaTimePopoverPlacement = "top" | "bottom";

type AgendaTimePopoverProps = {
  draftTime: string;
  isDark: boolean;
  disabled?: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  preferPlacement?: "top" | "bottom" | "auto";
  onDraftChange: (time: string) => void;
  onConfirm: () => void;
  onNow: () => void;
  onClear: () => void;
  onClose: () => void;
  onPlacementResolved?: (placement: AgendaTimePopoverPlacement) => void;
};

function slotChipClass(selected: boolean, isDark: boolean): string {
  const base =
    "inline-flex min-h-9 w-full cursor-pointer items-center justify-center rounded-lg border text-[12.5px] font-medium tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-60";
  if (selected) {
    return isDark
      ? `${base} border-[rgba(90,143,106,0.55)] bg-[rgba(90,143,106,0.2)] text-[#F1EFE8]`
      : `${base} border-[rgba(90,143,106,0.55)] bg-[rgba(90,143,106,0.12)] text-[#1c1917]`;
  }
  return isDark
    ? `${base} border-white/10 bg-white/[0.03] text-[#CDD7D0] hover:border-white/20`
    : `${base} border-[#ebe7e2] bg-white text-[#57534e] hover:border-[#d6d3d1]`;
}

export default function AgendaTimePopover({
  draftTime,
  isDark,
  disabled = false,
  anchorRef,
  preferPlacement = "auto",
  onDraftChange,
  onConfirm,
  onNow,
  onClear,
  onClose,
  onPlacementResolved,
}: AgendaTimePopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const mounted = useClientMounted();
  const [style, setStyle] = useState<{
    top: number;
    left: number;
    width: number;
    placement: AgendaTimePopoverPlacement;
  } | null>(null);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) {
      return;
    }

    const updatePosition = () => {
      const anchorRect = anchor.getBoundingClientRect();
      const panelHeight = panel.offsetHeight;
      const panelWidth = Math.max(anchorRect.width, 280);
      const spaceBelow = window.innerHeight - anchorRect.bottom;
      const spaceAbove = anchorRect.top;

      let placement: AgendaTimePopoverPlacement = "bottom";
      if (preferPlacement === "top") {
        placement = "top";
      } else if (preferPlacement === "bottom") {
        placement = "bottom";
      } else if (
        spaceBelow < panelHeight + POPOVER_MARGIN_PX &&
        spaceAbove > spaceBelow
      ) {
        placement = "top";
      }

      const left = Math.min(
        Math.max(8, anchorRect.left),
        window.innerWidth - panelWidth - 8,
      );

      const top =
        placement === "bottom"
          ? anchorRect.bottom + POPOVER_MARGIN_PX
          : anchorRect.top - panelHeight - POPOVER_MARGIN_PX;

      setStyle({ top, left, width: panelWidth, placement });
      onPlacementResolved?.(placement);
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorRef, onPlacementResolved, preferPlacement]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (panelRef.current?.contains(target)) {
        return;
      }
      if (anchorRef.current?.contains(target)) {
        return;
      }
      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [anchorRef, onClose]);

  const mutedClass = isDark ? "text-[#9FB0A6]" : "text-[#78716c]";
  const readoutClass = isDark
    ? "text-[20px] font-semibold tabular-nums text-[#F1EFE8]"
    : "text-[20px] font-semibold tabular-nums text-[#1c1917]";
  const stepperClass = isDark
    ? "inline-flex min-h-9 min-w-9 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[14px] font-semibold tabular-nums text-[#F1EFE8] transition-colors hover:border-white/25 disabled:opacity-60"
    : "inline-flex min-h-9 min-w-9 cursor-pointer items-center justify-center rounded-lg border border-[#e4e0da] bg-[#faf9f7] text-[14px] font-semibold tabular-nums text-[#1c1917] transition-colors hover:border-[#d6d3d1] disabled:opacity-60";
  const footerButtonClass = isDark
    ? "min-h-9 flex-1 cursor-pointer rounded-lg border border-white/10 bg-white/[0.04] px-2 text-[12.5px] font-medium text-[#CDD7D0] transition-colors hover:border-white/25 disabled:opacity-60"
    : "min-h-9 flex-1 cursor-pointer rounded-lg border border-[#e4e0da] bg-[#faf9f7] px-2 text-[12.5px] font-medium text-[#57534e] transition-colors hover:border-[#d6d3d1] disabled:opacity-60";
  const confirmButtonClass = isDark
    ? "min-h-9 flex-1 cursor-pointer rounded-lg border border-[rgba(90,143,106,0.55)] bg-[rgba(90,143,106,0.2)] px-2 text-[12.5px] font-semibold text-[#F1EFE8] transition-colors hover:border-[rgba(90,143,106,0.75)] disabled:opacity-60"
    : "min-h-9 flex-1 cursor-pointer rounded-lg border border-[rgba(90,143,106,0.55)] bg-[rgba(90,143,106,0.12)] px-2 text-[12.5px] font-semibold text-[#1c1917] transition-colors hover:border-[rgba(90,143,106,0.75)] disabled:opacity-60";

  const panel = (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Kies een begintijd"
      className={`rounded-xl border p-3 shadow-lg ${
        isDark ? "border-white/10 bg-[#1a201c]" : "border-[#ebe7e2] bg-white"
      }`}
      style={{
        position: "fixed",
        top: style?.top ?? -9999,
        left: style?.left ?? 0,
        width: style?.width ?? 280,
        zIndex: POPOVER_Z_INDEX,
        visibility: style ? "visible" : "hidden",
      }}
    >
      <div className="mb-3 flex items-center justify-center gap-2">
        <button
          type="button"
          disabled={disabled}
          aria-label="Vijftien minuten eerder"
          onClick={() => onDraftChange(adjustPickerTime(draftTime, -15))}
          className={stepperClass}
          style={{ fontFamily: "var(--f-sans)" }}
        >
          −
        </button>
        <span
          className={readoutClass}
          aria-live="polite"
          style={{ fontFamily: "var(--f-sans)" }}
        >
          {draftTime}
        </span>
        <button
          type="button"
          disabled={disabled}
          aria-label="Vijftien minuten later"
          onClick={() => onDraftChange(adjustPickerTime(draftTime, 15))}
          className={stepperClass}
          style={{ fontFamily: "var(--f-sans)" }}
        >
          +
        </button>
      </div>

      <div
        className={`mb-3 max-h-36 overflow-y-auto rounded-lg border p-2 ${
          isDark ? "border-white/10 bg-black/20" : "border-[#ebe7e2] bg-[#faf9f7]"
        }`}
      >
        <div className="grid grid-cols-4 gap-1.5">
          {QUARTER_HOUR_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              disabled={disabled}
              aria-pressed={draftTime === slot}
              aria-label={`Kies ${slot}`}
              onClick={() => onDraftChange(slot)}
              className={slotChipClass(draftTime === slot, isDark)}
              style={{ fontFamily: "var(--f-sans)" }}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onConfirm}
          className={confirmButtonClass}
          style={{ fontFamily: "var(--f-sans)" }}
        >
          Bevestig
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onNow}
          className={footerButtonClass}
          style={{ fontFamily: "var(--f-sans)" }}
        >
          Nu
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onClear}
          className={footerButtonClass}
          style={{ fontFamily: "var(--f-sans)" }}
        >
          Wissen
        </button>
      </div>

      <p className={`mt-2 text-center text-[11px] ${mutedClass}`}>
        Tik een tijd of gebruik ±15
      </p>
    </div>
  );

  if (!mounted) {
    return null;
  }

  return createPortal(panel, document.body);
}
