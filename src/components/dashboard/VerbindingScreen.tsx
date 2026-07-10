"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import KompasDomainGauge from "@/components/app/KompasDomainGauge";
import * as Icons from "@/components/app/icons";
import { Card } from "@/components/app/primitives";
import KompasBegeleidingLink from "@/components/dashboard/KompasBegeleidingLink";
import { PILLAR } from "@/data/dashboard";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { DashboardModel } from "@/types/dashboard";

const KOMPAS_LIGHT = {
  text: "#1c1917",
  muted: "#57534e",
  subtle: "#78716c",
  innerBorder: "#ebe7e2",
  innerBg: "#faf9f7",
} as const;

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

export default function VerbindingScreen({
  model,
}: {
  model: DashboardModel;
}) {
  const premiumShownRef = useRef(false);
  const pillar = PILLAR.verbinding;

  useEffect(() => {
    if (premiumShownRef.current) return;
    premiumShownRef.current = true;
    trackEvent("dashboard_verbinding_premium_upsell", { surface: "kompas_verbinding" });
    clarityTag("dashboard_verbinding_premium", "shown");
  }, []);

  return (
    <KompasLightPanel>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card pad={20} surface="light" glow={pillar.color} style={{ borderColor: `${pillar.color}55` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <KompasDomainGauge value={model.scores.verbinding ?? 0} label="Verbinding" />
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
                Relatie &amp; ritme
              </div>
              <div
                style={{ fontFamily: "var(--f-serif)", fontSize: 25, color: KOMPAS_LIGHT.text, lineHeight: 1.1 }}
              >
                Verbinding
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
                Kleine contactmomenten, groot effect op herstel.
              </p>
            </div>
          </div>
        </Card>

        <Link
          href="/intake?from=dashboard&kompas=verbinding"
          onClick={() => {
            trackEvent("dashboard_verbinding_checkin_click", { surface: "kompas_verbinding" });
            clarityTag("dashboard_verbinding_checkin", "click");
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
          <Icons.User s={18} style={{ color: "var(--sage)", flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: KOMPAS_LIGHT.text }}>
            Start leefstijlcheck (1 min)
          </span>
          <Icons.ChevronRight s={18} style={{ color: KOMPAS_LIGHT.subtle, flexShrink: 0 }} />
        </Link>
        <p style={{ fontSize: 12.5, color: KOMPAS_LIGHT.muted, margin: "-8px 2px 0", lineHeight: 1.45 }}>
          Aparte verbinding-check volgt binnenkort; je start nu via de leefstijlcheck.
        </p>

        <section aria-label="Leefstijl eerst">
          <KompasSectionHeader eyebrow="Leefstijl eerst" title="Mini-acties die blijven hangen" />
          <Card pad={18} surface="light">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ border: `1px solid ${KOMPAS_LIGHT.innerBorder}`, borderRadius: 14, padding: "12px 14px", background: KOMPAS_LIGHT.innerBg }}>
                <div style={{ fontFamily: "var(--f-serif)", fontSize: 16, color: KOMPAS_LIGHT.text }}>
                  60-seconden check-in
                </div>
                <div style={{ fontSize: 13, color: KOMPAS_LIGHT.muted, marginTop: 4 }}>
                  Stuur vandaag een korte vraag: “Hoe gaat het echt met je?”.
                </div>
              </div>
              <div style={{ border: `1px solid ${KOMPAS_LIGHT.innerBorder}`, borderRadius: 14, padding: "12px 14px", background: KOMPAS_LIGHT.innerBg }}>
                <div style={{ fontFamily: "var(--f-serif)", fontSize: 16, color: KOMPAS_LIGHT.text }}>
                  Korte belafspraak
                </div>
                <div style={{ fontSize: 13, color: KOMPAS_LIGHT.muted, marginTop: 4 }}>
                  Plan 10 minuten bellen in plaats van eindeloos appen.
                </div>
              </div>
              <div style={{ border: `1px solid ${KOMPAS_LIGHT.innerBorder}`, borderRadius: 14, padding: "12px 14px", background: KOMPAS_LIGHT.innerBg }}>
                <div style={{ fontFamily: "var(--f-serif)", fontSize: 16, color: KOMPAS_LIGHT.text }}>
                  Offline samen-moment
                </div>
                <div style={{ fontSize: 13, color: KOMPAS_LIGHT.muted, marginTop: 4 }}>
                  Koppel een wandeling of koffie aan een vast wekelijks moment.
                </div>
              </div>
              <Link
                href="/inzichten"
                onClick={() => {
                  trackEvent("dashboard_verbinding_leefstijl_click", { surface: "kompas_verbinding" });
                  clarityTag("dashboard_verbinding_leefstijl", "click");
                }}
                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13.5, fontWeight: 600, color: "var(--sage)", textDecoration: "none", marginTop: 2 }}
              >
                Bekijk leefstijl &amp; inzichten <Icons.ChevronRight s={15} />
              </Link>
            </div>
          </Card>
        </section>

        <section aria-label="Verder verdiepen">
          <KompasSectionHeader eyebrow="Daarna verdiepen" title="Kies je volgende stap" action={<SoonPill />} />
          <Card pad={18} surface="light">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  trackEvent("dashboard_verbinding_verdieping_click", {
                    surface: "kompas_verbinding",
                    target: "patroon",
                    state: "coming_soon",
                  });
                  clarityTag("dashboard_verbinding_verdieping", "patroon_soon");
                }}
                style={{ border: `1px solid ${KOMPAS_LIGHT.innerBorder}`, borderRadius: 14, padding: "12px 14px", background: KOMPAS_LIGHT.innerBg, textAlign: "left", cursor: "pointer" }}
              >
                <div style={{ fontFamily: "var(--f-serif)", fontSize: 16, color: KOMPAS_LIGHT.text, lineHeight: 1.2 }}>
                  Verdiep je in je patroon
                </div>
                <div style={{ fontSize: 13, color: KOMPAS_LIGHT.muted, lineHeight: 1.5, marginTop: 4 }}>
                  Binnenkort zie je welke contactmomenten je energie geven en welke leegtrekken.
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  trackEvent("dashboard_verbinding_verdieping_click", {
                    surface: "kompas_verbinding",
                    target: "sociaal_ritme",
                    state: "coming_soon",
                  });
                  clarityTag("dashboard_verbinding_verdieping", "ritme_soon");
                }}
                style={{ border: `1px solid ${KOMPAS_LIGHT.innerBorder}`, borderRadius: 14, padding: "12px 14px", background: KOMPAS_LIGHT.innerBg, textAlign: "left", cursor: "pointer" }}
              >
                <div style={{ fontFamily: "var(--f-serif)", fontSize: 16, color: KOMPAS_LIGHT.text, lineHeight: 1.2 }}>
                  Zie je sociale ritme
                </div>
                <div style={{ fontSize: 13, color: KOMPAS_LIGHT.muted, lineHeight: 1.5, marginTop: 4 }}>
                  Binnenkort: weekoverzicht met pieken/dips en 1 concrete suggestie voor je volgende stap.
                </div>
              </button>
            </div>
          </Card>
        </section>

        <KompasBegeleidingLink surface="kompas_verbinding" />

        <Card pad={18} surface="light">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icons.Target s={18} style={{ color: "var(--sage)", flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "var(--f-serif)", fontSize: 16, color: KOMPAS_LIGHT.text }}>Jouw eerstvolgende stap</div>
                <div style={{ fontSize: 13, color: KOMPAS_LIGHT.muted, marginTop: 2 }}>Binnenkort persoonlijk zichtbaar in je verbinding-kompas.</div>
              </div>
            </div>
            <SoonPill />
          </div>
        </Card>
      </div>
    </KompasLightPanel>
  );
}
