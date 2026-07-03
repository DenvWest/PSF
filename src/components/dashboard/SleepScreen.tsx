"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import KompasDomainGauge from "@/components/app/KompasDomainGauge";
import * as Icons from "@/components/app/icons";
import { Card } from "@/components/app/primitives";
import WaitlistButton from "@/components/dashboard/WaitlistButton";
import { PILLAR } from "@/data/dashboard";
import {
  buildSleepRecommendations,
  getSleepNutritionHint,
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

const SLEEP_TOOLS: {
  icon: string;
  label: string;
  href: string | null;
  slug: string;
}[] = [
  {
    icon: "🌅",
    label: "Ochtendlicht",
    href: "/blog/slaapritme-herstellen",
    slug: "ochtendlicht",
  },
  {
    icon: "☕",
    label: "Cafeine-cutoff",
    href: "/blog/alcohol-slaap-energie-na-40",
    slug: "cafeine_cutoff",
  },
  { icon: "🌙", label: "Avondafbouw", href: null, slug: "avondafbouw" },
  { icon: "⏰", label: "Vaste wektijd", href: null, slug: "vaste_wektijd" },
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

export default function SleepScreen({
  model,
}: {
  model: DashboardModel;
}) {
  const premiumShownRef = useRef(false);
  const coachShownRef = useRef(false);
  const pillar = PILLAR.slaap;
  const session = sessionFromModel(model);
  const nutritionHint = getSleepNutritionHint(session);
  const recommendations = buildSleepRecommendations(session);

  useEffect(() => {
    if (premiumShownRef.current) return;
    premiumShownRef.current = true;
    trackEvent("dashboard_slaap_premium_upsell", { surface: "kompas_slaap" });
    clarityTag("dashboard_slaap_premium", "shown");
  }, []);

  useEffect(() => {
    if (coachShownRef.current) return;
    coachShownRef.current = true;
    trackEvent("dashboard_slaap_coach_waitlist_shown", { surface: "kompas_slaap" });
  }, []);

  return (
    <KompasLightPanel>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card pad={20} surface="light" glow={pillar.color} style={{ borderColor: `${pillar.color}55` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <KompasDomainGauge value={model.scores.slaap ?? 0} label="Slaap" />
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
                Ritme &amp; herstel
              </div>
              <div
                style={{ fontFamily: "var(--f-serif)", fontSize: 25, color: KOMPAS_LIGHT.text, lineHeight: 1.1 }}
              >
                Slaap
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
                Stapsgewijs beter slapen met vaste routines.
              </p>
            </div>
          </div>
        </Card>

        <Link
          href="/intake/slaap?from=dashboard&kompas=slaap"
          onClick={() => {
            trackEvent("dashboard_slaap_checkin_click", { surface: "kompas_slaap" });
            clarityTag("dashboard_slaap_checkin", "click");
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
          <Icons.Moon s={18} style={{ color: "var(--sage)", flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: KOMPAS_LIGHT.text }}>
            Doe de slaap-check (1 min)
          </span>
          <Icons.ChevronRight s={18} style={{ color: KOMPAS_LIGHT.subtle, flexShrink: 0 }} />
        </Link>

        <section aria-label="Leefstijl eerst">
          <KompasSectionHeader eyebrow="Leefstijl eerst" title="Ritme-hefbomen" />
          <Card pad={18} surface="light">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ border: `1px solid ${KOMPAS_LIGHT.innerBorder}`, borderRadius: 14, padding: "12px 14px", background: KOMPAS_LIGHT.innerBg }}>
                <div style={{ fontFamily: "var(--f-serif)", fontSize: 16, color: KOMPAS_LIGHT.text }}>
                  Vaste wektijd
                </div>
                <div style={{ fontSize: 13, color: KOMPAS_LIGHT.muted, marginTop: 4 }}>
                  Kies 1 wektijd en houd die ook in het weekend aan.
                </div>
              </div>
              <div style={{ border: `1px solid ${KOMPAS_LIGHT.innerBorder}`, borderRadius: 14, padding: "12px 14px", background: KOMPAS_LIGHT.innerBg }}>
                <div style={{ fontFamily: "var(--f-serif)", fontSize: 16, color: KOMPAS_LIGHT.text }}>
                  Ochtendlicht
                </div>
                <div style={{ fontSize: 13, color: KOMPAS_LIGHT.muted, marginTop: 4 }}>
                  Binnen 60 minuten na opstaan 10 minuten buitenlicht.
                </div>
                <Link
                  href="/blog/slaapritme-herstellen"
                  onClick={() => {
                    trackEvent("dashboard_slaap_leefstijl_click", { tool: "ochtendlicht", surface: "kompas_slaap" });
                    clarityTag("dashboard_slaap_leefstijl", "ochtendlicht");
                  }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 3, marginTop: 8, textDecoration: "none", fontSize: 12.5, color: "var(--sage)", fontWeight: 600 }}
                >
                  Ritme verbeteren <Icons.ChevronRight s={14} />
                </Link>
              </div>
              <div style={{ border: `1px solid ${KOMPAS_LIGHT.innerBorder}`, borderRadius: 14, padding: "12px 14px", background: KOMPAS_LIGHT.innerBg }}>
                <div style={{ fontFamily: "var(--f-serif)", fontSize: 16, color: KOMPAS_LIGHT.text }}>
                  Avondafbouw
                </div>
                <div style={{ fontSize: 13, color: KOMPAS_LIGHT.muted, marginTop: 4 }}>
                  Laatste 45 minuten: schermlicht dimmen, rustiger tempo, vaste volgorde.
                </div>
              </div>
              <div style={{ border: `1px solid ${KOMPAS_LIGHT.innerBorder}`, borderRadius: 14, padding: "12px 14px", background: KOMPAS_LIGHT.innerBg }}>
                <div style={{ fontFamily: "var(--f-serif)", fontSize: 16, color: KOMPAS_LIGHT.text }}>
                  Cafeine-cutoff
                </div>
                <div style={{ fontSize: 13, color: KOMPAS_LIGHT.muted, marginTop: 4 }}>
                  Stop met cafeine na de lunch, zodat je slaapdruk niet wordt geremd.
                </div>
                <Link
                  href="/blog/alcohol-slaap-energie-na-40"
                  onClick={() => {
                    trackEvent("dashboard_slaap_leefstijl_click", { tool: "cafeine_cutoff", surface: "kompas_slaap" });
                    clarityTag("dashboard_slaap_leefstijl", "cafeine_cutoff");
                  }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 3, marginTop: 8, textDecoration: "none", fontSize: 12.5, color: "var(--sage)", fontWeight: 600 }}
                >
                  Avondprikkels beperken <Icons.ChevronRight s={14} />
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
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: KOMPAS_LIGHT.subtle, marginBottom: 8 }}>
                  Eerst je basis
                </div>
                <p style={{ fontSize: 14, color: KOMPAS_LIGHT.muted, lineHeight: 1.55, margin: "0 0 12px", textWrap: "pretty" }}>
                  {nutritionHint}
                </p>
                <Link
                  href="/intake/voeding?from=dashboard&kompas=slaap"
                  onClick={() => {
                    trackEvent("dashboard_slaap_voeding_click", { surface: "kompas_slaap" });
                    clarityTag("dashboard_slaap_voeding", "click");
                  }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13.5, fontWeight: 600, color: "var(--sage)", textDecoration: "none" }}
                >
                  Doe de voedingscheck <Icons.ChevronRight s={15} />
                </Link>
              </div>

              <div style={{ borderTop: `1px solid ${KOMPAS_LIGHT.innerBorder}`, paddingTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: KOMPAS_LIGHT.subtle, marginBottom: 10 }}>
                  Supplementen — pas na je basis
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
                            trackEvent("dashboard_slaap_supplement_click", {
                              slug: rec.slug,
                              target: href,
                              surface: "kompas_slaap",
                            });
                            clarityTag("dashboard_slaap_supplement", rec.slug);
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
                          <span style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: KOMPAS_LIGHT.innerBg, border: `1px solid ${KOMPAS_LIGHT.innerBorder}` }} aria-hidden>
                            {rec.icon}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: "var(--f-serif)", fontSize: 16, color: KOMPAS_LIGHT.text, lineHeight: 1.2 }}>
                              {rec.name}
                            </div>
                            <div style={{ fontSize: 13, color: KOMPAS_LIGHT.muted, lineHeight: 1.5, marginTop: 2, textWrap: "pretty" }}>
                              {rec.wiifm}
                            </div>
                          </div>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 600, color: "var(--sage)", flexShrink: 0 }}>
                            Vergelijk <Icons.ChevronRight s={15} />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ fontSize: 13.5, color: KOMPAS_LIGHT.muted, lineHeight: 1.5, margin: 0, textWrap: "pretty" }}>
                    Eerst ritme, licht en vaste tijden. Supplementen zijn een aanvulling, geen startpunt.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </section>

        <section aria-label="Slaaproutine tools">
          <KompasSectionHeader eyebrow="Slaaproutine tools" title="Voor drukke avonden" action={<SoonPill />} />
          <Card pad={18} surface="light">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {SLEEP_TOOLS.map((tool) => {
                const inner = (
                  <>
                    <span style={{ fontSize: 22 }} aria-hidden>{tool.icon}</span>
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
                        trackEvent("dashboard_slaap_tool_click", { tool: tool.slug, target: tool.href ?? "" });
                        clarityTag("dashboard_slaap_tool", tool.slug);
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
                Binnenkort: routines die je direct aan je dagritme kunt koppelen.
              </span>
            </div>
          </Card>
        </section>

        <Card pad={20} surface="light" glow={pillar.color} style={{ borderColor: `${pillar.color}33` }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: KOMPAS_LIGHT.subtle }}>
              Begeleiding
            </div>
            <div style={{ fontFamily: "var(--f-serif)", fontSize: 21, color: KOMPAS_LIGHT.text, lineHeight: 1.2 }}>
              Onafhankelijke slaapcoach
            </div>
            <p style={{ fontSize: 14, color: KOMPAS_LIGHT.muted, lineHeight: 1.6, margin: 0, textWrap: "pretty" }}>
              Werk met een onafhankelijke coach die je helpt ritme en avondafbouw vol te houden. Geen
              merkverkoop, wel begeleiding op slaapgedrag en routines.
            </p>
            <WaitlistButton feature="slaap-coach" surface="kompas_slaap" label="Zet me op de wachtlijst" />
          </div>
        </Card>

        <Card pad={20} surface="light" glow="#C8956C" style={{ borderColor: "rgba(200,149,108,0.35)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: KOMPAS_LIGHT.subtle }}>
              <Icons.Lock s={14} /> Premium · app
            </div>
            <div style={{ fontFamily: "var(--f-serif)", fontSize: 21, color: KOMPAS_LIGHT.text, lineHeight: 1.2 }}>
              Slaaplog in de app
            </div>
            <p style={{ fontSize: 14, color: KOMPAS_LIGHT.muted, lineHeight: 1.6, margin: 0, textWrap: "pretty" }}>
              Houd je bedtijd, opstaatijd en avondprikkels bij in een vast ritme-overzicht. Binnenkort in premium.
            </p>
            <SoonPill />
          </div>
        </Card>

        <FooterLink
          href="/intake/plan/sleep?from=dashboard&kompas=slaap"
          icon={<Icons.Target s={18} style={{ color: "var(--sage)", flexShrink: 0 }} />}
          label="Je slaapplan"
          onClick={() => {
            trackEvent("dashboard_slaap_plan_click", { surface: "kompas_slaap" });
            clarityTag("dashboard_slaap_footer", "plan");
          }}
        />
        <FooterLink
          href="/gids/slaap"
          icon={<Icons.Mail s={18} style={{ color: "var(--sage)", flexShrink: 0 }} />}
          label="Gratis Slaapgids"
          onClick={() => {
            trackEvent("dashboard_slaap_gids_click", { surface: "kompas_slaap" });
            clarityTag("dashboard_slaap_footer", "gids");
          }}
        />
        <FooterLink
          href="/inzichten"
          icon={<Icons.BookOpen s={18} style={{ color: "var(--sage)", flexShrink: 0 }} />}
          label="Leefstijl & inzichten"
          onClick={() => {
            trackEvent("dashboard_slaap_leefstijl_footer_click", { surface: "kompas_slaap" });
            clarityTag("dashboard_slaap_footer", "inzichten");
          }}
        />
      </div>
    </KompasLightPanel>
  );
}
