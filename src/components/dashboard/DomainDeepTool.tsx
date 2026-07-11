"use client";

import type { ComponentType, CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import KompasDomainGauge from "@/components/app/KompasDomainGauge";
import * as Icons from "@/components/app/icons";
import type { IconProps } from "@/components/app/icons";
import { PREMIUM_BEGELEIDING_HREF } from "@/components/dashboard/KompasBegeleidingLink";
import { Card } from "@/components/app/primitives";
import { clarityTag } from "@/lib/clarity";
import { emitAccountClientEvent } from "@/lib/account-events-client";
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

type DeepToolCheckinIconKey = keyof typeof Icons;

type DeepToolCheckinAction = {
  href: string;
  label: string;
  description?: string;
  iconKey?: DeepToolCheckinIconKey;
  onClick?: () => void;
};

type DeepToolSecondaryCheckinAction = {
  href: string;
  label: string;
  description?: string;
  iconKey?: DeepToolCheckinIconKey;
  onClick?: () => void;
};

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) {
    return `rgba(90, 143, 106, ${alpha})`;
  }
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function DeepToolCheckinIcon({
  iconKey,
  accent,
  variant,
}: {
  iconKey: DeepToolCheckinIconKey;
  accent: string;
  variant: "primary" | "secondary";
}) {
  const Icon = Icons[iconKey] as ComponentType<IconProps>;

  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] sm:h-11 sm:w-11"
      style={{
        backgroundColor: hexToRgba(accent, variant === "primary" ? 0.1 : 0.08),
        border: `1px solid ${hexToRgba(accent, 0.2)}`,
      }}
    >
      <Icon
        s={18}
        sw={1.75}
        style={{
          color: accent,
          display: "block",
          shapeRendering: "geometricPrecision",
        }}
      />
    </div>
  );
}

type DeepToolCheckinCardProps = {
  href: string;
  label: string;
  subtitle?: string;
  reserveSubtitleSpace: boolean;
  iconKey: DeepToolCheckinIconKey;
  accent: string;
  variant: "primary" | "secondary";
  paired: boolean;
  onClick?: () => void;
};

function DeepToolCheckinCard({
  href,
  label,
  subtitle,
  reserveSubtitleSpace,
  iconKey,
  accent,
  variant,
  paired,
  onClick,
}: DeepToolCheckinCardProps) {
  const isPrimary = variant === "primary";
  const baseShadow = isPrimary
    ? `0 8px 24px ${hexToRgba(accent, 0.1)}`
    : `0 4px 16px ${hexToRgba(accent, 0.06)}`;
  const hoverShadow = isPrimary
    ? `0 12px 28px ${hexToRgba(accent, 0.14)}`
    : `0 8px 22px ${hexToRgba(accent, 0.1)}`;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex h-full min-w-0 flex-col justify-center rounded-2xl border no-underline transition-all duration-200 hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
        paired
          ? "min-h-[88px] gap-2 px-3 py-3 sm:min-h-[76px] sm:gap-1 sm:px-4 sm:py-3.5"
          : "min-h-[76px] gap-1 px-4 py-3.5"
      }`}
      style={{
        borderColor: isPrimary ? hexToRgba(accent, 0.2) : "#ebe7e2",
        background: isPrimary
          ? `linear-gradient(to bottom right, #ffffff, ${hexToRgba(accent, 0.06)})`
          : "#ffffff",
        boxShadow: baseShadow,
        outlineColor: accent,
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.boxShadow = hoverShadow;
        event.currentTarget.style.borderColor = hexToRgba(accent, isPrimary ? 0.28 : 0.3);
        if (!isPrimary) {
          event.currentTarget.style.backgroundColor = hexToRgba(accent, 0.04);
        }
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.boxShadow = baseShadow;
        event.currentTarget.style.borderColor = isPrimary ? hexToRgba(accent, 0.2) : "#ebe7e2";
        if (!isPrimary) {
          event.currentTarget.style.backgroundColor = "#ffffff";
        }
      }}
    >
      {paired ? (
        <>
          <div className="flex flex-col gap-2 sm:hidden">
            <DeepToolCheckinIcon iconKey={iconKey} accent={accent} variant={variant} />
            <span className="text-[13px] font-semibold leading-snug text-[#1c1917] [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">
              {label}
            </span>
            {subtitle ? (
              <p className="m-0 text-[11.5px] leading-snug text-stone-500 [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden [text-wrap:pretty]">
                {subtitle}
              </p>
            ) : reserveSubtitleSpace ? (
              <div className="min-h-[2rem]" aria-hidden />
            ) : null}
          </div>

          <div className="hidden sm:flex sm:flex-col sm:justify-center sm:gap-1">
            <div className="flex items-center gap-3">
              <DeepToolCheckinIcon iconKey={iconKey} accent={accent} variant={variant} />
              <span className="min-w-0 flex-1 text-[14px] font-semibold leading-snug text-[#1c1917] [display:-webkit-box] [-webkit-line-clamp:1] [-webkit-box-orient:vertical] overflow-hidden">
                {label}
              </span>
              <span className="shrink-0 text-[#78716c] transition-transform duration-200 group-hover:translate-x-0.5">
                <Icons.ChevronRight s={18} />
              </span>
            </div>
            {subtitle ? (
              <p className="m-0 pl-14 text-[12.5px] leading-snug text-stone-500 [text-wrap:pretty]">
                {subtitle}
              </p>
            ) : reserveSubtitleSpace ? (
              <div className="min-h-[1.25rem]" aria-hidden />
            ) : null}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <DeepToolCheckinIcon iconKey={iconKey} accent={accent} variant={variant} />
            <span className="min-w-0 flex-1 text-[14px] font-semibold leading-snug text-[#1c1917]">
              {label}
            </span>
            <span className="shrink-0 text-[#78716c] transition-transform duration-200 group-hover:translate-x-0.5">
              <Icons.ChevronRight s={18} />
            </span>
          </div>
          {subtitle ? (
            <p className="m-0 pl-14 text-[12.5px] leading-snug text-stone-500 [text-wrap:pretty]">
              {subtitle}
            </p>
          ) : reserveSubtitleSpace ? (
            <div className="min-h-[1.25rem]" aria-hidden />
          ) : null}
        </>
      )}
    </Link>
  );
}

