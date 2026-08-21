"use client";

import * as Icons from "@/components/app/icons";
import { PILLAR } from "@/data/dashboard";
import type { PillarId, VoortgangScreen } from "@/types/dashboard";

type VoortgangMobileNavProps = {
  screen: VoortgangScreen;
  activeDomein: PillarId | null;
  /** Het domein waarvan het schap bereikbaar is, of `null` — dan valt de chip weg. */
  schapDomein: PillarId | null;
  favorietenCount: number;
  onOpenLeefstijlprofiel: () => void;
  onOpenSchap: () => void;
  onOpenFavorieten: () => void;
  onOpenDomein: (domain: PillarId) => void;
};

export default function VoortgangMobileNav({
  screen,
  activeDomein,
  schapDomein,
  favorietenCount,
  onOpenLeefstijlprofiel,
  onOpenSchap,
  onOpenFavorieten,
  onOpenDomein,
}: VoortgangMobileNavProps) {
  const leefstijlActive =
    screen === "leefstijlprofiel" || screen === "inzichten" || screen === "domein";
  const schapActive = screen === "schap";
  const favorietenActive = screen === "favorieten";

  const chipClass = (active: boolean) =>
    `inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition ${
      active
        ? "border-[var(--sage)] bg-[rgba(90,143,106,0.14)] text-[var(--sage)]"
        : "border-[var(--divider)] bg-transparent text-[var(--text-muted)]"
    }`;

  const domainChipClass = (domain: PillarId) =>
    chipClass(leefstijlActive && activeDomein === domain);

  return (
    <nav
      aria-label="Voortgang navigatie"
      className="mb-3 flex gap-2 overflow-x-auto pb-1 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <button type="button" onClick={onOpenLeefstijlprofiel} className={chipClass(leefstijlActive && !activeDomein)}>
        <Icons.User s={14} />
        Leefstijlprofiel
      </button>
      {(["slaap", "beweging", "voeding", "stress", "verbinding"] as const).map((domain) => (
        <button
          key={domain}
          type="button"
          onClick={() => onOpenDomein(domain)}
          className={domainChipClass(domain)}
        >
          {PILLAR[domain].label}
        </button>
      ))}
      {/* Twee chips, twee schermen (20 aug). Het schap is het aanbod van één
          domein en verdwijnt waar dat aanbod niet bestaat; Favorieten is wat
          jij bewaarde en telt daarom altijd hetzelfde. */}
      {schapDomein ? (
        <button type="button" onClick={onOpenSchap} className={chipClass(schapActive)}>
          <Icons.Pill s={14} />
          Schap · {PILLAR[schapDomein].label}
        </button>
      ) : null}
      <button type="button" onClick={onOpenFavorieten} className={chipClass(favorietenActive)}>
        <Icons.Heart s={14} />
        Favorieten
        {favorietenCount > 0 ? (
          <span className="tabular-nums text-[11px] opacity-80">{favorietenCount}</span>
        ) : null}
      </button>
    </nav>
  );
}
