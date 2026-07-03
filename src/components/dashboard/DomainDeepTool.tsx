"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import KompasDomainGauge from "@/components/app/KompasDomainGauge";
import * as Icons from "@/components/app/icons";
import { Card } from "@/components/app/primitives";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { Pillar, PillarId } from "@/types/dashboard";

export const DEEP_TOOL_LIGHT = {
  text: "#1c1917",
  muted: "#57534e",
  subtle: "#78716c",
  border: "#e4e0da",
  innerBorder: "#ebe7e2",
  innerBg: "#faf9f7",
} as const;

export const DeepToolSectionHeader = ({
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
            color: DEEP_TOOL_LIGHT.subtle,
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
            color: DEEP_TOOL_LIGHT.text,
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

export const DeepToolSoonPill = ({ label = "Binnenkort" }: { label?: string }) => (
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
      alignSelf: "flex-start",
    }}
  >
    <Icons.Spark s={12} /> {label}
  </span>
);

const eyebrowStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: DEEP_TOOL_LIGHT.subtle,
};

/**
 * Shell voor de domein-dieptool: Snapshot (laag 0) · Meten (laag 1) · Begeleiding (laag 2).
 * De shell rendert header + check-in-CTA; de lagen komen als children in volgorde binnen.
 */
export function DomainDeepTool({
  domain,
  pillar,
  score,
  eyebrow,
  tagline,
  checkinDate,
  hasDomainCheckin,
  checkin,
  children,
}: {
  domain: PillarId;
  pillar: Pillar;
  score: number;
  eyebrow: string;
  tagline: string;
  checkinDate: string | null;
  hasDomainCheckin: boolean;
  checkin: {
    href: string;
    label: string;
    description?: string;
    icon?: ReactNode;
    onClick?: () => void;
  } | null;
  children: ReactNode;
}) {
  const shownRef = useRef(false);

  useEffect(() => {
    if (shownRef.current) {
      return;
    }
    shownRef.current = true;
    trackEvent("domain_tool_snapshot_viewed", {
      domain,
      layer: "free",
      has_checkin: hasDomainCheckin,
    });
    clarityTag(
      "domain_tool_snapshot",
      `${domain}_${hasDomainCheckin ? "checkin" : "empty"}`,
    );
  }, [domain, hasDomainCheckin]);

  return (
    <div className="-mt-3 overflow-hidden rounded-[28px] border border-[#e4e0da] bg-gradient-to-b from-[#fefdfb] to-white p-5 shadow-[0_16px_48px_rgba(15,28,16,0.10)]">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card
          pad={20}
          surface="light"
          glow={pillar.color}
          style={{ borderColor: `${pillar.color}55` }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <KompasDomainGauge value={score} label={pillar.label} />
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
                {eyebrow}
              </div>
              <div
                style={{
                  fontFamily: "var(--f-serif)",
                  fontSize: 25,
                  color: DEEP_TOOL_LIGHT.text,
                  lineHeight: 1.1,
                }}
              >
                {pillar.label}
              </div>
              <p
                style={{
                  fontSize: 13.5,
                  color: DEEP_TOOL_LIGHT.muted,
                  lineHeight: 1.5,
                  margin: "6px 0 0",
                  textWrap: "pretty",
                }}
              >
                {tagline}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: DEEP_TOOL_LIGHT.subtle,
                  lineHeight: 1.5,
                  margin: "6px 0 0",
                }}
              >
                {checkinDate
                  ? `Op basis van je laatste check-in · ${checkinDate}`
                  : "Nog geen check-in voor dit domein"}
              </p>
            </div>
          </div>
        </Card>

        {checkin ? (
          <Link
            href={checkin.href}
            onClick={checkin.onClick}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              padding: "14px 16px",
              borderRadius: 16,
              border: `1px solid ${DEEP_TOOL_LIGHT.innerBorder}`,
              background: "#fff",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {checkin.icon ?? (
                <Icons.Activity s={18} style={{ color: "var(--sage)", flexShrink: 0 }} />
              )}
              <span
                style={{
                  flex: 1,
                  fontSize: 14.5,
                  fontWeight: 600,
                  color: DEEP_TOOL_LIGHT.text,
                }}
              >
                {checkin.label}
              </span>
              <Icons.ChevronRight
                s={18}
                style={{ color: DEEP_TOOL_LIGHT.subtle, flexShrink: 0 }}
              />
            </div>
            {checkin.description ? (
              <p
                style={{
                  fontSize: 13,
                  color: DEEP_TOOL_LIGHT.muted,
                  lineHeight: 1.45,
                  margin: "0 0 0 30px",
                  textWrap: "pretty",
                }}
              >
                {checkin.description}
              </p>
            ) : null}
          </Link>
        ) : null}

        {children}
      </div>
    </div>
  );
}

