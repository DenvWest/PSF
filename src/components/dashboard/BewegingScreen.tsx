"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import KompasDomainGauge from "@/components/app/KompasDomainGauge";
import * as Icons from "@/components/app/icons";
import { Card } from "@/components/app/primitives";
import WaitlistButton from "@/components/dashboard/WaitlistButton";
import { PILLAR } from "@/data/dashboard";
import {
  buildMovementRecommendations,
  getMovementNutritionHint,
} from "@/lib/build-recommendations";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";
import type { DashboardModel } from "@/types/dashboard";

const KOMPAS_LIGHT = {
  text: "#1c1917",
  muted: "#57534e",
  subtle: "#78716c",
  innerBorder: "#ebe7e2",
  innerBg: "#faf9f7",
} as const;

const MOVEMENT_MODALITIES: {
  icon: string;
  label: string;
  href: string | null;
  modality: string;
}[] = [
  {
    icon: "💪",
    label: "Krachttraining",
    href: "/blog/krachttraining-na-40",
    modality: "krachttraining",
  },
  {
    icon: "🚶",
    label: "Stevig wandelen",
    href: null,
    modality: "wandelen",
  },
  {
    icon: "🛌",
    label: "Rust & herstel",
    href: "/herstel-verbeteren-na-40",
    modality: "herstel",
  },
  {
    icon: "❤️",
    label: "Zone 2 cardio",
    href: null,
    modality: "zone2",
  },
];

const KompasLightPanel = ({ children }: { children: React.ReactNode }) => (
  <div className="-mt-3 overflow-hidden rounded-[28px] border border-[#e4e0da] bg-gradient-to-b from-[#fefdfb] to-white p-5 shadow-[0_16px_48px_rgba(15,28,16,0.10)]">
    {children}
  </div>
);

const KompasSectionHeader = ({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title?: string;
  action?: React.ReactNode;
}) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: 16,
      marginBottom: 14,
    }}
  >
    <div>
      {eyebrow ? (
        <div
          style={{
            marginBottom: 8,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: KOMPAS_LIGHT.subtle,
          }}
        >
          {eyebrow}
        </div>
      ) : null}
      {title ? (
        <div
          style={{
            fontFamily: "var(--f-serif)",
            fontSize: 21,
            color: KOMPAS_LIGHT.text,
            letterSpacing: "0.01em",
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
      ) : null}
    </div>
    {action}
  </div>
);

const SoonPill = ({ label = "Binnenkort" }: { label?: string }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.04em",
      color: "var(--terra, #C8956C)",
      border: "1px solid rgba(200,149,108,0.4)",
      borderRadius: 999,
      padding: "4px 11px",
      whiteSpace: "nowrap",
    }}
  >
    <Icons.Spark s={12} /> {label}
  </span>
);

const FooterLink = ({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <Link
    href={href}
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "16px 18px",
      borderRadius: 16,
      border: `1px solid ${KOMPAS_LIGHT.innerBorder}`,
      background: "#fff",
      textDecoration: "none",
      color: "inherit",
    }}
  >
    {icon}
    <span style={{ flex: 1, fontFamily: "var(--f-serif)", fontSize: 16, color: KOMPAS_LIGHT.text }}>
      {label}
    </span>
    <Icons.ChevronRight s={18} style={{ color: KOMPAS_LIGHT.subtle, flexShrink: 0 }} />
  </Link>
);

function sessionFromModel(model: DashboardModel): IntakeSessionPayload {
  return {
    sessionId: "",
    symptoms: [],
    answers: model.answers ?? {},
    scores: model.domainScores,
    urgency: "",
    profile: "",
    timestamp: 0,
    ageRange: null,
    firstName: null,
  };
}

