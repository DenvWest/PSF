"use client";

import type { ReactElement, ReactNode } from "react";
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PriorityLadder from "@/components/app/PriorityLadder";
import KompasDomainGauge from "@/components/app/KompasDomainGauge";
import * as Icons from "@/components/app/icons";
import {
  Button,
  Card,
  DeltaBadge,
  SectionHeader,
  SlotGrid,
  Sparkline,
} from "@/components/app/primitives";
import RecommendedInsights from "@/components/dashboard/RecommendedInsights";
import DomainTopNav, { type DomainNavApi } from "@/components/dashboard/DomainTopNav";
import VoortgangTopNav from "@/components/dashboard/voortgang/VoortgangTopNav";
import KeuzeScherm from "@/components/dashboard/keuze/KeuzeScherm";
import MovementRecoveryTrendsCard from "@/components/dashboard/MovementRecoveryTrendsCard";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { resolveTrendsAccess } from "@/lib/entitlement-access";

const VoortgangHubSkeleton = () => (
  <div
    className="animate-pulse"
    style={{ display: "flex", flexDirection: "column", gap: 16 }}
    aria-busy="true"
  >
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          height: i === 0 ? 132 : 96,
          borderRadius: 24,
          border: "1px solid var(--panel-border)",
          background: "var(--panel)",
        }}
      />
    ))}
  </div>
);

const VoortgangHub = dynamic(
  () => import("@/components/dashboard/VoortgangHub"),
  { ssr: false, loading: () => <VoortgangHubSkeleton /> },
);

const DomainScreenSkeleton = () => (
  <div
    className="animate-pulse"
    style={{ display: "flex", flexDirection: "column", gap: 16 }}
    aria-busy="true"
  >
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          height: i === 0 ? 132 : 96,
          borderRadius: 24,
          border: "1px solid var(--panel-border)",
          background: "var(--panel)",
        }}
      />
    ))}
  </div>
);

const PrebuildFrame = dynamic(
  () => import("@/components/dashboard/PrebuildFrame"),
  { ssr: false, loading: () => <DomainScreenSkeleton /> },
);

const AgendaScreen = dynamic(
  () => import("@/components/dashboard/agenda/AgendaScreen"),
  { ssr: false, loading: () => <DomainScreenSkeleton /> },
);

import SupplementDisclosure from "@/components/supplements/SupplementDisclosure";
import {
  DASHBOARD_TABS,
  IDENTITY_FIELDS,
  PILLAR,
  PILLAR_CHECKIN_ROUTES,
  PILLARS,
  SIGNALS,
  TAB_SECTIONS,
} from "@/data/dashboard";
import { perfectSupplementMeasurementConfig } from "@/data/measurement-config";
import { getReadoutPresentation } from "@/lib/dashboard-readout";
import CockpitFrame from "@/components/dashboard/cockpit/CockpitFrame";
import CockpitShell from "@/components/dashboard/cockpit/CockpitShell";
import KompasContextSpine from "@/components/dashboard/kompas/KompasContextSpine";
import KompasHomeCard from "@/components/dashboard/kompas/KompasHomeCard";
import MovementAnchorRechoose from "@/components/dashboard/beweging/MovementAnchorRechoose";
import DomainKompasScreen from "@/components/dashboard/domain/DomainKompasScreen";
import { buildInspectorCards } from "@/lib/cockpit-inspector";
import {
  EMPTY_MOVEMENT_PREFS,
  getMovementAnchorOption,
  type MovementPrefs,
} from "@/lib/movement-prefs";
import { buildModel, derivePriority } from "@/lib/dashboard-model";
import { buildPriorityInterventionHref } from "@/lib/dashboard-active-plan";
import { isReadoutDomain } from "@/lib/domain-role";
import { buildHabitScoreKernel } from "@/lib/vitality-habit-kernel";
import { getVitalityExplainer } from "@/lib/vitality-explainer";
import { clarityTag } from "@/lib/clarity";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { trackEvent, trackDashboardTabSelected, trackOnderbouwingLinkClick } from "@/lib/ga4";
import { type SleepFocusKey } from "@/lib/sleep-focus";
import { buildRecommendations } from "@/lib/build-recommendations";
import {
  buildDomainRailTools,
  buildKeuzeRailDomains,
  buildKompasRailDomains,
  buildVoortgangRailDomains,
  resolveVoortgangRailActiveItem,
  type ContextRailApi,
  type ContextRailMode,
  type ContextRailToolId,
  type VoortgangRailItemId,
} from "@/lib/context-rail";
import { VoortgangFavoritesProvider } from "@/lib/voortgang-favorites-context";
import {
  DomainLadderFocusProvider,
  useDomainLadderFocus,
} from "@/lib/domain-ladder-focus-context";
import { LadderMomentsProvider } from "@/lib/ladder-moments-context";
import { isDomainKompasDomain } from "@/lib/domain-kompas-copy";
import { useMediaQuery } from "@/lib/use-media-query";
import { useTodayActionDone } from "@/lib/use-today-action-done";
import { resolveKeuzeFallbackDomain, resolveSchapDomain } from "@/lib/schap-availability";
import { buildRecommendationsEligibility } from "@/lib/supplement-eligibility";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";
import { buildRecommendationInput } from "@/lib/recommendation-input";
import { buildSupplementDisclosure } from "@/lib/reveal-supplement";
import type { ActivePlanHabit } from "@/lib/dashboard-active-plan";
import { resolveMovementDayChoiceForToday } from "@/lib/account-priority-pref";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import {
  isPillarId,
  isSchapTabId,
  isValidAgendaDate,
  parseAgendaViewFromUrl,
  parseDagFromUrl,
  parseKompasFromUrl,
  parseLeefstijlprofielDomeinFromUrl,
  parseKeuzeDomeinFromUrl,
  parseVoortgangScreenFromUrl,
  parseVoedingLaagFromUrl,
  isVoedingLaagSlug,
  voedingLaagIdFromSlug,
  canonicalizeDashboardTabParam,
  canonicalizeVoortgangScreenParam,
  getLegacyVoortgangScreenAlias,
  syncDashboardAgendaViewParam,
  syncDashboardDagParam,
  syncDashboardKeuzeParams,
  syncDashboardKompasParam,
  syncDashboardTabParam,
  syncDashboardVoortgangScreenParam,
  type AgendaViewId,
  type SyncDashboardVoortgangOptions,
  type VoedingLaagSlug,
} from "@/lib/dashboard-url";
import type {
  AccountPriorityPrefData,
  DashboardData,
  DashboardModel,
  DashboardSectionType,
  DashboardTab,
  DashboardTabId,
  PillarId,
  SchapTabId,
  Signal,
  VoortgangScreen,
} from "@/types/dashboard";

type DashboardProps = {
  empty?: boolean;
  data?: DashboardData;
  isMember?: boolean;
  hasTrendsFeature?: boolean;
  initialTab?: DashboardTabId;
  initialVoortgangScreen?: VoortgangScreen;
  initialKompasView?: PillarId;
  initialAgendaView?: AgendaViewId;
  sleepFocus?: SleepFocusKey | null;
};

type SharedSectionProps = {
  empty?: boolean;
  model: DashboardModel | null;
  data?: DashboardData;
  isMember: boolean;
  hasTrendsFeature: boolean;
  tab: DashboardTabId;
  kompasResetSignal: number;
  onCheck: () => void;
  onDashboardCheckin: (route: string, pillarId: PillarId) => void;
  onRemeasure: () => void;
  onGoVandaag: () => void;
  onGoAgenda: (date?: string) => void;
  agendaDate: string;
  agendaView: AgendaViewId;
  onAgendaDateChange: (date: string) => void;
  onAgendaViewChange: (view: AgendaViewId) => void;
  onGoVoortgang: () => void;
  onGoHermeting: () => void;
  voortgangScreen: VoortgangScreen;
  onVoortgangScreenChange: (
    screen: VoortgangScreen,
    options?: SyncDashboardVoortgangOptions,
  ) => void;
  onOpenInzichten: () => void;
  leefstijlprofielDomein: PillarId | null;
  voedingLaag: VoedingLaagSlug | null;
  /** Het domein waarvan de Keuze-tab het aanbod toont. */
  keuzeDomein: PillarId | null;
  /** Actief onderdeel op de Keuze-tab. */
  keuzeDeel: SchapTabId | null;
  /** Naar de Keuze-tab, op het schap van dit domein. */
  onGoKeuze: (domain: PillarId, deel?: SchapTabId | null) => void;
  /** Navigeert naar Voortgang › <domein> — het leesscherm, geen doe-surface (S4). */
  onGoVoortgangDomein: (domain: PillarId) => void;
  initialKompasView?: PillarId;
  prefUpdatedAt: string | null;
  onPrefUpdated: (pref: AccountPriorityPrefData | null) => void;
  sleepFocus: SleepFocusKey | null;
  /** Meldt de live-geopende Kompas-domein aan de cockpit-shell (header/context volgen mee). */
  onDomainViewChange?: (domain: PillarId | null) => void;
  /** Registreert back/switch-handlers voor sticky domainNav in cockpit-header. */
  onDomainNavApi?: (api: DomainNavApi | null) => void;
  /** Levert domeinen/tools + handlers voor de contextuele linker rail. */
  onContextRailApi?: (api: ContextRailApi) => void;
};

const CollapsibleSection = ({
  eyebrow,
  title,
  children,
  defaultOpen = false,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 2px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          color: "var(--text)",
          fontFamily: "var(--f-sans)",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--text-subtle)",
              marginBottom: 4,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              fontFamily: "var(--f-serif)",
              fontSize: 19,
              lineHeight: 1.25,
            }}
          >
            {title}
          </div>
        </div>
        <span
          style={{
            color: "var(--text-muted)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s ease",
          }}
        >
          <Icons.ChevronDown s={18} />
        </span>
      </button>
      {open ? <div style={{ marginTop: 4 }}>{children}</div> : null}
    </section>
  );
};

const SECTION_DIVIDER = "1px solid rgba(255,255,255,0.06)";

function trackDashboardInterventionClick(
  source: "hefboom" | "ladder",
  model: DashboardModel,
  href: string,
): void {
  const pillar = model.priority.id;
  const destination = href.includes("/intake/plan/")
    ? "plan"
    : href.startsWith("/intake/")
      ? "checkin"
      : "hub";

  if (destination === "plan") {
    emitIntakeClientEvent("plan.action_clicked", {
      source: `dashboard_${source}`,
      pillar_id: pillar,
      href,
    });
  } else if (destination === "checkin") {
    emitIntakeClientEvent("dashboard.first_checkin_started", {
      source: `dashboard_${source}`,
      pillar_id: pillar,
      route: href.split("?")[0],
    });
  } else {
    emitIntakeClientEvent("intake.cta_to_pillar", {
      source: `dashboard_${source}`,
      theme_slug: pillar,
      hub_route: href,
    });
  }

  trackEvent("dashboard_intervention_click", {
    source,
    pillar,
    destination,
  });
  clarityTag("dashboard_intervention", source);
}

