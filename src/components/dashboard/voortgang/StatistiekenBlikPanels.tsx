"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { Button } from "@/components/app/primitives";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import LeefstijllijnSection from "@/components/dashboard/LeefstijllijnSection";
import SupplementVerdictPanel from "@/components/dashboard/SupplementVerdictPanel";
import EvidenceLadderCard from "@/components/dashboard/voortgang/EvidenceLadderCard";
import VoortgangSectionHeader from "@/components/dashboard/voortgang/VoortgangSectionHeader";
import { nutrientReferences } from "@/data/nutrition/intake-reference";
import { clarityTag } from "@/lib/clarity";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { trackEvent } from "@/lib/ga4";
import {
  buildAdviesBlokHeadline,
  buildStatistiekenAdviesModel,
} from "@/lib/statistieken-advies-model";
import { STATISTIEKEN_BLIK_HEADERS } from "@/lib/statistieken-blik";
import { withVoortgangReturn } from "@/lib/voortgang-return-link";
import type { DashboardData, DashboardModel, StatistiekenBlik } from "@/types/dashboard";
import { StatistiekenBlikCrossLinks } from "@/components/dashboard/voortgang/StatistiekenBlikNav";

type StatistiekenBlikPanelsProps = {
  blik: StatistiekenBlik;
  model: DashboardModel;
  data: DashboardData;
  onOpenFavorieten: () => void;
  onBlikChange: (blik: StatistiekenBlik) => void;
  overTijdExtra?: ReactNode;
  adviesExtra?: ReactNode;
  standFooter?: ReactNode;
  overTijdFooter?: ReactNode;
};

export default function StatistiekenBlikPanels({
  blik,
  model,
  data,
  onOpenFavorieten,
  onBlikChange,
  overTijdExtra,
  adviesExtra,
  standFooter,
  overTijdFooter,
}: StatistiekenBlikPanelsProps) {
  const adviesModel = useMemo(
    () => buildStatistiekenAdviesModel(model, data),
    [model, data],
  );
  const adviesShownRef = useRef(false);
  const gatePassedRef = useRef(false);
  const blikImpressionRef = useRef<StatistiekenBlik | null>(null);

  useEffect(() => {
    if (blikImpressionRef.current === blik) {
      return;
    }
    blikImpressionRef.current = blik;
    trackEvent("dashboard_statistieken_blik", { blik });
    clarityTag("dashboard_statistieken", blik);
  }, [blik]);

  useEffect(() => {
    if (blik !== "advies" || adviesShownRef.current) {
      return;
    }
    adviesShownRef.current = true;
    trackEvent("dashboard_advies_blok_getoond", {
      state: adviesModel.adviesState,
      verdict_count: adviesModel.verdictTotal,
      buy_count: adviesModel.buyCount,
    });
    clarityTag("dashboard_advies", adviesModel.adviesState);

    if (
      adviesModel.adviesState !== "nutrition_missing" &&
      !gatePassedRef.current
    ) {
      gatePassedRef.current = true;
      emitIntakeClientEvent("dashboard.advies_gate_passed", {
        from_surface: "voortgang_statistieken",
        verdict_count: adviesModel.verdictTotal,
      });
    }
  }, [blik, adviesModel]);

  const header = STATISTIEKEN_BLIK_HEADERS[blik];

  return (
    <div
      role="tabpanel"
      aria-label={header.title}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <VoortgangSectionHeader
        eyebrow={header.eyebrow}
        title={header.title}
        body={header.body}
      />

      {blik === "stand" ? (
        <>
          <WaarStaJeCard model={adviesModel} />
          <LeefstijllijnSection
            model={model}
            surface="voortgang"
            compact
            focusPillarId={model.priority.id}
          />
          <StatistiekenBlikCrossLinks onSwitch={onBlikChange} />
          {standFooter}
        </>
      ) : null}

      {blik === "advies" ? (
        <>
          <EvidenceLadderCard domains={adviesModel.evidenceDomains} />
          <div style={{ borderTop: "1px solid var(--divider-strong)", paddingTop: 16 }}>
            <VoortgangSectionHeader
              eyebrow="Wat we ervan vinden"
              title="Eerst je bord. Daarna pas een potje."
              body="Op basis van je laatste check — en van wat je hierboven ziet bewegen."
            />
          </div>
          <EerstJeBordCard adviesModel={adviesModel} />
          {adviesExtra}
          <OnsOordeelCard
            adviesModel={adviesModel}
            verdicts={data.supplementVerdicts ?? []}
            onOpenFavorieten={onOpenFavorieten}
          />
          <WelkPotjeCard adviesModel={adviesModel} onOpenFavorieten={onOpenFavorieten} />
        </>
      ) : null}

      {blik === "tijd" ? (
        <>
          <LeefstijllijnSection model={model} surface="voortgang" />
          {overTijdExtra}
          {overTijdFooter}
        </>
      ) : null}
    </div>
  );
}

