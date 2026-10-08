"use client";

import type { ComponentType, CSSProperties } from "react";
import * as Icons from "@/components/app/icons";
import FavoriteReminderControl from "@/components/dashboard/voortgang/FavoriteReminderControl";
import FavoriteSaveButton from "@/components/dashboard/voortgang/FavoriteSaveButton";
import { PILLAR } from "@/data/dashboard";
import { isCadenceLadderAction } from "@/lib/leefstijl-ladder";
import {
  useVoortgangFavorites,
  type VoortgangFavoriteItem,
} from "@/lib/voortgang-favorites-context";

type IconComp = ComponentType<{ s?: number; sw?: number; style?: CSSProperties }>;

function iconOf(name: string): IconComp | null {
  return (Icons[name as keyof typeof Icons] as IconComp | undefined) ?? null;
}

/**
 * `reminderStartTime`/`alertEnabled` worden alleen geschreven door een
 * expliciete tik op `FavoriteReminderControl` (bewaren alléén zet dit nooit)
 * — dus aanwezig is hier hetzelfde als "actief ingesteld".
 */
function hasActiveReminder(item: VoortgangFavoriteItem): boolean {
  return Boolean(item.reminderStartTime) || item.alertEnabled === true;
}

/**
 * Twee groepen: cadans-acties ({@link isCadenceLadderAction}, die geen
 * agenda-knop meer krijgen van `resolveLadderAffordances`) én elke andere
 * favoriet met een actief ingestelde herinnering. Een herinnering leeft
 * altijd op de `account_favorites`-rij zelf, nooit op `agenda_blocks` —
 * heeft dus per definitie geen kalenderdatum en hoort in "Doorlopend
 * vandaag", niet op de dagkalender.
 *
 * Los geëxporteerd zodat `AgendaScreen` hetzelfde aantal kan optellen voor
 * het uitklap-chipje in de header, ook terwijl het paneel zelf ingeklapt is.
 */
export function selectRhythmItems(items: VoortgangFavoriteItem[]): VoortgangFavoriteItem[] {
  return items.filter((item) => {
    if (item.domain == null) {
      return false;
    }
    if (item.kind === "activiteit" && isCadenceLadderAction(item.title)) {
      return true;
    }
    return hasActiveReminder(item);
  });
}

/**
 * "Doorlopend vandaag" — zie {@link selectRhythmItems} voor de selectie.
 * `FavoriteReminderControl` staat er zelf bij, zodat je 'm hier leest én
 * aanpast in plaats van terug te moeten naar ladder of schap.
 *
 * Geen afvinkpad — dat vraagt een herhalende bron die er nog niet is
 * (`daily_action_log` kent vandaag alleen geplande momenten).
 *
 * Onzichtbaar zolang er niets gekozen is: een lege "doorlopend"-kaart naast
 * een dag die toch al met agenda-blokken vult, is ruis. Het uitklap-chipje
 * in de header (`AgendaToolbar`) regelt de rest — dit component rendert zelf
 * niets in- of uitklapbaars, `AgendaScreen` mount het alleen wanneer open.
 */
export default function AgendaRhythmPanel() {
  const { items } = useVoortgangFavorites();
  const rhythmItems = selectRhythmItems(items);

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
              className="rounded-[10px] border border-white/10 bg-black/15 px-2.5 py-2"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                  {Icon ? <Icon s={13} style={{ color: pillar?.color }} /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] leading-relaxed text-[#CDD7D0] text-pretty">
                    {item.title}
                  </span>
                  {pillar ? (
                    <span
                      className="mt-0.5 block text-[9.5px] font-bold uppercase tracking-[0.1em]"
                      style={{ color: pillar.color }}
                    >
                      {pillar.label}
                    </span>
                  ) : null}
                </span>
                <FavoriteSaveButton compact surface="agenda_rhythm_panel" item={item} />
              </div>
              <div className="mt-2 border-t border-white/[0.06] pt-2">
                <FavoriteReminderControl item={item} surface="agenda_rhythm_panel" compact />
              </div>
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
