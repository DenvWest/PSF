"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import LadderMomentButton from "@/components/dashboard/domain/LadderMomentButton";
import { resolveLadderAffordances } from "@/lib/ladder-affordances";
import { FactMicroReeks } from "@/components/dashboard/voortgang/MeetreeksChart";
import FavoriteSaveButton from "@/components/dashboard/voortgang/FavoriteSaveButton";
import { clarityTag } from "@/lib/clarity";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import type { LadderEvidenceRow } from "@/lib/domain-ladder-readout";
import { trackEvent } from "@/lib/ga4";
import {
  isCadenceLadderAction,
  ladderActionFavoriteId,
  parseLadderFavoriteLayer,
  type LeefstijlLadderLayer,
  type LeefstijlLayerState,
} from "@/lib/leefstijl-ladder";
import { useVoortgangFavorites } from "@/lib/voortgang-favorites-context";
import type { Meetreeks } from "@/lib/voortgang-meetreeks";
import type { PillarId } from "@/types/dashboard";

export type PrioriteitLayer = LeefstijlLadderLayer;

/**
 * Waar zijn antwoord staat ten opzichte van de richtlijn ernaast.
 *
 * Feit, geen cijfer: "onder" en "rond" zeggen waar hij staat zonder een
 * afstand te noemen die de zelfrapportage niet draagt. `own` krijgt geen merk
 * — daar is geen lat, dus is er niets om onder te staan.
 */
const STATUS_MARK: Record<
  NonNullable<LadderEvidenceRow["status"]>,
  { label: string; className: string } | null
> = {
  below: { label: "hier zit je onder", className: "text-[#C8956C]" },
  near: { label: "hier zit je rond", className: "text-[#C99A3C]" },
  meets: { label: "die haal je", className: "text-[#9CC5A9]" },
  own: null,
};

/** Anker per laag: de ladder bovenaan het scherm scrollt hierheen. */
export function ladderLayerDomId(domain: PillarId, layerId: number): string {
  return `ladder-laag-${domain}-p${layerId}`;
}

/** Canon uit `dashboard-supplementroute-prebuild-v1` (`.pl-row`, r.1100). */
const STATE_STYLE: Record<LeefstijlLayerState, { bar: string; text: string }> = {
  winst: {
    bar: "bg-[#C8956C]",
    text: "text-[#C8956C]",
  },
  ok: { bar: "bg-[#5A8F6A]", text: "text-[#9CC5A9]" },
  watch: { bar: "bg-[#C99A3C]", text: "text-[#C99A3C]" },
  wacht: { bar: "bg-white/[0.13]", text: "text-[#7E8C82]" },
};

