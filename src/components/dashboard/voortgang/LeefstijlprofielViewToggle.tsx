"use client";

import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { LeefstijlprofielView } from "@/types/dashboard";

type LeefstijlprofielViewToggleProps = {
  view: LeefstijlprofielView;
  onChange: (view: LeefstijlprofielView) => void;
  ariaLabel?: string;
};

export function LeefstijlprofielViewToggle({
  view,
  onChange,
  ariaLabel = "Leefstijlkeuzeweergave",
}: LeefstijlprofielViewToggleProps) {
  const handleChange = (next: LeefstijlprofielView) => {
    if (next === view) {
      return;
    }
    trackEvent("dashboard_favorieten_toggle", { view: next });
    clarityTag("dashboard_favorieten", next);
    onChange(next);
  };

  return (
    <div
      className="sticky bottom-0 z-10 -mx-1 border-t border-[var(--divider-strong)] bg-[var(--bg)]/95 px-1 py-3 backdrop-blur-sm"
      role="tablist"
      aria-label={ariaLabel}
    >
      <div className="flex gap-2">
        {(
          [
            { id: "aanbevolen" as const, label: "Aanbevolen" },
            { id: "mijn_keuze" as const, label: "Mijn keuze" },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={view === option.id}
            onClick={() => handleChange(option.id)}
            className={`min-h-11 flex-1 cursor-pointer rounded-full border px-4 text-[13.5px] font-semibold transition ${
              view === option.id
                ? "border-[var(--sage)] bg-[rgba(90,143,106,0.14)] text-[var(--sage)]"
                : "border-[var(--divider)] bg-transparent text-[var(--text-muted)]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
