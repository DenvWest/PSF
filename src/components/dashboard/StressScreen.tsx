"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import KompasDomainGauge from "@/components/app/KompasDomainGauge";
import * as Icons from "@/components/app/icons";
import { Card } from "@/components/app/primitives";
import KompasBegeleidingLink from "@/components/dashboard/KompasBegeleidingLink";
import { PILLAR } from "@/data/dashboard";
import {
  buildStressRecommendations,
  getStressNutritionHint,
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

const RESET_TOOLS: {
  icon: string;
  label: string;
  href: string | null;
  slug: string;
}[] = [
  {
    icon: "🫁",
    label: "Ademhaling",
    href: "/blog/ademhaling-tegen-stress",
    slug: "ademhaling",
  },
  {
    icon: "🧭",
    label: "Overgangsritueel",
    href: "/blog/stress-werk-grenzen-stellen",
    slug: "overgangsritueel",
  },
  { icon: "👀", label: "Ogen ontspannen", href: null, slug: "ogen" },
  { icon: "🌿", label: "Schermvrije reset", href: null, slug: "schermvrij" },
];

const KompasLightPanel = ({ children }: { children: ReactNode }) => (
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
  action?: ReactNode;
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
  icon: ReactNode;
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
    <span
      style={{ flex: 1, fontFamily: "var(--f-serif)", fontSize: 16, color: KOMPAS_LIGHT.text }}
    >
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

export default function StressScreen({
  model,
  nutritionLogCompleted = false,
}: {
  model: DashboardModel;
  nutritionLogCompleted?: boolean;
}) {
  const premiumShownRef = useRef(false);
  const pillar = PILLAR.stress;
  const session = sessionFromModel(model);
  const nutritionHint = getStressNutritionHint(session);
  const recommendations = buildStressRecommendations(session, {
    nutritionLogCompleted,
  });

  useEffect(() => {
    if (premiumShownRef.current) return;
    premiumShownRef.current = true;
    trackEvent("dashboard_stress_premium_upsell", { surface: "kompas_stress" });
    clarityTag("dashboard_stress_premium", "shown");
  }, []);

  return (
    <KompasLightPanel>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card pad={20} surface="light" glow={pillar.color} style={{ borderColor: `${pillar.color}55` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <KompasDomainGauge value={model.scores.stress ?? 0} label="Stress" />
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
                Ritme &amp; reset
              </div>
              <div
                style={{ fontFamily: "var(--f-serif)", fontSize: 25, color: KOMPAS_LIGHT.text, lineHeight: 1.1 }}
              >
                Stress
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
                Stapsgewijs stress reguleren.
              </p>
            </div>
          </div>
        </Card>

        <Link
          href="/intake/stress?from=dashboard&kompas=stress"
          onClick={() => {
            trackEvent("dashboard_stress_checkin_click", { surface: "kompas_stress" });
            clarityTag("dashboard_stress_checkin", "click");
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 16px",
            borderRadius: 16,
            border: `1px solid ${KOMPAS_LIGHT.innerBorder}`,
            background: "#fff",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <Icons.Wind s={18} style={{ color: "var(--sage)", flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: KOMPAS_LIGHT.text }}>
            Doe de stress-check (1 min)
          </span>
          <Icons.ChevronRight s={18} style={{ color: KOMPAS_LIGHT.subtle, flexShrink: 0 }} />
        </Link>

        <section aria-label="Leefstijl eerst">
          <KompasSectionHeader eyebrow="Leefstijl eerst" title="Korte herstelmomenten" />
          <Card pad={18} surface="light">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  border: `1px solid ${KOMPAS_LIGHT.innerBorder}`,
                  borderRadius: 14,
                  padding: "12px 14px",
                  background: KOMPAS_LIGHT.innerBg,
                }}
              >
                <div style={{ fontFamily: "var(--f-serif)", fontSize: 16, color: KOMPAS_LIGHT.text }}>
                  Fysiologische zucht
                </div>
                <div style={{ fontSize: 13, color: KOMPAS_LIGHT.muted, marginTop: 4 }}>
                  2 korte neusinhalingen + 1 lange uitademing, 3 tot 5 rondes.
                </div>
                <Link
                  href="/blog/ademhaling-tegen-stress"
                  onClick={() => {
                    trackEvent("dashboard_stress_breathing_click", {
                      surface: "kompas_stress",
                    });
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    marginTop: 8,
                    textDecoration: "none",
                    fontSize: 12.5,
                    color: "var(--sage)",
                    fontWeight: 600,
                  }}
                >
                  Ademhaling uitleg <Icons.ChevronRight s={14} />
                </Link>
              </div>
              <div
                style={{
                  border: `1px solid ${KOMPAS_LIGHT.innerBorder}`,
                  borderRadius: 14,
                  padding: "12px 14px",
                  background: KOMPAS_LIGHT.innerBg,
                }}
              >
                <div style={{ fontFamily: "var(--f-serif)", fontSize: 16, color: KOMPAS_LIGHT.text }}>
                  Lang uitademen
                </div>
                <div style={{ fontSize: 13, color: KOMPAS_LIGHT.muted, marginTop: 4 }}>
                  4 seconden in, 8 seconden uit, 2 minuten.
                </div>
              </div>
              <div
                style={{
                  border: `1px solid ${KOMPAS_LIGHT.innerBorder}`,
                  borderRadius: 14,
                  padding: "12px 14px",
                  background: KOMPAS_LIGHT.innerBg,
                }}
              >
                <div style={{ fontFamily: "var(--f-serif)", fontSize: 16, color: KOMPAS_LIGHT.text }}>
                  Ogen ontspannen
                </div>
                <div style={{ fontSize: 13, color: KOMPAS_LIGHT.muted, marginTop: 4 }}>
                  Kijk 20 seconden ver weg om je focus en spanning te resetten.
                </div>
              </div>
              <div
                style={{
                  border: `1px solid ${KOMPAS_LIGHT.innerBorder}`,
                  borderRadius: 14,
                  padding: "12px 14px",
                  background: KOMPAS_LIGHT.innerBg,
                }}
              >
                <div style={{ fontFamily: "var(--f-serif)", fontSize: 16, color: KOMPAS_LIGHT.text }}>
                  Overgangsritueel
                </div>
                <div style={{ fontSize: 13, color: KOMPAS_LIGHT.muted, marginTop: 4 }}>
                  Telefoon weg, 1 minuut ademhaling, en bewust afronden: werk is klaar.
                </div>
                <Link
                  href="/blog/stress-werk-grenzen-stellen"
                  onClick={() => {
                    trackEvent("dashboard_stress_ritueel_click", {
                      surface: "kompas_stress",
                    });
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    marginTop: 8,
                    textDecoration: "none",
                    fontSize: 12.5,
                    color: "var(--sage)",
                    fontWeight: 600,
                  }}
                >
                  Grenzen na werk <Icons.ChevronRight s={14} />
                </Link>
              </div>
            </div>
          </Card>
        </section>

        <section aria-label="Voeding en supplementen">
          <KompasSectionHeader eyebrow="Ondersteunend" title="Voeding & supplementen" />
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
                  Eerst je basis
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
                  href="/intake/voeding?from=dashboard&kompas=stress"
                  onClick={() => {
                    trackEvent("dashboard_stress_voeding_click", { surface: "kompas_stress" });
                    clarityTag("dashboard_stress_voeding", "click");
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

              <div style={{ borderTop: `1px solid ${KOMPAS_LIGHT.innerBorder}`, paddingTop: 14 }}>
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
                  Supplementen — als je ritme staat
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
                            trackEvent("dashboard_stress_supplement_click", {
                              slug: rec.slug,
                              target: href,
                              surface: "kompas_stress",
                            });
                            clarityTag("dashboard_stress_supplement", rec.slug);
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
                    Eerst ritme en herstelmomenten. Supplementen voeg je pas toe als basisstappen staan.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </section>

        <section aria-label="Reset tools">
          <KompasSectionHeader eyebrow="Reset tools" title="Voor drukke dagen" action={<SoonPill />} />
          <Card pad={18} surface="light">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {RESET_TOOLS.map((tool) => {
                const inner = (
                  <>
                    <span style={{ fontSize: 22 }} aria-hidden>
                      {tool.icon}
                    </span>
                    <span style={{ fontSize: 14.5, color: KOMPAS_LIGHT.text }}>{tool.label}</span>
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
                if (tool.href) {
                  return (
                    <Link
                      key={tool.slug}
                      href={tool.href}
                      onClick={() => {
                        trackEvent("dashboard_stress_ritueel_click", {
                          tool: tool.slug,
                          target: tool.href ?? "",
                        });
                      }}
                      style={boxStyle}
                    >
                      {inner}
                    </Link>
                  );
                }
                return (
                  <div key={tool.slug} style={boxStyle}>
                    {inner}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
              <Icons.Shield s={13} style={{ color: "var(--sage)" }} />
              <span style={{ fontSize: 12.5, color: KOMPAS_LIGHT.muted, lineHeight: 1.5 }}>
                Binnenkort: stressroutines die je aan je dag kunt koppelen, zonder extra app-gedoe.
              </span>
            </div>
          </Card>
        </section>

        <div style={{ padding: "4px 2px 0" }}>
          <KompasBegeleidingLink surface="kompas_stress" />
        </div>

        <FooterLink
          href="/intake/plan/stress?from=dashboard&kompas=stress"
          icon={<Icons.Target s={18} style={{ color: "var(--sage)", flexShrink: 0 }} />}
          label="Je stressplan"
          onClick={() => {
            trackEvent("dashboard_stress_plan_click", { surface: "kompas_stress" });
          }}
        />
        <FooterLink
          href="/gids/stress"
          icon={<Icons.Mail s={18} style={{ color: "var(--sage)", flexShrink: 0 }} />}
          label="Gratis Stressgids"
          onClick={() => {
            trackEvent("dashboard_stress_gids_click", { surface: "kompas_stress" });
          }}
        />
        <FooterLink
          href="/inzichten"
          icon={<Icons.BookOpen s={18} style={{ color: "var(--sage)", flexShrink: 0 }} />}
          label="Leefstijl & inzichten"
          onClick={() => {
            trackEvent("dashboard_stress_leefstijl_click", { surface: "kompas_stress" });
          }}
        />
      </div>
    </KompasLightPanel>
  );
}
