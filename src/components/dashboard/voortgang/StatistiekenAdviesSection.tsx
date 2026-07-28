"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { Button, Card } from "@/components/app/primitives";
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
import { withVoortgangReturn } from "@/lib/voortgang-return-link";
import type { DashboardData, DashboardModel } from "@/types/dashboard";

type StatistiekenAdviesSectionProps = {
  model: DashboardModel;
  data: DashboardData;
  onOpenFavorieten: () => void;
};

export default function StatistiekenAdviesSection({
  model,
  data,
  onOpenFavorieten,
}: StatistiekenAdviesSectionProps) {
  const adviesModel = useMemo(
    () => buildStatistiekenAdviesModel(model, data),
    [model, data],
  );
  const shownRef = useRef(false);
  const gatePassedRef = useRef(false);

  useEffect(() => {
    if (shownRef.current) {
      return;
    }
    shownRef.current = true;
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
  }, [adviesModel]);

  return (
    <div
      className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5"
      aria-label="Gratis advies"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <WaarStaJeCard model={adviesModel} />
        <EvidenceLadderCard domains={adviesModel.evidenceDomains} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <EerstJeBordCard adviesModel={adviesModel} />
        <OnsOordeelCard
          adviesModel={adviesModel}
          verdicts={data.supplementVerdicts ?? []}
          onOpenFavorieten={onOpenFavorieten}
        />
      </div>
    </div>
  );
}

function WaarStaJeCard({
  model: adviesModel,
}: {
  model: ReturnType<typeof buildStatistiekenAdviesModel>;
}) {
  return (
    <Card pad={18}>
      <VoortgangSectionHeader
        eyebrow={`Op basis van je check van ${adviesModel.checkDateLabel}`}
        title={adviesModel.snapshotHeadline}
        body={adviesModel.snapshotBody}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {adviesModel.domainRows.map((row) => (
          <div
            key={row.pillarId}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <span
              style={{
                width: 72,
                fontSize: 13,
                color: "var(--text)",
                flexShrink: 0,
              }}
            >
              {row.label}
            </span>
            <div
              style={{
                flex: 1,
                height: 8,
                borderRadius: 999,
                background: "rgba(255,255,255,0.06)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.max(0, Math.min(100, row.score))}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: row.isWeak ? "var(--terra, #C8956C)" : "var(--sage)",
                }}
              />
            </div>
            <span
              style={{
                width: 28,
                fontSize: 13,
                fontVariantNumeric: "tabular-nums",
                color: "var(--text-muted)",
                textAlign: "right",
                flexShrink: 0,
              }}
            >
              {row.score}
            </span>
            {row.isWeak ? (
              <span
                style={{
                  fontSize: 11,
                  color: "var(--terra, #C8956C)",
                  flexShrink: 0,
                }}
              >
                zwak
              </span>
            ) : (
              <span style={{ width: 32, flexShrink: 0 }} aria-hidden />
            )}
          </div>
        ))}
      </div>

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
    </Card>
  );
}

function EerstJeBordCard({
  adviesModel,
}: {
  adviesModel: ReturnType<typeof buildStatistiekenAdviesModel>;
}) {
  return (
    <Card pad={18}>
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
    </Card>
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
      <Card pad={18}>
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
      </Card>
    );
  }

  return (
    <div>
      <Card pad={18} style={{ marginBottom: 0 }}>
        <VoortgangSectionHeader
          eyebrow="Stap 2 van 3 · Ons oordeel"
          title={buildAdviesBlokHeadline(adviesModel)}
        />
      </Card>
      <SupplementVerdictPanel
        verdicts={verdicts}
        variant="summary"
        surface="statistieken"
        onViewAll={onOpenFavorieten}
        hideHeader
      />
    </div>
  );
}