export default function BewegingScreen({
  model,
}: {
  model: DashboardModel;
}) {
  const premiumShownRef = useRef(false);
  const coachShownRef = useRef(false);
  const pillar = PILLAR.beweging;
  const session = sessionFromModel(model);
  const nutritionHint = getMovementNutritionHint(session);
  const recommendations = buildMovementRecommendations(session);
  const showActiveStep =
    model.activeHabit?.domain === "movement" && model.activeHabit.title;

  useEffect(() => {
    if (premiumShownRef.current) {
      return;
    }
    premiumShownRef.current = true;
    trackEvent("dashboard_beweging_premium_upsell", { surface: "kompas_beweging" });
    clarityTag("dashboard_beweging_premium", "shown");
  }, []);

  useEffect(() => {
    if (coachShownRef.current) {
      return;
    }
    coachShownRef.current = true;
    trackEvent("dashboard_beweging_coach_waitlist_shown", { surface: "kompas_beweging" });
  }, []);

  return (
    <KompasLightPanel>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card pad={20} surface="light" glow={pillar.color} style={{ borderColor: `${pillar.color}55` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <KompasDomainGauge value={model.scores.beweging ?? 0} label="Beweging" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: pillar.color,
                  marginBottom: 6,
                }}
              >
                Kracht &amp; conditie
              </div>
              <div
                style={{
                  fontFamily: "var(--f-serif)",
                  fontSize: 25,
                  color: KOMPAS_LIGHT.text,
                  lineHeight: 1.1,
                }}
              >
                Beweging
              </div>
              <p
                style={{
                  fontSize: 13.5,
                  color: KOMPAS_LIGHT.muted,
                  lineHeight: 1.5,
                  margin: "6px 0 0",
                  textWrap: "pretty",
                }}
              >
                Stapsgewijs kracht en conditie opbouwen.
              </p>
            </div>
          </div>
        </Card>

        <Link
          href="/intake/beweging?from=dashboard&kompas=beweging"
          onClick={() => {
            trackEvent("dashboard_beweging_checkin_click", { surface: "kompas_beweging" });
            clarityTag("dashboard_beweging_checkin", "click");
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            padding: "14px 16px",
            borderRadius: 16,
            border: `1px solid ${KOMPAS_LIGHT.innerBorder}`,
            background: "#fff",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Icons.Activity s={18} style={{ color: "var(--sage)", flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: KOMPAS_LIGHT.text }}>
              Doe de beweegcheck (1 min)
            </span>
            <Icons.ChevronRight s={18} style={{ color: KOMPAS_LIGHT.subtle, flexShrink: 0 }} />
          </div>
          {showActiveStep ? (
            <p
              style={{
                fontSize: 13,
                color: KOMPAS_LIGHT.muted,
                lineHeight: 1.45,
                margin: "0 0 0 30px",
                textWrap: "pretty",
              }}
            >
              Actieve stap: {model.activeHabit?.title}
            </p>
          ) : null}
        </Link>

        <section aria-label="Voeding en supplementen">
          <KompasSectionHeader eyebrow="Leefstijl eerst" title="Voeding & supplementen" />
          <Card pad={18} surface="light">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: KOMPAS_LIGHT.subtle,
                    marginBottom: 8,
                  }}
                >
                  Voeding optimaliseren
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: KOMPAS_LIGHT.muted,
                    lineHeight: 1.55,
                    margin: "0 0 12px",
                    textWrap: "pretty",
                  }}
                >
                  {nutritionHint}
                </p>
                <Link
                  href="/intake/voeding?from=dashboard&kompas=beweging"
                  onClick={() => {
                    trackEvent("dashboard_beweging_voeding_click", { surface: "kompas_beweging" });
                    clarityTag("dashboard_beweging_voeding", "click");
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: "var(--sage)",
                    textDecoration: "none",
                  }}
                >
                  Doe de voedingscheck <Icons.ChevronRight s={15} />
                </Link>
              </div>

              <div
                style={{
                  borderTop: `1px solid ${KOMPAS_LIGHT.innerBorder}`,
                  paddingTop: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: KOMPAS_LIGHT.subtle,
                    marginBottom: 10,
                  }}
                >
                  Supplementen — als je basis staat
                </div>
                {recommendations.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {recommendations.map((rec, index) => {
                      const href = rec.comparisonHref ?? rec.guideHref;
                      return (
                        <Link
                          key={rec.slug}
                          href={href}
                          onClick={() => {
                            trackEvent("dashboard_beweging_supplement_click", {
                              slug: rec.slug,
                              target: href,
                              surface: "kompas_beweging",
                            });
                            clarityTag("dashboard_beweging_supplement", rec.slug);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 0",
                            textDecoration: "none",
                            color: "inherit",
                            borderTop: index ? `1px solid ${KOMPAS_LIGHT.innerBorder}` : "none",
                          }}
                        >
                          <span
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 12,
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 20,
                              background: KOMPAS_LIGHT.innerBg,
                              border: `1px solid ${KOMPAS_LIGHT.innerBorder}`,
                            }}
                            aria-hidden
                          >
                            {rec.icon}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontFamily: "var(--f-serif)",
                                fontSize: 16,
                                color: KOMPAS_LIGHT.text,
                                lineHeight: 1.2,
                              }}
                            >
                              {rec.name}
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                color: KOMPAS_LIGHT.muted,
                                lineHeight: 1.5,
                                marginTop: 2,
                                textWrap: "pretty",
                              }}
                            >
                              {rec.wiifm}
                            </div>
                          </div>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 3,
                              fontSize: 12,
                              fontWeight: 600,
                              color: "var(--sage)",
                              flexShrink: 0,
                            }}
                          >
                            Vergelijk <Icons.ChevronRight s={15} />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p
                    style={{
                      fontSize: 13.5,
                      color: KOMPAS_LIGHT.muted,
                      lineHeight: 1.5,
                      margin: 0,
                      textWrap: "pretty",
                    }}
                  >
                    Geen supplement-signalen — focus eerst op voeding en je plan.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </section>

        <section aria-label="Bewegingsvormen">
          <KompasSectionHeader eyebrow="Opbouw" title="Bewegingsvormen" action={<SoonPill />} />
          <Card pad={18} surface="light">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {MOVEMENT_MODALITIES.map((item) => {
                const inner = (
                  <>
                    <span style={{ fontSize: 22 }} aria-hidden>
                      {item.icon}
                    </span>
                    <span style={{ fontSize: 14.5, color: KOMPAS_LIGHT.text }}>{item.label}</span>
                  </>
                );
                const boxStyle = {
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: `1px solid ${KOMPAS_LIGHT.innerBorder}`,
                  background: KOMPAS_LIGHT.innerBg,
                  textDecoration: "none" as const,
                  color: "inherit" as const,
                };
                if (item.href) {
                  return (
                    <Link
                      key={item.modality}
                      href={item.href}
                      onClick={() => {
                        trackEvent("dashboard_beweging_modality_click", {
                          modality: item.modality,
                          target: item.href ?? "",
                        });
                      }}
                      style={boxStyle}
                    >
                      {inner}
                    </Link>
                  );
                }
                return (
                  <div key={item.modality} style={boxStyle}>
                    {inner}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
              <Icons.Shield s={13} style={{ color: "var(--sage)" }} />
              <span style={{ fontSize: 12.5, color: KOMPAS_LIGHT.muted, lineHeight: 1.5 }}>
                Binnenkort: protocollen en oefeningen objectief vergeleken.
              </span>
            </div>
          </Card>
        </section>

        <Card pad={20} surface="light" glow={pillar.color} style={{ borderColor: `${pillar.color}33` }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: KOMPAS_LIGHT.subtle,
              }}
            >
              Begeleiding
            </div>
            <div
              style={{
                fontFamily: "var(--f-serif)",
                fontSize: 21,
                color: KOMPAS_LIGHT.text,
                lineHeight: 1.2,
              }}
            >
              Onafhankelijke bewegingscoach
            </div>
            <p
              style={{
                fontSize: 14,
                color: KOMPAS_LIGHT.muted,
                lineHeight: 1.6,
                margin: 0,
                textWrap: "pretty",
              }}
            >
              Werk met een onafhankelijke coach die je helpt je opbouw vol te houden. Geen
              merkverkoop, wel begeleiding op kracht, conditie en herstel.
            </p>
            <WaitlistButton
              feature="beweging-coach"
              surface="kompas_beweging"
              label="Zet me op de wachtlijst"
            />
          </div>
        </Card>

        <Card pad={20} surface="light" glow="#C8956C" style={{ borderColor: "rgba(200,149,108,0.35)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: KOMPAS_LIGHT.subtle,
              }}
            >
              <Icons.Lock s={14} /> Premium · app
            </div>
            <div
              style={{
                fontFamily: "var(--f-serif)",
                fontSize: 21,
                color: KOMPAS_LIGHT.text,
                lineHeight: 1.2,
              }}
            >
              Trainingslog in de app
            </div>
            <p
              style={{
                fontSize: 14,
                color: KOMPAS_LIGHT.muted,
                lineHeight: 1.6,
                margin: 0,
                textWrap: "pretty",
              }}
            >
              Houd volume, zwaarte en herstel bij — en koppel het aan je onafhankelijke coach. De
              app komt
              later; premium houdt alles in één plek.
            </p>
            <SoonPill />
          </div>
        </Card>

        <FooterLink
          href="/intake/plan/movement?from=dashboard&kompas=beweging"
          icon={<Icons.Target s={18} style={{ color: "var(--sage)", flexShrink: 0 }} />}
          label="Je bewegingsplan"
          onClick={() => {
            trackEvent("dashboard_beweging_plan_click", { surface: "kompas_beweging" });
          }}
        />
        <FooterLink
          href="/gids/beweging"
          icon={<Icons.Mail s={18} style={{ color: "var(--sage)", flexShrink: 0 }} />}
          label="Gratis Bewegingsgids"
          onClick={() => {
            trackEvent("dashboard_beweging_gids_click", { surface: "kompas_beweging" });
          }}
        />
        <FooterLink
          href="/inzichten"
          icon={<Icons.BookOpen s={18} style={{ color: "var(--sage)", flexShrink: 0 }} />}
          label="Leefstijl & inzichten"
          onClick={() => {
            trackEvent("dashboard_beweging_leefstijl_click", { surface: "kompas_beweging" });
          }}
        />
      </div>
    </KompasLightPanel>
  );
}
