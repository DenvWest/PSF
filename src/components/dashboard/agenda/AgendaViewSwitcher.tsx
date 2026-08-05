"use client";

import type { AgendaViewId } from "@/lib/dashboard-url";

const VIEWS: { id: AgendaViewId; label: string; shortLabel: string }[] = [
  { id: "dag", label: "Dag", shortLabel: "D" },
  { id: "week", label: "Week", shortLabel: "W" },
  { id: "maand", label: "Maand", shortLabel: "M" },
];

type AgendaViewSwitcherProps = {
  value: AgendaViewId;
  onChange: (view: AgendaViewId) => void;
  /** Ingebed in AgendaToolbar: geen eigen border/achtergrond. */
  embedded?: boolean;
};

export default function AgendaViewSwitcher({
  value,
  onChange,
  embedded = false,
}: AgendaViewSwitcherProps) {
  return (
    <nav
      aria-label="Weergave"
      className={
        embedded
          ? "flex shrink-0 gap-0.5 rounded-xl border border-white/10 bg-black/20 p-0.5 sm:gap-1 sm:p-1"
          : "flex gap-1 rounded-xl border border-white/10 bg-black/20 p-1"
      }
    >
      {VIEWS.map((view) => {
        const active = view.id === value;
        return (
          <button
            key={view.id}
            type="button"
            aria-current={active ? "page" : undefined}
            aria-label={view.label}
            onClick={() => onChange(view.id)}
            className={`min-h-9 cursor-pointer rounded-lg border-none px-2.5 text-[12.5px] transition-colors sm:min-h-10 sm:px-3 sm:text-[13.5px] ${
              embedded ? "flex-1 sm:flex-none sm:min-w-[4.5rem]" : "min-h-11 flex-1 rounded-[10px]"
            } ${
              active
                ? "bg-white/[0.09] font-semibold text-[#F1EFE8]"
                : "bg-transparent font-medium text-[#9FB0A6] hover:bg-white/[0.04] hover:text-[#F1EFE8]"
            }`}
            style={{ fontFamily: "var(--f-sans)" }}
          >
            {embedded ? (
              <>
                <span className="sm:hidden" aria-hidden>
                  {view.shortLabel}
                </span>
                <span className="hidden sm:inline">{view.label}</span>
              </>
            ) : (
              view.label
            )}
          </button>
        );
      })}
    </nav>
  );
}