type PrioriteitenLadderProps = {
  layers: readonly PrioriteitLayer[];
  /** `null` waar `flowIntro` de volgorde al draagt — dan geen tweede alinea. */
  intro: string | null;
  /** Standaard "Kies wat herkenbaar is" — past niet bij elk domein (voeding
   * heeft een volgorde, geen vrije keuze), dus overschrijfbaar per domein. */
  eyebrow?: string;
  /** Alleen doorgeven waar hij expliciet is vastgelegd — nooit hergebruiken tussen domeinen. */
  safetyNetLine?: string;
  domain: PillarId;
  surface: string;
  /**
   * Alleen meegeven waar de check ze écht oplevert. Zonder staten toont de
   * ladder geen enkel badge — zie de kop van dit bestand.
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
   * Welke vraag deze ladder beantwoordt.
   *
   * - `"choose"` — de ladder ís de werkplek: elke laag draagt een save-knop,
   *   wat je koos, en de knop om er een moment voor te zetten. Dit is de stand
   *   voor domeinen zonder eigen Kompas-domeinscherm (vandaag alleen
   *   verbinding, dat op Kompas nog een prebuild-iframe is en dus niets kan
   *   opslaan).
   * - `"explain"` — de ladder is het dossier: jij mat, de lat, jij koos.
   *   Kiezen gebeurt op Kompas. Geen save, geen plan-knop.
   */
  variant?: "choose" | "explain";
  /**
   * Welke laag open staat. Alleen meegeven waar een ander blok op hetzelfde
   * scherm de ladder stuurt; zonder deze twee props houdt de ladder zijn
   * eigen staat bij. `null` is de start zonder readout — een tab opnieuw
   * tikken zet hem niet terug naar null.
   */
  openLayer?: number | null;
  onOpenLayerChange?: (layerId: number | null) => void;
  /** Feiten uit de check, gegroepeerd per laag. Lege sleuven weglaten. */
  evidenceByLayer?: Partial<Record<number, readonly LadderEvidenceRow[]>>;
  /** De cyclusreeks van dit domein — voedt de micro-reeks van één feit. */
  meetreeks?: Meetreeks | null;
  /** Kleur van de micro-reeks; default de sage van het dashboard. */
  chartColor?: string;
  /** Extra in een open laag — P6: supplementpoort + wearable-sleuf. */
  layerExtra?: (layerId: number) => ReactNode;
  /**
   * De lagen die de doorlopende volgorde dragen — bij alle vijf domeinen
   * P1–P4. Wat daarbuiten valt (P5 meten, P6 aanvullen) staat los achter de
   * lijn: dat zijn geen stappen die je afrondt maar lagen bovenop een
   * staande basis. Weglaten = geen lijn, alle stappen los.
   */
  flowSteps?: readonly number[];
  /**
   * Staten voor de stepper waar ze afwijken van `layerStates` — voeding leest
   * P4 uit de toereikendheid, niet uit de laagstaat. Zonder deze prop volgt
   * de stepper `layerStates`.
   */
  stepStates?: Partial<Record<number, LeefstijlLayerState>>;
  /** Eén regel boven de stepper die de volgorde uitlegt. Optioneel per domein. */
  flowIntro?: string;
};

function stepPhase(state: LeefstijlLayerState | undefined): "voltooid" | "bezig" | "wacht" {
  if (state === "ok") return "voltooid";
  if (state === "winst" || state === "watch") return "bezig";
  return "wacht";
}

/**
 * De enige besturing van de ladder: zes genummerde knoppen met de naam van
 * hun laag eronder. Verving de dubbele rij van augustus (roadmap-bollen bóven
 * een rij P1–P6-chips die exact hetzelfde deden) — één rij, geen "P" meer op
 * het scherm, en de bol zelf is de knop.
 *
 * De lijn loopt alleen door de lagen in `flowSteps`. Wat daarbuiten valt
 * krijgt een spatie in plaats van een streep: de intro belooft een piramide
 * ("wat eronder staat telt pas mee"), en een doorlopende lijn naar P6 zou van
 * aanvullen een eindstation maken.
 */
