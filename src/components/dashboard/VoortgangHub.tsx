"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { IDENTITY_FIELDS } from "@/data/dashboard";
import { buildRecommendations } from "@/lib/build-recommendations";
import { buildRecommendationsEligibility } from "@/lib/supplement-eligibility";
import MetingenCard from "@/components/dashboard/MetingenCard";
import RecommendedInsights from "@/components/dashboard/RecommendedInsights";
import SupplementVerdictPanel from "@/components/dashboard/SupplementVerdictPanel";
import VoortgangHubScroll from "@/components/dashboard/voortgang/VoortgangHubScroll";
import VoortgangDomeinScreen from "@/components/dashboard/voortgang/VoortgangDomeinScreen";
import StatistiekenBlikNav from "@/components/dashboard/voortgang/StatistiekenBlikNav";
import StatistiekenBlikPanels from "@/components/dashboard/voortgang/StatistiekenBlikPanels";
import FavorietenBewegingSection from "@/components/dashboard/voortgang/FavorietenBewegingSection";
import KompasFocusSection from "@/components/dashboard/voortgang/KompasFocusSection";
import VoortgangSectionHeader from "@/components/dashboard/voortgang/VoortgangSectionHeader";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";
import PremiumWaitlistCard from "@/components/dashboard/PremiumWaitlistCard";
import VitalityGauge from "@/components/app/VitalityGauge";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { getVitalityExplainer } from "@/lib/vitality-explainer";
import { getVitalityScoreCardCopy } from "@/lib/vitality-score-copy";
import { withVoortgangReturn } from "@/lib/voortgang-return-link";
import { buildDashboardVandaagHref, type SyncDashboardVoortgangOptions } from "@/lib/dashboard-url";
import type {
  AccountPriorityPrefData,
  DashboardData,
  DashboardModel,
  DashboardTabId,
  PillarId,
  StatistiekenBlik,
  VoortgangScreen,
} from "@/types/dashboard";

export type { VoortgangScreen };

type VoortgangHubProps = {
  model: DashboardModel | null;
  data?: DashboardData;
  tab: DashboardTabId;
  screen: VoortgangScreen;
  statistiekenBlik: StatistiekenBlik;
  voortgangDomein: PillarId | null;
  favorietenDomein: PillarId | null;
  statistiekenAdviesExtra: ReactNode;
  statistiekenOverTijdExtra: ReactNode;
  onScreenChange: (screen: VoortgangScreen, options?: SyncDashboardVoortgangOptions) => void;
  onStatistiekenBlikChange: (blik: StatistiekenBlik) => void;
  onPrefUpdated: (pref: AccountPriorityPrefData | null) => void;
  onGoAgenda: () => void;
  onGoHermeting: () => void;
};

function handleSupplementenHubClick() {
  trackEvent("dashboard_voortgang_supplementen_click", { surface: "voortgang" });
  clarityTag("dashboard_voortgang", "supplementen");
}

function VoortgangSubHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
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
        <Icons.ArrowRight
          s={18}
          style={{ transform: "rotate(180deg)" }}
        />
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
        {title}
      </div>
    </div>
  );
}

