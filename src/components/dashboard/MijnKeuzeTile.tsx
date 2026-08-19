"use client";

import { useState } from "react";
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
};

/**
 * N4 (BESLUIT_BEWEGING_V36 §A): wat je koos, als rij op Vandaag — naam +
 * afvinkactie, nooit merk/prijs/oordeel/vergelijkingslink. Dezelfde bron als
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
 * Sessie-lokale afvink-staat, zelfde reden als MovementFreeActionsTile: geen
 * daily_action_log-koppeling, dat zou de gedeelde streak vervuilen.
 */
export default function MijnKeuzeTile({ domain = null, surface }: MijnKeuzeTileProps) {
  const { items } = useVoortgangFavorites();
  const [done, setDone] = useState<string[]>([]);

  const gekozen = domain ? items.filter((item) => item.domain === domain) : items;
  if (gekozen.length === 0) {
    return null;
  }

  function handleToggle(id: string, itemDomain: PillarId | null) {
    const nextDone = !done.includes(id);
    setDone((current) => (nextDone ? [...current, id] : current.filter((x) => x !== id)));
    trackEvent("dashboard_mijn_keuze_afgevinkt", {
      item_id: id,
      domain: itemDomain ?? "onbekend",
      done: nextDone,
      surface,
    });
  }

  return (
    <CockpitTile eyebrow="Mijn keuze">
      <div className="flex flex-col gap-0">
        {gekozen.map((item) => {
          const isDone = done.includes(item.id);
          // `domain` is optioneel in account_favorites: een rij die vóór de
          // domein-scoping is opgeslagen heeft er geen. Die telt wel mee als
          // handeling, maar draagt geen herkomst — liever geen bron dan een
          // verzonnen bron.
          const pillar = item.domain ? PILLAR[item.domain] : null;
          const laag = parseLadderFavoriteLayer(item.id);
          const laagNaam =
            item.domain && laag != null ? resolveLadderLayerName(item.domain, laag) : null;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleToggle(item.id, item.domain ?? null)}
              aria-pressed={isDone}
              className="flex min-h-11 w-full cursor-pointer items-start gap-2.5 border-0 border-t border-white/[0.06] bg-transparent py-3 text-left first:border-t-0 first:pt-0"
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  isDone ? "border-[#5A8F6A] bg-[#5A8F6A]" : "border-white/25 bg-transparent"
                }`}
              >
                {isDone ? <Icons.Check s={12} style={{ color: "#0E1810" }} /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block text-[13.5px] leading-relaxed ${
                    isDone ? "text-[#7E8C82] line-through" : "text-[#F1EFE8]"
                  }`}
                >
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
            </button>
          );
        })}
      </div>
    </CockpitTile>
  );
}
