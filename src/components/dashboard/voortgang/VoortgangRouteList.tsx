"use client";

import * as Icons from "@/components/app/icons";
import PremiumWaitlistCard from "@/components/dashboard/PremiumWaitlistCard";
import { clarityTag } from "@/lib/clarity";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { trackEvent } from "@/lib/ga4";

type VoortgangRouteListProps = {
  onOpenStatistieken: () => void;
  onOpenFavorieten: () => void;
  onOpenInzichten: () => void;
  onOpenLichaamssamenstelling: () => void;
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
    subtitle: "Je eigen keuzes en onze aanraders",
  },
  {
    destination: "inzichten" as const,
    title: "Jouw inzichten",
    subtitle: "Je vitaliteit in één beeld",
  },
];

export default function VoortgangRouteList({
  onOpenStatistieken,
  onOpenFavorieten,
  onOpenInzichten,
  onOpenLichaamssamenstelling,
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

  const handleLichaam = () => {
    trackEvent("dashboard_voortgang_hub_click", {
      destination: "lichaamssamenstelling",
      surface: "verder_kijken",
    });
    clarityTag("dashboard_voortgang", "lichaamssamenstelling");
    onOpenLichaamssamenstelling();
  };

  const handleWearable = () => {
    emitAccountClientEvent("wearable.interest_clicked", {
      surface: "voortgang_hub",
      feature: "wearable_connect",
    });
    trackEvent("wearable_interest", { surface: "voortgang_hub" });
    clarityTag("wearable_interest", "voortgang_hub");
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
            className={`flex min-h-14 w-full cursor-pointer items-center gap-3 border-none bg-transparent py-3 text-left${
              index > 0 ? " border-t border-[var(--divider)]" : ""
            }`}
          >
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-medium text-[var(--text)]">
                {row.title}
              </span>
              <span className="block truncate text-[12.5px] text-[var(--text-subtle)]">
                {row.subtitle}
              </span>
            </span>
            <Icons.ChevronRight
              s={18}
              style={{ color: "var(--text-subtle)", flexShrink: 0 }}
            />
          </button>
        ))}
      </div>

      <div className="mt-5 border-t border-[var(--divider-strong)] pt-3.5">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
          BINNENKORT
        </p>
        <button
          type="button"
          onClick={handleLichaam}
          className="flex min-h-14 w-full cursor-pointer items-center gap-3 border-t border-[var(--divider)] bg-transparent py-3 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-medium text-[var(--text)]">
              Lichaamssamenstelling
            </span>
            <span className="block truncate text-[12.5px] text-[var(--text-subtle)]">
              Vet, spier en vocht als aparte meetlat
            </span>
          </span>
          <span className="shrink-0 rounded-full border border-[rgba(200,149,108,0.4)] bg-[rgba(200,149,108,0.12)] px-2.5 py-1 text-[10.5px] font-semibold whitespace-nowrap text-[var(--terra,#C8956C)]">
            Binnenkort in te vullen
          </span>
        </button>
        <button
          type="button"
          onClick={handleWearable}
          className="flex min-h-14 w-full cursor-pointer items-center gap-3 border-t border-[var(--divider)] bg-transparent py-3 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-medium text-[var(--text)]">
              Je wearable koppelen
            </span>
            <span className="block truncate text-[12.5px] text-[var(--text-subtle)]">
              Slaap en herstel automatisch mee laten lopen
            </span>
          </span>
          <span className="shrink-0 rounded-full border border-[rgba(200,149,108,0.4)] bg-[rgba(200,149,108,0.12)] px-2.5 py-1 text-[10.5px] font-semibold whitespace-nowrap text-[var(--terra,#C8956C)]">
            Binnenkort
          </span>
        </button>
      </div>

      <div className="mt-5">
        <PremiumWaitlistCard surface="voortgang" />
      </div>
    </section>
  );
}
