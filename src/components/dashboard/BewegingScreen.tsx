"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { Card } from "@/components/app/primitives";
import KompasBegeleidingLink from "@/components/dashboard/KompasBegeleidingLink";
import MovementCockpit from "@/components/dashboard/beweging/MovementCockpit";
import MovementLogPanel from "@/components/dashboard/MovementLogPanel";
import { PILLAR } from "@/data/dashboard";
import { isMovementLogEnabled } from "@/lib/feature-flags";
import {
  buildMovementRecommendations,
  getMovementNutritionHint,
} from "@/lib/build-recommendations";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";
import type { DashboardModel } from "@/types/dashboard";

const KOMPAS_LIGHT = {
  text: "#1c1917",
  muted: "#57534e",
  subtle: "#78716c",
  innerBorder: "#ebe7e2",
  innerBg: "#faf9f7",
} as const;

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
  slot,
  nutritionLogCompleted = false,
  onGoAgenda,
  onMakePriority,
  makePriorityBusy,
  onRemeasure,
  remeasure,
}: {
  model: DashboardModel;
  slot: WeekDaySlot | null;
  nutritionLogCompleted?: boolean;
  onGoAgenda: () => void;
  onMakePriority: () => void;
  makePriorityBusy: boolean;
  onRemeasure: () => void;
  remeasure: { dueDate: string; daysUntil: number } | null;
}) {
  const premiumShownRef = useRef(false);
  const session = sessionFromModel(model);
  const nutritionHint = getMovementNutritionHint(session);
  const recommendations = buildMovementRecommendations(session, {
    nutritionLogCompleted,
  });
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

  const logEnabled = isMovementLogEnabled();

  const voedingSupplementSection = (
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
                {nutritionLogCompleted
                  ? "Geen supplement-signalen — focus eerst op voeding en je plan."
                  : "Doe eerst de voedingscheck voordat we supplementen tonen — eerst tafel, dan potje."}
              </p>
            )}
          </div>
        </div>
      </Card>
    </section>
  );

  return (
    <div className="flex flex-col gap-4">
      <MovementCockpit
        model={model}
        slot={slot}
        onGoAgenda={onGoAgenda}
        onMakePriority={onMakePriority}
        makePriorityBusy={makePriorityBusy}
        onRemeasure={onRemeasure}
        remeasure={remeasure}
      />

      {/* Light-zone: op desktop gecentreerd + gecapt zodat het niet
          uitrekt naast de brede cockpit; op mobiel volle breedte. */}
      <div className="w-full lg:mx-auto lg:max-w-3xl">
        <KompasLightPanel>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {logEnabled ? <MovementLogPanel /> : null}

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
                border: `1px solid ${PILLAR.beweging.color}44`,
                background: `${PILLAR.beweging.color}0a`,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Icons.Activity s={18} style={{ color: "var(--sage)", flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: KOMPAS_LIGHT.text }}>
                  Doe de uitgebreide beweegcheck (3 min)
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

            {logEnabled ? (
              <details style={{ borderTop: "1px solid #ebe7e2", paddingTop: 12 }}>
                <summary
                  style={{
                    cursor: "pointer",
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: "#57534e",
                    listStyle: "none",
                  }}
                >
                  Voeding &amp; supplementen
                </summary>
                <div style={{ marginTop: 12 }}>{voedingSupplementSection}</div>
              </details>
            ) : (
              voedingSupplementSection
            )}

            <KompasBegeleidingLink surface="kompas_beweging" />

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
      </div>
    </div>
  );
}
