"use client";

import { useState } from "react";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import type { MovementPriorityId } from "@/data/movement/lifestyle-priorities";
import { trackEvent } from "@/lib/ga4";

type MovementFreeActionsTileProps = {
  priorityId: MovementPriorityId;
  priorityName: string;
  actions: readonly string[];
};

/**
 * Drie gratis dingen op de winst-prioriteit — uit slaap-piramide-v2-prebuild
 * `renderKActies()` r.1458, met beweeg-inhoud uit `MOVEMENT_PRIORITY_LAYERS`.
 * Dezelfde bron als de ladder op Voortgang (P1, movement-ladder.ts): er is
 * geen tweede lijst die uit de pas kan lopen (lock 4).
 *
 * Sessie-lokale staat, bewust geen `useDailyActionLog`. Die hook schrijft
 * naar de gedeelde `daily_action_log`-streak die ook op DomainTodayStrip en
 * AgendaTodayHero staat — een klein voorbeeld hier afvinken zou dezelfde
 * streak optellen als een volledige sessie, en dat is nooit vastgelegd als
 * gewenst gedrag. Persistente opslag is een open punt, geen stille keuze
 * (zie BESLUIT_BEWEGING_V36 §M).
 */
export default function MovementFreeActionsTile({
  priorityId,
  priorityName,
  actions,
}: MovementFreeActionsTileProps) {
  const [planned, setPlanned] = useState<number[]>([]);

  if (actions.length === 0) {
    return null;
  }

  function handlePlan(index: number) {
    setPlanned((current) => (current.includes(index) ? current : [...current, index]));
    trackEvent("beweging_gratis_actie_gepland", {
      priority: priorityId,
      slot: index,
      surface: "kompas_beweging",
    });
  }

  return (
    <CockpitTile
      eyebrow={`Drie gratis dingen op prioriteit ${priorityId} · ${priorityName.toLowerCase()}`}
    >
      <div className="flex flex-col gap-0">
        {actions.slice(0, 3).map((action, index) => {
          const done = planned.includes(index);
          return (
            <div
              key={action}
              className="flex flex-wrap items-start justify-between gap-3 border-t border-white/[0.06] py-3 first:border-t-0 first:pt-0"
            >
              <p className="m-0 min-w-0 flex-1 text-[12.5px] leading-relaxed text-[#CDD7D0]">
                {action}
              </p>
              {done ? (
                <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[11.5px] font-semibold text-[#9CC5A9]">
                  <Icons.Check s={13} />
                  Staat op Mijn Dag
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handlePlan(index)}
                  className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-[#5A8F6A]/40 bg-[#5A8F6A]/[0.14] px-2.5 py-1.5 text-[11.5px] font-semibold text-[#9CC5A9]"
                >
                  Zet op Mijn Dag <Icons.ChevronRight s={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11.5px] leading-relaxed text-[#7E8C82]">
        Hier verdienen we niets aan. Ze komen uit je check, niet uit een schap.
      </p>
    </CockpitTile>
  );
}
