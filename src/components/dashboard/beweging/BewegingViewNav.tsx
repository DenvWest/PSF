"use client";

import type { KompasDeepView } from "@/lib/dashboard-url";

type BewegingViewNavProps = {
  deepView: KompasDeepView;
  onSelectView: (view: KompasDeepView) => void;
};

const VIEWS: { id: KompasDeepView; label: string }[] = [
  { id: "cockpit", label: "Overzicht" },
  { id: "stappenplan", label: "Stappenplan" },
  { id: "programma", label: "Programma" },
];

export default function BewegingViewNav({
  deepView,
  onSelectView,
}: BewegingViewNavProps) {
  return (
    <nav
      aria-label="Beweging-navigatie"
      className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-20 border-t border-white/10 bg-[#101a1b]/95 px-2 py-2 backdrop-blur md:hidden"
    >
      <div className="mx-auto flex max-w-lg gap-1">
        {VIEWS.map((view) => {
          const active = deepView === view.id;
          return (
            <button
              key={view.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onSelectView(view.id)}
              className={`min-h-11 flex-1 cursor-pointer rounded-xl border-none px-2 text-[13px] font-semibold transition ${
                active
                  ? "bg-[#5A8F6A]/20 text-[#F1EFE8]"
                  : "bg-transparent text-[#9FB0A6]"
              }`}
            >
              {view.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