function WaarStaJeCard({
  model: adviesModel,
}: {
  model: ReturnType<typeof buildStatistiekenAdviesModel>;
}) {
  return (
    <CockpitTile>
      <VoortgangSectionHeader
        eyebrow={`Op basis van je check van ${adviesModel.checkDateLabel}`}
        title={adviesModel.snapshotHeadline}
        body={adviesModel.snapshotBody}
      />

      {adviesModel.freshnessNudges.map((nudge) => (
        <p
          key={nudge.pillarId}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            margin: "14px 0 0",
            fontSize: 12.5,
            color: "var(--text-muted)",
            lineHeight: 1.5,
            textWrap: "pretty",
          }}
        >
          <Icons.Spark s={14} style={{ color: "var(--text-subtle)", marginTop: 2 }} />
          <span>
            {nudge.label} is {nudge.daysAgo} dagen niet ververst. Een hermeting kan
            dit beeld — en het advies hieronder — veranderen.
          </span>
        </p>
      ))}
    </CockpitTile>
  );
}

function EerstJeBordCard({
  adviesModel,
}: {
  adviesModel: ReturnType<typeof buildStatistiekenAdviesModel>;
}) {
  return (
    <CockpitTile>
      <VoortgangSectionHeader
        eyebrow="Stap 1 van 3 · Uit voeding"
        title={
          adviesModel.nutritionLadderPending
            ? undefined
            : adviesModel.nutritionLadder.length > 0
              ? "Dit haal je van tafel"
              : "Je voeding dekt de belangrijkste gaps"
        }
        body={
          adviesModel.nutritionLadderPending
            ? "Zodra je voeding bekend is, staat hier wat je van tafel kunt halen."
            : undefined
        }
      />

      {adviesModel.nutritionLadder.length > 0 ? (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {adviesModel.nutritionLadder.map((item) => {
            const nutrientLabel = nutrientReferences[item.nutrient]?.label ?? item.nutrient;
            if (item.kind === "lifestyle") {
              return (
                <li
                  key={`${item.nutrient}-lifestyle`}
                  style={{
                    padding: "12px 0",
                    borderTop: "1px solid var(--divider)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--f-serif)",
                      fontSize: 16,
                      color: "var(--text)",
                    }}
                  >
                    {nutrientLabel}
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "var(--terra, #C8956C)",
                      }}
                    >
                      onder referentie
                    </span>
                  </div>
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: 13,
                      color: "var(--text-muted)",
                      lineHeight: 1.5,
                      textWrap: "pretty",
                    }}
                  >
                    {item.text}
                  </p>
                </li>
              );
            }

            const href = withVoortgangReturn(item.comparisonPath);
            return (
              <li
                key={`${item.nutrient}-supplement`}
                style={{
                  padding: "12px 0",
                  borderTop: "1px solid var(--divider)",
                }}
              >
                <Link
                  href={href}
                  onClick={() => {
                    trackEvent("dashboard_ladder_step_click", {
                      step: "supplement",
                      nutrient: item.nutrient,
                    });
                    clarityTag("dashboard_ladder", item.nutrient);
                  }}
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--text-muted)",
                      lineHeight: 1.5,
                      textWrap: "pretty",
                    }}
                  >
                    {item.claimText}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </CockpitTile>
  );
}

