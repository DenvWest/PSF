"use client";

import { useEffect, useState, type ReactNode } from "react";
import * as Icons from "@/components/app/icons";
import { DeltaBadge, Sparkline } from "@/components/app/primitives";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import KompasDomainGauge from "@/components/app/KompasDomainGauge";
import PrioriteitenLadder, {
  type PrioriteitLayer,
} from "@/components/dashboard/voortgang/PrioriteitenLadder";
import DomeinIjkpuntCheckPrompt from "@/components/intake/DomeinIjkpuntCheckPrompt";
import MovementCheckinReadout from "@/components/intake/MovementCheckinReadout";
import MovementFactReadout from "@/components/intake/MovementFactReadout";
import SleepCheckinReadout from "@/components/intake/SleepCheckinReadout";
import SleepFactReadout from "@/components/intake/SleepFactReadout";
import { PILLAR, PILLAR_CHECKIN_ROUTES } from "@/data/dashboard";
import { SLEEP_PRIORITY_LAYERS } from "@/data/sleep/lifestyle-priorities";
import { STRESS_PRIORITY_LAYERS } from "@/data/stress/lifestyle-priorities";
import {
  CONNECTION_PRIORITY_LAYERS,
  CONNECTION_SAFETY_NET_LINE,
} from "@/data/connection/lifestyle-priorities";
import { NUTRITION_PRIORITY_LAYERS } from "@/data/nutrition/lifestyle-pyramid";
import { MOVEMENT_PRIORITY_LAYERS } from "@/data/movement/lifestyle-priorities";
import { clarityTag } from "@/lib/clarity";
import { buildMovementRoutingHref } from "@/lib/dashboard-url";
import { getReadoutPresentation } from "@/lib/dashboard-readout";
import { isReadoutDomain } from "@/lib/domain-role";
import { trackEvent } from "@/lib/ga4";
import { buildLeefstijllijnRows } from "@/lib/leefstijllijn";
import { isMovementLogEnabled } from "@/lib/feature-flags";
import { resolveMovementRoutingHint } from "@/lib/movement-assessment";
import {
  buildMovementProgramPreview,
  parseMovementPlanProfile,
} from "@/lib/movement-plan-profile";
import { buildMovementPositionLine } from "@/lib/movement-plan-roadmap";
import { getScoreBandShortLabel } from "@/lib/score-bands";
import FavorietenBewegingSection from "@/components/dashboard/voortgang/FavorietenBewegingSection";
import LeefstijlprofielSupplementSection from "@/components/dashboard/voortgang/LeefstijlprofielSupplementSection";
import { LeefstijlprofielViewToggle } from "@/components/dashboard/voortgang/LeefstijlprofielViewToggle";
import VoortgangSectionHeader from "@/components/dashboard/voortgang/VoortgangSectionHeader";
import type { DashboardData, DashboardModel, LeefstijlprofielView, PillarId } from "@/types/dashboard";

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

function domainLadderProps(domain: PillarId): {
  layers: readonly PrioriteitLayer[];
  intro: string;
  eyebrow?: string;
  safetyNetLine?: string;
  surface: string;
} | null {
  if (domain === "stress") {
    return {
      layers: STRESS_PRIORITY_LAYERS,
      intro:
        "Zes vlakken die spanning en herstel raken, van goedkoop naar duur. Wat bovenaan staat kost het minst en draagt het meest. Tik aan wat bij jou vastloopt.",
      surface: "leefstijlprofiel_stress",
    };
  }
  if (domain === "verbinding") {
    return {
      layers: CONNECTION_PRIORITY_LAYERS,
      intro:
        "Zes vlakken waarop contact verbetert, van goedkoop naar duur. Wat bovenaan staat kost het minst en draagt het meest. Tik aan wat bij jou vastloopt.",
      safetyNetLine: CONNECTION_SAFETY_NET_LINE,
      surface: "leefstijlprofiel_verbinding",
    };
  }
  if (domain === "voeding") {
    return {
      layers: NUTRITION_PRIORITY_LAYERS,
      intro:
        "Zes lagen, van je eetbasis tot aanvullen. Wat bovenaan staat draagt het meest; wat eronder staat telt pas mee als de lagen erboven staan.",
      eyebrow: "Van onder naar boven",
      surface: "leefstijlprofiel_voeding",
    };
  }
  if (domain === "beweging") {
    return {
      layers: MOVEMENT_PRIORITY_LAYERS,
      intro:
        "Zes prioriteiten, van fundament naar finetunen. Wat bovenaan staat draagt het meest; wat eronder staat werkt pas mee als de prioriteiten erboven staan. Tik aan wat bij jou vastloopt.",
      eyebrow: "Fundament naar finetunen",
      surface: "leefstijlprofiel_beweging",
    };
  }
  if (domain === "slaap") {
    return {
      layers: SLEEP_PRIORITY_LAYERS,
      intro:
        "Zes lagen van je slaapbasis tot finetunen. Wat bovenaan staat draagt het meest; wat eronder staat telt pas mee als de lagen erboven staan. Tik aan wat bij jou vastloopt.",
      eyebrow: "Van basis naar finetunen",
      surface: "leefstijlprofiel_slaap",
    };
  }
  return null;
}

export default function LeefstijlprofielDomeinView({
  model,
  data,
  domain,
  adviesExtra,
  onBack,
  onGoVandaag,
}: {
  model: DashboardModel;
  data?: DashboardData;
  domain: PillarId;
  adviesExtra?: ReactNode;
  onBack: () => void;
  onGoVandaag: () => void;
}) {
  const [view, setView] = useState<LeefstijlprofielView>("aanbevolen");
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

  const ladderProps = domainLadderProps(domain);

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
      surface: "leefstijlprofiel_beweging",
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

  return (
    <section aria-label={`Leefstijlprofiel — ${pillar.label}`} style={{ paddingTop: 16 }}>
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
          Leefstijlprofiel · {pillar.label}
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
          <p className="px-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#5A8F6A]">
            Zelfde blok als op je check-in resultaat
          </p>
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

        {ladderProps ? (
          <PrioriteitenLadder
            layers={ladderProps.layers}
            intro={ladderProps.intro}
            eyebrow={ladderProps.eyebrow}
            safetyNetLine={ladderProps.safetyNetLine}
            domain={domain}
            surface={ladderProps.surface}
          />
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

        <section aria-label="Leefstijlkeuze" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <VoortgangSectionHeader eyebrow="Leefstijlkeuze" title="Wat past bij je check" />
          {domain === "beweging" ? (
            <FavorietenBewegingSection model={model} data={data} view={view} domain={domain} />
          ) : (
            <p className="m-0 text-[14px] leading-relaxed text-[#9FB0A6] text-pretty">
              Leefstijlkeuzes voor {pillar.label.toLowerCase()} volgen in een volgende update —
              beweging is nu de blauwdruk.
            </p>
          )}

          {data ? (
            <LeefstijlprofielSupplementSection
              model={model}
              data={data}
              view={view}
              adviesExtra={adviesExtra}
              domain={domain}
            />
          ) : null}
        </section>

        <LeefstijlprofielViewToggle view={view} onChange={setView} />

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
