"use client";

import * as Icons from "@/components/app/icons";
import FavoriteSaveButton from "@/components/dashboard/voortgang/FavoriteSaveButton";
import { parseLadderFavoriteLayer } from "@/lib/leefstijl-ladder";
import { useVoortgangFavorites } from "@/lib/voortgang-favorites-context";
import { ladderKeuzehartSurface } from "@/lib/ladder-keuzehart";
import { getLeefstijlLadder } from "@/lib/leefstijl-ladder";
import type { PillarId } from "@/types/dashboard";

type DomainLadderContextPanelProps = {
  domain: PillarId;
  layerId: number;
  /** Compactere maten in de bottom sheet — zelfde schaal als CockpitInspector. */
  compact?: boolean;
};

/**
 * Eén zone van de contextkolom: **wat jij op déze laag koos**, met het hart om
 * het weer weg te halen. Domeinbreed en over domeinen heen woont je archief op
 * Favorieten.
 *
 * Tot 23 augustus stonden hier vier zones, daarna twee. De tweede — *waarom
 * deze laag* — is op 26 augustus verhuisd naar `KompasContextSpine`: die vraag
 * geldt óók op de Kompas-home, waar geen laag is aangeklikt, en twee
 * implementaties van dezelfde zin lopen uiteen. Deze zone blijft hier, want hij
 * bestaat alleen zolang er een laag open staat.
 *
 * Wat hier níét staat: afvinken (dat woont op Mijn Dag), een deur naar het
 * schap, en een tweede "Open Mijn Dag"-CTA — die blijft onderaan het
 * domeinscherm staan.
 */
export default function DomainLadderContextPanel({
  domain,
  layerId,
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

  const surface = ladderKeuzehartSurface(domain);

  return (
    <section
      aria-label="Mijn keuze op deze laag"
      className={`rounded-[14px] border border-white/10 bg-black/20 ${compact ? "p-3" : "p-4"}`}
    >
      <span className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#9FB0A6]">
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
  );
}