const ActiveHabitCard = ({
  habit,
  habitKernel,
  onCompleted,
}: {
  habit: ActivePlanHabit;
  habitKernel: ReturnType<typeof buildHabitScoreKernel>;
  onCompleted: () => void;
}) => {
  const [state, setState] = useState(habit.state);
  const [busy, setBusy] = useState(false);
  const done = state === "done";

  const markDone = async () => {
    if (done || busy) {
      return;
    }

    setBusy(true);
    try {
      const body =
        habit.source === "plan" && habit.domain && habit.phaseId
          ? {
              domain: habit.domain,
              phaseId: habit.phaseId,
              stepId: habit.stepId,
              toState: "done",
            }
          : {
              mode: "kernel",
              stepId: habit.stepId,
              toState: "done",
            };

      const response = await fetch("/api/account/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        return;
      }

      setState("done");
      onCompleted();

      emitIntakeClientEvent("plan.step_state_changed", {
        source: "dashboard_today",
        domain: habit.domain,
        phase_id: habit.phaseId,
        step_id: habit.stepId,
        from: habit.state ?? "todo",
        to: "done",
        driver_pillar: habitKernel.driverPillarId,
        driver_habit_id: habitKernel.driverHabitId,
        vitality_band: habitKernel.vitalityBand,
        confidence: habitKernel.confidence,
      });
      trackEvent("dashboard_habit_completed", {
        step_id: habit.stepId,
        source: habit.source,
        driver_pillar: habitKernel.driverPillarId,
      });
      clarityTag("dashboard_habit", habit.stepId);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ paddingTop: 24 }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--sage)",
          marginBottom: 12,
        }}
      >
        <Icons.Check s={14} /> Stap 1 · Je habit nu
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <button
          type="button"
          aria-label={done ? "Habit afgerond" : "Markeer habit als gedaan"}
          disabled={done || busy}
          onClick={() => void markDone()}
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            flexShrink: 0,
            marginTop: 2,
            border: done ? "none" : "1.5px solid var(--divider-strong)",
            background: done ? "var(--sage)" : "transparent",
            color: done ? "#0f1c10" : "var(--text-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: done || busy ? "default" : "pointer",
          }}
        >
          {done ? <Icons.Check s={14} /> : null}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              color: "var(--text)",
              fontWeight: 600,
              lineHeight: 1.45,
              textWrap: "pretty",
            }}
          >
            {habit.title}
          </div>
          {habit.detail ? (
            <p
              style={{
                fontSize: 13.5,
                color: "var(--text-muted)",
                lineHeight: 1.5,
                margin: "6px 0 0",
                textWrap: "pretty",
              }}
            >
              {habit.detail}
            </p>
          ) : null}
          {habit.planHref ? (
            <Link
              href={habit.planHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 10,
                fontSize: 13,
                color: "var(--sage)",
                textDecoration: "none",
              }}
            >
              Volledig plan bekijken
              <Icons.ArrowRight s={15} />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const NowSection = ({ empty, model }: SharedSectionProps) => {
  const currentModel = model as DashboardModel | null;
  const [habitCompleted, setHabitCompleted] = useState(
    currentModel?.activeHabit?.state === "done",
  );
  const habitKernel = useMemo(
    () =>
      currentModel
        ? buildHabitScoreKernel({
            vitality: currentModel.vitality,
            priorityId: currentModel.priority.id,
            priorityScore: currentModel.scores[currentModel.priority.id],
            answers: currentModel.answers,
            domainScores: currentModel.domainScores,
          })
        : null,
    [currentModel],
  );

  const derived = useMemo(() => {
    if (!currentModel) {
      return null;
    }
    const explainer = getVitalityExplainer({
      vitality: currentModel.vitality,
      vitalityDelta: currentModel.vitalityDelta,
      vitalityDeltaComparable: currentModel.vitalityDeltaNote == null,
      priorityId: currentModel.priority.id,
      priorityScore: currentModel.scores[currentModel.priority.id],
      answers: currentModel.answers,
      domainScores: currentModel.domainScores,
    });
    const recommendationInput = buildRecommendationInput({
      scores: currentModel.domainScores,
    });
    const lifestyleStep = currentModel.activeHabit
      ? {
          title: currentModel.activeHabit.title,
          detail: currentModel.activeHabit.detail ?? "",
        }
      : currentModel.priority.quickWin;
    const supplementDisclosure = buildSupplementDisclosure(
      currentModel.priority,
      recommendationInput,
      "dashboard",
      lifestyleStep,
    );
    const interventionHref = buildPriorityInterventionHref(currentModel);
    return { explainer, supplementDisclosure, interventionHref };
  }, [currentModel]);

  if (!empty && !model) {
    return null;
  }

  const explainer = derived?.explainer ?? null;
  const supplementDisclosure = derived?.supplementDisclosure ?? null;
  const interventionHref = derived?.interventionHref ?? null;

  if (empty) {
    return null;
  }

  return (
    <Card
      glow="#5A8F6A"
      pad={28}
      style={{ borderColor: "rgba(90,143,106,0.28)" }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            paddingBottom: currentModel?.activeHabit ? 24 : 0,
            borderBottom: currentModel?.activeHabit ? SECTION_DIVIDER : "none",
          }}
        >
          {interventionHref && currentModel ? (
            <Link
              href={interventionHref}
              onClick={() =>
                trackDashboardInterventionClick(
                  "hefboom",
                  currentModel,
                  interventionHref,
                )
              }
              aria-label={`Start bij ${currentModel.priority.label.toLowerCase()} — je grootste hefboom`}
              style={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
                cursor: "pointer",
                margin: "-4px -6px",
                padding: "4px 6px",
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: currentModel.priority.color,
                  marginBottom: 10,
                }}
              >
                <Icons.Target s={14} /> Je grootste hefboom
              </div>
              <div
                style={{
                  fontFamily: "var(--f-serif)",
                  fontSize: 22,
                  color: "var(--text)",
                  lineHeight: 1.2,
                  marginBottom: 10,
                }}
              >
                {currentModel.priority.label}.
              </div>
              {explainer?.slice(0, 2).map((paragraph, index) =>
                paragraph ? (
                  <p
                    key={index}
                    style={{
                      fontSize: 14,
                      color: "var(--text-muted)",
                      lineHeight: 1.6,
                      margin: index === 0 ? "0 0 10px" : "0",
                      textWrap: "pretty",
                    }}
                  >
                    {paragraph}
                  </p>
                ) : null,
              )}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 13,
                  fontWeight: 600,
                  color: currentModel.priority.color,
                  marginTop: 4,
                }}
              >
                Start hier
                <Icons.ArrowRight s={14} />
              </span>
            </Link>
          ) : (
            <>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: currentModel?.priority.color,
                  marginBottom: 10,
                }}
              >
                <Icons.Target s={14} /> Je grootste hefboom
              </div>
              <div
                style={{
                  fontFamily: "var(--f-serif)",
                  fontSize: 22,
                  color: "var(--text)",
                  lineHeight: 1.2,
                  marginBottom: 10,
                }}
              >
                {currentModel?.priority.label}.
              </div>
              {explainer?.slice(0, 2).map((paragraph, index) =>
                paragraph ? (
                  <p
                    key={index}
                    style={{
                      fontSize: 14,
                      color: "var(--text-muted)",
                      lineHeight: 1.6,
                      margin: index === 0 ? "0 0 10px" : "0",
                      textWrap: "pretty",
                    }}
                  >
                    {paragraph}
                  </p>
                ) : null,
              )}
            </>
          )}
        </div>

        {currentModel?.activeHabit && habitKernel ? (
          <ActiveHabitCard
            habit={currentModel.activeHabit}
            habitKernel={habitKernel}
            onCompleted={() => setHabitCompleted(true)}
          />
        ) : null}

        {supplementDisclosure && habitCompleted ? (
          <div
            style={{
              marginTop: 24,
              paddingTop: 24,
              borderTop: SECTION_DIVIDER,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-subtle)",
                marginBottom: 12,
              }}
            >
              <Icons.Pill s={14} /> Stap 2 · Aanvulling, pas hierna
            </div>
            <SupplementDisclosure data={supplementDisclosure} />
          </div>
        ) : null}
      </div>
    </Card>
  );
};

const PrioritySection = ({ model }: SharedSectionProps) => {
  const hasModel = Boolean(model);
  const ladder = model?.ladder ?? PILLARS;
  const scores = model?.scores ?? {
    slaap: 0,
    energie: 0,
    stress: 0,
    voeding: 0,
    beweging: 0,
    herstel: 0, verbinding: 0,
  };
  const prevLadder =
    model?.retest && model.prevScores ? derivePriority(model.prevScores) : null;
  const targetIdx = Object.fromEntries(
    ladder.map((p, i) => [p.id, i]),
  ) as Record<PillarId, number>;
  const startIdx = prevLadder
    ? (Object.fromEntries(prevLadder.map((p, i) => [p.id, i])) as Record<
        PillarId,
        number
      >)
    : targetIdx;
  const [pos, setPos] = useState(startIdx);

  useEffect(() => {
    // Alleen animeren bij een hertest; zonder hertest blijft pos de rustvolgorde (init = targetIdx).
    if (!hasModel || !prevLadder) {
      return;
    }
    const kick = window.setTimeout(() => setPos(startIdx), 0);
    const t = window.setTimeout(() => setPos(targetIdx), 550);
    const settle = window.setTimeout(() => setPos(targetIdx), 1650);
    return () => {
      window.clearTimeout(kick);
      window.clearTimeout(t);
      window.clearTimeout(settle);
    };
    // De datum is hier het signaal voor een nieuwe check; de afgeleide
    // index-objecten zijn elke render nieuw en zouden de animatie in een lus trekken.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model?.date]);

  if (!model) {
    return null;
  }

  const interventionHref = buildPriorityInterventionHref(model);

  return (
    <CollapsibleSection eyebrow="Roadmap" title="Waar je nu begint">
      <>
        <SectionHeader
          eyebrow="Prioriteit"
          title="Je pijlerladder"
          action={
            <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>
              zwakste bovenaan
            </span>
          }
        />
        <Card pad={8}>
          <PriorityLadder
            ladder={ladder}
            scores={scores}
            positions={pos}
            focusRowHref={interventionHref ?? undefined}
            focusRowAriaLabel={`Start bij ${model.priority.label.toLowerCase()} — je prioriteit nu`}
            onFocusRowClick={
              interventionHref
                ? () =>
                    trackDashboardInterventionClick(
                      "ladder",
                      model,
                      interventionHref,
                    )
                : undefined
            }
          />
        </Card>
      </>
    </CollapsibleSection>
  );
};

const PlanSection = ({ model }: SharedSectionProps) => {
  if (!model) {
    return null;
  }

  return (
    <CollapsibleSection eyebrow="Adviezen" title="Objectief, geen verkoop">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <RecommendedInsights pillarId={model.priority.id} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontSize: 11.5,
            color: "var(--text-muted)",
          }}
        >
          <Icons.Shield s={13} style={{ color: "var(--sage)" }} />
          <span>Objectief — wij verkopen zelf niets.</span>
        </div>
      </div>
    </CollapsibleSection>
  );
};

const SignalsSection = ({ model, onDashboardCheckin }: SharedSectionProps) => {
  const [showUpcoming, setShowUpcoming] = useState(false);
  if (!model) {
    return null;
  }
  const connectedSignals = SIGNALS.filter(
    (signal) => signal.status === "connected",
  );
  const upcomingSignals = SIGNALS.filter(
    (signal) => signal.status !== "connected",
  );

  const renderSignal = (signal: Signal) => {
    const connected = signal.status === "connected";
    const last = connected ? signal.data[signal.data.length - 1] : null;
    return (
      <Card
        key={signal.id}
        pad={15}
        style={
          connected
            ? undefined
            : { borderStyle: "dashed", background: "rgba(255,255,255,0.015)" }
        }
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                color: connected ? signal.color : "var(--text-subtle)",
                display: "flex",
              }}
            >
              <Icons.Activity s={16} />
            </span>
            <span
              style={{
                fontSize: 13,
                color: connected ? "var(--text)" : "var(--text-muted)",
                fontWeight: 500,
              }}
            >
              {signal.label}
            </span>
          </div>
          {connected ? (
            <span
              style={{
                fontSize: 10.5,
                color: signal.color,
                border: `1px solid ${signal.color}44`,
                background: `${signal.color}1a`,
                borderRadius: 999,
                padding: "2px 8px",
              }}
            >
              verbonden
            </span>
          ) : (
            <span
              style={{
                fontSize: 10.5,
                color: "var(--text-subtle)",
                border: "1px solid var(--divider)",
                borderRadius: 999,
                padding: "2px 8px",
              }}
            >
              Nog niet gekoppeld
            </span>
          )}
        </div>
        <Sparkline
          data={connected ? signal.data : null}
          color={signal.color}
          empty={!connected}
          h={34}
        />
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginTop: 8,
          }}
        >
          <span
            style={{
              fontFamily: "var(--f-serif)",
              fontSize: 18,
              color: connected ? "var(--text)" : "var(--text-subtle)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {connected ? `${last}` : "—"}
            <span
              style={{
                fontSize: 11,
                color: "var(--text-subtle)",
                marginLeft: 2,
              }}
            >
              {signal.unit}
            </span>
          </span>
        </div>
      </Card>
    );
  };

  return (
    <section>
      <SectionHeader
        eyebrow="Signalen & trend"
        title="Wat er beweegt"
        action={
          <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>
            laatste 6 checks
          </span>
        }
      />
      <SlotGrid min={150} gap={10}>
        {PILLARS.map((pillar) => {
          const Icon = Icons[pillar.icon];
          const route = PILLAR_CHECKIN_ROUTES[pillar.id];
          const pillarId = pillar.id;
          const readout = isReadoutDomain(pillarId);
          const presentation = readout
            ? getReadoutPresentation(pillarId)
            : null;
          return (
            <Card key={pillar.id} pad={15}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: pillar.color, display: "flex" }}>
                    <Icon s={16} />
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--text)",
                      fontWeight: 500,
                    }}
                  >
                    {pillar.label}
                  </span>
                  {readout && (
                    <span
                      style={{
                        fontSize: 10,
                        color: "var(--text-subtle)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      rapport
                    </span>
                  )}
                </div>
                <DeltaBadge delta={model.deltaOf(pillar.id)} />
              </div>
              <Sparkline data={model.trend[pillar.id]} color={pillar.color} />
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginTop: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--f-serif)",
                    fontSize: 20,
                    color: "var(--text)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {model.scores[pillar.id]}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-subtle)" }}>
                  / 100
                </span>
              </div>
              {readout && presentation ? (
                <>
                  <p
                    style={{
                      fontSize: 11.5,
                      color: "var(--text-subtle)",
                      marginTop: 8,
                      marginBottom: 0,
                    }}
                  >
                    Uitkomst · aangedreven door{" "}
                    {presentation.driverLabels.join(" · ")}
                  </p>
                  {presentation.primaryCta && (
                    <button
                      type="button"
                      onClick={() =>
                        onDashboardCheckin(
                          presentation.primaryCta!.route,
                          presentation.primaryCta!.pillarId,
                        )
                      }
                      style={{
                        marginTop: 10,
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        color: pillar.color,
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: "var(--f-sans)",
                      }}
                    >
                      Werk aan je {presentation.primaryCta.label.toLowerCase()}{" "}
                      →
                    </button>
                  )}
                </>
              ) : (
                route && (
                  <button
                    type="button"
                    onClick={() => onDashboardCheckin(route, pillar.id)}
                    style={{
                      marginTop: 10,
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      color: pillar.color,
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: "var(--f-sans)",
                    }}
                  >
                    Check-in →
                  </button>
                )
              )}
            </Card>
          );
        })}
      </SlotGrid>
      <div
        style={{
          fontSize: 11.5,
          color: "var(--text-subtle)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          margin: "18px 2px 10px",
        }}
      >
        Objectieve signalen
      </div>
      <SlotGrid min={150} gap={10}>
        {connectedSignals.map(renderSignal)}
        <button
          type="button"
          onClick={() => setShowUpcoming((v) => !v)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: 10,
            padding: 15,
            borderRadius: 24,
            cursor: "pointer",
            textAlign: "left",
            border: "1px dashed var(--panel-border)",
            background: "rgba(255,255,255,0.015)",
            color: "var(--text-muted)",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
              borderRadius: 9,
              border: "1px solid var(--divider)",
              color: "var(--text-subtle)",
              transform: showUpcoming ? "rotate(45deg)" : "none",
              transition: "transform .25s",
            }}
          >
            <Icons.Plus s={16} />
          </span>
          <span style={{ fontSize: 12.5, lineHeight: 1.35 }}>
            {showUpcoming
              ? "Verberg komende signalen"
              : `${upcomingSignals.length} komende signalen`}
          </span>
        </button>
      </SlotGrid>
      {showUpcoming && (
        <div style={{ marginTop: 10 }}>
          <SlotGrid min={150} gap={10}>
            {upcomingSignals.map(renderSignal)}
          </SlotGrid>
        </div>
      )}

    </section>
  );
};

