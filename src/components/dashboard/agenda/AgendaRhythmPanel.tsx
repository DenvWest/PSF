"use client";

import type { ComponentType, CSSProperties } from "react";
import * as Icons from "@/components/app/icons";
import FavoriteSaveButton from "@/components/dashboard/voortgang/FavoriteSaveButton";
import { PILLAR } from "@/data/dashboard";
import { isCadenceLadderAction } from "@/lib/leefstijl-ladder";
import { useVoortgangFavorites } from "@/lib/voortgang-favorites-context";

type IconComp = ComponentType<{ s?: number; sw?: number; style?: CSSProperties }>;

function iconOf(name: string): IconComp | null {
  return (Icons[name as keyof typeof Icons] as IconComp | undefined) ?? null;
}

/**
 * "Doorlopend vandaag" — gekozen acties die zich vele keren per dag herhalen
 * ({@link isCadenceLadderAction}) in plaats van op één tijdstip te staan.
 * `resolveLadderAffordances` geeft ze daarom geen agenda-knop meer; ze staan
 * hier los van de kalender, als een lijst waar je gedurende de dag naar
 * terugkijkt. Geen afvinkpad — dat vraagt een herhalende bron die er nog niet
 * is (`daily_action_log` kent vandaag alleen geplande momenten) — en geen
 * eigen tijdstip: precies het punt van dit paneel.
 *
 * Onzichtbaar zolang er niets gekozen is: een lege "doorlopend"-kaart naast
 * een dag die toch al met agenda-blokken vult, is ruis.
 */
export default function AgendaRhythmPanel() {
  const { items } = useVoortgangFavorites();
  const rhythmItems = items.filter(
    (item) =>
      item.kind === "activiteit" && item.domain != null && isCadenceLadderAction(item.title),
  );

  if (rhythmItems.length === 0) {
    return null;
  }

  return (
    <div className="mb-3 rounded-[14px] border border-white/10 bg-white/[0.03] p-3.5">
      <p className="mb-2.5 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
        Doorlopend vandaag
      </p>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {rhythmItems.map((item) => {
          const pillar = item.domain ? PILLAR[item.domain] : null;
          const Icon = pillar ? iconOf(pillar.icon) : null;
          return (
            <li
              key={item.id}
              className="flex items-center gap-2.5 rounded-[10px] border border-white/10 bg-black/15 px-2.5 py-2"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                {Icon ? <Icon s={13} style={{ color: pillar?.color }} /> : null}
              </span>
              <span className="min-w-0 flex-1 text-[12.5px] leading-relaxed text-[#CDD7D0] text-pretty">
                {item.title}
              </span>
              <FavoriteSaveButton compact surface="agenda_rhythm_panel" item={item} />
            </li>
          );
        })}
      </ul>
      <p className="mt-2.5 text-[11px] leading-relaxed text-[#7E8C82]">
        Geen vast moment — een ritme door je dag heen. Verwijderen kan met het hartje hierboven.
      </p>
    </div>
  );
}
