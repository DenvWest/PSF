"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { Button } from "@/components/app/primitives";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { IDENTITY_FIELDS } from "@/data/dashboard";
import { buildRecommendations } from "@/lib/build-recommendations";
import { buildRecommendationsEligibility } from "@/lib/supplement-eligibility";
import MetingenCard from "@/components/dashboard/MetingenCard";
import RecommendedInsights from "@/components/dashboard/RecommendedInsights";
import SupplementVerdictPanel from "@/components/dashboard/SupplementVerdictPanel";
import VoortgangHubScroll from "@/components/dashboard/voortgang/VoortgangHubScroll";
import StatistiekenBlikNav from "@/components/dashboard/voortgang/StatistiekenBlikNav";
import StatistiekenBlikPanels from "@/components/dashboard/voortgang/StatistiekenBlikPanels";
import FavorietenAanraderSection from "@/components/dashboard/voortgang/FavorietenAanraderSection";
import FavorietenKeuzeSection from "@/components/dashboard/voortgang/FavorietenKeuzeSection";
import PremiumWaitlistCard from "@/components/dashboard/PremiumWaitlistCard";
import VitalityGauge from "@/components/app/VitalityGauge";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { getVitalityExplainer } from "@/lib/vitality-explainer";
import { getVitalityScoreCardCopy } from "@/lib/vitality-score-copy";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";
import { withVoortgangReturn } from "@/lib/voortgang-return-link";
import { buildDashboardVandaagHref } from "@/lib/dashboard-url";
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
  statistiekenAdviesExtra: ReactNode;
  statistiekenOverTijdExtra: ReactNode;
  onScreenChange: (screen: VoortgangScreen, options?: { blik?: StatistiekenBlik }) => void;
  onStatistiekenBlikChange: (blik: StatistiekenBlik) => void;
  onPrefUpdated: (pref: AccountPriorityPrefData | null) => void;
  onGoAgenda: () => void;
  onGoHermeting: () => void;
};

function handleSupplementenHubClick() {
  trackEvent("dashboard_voortgang_supplementen_click", { surface: "voortgang" });
  clarityTag("dashboard_voortgang", "supplementen");
}

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "var(--terra, #C8956C)",
  border: "1px solid rgba(200,149,108,0.4)",
  borderRadius: 999,
  padding: "3px 8px",
  flexShrink: 0,
};

