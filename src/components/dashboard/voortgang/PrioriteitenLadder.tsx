"use client";

import { useState } from "react";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import LadderMomentButton from "@/components/dashboard/domain/LadderMomentButton";
import FavoriteSaveButton from "@/components/dashboard/voortgang/FavoriteSaveButton";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import {
  ladderActionFavoriteId,
  parseLadderFavoriteLayer,
  type LeefstijlLadderLayer,
  type LeefstijlLayerState,
} from "@/lib/leefstijl-ladder";
import { useVoortgangFavorites } from "@/lib/voortgang-favorites-context";
import type { PillarId } from "@/types/dashboard";

export type PrioriteitLayer = LeefstijlLadderLayer;

/** Anker per laag: de ladder bovenaan het scherm scrollt hierheen. */
export function ladderLayerDomId(domain: PillarId, layerId: number): string {
  return `ladder-laag-${domain}-p${layerId}`;
}

/** Canon uit `dashboard-supplementroute-prebuild-v1` (`.pl-row`, r.1100). */
const STATE_STYLE: Record<LeefstijlLayerState, { bar: string; text: string; row: string }> = {
  winst: {
    bar: "bg-[#C8956C]",
    text: "text-[#C8956C]",
    row: "border-[#C8956C]/34 bg-[#C8956C]/[0.06]",
  },
  ok: { bar: "bg-[#5A8F6A]", text: "text-[#9CC5A9]", row: "border-white/10" },
  watch: { bar: "bg-[#C99A3C]", text: "text-[#C99A3C]", row: "border-white/10" },
  wacht: { bar: "bg-white/[0.13]", text: "text-[#7E8C82]", row: "border-white/10" },
};

type PrioriteitenLadderProps = {
  layers: readonly PrioriteitLayer[];
  intro: string;
  /** Standaard "Kies wat herkenbaar is" — past niet bij elk domein (voeding
   * heeft een volgorde, geen vrije keuze), dus overschrijfbaar per domein. */
  eyebrow?: string;
  /** Alleen doorgeven waar hij expliciet is vastgelegd — nooit hergebruiken tussen domeinen. */
  safetyNetLine?: string;
  domain: PillarId;
  surface: string;
  /**
   * Alleen meegeven waar de check ze écht oplevert (beweging, via
   * `resolveMovementLayerStates`). Zonder staten toont de ladder geen enkel
   * badge — zie de kop van dit bestand.
   */
  layerStates?: Partial<Record<number, LeefstijlLayerState>>;
  stateLabels?: Record<LeefstijlLayerState, string>;
  /** De winst-laag; die staat bij het openen van het scherm al open. */
  focusLayer?: number | null;
  whyWait?: (layerId: number) => string | null;
  /**
   * De lagen die de check aanwijst. Leeg laten waar we niets kunnen afleiden:
   * dan heet het blok "Wat je hier kunt doen" en claimt het geen aanbeveling.
   */
  recommendedLayerIds?: readonly number[];
  /** Toont de voetregel naar Mijn Dag — daar plan je en vink je af. */
  onGoAgenda?: () => void;
  /** Waar "Kies dit op Kompas" naartoe wijst — meestal `buildDashboardVandaagHref(domain)`. */
  kompasHref?: string;
  /**
   * Welke laag open staat. Alleen meegeven waar een ander blok op hetzelfde
   * scherm de ladder stuurt (de ladder in de kop van het domeinscherm);
   * zonder deze twee props houdt de ladder zijn eigen staat bij.
   */
  openLayer?: number | null;
  onOpenLayerChange?: (layerId: number | null) => void;
};

/**
 * Zelfselectie in plaats van inferentie, gegeneraliseerd uit
 * ConnectionPriorityOverview (BESLUIT_VERBINDING_SOCIAAL_PRODUCT_V1_2026-08.md
 * §S8): zes prioriteiten, geen afgeleide status. Voor domeinen zonder eigen
 * scoring-engine (stress, verbinding, voeding) is dit de eerlijke vorm —
 * winst/ok/watch/wacht-badges zouden een oordeel suggereren dat we niet kunnen
 * onderbouwen. Beweging levert die staten wél af en geeft ze mee via
 * `layerStates`; de ladder is dus één component met twee eerlijke standen.
 *
 * Elke laag draagt binnenin twee blokken: Aanbevolen (wat wij hier voorstellen)
 * en Mijn keuze (wat jij hier koos). Kiezen schrijft naar `account_favorites`
 * met een id dat zijn laag onthoudt (`ladderActionFavoriteId`), zodat dezelfde
 * keuze terugkomt op het schap en als rij op Kompas — één bron, meerdere
 * plekken. Afvinken gebeurt op Mijn Dag, niet op deze ladder.
 */
