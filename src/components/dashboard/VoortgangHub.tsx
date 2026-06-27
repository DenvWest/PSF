"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import {
  Button,
  Card,
  SlotGrid,
  Sparkline,
} from "@/components/app/primitives";
import { IDENTITY_FIELDS, PILLARS } from "@/data/dashboard";
import { buildRecommendations } from "@/lib/build-recommendations";
import RecommendedInsights from "@/components/dashboard/RecommendedInsights";
import VitalityGauge from "@/components/app/VitalityGauge";
import { clarityTag } from "@/lib/clarity";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
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
  tab: DashboardTabId;
  screen: VoortgangScreen;
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
      <Card pad={16} surface="light">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: premium ? "#fdf6ef" : "#e8f5ee",
              border: `1px solid ${premium ? "rgba(200,149,108,0.25)" : "rgba(90,143,106,0.2)"}`,
              color: premium ? "var(--terra, #C8956C)" : "var(--sage)",
              flexShrink: 0,
            }}
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
      </Card>
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

function BlurredSignalsPreview() {
  return (
    <div
      style={{
        filter: "blur(6px)",
        pointerEvents: "none",
        userSelect: "none",
      }}
      aria-hidden
    >
      <SlotGrid min={150} gap={10}>
        {PILLARS.slice(0, 4).map((pillar) => {
          const Icon = Icons[pillar.icon];
          return (
            <Card key={pillar.id} pad={15}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <span style={{ color: pillar.color, display: "flex" }}>
                  <Icon s={16} />
                </span>
                <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>
                  {pillar.label}
                </span>
              </div>
              <Sparkline data={MOCK_TREND} color={pillar.color} />
              <div style={{ marginTop: 10 }}>
                <span
                  style={{
                    fontFamily: "var(--f-serif)",
                    fontSize: 20,
                    color: "var(--text)",
                  }}
                >
                  —
                </span>
              </div>
            </Card>
          );
        })}
      </SlotGrid>
    </div>
  );
}

function FavorietenView({
  model,
  data,
  onBack,
}: {
  model: DashboardModel;
  data?: DashboardData;
  onBack: () => void;
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

  const recommendations = buildRecommendations(session);
  const topHref = withVoortgangReturn(
    recommendations[0]?.comparisonHref ??
      recommendations[0]?.guideHref ??
      "/supplementen",
  );
  const supplementenHref = withVoortgangReturn("/supplementen");

  return (
    <section aria-label="Favorieten" style={{ paddingTop: 16 }}>
      <VoortgangSubHeader title="Favorieten" onBack={onBack} />
      <div
        style={{
          fontFamily: "var(--f-serif)",
          fontSize: 22,
          color: "var(--text)",
          lineHeight: 1.25,
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Je supplement-aanbevelingen
      </div>
      <p
        style={{
          fontSize: 14,
          color: "var(--text-muted)",
          lineHeight: 1.55,
          margin: "0 0 20px",
          textAlign: "center",
          textWrap: "pretty",
        }}
      >
        Op basis van je scores — objectieve oriëntatie, geen verkoop.
      </p>

      {recommendations.length > 0 ? (
        <Card pad={8} style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {recommendations.map((rec, index) => {
              const href = withVoortgangReturn(rec.comparisonHref ?? rec.guideHref);
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
                    emitIntakeClientEvent("dashboard.aanrader_clicked", {
                      slug: rec.slug,
                      target: href,
                      surface: "voortgang",
                    });
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 10px",
                    textDecoration: "none",
                    color: "inherit",
                    borderTop: index ? "1px solid var(--divider)" : "none",
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }} aria-hidden>
                    {rec.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--f-serif)",
                        fontSize: 16,
                        color: "var(--text)",
                        lineHeight: 1.25,
                      }}
                    >
                      {rec.name}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                        lineHeight: 1.5,
                        marginTop: 2,
                        textWrap: "pretty",
                      }}
                    >
                      {rec.wiifm}
                    </div>
                  </div>
                  <Icons.ChevronRight
                    s={18}
                    style={{ color: "var(--text-subtle)", flexShrink: 0 }}
                  />
                </Link>
              );
            })}
          </div>
        </Card>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {recommendations.length > 0 ? (
          <Link href={topHref} style={{ textDecoration: "none" }}>
            <Button variant="primary" full>
              Bekijk top-aanrader
            </Button>
          </Link>
        ) : (
          <Link
            href={supplementenHref}
            style={{ textDecoration: "none" }}
            onClick={handleSupplementenHubClick}
          >
            <Button variant="primary" full>
              Ontdek supplementen
            </Button>
          </Link>
        )}
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
        <Card key={tip} pad={16}>
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
        </Card>
      ))}
    </div>
  );
}

