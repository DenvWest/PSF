"use client";

import { useEffect, useState } from "react";
import * as Icons from "@/components/app/icons";
import { DeltaBadge, Sparkline } from "@/components/app/primitives";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import KompasDomainGauge from "@/components/app/KompasDomainGauge";
import BewegingAdviesTreden from "@/components/dashboard/voortgang/BewegingAdviesTreden";
import DomainLifestyleLadder from "@/components/dashboard/domain/DomainLifestyleLadder";
import DomainSupplementStance from "@/components/dashboard/voortgang/DomainSupplementStance";
import PrioriteitenLadder from "@/components/dashboard/voortgang/PrioriteitenLadder";
import DomeinIjkpuntCheckPrompt from "@/components/intake/DomeinIjkpuntCheckPrompt";
import MovementCheckinReadout from "@/components/intake/MovementCheckinReadout";
import MovementFactReadout from "@/components/intake/MovementFactReadout";
import SleepCheckinReadout from "@/components/intake/SleepCheckinReadout";
import SleepFactReadout from "@/components/intake/SleepFactReadout";
import { PILLAR, PILLAR_CHECKIN_ROUTES } from "@/data/dashboard";
import {
  SLEEP_LAYER_STATE_LABEL,
  SLEEP_PRIORITY_LAYERS,
  type SleepPriorityId,
} from "@/data/sleep/lifestyle-priorities";
import { STRESS_PRIORITY_LAYERS } from "@/data/stress/lifestyle-priorities";
import {
  CONNECTION_PRIORITY_LAYERS,
  CONNECTION_SAFETY_NET_LINE,
} from "@/data/connection/lifestyle-priorities";
import { NUTRITION_PRIORITY_LAYERS } from "@/data/nutrition/lifestyle-pyramid";
import {
  MOVEMENT_PRIORITY_LAYERS,
  type MovementPriorityId,
} from "@/data/movement/lifestyle-priorities";
import { buildBewegingAdviesTreden } from "@/lib/beweging-advies-treden";
import { clarityTag } from "@/lib/clarity";
import { buildMovementRoutingHref } from "@/lib/dashboard-url";
import { getReadoutPresentation } from "@/lib/dashboard-readout";
import { isReadoutDomain } from "@/lib/domain-role";
import { trackEvent } from "@/lib/ga4";
import { buildLeefstijllijnRows } from "@/lib/leefstijllijn";
import {
  MOVEMENT_LAYER_STATE_LABEL,
  movementLayerWhyWait,
} from "@/lib/movement-ladder";
import { isMovementLogEnabled } from "@/lib/feature-flags";
import { resolveMovementRoutingHint } from "@/lib/movement-assessment";
import { sleepLayerWhyWait } from "@/lib/sleep-ladder";
import {
  buildMovementProgramPreview,
  parseMovementPlanProfile,
} from "@/lib/movement-plan-profile";
import { buildMovementPositionLine } from "@/lib/movement-plan-roadmap";
import { deriveMovementCurrent } from "@/lib/movement-target";
import { getScoreBandShortLabel } from "@/lib/score-bands";
import { buildRecommendationsEligibility } from "@/lib/supplement-eligibility";
import type { DashboardData, DashboardModel, PillarId } from "@/types/dashboard";

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

