"use client";

import type { ReactElement, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PriorityLadder from "@/components/app/PriorityLadder";
import VitalityGauge from "@/components/app/VitalityGauge";
import VitalityScoreCard from "@/components/app/VitalityScoreCard";
import Wordmark from "@/components/app/Wordmark";
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
import MetingenCard from "@/components/dashboard/MetingenCard";
import VoortgangHub from "@/components/dashboard/VoortgangHub";
import type { VoortgangScreen } from "@/components/dashboard/VoortgangHub";
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
import { getDisplayStatus, getDisplayStatusTone } from "@/lib/score-display";
import { getReadoutPresentation } from "@/lib/dashboard-readout";
import { buildModel, derivePriority } from "@/lib/dashboard-model";
import { buildPriorityInterventionHref } from "@/lib/dashboard-active-plan";
import { isReadoutDomain } from "@/lib/domain-role";
import { buildHabitScoreKernel } from "@/lib/vitality-habit-kernel";
import { getVitalityExplainer } from "@/lib/vitality-explainer";
import { getVitalityScoreCardCopy } from "@/lib/vitality-score-copy";
import { clarityTag } from "@/lib/clarity";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { trackEvent } from "@/lib/ga4";
import { buildRecommendations } from "@/lib/build-recommendations";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";
import { buildRecommendationInput } from "@/lib/recommendation-input";
import { buildSupplementDisclosure } from "@/lib/reveal-supplement";
import type { ActivePlanHabit } from "@/lib/dashboard-active-plan";
import { NUTRITION_BAND } from "@/lib/nutrition-band-labels";
import type {
  DashboardData,
  DashboardModel,
  DashboardSectionType,
  DashboardTab,
  DashboardTabId,
  PillarId,
  Signal,
} from "@/types/dashboard";

type DashboardProps = {
  empty?: boolean;
  data?: DashboardData;
  isMember?: boolean;
  initialTab?: DashboardTabId;
  initialVoortgangScreen?: VoortgangScreen;
};

type SharedSectionProps = {
  empty?: boolean;
  model: DashboardModel | null;
  data?: DashboardData;
  isMember: boolean;
  tab: DashboardTabId;
  onCheck: () => void;
  onDashboardCheckin: (route: string, pillarId: PillarId) => void;
  onRemeasure: () => void;
  onGoVandaag: () => void;
  voortgangScreen: VoortgangScreen;
  onVoortgangScreenChange: (screen: VoortgangScreen) => void;
  onOpenInzichten: () => void;
};

const DashHeader = ({ onLogout }: { onLogout: () => void | Promise<void> }) => {
  const router = useRouter();
  const iconBtn = {
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
  } as const;

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
      }}
    >
      <Link
        href="/"
        aria-label="Naar de website"
        style={{ textDecoration: "none" }}
      >
        <Wordmark />
      </Link>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          style={iconBtn}
          title="Instellingen"
          onClick={() => router.push("/account")}
        >
          <Icons.Settings s={18} />
        </button>
        <button
          type="button"
          style={iconBtn}
          title="Uitloggen"
          onClick={onLogout}
        >
          <Icons.LogOut s={18} />
        </button>
      </div>
    </header>
  );
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

const Greeting = ({
  empty,
  model,
}: {
  empty?: boolean;
  model: DashboardModel | null;
}) => (
  <div style={{ marginBottom: 20 }}>
    <div
      style={{
        fontFamily: "var(--f-serif)",
        fontSize: 30,
        color: "var(--text)",
        lineHeight: 1.1,
      }}
    >
      {empty ? "Goed dat je er bent." : "Welkom terug."}
    </div>
    <div
      style={{
        fontSize: 14.5,
        color: "var(--text-muted)",
        marginTop: 8,
        lineHeight: 1.5,
        textWrap: "pretty",
      }}
    >
      {empty
        ? "Eén check en dit dashboard begint te onthouden hoe het met je gaat — en waar je begint."
        : model
          ? `${model.date} · je vertrekpunt nu is ${model.priority.label.toLowerCase()}.`
          : ""}
    </div>
  </div>
);

