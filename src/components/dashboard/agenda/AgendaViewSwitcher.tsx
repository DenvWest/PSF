"use client";

import type { AgendaViewId } from "@/lib/dashboard-url";

const VIEWS: { id: AgendaViewId; label: string }[] = [
  { id: "dag", label: "Dag" },
  { id: "week", label: "Week" },
  { id: "maand", label: "Maand" },
];

type AgendaViewSwitcherProps = {
  value: AgendaViewId;
  onChange: (view: AgendaViewId) => void;
};

export default function AgendaViewSwitcher({ value, onChange }: AgendaViewSwitcherProps) {
  return (
    <nav
      aria-label="Weergave"
      className="flex gap-1 rounded-xl border border-white/10 bg-black/20 p-1"
    >
      {VIEWS.map((view) => {
        const active = view.id === value;
        return (
          <button
            key={view.id}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => onChange(view.id)}
            className={`min-h-11 flex-1 cursor-pointer rounded-[10px] border-none px-3 text-[13.5px] transition-colors ${
              active
                ? "bg-white/[0.09] font-semibold text-[#F1EFE8]"
                : "bg-transparent font-medium text-[#9FB0A6] hover:bg-white/[0.04] hover:text-[#F1EFE8]"
            }`}
            style={{ fontFamily: "var(--f-sans)" }}
          >
            {view.label}
          </button>
        );
      })}
    </nav>
  );
}
