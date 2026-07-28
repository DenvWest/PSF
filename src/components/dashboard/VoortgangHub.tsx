"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { Button, Card, Sparkline } from "@/components/app/primitives";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { IDENTITY_FIELDS } from "@/data/dashboard";
import { PREMIUM_STATISTIEKEN_SOFT_UPSELL } from "@/data/dashboard/premium-value-props";
import { buildRecommendations } from "@/lib/build-recommendations";
import { buildRecommendationsEligibility } from "@/lib/supplement-eligibility";
import MetingenCard from "@/components/dashboard/MetingenCard";
import RecommendedInsights from "@/components/dashboard/RecommendedInsights";
import PremiumWaitlistCard from "@/components/dashboard/PremiumWaitlistCard";
import SupplementVerdictPanel from "@/components/dashboard/SupplementVerdictPanel";
import VoortgangReisStrip from "@/components/dashboard/voortgang/VoortgangReisStrip";
import StatistiekenAdviesSection from "@/components/dashboard/voortgang/StatistiekenAdviesSection";
import FavorietenAanraderSection from "@/components/dashboard/voortgang/FavorietenAanraderSection";
import FavorietenKeuzeSection from "@/components/dashboard/voortgang/FavorietenKeuzeSection";
import PremiumValuePropsList from "@/components/dashboard/PremiumValuePropsList";
import LeefstijllijnSection from "@/components/dashboard/LeefstijllijnSection";
import VitalityGauge from "@/components/app/VitalityGauge";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { getVitalityExplainer } from "@/lib/vitality-explainer";
import {
  getVitalityScoreCardCopy,
  VITALITY_INSIGHTS_UPSELL_BODY,
  VITALITY_INSIGHTS_UPSELL_CTA,
  VITALITY_INSIGHTS_UPSELL_HEADING,
} from "@/lib/vitality-score-copy";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";
import { withVoortgangReturn } from "@/lib/voortgang-return-link";
import { resolveTrendsAccess } from "@/lib/entitlement-access";
import type { DashboardData, DashboardModel, DashboardTabId } from "@/types/dashboard";

export type VoortgangScreen =
  | "hub"
  | "inzichten"
  | "favorieten"
  | "statistieken"
  | "lichaamssamenstelling";

type VoortgangHubProps = {
  model: DashboardModel | null;
  data?: DashboardData;
  isMember: boolean;
  hasTrendsFeature?: boolean;
  tab: DashboardTabId;
  screen: VoortgangScreen;
  freeStatistics: ReactNode;
  unlockedStatistics: ReactNode;
  onScreenChange: (screen: VoortgangScreen) => void;
};

function handleSupplementenHubClick() {
  trackEvent("dashboard_voortgang_supplementen_click", { surface: "voortgang" });
  clarityTag("dashboard_voortgang", "supplementen");
}

const MOCK_TREND = [42, 48, 45, 52, 49, 55];