const VitalityScoreSection = ({
  empty,
  model,
  data,
  onCheck,
  voortgangScreen,
  onOpenInzichten,
}: SharedSectionProps) => {
  const currentModel = model as DashboardModel | null;
  const emittedKeyRef = useRef<string | null>(null);
  const habitKernel =
    currentModel &&
    buildHabitScoreKernel({
      vitality: currentModel.vitality,
      priorityId: currentModel.priority.id,
      priorityScore: currentModel.scores[currentModel.priority.id],
      answers: currentModel.answers,
      domainScores: currentModel.domainScores,
    });

  useEffect(() => {
    if (!currentModel || !habitKernel) {
      return;
    }
    const eventKey = `${currentModel.date}:${currentModel.vitality}:${habitKernel.driverHabitId}`;
    if (emittedKeyRef.current === eventKey) {
      return;
    }
    emittedKeyRef.current = eventKey;
    emitIntakeClientEvent("dashboard.vitality_scored", {
      source: "dashboard_today",
      vitality_score: currentModel.vitality,
      vitality_band: habitKernel.vitalityBand,
      confidence: habitKernel.confidence,
      driver_pillar: habitKernel.driverPillarId,
      driver_pillar_score: habitKernel.driverPillarScore,
      driver_habit_id: habitKernel.driverHabitId,
    });
  }, [currentModel, habitKernel]);

  if (empty) {
    return (
      <VitalityScoreCard
        locked
        tone="light"
        onCta={() => {
          clarityTag("dashboard_vitaalscore_cta", "empty");
          trackEvent("dashboard_first_check_cta", {
            surface: "vitaalscore_card",
          });
          onCheck();
        }}
      />
    );
  }

  if (!currentModel) {
    return null;
  }

  if (voortgangScreen !== "hub") {
    return null;
  }

  const cardCopy = getVitalityScoreCardCopy({
    firstName: data?.firstName ?? null,
    vitality: currentModel.vitality,
    priorityId: currentModel.priority.id,
    priorityScore: currentModel.scores[currentModel.priority.id],
    answers: currentModel.answers,
    domainScores: currentModel.domainScores,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <VitalityScoreCard
        tone="light"
        value={currentModel.vitality}
        delta={currentModel.vitalityDelta}
        firstName={data?.firstName ?? null}
        headingLine={cardCopy.heading}
        bodyLine={cardCopy.body}
        showRhythm={false}
        onInsightsClick={() => {
          trackEvent("dashboard_inzichten_cta_click", { surface: "voortgang" });
          clarityTag("dashboard_voortgang", "inzichten_cta");
          onOpenInzichten();
        }}
      />
      <MetingenCard scores={currentModel.scores} history={currentModel.history} />
    </div>
  );
};

const NowSection = ({ empty, model }: SharedSectionProps) => {
  const currentModel = model as DashboardModel | null;
  const [habitCompleted, setHabitCompleted] = useState(
    currentModel?.activeHabit?.state === "done",
  );
  const habitKernel =
    currentModel &&
    buildHabitScoreKernel({
      vitality: currentModel.vitality,
      priorityId: currentModel.priority.id,
      priorityScore: currentModel.scores[currentModel.priority.id],
      answers: currentModel.answers,
      domainScores: currentModel.domainScores,
    });

  if (!empty && !model) {
    return null;
  }

  const explainer =
    currentModel &&
    getVitalityExplainer({
      vitality: currentModel.vitality,
      vitalityDelta: currentModel.vitalityDelta,
      priorityId: currentModel.priority.id,
      priorityScore: currentModel.scores[currentModel.priority.id],
      answers: currentModel.answers,
      domainScores: currentModel.domainScores,
    });
  const recommendationInput = currentModel
    ? buildRecommendationInput({ scores: currentModel.domainScores })
    : null;
  const lifestyleStep = currentModel?.activeHabit
    ? {
        title: currentModel.activeHabit.title,
        detail: currentModel.activeHabit.detail ?? "",
      }
    : currentModel?.priority.quickWin;
  const supplementDisclosure =
    currentModel && recommendationInput
      ? buildSupplementDisclosure(
          currentModel.priority,
          recommendationInput,
          "dashboard",
          lifestyleStep,
        )
      : null;
  const interventionHref = currentModel
    ? buildPriorityInterventionHref(currentModel)
    : null;

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
    herstel: 0,
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
              binnenkort
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
      <div
        style={{
          fontSize: 12,
          color: "var(--text-subtle)",
          marginTop: 12,
          lineHeight: 1.5,
        }}
      >
        Wearable-signalen worden binnenkort toegevoegd ter bevestiging van je
        trends.
      </div>
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
              {intake.items.map((item, index) => {
                const bandMeta = NUTRITION_BAND[item.band];
                return (
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
                    <span
                      style={{
                        border: `1px solid ${bandMeta.color}44`,
                        background: `${bandMeta.color}1a`,
                        color: bandMeta.color,
                        borderRadius: 999,
                        padding: "2px 8px",
                        fontSize: 11,
                      }}
                    >
                      {bandMeta.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                color: "var(--text-subtle)",
                lineHeight: 1.5,
              }}
            >
              Grove inschatting op basis van hoe vaak je eet — een vuistregel,
              geen meting, status of diagnose.
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
        <Button onClick={onRemeasure} iconRight={<Icons.ArrowRight s={18} />}>
          Doe je hermeting nu
        </Button>
      </div>
    </Card>
  );
};

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

  if (!model.retest) {
    return remeasureStrip ? <section>{remeasureStrip}</section> : null;
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
      <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {remeasureStrip}
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
      </section>
    );
  }

  if (!model.prevScores) {
    return remeasureStrip ? <section>{remeasureStrip}</section> : null;
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
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {remeasureStrip}
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

const FutureSection = () => (
  <section>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "18px 20px",
        borderRadius: 24,
        border: "1px dashed var(--panel-border)",
        background: "rgba(255,255,255,0.015)",
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
        Binnenkort
      </span>
    </div>
  </section>
);

const StatisticsSection = (props: SharedSectionProps) => {
  const upsellShownRef = useRef(false);

  useEffect(() => {
    if (props.isMember || upsellShownRef.current) {
      return;
    }
    upsellShownRef.current = true;
    trackEvent("dashboard_statistieken_upsell", {
      state: "locked",
      surface: "voortgang",
    });
    clarityTag("dashboard_statistieken", "locked");
  }, [props.isMember]);

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
              Binnenkort beschikbaar met lidmaatschap.
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
              <Icons.Spark s={13} /> Binnenkort
            </span>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <CollapsibleSection eyebrow="Statistieken" title="Je cijfers over tijd">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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

  const recommendations = buildRecommendations(session);

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
          <Icons.Spark s={13} /> Binnenkort in te vullen
        </div>
      </Card>
    </section>
  );
};

const MEDITERRANEAN_PRODUCTS: { icon: string; label: string }[] = [
  { icon: "🫒", label: "Olijfolie" },
  { icon: "🐟", label: "Vette vis" },
  { icon: "🥜", label: "Noten" },
  { icon: "🫘", label: "Peulvruchten" },
];

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

const KompasLooseCard = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-[28px] border border-[#e4e0da] bg-white p-4 shadow-[0_8px_32px_rgba(15,28,16,0.06)] ${className}`}
  >
    {children}
  </div>
);

const STATUS_BADGE_COLOR: Record<
  ReturnType<typeof getDisplayStatusTone>,
  string
> = {
  sage: "#5A8F6A",
  neutral: "#78716c",
  terra: "#C4873B",
  "terra-deep": "#B45309",
};

type KompasView = PillarId | "activiteiten" | "trend";

const KompasRowCard = ({
  onClick,
  ariaLabel,
  leading,
  title,
  subtitle,
  trailing = "chevron",
}: {
  onClick: () => void;
  ariaLabel: string;
  leading: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: "chevron" | "soon";
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    className="flex min-h-[52px] w-full cursor-pointer items-center gap-3 rounded-[18px] border border-[#ebe7e2] bg-white px-3.5 py-3 text-left shadow-sm transition active:scale-[0.99] hover:border-[#5A8F6A]"
    style={{ fontFamily: "var(--f-sans)" }}
  >
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[#faf9f7]">
      {leading}
    </div>
    <div className="min-w-0 flex-1">
      <div
        className="text-base leading-tight text-[#1c1917]"
        style={{ fontFamily: "var(--f-serif)" }}
      >
        {title}
      </div>
      {subtitle ? (
        <div className="mt-0.5 text-[13px] leading-snug text-[#57534e]">{subtitle}</div>
      ) : null}
    </div>
    {trailing === "soon" ? (
      <SoonPill />
    ) : (
      <Icons.ChevronRight s={18} style={{ color: KOMPAS_LIGHT.subtle, flexShrink: 0 }} />
    )}
  </button>
);

const DomainBackBar = ({ onBack }: { onBack: () => void }) => (
  <button
    type="button"
    onClick={onBack}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "8px 2px",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: KOMPAS_LIGHT.muted,
      fontFamily: "var(--f-sans)",
      fontSize: 13.5,
      fontWeight: 600,
      alignSelf: "flex-start",
    }}
  >
    <Icons.ChevronRight s={16} style={{ transform: "rotate(180deg)" }} /> Kompas
  </button>
);

const KompasDomainRow = ({
  label,
  score,
  color,
  isPriority,
  onClick,
}: {
  label: string;
  score: number;
  color: string;
  isPriority?: boolean;
  onClick: () => void;
}) => {
  const status = getDisplayStatus(score);
  const tone = getDisplayStatusTone(status);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open ${label}`}
      className={`w-full cursor-pointer rounded-[18px] border bg-white p-3.5 text-left shadow-sm transition active:scale-[0.99] hover:border-[#5A8F6A] ${
        isPriority ? "border-[#5A8F6A]" : "border-[#ebe7e2]"
      }`}
      style={{ fontFamily: "var(--f-sans)" }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-base text-[#1c1917]"
          style={{ fontFamily: "var(--f-serif)" }}
        >
          {label}
        </span>
        <span
          className="shrink-0 text-[11px] font-bold uppercase tracking-[0.06em]"
          style={{ color: STATUS_BADGE_COLOR[tone] }}
        >
          {status}
        </span>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#ebe7e2]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(100, Math.max(0, score))}%`, background: color }}
        />
      </div>
    </button>
  );
};