/**
 * Laag 1 — Meten (T1). Soft-paywall: zichtbaar maar op slot; de preview-klik is
 * het intent-meetpunt. Copy blijft binnen inname-inschatting — geen statusclaims.
 */
export function DeepToolMeetModule({
  domain,
  title,
  description,
  bullets,
  note,
}: {
  domain: PillarId;
  title: string;
  description: string;
  bullets: string[];
  note?: string;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const clickedRef = useRef(false);

  const togglePreview = () => {
    setPreviewOpen((current) => !current);
    if (clickedRef.current) {
      return;
    }
    clickedRef.current = true;
    trackEvent("domain_tool_tier_preview_click", { domain, target_tier: 1 });
    clarityTag("domain_tool_tier_preview", `${domain}_t1`);
  };

  return (
    <Card
      pad={20}
      surface="light"
      glow="#C8956C"
      style={{ borderColor: "rgba(200,149,108,0.35)" }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={eyebrowStyle}>
          <Icons.Lock s={14} /> Premium · meten
        </div>
        <div
          style={{
            fontFamily: "var(--f-serif)",
            fontSize: 21,
            color: DEEP_TOOL_LIGHT.text,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        <p
          style={{
            fontSize: 14,
            color: DEEP_TOOL_LIGHT.muted,
            lineHeight: 1.6,
            margin: 0,
            textWrap: "pretty",
          }}
        >
          {description}
        </p>
        {previewOpen ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {bullets.map((bullet) => (
              <div
                key={bullet}
                style={{ display: "flex", alignItems: "flex-start", gap: 8 }}
              >
                <Icons.Check
                  s={14}
                  style={{ color: "var(--sage)", flexShrink: 0, marginTop: 3 }}
                />
                <span
                  style={{
                    fontSize: 13.5,
                    color: DEEP_TOOL_LIGHT.muted,
                    lineHeight: 1.5,
                    textWrap: "pretty",
                  }}
                >
                  {bullet}
                </span>
              </div>
            ))}
            {note ? (
              <p
                style={{
                  fontSize: 12.5,
                  color: DEEP_TOOL_LIGHT.subtle,
                  lineHeight: 1.5,
                  margin: "4px 0 0",
                  textWrap: "pretty",
                }}
              >
                {note}
              </p>
            ) : null}
          </div>
        ) : null}
        <button
          type="button"
          onClick={togglePreview}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            alignSelf: "flex-start",
            padding: 0,
            border: "none",
            background: "none",
            cursor: "pointer",
            fontFamily: "var(--f-sans)",
            fontSize: 13.5,
            fontWeight: 600,
            color: "var(--sage)",
          }}
        >
          {previewOpen ? "Verberg voorbeeld" : "Bekijk wat je straks meet"}
          <Icons.ChevronRight
            s={15}
            style={{
              transform: previewOpen ? "rotate(-90deg)" : "rotate(90deg)",
              transition: "transform .2s",
            }}
          />
        </button>
        <DeepToolSoonPill label="Binnenkort in premium" />
      </div>
    </Card>
  );
}

/** Laag 2 — Begeleiding (T2). Leefstijlbegeleiding, geen diagnose; children = WaitlistButton of SoonPill. */
export function DeepToolCoachModule({
  title,
  description,
  accentColor,
  children,
}: {
  title: string;
  description: string;
  accentColor: string;
  children: ReactNode;
}) {
  return (
    <Card
      pad={20}
      surface="light"
      glow={accentColor}
      style={{ borderColor: `${accentColor}33` }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={eyebrowStyle}>Premium · begeleiding</div>
        <div
          style={{
            fontFamily: "var(--f-serif)",
            fontSize: 21,
            color: DEEP_TOOL_LIGHT.text,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        <p
          style={{
            fontSize: 14,
            color: DEEP_TOOL_LIGHT.muted,
            lineHeight: 1.6,
            margin: 0,
            textWrap: "pretty",
          }}
        >
          {description}
        </p>
        {children}
      </div>
    </Card>
  );
}