const premiumBadgeStyle = {
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
  premium,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  premium?: boolean;
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
          <div
            className={
              premium
                ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[var(--terra,#C8956C)]"
                : "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[var(--sage)]"
            }
          >
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
              {premium ? (
                <span style={premiumBadgeStyle}>
                  <Icons.Lock s={10} /> Premium
                </span>
              ) : null}
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

function StatistiekenSoftUpsell({ onOpenWaitlist }: { onOpenWaitlist: () => void }) {
  return (
    <Card
      pad={20}
      glow="var(--terra, #C8956C)"
      style={{
        border: "1px solid rgba(200,149,108,0.28)",
        background: "rgba(200,149,108,0.05)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--f-serif)",
          fontSize: 19,
          color: "var(--text)",
          lineHeight: 1.3,
          marginBottom: 8,
        }}
      >
        {PREMIUM_STATISTIEKEN_SOFT_UPSELL.heading}
      </div>
      <p
        style={{
          fontSize: 14,
          color: "var(--text-muted)",
          lineHeight: 1.55,
          margin: "0 0 16px",
          textWrap: "pretty",
        }}
      >
        {PREMIUM_STATISTIEKEN_SOFT_UPSELL.body}
      </p>
      <PremiumValuePropsList variant="softUpsell" />
      <button
        type="button"
        onClick={onOpenWaitlist}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginTop: 18,
          padding: 0,
          border: "none",
          background: "none",
          fontSize: 14,
          fontWeight: 600,
          color: "var(--terra, #C8956C)",
          cursor: "pointer",
          textDecoration: "underline",
          textUnderlineOffset: 3,
        }}
      >
        {PREMIUM_STATISTIEKEN_SOFT_UPSELL.cta}
        <Icons.ArrowRight s={16} />
      </button>
    </Card>
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

function BlurredInsightTips({ tips }: { tips: string[] }) {
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
  isMember,
  hasTrendsFeature,
  onBack,
  onOpenWaitlist,
}: {
  model: DashboardModel;
  firstName: string | null;
  isMember: boolean;
  hasTrendsFeature: boolean;
  onBack: () => void;
  onOpenWaitlist: () => void;
}) {
  const upsellShownRef = useRef(false);
  const trendsUnlocked = resolveTrendsAccess(hasTrendsFeature, isMember);
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

  useEffect(() => {
    if (trendsUnlocked || upsellShownRef.current) {
      return;
    }
    upsellShownRef.current = true;
    trackEvent("dashboard_inzichten_upsell", {
      state: "locked",
      surface: "voortgang",
    });
    clarityTag("dashboard_voortgang", "inzichten_locked");
  }, [trendsUnlocked]);

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

        {!trendsUnlocked ? (
          <>
            <div
              style={{
                filter: "blur(5px)",
                pointerEvents: "none",
                userSelect: "none",
              }}
              aria-hidden
            >
              <BlurredInsightTips tips={tipLines} />
            </div>

            <div style={{ textAlign: "center", padding: "8px 8px 0" }}>
              <div
                style={{
                  fontFamily: "var(--f-serif)",
                  fontSize: 21,
                  color: "var(--text)",
                  lineHeight: 1.3,
                  marginBottom: 6,
                }}
              >
                {VITALITY_INSIGHTS_UPSELL_HEADING}
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-muted)",
                  lineHeight: 1.55,
                  margin: "0 0 16px",
                  textWrap: "pretty",
                }}
              >
                {VITALITY_INSIGHTS_UPSELL_BODY}
              </p>
              <Button variant="terra" full onClick={onOpenWaitlist}>
                {VITALITY_INSIGHTS_UPSELL_CTA}
              </Button>
            </div>
          </>
        ) : (
          <RecommendedInsights pillarId={model.priority.id} />
        )}

        <MetingenCard scores={model.scores} history={model.history} />
      </div>
    </section>
  );
}

function StatistiekenView({
  model,
  data,
  isMember,
  hasTrendsFeature,
  freeStatistics,
  unlockedStatistics,
  onBack,
  onOpenLichaam,
  onOpenWaitlist,
  onOpenFavorieten,
}: {
  model: DashboardModel;
  data?: DashboardData;
  isMember: boolean;
  hasTrendsFeature: boolean;
  freeStatistics: ReactNode;
  unlockedStatistics: ReactNode;
  onBack: () => void;
  onOpenLichaam: () => void;
  onOpenWaitlist: () => void;
  onOpenFavorieten: () => void;
}) {
  const upsellShownRef = useRef(false);
  const trendsUnlocked = resolveTrendsAccess(hasTrendsFeature, isMember);

  useEffect(() => {
    if (trendsUnlocked || upsellShownRef.current) {
      return;
    }
    upsellShownRef.current = true;
    trackEvent("dashboard_statistieken_upsell", {
      state: "locked",
      surface: "voortgang",
    });
    clarityTag("dashboard_statistieken", "locked");
    clarityTag("premium_value_props", "statistieken_locked");
  }, [trendsUnlocked]);

  const openLichaam = () => {
    trackEvent("dashboard_voortgang_hub_click", {
      destination: "lichaamssamenstelling",
      surface: "statistieken",
    });
    clarityTag("dashboard_voortgang", "lichaamssamenstelling");
    onOpenLichaam();
  };

  return (
    <section aria-label="Statistieken" style={{ paddingTop: 16 }}>
      <VoortgangSubHeader title="Statistieken" onBack={onBack} />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {data ? (
          <StatistiekenAdviesSection
            model={model}
            data={data}
            onOpenFavorieten={onOpenFavorieten}
          />
        ) : null}

        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-subtle)",
            textAlign: "center",
            padding: "4px 0",
          }}
        >
          Einde gratis advies
        </div>

        <LeefstijllijnSection model={model} surface="voortgang" />

        {!trendsUnlocked ? (
          <>
            {freeStatistics}
            <StatistiekenSoftUpsell onOpenWaitlist={onOpenWaitlist} />
          </>
        ) : (
          <>
            {unlockedStatistics}
            <div style={{ padding: "0 4px" }}>
              <PremiumValuePropsList variant="comingSoonOnly" />
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <HubCard
          icon={<Icons.User s={20} />}
          title="Lichaamssamenstelling"
          subtitle="Gewicht, lengte en persoonlijk doel"
          premium
          onClick={openLichaam}
        />
      </div>
    </section>
  );
}

