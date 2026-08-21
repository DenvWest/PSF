"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import * as Icons from "@/components/app/icons";
import { DeltaBadge, Sparkline } from "@/components/app/primitives";
import KompasDomainGauge from "@/components/app/KompasDomainGauge";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import DomainLifestyleLadder from "@/components/dashboard/domain/DomainLifestyleLadder";
import LadderCoverageMeter from "@/components/dashboard/domain/LadderCoverageMeter";
import DomainSupplementStance from "@/components/dashboard/voortgang/DomainSupplementStance";
import DomainRouteStrip, {
  type DomainRouteStripNode,
} from "@/components/dashboard/voortgang/DomainRouteStrip";
import FavoriteSaveButton from "@/components/dashboard/voortgang/FavoriteSaveButton";
import PrioriteitenLadder, {
  ladderLayerDomId,
} from "@/components/dashboard/voortgang/PrioriteitenLadder";
import VoortgangSectionHeader from "@/components/dashboard/voortgang/VoortgangSectionHeader";
import { resolveRecommendedLayers } from "@/components/dashboard/voortgang/FavorietenBewegingSection";
import DomeinIjkpuntCheckPrompt from "@/components/intake/DomeinIjkpuntCheckPrompt";
import MovementCheckinReadout from "@/components/intake/MovementCheckinReadout";
import MovementFactReadout from "@/components/intake/MovementFactReadout";
import SleepCheckinReadout from "@/components/intake/SleepCheckinReadout";
import SleepFactReadout from "@/components/intake/SleepFactReadout";
import { MOVEMENT_PRIORITY_LAYERS, type MovementPriorityId } from "@/data/movement/lifestyle-priorities";
import { PILLAR, PILLAR_CHECKIN_ROUTES } from "@/data/dashboard";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import { buildDashboardAgendaHref, buildDashboardVandaagHref, buildMovementRoutingHref } from "@/lib/dashboard-url";
import { getReadoutPresentation } from "@/lib/dashboard-readout";
import { isReadoutDomain } from "@/lib/domain-role";
import { isMovementLogEnabled } from "@/lib/feature-flags";
import { trackEvent } from "@/lib/ga4";
import { getLeefstijlLadder, parseLadderFavoriteLayer, resolveLadderLayerName } from "@/lib/leefstijl-ladder";
import { buildLeefstijllijnRows } from "@/lib/leefstijllijn";
import { MOVEMENT_LAYER_STATE_LABEL, movementLayerWhyWait } from "@/lib/movement-ladder";
import { resolveMovementRoutingHint } from "@/lib/movement-assessment";
import {
  buildMovementProgramPreview,
  parseMovementPlanProfile,
} from "@/lib/movement-plan-profile";
import { buildMovementPositionLine } from "@/lib/movement-plan-roadmap";
import { hasSchap } from "@/lib/schap-availability";
import { getScoreBandShortLabel } from "@/lib/score-bands";
import { buildRecommendationsEligibility } from "@/lib/supplement-eligibility";
import { useVoortgangFavorites } from "@/lib/voortgang-favorites-context";
import type { DashboardData, DashboardModel, PillarId } from "@/types/dashboard";

/**
 * Leefstijlprofiel · domein — de ladder is het scherm.
 *
 * Tot 19 augustus stonden Aanbeveling en Mijn keuze hier als twee losse
 * secties onder de ladder (prebuild v3 lock 1). Dat werkte als leesvorm maar
 * niet als keuzevorm: je las zes lagen, scrolde eronder, en koos daar uit een
 * lijst waarvan de laag niet meer in beeld was. De twee zijn nu ín de laag
 * getrokken — elke laag draagt zijn eigen Aanbevolen en zijn eigen Mijn keuze.
 * Wat je kiest schrijft naar `account_favorites` met een id dat zijn laag
 * onthoudt, dus dezelfde keuze komt terug op het schap en als handeling op
 * Vandaag. Eén bron, drie plekken.
 *
 * Wat onveranderd blijft: geen productkaart, geen prijs, geen
 * vergelijkingslink op dit scherm (lock 4). De poort op laag 6 legt alleen uit
 * of aanvullen aan de orde is; kiezen gebeurt in het schap.
 */

type MovementWeekTotals = { totalMinutes: number; sessionCount: number };

