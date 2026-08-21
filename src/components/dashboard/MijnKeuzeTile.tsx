"use client";

import type { ReactNode } from "react";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { PILLAR } from "@/data/dashboard";
import { trackEvent } from "@/lib/ga4";
import { parseLadderFavoriteLayer, resolveLadderLayerName } from "@/lib/leefstijl-ladder";
import { useVoortgangFavorites } from "@/lib/voortgang-favorites-context";
import type { PillarId } from "@/types/dashboard";

type MijnKeuzeTileProps = {
  /**
   * `null` = alle domeinen (Kompas home: je dag gaat over je dag, niet over
   * één domein). Een PillarId = alleen dat domein (domeinscherm).
   */
  domain?: PillarId | null;
  surface: string;
  /** Door naar Agenda — afvinken hoort daar, niet op deze tile. */
  onGoAgenda?: () => void;
  /**
   * Geen CockpitTile-chrome — voor inbedding in de Kompas-home-kolom
   * (die al in een CockpitTile zit).
   */
  embedded?: boolean;
  /** Empty-state: open prioriteitsdomein om iets te kiezen. */
  onOpenDomain?: () => void;
};

/**
 * N4 (BESLUIT_BEWEGING_V36 §A): wat je koos, als rij op Kompas — naam +
 * herkomst, nooit merk/prijs/oordeel/vergelijkingslink. Dezelfde bron als
 * de "Mijn keuze"-secties op het schap (account_favorites via
 * useVoortgangFavorites), geen eigen lijst.
 *
 * Een supplement, een dienst en een activiteit krijgen hier bewust dezelfde
 * rij: op deze surface zijn ze alle drie een handeling. Dat is de hele grens
 * tussen de deur en het schap.
 *
 * Cross-domein draagt elke rij zijn domein als herkomst (N2: bron in beeld) —
 * anders staat "Magnesium" naast "Kracht thuis" zonder dat te zien is waar ze
 * vandaan komen. Komt een rij van de leefstijlladder, dan draagt hij bovendien
 * zijn laag: dat is de terugweg naar de plek waar je hem koos, zonder dat er
 * een oordeel of een aanbod op deze surface belandt.
 *
 * Read-only snapshot: afvinken doe je op Mijn Dag (agenda_blocks /
 * daily_action_log), niet hier — anders krijg je een tweede, sessie-lokale
 * check-off die de streak vervuilt.
 */
export default function MijnKeuzeTile({
  domain = null,
  surface,
  onGoAgenda,
  embedded = false,
  onOpenDomain,
}: MijnKeuzeTileProps) {
  const { items } = useVoortgangFavorites();

  const gekozen = domain ? items.filter((item) => item.domain === domain) : items;

  function handleOpenAgenda() {
    trackEvent("dashboard_mijn_keuze_open_agenda", {
      surface,
      domain: domain ?? "alle",
      count: gekozen.length,
    });
    onGoAgenda?.();
  }

  if (gekozen.length === 0) {
    if (!embedded) {
      return null;
    }
    return wrapChrome(
      embedded,
      <EmptyState onOpenDomain={onOpenDomain} />,
    );
  }

  const body = (
    <>
      <ul className="m-0 flex list-none flex-col gap-0 p-0">
        {gekozen.map((item) => {
          // `domain` is optioneel in account_favorites: een rij die vóór de
          // domein-scoping is opgeslagen heeft er geen. Die telt wel mee als
          // handeling, maar draagt geen herkomst — liever geen bron dan een
          // verzonnen bron.
          const pillar = item.domain ? PILLAR[item.domain] : null;
          const laag = parseLadderFavoriteLayer(item.id);
          const laagNaam =
            item.domain && laag != null ? resolveLadderLayerName(item.domain, laag) : null;
          return (
            <li
              key={item.id}
              className="flex min-h-11 items-start gap-2.5 border-0 border-t border-white/[0.06] py-3 first:border-t-0 first:pt-0"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] leading-relaxed text-[#F1EFE8]">
                  {item.title}
                </span>
                {(domain === null && pillar) || laagNaam ? (
                  <span className="mt-1 flex items-center gap-1.5 text-[11px] text-[#7E8C82]">
                    {domain === null && pillar ? (
                      <>
                        <span
                          aria-hidden
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: pillar.color }}
                        />
                        {pillar.label}
                      </>
                    ) : null}
                    {domain === null && pillar && laagNaam ? <span aria-hidden>·</span> : null}
                    {laagNaam ? <span>{`Laag ${laag} · ${laagNaam}`}</span> : null}
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
      {onGoAgenda ? (
        <div className="mt-3 border-t border-white/[0.06] pt-3">
          <p className="m-0 max-w-[62ch] text-[11.5px] leading-relaxed text-[#7E8C82] text-pretty">
            Afvinken doe je op Mijn Dag — plan een moment, of markeer je dagstap.
          </p>
          <button
            type="button"
            onClick={handleOpenAgenda}
            className="mt-1.5 inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-left text-[13px] font-semibold text-[#9CC5A9]"
          >
            Open Mijn Dag <Icons.ChevronRight s={13} />
          </button>
        </div>
      ) : null}
    </>
  );

  return wrapChrome(embedded, body);
}

function EmptyState({ onOpenDomain }: { onOpenDomain?: () => void }) {
  return (
    <div>
      <p className="m-0 max-w-[42ch] text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
        Nog niets gekozen — open een domein en zet iets op je lijst.
      </p>
      {onOpenDomain ? (
        <button
          type="button"
          onClick={onOpenDomain}
          className="mt-2.5 inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-left text-[13px] font-semibold text-[#9CC5A9]"
        >
          Open prioriteitsdomein <Icons.ChevronRight s={13} />
        </button>
      ) : null}
    </div>
  );
}

function wrapChrome(embedded: boolean, body: ReactNode) {
  if (embedded) {
    return (
      <div>
        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
          Mijn keuze
        </p>
        <div className="mt-3">{body}</div>
      </div>
    );
  }
  return <CockpitTile eyebrow="Mijn keuze">{body}</CockpitTile>;
}
