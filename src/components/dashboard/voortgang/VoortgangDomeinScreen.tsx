"use client";

import { useEffect, useState } from "react";
import * as Icons from "@/components/app/icons";
import { DeltaBadge, Sparkline } from "@/components/app/primitives";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import KompasDomainGauge from "@/components/app/KompasDomainGauge";
import BewegingAdviesTreden from "@/components/dashboard/voortgang/BewegingAdviesTreden";
import { PILLAR, PILLAR_CHECKIN_ROUTES } from "@/data/dashboard";
import { buildBewegingAdviesTreden } from "@/lib/beweging-advies-treden";
import { clarityTag } from "@/lib/clarity";
import { getReadoutPresentation } from "@/lib/dashboard-readout";
import { isReadoutDomain } from "@/lib/domain-role";
import { trackEvent } from "@/lib/ga4";
import { buildLeefstijllijnRows } from "@/lib/leefstijllijn";
import { isMovementLogEnabled } from "@/lib/feature-flags";
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

  useEffect(() => {
    trackEvent("domain_tool.snapshot_viewed", { domain, surface: "voortgang_domein" });
    clarityTag("dashboard_voortgang_domein", domain);
  }, [domain]);

  const handleCheckin = () => {
    trackEvent("dashboard_beweging_checkin_click", { mode: "full", surface: "voortgang_beweging" });
    clarityTag("dashboard_beweging_checkin", "click");
  };

  // De deur opent de treden in-place; `target` scheidt die intentie van de
  // uitgaande klik naar een vergelijkingspagina (zelfde event, andere waarde).
  const handleAdvies = () => {
    const next = !adviesOpen;
    setAdviesOpen(next);
    if (!next) {
      return;
    }
    trackEvent("dashboard_beweging_supplement_click", {
      surface: "advies_voortgang",
      target: "beweging_treden",
    });
    clarityTag("dashboard_beweging_advies", "treden_geopend");
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
                : `Doe de ${pillar.label.toLowerCase()}-check opnieuw`}
            </span>
            <Icons.ChevronRight s={18} style={{ color: "#9FB0A6", flexShrink: 0 }} />
          </a>
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