function FavorietenView({
  model,
  data,
  favorietenDomein,
  onBack,
}: {
  model: DashboardModel;
  data?: DashboardData;
  favorietenDomein: PillarId | null;
  onBack: () => void;
}) {
  const eligibility = buildRecommendationsEligibility(data?.nutritionIntake);
  const verdicts = data?.supplementVerdicts ?? [];
  const nutritionLogCompleted = eligibility.nutritionLogCompleted === true;
  const supplementenHref = withVoortgangReturn("/supplementen");
  const scopedBeweging = favorietenDomein === "beweging";

  const session: IntakeSessionPayload = {
    sessionId: data?.sessionId ?? "",
    symptoms: [],
    answers: model.answers ?? {},
    scores: model.domainScores,
    urgency: "",
    profile: data?.profileLabel ?? "",
    timestamp: 0,
    ageRange: null,
    firstName: null,
  };
  const recommendations = buildRecommendations(session, eligibility);

  if (scopedBeweging) {
    return (
      <section aria-label="Favorieten · Beweging" style={{ paddingTop: 16 }}>
        <VoortgangSubHeader title="Favorieten · Beweging" onBack={onBack} />
        <FavorietenBewegingSection model={model} data={data} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontSize: 11.5,
            color: "var(--text-muted)",
            marginTop: 20,
          }}
        >
          <Icons.Shield s={13} style={{ color: "var(--sage)" }} />
          <span>
            Algemene oriëntatie op basis van je antwoorden — geen persoonlijk medisch advies.
            Wij verkopen zelf niets.
          </span>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Favorieten" style={{ paddingTop: 16 }}>
      <VoortgangSubHeader title="Favorieten" onBack={onBack} />

      <details open className="mb-6 rounded-2xl border border-white/10 bg-black/15">
        <summary className="cursor-pointer list-none px-5 py-4 font-serif text-[18px] text-[var(--text)] [&::-webkit-details-marker]:hidden">
          Supplementen
        </summary>
        <div className="flex flex-col gap-6 px-5 pb-5">
          <section aria-label="Aanbevolen supplementen">
            <VoortgangSectionHeader eyebrow="Aanbevolen" title="Uit je checks" />
            <p
              style={{
                margin: "0 0 12px",
                fontSize: 12.5,
                color: "var(--text-subtle)",
                lineHeight: 1.55,
                textWrap: "pretty",
              }}
            >
              Afgeleid uit je check — hier verdienen we niets aan.
            </p>
            {!nutritionLogCompleted ? (
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
                  Supplementadvies tonen we pas na je voedingscheck — leefstijl eerst, in die
                  volgorde.
                </p>
                <Link
                  href="/intake/voeding?from=dashboard"
                  onClick={() => {
                    trackEvent("dashboard_voedingscheck_cta_click", {
                      surface: "voortgang_favorieten",
                    });
                    clarityTag("dashboard_voedingscheck_cta", "voortgang_favorieten");
                  }}
                  className="mt-3 inline-flex items-center gap-1 text-[13.5px] font-semibold text-[var(--sage)] no-underline"
                >
                  Start voedingscheck (1 min) <Icons.ChevronRight s={15} />
                </Link>
              </CockpitTile>
            ) : recommendations.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
                  Op basis van je checks is er nu geen supplement dat we extra benadrukken.
                </p>
              </CockpitTile>
            )}
          </section>

          <section aria-label="Mijn keuze supplementen">
            <VoortgangSectionHeader eyebrow="Mijn keuze" title="Uit het schap" />
            {verdicts.length > 0 ? (
              <SupplementVerdictPanel
                verdicts={verdicts}
                variant="full"
                surface="favorieten"
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
                <Link
                  href={supplementenHref}
                  onClick={handleSupplementenHubClick}
                  className="mt-3 inline-flex items-center gap-1 text-[13.5px] font-semibold text-[var(--sage)] no-underline"
                >
                  Naar supplementen <Icons.ChevronRight s={15} />
                </Link>
              </CockpitTile>
            )}
          </section>
        </div>
      </details>

      <details className="mb-6 rounded-2xl border border-white/10 bg-black/15">
        <summary className="cursor-pointer list-none px-5 py-4 font-serif text-[18px] text-[var(--text)] [&::-webkit-details-marker]:hidden">
          Leefstijlkeuzes
        </summary>
        <div className="px-5 pb-5">
          <details className="rounded-xl border border-white/[0.06] bg-black/10">
            <summary className="cursor-pointer list-none px-4 py-3.5 text-[14.5px] font-semibold text-[var(--text)] [&::-webkit-details-marker]:hidden">
              Beweging
            </summary>
            <div className="px-4 pb-4">
              <FavorietenBewegingSection model={model} data={data} />
            </div>
          </details>
        </div>
      </details>

      <Link
        href={supplementenHref}
        onClick={handleSupplementenHubClick}
        className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--sage)] bg-[rgba(90,143,106,0.12)] px-5 py-[13px] text-[14.5px] font-semibold text-[var(--sage)] no-underline transition hover:bg-[rgba(90,143,106,0.2)]"
      >
        Alle supplementen bekijken
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          fontSize: 11.5,
          color: "var(--text-muted)",
          marginTop: 14,
        }}
      >
        <Icons.Shield s={13} style={{ color: "var(--sage)" }} />
        <span>
          Algemene oriëntatie op basis van je antwoorden — geen persoonlijk medisch advies. Wij
          verkopen zelf niets.
        </span>
      </div>
    </section>
  );
}

function InsightTips({ tips }: { tips: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {tips.map((tip) => (
        <CockpitTile key={tip}>
          <div
            style={{
              fontSize: 14,
              color: "var(--text)",
              lineHeight: 1.55,
              textWrap: "pretty",
            }}
          >
            {tip}
          </div>
        </CockpitTile>
      ))}
    </div>
  );
}