const KompasSoonScreen = ({
  onBack,
  title,
  body,
  teaser,
  showChartPlaceholder = false,
}: {
  onBack: () => void;
  title: string;
  body: string;
  teaser?: string | null;
  showChartPlaceholder?: boolean;
}) => (
  <KompasLightPanel className="-mt-3 p-5">
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <DomainBackBar onBack={onBack} />
      <Card pad={24} surface="light">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              fontFamily: "var(--f-serif)",
              fontSize: 22,
              color: KOMPAS_LIGHT.text,
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>
          <p
            style={{
              fontSize: 14,
              color: KOMPAS_LIGHT.muted,
              lineHeight: 1.55,
              margin: 0,
              maxWidth: 330,
              textWrap: "pretty",
            }}
          >
            {body}
          </p>
          {teaser ? (
            <p
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: KOMPAS_LIGHT.text,
                lineHeight: 1.5,
                margin: 0,
                textWrap: "pretty",
              }}
            >
              Vandaag: {teaser}
            </p>
          ) : null}
          {showChartPlaceholder ? (
            <div
              className="aspect-[16/9] w-full rounded-[16px] border border-[#ebe7e2] bg-[#faf9f7]"
              aria-hidden
            />
          ) : null}
          <SoonPill />
        </div>
      </Card>
    </div>
  </KompasLightPanel>
);