function LagenStepper({
  layers,
  flowSteps,
  stepStates,
  stateLabels,
  gekozenPerLaag,
  openLayer,
  domain,
  onSelect,
  onKeyDown,
  tabRefs,
}: {
  layers: readonly PrioriteitLayer[];
  flowSteps: readonly number[];
  stepStates: Partial<Record<number, LeefstijlLayerState>>;
  stateLabels?: Record<LeefstijlLayerState, string>;
  gekozenPerLaag: Map<number, readonly unknown[]>;
  openLayer: number | null;
  domain: PillarId;
  onSelect: (step: number) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, step: number) => void;
  tabRefs: RefObject<Map<number, HTMLButtonElement>>;
}) {
  return (
    <div
      role="tablist"
      aria-label="Lagen"
      className="-mx-1 mb-4 flex flex-nowrap items-start gap-0 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]"
    >
      {layers.map((layer, index) => {
        const state = stepStates[layer.id];
        const phase = stepPhase(state);
        const isOpen = openLayer === layer.id;
        const gekozenCount = gekozenPerLaag.get(layer.id)?.length ?? 0;
        const stateLabel = state && stateLabels ? stateLabels[state] : null;
        const isTabStop = isOpen || (openLayer == null && index === 0);
        const bolClass =
          phase === "voltooid"
            ? "bg-[#5A8F6A] text-[#E7EDE8]"
            : phase === "bezig"
              ? "bg-[#C8956C] text-[#1A2620]"
              : "bg-white/[0.13] text-[#9FB0A6]";
        const nextLayer = layers[index + 1];
        const inFlow =
          nextLayer != null &&
          flowSteps.includes(layer.id) &&
          flowSteps.includes(nextLayer.id);

        return (
          <div key={layer.id} className="flex min-w-0 flex-1 items-start">
            <button
              type="button"
              role="tab"
              id={ladderLayerDomId(domain, layer.id)}
              aria-selected={isOpen}
              aria-controls={
                isOpen ? `${ladderLayerDomId(domain, layer.id)}-paneel` : undefined
              }
              aria-label={tabAccessibleName(layer, stateLabel, gekozenCount)}
              tabIndex={isTabStop ? 0 : -1}
              data-layer={layer.id}
              data-ls={state ?? undefined}
              data-open={isOpen ? "true" : undefined}
              ref={(node) => {
                if (node) {
                  tabRefs.current.set(layer.id, node);
                } else {
                  tabRefs.current.delete(layer.id);
                }
              }}
              onClick={() => onSelect(layer.id)}
              onKeyDown={(event) => onKeyDown(event, layer.id)}
              className={`flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1 border-none bg-transparent p-0 pt-0.5 font-[inherit] transition-opacity ${
                isOpen ? "opacity-100" : "opacity-70 hover:opacity-95"
              }`}
            >
              <span
                className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${bolClass} ${
                  isOpen ? "ring-2 ring-[#5A8F6A] ring-offset-2 ring-offset-[#16221C]" : ""
                }`}
              >
                {layer.id}
                {gekozenCount > 0 ? (
                  <span
                    aria-hidden="true"
                    className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-[#16221C] text-[#9CC5A9]"
                  >
                    <Icons.Check s={9} />
                  </span>
                ) : null}
              </span>
              <span
                aria-hidden="true"
                className={`max-w-[6rem] text-center text-[10px] font-semibold leading-tight text-balance ${
                  isOpen ? "text-[#E7EDE8]" : "text-[#9FB0A6]"
                }`}
              >
                {layer.name}
              </span>
            </button>
            {nextLayer != null ? (
              <span
                aria-hidden
                className={`mx-0.5 mt-3.5 h-px min-w-[8px] flex-1 ${
                  inFlow ? "bg-white/15" : "bg-transparent"
                }`}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function tabAccessibleName(
  layer: PrioriteitLayer,
  stateLabel: string | null,
  gekozenCount: number,
): string {
  const parts = [`P${layer.id}`, layer.name];
  if (stateLabel) parts.push(stateLabel);
  if (gekozenCount > 0) {
    parts.push(`${gekozenCount} gekozen`);
  }
  return parts.join(" · ");
}

/**
 * De lat met zijn bron, zonder die bron twee keer te noemen.
 *
 * De meeste `benchmarkLabel`s dragen hun bron al tussen haakjes
 * ("…(WHO 2020)"), en `benchmarkSource` bevat dan exact hetzelfde. Blind
 * aanplakken gaf regels als "…(WHO 2015) (WHO 2015) · die haal je".
 */
function latRegel(fact: LadderEvidenceRow): string {
  const label = fact.benchmarkLabel ?? "";
  const source = fact.benchmarkSource;
  if (!source || label.includes(source)) {
    return label;
  }
  return `${label} (${source})`;
}

function LayerEvidence({
  facts,
  meetreeks,
  chartColor,
  openFactKey,
  onToggleFact,
}: {
  facts: readonly LadderEvidenceRow[];
  meetreeks: Meetreeks | null;
  chartColor: string;
  openFactKey: string | null;
  onToggleFact: (key: string) => void;
}) {
  if (facts.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <p className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
        Jij mat
      </p>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {facts.map((fact) => {
          const reeksRow = meetreeks?.valueRows.find((row) => row.key === fact.key) ?? null;
          const canPlot = reeksRow?.plottable === true;
          const isOpen = openFactKey === fact.key;
          const showLat =
            Boolean(fact.benchmarkLabel) &&
            (reeksRow == null || reeksRow.scale === "richtlijn");
          // Waar hij staat ten opzichte van die lat, in drie woorden. Alleen
          // waar er een lat ís: zonder richtlijn is er niets om onder of boven
          // te staan, en dan zou dit een oordeel verzinnen dat we niet hebben.
          const statusMark = showLat ? STATUS_MARK[fact.status ?? "own"] : null;

          return (
            <li key={fact.key}>
              {canPlot ? (
                <button
                  type="button"
                  onClick={() => onToggleFact(fact.key)}
                  aria-expanded={isOpen}
                  className="w-full cursor-pointer border-none bg-transparent p-0 text-left font-[inherit]"
                >
                  <span className="block text-[13px] leading-snug text-[#F1EFE8]">
                    {fact.label}
                    {" · "}
                    {fact.answerLabel}
                  </span>
                  <span className="mt-0.5 block text-[11.5px] text-[#9CC5A9]">
                    {isOpen ? "Verberg de reeks" : "Over tijd"}
                  </span>
                </button>
              ) : (
                <p className="m-0 text-[13px] leading-snug text-[#F1EFE8]">
                  {fact.label}
                  {" · "}
                  {fact.answerLabel}
                </p>
              )}

              {showLat ? (
                <p className="mt-1 text-[12px] leading-relaxed text-[#9FB0A6] text-pretty">
                  <span className="font-semibold uppercase tracking-[0.08em] text-[#7E8C82]">
                    De lat
                  </span>
                  {" · "}
                  {latRegel(fact)}
                  {statusMark ? (
                    <>
                      {" · "}
                      <span className={statusMark.className}>{statusMark.label}</span>
                    </>
                  ) : null}
                </p>
              ) : (
                <p className="mt-1 text-[12px] leading-relaxed text-[#7E8C82] text-pretty">
                  Geen richtlijn — dit is jouw eigen antwoord.
                </p>
              )}

              {fact.whyLine ? (
                <p className="mt-1 text-[11.5px] leading-relaxed text-[#7E8C82] text-pretty">
                  {fact.whyLine}
                </p>
              ) : null}

              {fact.footnote ? (
                <p className="mt-1 text-[11.5px] leading-relaxed text-[#7E8C82] text-pretty">
                  {fact.footnote}
                </p>
              ) : null}

              {isOpen && reeksRow && meetreeks ? (
                <FactMicroReeks
                  row={reeksRow}
                  moments={meetreeks.moments}
                  color={chartColor}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Zelfselectie in plaats van inferentie, gegeneraliseerd uit
 * ConnectionPriorityOverview: zes prioriteiten, geen afgeleide status. Voor
 * domeinen zonder eigen scoring-engine is dit de eerlijke vorm. Beweging,
 * slaap en stress leveren staten via `layerStates`.
 *
 * In `explain` is de open laag het dossier (jij mat · de lat · jij koos) en
 * de deur naar Kompas. Afvinken gebeurt op Mijn Dag, niet op deze ladder.
 *
 * De lagen staan als horizontale tabs: P1–P6 boven, het resultaat van de
 * gekozen laag vult het paneel. Dat laat later een dag-as onder de rij toe
 * zonder de P-knoppen te herbouwen.
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
  variant = "choose",
  openLayer: controlledOpenLayer,
  onOpenLayerChange,
  evidenceByLayer,
  meetreeks = null,
  chartColor = "#5A8F6A",
  layerExtra,
  flowSteps,
  stepStates,
  flowIntro,
}: PrioriteitenLadderProps) {
  const isWerkplek = variant === "choose";
  const [internalOpenLayer, setInternalOpenLayer] = useState<number | null>(
    layerStates ? focusLayer : null,
  );
  const [openFactKey, setOpenFactKey] = useState<string | null>(null);
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
  const tabRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const openLayerData = layers.find((layer) => layer.id === openLayer) ?? null;

  function handleSelect(id: number) {
    if (openLayer === id) return;
    setOpenFactKey(null);
    trackEvent(`${domain}_ladder_layer_open`, { layer: id, surface });
    if (domain === "voeding" && flowSteps?.includes(id)) {
      trackEvent("nutrition_roadmap_step_opened", { step: id, surface });
      emitAccountClientEvent("nutrition.roadmap_step_opened", { step: id, surface });
      clarityTag("nutrition_roadmap_step", `p${id}`);
    }
    clarityTag(`${domain}_ladder_layer`, `p${id}`);
    if (isControlled) {
      onOpenLayerChange(id);
      return;
    }
    setInternalOpenLayer(id);
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentId: number) {
    const ids = layers.map((layer) => layer.id);
    const index = ids.indexOf(currentId);
    if (index < 0) return;

    let nextId: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextId = ids[(index + 1) % ids.length] ?? null;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextId = ids[(index - 1 + ids.length) % ids.length] ?? null;
    } else if (event.key === "Home") {
      nextId = ids[0] ?? null;
    } else if (event.key === "End") {
      nextId = ids[ids.length - 1] ?? null;
    }
    if (nextId == null) return;

    event.preventDefault();
    handleSelect(nextId);
    tabRefs.current.get(nextId)?.focus();
  }

  function handleToggleFact(key: string) {
    const next = openFactKey === key ? null : key;
    setOpenFactKey(next);
    if (next != null) {
      trackEvent("dashboard_voortgang_feit_reeks_open", { domain, fact_key: key });
      clarityTag("dashboard_voortgang", `feit_reeks_${domain}_${key}`);
    }
  }

  function handleKompasClick(layerId: number) {
    trackEvent("voortgang_ladder_kompas_click", { domain, layer: layerId, surface });
    clarityTag("voortgang_ladder_kompas_click", `${domain}:p${layerId}`);
  }

  const openState = openLayerData ? (layerStates?.[openLayerData.id] ?? null) : null;
  const openStyles = openState ? STATE_STYLE[openState] : null;
  const openGekozen = openLayerData ? (gekozenPerLaag.get(openLayerData.id) ?? []) : [];
  const openIsAanbevolen = openLayerData
    ? (recommendedLayerIds?.includes(openLayerData.id) ?? false)
    : false;
  const openWaitLine =
    openLayerData && openState === "wacht" ? (whyWait?.(openLayerData.id) ?? null) : null;
  const openFacts = openLayerData ? (evidenceByLayer?.[openLayerData.id] ?? []) : [];
  const openExtra = openLayerData ? (layerExtra?.(openLayerData.id) ?? null) : null;

  return (
    <CockpitTile ariaLabel="Je prioriteiten" eyebrow={eyebrow}>
      {intro ? (
        <p className="mb-3.5 mt-2.5 max-w-[58ch] text-[13px] leading-relaxed text-[#CDD7D0] text-pretty">
          {intro}
        </p>
      ) : null}

      {flowIntro ? (
        <p
          className={`mb-2.5 max-w-[58ch] text-[12.5px] leading-relaxed text-[#CDD7D0] text-pretty ${
            intro ? "" : "mt-2.5"
          }`}
        >
          {flowIntro}
        </p>
      ) : null}

      <LagenStepper
        layers={layers}
        flowSteps={flowSteps ?? []}
        stepStates={{ ...(layerStates ?? {}), ...(stepStates ?? {}) }}
        stateLabels={stateLabels}
        gekozenPerLaag={gekozenPerLaag}
        openLayer={openLayer}
        domain={domain}
        onSelect={handleSelect}
        onKeyDown={handleTabKeyDown}
        tabRefs={tabRefs}
      />

      {openLayerData ? (
        <div
          role="tabpanel"
          id={`${ladderLayerDomId(domain, openLayerData.id)}-paneel`}
          aria-labelledby={ladderLayerDomId(domain, openLayerData.id)}
          data-layer={openLayerData.id}
          data-ls={openState ?? undefined}
          className="mt-3 rounded-[14px] border border-[#5A8F6A]/45 bg-[#5A8F6A]/[0.07] px-3.5 py-4"
        >
          <h2 className="m-0 font-serif text-[18px] font-normal leading-tight text-[#F1EFE8]">
            {openLayerData.name}
          </h2>
          {openState && openStyles && stateLabels ? (
            <p
              className={`mt-1 m-0 text-[9.5px] font-bold uppercase tracking-[0.14em] ${openStyles.text}`}
            >
              {stateLabels[openState]}
            </p>
          ) : null}
          {openLayerData.subtitle ? (
            <p className="mt-1 m-0 text-[12.5px] leading-snug text-[#9FB0A6]">
              {openLayerData.subtitle}
            </p>
          ) : null}

          <p className="mt-3 max-w-[60ch] text-[12.5px] leading-relaxed text-[#CDD7D0] text-pretty">
            {openLayerData.summary}
          </p>
          {openWaitLine ? (
            <p className="mt-3 max-w-[58ch] border-l border-white/10 pl-2.5 text-[11.5px] leading-relaxed text-[#7E8C82] text-pretty">
              {openWaitLine}
            </p>
          ) : null}

          <LayerEvidence
            facts={openFacts}
            meetreeks={meetreeks}
            chartColor={chartColor}
            openFactKey={openFactKey}
            onToggleFact={handleToggleFact}
          />

          {!isWerkplek && openGekozen.length > 0 ? (
            <div className="mt-4">
              <p className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
                Jij koos
              </p>
              <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                {openGekozen.map((item) => (
                  <li
                    key={item.id}
                    className="text-[12.5px] leading-relaxed text-[#CDD7D0] text-pretty"
                  >
                    {item.title}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {openLayerData.actions.length > 0 ? (
            <>
              <p className="mb-2 mt-4 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
                {openIsAanbevolen ? "Aanbevolen na je check" : "Wat je hier kunt doen"}
              </p>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {openLayerData.actions.map((action) => (
                  <li
                    key={action}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-l border-[#5A8F6A]/40 pl-2.5"
                  >
                    <span className="min-w-[16ch] flex-1 text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
                      {action}
                    </span>
                    {isWerkplek ? (
                      <FavoriteSaveButton
                        surface={surface}
                        labels={{ save: "Zet bij Mijn keuze", saved: "Staat bij Mijn keuze" }}
                        item={{
                          id: ladderActionFavoriteId(domain, openLayerData.id, action),
                          title: action,
                          kind: "activiteit",
                          domain,
                          source: openIsAanbevolen ? "aanbevolen" : "mijn_keuze",
                        }}
                      />
                    ) : (
                      /* Uitlegmodus (voeding) toonde deze acties als kale
                         tekst: drie concrete zinnen — "zet één portie groente
                         bij je avondeten" — zonder enige manier om er iets mee
                         te doen. Daarmee eindigde de hele voedingsketen bij een
                         diagnose, en was de enige handeling ná je check de
                         deur naar het schap.

                         Een moment plannen is geen keuze-uitwerking maar een
                         handeling op zichzelf, dus hij hoort ook hier. Wat
                         `explain` blijft weren is `keuze`: die hoort bij een
                         ladder waar je kiest, en voeding kiest niet per laag. */
                      resolveLadderAffordances({
                        domain,
                        layerId: openLayerData.id,
                        action,
                      }).includes("moment") ? (
                        <LadderMomentButton
                          domain={domain}
                          title={action}
                          surface={surface}
                          layer={openLayerData.id}
                        />
                      ) : null
                    )}
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {isWerkplek ? (
            <>
              <p className="mb-2 mt-4 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
                Mijn keuze op deze laag
              </p>
              {openGekozen.length === 0 ? (
                <p className="max-w-[58ch] text-[12px] leading-relaxed text-[#7E8C82] text-pretty">
                  Hier koos je nog niets. Dat hoeft ook niet — de laag lezen kost je niets
                  en verplicht je tot niets.
                </p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {openGekozen.map((item) => (
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
                      {!isCadenceLadderAction(item.title) ? (
                        <div className="mt-2">
                          <LadderMomentButton
                            domain={domain}
                            title={item.title}
                            surface={surface}
                            layer={openLayerData.id}
                          />
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : null}

          {openExtra}

          {kompasHref ? (
            <a
              href={kompasHref}
              onClick={() => handleKompasClick(openLayerData.id)}
              className="mt-3 inline-flex cursor-pointer items-center gap-1 text-[13px] font-semibold text-[#9CC5A9] no-underline"
            >
              Kies dit op Kompas <Icons.ChevronRight s={13} />
            </a>
          ) : null}
        </div>
      ) : null}

      {onGoAgenda ? (
        <div className="mt-4 border-t border-white/[0.06] pt-3">
          <p className="max-w-[62ch] text-[11.5px] leading-relaxed text-[#7E8C82] text-pretty">
            {gekozenTotaal === 0
              ? "Wat je hier kiest, komt terug bij je favorieten en in de contextkolom van de laag waar je het koos — naam en herkomst, geen merk en geen prijs. Afvinken doe je op Mijn Dag."
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