function DeepToolCheckinActions({
  pillar,
  checkin,
  secondaryCheckin,
}: {
  pillar: Pillar;
  checkin: DeepToolCheckinAction;
  secondaryCheckin?: DeepToolSecondaryCheckinAction | null;
}) {
  const accent = pillar.color;
  const paired = Boolean(secondaryCheckin);

  return (
    <div className={paired ? "grid grid-cols-2 gap-2.5 sm:gap-3" : undefined}>
      <DeepToolCheckinCard
        href={checkin.href}
        label={checkin.label}
        subtitle={checkin.description}
        reserveSubtitleSpace={paired && !checkin.description}
        iconKey={checkin.iconKey ?? "Activity"}
        accent={accent}
        variant="primary"
        paired={paired}
        onClick={checkin.onClick}
      />

      {secondaryCheckin ? (
        <DeepToolCheckinCard
          href={secondaryCheckin.href}
          label={secondaryCheckin.label}
          subtitle={secondaryCheckin.description}
          reserveSubtitleSpace={paired && !secondaryCheckin.description}
          iconKey={secondaryCheckin.iconKey ?? "BarChart"}
          accent={accent}
          variant="secondary"
          paired={paired}
          onClick={secondaryCheckin.onClick}
        />
      ) : null}
    </div>
  );
}

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
  secondaryCheckin,
  children,
}: {
  domain: PillarId;
  pillar: Pillar;
  score: number;
  eyebrow: string;
  tagline: string;
  checkinDate: string | null;
  hasDomainCheckin: boolean;
  checkin: DeepToolCheckinAction | null;
  secondaryCheckin?: DeepToolSecondaryCheckinAction | null;
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
    emitAccountClientEvent("domain_tool.snapshot_viewed", {
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
          <DeepToolCheckinActions
            pillar={pillar}
            checkin={checkin}
            secondaryCheckin={secondaryCheckin}
          />
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
  teaser,
}: {
  domain: PillarId;
  title: string;
  description: string;
  bullets: string[];
  note?: string;
  teaser?: string;
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
    emitAccountClientEvent("domain_tool.tier_preview_clicked", {
      domain,
      target_tier: 1,
    });
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
            {teaser ? (
              <div
                style={{
                  fontFamily: "var(--f-serif)",
                  fontSize: 17,
                  color: DEEP_TOOL_LIGHT.text,
                }}
              >
                {teaser}
              </div>
            ) : null}
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
            <Link
              href={PREMIUM_BEGELEIDING_HREF}
              onClick={() => {
                trackEvent("dashboard_kompas_begeleiding_link_click", {
                  surface: `meetmodule_${domain}`,
                });
                clarityTag("dashboard_kompas_begeleiding", `meetmodule_${domain}`);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                alignSelf: "flex-start",
                fontSize: 13.5,
                fontWeight: 600,
                color: "var(--sage)",
                textDecoration: "none",
              }}
            >
              Zet me op de wachtlijst →
            </Link>
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