const DomainSoonScreen = ({
  model,
  domain,
  onBack,
}: {
  model: DashboardModel;
  domain: PillarId;
  onBack: () => void;
}) => {
  const pillar = PILLAR[domain];
  return (
    <KompasLightPanel className="-mt-3 p-5">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <DomainBackBar onBack={onBack} />
        <Card pad={24} surface="light" glow={pillar.color} style={{ borderColor: `${pillar.color}55` }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14 }}>
            <VitalityGauge value={model.scores[domain] ?? 0} label={pillar.label} size={120} stroke={10} compact showBandLabel={false} theme="light" />
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

const VoedingScreen = ({ model, onBack }: { model: DashboardModel; onBack: () => void }) => {
  const premiumShownRef = useRef(false);

  useEffect(() => {
    if (premiumShownRef.current) {
      return;
    }
    premiumShownRef.current = true;
    trackEvent("dashboard_voeding_premium_upsell", { surface: "kompas_voeding" });
    clarityTag("dashboard_voeding_premium", "shown");
  }, []);

  const session: IntakeSessionPayload = {
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
  const recommendations = buildRecommendations(session);
  const pillar = PILLAR.voeding;

  return (
    <KompasLightPanel className="-mt-3 p-5">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <DomainBackBar onBack={onBack} />

        <Card pad={20} surface="light" glow={pillar.color} style={{ borderColor: `${pillar.color}55` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <VitalityGauge value={model.scores.voeding ?? 0} label="Voeding" size={86} stroke={8} compact showBandLabel={false} theme="light" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: pillar.color, marginBottom: 6 }}>
                Mediterraan
              </div>
              <div style={{ fontFamily: "var(--f-serif)", fontSize: 25, color: KOMPAS_LIGHT.text, lineHeight: 1.1 }}>
                Voeding
              </div>
              <p style={{ fontSize: 13.5, color: KOMPAS_LIGHT.muted, lineHeight: 1.5, margin: "6px 0 0", textWrap: "pretty" }}>
                Producten en supplementen, objectief gekozen op kwaliteit — niet op commissie.
              </p>
            </div>
          </div>
        </Card>

        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 16, border: `1px solid ${KOMPAS_LIGHT.innerBorder}`, background: "#fff" }}>
          <Icons.Search s={18} style={{ color: KOMPAS_LIGHT.subtle }} />
          <span style={{ flex: 1, fontSize: 14.5, color: KOMPAS_LIGHT.subtle }}>Zoek product of supplement</span>
          <SoonPill />
        </div>

        <section aria-label="Aanbevolen supplementen">
          <KompasSectionHeader eyebrow="Aanbevolen" title="Supplementen voor jou" />
          {recommendations.length > 0 ? (
            <Card pad={8} surface="light">
              <div style={{ display: "flex", flexDirection: "column" }}>
                {recommendations.map((rec, index) => {
                  const href = rec.comparisonHref ?? rec.guideHref;
                  return (
                    <Link
                      key={rec.slug}
                      href={href}
                      onClick={() => {
                        trackEvent("dashboard_voeding_supplement_click", { slug: rec.slug, target: href });
                        clarityTag("dashboard_voeding_supplement", rec.slug);
                      }}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 10px", textDecoration: "none", color: "inherit", borderTop: index ? `1px solid ${KOMPAS_LIGHT.innerBorder}` : "none" }}
                    >
                      <span style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: KOMPAS_LIGHT.innerBg, border: `1px solid ${KOMPAS_LIGHT.innerBorder}` }} aria-hidden>
                        {rec.icon}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "var(--f-serif)", fontSize: 16, color: KOMPAS_LIGHT.text, lineHeight: 1.2 }}>{rec.name}</div>
                        <div style={{ fontSize: 13, color: KOMPAS_LIGHT.muted, lineHeight: 1.5, marginTop: 2, textWrap: "pretty" }}>{rec.wiifm}</div>
                      </div>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 600, color: "var(--sage)", flexShrink: 0 }}>
                        Vergelijk <Icons.ChevronRight s={15} />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </Card>
          ) : (
            <Card pad={20} surface="light">
              <p style={{ fontSize: 14, color: KOMPAS_LIGHT.muted, lineHeight: 1.5, margin: 0 }}>
                Doe de check om persoonlijke aanbevelingen te zien.
              </p>
            </Card>
          )}
        </section>

        <section aria-label="Mediterrane producten">
          <KompasSectionHeader eyebrow="Mediterraan" title="Producten" action={<SoonPill />} />
          <Card pad={18} surface="light">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {MEDITERRANEAN_PRODUCTS.map((product) => (
                <div key={product.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 14, border: `1px solid ${KOMPAS_LIGHT.innerBorder}`, background: KOMPAS_LIGHT.innerBg }}>
                  <span style={{ fontSize: 22 }} aria-hidden>{product.icon}</span>
                  <span style={{ fontSize: 14.5, color: KOMPAS_LIGHT.text }}>{product.label}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
              <Icons.Shield s={13} style={{ color: "var(--sage)" }} />
              <span style={{ fontSize: 12.5, color: KOMPAS_LIGHT.muted, lineHeight: 1.5 }}>
                Binnenkort objectief vergeleken — net als onze supplementen.
              </span>
            </div>
          </Card>
        </section>

        <Card pad={20} surface="light" glow="#C8956C" style={{ borderColor: "rgba(200,149,108,0.35)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: KOMPAS_LIGHT.subtle }}>
              <Icons.Lock s={14} /> Premium
            </div>
            <div style={{ fontFamily: "var(--f-serif)", fontSize: 21, color: KOMPAS_LIGHT.text, lineHeight: 1.2 }}>
              kcal &amp; macro&apos;s bijhouden
            </div>
            <p style={{ fontSize: 14, color: KOMPAS_LIGHT.muted, lineHeight: 1.6, margin: 0, textWrap: "pretty" }}>
              Liever tóch calorieën en macro&apos;s volgen, met persoonlijke doelen? Dat komt in de premium-versie.
            </p>
            <SoonPill />
          </div>
        </Card>

        <Link
          href="/inzichten"
          onClick={() => trackEvent("dashboard_voeding_leefstijl_click", { surface: "kompas_voeding" })}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderRadius: 16, border: `1px solid ${KOMPAS_LIGHT.innerBorder}`, background: "#fff", textDecoration: "none", color: "inherit" }}
        >
          <Icons.BookOpen s={18} style={{ color: "var(--sage)", flexShrink: 0 }} />
          <span style={{ flex: 1, fontFamily: "var(--f-serif)", fontSize: 16, color: KOMPAS_LIGHT.text }}>Leefstijl &amp; inzichten</span>
          <Icons.ChevronRight s={18} style={{ color: KOMPAS_LIGHT.subtle, flexShrink: 0 }} />
        </Link>
      </div>
    </KompasLightPanel>
  );
};