function OnsOordeelCard({
  adviesModel,
  verdicts,
  onOpenFavorieten,
}: {
  adviesModel: ReturnType<typeof buildStatistiekenAdviesModel>;
  verdicts: DashboardData["supplementVerdicts"];
  onOpenFavorieten: () => void;
}) {
  if (adviesModel.adviesState === "nutrition_missing") {
    return (
      <CockpitTile>
        <VoortgangSectionHeader
          eyebrow="Stap 2 van 3 · Nog niet te zeggen"
          title={buildAdviesBlokHeadline(adviesModel)}
          body="We beoordelen supplementen pas nadat je voeding bekend is. Eerst weten wat er van tafel komt — dat duurt een minuut."
        />
        <p
          style={{
            margin: "0 0 16px",
            fontSize: 13,
            color: "var(--text-muted)",
            lineHeight: 1.55,
            textWrap: "pretty",
          }}
        >
          Voor alle supplementen geldt nu hetzelfde: eerst weten wat er van tafel komt.
        </p>
        <Link
          href="/intake/voeding?from=dashboard"
          style={{ textDecoration: "none" }}
          onClick={() => {
            trackEvent("dashboard_voedingscheck_cta_click", {
              surface: "voortgang_statistieken",
            });
            clarityTag("dashboard_voedingscheck_cta", "voortgang_statistieken");
          }}
        >
          <Button variant="primary" full>
            Vul je voeding in (1 min)
          </Button>
        </Link>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: 12,
            color: "var(--text-subtle)",
            lineHeight: 1.5,
            textWrap: "pretty",
          }}
        >
          Wij verkopen zelf niets. Deze stap leidt vaak tot &quot;niet nodig&quot; — en
          dat is ook een antwoord.
        </p>
      </CockpitTile>
    );
  }

  return (
    <CockpitTile>
      <VoortgangSectionHeader
        eyebrow="Stap 2 van 3 · Ons oordeel"
        title={buildAdviesBlokHeadline(adviesModel)}
      />
      <SupplementVerdictPanel
        verdicts={verdicts}
        variant="summary"
        surface="statistieken"
        onViewAll={onOpenFavorieten}
        hideHeader
      />
    </CockpitTile>
  );
}

function WelkPotjeCard({
  adviesModel,
  onOpenFavorieten,
}: {
  adviesModel: ReturnType<typeof buildStatistiekenAdviesModel>;
  onOpenFavorieten: () => void;
}) {
  if (adviesModel.adviesState === "nutrition_missing") {
    return null;
  }

  const handleClick = () => {
    trackEvent("dashboard_voortgang_hub_click", {
      destination: "favorieten",
      surface: "statistieken_stap3",
    });
    clarityTag("dashboard_voortgang", "statistieken_stap3");
    onOpenFavorieten();
  };

  return (
    <CockpitTile>
      <VoortgangSectionHeader
        eyebrow="Stap 3 van 3 · Welk potje"
        title="Je keuzes en onze aanraders"
        body="Wat je zelf al koos, en wat wij zouden pakken — op één plek."
      />
      <button
        type="button"
        onClick={handleClick}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: 0,
          border: "none",
          background: "none",
          fontSize: 14,
          fontWeight: 600,
          color: "var(--sage)",
          cursor: "pointer",
        }}
      >
        Naar Favorieten
        <Icons.ChevronRight s={16} />
      </button>
    </CockpitTile>
  );
}
