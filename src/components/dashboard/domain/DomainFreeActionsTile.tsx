"use client";

import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import LadderActionRow from "@/components/dashboard/domain/LadderActionRow";
import type { PillarId } from "@/types/dashboard";

export type DomainFreeActionsTileProps = {
  domain: PillarId;
  layerId: number;
  layerName: string;
  actions: readonly string[];
  /** Of deze laag de winst-laag uit de check is — stuurt alleen de kop-copy. */
  isRecommended?: boolean;
  /**
   * Waarom hier niets klaarstaat. Alleen op de lagen zonder acties: dan legt
   * het blok uit waarom, in plaats van te verdwijnen onder je vinger.
   */
  emptyLine?: string | null;
  /** Hoeveel opties er maximaal in beeld komen. Slaap toont er twee, wij drie. */
  maxActions?: number;
  surface: string;
};

/**
 * De gratis opties op de laag die je in de ladder aanklikte — voor elk domein
 * met een leefstijlladder, niet alleen beweging.
 *
 * Bron is altijd `LeefstijlLadderLayer.actions`, dezelfde als de ladder op
 * Voortgang, dus Vandaag en Voortgang kunnen niet uiteenlopen (lock 4). Wat je
 * hier kunt kopen of uitbesteden staat op het schap, niet hier: gratis blijft
 * gratis en ongegate (lock 1 / N4).
 *
 * Wat er per optie te dóén valt staat niet in dit bestand maar in
 * `resolveLadderAffordances` — zo is een nieuwe handeling (een timer, een
 * wearable-uitlezing) een regel daar plus een renderer in `LadderActionRow`,
 * en niet een verbouwing van dit blok of van het domeinscherm eromheen.
 */
export default function DomainFreeActionsTile({
  domain,
  layerId,
  layerName,
  actions,
  isRecommended = false,
  emptyLine = null,
  maxActions = 3,
  surface,
}: DomainFreeActionsTileProps) {
  const eyebrow = `Gratis, op prioriteit ${layerId} · ${layerName.toLowerCase()}`;

  if (actions.length === 0) {
    if (!emptyLine) {
      return null;
    }
    return (
      <CockpitTile eyebrow={eyebrow}>
        <p className="mt-2.5 max-w-[58ch] text-[12.5px] leading-relaxed text-[#CDD7D0] text-pretty">
          {emptyLine}
        </p>
      </CockpitTile>
    );
  }

  return (
    <CockpitTile eyebrow={eyebrow}>
      {isRecommended ? (
        <p className="mb-2.5 mt-2 max-w-[58ch] text-[12.5px] leading-relaxed text-[#CDD7D0] text-pretty">
          Dit is de laag waar je winst nu zit. Wat hier staat kost niets en komt uit je check.
        </p>
      ) : null}
      <ul className="m-0 flex list-none flex-col gap-0 p-0">
        {actions.slice(0, maxActions).map((action) => (
          <LadderActionRow
            key={action}
            domain={domain}
            layerId={layerId}
            action={action}
            isRecommended={isRecommended}
            surface={surface}
          />
        ))}
      </ul>
      <p className="mt-2.5 text-[11px] leading-relaxed text-[#7E8C82]">
        Hier verdienen we niets aan. Ze komen uit je check, niet uit een schap.
      </p>
    </CockpitTile>
  );
}