const KompasHome = ({ model }: SharedSectionProps) => {
  const currentModel = model as DashboardModel | null;
  const [view, setView] = useState<KompasView | null>(null);

  if (!currentModel) {
    return null;
  }

  const openDomain = (domain: PillarId) => {
    trackEvent("dashboard_kompas_domain_open", { domain });
    clarityTag("dashboard_kompas_domain", domain);
    setView(domain);
  };

  const openActiviteiten = () => {
    trackEvent("dashboard_kompas_activiteiten_open", { surface: "kompas_home" });
    clarityTag("dashboard_kompas_view", "activiteiten");
    setView("activiteiten");
  };

  const openTrend = () => {
    trackEvent("dashboard_kompas_trend_open", { surface: "kompas_home" });
    clarityTag("dashboard_kompas_view", "trend");
    setView("trend");
  };

  if (view === "voeding") {
    return <VoedingScreen model={currentModel} onBack={() => setView(null)} />;
  }
  if (view === "activiteiten") {
    return (
      <KompasSoonScreen
        onBack={() => setView(null)}
        title="Activiteiten logboek"
        body="Log dagelijks wat je deed — wandeling, stretching, alcoholvrije avond. Zo zie je of je leefstijl-stappen blijven hangen."
        teaser={currentModel.activeHabit?.title ?? null}
      />
    );
  }
  if (view === "trend") {
    return (
      <KompasSoonScreen
        onBack={() => setView(null)}
        title="Trend — levenslijn urgentie"
        body="Je levenslijn laat zien hoe je prioriteit en urgentie verschuiven over checks — zodat je ziet of het werkt."
        showChartPlaceholder
      />
    );
  }
  if (view) {
    return (
      <DomainSoonScreen
        model={currentModel}
        domain={view}
        onBack={() => setView(null)}
      />
    );
  }

  return (
    <section aria-label="Kompas" className="kompas-loose-stack -mt-2 flex flex-col gap-4">
      <KompasLooseCard>
        <h2
          className="m-0 text-[18px] leading-tight text-[#1c1917]"
          style={{ fontFamily: "var(--f-serif)" }}
        >
          Je domeinen
        </h2>
        <div className="mt-3 flex flex-col gap-2.5">
          {PILLARS.map((pillar) => {
            const score = currentModel.scores[pillar.id] ?? 0;
            return (
              <KompasDomainRow
                key={pillar.id}
                label={pillar.label}
                score={score}
                color={pillar.color}
                isPriority={pillar.id === currentModel.priority.id}
                onClick={() => openDomain(pillar.id)}
              />
            );
          })}
        </div>
      </KompasLooseCard>

      <KompasLooseCard>
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#78716c]">
          Log &amp; inzicht
        </div>
        <div className="flex flex-col gap-2.5">
          <KompasRowCard
            ariaLabel="Open activiteiten logboek"
            onClick={openActiviteiten}
            title="Activiteiten logboek"
            subtitle="Wat deed je vandaag?"
            leading={<Icons.Activity s={22} style={{ color: "var(--sage)" }} />}
          />
          <KompasRowCard
            ariaLabel="Open trend levenslijn"
            onClick={openTrend}
            title="Trend — levenslijn urgentie"
            subtitle="Hoe verschuift je prioriteit?"
            leading={<Icons.TrendUp s={22} style={{ color: "var(--sage)" }} />}
          />
        </div>
      </KompasLooseCard>
    </section>
  );
};

