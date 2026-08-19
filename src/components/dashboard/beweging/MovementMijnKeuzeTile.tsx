"use client";

import { useState } from "react";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { trackEvent } from "@/lib/ga4";
import { useVoortgangFavorites } from "@/lib/voortgang-favorites-context";

/**
 * N4 (BESLUIT_BEWEGING_V36 §A): wat je koos, als rij op Vandaag — naam +
 * afvinkactie, nooit merk/prijs/oordeel. Dezelfde bron als de "Mijn keuze"-
 * secties op het schap (account_favorites via useVoortgangFavorites), geen
 * eigen lijst. Geen `moment`-veld in dat datamodel vandaag — dus alleen naam
 * + afvinken, geen tijdstip (dat is een latere uitbreiding, geen aanname).
 *
 * Sessie-lokale afvink-staat, zelfde reden als MovementFreeActionsTile: geen
 * daily_action_log-koppeling, dat zou de gedeelde streak vervuilen.
 */
export default function MovementMijnKeuzeTile() {
  const { items } = useVoortgangFavorites();
  const [done, setDone] = useState<string[]>([]);

  const gekozen = items.filter((item) => item.domain === "beweging");
  if (gekozen.length === 0) {
    return null;
  }

  function handleToggle(id: string) {
    const nextDone = !done.includes(id);
    setDone((current) =>
      nextDone ? [...current, id] : current.filter((x) => x !== id),
    );
    trackEvent("beweging_mijn_keuze_afgevinkt", {
      item_id: id,
      done: nextDone,
      surface: "kompas_beweging",
    });
  }

  return (
    <CockpitTile eyebrow="Mijn keuze">
      <div className="flex flex-col gap-0">
        {gekozen.map((item) => {
          const isDone = done.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleToggle(item.id)}
              aria-pressed={isDone}
              className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 border-0 border-t border-white/[0.06] bg-transparent py-3 text-left first:border-t-0 first:pt-0"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  isDone ? "border-[#5A8F6A] bg-[#5A8F6A]" : "border-white/25 bg-transparent"
                }`}
              >
                {isDone ? <Icons.Check s={12} style={{ color: "#0E1810" }} /> : null}
              </span>
              <span
                className={`text-[13.5px] leading-relaxed ${
                  isDone ? "text-[#7E8C82] line-through" : "text-[#F1EFE8]"
                }`}
              >
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
    </CockpitTile>
  );
}