export default function PrioriteitenLadder({
  layers,
  intro,
  eyebrow = "Kies wat herkenbaar is",
  safetyNetLine,
  domain,
  surface,
  layerStates,
  stateLabels,
  focusLayer = null,
  whyWait,
  recommendedLayerIds,
  onGoAgenda,
  kompasHref,
  openLayer: controlledOpenLayer,
  onOpenLayerChange,
}: PrioriteitenLadderProps) {
  const [internalOpenLayer, setInternalOpenLayer] = useState<number | null>(
    layerStates ? focusLayer : null,
  );
  const isControlled = onOpenLayerChange != null;
  const openLayer = isControlled ? (controlledOpenLayer ?? null) : internalOpenLayer;
  const { items } = useVoortgangFavorites();

  const gekozenPerLaag = new Map<number, typeof items>();
  for (const item of items) {
    if (item.domain !== domain) continue;
    const laag = parseLadderFavoriteLayer(item.id);
    if (laag == null) continue;
    gekozenPerLaag.set(laag, [...(gekozenPerLaag.get(laag) ?? []), item]);
  }
  const gekozenTotaal = [...gekozenPerLaag.values()].reduce((sum, rows) => sum + rows.length, 0);

  function handleToggle(id: number) {
    const next = openLayer === id ? null : id;
    if (next != null) {
      trackEvent(`${domain}_ladder_layer_open`, { layer: id, surface });
      clarityTag(`${domain}_ladder_layer`, `p${id}`);
    }
    if (isControlled) {
      onOpenLayerChange(next);
      return;
    }
    setInternalOpenLayer(next);
  }

  function handleKompasClick(layerId: number) {
    trackEvent("voortgang_ladder_kompas_click", { domain, layer: layerId, surface });
    clarityTag("voortgang_ladder_kompas_click", `${domain}:p${layerId}`);
  }

  return (
    <CockpitTile ariaLabel="Je prioriteiten" eyebrow={eyebrow}>
      <p className="mb-3.5 mt-2.5 max-w-[58ch] text-[13px] leading-relaxed text-[#CDD7D0] text-pretty">
        {intro}
      </p>

      <div className="flex flex-col gap-2">
        {layers.map((layer) => {
          const isOpen = openLayer === layer.id;
          const state = layerStates?.[layer.id] ?? null;
          const styles = state ? STATE_STYLE[state] : null;
          const gekozen = gekozenPerLaag.get(layer.id) ?? [];
          const isAanbevolen = recommendedLayerIds?.includes(layer.id) ?? false;
          const waitLine = state === "wacht" ? (whyWait?.(layer.id) ?? null) : null;

          return (
            <article
              key={layer.id}
              id={ladderLayerDomId(domain, layer.id)}
              data-layer={layer.id}
              data-ls={state ?? undefined}
              data-open={isOpen ? "true" : undefined}
              className={`relative overflow-hidden rounded-[14px] border bg-black/20 transition-colors ${
                isOpen
                  ? "border-[#5A8F6A]/45 bg-[#5A8F6A]/[0.07]"
                  : (styles?.row ?? "border-white/10")
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute bottom-0 left-0 top-0 w-1 ${
                  styles ? styles.bar : isOpen ? "bg-[#5A8F6A]" : "bg-white/[0.14]"
                }`}
              />
              <button
                type="button"
                onClick={() => handleToggle(layer.id)}
                aria-expanded={isOpen}
                className="flex w-full cursor-pointer items-start gap-3 border-none bg-transparent px-3.5 py-3 pl-5 text-left font-[inherit]"
              >
                <span
                  aria-hidden="true"
                  className="min-w-[34px] shrink-0 pt-[3px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.06em] text-[#7E8C82]"
                >
                  P{layer.id}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-[16px] leading-tight text-[#F1EFE8]">
                    {layer.name}
                  </span>
                  {state && styles && stateLabels ? (
                    <span
                      className={`mt-1 block text-[9.5px] font-bold uppercase tracking-[0.14em] ${styles.text}`}
                    >
                      {stateLabels[state]}
                    </span>
                  ) : null}
                  {layer.subtitle ? (
                    <span className="mt-1 block text-[12.5px] leading-snug text-[#9FB0A6]">
                      {layer.subtitle}
                    </span>
                  ) : null}
                  {gekozen.length > 0 ? (
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#5A8F6A]/45 bg-[#5A8F6A]/[0.14] px-2 py-0.5 text-[10.5px] font-semibold text-[#9CC5A9]">
                      <Icons.Check s={11} />
                      {gekozen.length} gekozen
                    </span>
                  ) : null}
                </span>
                <span
                  aria-hidden="true"
                  className={`shrink-0 pt-1 text-[13px] text-[#7E8C82] transition-transform ${
                    isOpen ? "rotate-90" : ""
                  }`}
                >
                  <Icons.ChevronRight s={15} />
                </span>
              </button>

              {isOpen ? (
                <div className="border-t border-white/[0.06] px-3.5 pb-4 pl-5">
                  <p className="mt-3 max-w-[60ch] text-[12.5px] leading-relaxed text-[#CDD7D0] text-pretty">
                    {layer.summary}
                  </p>
                  {waitLine ? (
                    <p className="mt-3 max-w-[58ch] border-l border-white/10 pl-2.5 text-[11.5px] leading-relaxed text-[#7E8C82] text-pretty">
                      {waitLine}
                    </p>
                  ) : null}

                  {layer.actions.length > 0 ? (
                    <>
                      <p className="mb-2 mt-4 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
                        {isAanbevolen ? "Aanbevolen na je check" : "Wat je hier kunt doen"}
                      </p>
                      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                        {layer.actions.map((action) => (
                          <li
                            key={action}
                            className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-l border-[#5A8F6A]/40 pl-2.5"
                          >
                            <span className="min-w-[16ch] flex-1 text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
                              {action}
                            </span>
                            <FavoriteSaveButton
                              surface={surface}
                              labels={{ save: "Zet bij Mijn keuze", saved: "Staat bij Mijn keuze" }}
                              item={{
                                id: ladderActionFavoriteId(domain, layer.id, action),
                                title: action,
                                kind: "activiteit",
                                domain,
                                source: isAanbevolen ? "aanbevolen" : "mijn_keuze",
                              }}
                            />
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}

                  <p className="mb-2 mt-4 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
                    Mijn keuze op deze laag
                  </p>
                  {gekozen.length === 0 ? (
                    <p className="max-w-[58ch] text-[12px] leading-relaxed text-[#7E8C82] text-pretty">
                      Hier koos je nog niets. Dat hoeft ook niet — de laag lezen kost je niets en
                      verplicht je tot niets.
                    </p>
                  ) : (
                    <ul className="m-0 flex list-none flex-col gap-2 p-0">
                      {gekozen.map((item) => (
                        <li
                          key={item.id}
                          className="rounded-[10px] border border-[#5A8F6A]/30 bg-[#5A8F6A]/[0.07] px-2.5 py-2"
                        >
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                            <span className="min-w-[16ch] flex-1 text-[12.5px] leading-relaxed text-[#CDD7D0] text-pretty">
                              {item.title}
                            </span>
                            <FavoriteSaveButton compact surface={surface} item={item} />
                          </div>
                          {/* Plannen komt ná kiezen, niet ernaast: Voortgang is
                              de plek waar je onderbouwt wat je kiest, en mag
                              geen tweede agenda worden. */}
                          <div className="mt-2">
                            <LadderMomentButton
                              domain={domain}
                              title={item.title}
                              surface={surface}
                              layer={layer.id}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {kompasHref ? (
                    <a
                      href={kompasHref}
                      onClick={() => handleKompasClick(layer.id)}
                      className="mt-3 inline-flex cursor-pointer items-center gap-1 text-[13px] font-semibold text-[#9CC5A9] no-underline"
                    >
                      Kies dit op Kompas <Icons.ChevronRight s={13} />
                    </a>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {onGoAgenda ? (
        <div className="mt-4 border-t border-white/[0.06] pt-3">
          <p className="max-w-[62ch] text-[11.5px] leading-relaxed text-[#7E8C82] text-pretty">
            {gekozenTotaal === 0
              ? "Wat je hier kiest, landt bij Mijn keuze op Kompas — naam en herkomst, geen merk en geen prijs. Afvinken doe je op Mijn Dag."
              : `Je koos ${gekozenTotaal} ${gekozenTotaal === 1 ? "handeling" : "handelingen"} op deze ladder. Plan ze op Mijn Dag om af te vinken.`}
          </p>
          <button
            type="button"
            onClick={onGoAgenda}
            className="mt-1.5 cursor-pointer border-none bg-transparent p-0 text-left text-[13px] font-semibold text-[#9CC5A9]"
          >
            Open Mijn Dag ›
          </button>
        </div>
      ) : null}

      {safetyNetLine ? (
        <p className="mt-4 max-w-[62ch] border-t border-white/[0.06] pt-3 text-[11px] leading-relaxed text-[#7E8C82]">
          {safetyNetLine}
        </p>
      ) : null}
    </CockpitTile>
  );
}