function useMovementWeekTotals(enabled: boolean): MovementWeekTotals | null {
  const [totals, setTotals] = useState<MovementWeekTotals | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    let cancelled = false;
    void fetch("/api/account/movement-log", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json) {
          setTotals({ totalMinutes: json.totalMinutes ?? 0, sessionCount: json.sessionCount ?? 0 });
        }
      })
      .catch(() => {
        /* niet-blokkerend */
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return totals;
}

/**
 * Alles wat je op dit domein koos, op één hoop — inclusief wat je buiten de
 * ladder om oppikte. De ladder toont per laag alleen wat daar hoort; deze
 * sectie is de spiegel van wat er op Vandaag staat. Alleen activiteiten:
 * product, dienst en begeleiding hebben hun eigen groep op het schap (lock 3).
 */
function MijnKeuzeSectie({
  domain,
  surface,
  onGoVandaag,
}: {
  domain: PillarId;
  surface: string;
  onGoVandaag: () => void;
}) {
  const { items } = useVoortgangFavorites();
  const gekozen = items.filter((item) => item.domain === domain && item.kind === "activiteit");

  return (
    <section aria-label="Mijn keuze">
      <VoortgangSectionHeader eyebrow="Mijn keuze" title="Wat jij koos" />
      <p className="m-0 mb-3 text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
        Alles wat je op dit domein koos, bij elkaar. Zo staat het ook op Vandaag: naam plus
        afvinken — supplementen en diensten staan in je schap.
      </p>
      {gekozen.length === 0 ? (
        <CockpitTile>
          <p className="m-0 text-[14px] leading-relaxed text-[#9FB0A6] text-pretty">
            Je hebt hier nog niets gekozen. Dat hoeft ook niet — de lagen hierboven werken zonder
            dat je er iets naast zet.
          </p>
        </CockpitTile>
      ) : (
        <div className="flex flex-col gap-2">
          {gekozen.map((item) => {
            const laag = parseLadderFavoriteLayer(item.id);
            const laagNaam = laag != null ? resolveLadderLayerName(domain, laag) : null;
            return (
              <CockpitTile key={item.id}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="min-w-[16ch] flex-1">
                    <span className="block text-[14px] text-[#F1EFE8] text-pretty">
                      {item.title}
                    </span>
                    {laagNaam ? (
                      <span className="mt-1 block text-[11.5px] text-[#7E8C82]">
                        Laag {laag} · {laagNaam}
                      </span>
                    ) : null}
                  </span>
                  <FavoriteSaveButton compact surface={surface} item={item} />
                </div>
              </CockpitTile>
            );
          })}
          <button
            type="button"
            onClick={onGoVandaag}
            className="cursor-pointer border-none bg-transparent p-0 text-left text-[13px] font-semibold text-[#9CC5A9]"
          >
            Afvinken doe je op Vandaag ›
          </button>
        </div>
      )}
    </section>
  );
}

export default function LeefstijlprofielDomeinScherm({
  model,
  data,
  domain,
  adviesExtra,
  onBack,
  onGoVandaag,
  onOpenSchap,
}: {
  model: DashboardModel;
  data?: DashboardData;
  domain: PillarId;
  adviesExtra?: ReactNode;
  onBack: () => void;
  onGoVandaag: () => void;
  onOpenSchap: (domain: PillarId) => void;
}) {
  const pillar = PILLAR[domain];
  const readout = isReadoutDomain(domain) ? getReadoutPresentation(domain) : null;
  const leefstijllijnRow =
    buildLeefstijllijnRows(model).find((row) => row.pillarId === domain) ?? null;
  const score = model.scores[domain] ?? 0;
  const daysAgo = data?.domainCheckDaysAgo?.[domain];

  const isMovement = domain === "beweging";
  const isSleep = domain === "slaap";
  const movementLogEnabled = isMovement && isMovementLogEnabled();
  const weekTotals = useMovementWeekTotals(movementLogEnabled);

  const positionLine =
    isMovement && model.movementPlanProgress
      ? buildMovementPositionLine({
          currentPhaseId: model.movementPlanProgress.currentPhaseId,
          startedAt: model.movementPlanProgress.startedAt,
        })
      : null;

  const checkinRoute = PILLAR_CHECKIN_ROUTES[domain];
  const movementReadout = isMovement ? (data?.movementCheckinSnapshot ?? null) : null;
  const sleepReadout = isSleep ? (data?.sleepCheckinSnapshot ?? null) : null;
  const domainReadout = movementReadout ?? sleepReadout;
  const movementPlanProfile = isMovement ? parseMovementPlanProfile(model.answers ?? {}) : null;
  const movementProgramPreview = movementPlanProfile
    ? buildMovementProgramPreview(
        movementPlanProfile.weeklyFrequency,
        movementPlanProfile.trainingLocation,
        movementPlanProfile.trainingGuidance,
      )
    : null;

  const ladder = getLeefstijlLadder(domain);
  const movementFocusLayer = movementReadout?.ladder.focus ?? null;

  /**
   * Twee ladders op één scherm — die in de kop en de uitklapbare eronder —
   * delen sinds 20 augustus één open laag. Zolang je niets aanklikt volgt hij
   * de aanbeveling uit je check; vanaf je eerste klik is jouw keuze leidend,
   * ook als die "dicht" is. Vandaar een gekozen-object en niet alleen een
   * nummer: `null` betekent "nog niet aangeraakt", niet "dicht".
   */
  const [pickedLayer, setPickedLayer] = useState<{ layer: number | null } | null>(null);
  const openLadderLayer = pickedLayer ? pickedLayer.layer : movementFocusLayer;
  const scrollToLadder = useRef(false);

  useEffect(() => {
    if (!scrollToLadder.current) {
      return;
    }
    scrollToLadder.current = false;
    if (openLadderLayer == null) {
      return;
    }
    document
      .getElementById(ladderLayerDomId(domain, openLadderLayer))
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [domain, openLadderLayer]);

  function handleSelectLayerFromTop(layerId: number) {
    scrollToLadder.current = true;
    setPickedLayer({ layer: layerId });
  }
  const movementEligibility = isMovement
    ? buildRecommendationsEligibility(data?.nutritionIntake)
    : null;

  useEffect(() => {
    trackEvent("domain_tool.snapshot_viewed", {
      domain,
      surface: "leefstijlprofiel_domein",
      has_conclusion: domainReadout !== null,
    });
    clarityTag("dashboard_leefstijlprofiel_domein", domain);
  }, [domain, domainReadout]);

  const handleCheckin = () => {
    trackEvent("dashboard_beweging_checkin_click", {
      mode: "full",
      surface: `leefstijlprofiel_${domain}`,
    });
    clarityTag("dashboard_beweging_checkin", "click");
  };

  const handleGoVandaag = () => {
    trackEvent("dashboard_voortgang_hub_click", {
      destination: "vandaag",
      surface: "leefstijlprofiel_domein",
    });
    onGoVandaag();
  };

  const handleGoMijnDag = () => {
    trackEvent("dashboard_voortgang_hub_click", {
      destination: "agenda",
      surface: "leefstijlprofiel_domein",
    });
    const href = buildDashboardAgendaHref();
    if (typeof window !== "undefined" && window.location.pathname === "/dashboard") {
      window.history.pushState(null, "", href);
      window.dispatchEvent(new PopStateEvent("popstate"));
      return;
    }
    if (typeof window !== "undefined") {
      window.location.assign(href);
    }
  };

  const checkinSublabel = isMovement ? "Opnieuw · 3 min" : isSleep ? "Opnieuw · 1 min" : "Opnieuw doen";
  const routeNodes: DomainRouteStripNode[] = [
    ...(checkinRoute
      ? [
          {
            key: "leefstijlcheck",
            label: "Leefstijlcheck",
            sublabel: checkinSublabel,
            href: `${checkinRoute}?from=dashboard&kompas=${domain}`,
            onClick: handleCheckin,
          },
        ]
      : []),
    { key: "voortgang", label: "Voortgang", sublabel: "Hier — legt uit", current: true },
    { key: "kompas", label: "Kompas", sublabel: "Kiest je aanpak", onClick: handleGoVandaag },
    { key: "mijn_dag", label: "Mijn Dag", sublabel: "Vinkt af", onClick: handleGoMijnDag },
  ];

  const handleOpenSchap = () => {
    emitAccountClientEvent("choice.shelf_opened", {
      domain,
      from_state: "leefstijlprofiel",
      surface: "leefstijlprofiel_domein",
    });
    clarityTag("dashboard_leefstijlprofiel_schap", domain);
    onOpenSchap(domain);
  };

  return (
    <section aria-label={`Leefstijlprofiel — ${pillar.label}`} className="pt-4">
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Terug"
          className="flex h-[38px] w-[38px] shrink-0 cursor-pointer items-center justify-center rounded-[11px] border border-[var(--panel-border)] bg-white/[0.04] text-[var(--text-muted)]"
        >
          <Icons.ArrowRight s={18} style={{ transform: "rotate(180deg)" }} />
        </button>
        <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
          Leefstijlprofiel · {pillar.label}
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        <CockpitTile eyebrow="Je stand">
          <div className="flex items-center gap-4">
            <KompasDomainGauge value={score} label={pillar.label} />
            <div className="min-w-0 flex-1">
              {readout ? (
                <p className="text-[13px] leading-relaxed text-[#CDD7D0] text-pretty">
                  Wordt aangedreven door {readout.driverLabels.join(", ").toLowerCase()}.
                </p>
              ) : (
                <>
                  <p className="text-[14px] leading-relaxed text-[#F1EFE8]">
                    {getScoreBandShortLabel(score)}
                    {leefstijllijnRow?.delta != null ? (
                      <span className="ml-2 inline-flex align-middle">
                        <DeltaBadge delta={leefstijllijnRow.delta} />
                      </span>
                    ) : null}
                  </p>
                  {leefstijllijnRow ? (
                    <div className="mt-2">
                      <Sparkline data={leefstijllijnRow.trend} color={pillar.color} w={96} h={28} />
                    </div>
                  ) : null}
                  {leefstijllijnRow?.baselineSourceLabel ? (
                    <p className="mt-2 text-[12px] text-[#9FB0A6]">
                      {leefstijllijnRow.baselineSourceLabel}
                    </p>
                  ) : null}
                  <p className="mt-1 text-[12px] text-[#7E8C82]">
                    {daysAgo != null
                      ? `Laatst gemeten ${daysAgo === 0 ? "vandaag" : `${daysAgo} dagen geleden`} — dit verandert bij je hermeting.`
                      : "Nog niet apart gemeten."}
                  </p>
                </>
              )}
            </div>
          </div>
          {isMovement && movementReadout ? (
            <div className="mt-3">
              <LadderCoverageMeter
                coverage={movementReadout.ladder.coverage}
                totalLayers={MOVEMENT_PRIORITY_LAYERS.length}
              />
              <p className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
                Waar je winst nu zit · tik een prioriteit aan
              </p>
              <DomainLifestyleLadder
                layers={MOVEMENT_PRIORITY_LAYERS}
                layerStates={movementReadout.ladder.states}
                stateLabels={MOVEMENT_LAYER_STATE_LABEL}
                selectedLayer={openLadderLayer}
                onSelectLayer={handleSelectLayerFromTop}
                whyWait={(layerId) =>
                  movementLayerWhyWait(layerId as MovementPriorityId, movementFocusLayer)
                }
                domain="beweging"
                surface="leefstijlprofiel_beweging"
              />
              {openLadderLayer != null && openLadderLayer !== movementFocusLayer ? (
                <p className="mt-2.5 text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
                  Je kijkt naar prioriteit {openLadderLayer}. Jouw grootste winst zit op prioriteit{" "}
                  {movementFocusLayer}.{" "}
                  <button
                    type="button"
                    onClick={() =>
                      movementFocusLayer != null && handleSelectLayerFromTop(movementFocusLayer)
                    }
                    className="cursor-pointer border-none bg-transparent p-0 text-left font-semibold text-[#9CC5A9] underline"
                  >
                    Terug daarheen
                  </button>
                </p>
              ) : null}
            </div>
          ) : null}
        </CockpitTile>

        {positionLine ? (
          <p className="px-1 text-[12.5px] leading-relaxed text-[#9FB0A6]">{positionLine}</p>
        ) : null}

        {domainReadout ? (
          <p className="px-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#5A8F6A]">
            Zelfde blok als op je check-in resultaat
          </p>
        ) : null}

        {movementReadout ? (
          <>
            <MovementCheckinReadout
              headline={movementReadout.headline}
              focusLabel={movementReadout.focusLabel}
              answerLabel={movementReadout.answerLabel}
              statement={movementReadout.focusStatement}
              delta={movementReadout.delta}
              implicationLine={movementReadout.implicationLine}
              programPreview={movementProgramPreview}
              routingHref={buildMovementRoutingHref(movementReadout.focusDimension)}
              routingHint={resolveMovementRoutingHint(movementReadout.focusDimension)}
              startLine={
                movementReadout.startStatement
                  ? `Sinds je start: ${movementReadout.startStatement}`
                  : null
              }
              variant="voortgang"
            />
            <MovementFactReadout
              rows={movementReadout.factRows}
              focusDimension={movementReadout.focusDimension}
              surface="voortgang_beweging"
            />
          </>
        ) : null}

        {sleepReadout ? (
          <>
            <SleepCheckinReadout
              headline={sleepReadout.headline}
              focusLabel={sleepReadout.focusLabel}
              answerLabel={sleepReadout.answerLabel}
              statement={sleepReadout.focusStatement}
              delta={sleepReadout.delta}
              implicationLine={sleepReadout.implicationLine}
              voortgangHref="/intake/plan/sleep?from=dashboard&voortgang=slaap"
              startLine={
                sleepReadout.delta?.startLine
                  ? `Sinds je start: ${sleepReadout.delta.startLine}`
                  : null
              }
              variant="voortgang"
            />
            <SleepFactReadout rows={sleepReadout.factRows} surface="voortgang_slaap" />
          </>
        ) : null}

        {isSleep ? <DomeinIjkpuntCheckPrompt domain="slaap" domainLabel="Slaap" /> : null}
        {isMovement ? <DomeinIjkpuntCheckPrompt domain="beweging" domainLabel="Beweging" /> : null}

        {isMovement && movementLogEnabled ? (
          <CockpitTile eyebrow="Wat je deed">
            <p className="mt-2 text-[13.5px] leading-relaxed text-[#CDD7D0]">
              {weekTotals
                ? `Deze week ${weekTotals.totalMinutes} minuten in ${weekTotals.sessionCount} moment${weekTotals.sessionCount === 1 ? "" : "en"}.`
                : "Nog geen momenten deze week."}
            </p>
          </CockpitTile>
        ) : null}

        {ladder ? (
          <PrioriteitenLadder
            layers={ladder.layers}
            intro={ladder.intro}
            eyebrow={ladder.eyebrow}
            safetyNetLine={ladder.safetyNetLine}
            domain={domain}
            surface={ladder.surface}
            layerStates={movementReadout?.ladder.states}
            stateLabels={movementReadout ? MOVEMENT_LAYER_STATE_LABEL : undefined}
            focusLayer={movementFocusLayer}
            whyWait={
              movementReadout
                ? (layerId) =>
                    movementLayerWhyWait(layerId as MovementPriorityId, movementFocusLayer)
                : undefined
            }
            recommendedLayerIds={
              movementReadout
                ? resolveRecommendedLayers(movementFocusLayer).map((layer) => layer.id)
                : undefined
            }
            onGoVandaag={handleGoVandaag}
            openLayer={movementReadout ? openLadderLayer : undefined}
            onOpenLayerChange={
              movementReadout ? (next) => setPickedLayer({ layer: next }) : undefined
            }
            kompasHref={buildDashboardVandaagHref(domain)}
          />
        ) : null}

        <DomainRouteStrip domain={domain} surface={`leefstijlprofiel_${domain}`} nodes={routeNodes} />

        <MijnKeuzeSectie
          domain={domain}
          surface={`leefstijlprofiel_${domain}`}
          onGoVandaag={handleGoVandaag}
        />

        {isMovement ? (
          <section aria-label="Aanvullen">
            <VoortgangSectionHeader eyebrow="Aanvullen" title="Supplementen en wearables" />
            <DomainSupplementStance
              domain="movement"
              verdicts={data?.supplementVerdicts ?? []}
              nutritionLogCompleted={movementEligibility?.nutritionLogCompleted === true}
              surface="leefstijlprofiel_beweging"
              poortOnly
              onOpenFavorieten={handleOpenSchap}
            />
          </section>
        ) : null}

        {adviesExtra}

        {hasSchap(domain) ? (
          <button
            type="button"
            onClick={handleOpenSchap}
            className="cursor-pointer border-none bg-transparent p-0 text-left text-[13px] font-semibold text-[#9CC5A9]"
          >
            Open je schap ›
          </button>
        ) : null}
      </div>
    </section>
  );
}