const NutritionIntakeSection = ({ data }: SharedSectionProps) => {
  const router = useRouter();
  const intake = data?.nutritionIntake ?? null;

  return (
    <section>
      <SectionHeader
        eyebrow="Voeding-inname"
        title="Wat je binnenkrijgt"
        action={
          intake?.date ? (
            <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>
              {intake.date}
            </span>
          ) : null
        }
      />
      <Card pad={20}>
        {intake ? (
          <>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {intake.items.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "10px 2px",
                    borderTop: index ? "1px solid var(--divider)" : "none",
                  }}
                >
                  <span style={{ fontSize: 14, color: "var(--text)" }}>
                    {item.label}
                  </span>
                  {item.answerLabel ? (
                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                        textAlign: "right",
                      }}
                    >
                      {item.answerLabel}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                color: "var(--text-subtle)",
                lineHeight: 1.5,
              }}
            >
              Antwoorden uit je voedingscheck — een frequentie-inschatting, geen
              meting, status of diagnose.
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-muted)",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Doe een voedingscheck om je inname te zien.
            </p>
            <div>
              <Button
                variant="secondary"
                onClick={() => router.push("/intake/voeding")}
              >
                Start voedingscheck
              </Button>
            </div>
          </div>
        )}
      </Card>
    </section>
  );
};

const RemeasureStrip = ({
  remeasure,
  onRemeasure,
}: {
  remeasure: NonNullable<DashboardData["remeasure"]>;
  onRemeasure: () => void;
}) => {
  const [remeasuring, setRemeasuring] = useState(false);

  if (remeasure.daysUntil > 0) {
    return (
      <Card pad={20}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
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
            }}
          >
            <Icons.Calendar s={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{ fontSize: 14.5, color: "var(--text)", fontWeight: 500 }}
            >
              Over {remeasure.daysUntil} dagen: je hermeting
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--text-muted)",
                marginTop: 2,
                lineHeight: 1.4,
              }}
            >
              Dan meten we of je hefboom werkte — en of je prioriteit
              verschuift.
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      pad={20}
      glow="#C8956C"
      style={{ borderColor: "rgba(200,149,108,0.26)" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div
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
          }}
        >
          <Icons.Refresh s={18} />
        </div>
        <div style={{ flex: "1 1 180px" }}>
          <div
            style={{ fontSize: 14.5, color: "var(--text)", fontWeight: 500 }}
          >
            Tijd voor je hermeting
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "var(--text-muted)",
              marginTop: 2,
              lineHeight: 1.4,
            }}
          >
            Meet opnieuw of je leefstijl-stappen werken.
          </div>
        </div>
        <Button
          loading={remeasuring}
          iconRight={<Icons.ArrowRight s={18} />}
          onClick={() => {
            if (remeasuring) return;
            setRemeasuring(true);
            onRemeasure();
          }}
        >
          Doe je hermeting nu
        </Button>
      </div>
    </Card>
  );
};

/** Bewijs uit de lopende cyclus: hoeveel dagen je in Mijn Dag afvinkte.
 *  Zichtbaar tijdens het aftellen en in het hermeting-verslag — zelfde kaart,
 *  andere zin, zodat het bewijs niet pas op dag 30 opduikt. */
const CycleEvidenceCard = ({
  evidence,
  daysBetween,
}: {
  evidence: NonNullable<DashboardData["cycleEvidence"]>;
  daysBetween: number | null;
}) => (
  <Card pad={20}>
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--terra)",
        marginBottom: 12,
      }}
    >
      <Icons.RouteMap s={14} /> Wat je deed
    </div>
    <p
      style={{
        fontSize: 14,
        color: "var(--text-muted)",
        lineHeight: 1.55,
        margin: 0,
        textWrap: "pretty",
      }}
    >
      {daysBetween != null ? (
        <>
          In {daysBetween} dagen was je{" "}
          <span style={{ color: "var(--text)", fontWeight: 600 }}>
            {evidence.activeDays} dagen actief
          </span>{" "}
          in Mijn Dag — elke afgevinkte stap telt mee in je hermeting-beeld.
        </>
      ) : (
        <>
          Dag {evidence.cycleDay} van deze ronde: je was{" "}
          <span style={{ color: "var(--text)", fontWeight: 600 }}>
            {evidence.activeDays} dagen actief
          </span>{" "}
          in Mijn Dag. Elke afgevinkte stap telt straks mee in je
          hermeting-beeld.
        </>
      )}
    </p>
  </Card>
);

const RetestSection = ({
  model,
  data,
  onRemeasure,
  onGoVandaag,
}: SharedSectionProps) => {
  if (!model) {
    return null;
  }

  const remeasureStrip = data?.remeasure ? (
    <RemeasureStrip remeasure={data.remeasure} onRemeasure={onRemeasure} />
  ) : null;

  const cycleEvidence =
    data?.cycleEvidence && data.cycleEvidence.activeDays > 0
      ? data.cycleEvidence
      : null;

  const waitingCycleCard = cycleEvidence ? (
    <CycleEvidenceCard evidence={cycleEvidence} daysBetween={null} />
  ) : null;

  // Aftellen naar de hermeting: de teller links, het bewijs dat straks
  // meetelt ernaast. Zonder bewijs blijft de teller op volle breedte staan.
  const waitingScreen =
    remeasureStrip || waitingCycleCard ? (
      <section className="@container">
        <div
          className={`grid grid-cols-1 items-start gap-4 ${
            remeasureStrip && waitingCycleCard ? "@[900px]:grid-cols-2" : ""
          }`}
        >
          {remeasureStrip}
          {waitingCycleCard}
        </div>
      </section>
    ) : null;

  if (!model.retest) {
    return waitingScreen;
  }

  const deltaReport = data?.deltaReport ?? null;
  const domainConfigById = new Map(
    perfectSupplementMeasurementConfig.domains.map((domain) => [
      domain.id,
      domain,
    ]),
  );

  if (deltaReport) {
    const { vitality, method, perDomain, coupling, movedPriority } =
      deltaReport;
    const forwardPillar = model.priority;
    const baselinePriorityLabel = movedPriority
      ? (domainConfigById.get(movedPriority.from)?.label ?? movedPriority.from)
      : null;
    const currentPriorityLabel = movedPriority
      ? (domainConfigById.get(movedPriority.to)?.label ?? movedPriority.to)
      : forwardPillar.label;
    const forwardHabitKernel = buildHabitScoreKernel({
      vitality: model.vitality,
      priorityId: forwardPillar.id,
      priorityScore: model.scores[forwardPillar.id],
      answers: model.answers,
      domainScores: model.domainScores,
    });

    return (
      <section
        className="@container"
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        {remeasureStrip}
        <div className="grid grid-cols-1 items-start gap-4 @[900px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <Card
            pad={22}
            glow="#C8956C"
            style={{ borderColor: "rgba(200,149,108,0.26)" }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--terra)",
                marginBottom: 12,
              }}
            >
              <Icons.TrendUp s={14} /> Je hermeting · {model.date}
            </div>
            <div
              style={{
                fontFamily: "var(--f-serif)",
                fontSize: 21,
                color: "var(--text)",
                lineHeight: 1.25,
                marginBottom: 8,
              }}
            >
              Zo veranderde je beeld in {method.daysBetween} dagen.
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 2px",
                borderBottom: "1px solid var(--divider)",
                marginBottom: 4,
              }}
            >
              <span style={{ flex: 1, fontSize: 14, color: "var(--text)" }}>
                Jouw vitaliteit
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: "var(--text-subtle)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                van {vitality.was} naar {vitality.now}
              </span>
              <span style={{ width: 34, textAlign: "right" }}>
                <DeltaBadge delta={vitality.delta} />
              </span>
            </div>
            {method.sameInstrument &&
              method.selfReported &&
              method.directional &&
              method.notDiagnosis && (
                <p
                  style={{
                    fontSize: 12.5,
                    color: "var(--text-subtle)",
                    lineHeight: 1.55,
                    margin: "14px 0 16px",
                    textWrap: "pretty",
                  }}
                >
                  Zelfde vragen, zelfde schaal als je startmeting. Dit is je
                  ervaren verandering — richting, geen schijnprecisie. Geen
                  diagnose.
                </p>
              )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {perDomain.map((row, i) => {
                const domain = domainConfigById.get(row.domainId);
                return (
                  <div
                    key={row.domainId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "11px 2px",
                      borderTop: i ? "1px solid var(--divider)" : "none",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: domain?.color ?? "var(--text-subtle)",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ flex: 1, fontSize: 14, color: "var(--text)" }}>
                      {domain?.label ?? row.domainId}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--text-subtle)",
                        fontVariantNumeric: "tabular-nums",
                        textAlign: "right",
                      }}
                    >
                      {row.was} → {row.now}
                    </span>
                    <span style={{ width: 34, textAlign: "right" }}>
                      <DeltaBadge delta={row.delta} />
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {coupling.length > 0 && (
              <Card pad={20}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--sage)",
                    marginBottom: 12,
                  }}
                >
                  <Icons.Check s={14} /> Wat je volhield
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {coupling.map((entry) => {
                    const domainLabel =
                      domainConfigById.get(entry.domainId)?.label ?? entry.domainId;
                    return (
                      <p
                        key={`${entry.domainId}-${entry.action}`}
                        style={{
                          fontSize: 13.5,
                          color: "var(--text-muted)",
                          lineHeight: 1.55,
                          margin: 0,
                          textWrap: "pretty",
                        }}
                      >
                        Je hield{" "}
                        <span style={{ color: "var(--text)", fontWeight: 500 }}>
                          {entry.action}
                        </span>{" "}
                        vast — en je{" "}
                        <span style={{ color: "var(--text)", fontWeight: 500 }}>
                          {domainLabel.toLowerCase()}
                        </span>{" "}
                        bewoog{" "}
                        <span style={{ color: "var(--sage)", fontWeight: 600 }}>
                          +{entry.delta}
                        </span>
                        .
                      </p>
                    );
                  })}
                </div>
              </Card>
            )}

            {cycleEvidence ? (
              <CycleEvidenceCard
                evidence={cycleEvidence}
                daysBetween={method.daysBetween}
              />
            ) : null}

            <Card
              pad={20}
              glow="#5A8F6A"
              style={{ borderColor: "rgba(90,143,106,0.26)" }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--sage)",
                  marginBottom: 10,
                }}
              >
                <Icons.Target s={14} /> Waar je nu verder bouwt
              </div>
              <div
                style={{
                  fontFamily: "var(--f-serif)",
                  fontSize: 20,
                  color: "var(--text)",
                  lineHeight: 1.25,
                  marginBottom: 8,
                }}
              >
                {movedPriority
                  ? `Je prioriteit is verschoven van ${baselinePriorityLabel?.toLowerCase()} naar ${currentPriorityLabel.toLowerCase()}.`
                  : `Je vertrekpunt blijft ${forwardPillar.label.toLowerCase()}.`}
              </div>
              <div
                style={{
                  fontSize: 15,
                  color: "var(--text)",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                {model.activeHabit?.title ?? forwardPillar.quickWin.title}
              </div>
              <p
                style={{
                  fontSize: 13.5,
                  color: "var(--text-muted)",
                  lineHeight: 1.55,
                  margin: "0 0 8px",
                  textWrap: "pretty",
                }}
              >
                {model.activeHabit?.detail ?? forwardPillar.quickWin.detail}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-subtle)",
                  lineHeight: 1.55,
                  margin: "0 0 16px",
                  textWrap: "pretty",
                }}
              >
                {forwardHabitKernel.driverLinkLine}
              </p>
              <Button
                variant="secondary"
                onClick={onGoVandaag}
                iconRight={<Icons.ArrowRight s={18} />}
              >
                Ga naar Kompas
              </Button>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  if (!model.prevScores) {
    return waitingScreen;
  }

  const prevScores = model.prevScores;
  const prevPriority = derivePriority(prevScores)[0];
  const rows = [...PILLARS]
    .map((pillar) => ({
      pillar,
      now: model.scores[pillar.id],
      was: prevScores[pillar.id],
      d: model.scores[pillar.id] - prevScores[pillar.id],
    }))
    .sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
  const movedPriority = prevPriority.id !== model.priority.id;

  return (
    <section
      className="@container"
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      {remeasureStrip}
      <div
        className={`grid grid-cols-1 items-start gap-4 ${
          waitingCycleCard
            ? "@[900px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
            : ""
        }`}
      >
        <Card
          pad={22}
          glow="#C8956C"
          style={{ borderColor: "rgba(200,149,108,0.26)" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--terra)",
              marginBottom: 12,
            }}
          >
            <Icons.TrendUp s={14} /> Je hertest · {model.date}
          </div>
          <div
            style={{
              fontFamily: "var(--f-serif)",
              fontSize: 21,
              color: "var(--text)",
              lineHeight: 1.25,
              marginBottom: 8,
            }}
          >
            {movedPriority
              ? `Je prioriteit is verschoven van ${prevPriority.label.toLowerCase()} naar ${model.priority.label.toLowerCase()}.`
              : `Je vertrekpunt blijft ${model.priority.label.toLowerCase()}.`}
          </div>
          <p
            style={{
              fontSize: 13.5,
              color: "var(--text-muted)",
              lineHeight: 1.55,
              margin: "0 0 16px",
              textWrap: "pretty",
            }}
          >
            Bekijk welke pijlers het meest zijn verschoven sinds je vorige check.
          </p>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {rows.map((row, i) => (
              <div
                key={row.pillar.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 2px",
                  borderTop: i ? "1px solid var(--divider)" : "none",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: row.pillar.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, fontSize: 14, color: "var(--text)" }}>
                  {row.pillar.label}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--text-subtle)",
                    fontVariantNumeric: "tabular-nums",
                    textAlign: "right",
                  }}
                >
                  {row.was} → {row.now}
                </span>
                <span style={{ width: 34, textAlign: "right" }}>
                  <DeltaBadge delta={row.d} />
                </span>
              </div>
            ))}
          </div>
        </Card>

        {waitingCycleCard}
      </div>
    </section>
  );
};