function VitaalscoreInzichtenView({
  model,
  firstName,
  onBack,
}: {
  model: DashboardModel;
  firstName: string | null;
  onBack: () => void;
}) {
  const cardCopy = getVitalityScoreCardCopy({
    firstName,
    vitality: model.vitality,
    priorityId: model.priority.id,
    priorityScore: model.scores[model.priority.id],
    answers: model.answers,
    domainScores: model.domainScores,
  });
  const explainer = getVitalityExplainer({
    vitality: model.vitality,
    vitalityDelta: model.vitalityDelta,
    vitalityDeltaComparable: model.vitalityDeltaNote == null,
    priorityId: model.priority.id,
    priorityScore: model.scores[model.priority.id],
    answers: model.answers,
    domainScores: model.domainScores,
  });
  const heading = cardCopy.heading;
  const body = cardCopy.body;
  const tipLines = [explainer[1], explainer[2]].filter(Boolean);

  return (
    <section aria-label="Jouw inzichten" style={{ paddingTop: 16 }}>
      <VoortgangSubHeader title="Jouw inzichten" onBack={onBack} />

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div className="vitaalscore-card__gauge-zone" style={{ marginInline: -8 }}>
          <VitalityGauge
            value={model.vitality}
            size={300}
            stroke={18}
            variant="hero"
            theme="light"
            tone="light"
            showBandLabel={false}
          />
        </div>

        <div style={{ textAlign: "center", padding: "0 8px" }}>
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--f-serif)",
              fontSize: 24,
              fontWeight: 400,
              color: "var(--text)",
              lineHeight: 1.2,
            }}
          >
            {heading}
          </h2>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: 15,
              color: "var(--text-muted)",
              lineHeight: 1.55,
              textWrap: "pretty",
            }}
          >
            {body}
          </p>
        </div>

        <InsightTips tips={tipLines} />

        <RecommendedInsights pillarId={model.priority.id} />

        <MetingenCard scores={model.scores} history={model.history} />
      </div>
    </section>
  );
}

function StatistiekenView({
  model,
  data,
  blik,
  statistiekenAdviesExtra,
  statistiekenOverTijdExtra,
  onBack,
  onOpenFavorieten,
  onBlikChange,
}: {
  model: DashboardModel;
  data?: DashboardData;
  blik: StatistiekenBlik;
  statistiekenAdviesExtra: ReactNode;
  statistiekenOverTijdExtra: ReactNode;
  onBack: () => void;
  onOpenFavorieten: () => void;
  onBlikChange: (blik: StatistiekenBlik) => void;
}) {
  const handleBlikSwitch = (next: StatistiekenBlik) => {
    if (next === blik) {
      return;
    }
    trackEvent("dashboard_statistieken_blik_switch", { from: blik, to: next });
    clarityTag("dashboard_statistieken_switch", `${blik}_to_${next}`);
    onBlikChange(next);
  };

  return (
    <section aria-label="Statistieken" style={{ paddingTop: 16 }}>
      <VoortgangSubHeader title="Statistieken" onBack={onBack} />

      <StatistiekenBlikNav activeBlik={blik} onSwitch={handleBlikSwitch} />

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
        {data ? (
          <StatistiekenBlikPanels
            blik={blik}
            model={model}
            data={data}
            onOpenFavorieten={onOpenFavorieten}
            onBlikChange={handleBlikSwitch}
            adviesExtra={statistiekenAdviesExtra}
            overTijdExtra={statistiekenOverTijdExtra}
            overTijdFooter={<PremiumWaitlistCard surface="statistieken" />}
          />
        ) : null}
      </div>
    </section>
  );
}

function LichaamssamenstellingView({ onBack }: { onBack: () => void }) {
  const shownRef = useRef(false);

  useEffect(() => {
    if (shownRef.current) {
      return;
    }
    shownRef.current = true;
    trackEvent("dashboard_lichaamssamenstelling_getoond", { surface: "voortgang" });
    clarityTag("dashboard_lichaamssamenstelling", "closed_door");
  }, []);

  return (
    <section aria-label="Lichaamssamenstelling" style={{ paddingTop: 16 }}>
      <VoortgangSubHeader title="Lichaamssamenstelling" onBack={onBack} />

      <div style={{ paddingBottom: 24 }}>
        <CockpitTile className="mb-4">
          <div
            style={{
              fontFamily: "var(--f-serif)",
              fontSize: 20,
              color: "var(--text)",
              lineHeight: 1.25,
              margin: "0 0 8px",
            }}
          >
            Deze deur staat nog dicht
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: "var(--text-muted)",
              lineHeight: 1.55,
              textWrap: "pretty",
            }}
          >
            Lichaamssamenstelling — vet, spier en vocht als aparte meetlat — opent pas als je
            leefstijl-basis staat en je hertest binnen is. Er staat nu niets van jou in.
          </p>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: 11,
              color: "var(--text-subtle)",
              lineHeight: 1.6,
            }}
          >
            Geen kaarten, geen teaser. Een dichte deur die toch iets laat zien is geen dichte deur.
          </p>
        </CockpitTile>

        <CockpitTile>
          <div
            style={{
              fontFamily: "var(--f-serif)",
              fontSize: 18,
              color: "var(--text)",
              marginBottom: 14,
            }}
          >
            Wat we van je weten
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {IDENTITY_FIELDS.map((field, index) => (
              <div
                key={field.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 0",
                  borderTop: index ? "1px solid var(--divider)" : "none",
                }}
              >
                <span style={{ flex: 1, fontSize: 14, color: "var(--text)" }}>
                  {field.label}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: "var(--text-subtle)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {field.value ?? "nog niet ingevuld"}
                </span>
              </div>
            ))}
          </div>
        </CockpitTile>
      </div>
    </section>
  );
}

