"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/app/primitives";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import SupplementVerdictPanel from "@/components/dashboard/SupplementVerdictPanel";
import EvidenceLadderCard from "@/components/dashboard/voortgang/EvidenceLadderCard";
import VoortgangSectionHeader from "@/components/dashboard/voortgang/VoortgangSectionHeader";
import { nutrientReferences } from "@/data/nutrition/intake-reference";
import { buildRecommendations } from "@/lib/build-recommendations";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import {
  buildAdviesBlokHeadline,
  buildStatistiekenAdviesModel,
} from "@/lib/statistieken-advies-model";
import { buildRecommendationsEligibility } from "@/lib/supplement-eligibility";
import { withVoortgangReturn } from "@/lib/voortgang-return-link";
import type { DashboardData, DashboardModel, LeefstijlprofielView } from "@/types/dashboard";

type LeefstijlprofielSupplementSectionProps = {
  model: DashboardModel;
  data: DashboardData;
  view: LeefstijlprofielView;
  adviesExtra?: ReactNode;
};

export default function LeefstijlprofielSupplementSection({
  model,
  data,
  view,
  adviesExtra,
}: LeefstijlprofielSupplementSectionProps) {
  const adviesModel = useMemo(
    () => buildStatistiekenAdviesModel(model, data),
    [model, data],
  );
  const eligibility = buildRecommendationsEligibility(data.nutritionIntake);
  const nutritionLogCompleted = eligibility.nutritionLogCompleted === true;
  const verdicts = data.supplementVerdicts ?? [];

  const session: IntakeSessionPayload = {
    sessionId: data.sessionId ?? "",
    symptoms: [],
    answers: model.answers ?? {},
    scores: model.domainScores,
    urgency: "",
    profile: data.profileLabel ?? "",
    timestamp: 0,
    ageRange: null,
    firstName: null,
  };
  const recommendations = buildRecommendations(session, eligibility);

  if (view === "mijn_keuze") {
    return (
      <section aria-label="Mijn keuze supplementen">
        <VoortgangSectionHeader eyebrow="Mijn keuze" title="Uit het schap" />
        {verdicts.length > 0 ? (
          <SupplementVerdictPanel
            verdicts={verdicts}
            variant="full"
            surface="leefstijlprofiel"
            hideHeader
          />
        ) : (
          <CockpitTile>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: "var(--text-muted)",
                lineHeight: 1.55,
                textWrap: "pretty",
              }}
            >
              Je hebt nog niets uit het schap gekozen.
            </p>
          </CockpitTile>
        )}
      </section>
    );
  }

  return (
    <section aria-label="Supplementen">
      <VoortgangSectionHeader eyebrow="Supplementen" title="Wat past bij je check" />
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <EvidenceLadderCard domains={adviesModel.evidenceDomains} />
        <EerstJeBordCard adviesModel={adviesModel} />
        {adviesExtra}
        <OnsOordeelCard adviesModel={adviesModel} verdicts={verdicts} />
        <AanbevolenCard
          nutritionLogCompleted={nutritionLogCompleted}
          recommendations={recommendations}
        />
      </div>
    </section>
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
        eyebrow="Uit voeding"
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
}: {
  adviesModel: ReturnType<typeof buildStatistiekenAdviesModel>;
  verdicts: DashboardData["supplementVerdicts"];
}) {
  if (adviesModel.adviesState === "nutrition_missing") {
    return (
      <CockpitTile>
        <VoortgangSectionHeader
          eyebrow="Nog niet te zeggen"
          title={buildAdviesBlokHeadline(adviesModel)}
          body="We beoordelen supplementen pas nadat je voeding bekend is. Eerst weten wat er van tafel komt — dat duurt een minuut."
        />
        <Link
          href="/intake/voeding?from=dashboard"
          style={{ textDecoration: "none" }}
          onClick={() => {
            trackEvent("dashboard_voedingscheck_cta_click", {
              surface: "leefstijlprofiel",
            });
            clarityTag("dashboard_voedingscheck_cta", "leefstijlprofiel");
          }}
        >
          <Button variant="primary" full>
            Vul je voeding in (1 min)
          </Button>
        </Link>
      </CockpitTile>
    );
  }

  return (
    <CockpitTile>
      <VoortgangSectionHeader
        eyebrow="Ons oordeel"
        title={buildAdviesBlokHeadline(adviesModel)}
      />
      <SupplementVerdictPanel
        verdicts={verdicts}
        variant="summary"
        surface="leefstijlprofiel"
        hideHeader
      />
    </CockpitTile>
  );
}

function AanbevolenCard({
  nutritionLogCompleted,
  recommendations,
}: {
  nutritionLogCompleted: boolean;
  recommendations: ReturnType<typeof buildRecommendations>;
}) {
  if (!nutritionLogCompleted) {
    return null;
  }

  if (recommendations.length === 0) {
    return (
      <CockpitTile>
        <VoortgangSectionHeader eyebrow="Aanbevolen" title="Uit je checks" />
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: "var(--text-muted)",
            lineHeight: 1.55,
            textWrap: "pretty",
          }}
        >
          Op basis van je checks is er nu geen supplement dat we extra benadrukken.
        </p>
      </CockpitTile>
    );
  }

  return (
    <div>
      <VoortgangSectionHeader eyebrow="Aanbevolen" title="Uit je checks" />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
        {recommendations.slice(0, 4).map((rec) => {
          const href = rec.comparisonHref ?? rec.guideHref;
          return (
            <Link
              key={rec.slug}
              href={href}
              onClick={() => {
                trackEvent("dashboard_aanrader_click", {
                  slug: rec.slug,
                  target: href,
                });
                clarityTag("dashboard_aanrader", rec.slug);
              }}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <CockpitTile>
                <div
                  style={{
                    fontFamily: "var(--f-serif)",
                    fontSize: 17,
                    color: "var(--text)",
                    lineHeight: 1.25,
                    marginBottom: 4,
                  }}
                >
                  {rec.name}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13.5,
                    color: "var(--text-muted)",
                    lineHeight: 1.5,
                    textWrap: "pretty",
                  }}
                >
                  {rec.reason}
                </p>
              </CockpitTile>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