const EMPTY_SECTIONS: DashboardSectionType[] = ["vitalityScore"];

const SECTION_RENDERERS: Record<
  DashboardSectionType,
  (props: SharedSectionProps) => ReactElement | null
> = {
  now: (props) => <NowSection {...props} />,
  vitalityScore: (props) => <VitalityScoreSection {...props} />,
  priority: (props) => (props.empty ? null : <PrioritySection {...props} />),
  plan: (props) => (props.empty ? null : <PlanSection {...props} />),
  kompasHome: (props) => (props.empty ? null : <KompasHome {...props} />),
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
    props.empty ? null : (
      <VoortgangHub
        model={props.model}
        data={props.data}
        isMember={props.isMember}
        tab={props.tab}
        screen={props.voortgangScreen}
        unlockedStatistics={
          <>
            <SignalsSection {...props} />
            <NutritionIntakeSection {...props} />
            <HistorySection {...props} />
          </>
        }
        onScreenChange={props.onVoortgangScreenChange}
      />
    ),
  future: () => <FutureSection />,
};

const DashTabHeader = ({ tab }: { tab: DashboardTab }) => (
  <div style={{ marginBottom: 20 }}>
    <div
      style={{
        fontFamily: "var(--f-serif)",
        fontSize: 26,
        color: "var(--text)",
        lineHeight: 1.15,
      }}
    >
      {tab.title}
    </div>
    <div
      style={{
        fontSize: 14,
        color: "var(--text-muted)",
        marginTop: 6,
        lineHeight: 1.5,
        textWrap: "pretty",
      }}
    >
      {tab.subtitle}
    </div>
  </div>
);

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