export default function VoortgangHub({
  model,
  data,
  tab,
  screen,
  statistiekenBlik,
  voortgangDomein,
  favorietenDomein,
  statistiekenAdviesExtra,
  statistiekenOverTijdExtra,
  onScreenChange,
  onStatistiekenBlikChange,
  onPrefUpdated: _onPrefUpdated,
  onGoAgenda,
  onGoHermeting,
}: VoortgangHubProps) {
  const router = useRouter();
  const setScreen = (next: VoortgangScreen, options?: SyncDashboardVoortgangOptions) => {
    onScreenChange(next, options);
  };

  useEffect(() => {
    if (tab !== "voortgang") {
      onScreenChange("hub");
    }
  }, [tab, onScreenChange]);

  const navigate = (next: VoortgangScreen, options?: SyncDashboardVoortgangOptions) => {
    setScreen(next, options);
  };

  const goBack = () => {
    trackEvent("dashboard_voortgang_terug", { from: screen });
    if (screen === "lichaamssamenstelling") {
      setScreen("statistieken");
      return;
    }
    if (
      screen === "favorieten" ||
      screen === "statistieken" ||
      screen === "inzichten" ||
      screen === "domein"
    ) {
      setScreen("hub");
    }
  };

  const openHub = (
    destination: "favorieten" | "statistieken" | "inzichten",
    options?: SyncDashboardVoortgangOptions,
  ) => {
    trackEvent("dashboard_voortgang_hub_click", { destination });
    clarityTag("dashboard_voortgang", destination);
    setScreen(destination, options);
  };

  if (!model) {
    return null;
  }

  if (screen === "inzichten") {
    return (
      <VitaalscoreInzichtenView
        model={model}
        firstName={data?.firstName ?? null}
        onBack={goBack}
      />
    );
  }

  if (screen === "favorieten") {
    return (
      <FavorietenView
        model={model}
        data={data}
        favorietenDomein={favorietenDomein}
        onBack={goBack}
      />
    );
  }

  if (screen === "statistieken") {
    return (
      <StatistiekenView
        model={model}
        data={data}
        blik={statistiekenBlik}
        statistiekenAdviesExtra={statistiekenAdviesExtra}
        statistiekenOverTijdExtra={statistiekenOverTijdExtra}
        onBack={goBack}
        onOpenFavorieten={() => navigate("favorieten")}
        onBlikChange={onStatistiekenBlikChange}
      />
    );
  }

  if (screen === "lichaamssamenstelling") {
    return <LichaamssamenstellingView onBack={goBack} />;
  }

  if (screen === "domein" && voortgangDomein) {
    return (
      <VoortgangDomeinScreen
        model={model}
        data={data}
        domain={voortgangDomein}
        onBack={goBack}
        onGoVandaag={() => router.push(buildDashboardVandaagHref(voortgangDomein))}
        onOpenFavorieten={
          voortgangDomein === "beweging"
            ? () => navigate("favorieten", { fav: "beweging" })
            : undefined
        }
      />
    );
  }

  return (
    <section aria-label="Voortgang navigatie">
      <VoortgangHubScroll
        model={model}
        data={data}
        onGoAgenda={onGoAgenda}
        onGoHermeting={onGoHermeting}
        onOpenDomain={(domain: PillarId) => {
          navigate("domein", { domein: domain });
        }}
        onOpenStatistieken={() => openHub("statistieken", { blik: "advies" })}
        onOpenFavorieten={() => openHub("favorieten")}
        onOpenInzichten={() => openHub("inzichten")}
      />
    </section>
  );
}
