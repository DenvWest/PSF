"use client";

import * as Icons from "@/components/app/icons";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";

type VoortgangRouteListProps = {
  onOpenStatistieken: () => void;
  onOpenFavorieten: () => void;
  onOpenInzichten: () => void;
};

const ROUTE_ROWS = [
  {
    destination: "statistieken" as const,
    title: "Statistieken",
    subtitle: "Wat je metingen zeggen over supplementen",
  },
  {
    destination: "favorieten" as const,
    title: "Favorieten",
    subtitle: "Aanbevolen en wat je zelf koos",
  },
  {
    destination: "inzichten" as const,
    title: "Jouw inzichten",
    subtitle: "Je totaalscore en wat je prioriteit drijft",
  },
];

const ROUTE_ROW_CLASS =
  "group flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl border-none bg-transparent px-2 py-3 text-left transition-colors hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sage)]";

export default function VoortgangRouteList({
  onOpenStatistieken,
  onOpenFavorieten,
  onOpenInzichten,
}: VoortgangRouteListProps) {
  const callbacks = {
    statistieken: onOpenStatistieken,
    favorieten: onOpenFavorieten,
    inzichten: onOpenInzichten,
  };

  const handleRouteClick = (destination: keyof typeof callbacks) => {
    trackEvent("dashboard_voortgang_hub_click", {
      destination,
      surface: "verder_kijken",
    });
    clarityTag("dashboard_voortgang", destination);
    callbacks[destination]();
  };

  return (
    <section aria-labelledby="verder-kijken-title">
      <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
        Verder kijken
      </p>
      <h2
        id="verder-kijken-title"
        className="mt-2 font-serif text-[18px] leading-[1.3] text-[var(--text)]"
        style={{ fontFamily: "var(--f-serif)" }}
      >
        Waar je dit verder uitzoekt
      </h2>

      <div className="mt-3.5">
        {ROUTE_ROWS.map((row, index) => (
          <button
            key={row.destination}
            type="button"
            onClick={() => handleRouteClick(row.destination)}
            className={`${ROUTE_ROW_CLASS}${index > 0 ? " border-t border-[var(--divider)]" : ""}`}
          >
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-medium text-[var(--text)]">
                {row.title}
              </span>
              <span className="block truncate text-[12.5px] text-[var(--text-subtle)]">
                {row.subtitle}
              </span>
            </span>
            <span className="shrink-0 text-[var(--text-subtle)] transition-colors group-hover:text-[var(--text-muted)]">
              <Icons.ChevronRight s={18} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