function HubCard({
  icon,
  title,
  subtitle,
  badge,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        padding: 0,
        border: "none",
        background: "none",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <CockpitTile>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[var(--sage)]">
            {icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--f-serif)",
                  fontSize: 18,
                  color: "var(--text)",
                  lineHeight: 1.2,
                }}
              >
                {title}
              </div>
              {badge ? <span style={badgeStyle}>{badge}</span> : null}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                marginTop: 3,
                lineHeight: 1.45,
                textWrap: "pretty",
              }}
            >
              {subtitle}
            </div>
          </div>
          <Icons.ChevronRight
            s={18}
            style={{ color: "var(--text-subtle)", flexShrink: 0 }}
          />
        </div>
      </CockpitTile>
    </button>
  );
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
  onBack,
  onOpenStatistieken,
}: {
  model: DashboardModel;
  data?: DashboardData;
  onBack: () => void;
  onOpenStatistieken: () => void;
}) {
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

  const eligibility = buildRecommendationsEligibility(data?.nutritionIntake);
  const recommendations = buildRecommendations(session, eligibility);
  const topRecommendation = recommendations[0] ?? null;
  const verdicts = data?.supplementVerdicts ?? [];
  const nutritionLogCompleted = eligibility.nutritionLogCompleted === true;
  const supplementenHref = withVoortgangReturn("/supplementen");

  const handleWijzigFocus = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section aria-label="Favorieten" style={{ paddingTop: 16 }}>
      <VoortgangSubHeader title="Favorieten" onBack={onBack} />

      <FavorietenKeuzeSection
        model={model}
        data={data}
        onWijzigFocus={handleWijzigFocus}
      />

      <FavorietenAanraderSection
        recommendation={topRecommendation}
        onOpenStatistieken={onOpenStatistieken}
      />

      <SupplementVerdictPanel
        verdicts={verdicts}
        variant="full"
        surface="favorieten"
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {!topRecommendation && verdicts.length === 0 ? (
          <Link
            href={nutritionLogCompleted ? supplementenHref : "/intake/voeding?from=dashboard"}
            style={{ textDecoration: "none" }}
            onClick={() => {
              if (!nutritionLogCompleted) {
                trackEvent("dashboard_voedingscheck_cta_click", {
                  surface: "voortgang_favorieten",
                });
                clarityTag("dashboard_voedingscheck_cta", "voortgang_favorieten");
                return;
              }
              handleSupplementenHubClick();
            }}
          >
            <Button variant="primary" full>
              {nutritionLogCompleted
                ? "Ontdek supplementen"
                : "Start voedingscheck (1 min)"}
            </Button>
          </Link>
        ) : null}
        <Link
          href={supplementenHref}
          onClick={handleSupplementenHubClick}
          className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--sage)] bg-[rgba(90,143,106,0.12)] px-5 py-[13px] text-[14.5px] font-semibold text-[var(--sage)] no-underline transition hover:bg-[rgba(90,143,106,0.2)]"
        >
          Alle supplementen bekijken
        </Link>
      </div>

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
          Algemene oriëntatie op basis van je antwoorden — geen persoonlijk
          medisch advies. Wij verkopen zelf niets.
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
  onOpenLichaam,
  onOpenFavorieten,
  onBlikChange,
}: {
  model: DashboardModel;
  data?: DashboardData;
  blik: StatistiekenBlik;
  statistiekenAdviesExtra: ReactNode;
  statistiekenOverTijdExtra: ReactNode;
  onBack: () => void;
  onOpenLichaam: () => void;
  onOpenFavorieten: () => void;
  onBlikChange: (blik: StatistiekenBlik) => void;
}) {
  const openLichaam = () => {
    trackEvent("dashboard_voortgang_hub_click", {
      destination: "lichaamssamenstelling",
      surface: "statistieken",
    });
    clarityTag("dashboard_voortgang", "lichaamssamenstelling");
    onOpenLichaam();
  };

  const handleBlikSwitch = (next: StatistiekenBlik) => {
    if (next === blik) {
      return;
    }
    trackEvent("dashboard_statistieken_blik_switch", { from: blik, to: next });
    clarityTag("dashboard_statistieken_switch", `${blik}_to_${next}`);
    onBlikChange(next);
  };

  const lichaamCard = (
    <HubCard
      icon={<Icons.User s={20} />}
      title="Lichaamssamenstelling"
      subtitle="Vet, spier en vocht als aparte meetlat"
      badge="Binnenkort"
      onClick={openLichaam}
    />
  );

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
            standFooter={lichaamCard}
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
    clarityTag("dashboard_lichaamssamenstelling", "binnenkort");
  }, []);

  return (
    <section aria-label="Lichaamssamenstelling" style={{ paddingTop: 16 }}>
      <VoortgangSubHeader title="Lichaamssamenstelling" onBack={onBack} />

      <div style={{ paddingBottom: 24 }}>
        <CockpitTile className="mb-4">
          <span style={badgeStyle}>Binnenkort</span>
          <div
            style={{
              fontFamily: "var(--f-serif)",
              fontSize: 20,
              color: "var(--text)",
              lineHeight: 1.25,
              margin: "12px 0 8px",
            }}
          >
            Hier komt je lichaamssamenstelling.
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
            Vet, spier en vocht als aparte meetlat, naast je leefstijl. We bouwen dit nog — er
            staat nu niets van jou in.
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
  statistiekenAdviesExtra,
  statistiekenOverTijdExtra,
  onScreenChange,
  onStatistiekenBlikChange,
  onPrefUpdated: _onPrefUpdated,
  onGoAgenda,
  onGoHermeting,
}: VoortgangHubProps) {
  const router = useRouter();
  const setScreen = (next: VoortgangScreen, options?: { blik?: StatistiekenBlik }) => {
    onScreenChange(next, options);
  };

  useEffect(() => {
    if (tab !== "voortgang") {
      onScreenChange("hub");
    }
  }, [tab, onScreenChange]);

  const navigate = (next: VoortgangScreen, options?: { blik?: StatistiekenBlik }) => {
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
      screen === "inzichten"
    ) {
      setScreen("hub");
    }
  };

  const openHub = (
    destination: "favorieten" | "statistieken" | "inzichten",
    options?: { blik?: StatistiekenBlik },
  ) => {
    trackEvent("dashboard_voortgang_hub_click", { destination });
    clarityTag("dashboard_voortgang", destination);
    setScreen(destination, options);
  };

  const openBegeleiding = () => {
    setScreen("statistieken", { blik: "tijd" });
    requestAnimationFrame(() => {
      document.getElementById("premium-begeleiding")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
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
        onBack={goBack}
        onOpenStatistieken={() => navigate("statistieken", { blik: "advies" })}
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
        onOpenLichaam={() => navigate("lichaamssamenstelling")}
        onOpenFavorieten={() => navigate("favorieten")}
        onBlikChange={onStatistiekenBlikChange}
      />
    );
  }

  if (screen === "lichaamssamenstelling") {
    return <LichaamssamenstellingView onBack={goBack} />;
  }

  return (
    <section aria-label="Voortgang navigatie">
      <VoortgangHubScroll
        model={model}
        data={data}
        onGoAgenda={onGoAgenda}
        onGoHermeting={onGoHermeting}
        onOpenDomain={(domain: PillarId) => {
          router.push(buildDashboardVandaagHref(domain));
        }}
        onOpenStatistieken={() => openHub("statistieken", { blik: "advies" })}
        onOpenFavorieten={() => openHub("favorieten")}
        onOpenInzichten={() => openHub("inzichten")}
        onOpenLichaamssamenstelling={() => navigate("lichaamssamenstelling")}
        onOpenBegeleiding={openBegeleiding}
      />
    </section>
  );
}