const HistorySection = ({ empty, model }: SharedSectionProps) => {
  const [open, setOpen] = useState(false);
  if (empty || !model) {
    return (
      <Card pad={20}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--panel-border)",
              color: "var(--text-subtle)",
            }}
          >
            <Icons.Clock s={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{ fontSize: 14.5, color: "var(--text)", fontWeight: 500 }}
            >
              Je historie
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--text-muted)",
                marginTop: 2,
              }}
            >
              Elke check verschijnt hier — met je prioriteit van dat moment.
            </div>
          </div>
        </div>
      </Card>
    );
  }
  const past = model.history.slice(0, -1).reverse();
  return (
    <section>
      <Card pad={0}>
        <div
          onClick={() => setOpen(!open)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            padding: "18px 20px",
            cursor: "pointer",
          }}
        >
          <div
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
            }}
          >
            <Icons.Clock s={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{ fontSize: 14.5, color: "var(--text)", fontWeight: 500 }}
            >
              Eerdere checks
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--text-muted)",
                marginTop: 2,
              }}
            >
              {past.length} checks · je prioriteit schoof mee over tijd
            </div>
          </div>
          <span
            style={{
              color: "var(--text-subtle)",
              display: "flex",
              transition: "transform .25s",
              transform: open ? "rotate(180deg)" : "none",
            }}
          >
            <Icons.ChevronDown s={20} />
          </span>
        </div>
        {open && (
          <div style={{ padding: "0 20px 10px" }}>
            {past.map((history, i) => {
              const priority = PILLAR[history.priority];
              return (
                <div
                  key={`${history.seq}-${i}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "13px 0",
                    borderTop: "1px solid var(--divider)",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: "var(--text)" }}>
                      {history.date}
                    </div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 11.5,
                        marginTop: 4,
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: priority.color,
                        }}
                      />
                      <span style={{ color: "var(--text-muted)" }}>
                        prioriteit: {priority.label.toLowerCase()}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--f-serif)",
                      fontSize: 17,
                      color: "var(--text)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {history.vitality}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </section>
  );
};

const FutureSection = () => {
  const handleWearableInterest = () => {
    emitAccountClientEvent("wearable.interest_clicked", {
      surface: "dashboard_future",
      feature: "wearable_connect",
    });
    trackEvent("wearable_interest", { surface: "dashboard_future" });
    clarityTag("wearable_interest", "dashboard_future");
  };

  return (
  <section>
    <button
      type="button"
      onClick={handleWearableInterest}
      className="w-full text-left"
      aria-label="Interesse in wearable-koppeling — nog niet beschikbaar"
    >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "18px 20px",
        borderRadius: 24,
        border: "1px dashed var(--panel-border)",
        background: "rgba(255,255,255,0.015)",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--divider)",
          color: "var(--text-subtle)",
        }}
      >
        <Icons.Watch s={18} />
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 14.5,
            color: "var(--text-muted)",
            fontWeight: 500,
          }}
        >
          Koppel je wearable
        </div>
        <div
          style={{ fontSize: 12.5, color: "var(--text-subtle)", marginTop: 2 }}
        >
          Rustpols en slaapduur straks automatisch — het rooster groeit met je
          mee.
        </div>
      </div>
      <span
        style={{
          fontSize: 11,
          color: "var(--text-subtle)",
          border: "1px solid var(--divider)",
          borderRadius: 999,
          padding: "4px 11px",
          whiteSpace: "nowrap",
        }}
      >
        Later
      </span>
    </div>
    </button>
  </section>
  );
};

// Dode sectie: staat in DASHBOARD_SECTIONS maar in geen enkele TAB_SECTIONS-lijst.
// Meting is verwijderd in K1; de sectie zelf wordt in K6 opgeruimd.
const StatisticsSection = (props: SharedSectionProps) => {
  if (!props.isMember) {
    return (
      <section aria-label="Statistieken">
        <SectionHeader eyebrow="Statistieken" title="Je cijfers over tijd" />
        <Card
          pad={24}
          glow="#C8956C"
          style={{ borderColor: "rgba(200,149,108,0.26)" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--text-subtle)",
              }}
            >
              <Icons.Lock s={14} /> Lidmaatschap
            </div>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-muted)",
                lineHeight: 1.6,
                margin: 0,
                textWrap: "pretty",
              }}
            >
              Volg je HRV, rustpols en slaapduur, je voedingsinname en je
              volledige checkgeschiedenis — gebundeld op één plek, over tijd.
              Beschikbaar met lidmaatschap zodra de meetlaag live is.
            </p>
            <span
              style={{
                display: "inline-flex",
                alignSelf: "flex-start",
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
              <Icons.Spark s={13} /> Met lidmaatschap
            </span>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <CollapsibleSection eyebrow="Statistieken" title="Je cijfers over tijd">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {resolveTrendsAccess(props.hasTrendsFeature, props.isMember) ? (
          <section aria-label="Herstelgevoel trend">
            <SectionHeader eyebrow="Trends" title="Herstel vs. training" />
            <MovementRecoveryTrendsCard trend={props.data?.movementRecoveryTrend ?? []} />
          </section>
        ) : null}
        <SignalsSection {...props} />
        <NutritionIntakeSection {...props} />
        <HistorySection {...props} />
      </div>
    </CollapsibleSection>
  );
};

const RecommendationsSection = ({ model, data }: SharedSectionProps) => {
  if (!model) {
    return null;
  }

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
  const nutritionLogCompleted = eligibility.nutritionLogCompleted === true;

  if (!nutritionLogCompleted) {
    return (
      <section aria-label="Voedingscheck">
        <SectionHeader eyebrow="Eerst je bord" title="Doe de voedingscheck" />
        <Card pad={16}>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.55, margin: 0, textWrap: "pretty" }}>
            Supplementadvies tonen we pas na je voedingscheck — leefstijl eerst, in die volgorde.
          </p>
          <Link
            href="/intake/voeding?from=dashboard"
            onClick={() => {
              trackEvent("dashboard_voedingscheck_cta_click", { surface: "voortgang_aanraders" });
              clarityTag("dashboard_voedingscheck_cta", "voortgang");
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 14,
              fontSize: 14,
              fontWeight: 600,
              color: "var(--sage)",
              textDecoration: "none",
            }}
          >
            Start voedingscheck (1 min) <Icons.ChevronRight s={16} />
          </Link>
        </Card>
      </section>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section aria-label="Jouw aanraders">
      <SectionHeader eyebrow="Jouw aanraders" title="Wat past bij jouw scores" />
      <Card pad={8}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {recommendations.map((rec, index) => {
            const href = rec.comparisonHref ?? rec.guideHref;
            return (
              <Link
                key={rec.slug}
                href={href}
                onClick={() => {
                  trackEvent("dashboard_aanrader_click", { slug: rec.slug, target: href });
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
                  <div style={{ fontFamily: "var(--f-serif)", fontSize: 16, color: "var(--text)", lineHeight: 1.25 }}>
                    {rec.name}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, marginTop: 2, textWrap: "pretty" }}>
                    {rec.wiifm}
                  </div>
                </div>
                <Icons.ChevronRight s={18} style={{ color: "var(--text-subtle)", flexShrink: 0 }} />
              </Link>
            );
          })}
        </div>
      </Card>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: "var(--text-muted)", marginTop: 10 }}>
        <Icons.Shield s={13} style={{ color: "var(--sage)" }} />
        <span>Algemene oriëntatie op basis van je antwoorden — geen persoonlijk medisch advies. Wij verkopen zelf niets.</span>
      </div>
    </section>
  );
};

const IdentitySection = () => {
  const shownRef = useRef(false);

  useEffect(() => {
    if (shownRef.current) {
      return;
    }
    shownRef.current = true;
    trackEvent("dashboard_lichaamssamenstelling_getoond", { surface: "voortgang" });
    clarityTag("dashboard_lichaamssamenstelling", "scaffold");
  }, []);

  return (
    <section aria-label="Lichaamssamenstelling">
      <SectionHeader eyebrow="Lichaamssamenstelling" title="Voor een persoonlijk doel" />
      <Card pad={20}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {IDENTITY_FIELDS.map((field, index) => {
            const Icon = Icons[field.icon];
            return (
              <div
                key={field.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 2px",
                  borderTop: index ? "1px solid var(--divider)" : "none",
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.04)", border: "1px solid var(--panel-border)", color: "var(--text-muted)", flexShrink: 0 }}>
                  <Icon s={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: "var(--text)" }}>{field.label}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-subtle)", lineHeight: 1.45, marginTop: 1, textWrap: "pretty" }}>
                    {field.unlocks}
                  </div>
                </div>
                <span style={{ fontSize: 13, color: field.value ? "var(--text)" : "var(--text-subtle)", flexShrink: 0 }}>
                  {field.value ?? "—"}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--terra, #C8956C)", border: "1px solid rgba(200,149,108,0.4)", borderRadius: 999, padding: "5px 12px" }}>
          <Icons.Spark s={13} /> Later in te vullen
        </div>
      </Card>
    </section>
  );
};

/** Domeinen op de donkere cockpit-shell (@container-breedteladder) — de rest
 * (energie/herstel: DomainSoonScreen) blijft op de smallere vaste breedte. */
/**
 * Het home-frame per domein — de prebuild die dat Vandaag-scherm draagt.
 *
 * Leeg sinds 5 september. Verbinding was het laatste domein met een iframe, en
 * dat domein is uit de interface (zie `zichtbare-domeinen.ts`). Het mechanisme
 * blijft staan: elk domein dat later een prebuild krijgt hangt hem hier op,
 * en `PrebuildFrame` met zijn postMessage-navbrug is er nog.
 */
const DOMAIN_PREBUILD: Partial<Record<PillarId, { src: string; title: string }>> = {};

const COCKPIT_WIDTH_DOMAINS = new Set<PillarId>([
  "beweging",
  "stress",
  "slaap",
  "voeding",
]);

const KOMPAS_LIGHT = {
  text: "#1c1917",
  muted: "#57534e",
  subtle: "#78716c",
  border: "#e4e0da",
  innerBorder: "#ebe7e2",
  innerBg: "#faf9f7",
} as const;

const KompasLightPanel = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`overflow-hidden rounded-[28px] border border-[#e4e0da] bg-gradient-to-b from-[#fefdfb] to-white shadow-[0_16px_48px_rgba(15,28,16,0.10)] ${className}`}
  >
    {children}
  </div>
);

const SoonPill = ({ label = "Later" }: { label?: string }) => (
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

const DomainSoonScreen = ({
  model,
  domain,
}: {
  model: DashboardModel;
  domain: PillarId;
}) => {
  const pillar = PILLAR[domain];
  return (
    <KompasLightPanel className="-mt-3 p-5">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card pad={24} surface="light" glow={pillar.color} style={{ borderColor: `${pillar.color}55` }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14 }}>
            <KompasDomainGauge value={model.scores[domain] ?? 0} label={pillar.label} />
            <div style={{ fontFamily: "var(--f-serif)", fontSize: 22, color: KOMPAS_LIGHT.text, lineHeight: 1.2 }}>
              {pillar.label}
            </div>
            <p style={{ fontSize: 14, color: KOMPAS_LIGHT.muted, lineHeight: 1.55, margin: 0, maxWidth: 330, textWrap: "pretty" }}>
              {pillar.lever}
            </p>
            <SoonPill />
          </div>
        </Card>
      </div>
    </KompasLightPanel>
  );
};

const KompasHome = ({
  model,
  data,
  onGoAgenda,
  onGoKeuze,
  onGoVoortgangDomein,
  agendaDate: _agendaDate,
  onAgendaDateChange: _onAgendaDateChange,
  onPrefUpdated,
  initialKompasView,
  kompasResetSignal: _kompasResetSignal,
  prefUpdatedAt: _prefUpdatedAt,
  onDomainViewChange,
  onDomainNavApi,
  onContextRailApi,
}: SharedSectionProps) => {
  const currentModel = model as DashboardModel | null;
  const searchParams = useSearchParams();
  const [domainView, setDomainView] = useState<PillarId | null>(() => {
    if (typeof window !== "undefined") {
      return parseKompasFromUrl(window.location.href);
    }
    return initialKompasView ?? null;
  });
  const railDomains = useMemo(
    () => buildKompasRailDomains(currentModel?.scores ?? {}),
    [currentModel],
  );
  const railTools = useMemo(
    () => (domainView ? buildDomainRailTools(domainView) : []),
    [domainView],
  );

  useEffect(() => {
    onDomainViewChange?.(domainView);
  }, [domainView, onDomainViewChange]);

  // router.push(buildDashboardVandaagHref) en andere client-navigaties updaten
  // searchParams zonder popstate — domainView moet meelopen met ?kompas=.
  useEffect(() => {
    const param = searchParams.get("kompas");
    const next = isPillarId(param) ? param : null;
    startTransition(() => {
      setDomainView((current) => (current === next ? current : next));
    });
  }, [searchParams]);

  const domainNavHandlersRef = useRef({
    onBack: () => {},
    onSwitch: (_domain: PillarId) => {},
  });

  useEffect(() => {
    const onPopState = () => {
      setDomainView(parseKompasFromUrl(window.location.href));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const setKompasDomain = (domain: PillarId | null) => {
    setDomainView(domain);
    syncDashboardKompasParam(domain);
  };

  const closeView = () => {
    setKompasDomain(null);
  };

  const handleDomainBack = () => {
    if (!domainView) {
      return;
    }
    trackEvent("dashboard_kompas_domain_back_click", {
      from_domain: domainView,
      from_level: "cockpit",
    });
    clarityTag("dashboard_kompas_topnav", "back");
    closeView();
  };

  const handleDomainSwitch = (
    toDomain: PillarId,
    surface: "top_nav" | "context_rail" = "top_nav",
  ) => {
    if (!domainView || toDomain === domainView) {
      return;
    }
    trackEvent("dashboard_kompas_domain_switch_click", {
      from_domain: domainView,
      to_domain: toDomain,
      surface,
    });
    clarityTag("dashboard_kompas_domain_switch", `${domainView}_${toDomain}`);
    setKompasDomain(toDomain);
  };

  const openDomain = (
    domain: PillarId,
    surface: "kompas_home" | "context_rail" | "leefstijlkompas" = "kompas_home",
  ) => {
    trackEvent("dashboard_kompas_domain_open", { domain, surface });
    clarityTag("dashboard_kompas_domain", domain);
    setKompasDomain(domain);
  };

  const handleRailToolClick = (tool: ContextRailToolId) => {
    if (tool === "checkin") {
      // Navigatie loopt via de Link in de rail; hier alleen de meting.
      trackEvent("dashboard_beweging_checkin_click", {
        mode: "full",
        surface: "context_rail",
      });
      clarityTag("dashboard_beweging_checkin", "click");
      return;
    }

    // Navigatie loopt via de Link in de rail; hier alleen de meting.
    trackEvent("dashboard_beweging_gids_click", { surface: "context_rail" });
  };

  const contextRailHandlersRef = useRef({
    onOpenDomain: (_domain: PillarId) => {},
    onBackToKompas: () => {},
    onToolClick: (_tool: ContextRailToolId) => {},
  });

  useEffect(() => {
    domainNavHandlersRef.current = {
      onBack: handleDomainBack,
      onSwitch: handleDomainSwitch,
    };
    contextRailHandlersRef.current = {
      onOpenDomain: (domain: PillarId) => {
        if (domainView && domain !== domainView) {
          handleDomainSwitch(domain, "context_rail");
          return;
        }
        openDomain(domain, "context_rail");
      },
      onBackToKompas: handleDomainBack,
      onToolClick: handleRailToolClick,
    };
  });

  // Elk open domein krijgt dezelfde rail-behandeling: Kompas-knop, domeinlijst
  // om te switchen, plus eigen tools indien aanwezig (beweging).
  const railMode: ContextRailMode = !domainView ? "kompasHome" : "domainTools";

  useEffect(() => {
    if (!onContextRailApi) {
      return;
    }
    onContextRailApi({
      mode: railMode,
      domains: railDomains,
      tools: railTools,
      onOpenDomain: (domain) => contextRailHandlersRef.current.onOpenDomain(domain),
      onBackToKompas: () => contextRailHandlersRef.current.onBackToKompas(),
      onToolClick: (tool) => contextRailHandlersRef.current.onToolClick(tool),
    });
    return () => {
      onContextRailApi(null);
    };
  }, [onContextRailApi, railMode, railDomains, railTools, domainView]);

  useEffect(() => {
    if (!onDomainNavApi) {
      return;
    }
    if (domainView) {
      onDomainNavApi({
        onBack: () => domainNavHandlersRef.current.onBack(),
        onSwitch: (domain) => domainNavHandlersRef.current.onSwitch(domain),
      });
    } else {
      onDomainNavApi(null);
    }
    return () => {
      onDomainNavApi(null);
    };
  }, [domainView, onDomainNavApi]);

  if (!currentModel) {
    return null;
  }

  const withDomainTopNav = (content: ReactElement) => content;

  // Elk domein toont zijn prebuild letterlijk, op zijn home-frame. De interne
  // appbar is verborgen, dus navigatie binnen de prebuild verzet de échte tab
  // (PrebuildFrame → resolvePrebuildHref).
  const domainPrebuild = domainView ? DOMAIN_PREBUILD[domainView] : null;
  if (domainPrebuild) {
    return withDomainTopNav(
      <PrebuildFrame src={domainPrebuild.src} title={domainPrebuild.title} />,
    );
  }
  // Beweging, slaap en voeding niet: die schermen schrijven. Een keuze landt
  // in `account_favorites`, een moment in `agenda_blocks`, en de
  // contextkolom ernaast volgt de laag die je aanklikt — alle drie gaan de
  // iframe-grens over. Alle drie draaien op hetzelfde `DomainKompasScreen`.
  if (domainView && isDomainKompasDomain(domainView) && currentModel) {
    return withDomainTopNav(
      <DomainKompasScreen
        domain={domainView}
        model={currentModel}
        data={data}
        onGoAgenda={() => onGoAgenda()}
        onGoVoortgangDomein={() => onGoVoortgangDomein(domainView)}
        onGoLogboek={() => onGoKeuze(domainView, "logboek")}
      />,
    );
  }
  if (domainView) {
    return withDomainTopNav(
      <DomainSoonScreen model={currentModel} domain={domainView} />,
    );
  }

  return (
    <section aria-label="Kompas" className="-mt-2 flex flex-col gap-2.5">
      <CockpitShell accent="#5A8F6A" ariaLabel="Kompas home" embedded>
        <KompasHomeCard
          model={currentModel}
          data={data}
          firstName={data?.firstName}
          domainCheckDaysAgo={data?.domainCheckDaysAgo}
          remeasureDaysUntil={data?.remeasure?.daysUntil ?? null}
          onOpenDomain={(domain) => openDomain(domain, "leefstijlkompas")}
          onOpenPriority={(domain) => openDomain(domain, "leefstijlkompas")}
          onOpenAgenda={onGoAgenda}
          onPrefUpdated={onPrefUpdated}
        />
      </CockpitShell>
    </section>
  );
};

const EMPTY_SECTIONS: DashboardSectionType[] = [];

const SECTION_RENDERERS: Record<
  DashboardSectionType,
  (props: SharedSectionProps) => ReactElement | null
> = {
  now: (props) => <NowSection {...props} />,
  priority: (props) => (props.empty ? null : <PrioritySection {...props} />),
  plan: (props) => (props.empty ? null : <PlanSection {...props} />),
  agendaTeaser: () => null,
  agendaHome: (props) =>
    props.empty || !props.model ? null : (
      <AgendaScreen
        model={props.model}
        data={props.data}
        selectedDate={props.agendaDate}
        view={props.agendaView}
        onSelectedDateChange={props.onAgendaDateChange}
        onViewChange={props.onAgendaViewChange}
        onPrefUpdated={props.onPrefUpdated}
        onGoVoortgang={props.onGoVoortgang}
      />
    ),
  kompasHome: (props) =>
    props.empty ? null : <KompasHome key={`kompas-${props.kompasResetSignal}`} {...props} />,
  signals: (props) => (props.empty ? null : <SignalsSection {...props} />),
  nutritionIntake: (props) =>
    props.empty ? null : <NutritionIntakeSection {...props} />,
  retest: (props) => (props.empty ? null : <RetestSection {...props} />),
  identity: (props) => (props.empty ? null : <IdentitySection />),
  history: (props) => <HistorySection {...props} />,
  statistics: (props) =>
    props.empty ? null : <StatisticsSection {...props} />,
  recommendations: (props) =>
    props.empty ? null : <RecommendationsSection {...props} />,
  voortgangHub: (props) =>
    props.empty || !props.model ? null : (
      <VoortgangHub
        model={props.model}
        data={props.data}
        tab={props.tab}
        screen={props.voortgangScreen}
        leefstijlprofielDomein={props.leefstijlprofielDomein}
        voedingLaag={props.voedingLaag}
        hermetingSlot={
          props.empty ? null : (
            <div className="flex flex-col gap-4">
              <RetestSection {...props} />
              <FutureSection />
            </div>
          )
        }
        onScreenChange={props.onVoortgangScreenChange}
        onPrefUpdated={props.onPrefUpdated}
        onGoAgenda={() => props.onGoAgenda()}
        onGoKeuze={(domain) => props.onGoKeuze(domain)}
      />
    ),
  keuze: (props) =>
    props.empty || !props.model || !props.keuzeDomein ? null : (
      <KeuzeScherm
        model={props.model}
        data={props.data}
        domain={props.keuzeDomein}
        deel={props.keuzeDeel}
        onDeelChange={(domain, deel) => props.onGoKeuze(domain, deel)}
        onSwitchDomain={(domain, deel) => props.onGoKeuze(domain, deel)}
        onOpenLeefstijlprofiel={props.onGoVoortgangDomein}
      />
    ),
  future: () => <FutureSection />,
};

function renderDashboardSection(
  type: DashboardSectionType,
  props: SharedSectionProps,
): ReactElement | null {
  const renderer = SECTION_RENDERERS[type];
  if (typeof renderer === "function") {
    return renderer(props);
  }
  return null;
}

const EmptyTabState = ({
  tab,
  onCheck,
}: {
  tab: DashboardTab;
  onCheck: () => void;
}) => {
  const Icon = Icons[tab.icon];
  return (
    <Card
      pad={22}
      style={{ borderStyle: "dashed", background: "rgba(255,255,255,0.015)" }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--sage)",
          marginBottom: 10,
        }}
      >
        <Icon s={14} /> {tab.label}
      </div>
      <div
        style={{
          fontFamily: "var(--f-serif)",
          fontSize: 19,
          color: "var(--text)",
          lineHeight: 1.25,
          marginBottom: 8,
        }}
      >
        {tab.title}
      </div>
      <p
        style={{
          fontSize: 13.5,
          color: "var(--text-muted)",
          lineHeight: 1.55,
          margin: "0 0 18px",
          textWrap: "pretty",
        }}
      >
        {tab.emptyHint}
      </p>
      <Button onClick={onCheck} iconRight={<Icons.ArrowRight s={18} />}>
        Doe je eerste check
      </Button>
    </Card>
  );
};

export default function Dashboard(props: DashboardProps) {
  return (
    <VoortgangFavoritesProvider>
      <DomainLadderFocusProvider>
        <LadderMomentsProvider>
          <DashboardContent {...props} />
        </LadderMomentsProvider>
      </DomainLadderFocusProvider>
    </VoortgangFavoritesProvider>
  );
}

function DashboardContent({
  empty,
  data,
  isMember = false,
  hasTrendsFeature = false,
  initialTab,
  initialVoortgangScreen,
  initialKompasView,
  initialAgendaView,
  sleepFocus = null,
}: DashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<DashboardTabId>(
    initialTab ?? (empty ? "voortgang" : "vandaag"),
  );
  const [kompasResetSignal, setKompasResetSignal] = useState(0);
  const [voortgangScreen, setVoortgangScreen] = useState<VoortgangScreen>(
    initialVoortgangScreen ?? "hub",
  );
  const [leefstijlprofielDomein, setLeefstijlprofielDomein] = useState<PillarId | null>(null);
  const [voedingLaag, setVoedingLaag] = useState<VoedingLaagSlug | null>(() =>
    parseVoedingLaagFromUrl(`http://localhost/dashboard?${searchParams.toString()}`),
  );
  // Het domein van de Keuze-tab zodra de gebruiker hem hier wisselt: `pushState`
  // werkt `useSearchParams` niet bij, dus de URL is de bron bij binnenkomst en
  // deze staat wint daarna.
  const [keuzeDomeinOverride, setKeuzeDomeinOverride] = useState<PillarId | null>(null);
  // Live-geopende Kompas-domein, gemeld door KompasHome — zodat de
  // cockpit-shell (header/breadcrumb/context) meebeweegt met navigatie i.p.v.
  // vast te staan op de domein uit de URL bij het eerste laden.
  const [cockpitDomain, setCockpitDomain] = useState<PillarId | null>(
    initialKompasView ?? null,
  );
  const [domainNavApi, setDomainNavApi] = useState<DomainNavApi | null>(null);
  const [contextRailApi, setContextRailApi] = useState<ContextRailApi>(null);
  const isDesktopRail = useMediaQuery("(min-width: 768px)");
  const [priorityPrefOverride, setPriorityPrefOverride] = useState<
    AccountPriorityPrefData | null | undefined
  >(undefined);
  const [movementPrefsOverride, setMovementPrefsOverride] = useState<MovementPrefs | null>(
    null,
  );
  const [agendaDateOverride, setAgendaDateOverride] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return parseDagFromUrl(window.location.href);
    }
    return null;
  });
  const dagParam = searchParams.get("dag");
  const agendaDate =
    dagParam && isValidAgendaDate(dagParam)
      ? dagParam
      : (agendaDateOverride ?? todayInAgendaTimezone());
  const [agendaView, setAgendaView] = useState<AgendaViewId>(() => {
    if (typeof window !== "undefined") {
      return parseAgendaViewFromUrl(window.location.href);
    }
    return initialAgendaView ?? "dag";
  });

  const priorityPref =
    priorityPrefOverride !== undefined ? priorityPrefOverride : (data?.priorityPref ?? null);

  const effectiveMovementPrefs =
    movementPrefsOverride ?? data?.movementPrefs ?? EMPTY_MOVEMENT_PREFS;

  const model = useMemo(
    () =>
      !empty && data?.current
        ? buildModel(
            data.current,
            data.prev,
            data.history,
            data.retest,
            data.answers,
            data.planProgress,
            data.planDomain,
            priorityPref?.pillarId ?? null,
            priorityPref?.timeBucket ?? null,
            priorityPref?.scheduledTime ?? null,
            priorityPref?.planStepDismissedDate ?? null,
            priorityPref?.planStepsHidden ?? false,
            data.sleepCheckinFocus,
            data.movementRcvFeel,
            data.movementRcvFeelAt,
            effectiveMovementPrefs,
            data.movementPlanProgress,
            resolveMovementDayChoiceForToday(
              priorityPref?.movementDayChoice ?? null,
              priorityPref?.movementDayChoiceDate ?? null,
              todayInAgendaTimezone(),
            ),
          )
        : null,
    [empty, data, priorityPref, effectiveMovementPrefs],
  );

  const todayActionDone = useTodayActionDone(model);

  const activeVoortgangFavDomein = useMemo((): PillarId | null => {
    if (voortgangScreen !== "leefstijlprofiel" && voortgangScreen !== "domein") {
      return null;
    }
    const paramFav = searchParams.get("fav");
    if (isPillarId(paramFav)) {
      return paramFav;
    }
    if (typeof window !== "undefined") {
      const urlFav = parseLeefstijlprofielDomeinFromUrl(window.location.href);
      if (urlFav) {
        return urlFav;
      }
    }
    return leefstijlprofielDomein;
  }, [voortgangScreen, searchParams, leefstijlprofielDomein]);

  const activeLeefstijlprofielDomein =
    voortgangScreen === "leefstijlprofiel" || voortgangScreen === "domein"
      ? activeVoortgangFavDomein
      : null;

  const activeVoedingLaag =
    activeLeefstijlprofielDomein === "voeding" ? voedingLaag : null;

  /**
   * Welk schap de Keuze-tab opent: het domein uit de URL, anders het domein dat
   * je op Leefstijlprofiel bekijkt, anders je prioriteit. `null` betekent dat
   * geen van die drie een schap heeft — dan blijft de tab leeg in plaats van
   * dat hij een domein toont dat er geen aanbod op heeft (zie ook
   * `KompasOndersteuningTile`: één predikaat, `resolveSchapDomain`).
   */
  const activeKeuzeDomein = useMemo((): PillarId | null => {
    // Alleen uit `searchParams`, nooit uit `window.location`: die tweede bron
    // bestaat op de server niet, en op een legacy-URL (`fav=slaap`) leest de
    // server dan een ander domein dan de client — dat is precies een
    // hydration-mismatch. `fav` staat er als tweede sleutel bij, want dat is
    // de naam die het schap tot 27 augustus droeg. Navigatie ná hydration
    // wordt gedekt door `keuzeDomeinOverride`.
    const paramDomein = searchParams.get("domein") ?? searchParams.get("fav");
    const fromParams = isPillarId(paramDomein) ? resolveSchapDomain(paramDomein) : null;
    if (fromParams) {
      return fromParams;
    }
    return (
      resolveSchapDomain(keuzeDomeinOverride) ??
      resolveSchapDomain(activeLeefstijlprofielDomein) ??
      resolveSchapDomain(model?.priority.id) ??
      resolveKeuzeFallbackDomain(model?.scores)
    );
  }, [
    searchParams,
    keuzeDomeinOverride,
    activeLeefstijlprofielDomein,
    model?.priority,
    model?.scores,
  ]);

  /** Idem: `schap=` is de oude naam van `deel=`. Klikken daarna leven in `KeuzeScherm`. */
  const activeKeuzeDeel = useMemo((): SchapTabId | null => {
    const paramDeel = searchParams.get("deel") ?? searchParams.get("schap");
    return isSchapTabId(paramDeel) ? paramDeel : null;
  }, [searchParams]);

  const tabMeta = DASHBOARD_TABS.find((t) => t.id === tab) ?? DASHBOARD_TABS[0];
  const allowedTypes = TAB_SECTIONS[tab];
  const sectionTypes = empty
    ? allowedTypes.filter((type) => EMPTY_SECTIONS.includes(type))
    : allowedTypes;

  const VALID_TAB_IDS = useMemo(
    () => new Set<DashboardTabId>(DASHBOARD_TABS.map((t) => t.id)),
    [],
  );

  const resetKompasToHome = () => {
    syncDashboardKompasParam(null);
  };

  const syncTabToUrl = (nextTab: DashboardTabId, dag?: string) => {
    syncDashboardTabParam(nextTab, {
      dag: dag ?? agendaDate,
    });
  };

  const handleAgendaDateChange = useCallback((date: string) => {
    if (!isValidAgendaDate(date)) {
      return;
    }
    setAgendaDateOverride(date);
    syncDashboardDagParam(date);
  }, []);

  const handleAgendaViewChange = useCallback((view: AgendaViewId) => {
    setAgendaView(view);
    syncDashboardAgendaViewParam(view);
  }, []);

  const tabRef = useRef(tab);
  useEffect(() => {
    tabRef.current = tab;
  });

  const handleVoortgangScreenChange = useCallback(
    (screen: VoortgangScreen, options?: SyncDashboardVoortgangOptions) => {
      if (screen === "inzichten") {
        setVoortgangScreen("leefstijlprofiel");
        setLeefstijlprofielDomein(null);
        setVoedingLaag(null);
        syncDashboardVoortgangScreenParam("leefstijlprofiel");
        return;
      }
      if (screen === "domein") {
        const nextDomein = options?.domein ?? options?.fav ?? null;
        const nextLaag =
          nextDomein === "voeding" && isVoedingLaagSlug(options?.laag) ? options.laag : null;
        setVoortgangScreen("leefstijlprofiel");
        setLeefstijlprofielDomein(nextDomein);
        setVoedingLaag(nextLaag);
        syncDashboardVoortgangScreenParam("leefstijlprofiel", {
          fav: nextDomein,
          laag: nextLaag,
        });
        return;
      }
      setVoortgangScreen(screen);
      if (screen === "leefstijlprofiel") {
        const nextFav =
          options && "fav" in options ? (options.fav ?? null) : leefstijlprofielDomein;
        const nextLaag =
          nextFav === "voeding" && isVoedingLaagSlug(options?.laag) ? options.laag : null;
        setLeefstijlprofielDomein(nextFav);
        setVoedingLaag(nextLaag);
        syncDashboardVoortgangScreenParam(screen, { fav: nextFav, laag: nextLaag });
        return;
      }
      setVoedingLaag(null);
      syncDashboardVoortgangScreenParam(screen);
    },
    [leefstijlprofielDomein],
  );

  /**
   * Naar de Keuze-tab, op het schap van één domein. De enige schrijver van de
   * `tab=keuze&domein=&deel=`-route: elke deur (Vandaag, Mijn Dag,
   * Leefstijlprofiel, de rail, de balk in de header) loopt hierlangs, zodat ze
   * niet uit elkaar kunnen lopen.
   */
  const handleGoKeuze = useCallback(
    (domain: PillarId, deel?: SchapTabId | null) => {
      const target = resolveSchapDomain(domain);
      if (!target) {
        return;
      }
      if (tab !== "keuze") {
        trackDashboardTabSelected("keuze");
        clarityTag("dashboard_tab", "keuze");
      }
      setKeuzeDomeinOverride(target);
      setTab("keuze");
      setVoortgangScreen("hub");
      syncDashboardKeuzeParams(target, deel ?? null);
    },
    [tab],
  );

  /**
   * Eén navigatiepad voor beide dragers van de Voortgang-navigatie: de linker
   * rail (md+) en de inklapbare balk in de header (onder md). `surface` houdt
   * ze in de meting uit elkaar.
   */
  const handleVoortgangItemOpen = useCallback(
    (item: VoortgangRailItemId, surface: "rail" | "topnav") => {
      trackEvent("dashboard_voortgang_hub_click", { destination: item, surface });
      clarityTag("dashboard_voortgang", item);
      if (item === "hub") {
        handleVoortgangScreenChange("hub");
      } else if (item === "leefstijlprofiel") {
        handleVoortgangScreenChange("leefstijlprofiel", { fav: null });
      } else if (item === "hermeting") {
        handleVoortgangScreenChange("hermeting");
      }
    },
    [handleVoortgangScreenChange],
  );

  const handleVoortgangDomeinOpen = useCallback(
    (domain: PillarId, surface: "rail" | "topnav") => {
      trackEvent("dashboard_voortgang_hub_click", {
        destination: "leefstijlprofiel",
        domain,
        surface,
      });
      clarityTag("dashboard_voortgang", `leefstijlprofiel_${domain}`);
      handleVoortgangScreenChange("leefstijlprofiel", { fav: domain, laag: null });
    },
    [handleVoortgangScreenChange],
  );

  const handleVoortgangVoedingLaagOpen = useCallback(
    (laag: VoedingLaagSlug, surface: "rail" | "topnav") => {
      trackEvent("dashboard_voortgang_hub_click", {
        destination: "leefstijlprofiel",
        domain: "voeding",
        layer: voedingLaagIdFromSlug(laag),
        surface,
      });
      clarityTag("dashboard_voortgang", `leefstijlprofiel_voeding_${laag}`);
      handleVoortgangScreenChange("leefstijlprofiel", { fav: "voeding", laag });
    },
    [handleVoortgangScreenChange],
  );

  const handleRailVoortgangOpen = useCallback(
    (item: VoortgangRailItemId) => handleVoortgangItemOpen(item, "rail"),
    [handleVoortgangItemOpen],
  );

  const handleRailLeefstijlprofielDomeinOpen = useCallback(
    (domain: PillarId) => handleVoortgangDomeinOpen(domain, "rail"),
    [handleVoortgangDomeinOpen],
  );

  const handleRailVoedingLaagOpen = useCallback(
    (laag: VoedingLaagSlug) => handleVoortgangVoedingLaagOpen(laag, "rail"),
    [handleVoortgangVoedingLaagOpen],
  );

  const handleTopNavVoortgangOpen = useCallback(
    (item: VoortgangRailItemId) => handleVoortgangItemOpen(item, "topnav"),
    [handleVoortgangItemOpen],
  );

  const handleTopNavLeefstijlprofielDomeinOpen = useCallback(
    (domain: PillarId) => handleVoortgangDomeinOpen(domain, "topnav"),
    [handleVoortgangDomeinOpen],
  );

  const handleTopNavVoedingLaagOpen = useCallback(
    (laag: VoedingLaagSlug) => handleVoortgangVoedingLaagOpen(laag, "topnav"),
    [handleVoortgangVoedingLaagOpen],
  );

  /** Domeinschakelaar van de Keuze-tab in de linker rail (md+). */
  const handleRailKeuzeDomeinOpen = useCallback(
    (domain: PillarId) => {
      trackEvent("dashboard_keuze_domein_open", { domain, surface: "rail" });
      clarityTag("dashboard_keuze", `domein_${domain}`);
      handleGoKeuze(domain, activeKeuzeDeel);
    },
    [handleGoKeuze, activeKeuzeDeel],
  );

  const syncTabFromLocation = useCallback(() => {
    const url = new URL(window.location.href);
    // Routes van vóór 27 augustus (`tab=hermeting`, `screen=schap`) eerst naar
    // hun huidige plek herschrijven — anders leest de rest van deze functie een
    // tab die niet meer bestaat.
    const legacyTab = canonicalizeDashboardTabParam(url);
    if (legacyTab) {
      trackEvent("dashboard_tab_legacy_redirect", { to: legacyTab });
      clarityTag("dashboard_tab_legacy", legacyTab);
      window.history.replaceState(null, "", url.toString());
    }
    const tabParam = url.searchParams.get("tab");
    if (tabParam && VALID_TAB_IDS.has(tabParam as DashboardTabId)) {
      const parsedTab = tabParam as DashboardTabId;
      if (parsedTab !== tabRef.current) {
        setTab(parsedTab);
      }
      if (parsedTab === "voortgang") {
        const legacyAlias = getLegacyVoortgangScreenAlias(url.searchParams.get("screen"));
        const urlBefore = url.toString();
        const canonical = canonicalizeVoortgangScreenParam(url);
        if (legacyAlias || url.toString() !== urlBefore) {
          if (legacyAlias) {
            trackEvent("dashboard_voortgang_legacy_redirect", {
              from: legacyAlias,
              to: canonical ?? "hub",
            });
            clarityTag("dashboard_voortgang_legacy", legacyAlias);
          }
          window.history.replaceState(null, "", url.toString());
        }
        const parsedScreen = parseVoortgangScreenFromUrl(url);
        setVoortgangScreen(parsedScreen);
        if (parsedScreen === "leefstijlprofiel" || parsedScreen === "domein") {
          const urlFav = parseLeefstijlprofielDomeinFromUrl(url);
          setLeefstijlprofielDomein(urlFav);
          setVoedingLaag(parseVoedingLaagFromUrl(url));
        } else {
          setVoedingLaag(null);
        }
      } else {
        setVoortgangScreen("hub");
        setVoedingLaag(null);
        if (parsedTab === "keuze") {
          setKeuzeDomeinOverride(resolveSchapDomain(parseKeuzeDomeinFromUrl(url)));
        }
      }
    }
    const dag = parseDagFromUrl(url);
    setAgendaDateOverride(dag);
    setAgendaView(parseAgendaViewFromUrl(url));
  }, [VALID_TAB_IDS]);

  useEffect(() => {
    const onPopState = () => {
      syncTabFromLocation();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [syncTabFromLocation]);

  // Eén keer bij binnenkomst: een oude link (`tab=hermeting`,
  // `screen=schap`) landt server-side al op het juiste scherm, maar de URL in
  // de adresbalk draagt dan nog de oude naam. `replaceState`, geen
  // `pushState` — dit is opschonen, geen navigatiestap, dus de terug-knop mag
  // er niet op blijven hangen.
  useEffect(() => {
    const url = new URL(window.location.href);
    const canonical = canonicalizeDashboardTabParam(url);
    if (!canonical) {
      return;
    }
    trackEvent("dashboard_tab_legacy_redirect", { to: canonical });
    clarityTag("dashboard_tab_legacy", canonical);
    window.history.replaceState(null, "", url.toString());
  }, []);

  useEffect(() => {
    // Tab-bar-klikken lopen via history.pushState → popstate-listener hierboven.
    // Dit effect blijft voor echte Next-navigaties (bv. KompasBegeleidingLink).
    //
    // Lezen uit `window.location` en niet uit `searchParams`: bij een legacy
    // route schrijft het effect hierboven de URL al schoon, en dan draagt
    // `searchParams` nog de oude naam — die zou de tab hier terugzetten op het
    // tabblad waar je net vandaan gestuurd bent. De canonicalisatie draait ook
    // hier, op een kopie, zodat de volgorde van de effecten niet uitmaakt.
    const url = new URL(window.location.href);
    canonicalizeDashboardTabParam(url);
    const tabParam = url.searchParams.get("tab");
    if (!tabParam || !VALID_TAB_IDS.has(tabParam as DashboardTabId)) {
      return;
    }
    const parsedTab = tabParam as DashboardTabId;
    startTransition(() => {
      if (parsedTab !== tabRef.current) {
        setTab(parsedTab);
        if (parsedTab !== "voortgang") {
          setVoortgangScreen("hub");
        }
      }
      if (parsedTab === "voortgang") {
        setVoortgangScreen(parseVoortgangScreenFromUrl(url));
        setVoedingLaag(parseVoedingLaagFromUrl(url));
      }
      if (parsedTab === "keuze") {
        setKeuzeDomeinOverride(resolveSchapDomain(parseKeuzeDomeinFromUrl(url)));
      }
    });
  }, [searchParams, VALID_TAB_IDS]);

  const selectTab = (nextTab: DashboardTabId) => {
    if (nextTab !== tab) {
      trackDashboardTabSelected(nextTab);
      clarityTag("dashboard_tab", nextTab);
    }
    if (nextTab === "vandaag") {
      resetKompasToHome();
      syncDashboardTabParam("vandaag", { dag: agendaDate });
      setKompasResetSignal((prev) => prev + 1);
      if (tab === "vandaag") {
        trackEvent("dashboard_kompas_tab_reset", { source: "tabbar" });
        clarityTag("dashboard_kompas_view", "home_reset");
      }
    } else {
      syncTabToUrl(nextTab);
    }
    if (nextTab === "voortgang" && tab === "voortgang" && voortgangScreen !== "hub") {
      setVoortgangScreen("hub");
      setVoedingLaag(null);
      syncDashboardVoortgangScreenParam("hub");
      trackEvent("dashboard_voortgang_tab_reset", {
        source: "tabbar",
        from_screen: voortgangScreen,
      });
      clarityTag("dashboard_voortgang", "hub_reset");
    }
    if (nextTab !== "voortgang") {
      setVoortgangScreen("hub");
      setVoedingLaag(null);
    } else if (nextTab !== tab) {
      setVoortgangScreen("hub");
      setVoedingLaag(null);
    }
    // De tab-balk is het "opnieuw beginnen"-gebaar: hij laat de Keuze-tab
    // terugvallen op je prioriteitsdomein, net zoals Kompas terugvalt op de
    // home en Voortgang op Overzicht. Deeplinks (`handleGoKeuze`) lopen hier
    // niet langs en houden hun domein dus wél vast.
    if (nextTab === "keuze" && tab === "keuze" && keuzeDomeinOverride) {
      trackEvent("dashboard_keuze_tab_reset", { source: "tabbar" });
      clarityTag("dashboard_keuze", "domein_reset");
    }
    setKeuzeDomeinOverride(null);
    setTab(nextTab);
  };

  // Losstaand van selectTab: die reset voortgangScreen altijd naar "hub" bij
  // elke tab-wissel, en zou de domein-keuze hieronder meteen overschrijven.
  const goToVoortgangDomein = (domain: PillarId) => {
    if (tab !== "voortgang") {
      trackDashboardTabSelected("voortgang");
      clarityTag("dashboard_tab", "voortgang");
    }
    setVoortgangScreen("leefstijlprofiel");
    setLeefstijlprofielDomein(domain);
    setVoedingLaag(null);
    syncDashboardVoortgangScreenParam("leefstijlprofiel", { fav: domain });
    setTab("voortgang");
  };

  const onCheck = () => {
    if (empty) {
      emitIntakeClientEvent("dashboard.first_checkin_started", {
        source: "dashboard",
        route: "/intake",
      });
      router.push("/intake?from=dashboard");
      return;
    }
    selectTab("vandaag");
  };
  const onLogout = async () => {
    await fetch("/api/account/logout", { method: "POST" });
    router.push("/account/login");
  };
  const onDashboardCheckin = (route: string, pillarId: PillarId) => {
    emitIntakeClientEvent("dashboard.first_checkin_started", {
      source: "dashboard",
      pillar_id: pillarId,
      route,
    });
    router.push(`${route}?from=dashboard&kompas=${pillarId}`);
  };
  const onRemeasure = () => {
    trackEvent("dashboard_hermeting_start_click", { surface: "dashboard" });
    clarityTag("dashboard_hermeting", "start");
    // API-route met server-side redirect, geen paginacomponent — router.push() kan hier niet op navigeren.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/api/account/remeasure/start");
  };

  const sharedProps: SharedSectionProps = {
    empty,
    model,
    data,
    isMember,
    hasTrendsFeature,
    tab,
    kompasResetSignal,
    onCheck,
    onDashboardCheckin,
    onRemeasure,
    onGoVandaag: () => selectTab("vandaag"),
    onGoHermeting: () => {
      handleVoortgangScreenChange("hermeting");
      selectTab("voortgang");
    },
    onGoAgenda: (date?: string) => {
      const dag = date && isValidAgendaDate(date) ? date : agendaDate;
      if (dag !== agendaDate) {
        handleAgendaDateChange(dag);
      }
      syncDashboardTabParam("agenda", { dag });
      if (tab !== "agenda") {
        trackDashboardTabSelected("agenda");
        clarityTag("dashboard_tab", "agenda");
      }
      setVoortgangScreen("hub");
      setTab("agenda");
    },
    agendaDate,
    agendaView,
    onAgendaDateChange: handleAgendaDateChange,
    onAgendaViewChange: handleAgendaViewChange,
    onGoVoortgang: () => {
      setVoortgangScreen("hub");
      selectTab("voortgang");
    },
    voortgangScreen,
    onVoortgangScreenChange: handleVoortgangScreenChange,
    onOpenInzichten: () => handleVoortgangScreenChange("leefstijlprofiel", { fav: null }),
    leefstijlprofielDomein: activeLeefstijlprofielDomein,
    voedingLaag: activeVoedingLaag,
    keuzeDomein: activeKeuzeDomein,
    keuzeDeel: activeKeuzeDeel,
    onGoKeuze: handleGoKeuze,
    onGoVoortgangDomein: goToVoortgangDomein,
    initialKompasView,
    prefUpdatedAt: priorityPref?.updatedAt ?? null,
    onPrefUpdated: setPriorityPrefOverride,
    sleepFocus,
    onDomainViewChange: setCockpitDomain,
    onDomainNavApi: setDomainNavApi,
    onContextRailApi: setContextRailApi,
  };

  const surfaceClass =
    tab === "vandaag" || tab === "agenda" || tab === "voortgang"
      ? "ps-dash-surface-kompas"
      : "";

  const sectionsNode = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: tab === "vandaag" && cockpitDomain === "beweging" ? 12 : 16,
      }}
    >
      {empty ? (
        <EmptyTabState tab={tabMeta} onCheck={onCheck} />
      ) : sectionTypes.length === 0 ? null : (
        sectionTypes.map((type) => (
          <section key={type}>
            {renderDashboardSection(type, sharedProps)}
          </section>
        ))
      )}
    </div>
  );

  // Verhuisd naar het Context-paneel (inspectorExtra) i.p.v. een footer onder
  // de scrollende hoofdinhoud — zo draagt dit niet meer bij aan paginascroll.
  const dashboardInfoCard = (
    <div className="rounded-[14px] border border-white/10 bg-black/20 p-4">
      <span className="mb-2 inline-flex items-center text-[10px] font-bold uppercase tracking-[0.1em] text-[#9FB0A6]">
        Hoe dit werkt
      </span>
      <p className="text-[12.5px] leading-relaxed text-[#CDD7D0]">
        <Link href="/hoe-werkt-dashboard" className="underline underline-offset-2">
          Hoe werkt dit dashboard?
        </Link>
        <span aria-hidden> · </span>
        <Link
          href="/onderbouwing"
          onClick={() => {
            trackOnderbouwingLinkClick({
              surface: "dashboard_footer",
              tab,
              screen: voortgangScreen,
            });
            clarityTag("onderbouwing_link", "dashboard_footer");
          }}
          className="underline underline-offset-2"
        >
          Onderbouwing
        </Link>
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-[#7E8C82] text-pretty">
        PerfectSupplement geeft adviezen op basis van leefstijl, geen medische
        diagnoses. Je scores zijn een reflectie van je eigen antwoorden — geen
        medische meetwaarden. Je gegevens zijn van jou — exporteer of
        verwijder ze wanneer je wilt.
      </p>
    </div>
  );

  // Alleen op het Kompas-tabblad ("vandaag") stelt de gebruiker een domein
  // open/dicht; op Mijn Dag/Voortgang/Hermeting is er geen domein-context.
  // cockpitDomain wordt live gemeld door KompasHome (onDomainViewChange),
  // dus dit volgt echte navigatie i.p.v. te bevriezen op de load-URL.
  const viewedDomain = tab === "vandaag" ? cockpitDomain : null;
  const { focus: ladderFocus } = useDomainLadderFocus();
  // Het anker-systeem bestaat vooralsnog alleen voor beweging (zie
  // BLAUWDRUK_DOMEIN_STAPPENPLANNEN.md §7) — toon 'm dus alleen wanneer dat
  // domein daadwerkelijk open staat, niet op elk ander tabblad/domein.
  const anchorOption =
    viewedDomain === "beweging"
      ? getMovementAnchorOption(effectiveMovementPrefs.anchor)
      : undefined;
  const activeHabit = model?.activeHabit ?? null;
  // Op het Kompas draagt `KompasContextSpine` de hele kolom: urgentie uit de
  // ladder, je ijkpunt en je ritme, allemaal over hetzelfde domein. De losse
  // gewoonte-/meet-kaarten zeggen daar hetzelfde met minder verband, dus daar
  // is de lijst leeg (lege lijst, geen `null` — anders vallen ze terug).
  // Op Mijn Dag, Voortgang en Hermeting is er geen focusdomein en blijven ze
  // staan, inclusief de "meet"-kaart met `remeasureAction`.
  const spineDomain: PillarId | null =
    tab === "vandaag"
      ? (ladderFocus?.domain ?? viewedDomain ?? model?.priority.id ?? null)
      : null;
  // De laag die het scherm ernaast uitlegt. Op de home staat er geen ladder
  // open — dan valt de kolom terug op de winst-laag uit de check.
  const spineLayerId =
    ladderFocus && ladderFocus.domain === spineDomain ? ladderFocus.layerId : null;
  const inspectorCards = spineDomain
    ? []
    : buildInspectorCards({
        activeHabit: activeHabit
          ? {
              title: activeHabit.title,
              detail: activeHabit.detail,
              done: todayActionDone,
            }
          : null,
        remeasure: data?.remeasure ? { daysUntil: data.remeasure.daysUntil } : null,
        anchorWhy: anchorOption?.whySuffix ?? null,
      });
  const remeasureAction = data?.remeasure
    ? { due: data.remeasure.daysUntil <= 0, onClick: onRemeasure }
    : undefined;
  const inspectorExtra = dashboardInfoCard;
  // De contextkolom op het Kompas — home én domeinscherm, want de vraag
  // ("waar zit mijn winst, waar koers ik op, wat is hier het aanbod, houd ik
  // het vol") verandert daar niet, alleen het domein. `spineLayerId` is null
  // zolang er geen ladder open staat; dan leest de kolom de winst-laag uit de
  // check. `domainScreenOpen` gatet de schap-deur: op de home draagt
  // `KompasOndersteuningTile` de enige deur, naar je prioriteitsdomein.
  const inspectorPanel = spineDomain
    ? (compact: boolean) => (
        <KompasContextSpine
          domain={spineDomain}
          openLayerId={spineLayerId}
          data={data}
          model={model}
          todayActionDone={todayActionDone}
          domainScreenOpen={viewedDomain != null}
          onRemeasure={data?.remeasure ? onRemeasure : undefined}
          compact={compact}
        />
      )
    : undefined;
  const inspectorDoelFooter =
    viewedDomain === "beweging" && effectiveMovementPrefs.anchor ? (
      <MovementAnchorRechoose
        currentAnchor={effectiveMovementPrefs.anchor}
        onSaved={setMovementPrefsOverride}
      />
    ) : null;

  // De linker rail volgt dezelfde context als de header: domeinlijst op de
  // Kompas-home, Kompas-knop + evt. eigen tools bij een open domein, de
  // Bekijken-navigatie op Voortgang, profiel als er geen van die contexten is
  // (ander tabblad of lege staat).
  const desiredRailMode: ContextRailMode = empty
    ? "profile"
    : tab === "voortgang"
      ? "voortgang"
      : tab === "keuze"
        ? "keuze"
        : tab !== "vandaag"
          ? "profile"
          : !viewedDomain
            ? "kompasHome"
            : "domainTools";
  const railDomainItems = useMemo(
    () => buildKompasRailDomains(model?.scores ?? {}),
    [model?.scores],
  );
  const voortgangRailDomains = useMemo(
    () => buildVoortgangRailDomains(model?.scores ?? {}),
    [model?.scores],
  );
  const keuzeRailDomains = useMemo(() => buildKeuzeRailDomains(), []);

  const contextRailMode: ContextRailMode =
    desiredRailMode === "voortgang" || desiredRailMode === "keuze"
      ? desiredRailMode
      : contextRailApi && contextRailApi.mode === desiredRailMode
        ? desiredRailMode
        : "profile";
  // Op desktop neemt de rail de domein-navigatie over; op mobiel blijft de
  // DomainTopNav in de header de enige manier om van domein te wisselen.
  const hideDomainTopNav = isDesktopRail && contextRailMode === "domainTools";

  const kompasDomainNav =
    viewedDomain && domainNavApi && !hideDomainTopNav ? (
      <DomainTopNav
        activeDomain={viewedDomain}
        domains={railDomainItems}
        onBack={domainNavApi.onBack}
        onSwitch={domainNavApi.onSwitch}
      />
    ) : null;

  /**
   * Onder md draagt de header de Voortgang-navigatie: dezelfde bestemmingen
   * als de rail, ingeklapt tot één regel die met de header mee blijft staan.
   * `md:hidden` op de wrapper i.p.v. een media-query-hook — geen flits bij
   * hydration, en de rail blijft de enige drager op desktop.
   */
  const voortgangTopNav =
    tab === "voortgang" ? (
      <VoortgangTopNav
        activeItem={resolveVoortgangRailActiveItem(voortgangScreen)}
        leefstijlprofielDomein={activeLeefstijlprofielDomein}
        voedingLaag={activeVoedingLaag}
        domains={voortgangRailDomains}
        onOpenItem={handleTopNavVoortgangOpen}
        onOpenDomein={handleTopNavLeefstijlprofielDomeinOpen}
        onOpenVoedingLaag={handleTopNavVoedingLaagOpen}
      />
    ) : null;

  /**
   * De Keuze-tab draagt hier géén ingeklapte balk. Zijn navigatie is één
   * driekeuze (welk schap), en die past als chiprij bovenaan het scherm zelf —
   * één tik in plaats van twee. De balk bestaat voor Voortgang omdat daar acht
   * ongelijksoortige bestemmingen onder moeten; dat is een ander probleem.
   */
  const collapsibleTopNav = voortgangTopNav;

  return (
    <div className={`min-h-dvh ${surfaceClass}`}>
      <CockpitFrame
        activeTab={tab}
        onSelectTab={selectTab}
        domainNav={collapsibleTopNav ?? kompasDomainNav}
        domainNavClassName={
          collapsibleTopNav ? "px-4 pb-2.5 sm:px-6 md:hidden" : undefined
        }
        onOpenSettings={() => router.push("/account")}
        onLogout={onLogout}
        firstName={data?.firstName ?? null}
        anchorLabel={anchorOption?.label ?? null}
        statusDone={todayActionDone}
        onCheckin={() => selectTab("vandaag")}
        railMode={contextRailMode}
        railDomains={contextRailApi?.domains}
        railActiveDomain={viewedDomain}
        railTools={contextRailApi?.tools}
        railDomainLabel={viewedDomain ? PILLAR[viewedDomain].label : null}
        onOpenDomain={contextRailApi?.onOpenDomain}
        onToolClick={contextRailApi?.onToolClick}
        onBackToKompas={contextRailApi?.onBackToKompas}
        railVoortgangActiveItem={resolveVoortgangRailActiveItem(voortgangScreen)}
        railVoortgangLeefstijlprofielDomein={activeLeefstijlprofielDomein}
        railVoortgangDomains={voortgangRailDomains}
        onOpenVoortgangItem={handleRailVoortgangOpen}
        onOpenLeefstijlprofielDomein={handleRailLeefstijlprofielDomeinOpen}
        railVoortgangVoedingLaag={activeVoedingLaag}
        onOpenVoedingLaag={handleRailVoedingLaagOpen}
        railKeuzeDomains={keuzeRailDomains}
        railKeuzeActiveDomein={activeKeuzeDomein}
        onOpenKeuzeDomein={handleRailKeuzeDomeinOpen}
        inspectorCards={inspectorCards}
        remeasureAction={remeasureAction}
        inspectorDoelFooter={inspectorDoelFooter}
        inspectorExtra={inspectorExtra}
        inspectorPanel={inspectorPanel}
        hideRail={tab === "agenda"}
      >
        <div
          className={`w-full ${
            tab === "agenda"
              ? "min-w-0"
              : (viewedDomain != null && COCKPIT_WIDTH_DOMAINS.has(viewedDomain)) ||
                  (tab === "vandaag" && !viewedDomain) ||
                  tab === "voortgang" ||
                  tab === "keuze"
                ? "min-w-0"
                : "max-w-[720px]"
          }`}
        >
          {sectionsNode}
        </div>
      </CockpitFrame>
    </div>
  );
}