export default function VoortgangDomeinScreen({
  model,
  data,
  domain,
  onBack,
  onGoVandaag,
  onOpenAdvies,
  onOpenFavorieten,
}: {
  model: DashboardModel;
  data?: DashboardData;
  domain: PillarId;
  onBack: () => void;
  onGoVandaag: () => void;
  /** Voeding-advies (statistieken › advies) — de bestaande ladder, niet gedupliceerd. */
  onOpenAdvies: () => void;
  onOpenFavorieten: () => void;
}) {
  const [adviesOpen, setAdviesOpen] = useState(false);
  const pillar = PILLAR[domain];
  const readout = isReadoutDomain(domain) ? getReadoutPresentation(domain) : null;
  const leefstijllijnRow = buildLeefstijllijnRows(model).find((row) => row.pillarId === domain) ?? null;
  const score = model.scores[domain] ?? 0;
  const daysAgo = data?.domainCheckDaysAgo?.[domain];

  const isMovement = domain === "beweging";
  const isSleep = domain === "slaap";
  const isStress = domain === "stress";
  const isConnection = domain === "verbinding";
  const isNutrition = domain === "voeding";
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
  const movementCurrent = isMovement ? deriveMovementCurrent(model.answers ?? {}) : null;

  const nutritionLogCompleted =
    buildRecommendationsEligibility(data?.nutritionIntake).nutritionLogCompleted === true;
  // Poort 1 (evidence) — alleen beweging heeft vandaag een product-oordeel;
  // poort 2 (basis staat) is de bestaande voedingscheck-gate (§G.1 BESLUIT).
  const showAdviesDeur =
    isMovement && movementCurrent?.source === "beweegcheck" && nutritionLogCompleted;

  const movementReadout = isMovement ? (data?.movementCheckinSnapshot ?? null) : null;
  const sleepReadout = isSleep ? (data?.sleepCheckinSnapshot ?? null) : null;
  const domainReadout = movementReadout ?? sleepReadout;
  // Programma-preview is altijd live uit het profiel, nooit uit het bevroren
  // readout-blok — anders loopt de regel uit de pas zodra iemand zijn
  // programma wijzigt zonder een nieuwe beweegcheck te doen (§H3).
  const movementPlanProfile = isMovement ? parseMovementPlanProfile(model.answers ?? {}) : null;
  const movementProgramPreview = movementPlanProfile
    ? buildMovementProgramPreview(
        movementPlanProfile.weeklyFrequency,
        movementPlanProfile.trainingLocation,
        movementPlanProfile.trainingGuidance,
      )
    : null;

  useEffect(() => {
    trackEvent("domain_tool.snapshot_viewed", {
      domain,
      surface: "voortgang_domein",
      has_conclusion: domainReadout !== null,
    });
    clarityTag("dashboard_voortgang_domein", domain);
  }, [domain, domainReadout]);

  const handleCheckin = () => {
    trackEvent("dashboard_beweging_checkin_click", { mode: "full", surface: "voortgang_beweging" });
    clarityTag("dashboard_beweging_checkin", "click");
  };

  // Zelfde eventnaam als de deur op slaap/stress/voeding (DomainSupplementStance)
  // — beweging opent zijn schap inline i.p.v. in een los component, maar het
  // is dezelfde interactie en hoort dezelfde naam te dragen.
  const handleAdvies = () => {
    const next = !adviesOpen;
    setAdviesOpen(next);
    if (!next) {
      return;
    }
    trackEvent("dashboard_supplement_deur_open", { domain: "beweging", surface: "advies_voortgang" });
    clarityTag("dashboard_supplement_deur", "beweging");
  };

  const handleGoVandaag = () => {
    trackEvent("dashboard_voortgang_hub_click", { destination: "vandaag", surface: "voortgang_domein" });
    onGoVandaag();
  };

  return (
    <section aria-label={`Voortgang — ${pillar.label}`} style={{ paddingTop: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Terug"
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--panel-border)",
            color: "var(--text-muted)",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Icons.ArrowRight s={18} style={{ transform: "rotate(180deg)" }} />
        </button>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text)",
          }}
        >
          {pillar.label}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
        </CockpitTile>

        {positionLine ? (
          <p className="px-1 text-[12.5px] leading-relaxed text-[#9FB0A6]">{positionLine}</p>
        ) : null}

        {movementReadout ? (
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
        ) : null}

        {movementReadout ? (
          <MovementFactReadout
            rows={movementReadout.factRows}
            focusDimension={movementReadout.focusDimension}
            surface="voortgang_beweging"
          />
        ) : null}

        {sleepReadout ? (
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
        ) : null}

        {sleepReadout ? (
          <SleepFactReadout rows={sleepReadout.factRows} surface="voortgang_slaap" />
        ) : null}

        {sleepReadout ? (
          <CockpitTile eyebrow="Prioriteiten">
            <DomainLifestyleLadder
              layers={SLEEP_PRIORITY_LAYERS}
              layerStates={sleepReadout.layerStates}
              focusLayer={sleepReadout.focusLayer}
              stateLabels={SLEEP_LAYER_STATE_LABEL}
              variant="full"
              whyWait={(layerId) => sleepLayerWhyWait(layerId as SleepPriorityId, sleepReadout.focusLayer)}
              domain="slaap"
              surface="voortgang_slaap"
            />
          </CockpitTile>
        ) : null}

        {sleepReadout ? (
          <DomainSupplementStance
            domain="sleep"
            verdicts={data?.supplementVerdicts ?? []}
            nutritionLogCompleted={nutritionLogCompleted}
            surface="voortgang_slaap"
          />
        ) : null}

        {isStress ? (
          <PrioriteitenLadder
            layers={STRESS_PRIORITY_LAYERS}
            intro="Zes vlakken die spanning en herstel raken, van goedkoop naar duur. Wat bovenaan staat kost het minst en draagt het meest. Tik aan wat bij jou vastloopt."
            domain="stress"
            surface="voortgang_stress"
          />
        ) : null}

        {isStress ? (
          <DomainSupplementStance
            domain="stress"
            verdicts={data?.supplementVerdicts ?? []}
            nutritionLogCompleted={nutritionLogCompleted}
            surface="voortgang_stress"
          />
        ) : null}

        {isConnection ? (
          <PrioriteitenLadder
            layers={CONNECTION_PRIORITY_LAYERS}
            intro="Zes vlakken waarop contact verbetert, van goedkoop naar duur. Wat bovenaan staat kost het minst en draagt het meest. Tik aan wat bij jou vastloopt."
            safetyNetLine={CONNECTION_SAFETY_NET_LINE}
            domain="verbinding"
            surface="voortgang_verbinding"
          />
        ) : null}

        {isNutrition ? (
          <PrioriteitenLadder
            layers={NUTRITION_PRIORITY_LAYERS}
            intro="Zes lagen, van je eetbasis tot aanvullen. Wat bovenaan staat draagt het meest; wat eronder staat telt pas mee als de lagen erboven staan."
            eyebrow="Van onder naar boven"
            domain="voeding"
            surface="voortgang_voeding"
          />
        ) : null}

        {isNutrition ? (
          <DomainSupplementStance
            domain="nutrition"
            verdicts={data?.supplementVerdicts ?? []}
            nutritionLogCompleted={nutritionLogCompleted}
            surface="voortgang_voeding"
          />
        ) : null}

        {isSleep ? (
          <DomeinIjkpuntCheckPrompt domain="slaap" domainLabel="Slaap" />
        ) : null}

        {isMovement ? (
          <DomeinIjkpuntCheckPrompt domain="beweging" domainLabel="Beweging" />
        ) : null}

        {isMovement && movementLogEnabled ? (
          <CockpitTile eyebrow="Wat je deed">
            <p className="mt-2 text-[13.5px] leading-relaxed text-[#CDD7D0]">
              {weekTotals
                ? `Deze week ${weekTotals.totalMinutes} minuten in ${weekTotals.sessionCount} moment${weekTotals.sessionCount === 1 ? "" : "en"}.`
                : "Nog geen momenten deze week."}
            </p>
          </CockpitTile>
        ) : null}

        {checkinRoute ? (
          <a
            href={`${checkinRoute}?from=dashboard&kompas=${domain}`}
            onClick={handleCheckin}
            className="flex items-center gap-3 rounded-2xl border border-[#5A8F6A]/30 bg-[#5A8F6A]/10 px-4 py-3.5 no-underline text-inherit"
          >
            <Icons.Activity s={18} style={{ color: "#5A8F6A", flexShrink: 0 }} />
            <span className="flex-1 text-[14.5px] font-semibold text-[#F1EFE8]">
              {isMovement
                ? "Doe de uitgebreide beweegcheck (3 min)"
                : isSleep
                  ? "Doe de slaap-check opnieuw (1 min)"
                  : `Doe de ${pillar.label.toLowerCase()}-check opnieuw`}
            </span>
            <Icons.ChevronRight s={18} style={{ color: "#9FB0A6", flexShrink: 0 }} />
          </a>
        ) : null}

        {/* Mét beweegcheck draagt de ladder een staat, afgeleid uit dezelfde
            focusdimensie als de readout hierboven (lock 4). Zonder check is er
            niets af te leiden en blijft de zelfselectie-vorm staan — een lege
            ladder met vier verzonnen badges zou erger zijn dan geen badges. */}
        {isMovement && movementReadout ? (
          <CockpitTile eyebrow="Fundament naar finetunen">
            <p className="mb-3.5 mt-2.5 max-w-[58ch] text-[13px] leading-relaxed text-[#CDD7D0]">
              Zes prioriteiten, van fundament naar finetunen. Wat bovenaan staat draagt het
              meest; wat eronder staat werkt pas mee als de prioriteiten erboven staan.
            </p>
            <DomainLifestyleLadder
              layers={MOVEMENT_PRIORITY_LAYERS}
              layerStates={movementReadout.ladder.states}
              focusLayer={movementReadout.ladder.focus ?? 0}
              stateLabels={MOVEMENT_LAYER_STATE_LABEL}
              variant="full"
              whyWait={(layerId) =>
                movementLayerWhyWait(layerId as MovementPriorityId, movementReadout.ladder.focus)
              }
              domain="beweging"
              surface="voortgang_beweging"
            />
          </CockpitTile>
        ) : null}

        {isMovement && !movementReadout ? (
          <PrioriteitenLadder
            layers={MOVEMENT_PRIORITY_LAYERS}
            intro="Zes prioriteiten, van fundament naar finetunen. Wat bovenaan staat draagt het meest; wat eronder staat werkt pas mee als de prioriteiten erboven staan. Doe je beweegcheck om te zien waar jouw winst nu zit."
            eyebrow="Fundament naar finetunen"
            domain="beweging"
            surface="voortgang_beweging"
          />
        ) : null}

        {showAdviesDeur ? (
          <>
            <button
              type="button"
              onClick={handleAdvies}
              aria-expanded={adviesOpen}
              aria-controls="beweging-advies-treden"
              className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-left"
            >
              <span className="text-[13.5px] font-semibold text-[#5A8F6A]">
                Wat een supplement hier wél en niet doet
              </span>
              <Icons.ChevronRight
                s={16}
                style={{
                  color: "#5A8F6A",
                  flexShrink: 0,
                  transform: adviesOpen ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.15s ease",
                }}
              />
            </button>
            {adviesOpen ? (
              <div id="beweging-advies-treden">
                <BewegingAdviesTreden
                  treden={buildBewegingAdviesTreden(
                    model,
                    data,
                    leefstijllijnRow?.baselineScore ?? null,
                  )}
                  onGoVandaag={handleGoVandaag}
                  onOpenVoedingAdvies={onOpenAdvies}
                  onOpenFavorieten={onOpenFavorieten}
                />
              </div>
            ) : null}
          </>
        ) : null}

        <button
          type="button"
          onClick={handleGoVandaag}
          className="cursor-pointer border-none bg-transparent p-0 text-left text-[13px] font-medium text-[#9FB0A6]"
        >
          Terug naar je stap van vandaag ›
        </button>
      </div>
    </section>
  );
}