function ChartCard({
  title,
  unit,
  blurred,
}: {
  title: string;
  unit: string;
  blurred: boolean;
}) {
  const chart = (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "var(--text-subtle)",
          marginBottom: 6,
        }}
      >
        <span>— {unit}</span>
        <span>— {unit}</span>
      </div>
      <Sparkline data={MOCK_TREND} color="var(--sage)" h={80} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "var(--text-subtle)",
          marginTop: 8,
        }}
      >
        <span>—</span>
        <span>—</span>
      </div>
    </>
  );

  return (
    <CockpitTile className="mb-3">
      <div
        style={{
          fontFamily: "var(--f-serif)",
          fontSize: 17,
          color: "var(--text)",
          textAlign: "center",
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      {blurred ? (
        <div
          style={{
            filter: "blur(5px)",
            pointerEvents: "none",
            userSelect: "none",
          }}
          aria-hidden
        >
          {chart}
        </div>
      ) : (
        chart
      )}
    </CockpitTile>
  );
}

function LichaamssamenstellingView({
  isMember,
  hasTrendsFeature,
  onBack,
}: {
  isMember: boolean;
  hasTrendsFeature: boolean;
  onBack: () => void;
}) {
  const shownRef = useRef(false);
  const trendsUnlocked = resolveTrendsAccess(hasTrendsFeature, isMember);

  useEffect(() => {
    if (shownRef.current) {
      return;
    }
    shownRef.current = true;
    trackEvent("dashboard_lichaamssamenstelling_getoond", { surface: "voortgang" });
    clarityTag("dashboard_lichaamssamenstelling", "premium_scaffold");
  }, []);

  const locked = !trendsUnlocked;

  return (
    <section aria-label="Lichaamssamenstelling" style={{ paddingTop: 16 }}>
      <VoortgangSubHeader title="Lichaamssamenstelling" onBack={onBack} />

      <div style={{ paddingBottom: locked ? 24 : 0 }}>
        <CockpitTile className="mb-4">
          <div
            style={{
              fontFamily: "var(--f-serif)",
              fontSize: 18,
              color: "var(--text)",
              marginBottom: 14,
            }}
          >
            Overzicht
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {IDENTITY_FIELDS.map((field, index) => {
              const showLock = locked && index > 0;
              return (
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
                  <span
                    style={{
                      flex: 1,
                      fontSize: 14,
                      color: "var(--text)",
                    }}
                  >
                    {field.label}
                  </span>
                  {showLock ? (
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid var(--panel-border)",
                        color: "var(--text-subtle)",
                      }}
                    >
                      <Icons.Lock s={13} />
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 14,
                        color: "var(--text-subtle)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {field.value ?? "—"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 14,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: locked ? "var(--text-subtle)" : "var(--sage)",
            }}
          >
            Houd lichaamsgegevens bij
          </div>
        </CockpitTile>

        {locked ? (
          <>
            <ChartCard title="Gewicht" unit="kg" blurred />
            <ChartCard title="Lengte" unit="cm" blurred />
          </>
        ) : (
          <>
            <ChartCard title="Gewicht" unit="kg" blurred={false} />
            <ChartCard title="Lengte" unit="cm" blurred={false} />
            <div
              style={{
                marginTop: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--terra, #C8956C)",
                border: "1px solid rgba(200,149,108,0.4)",
                borderRadius: 999,
                padding: "5px 12px",
              }}
            >
              <Icons.Spark s={13} /> Binnenkort in te vullen
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default function VoortgangHub({
  model,
  data,
  isMember,
  hasTrendsFeature = false,
  tab,
  screen,
  freeStatistics,
  unlockedStatistics,
  onScreenChange,
}: VoortgangHubProps) {
  const setScreen = (next: VoortgangScreen) => {
    onScreenChange(next);
  };

  useEffect(() => {
    if (tab !== "voortgang") {
      onScreenChange("hub");
    }
  }, [tab, onScreenChange]);

  const navigate = (next: VoortgangScreen) => {
    setScreen(next);
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

  const openHub = (destination: "favorieten" | "statistieken" | "inzichten") => {
    trackEvent("dashboard_voortgang_hub_click", { destination });
    clarityTag("dashboard_voortgang", destination);
    setScreen(destination);
  };

  const openPremiumWaitlist = (surface: "statistieken" | "inzichten" = "statistieken") => {
    trackEvent("dashboard_statistieken_upsell", {
      state: "locked",
      surface: surface === "inzichten" ? "inzichten" : "voortgang",
      cta: "soft_upsell",
    });
    clarityTag("dashboard_statistieken", "soft_upsell_click");
    setScreen("hub");
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
        isMember={isMember}
        hasTrendsFeature={hasTrendsFeature}
        onBack={goBack}
        onOpenWaitlist={() => openPremiumWaitlist("inzichten")}
      />
    );
  }

  if (screen === "favorieten") {
    return (
      <FavorietenView
        model={model}
        data={data}
        onBack={goBack}
        onOpenStatistieken={() => navigate("statistieken")}
      />
    );
  }

  if (screen === "statistieken") {
    return (
      <StatistiekenView
        model={model}
        data={data}
        isMember={isMember}
        hasTrendsFeature={hasTrendsFeature}
        freeStatistics={freeStatistics}
        unlockedStatistics={unlockedStatistics}
        onBack={goBack}
        onOpenLichaam={() => navigate("lichaamssamenstelling")}
        onOpenWaitlist={() => openPremiumWaitlist("statistieken")}
        onOpenFavorieten={() => navigate("favorieten")}
      />
    );
  }

  if (screen === "lichaamssamenstelling") {
    return (
      <LichaamssamenstellingView
        isMember={isMember}
        hasTrendsFeature={hasTrendsFeature}
        onBack={goBack}
      />
    );
  }

  return (
    <section aria-label="Voortgang navigatie">
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-subtle)",
            marginBottom: 6,
          }}
        >
          Voortgang
        </div>
        <div
          style={{
            fontFamily: "var(--f-serif)",
            fontSize: 22,
            color: "var(--text)",
            lineHeight: 1.25,
          }}
        >
          Zo volg je je vooruitgang
        </div>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 14,
            color: "var(--text-muted)",
            lineHeight: 1.55,
            textWrap: "pretty",
          }}
        >
          Op basis van je gratis test, ingevulde tijdlijn en hermetingen.
        </p>
      </div>

      <VoortgangReisStrip model={model} data={data} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <HubCard
          icon={<Icons.BarChart s={20} />}
          title="Statistieken"
          subtitle="Wat je check laat zien — en wat dat betekent voor supplementen"
          onClick={() => openHub("statistieken")}
        />
        <HubCard
          icon={<Icons.Heart s={20} />}
          title="Favorieten"
          subtitle="Jouw keuze, met onze mening ernaast"
          onClick={() => openHub("favorieten")}
        />
        <HubCard
          icon={<Icons.Spark s={20} />}
          title="Jouw inzichten"
          subtitle="Je vitaalscore en wat eronder zit"
          onClick={() => openHub("inzichten")}
        />
        <PremiumWaitlistCard surface="voortgang" />
      </div>
    </section>
  );
}