const DashTabBar = ({
  tab,
  onSelect,
}: {
  tab: DashboardTabId;
  onSelect: (id: DashboardTabId) => void;
}) => (
  <nav
    aria-label="Dashboard-navigatie"
    style={{
      position: "fixed",
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 20,
      display: "flex",
      justifyContent: "center",
      background: "rgba(16,26,16,0.92)",
      backdropFilter: "blur(12px)",
      borderTop: "1px solid var(--panel-border)",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}
  >
    <div style={{ display: "flex", width: "100%", maxWidth: 600 }}>
      {DASHBOARD_TABS.map((t) => {
        const Icon = Icons[t.icon];
        const active = t.id === tab;
        return (
          <button
            key={t.id}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => onSelect(t.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "9px 4px 11px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: active ? "var(--sage)" : "var(--text-muted)",
              fontFamily: "var(--f-sans)",
            }}
          >
            <Icon s={20} />
            <span style={{ fontSize: 11, fontWeight: active ? 600 : 500 }}>
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  </nav>
);

export default function Dashboard({
  empty,
  data,
  isMember = false,
  initialTab,
  initialVoortgangScreen,
}: DashboardProps) {
  const router = useRouter();
  const [tab, setTab] = useState<DashboardTabId>(
    initialTab ?? (empty ? "voortgang" : "vandaag"),
  );
  const [voortgangScreen, setVoortgangScreen] = useState<VoortgangScreen>(
    initialVoortgangScreen ?? "hub",
  );
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
          )
        : null,
    [empty, data],
  );

  const tabMeta = DASHBOARD_TABS.find((t) => t.id === tab) ?? DASHBOARD_TABS[0];
  const allowedTypes = TAB_SECTIONS[tab];
  const sectionTypes = empty
    ? allowedTypes.filter((type) => EMPTY_SECTIONS.includes(type))
    : allowedTypes;

  const selectTab = (nextTab: DashboardTabId) => {
    if (nextTab !== "voortgang") {
      setVoortgangScreen("hub");
    }
    setTab(nextTab);
  };

  const onCheck = () => {
    if (empty) {
      router.push("/intake");
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
    router.push(`${route}?from=dashboard`);
  };
  const onRemeasure = () => {
    router.push("/intake?from=dashboard");
  };

  const sharedProps: SharedSectionProps = {
    empty,
    model,
    data,
    isMember,
    tab,
    onCheck,
    onDashboardCheckin,
    onRemeasure,
    onGoVandaag: () => selectTab("vandaag"),
    voortgangScreen,
    onVoortgangScreenChange: setVoortgangScreen,
    onOpenInzichten: () => setVoortgangScreen("inzichten"),
  };

  const isVoortgangDetail = tab === "voortgang" && voortgangScreen !== "hub";
  const isVoortgangHubDarkFooter = tab === "voortgang" && voortgangScreen === "hub";

  const surfaceClass =
    tab === "vandaag"
      ? "ps-dash-surface-kompas"
      : isVoortgangDetail
        ? "ps-dash-surface-voortgang-detail"
        : tab === "voortgang"
          ? "ps-dash-surface-voortgang"
          : "";

  return (
    <div className={`min-h-dvh ${surfaceClass}`}>
      <main
        style={{
          width: "100%",
          maxWidth: 600,
          margin: "0 auto",
          padding:
            "clamp(20px, 4vh, 36px) 18px calc(96px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <DashHeader onLogout={onLogout} />
        {tab === "vandaag" ? (
          <Greeting empty={empty} model={model} />
        ) : tab !== "voortgang" ? (
          <DashTabHeader tab={tabMeta} />
        ) : null}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {empty && tab !== "voortgang" ? (
            <EmptyTabState tab={tabMeta} onCheck={onCheck} />
          ) : sectionTypes.length === 0 ? null : (
            sectionTypes.map((type) => (
              <section key={type}>
                {SECTION_RENDERERS[type](sharedProps)}
              </section>
            ))
          )}
        </div>
        <footer
          className={tab === "voortgang" ? "ps-dash-footer-voortgang" : undefined}
          style={{
            marginTop: 28,
            textAlign: "center",
            fontSize: 11.5,
            color: isVoortgangHubDarkFooter
              ? "rgba(255,255,255,0.55)"
              : "var(--text-subtle)",
            lineHeight: 1.6,
          }}
        >
          <Link
            href="/hoe-werkt-dashboard"
            style={{
              color: isVoortgangHubDarkFooter
                ? "rgba(255,255,255,0.72)"
                : "var(--text-muted)",
              textDecoration: "underline",
              textUnderlineOffset: 2,
            }}
          >
            Hoe werkt dit dashboard?
          </Link>
          <br />
          PerfectSupplement geeft adviezen op basis van leefstijl, geen medische
          diagnoses.
          <br />
          Je scores zijn een reflectie van je eigen antwoorden — geen medische
          meetwaarden.
          <br />
          Je gegevens zijn van jou — exporteer of verwijder ze wanneer je wilt.
        </footer>
      </main>
      <DashTabBar tab={tab} onSelect={selectTab} />
    </div>
  );
}
