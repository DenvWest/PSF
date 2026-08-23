"use client";

import * as Icons from "@/components/app/icons";
import FavoriteSaveButton from "@/components/dashboard/voortgang/FavoriteSaveButton";
import { parseLadderFavoriteLayer } from "@/lib/leefstijl-ladder";
import { useVoortgangFavorites } from "@/lib/voortgang-favorites-context";
import {
  resolveDomainLadderReadout,
  resolveLadderLayerReason,
} from "@/lib/domain-ladder-readout";
import { ladderKeuzehartSurface } from "@/lib/ladder-keuzehart";
import { getLeefstijlLadder } from "@/lib/leefstijl-ladder";
import type { DashboardData, PillarId } from "@/types/dashboard";

type DomainLadderContextPanelProps = {
  domain: PillarId;
  layerId: number;
  data?: DashboardData;
  /** Compactere maten in de bottom sheet — zelfde schaal als CockpitInspector. */
  compact?: boolean;
};

/**
 * De contextkolom op een domeinscherm: **onderbouwing, geen tweede werkplek.**
 *
 * Twee zones, en allebei beantwoorden ze een vraag die het midden níét kan
 * beantwoorden:
 *
 * 1. **Waarom déze laag** — welke laag je leest, welke staat hij heeft, en de
 *    zin uit je check die dat verklaart (`resolveLadderLayerReason`). Is er
 *    geen reden, dan staat er geen redenblok. Nooit een reden verzinnen.
 * 2. **Wat jij hier koos** — de keuzes op déze laag, met het hart om ze weer
 *    weg te halen. Domeinbreed en over domeinen heen woont je archief op
 *    Favorieten.
 *
 * Tot 23 augustus stonden hier vier zones. Twee ervan waren een spiegel van de
 * middenkolom: een laag-navigator naast de ladder die daar al staat, en de
 * rang-1-actie mét save-knop naast `DomainFreeActionsTile` die dezelfde actie
 * met dezelfde sleutel toont. Ook `layer.summary` en de "terug naar de
 * winst-laag"-knop stonden twee keer in beeld
 * ([`DomainKompasScreen.tsx`](./DomainKompasScreen.tsx) r.144 en r.149).
 *
 * Lock N6 bewaakte de vórm van die navigator — alleen `id` + staat, geen namen
 * — maar niet de vraag. Twee dingen die allebei "wissel van laag" beantwoorden
 * zijn er één te veel, ook als de tweede kaler is. En de spiegel was bedoeld
 * als vervanging voor smalle schermen (roadmap C-b: onder 1280px is deze kolom
 * dicht), niet als toevoeging op brede — precies wat hij wél werd.
 *
 * Daarmee vervalt R2 ("save primair in de zijbalk") als ontwerprichting: het
 * midden is de werkplek op elke breedte, deze kolom legt uit waaróm. Het
 * blijft één bewaar-bron — `account_favorites`, sleutel
 * `laag-<domein>-p<n>-<slug>` — dus wat je in het midden bewaart verschijnt
 * hier meteen onder Mijn keuze.
 *
 * Wat hier níét staat: afvinken (dat woont op Mijn Dag), een deur naar het
 * schap, en een tweede "Open Mijn Dag"-CTA — die blijft onderaan het
 * domeinscherm staan.
 */
export default function DomainLadderContextPanel({
  domain,
  layerId,
  data,
  compact = false,
}: DomainLadderContextPanelProps) {
  const { items } = useVoortgangFavorites();
  const ladder = getLeefstijlLadder(domain);
  const layer = ladder?.layers.find((row) => row.id === layerId) ?? null;

  if (!ladder || !layer) {
    return null;
  }

  const gekozen = items.filter(
    (item) => item.domain === domain && parseLadderFavoriteLayer(item.id) === layer.id,
  );

  const readout = resolveDomainLadderReadout(domain, data);
  const state = readout?.layerStates[layer.id] ?? null;
  const stateLabel = state && readout ? readout.stateLabels[state] : null;
  const isFocus = readout != null && layer.id === readout.focusLayer;
  const reason = resolveLadderLayerReason(readout, layer.id);
  const surface = ladderKeuzehartSurface(domain);

  const cardClass = `rounded-[14px] border bg-black/20 ${compact ? "p-3" : "p-4"}`;
  const kickerClass =
    "mb-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em]";

  return (
    <>
      <section
        aria-label="Waarom deze laag"
        className={`${cardClass} ${isFocus ? "border-[rgba(200,149,108,0.4)]" : "border-white/10"}`}
      >
        <span className={`${kickerClass} ${isFocus ? "text-[#C8956C]" : "text-[#9FB0A6]"}`}>
          <Icons.RouteMap s={13} style={{ color: isFocus ? "#C8956C" : "#9FB0A6" }} />
          {stateLabel ? `Prioriteit ${layer.id} · ${stateLabel}` : `Prioriteit ${layer.id}`}
        </span>
        <h3
          className={`font-serif leading-tight text-[#F1EFE8] ${
            compact ? "text-[15px]" : "text-[16px]"
          }`}
        >
          {layer.name}
        </h3>

        {reason ? (
          <div className="mt-2.5 border-l border-white/10 pl-2.5">
            {reason.kind === "bewijs" ? (
              <>
                <p className="text-[11px] leading-snug text-[#CDD7D0]">
                  <span className="font-semibold">{reason.label}:</span> {reason.answerLabel}
                  {reason.benchmarkLabel ? (
                    <span className="text-[#7E8C82]"> · {reason.benchmarkLabel}</span>
                  ) : null}
                </p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
                  {reason.whyLine}
                </p>
              </>
            ) : (
              <p className="text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
                {reason.line}
              </p>
            )}
          </div>
        ) : (
          /* Geen reden uit de check betekent: geen reden tonen. De laag zelf
             staat in het midden — daar lees je wat hij inhoudt en kies je. */
          <p className="mt-2.5 text-[11.5px] leading-relaxed text-[#7E8C82] text-pretty">
            Je check zegt hier niets aparts over. Wat deze prioriteit inhoudt lees je in de
            ladder.
          </p>
        )}
      </section>

      <section aria-label="Mijn keuze op deze laag" className={`${cardClass} border-white/10`}>
        <span className={`${kickerClass} text-[#9FB0A6]`}>
          <Icons.Heart s={13} style={{ color: "#9FB0A6" }} /> Mijn keuze op deze laag
        </span>
        {gekozen.length === 0 ? (
          <p className="text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
            Hier koos je nog niets. Dat hoeft ook niet — de laag lezen kost je niets en
            verplicht je tot niets.
          </p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-0 p-0">
            {gekozen.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-2.5 border-0 border-t border-white/[0.06] py-2.5 first:border-t-0 first:pt-0"
              >
                <span className="min-w-0 flex-1 text-[12.5px] leading-relaxed text-[#CDD7D0] text-pretty">
                  {item.title}
                </span>
                <FavoriteSaveButton compact surface={surface} item={item} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
