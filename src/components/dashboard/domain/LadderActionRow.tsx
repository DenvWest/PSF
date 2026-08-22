"use client";

import type { ReactNode } from "react";
import LadderMomentButton from "@/components/dashboard/domain/LadderMomentButton";
import FavoriteSaveButton from "@/components/dashboard/voortgang/FavoriteSaveButton";
import { ladderActionFavoriteId } from "@/lib/leefstijl-ladder";
import {
  resolveLadderAffordances,
  type LadderAffordanceId,
} from "@/lib/ladder-affordances";
import type { PillarId } from "@/types/dashboard";

export type LadderActionRowProps = {
  domain: PillarId;
  layerId: number;
  /** De actietekst. Is tegelijk de titel van het agenda-blok en de favoriet. */
  action: string;
  /** Of deze laag de winst-laag uit de check is — stuurt alleen de herkomst. */
  isRecommended: boolean;
  surface: string;
  /**
   * Smalle kolom: tekst bóven de handelingen, en de knoppen mogen breken.
   * De contextkolom is ~288px bij `xl` en ~320px in de bottom sheet; twee
   * knoppen naast elkaar zijn daar samen breder dan de kaart, en `shrink-0`
   * laat ze dan buiten de rand lopen in plaats van af te breken.
   */
  dense?: boolean;
};

/**
 * Eén gratis optie: de zin links, wat je ermee kunt rechts.
 *
 * De vorm komt van slaap v2 `renderKActies()` — tekst en handeling op één
 * regel, niet onder elkaar. Dat scheelt niet alleen hoogte: drie opties met
 * elk twee gestapelde knoppen lazen als een formulier, terwijl het een lijstje
 * is waar je uit kiest.
 *
 * Welke handelingen er staan beslist {@link resolveLadderAffordances}, niet dit
 * bestand. Hier staat alleen hóé ze eruitzien. Een handeling die nog niet
 * gebouwd is rendert `null` — zichtbaar in de kaart hieronder, onzichtbaar op
 * het scherm, en aanzetten is één regel.
 */
const AFFORDANCE_RENDERERS: Record<
  LadderAffordanceId,
  (props: LadderActionRowProps) => ReactNode
> = {
  keuze: ({ domain, layerId, action, isRecommended, surface }) => (
    <FavoriteSaveButton
      surface={surface}
      labels={{ save: "Zet bij Mijn keuze", saved: "Staat bij Mijn keuze" }}
      item={{
        id: ladderActionFavoriteId(domain, layerId, action),
        title: action,
        kind: "activiteit",
        domain,
        source: isRecommended ? "aanbevolen" : "mijn_keuze",
      }}
    />
  ),
  moment: ({ domain, layerId, action, surface }) => (
    <LadderMomentButton domain={domain} title={action} surface={surface} layer={layerId} />
  ),
  timer: () => null,
  meting: () => null,
  dienst: () => null,
};

export default function LadderActionRow(props: LadderActionRowProps) {
  const { domain, layerId, action, dense = false } = props;
  const affordances = resolveLadderAffordances({ domain, layerId, action });

  return (
    <li
      className={`flex flex-wrap gap-x-3 gap-y-2 border-t border-white/[0.06] py-2.5 first:border-t-0 first:pt-0 ${
        dense ? "flex-col items-start" : "items-center justify-between"
      }`}
    >
      <p className="m-0 min-w-[18ch] flex-1 text-[12.5px] leading-relaxed text-[#CDD7D0] text-pretty">
        {action}
      </p>
      <div
        className={`flex flex-wrap items-center gap-2 ${dense ? "w-full" : "shrink-0"}`}
      >
        {affordances.map((id) => (
          <div key={id}>{AFFORDANCE_RENDERERS[id](props)}</div>
        ))}
      </div>
    </li>
  );
}