function VitaalscoreInzichtenView({
  model,
  firstName,
  isMember,
  onBack,
}: {
  model: DashboardModel;
  firstName: string | null;
  isMember: boolean;
  onBack: () => void;
}) {
  const upsellShownRef = useRef(false);
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
    priorityId: model.priority.id,
    priorityScore: model.scores[model.priority.id],
    answers: model.answers,
    domainScores: model.domainScores,
  });
  const heading = cardCopy.heading;
  const body = cardCopy.body;
  const tipLines = [explainer[1], explainer[2]].filter(Boolean);

  useEffect(() => {
    if (isMember || upsellShownRef.current) {
      return;
    }
    upsellShownRef.current = true;
    trackEvent("dashboard_inzichten_upsell", {
      state: "locked",
      surface: "voortgang",
    });
    clarityTag("dashboard_voortgang", "inzichten_locked");
  }, [isMember]);

  return (
    <section aria-label="Jouw inzichten" style={{ paddingTop: 16 }}>
      <VoortgangSubHeader title="Jouw inzichten" onBack={onBack} />

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <VitalityGauge
            value={model.vitality}
            size={260}
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

        {!isMember ? (
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
                  margin: "0 0 18px",
                  textWrap: "pretty",
                }}
              >
                {VITALITY_INSIGHTS_UPSELL_BODY}
              </p>
              <Button
                variant="terra"
                full
                size="lg"
                icon={<Icons.Lock s={18} />}
                onClick={() => {
                  trackEvent("dashboard_inzichten_upsell_click", {
                    surface: "voortgang",
                  });
                  clarityTag("dashboard_voortgang", "inzichten_upsell_click");
                }}
              >
                {VITALITY_INSIGHTS_UPSELL_CTA}
              </Button>
            </div>
          </>
        ) : (
          <RecommendedInsights pillarId={model.priority.id} />
        )}
      </div>
    </section>
  );
}

function StatistiekenView({
  isMember,
  unlockedStatistics,
  onBack,
  onOpenLichaam,
}: {
  isMember: boolean;
  unlockedStatistics: ReactNode;
  onBack: () => void;
  onOpenLichaam: () => void;
}) {
  const upsellShownRef = useRef(false);

  useEffect(() => {
    if (isMember || upsellShownRef.current) {
      return;
    }
    upsellShownRef.current = true;
    trackEvent("dashboard_statistieken_upsell", {
      state: "locked",
      surface: "voortgang",
    });
    clarityTag("dashboard_statistieken", "locked");
  }, [isMember]);

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

      {!isMember ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <BlurredSignalsPreview />
          <div style={{ textAlign: "center", padding: "0 8px" }}>
            <div
              style={{
                fontFamily: "var(--f-serif)",
                fontSize: 21,
                color: "var(--text)",
                lineHeight: 1.3,
                marginBottom: 6,
              }}
            >
              Statistieken van je voortgang?
            </div>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-muted)",
                lineHeight: 1.55,
                margin: "0 0 18px",
                textWrap: "pretty",
              }}
            >
              Begrijp jezelf beter.
            </p>
            <Button
              variant="terra"
              full
              icon={<Icons.Lock s={16} />}
              onClick={() => {
                trackEvent("dashboard_statistieken_upsell_click", {
                  surface: "voortgang",
                });
                clarityTag("dashboard_statistieken", "upsell_click");
              }}
            >
              Statistieken bekijken
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {unlockedStatistics}
        </div>
      )}

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
    <Card pad={18} style={{ marginBottom: 12 }}>
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
    </Card>
  );
}

function LichaamssamenstellingView({
  isMember,
  onBack,
}: {
  isMember: boolean;
  onBack: () => void;
}) {
  const shownRef = useRef(false);

  useEffect(() => {
    if (shownRef.current) {
      return;
    }
    shownRef.current = true;
    trackEvent("dashboard_lichaamssamenstelling_getoond", { surface: "voortgang" });
    clarityTag("dashboard_lichaamssamenstelling", "premium_scaffold");
  }, []);

  const locked = !isMember;

  return (
    <section aria-label="Lichaamssamenstelling" style={{ paddingTop: 16 }}>
      <VoortgangSubHeader title="Lichaamssamenstelling" onBack={onBack} />

      <div style={{ paddingBottom: locked ? 88 : 0 }}>
        <Card pad={20} style={{ marginBottom: 16 }}>
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
        </Card>

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

      {locked ? (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: "calc(72px + env(safe-area-inset-bottom, 0px))",
            padding: "0 18px 12px",
            maxWidth: 600,
            margin: "0 auto",
            zIndex: 10,
          }}
        >
          <Button
            variant="terra"
            full
            size="lg"
            icon={<Icons.Lock s={18} />}
            onClick={() => {
              trackEvent("dashboard_lichaamssamenstelling_upsell_click", {
                surface: "voortgang",
              });
              clarityTag("dashboard_lichaamssamenstelling", "upsell_click");
            }}
          >
            Ontgrendel metingen
          </Button>
        </div>
      ) : null}
    </section>
  );
}

export default function VoortgangHub({
  model,
  data,
  isMember,
  tab,
  screen,
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

  const openHub = (destination: "favorieten" | "statistieken") => {
    trackEvent("dashboard_voortgang_hub_click", { destination });
    clarityTag("dashboard_voortgang", destination);
    setScreen(destination);
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
        onBack={goBack}
      />
    );
  }

  if (screen === "favorieten") {
    return <FavorietenView model={model} data={data} onBack={goBack} />;
  }

  if (screen === "statistieken") {
    return (
      <StatistiekenView
        isMember={isMember}
        unlockedStatistics={unlockedStatistics}
        onBack={goBack}
        onOpenLichaam={() => navigate("lichaamssamenstelling")}
      />
    );
  }

  if (screen === "lichaamssamenstelling") {
    return (
      <LichaamssamenstellingView isMember={isMember} onBack={goBack} />
    );
  }

  return (
    <section aria-label="Voortgang navigatie">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <HubCard
          icon={<Icons.Heart s={20} />}
          title="Favorieten"
          subtitle="Supplementen die bij je scores passen"
          onClick={() => openHub("favorieten")}
        />
        <HubCard
          icon={<Icons.BarChart s={20} />}
          title="Statistieken"
          subtitle="Trends, voeding en checkgeschiedenis"
          premium
          onClick={() => openHub("statistieken")}
        />
      </div>
    </section>
  );
}
