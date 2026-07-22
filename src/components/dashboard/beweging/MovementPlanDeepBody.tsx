"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MovementStartChoice from "@/components/dashboard/beweging/MovementStartChoice";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import MovementWeekCategoryPanel from "@/components/intake/MovementWeekCategoryPanel";
import { movementPlanTemplate } from "@/data/lifestyle-plans/movement";
import { PILLAR } from "@/data/dashboard";
import {
  getMovementSessionCatalogEntry,
  MOVEMENT_FREQUENCY_OPTIONS,
  MOVEMENT_SPORT_OPTIONS,
  resolveRecommendedSessionVariant,
} from "@/data/movement/session-catalog";
import type { DomainScores } from "@/lib/intake-engine";
import { clarityTag } from "@/lib/clarity";
import { getCachedDailyLog, setCachedDailyLog } from "@/lib/daily-log-client";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { trackEvent } from "@/lib/ga4";
import {
  buildPlanIntakeContext,
  computeCurrentPhaseId,
  selectVisibleSteps,
} from "@/lib/lifestyle-plan-eval";
import { buildMovementDailyRhythm } from "@/lib/movement-daily-rhythm";
import { buildMovementNutrientBridge } from "@/lib/movement-nutrient-bridge";
import {
  buildExecutionStepStateGetter,
  mergeLoggedStepIds,
} from "@/lib/movement-plan-execution";
import {
  parseMovementPlanProfile,
  resolveEffectivePlanProfile,
  type MovementPlanProfile,
} from "@/lib/movement-plan-profile";
import {
  buildMovementRecoveryHint,
  buildMovementRecoveryInput,
} from "@/lib/movement-recovery-hint";
import {
  MOVEMENT_START_PATTERN_OPTIONS,
  startPatternLabel,
} from "@/lib/movement-prefs";
import { buildDashboardVandaagHref } from "@/lib/dashboard-url";
import type {
  PlanStep,
  PlanStepLink,
  PlanStepState,
} from "@/types/lifestyle-plan";
import type { NutrientBridgeItem } from "@/lib/movement-nutrient-bridge";

export type MovementPlanDeepBodyProps = {
  scores: DomainScores;
  answers: Record<string, number>;
  sessionId: string | null;
  navMode?: "dashboard_view" | "intake_route";
};

const HORIZON_LABELS = {
  "deze-week": "Deze week",
  "week-2-4": "Week 2–4",
  "week-4-12": "Week 4–12",
} as const;

function PlanStepReadOnlyRow({
  step,
  state,
}: {
  step: PlanStep;
  state: PlanStepState;
}) {
  const done = state === "done";
  return (
    <li className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
            done
              ? "bg-[color:var(--ac)]/25 text-[color:var(--ac)]"
              : "border border-white/15 text-transparent"
          }`}
          aria-hidden
        >
          {done ? "✓" : ""}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm leading-relaxed ${
              done ? "text-[#9FB0A6] line-through" : "text-[#E7EDE8]"
            }`}
          >
            {step.title}
          </p>
          {step.rationale?.body ? (
            <p className="mt-1 text-xs leading-relaxed text-[#9FB0A6]">
              {step.rationale.body}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export default function MovementPlanDeepBody({
  scores,
  answers,
  sessionId,
  navMode = "dashboard_view",
}: MovementPlanDeepBodyProps) {
  const accent = PILLAR.beweging.color;

  const [profile, setProfile] = useState<MovementPlanProfile>(() =>
    resolveEffectivePlanProfile(parseMovementPlanProfile({}), answers.MOV_STR),
  );
  const [rcvFeel, setRcvFeel] = useState<number | null>(null);
  const [loggedStepIds, setLoggedStepIds] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [profileEditing, setProfileEditing] = useState(profile.startPattern == null);
  const [prefsBusy, setPrefsBusy] = useState(false);
  const viewedRef = useRef(false);

  const ctx = useMemo(
    () => buildPlanIntakeContext(scores, answers, "movement"),
    [scores, answers],
  );

  const phaseStepStates = useMemo(
    () =>
      Object.fromEntries(
        [...loggedStepIds].map((id) => [id, { state: "done" as const }]),
      ),
    [loggedStepIds],
  );

  const currentPhaseId = useMemo(
    () => computeCurrentPhaseId(movementPlanTemplate.phases, ctx, phaseStepStates),
    [ctx, phaseStepStates],
  );

  const activePhaseIndex = useMemo(
    () => movementPlanTemplate.phases.findIndex((phase) => phase.id === currentPhaseId),
    [currentPhaseId],
  );

  const [expandedPhaseIds, setExpandedPhaseIds] = useState<Set<string>>(() => new Set());
  const [trackedActivePhaseId, setTrackedActivePhaseId] = useState("");

  if (currentPhaseId !== trackedActivePhaseId) {
    setTrackedActivePhaseId(currentPhaseId);
    if (currentPhaseId && !expandedPhaseIds.has(currentPhaseId)) {
      setExpandedPhaseIds((prev) => new Set([...prev, currentPhaseId]));
    }
  }

  const recoveryHint = useMemo(
    () =>
      buildMovementRecoveryHint(
        buildMovementRecoveryInput(scores, answers, rcvFeel ?? undefined),
      ),
    [scores, answers, rcvFeel],
  );

  const nutrientBridgeItems = useMemo(
    () => buildMovementNutrientBridge(ctx),
    [ctx],
  );

  const dailyRhythm = useMemo(() => buildMovementDailyRhythm(ctx), [ctx]);

  const effectiveProfile = useMemo(
    () => resolveEffectivePlanProfile(profile, answers.MOV_STR),
    [profile, answers.MOV_STR],
  );

  const recommendedVariant = useMemo(
    () =>
      resolveRecommendedSessionVariant({
        startPattern: effectiveProfile.startPattern,
        movStr: answers.MOV_STR,
        preferredSport: effectiveProfile.preferredSport,
      }),
    [effectiveProfile, answers.MOV_STR],
  );

  const sessionEntry = getMovementSessionCatalogEntry(recommendedVariant);

  const getStepState = useMemo(
    () => buildExecutionStepStateGetter(loggedStepIds),
    [loggedStepIds],
  );

  useEffect(() => {
    if (viewedRef.current) {
      return;
    }
    viewedRef.current = true;
    emitIntakeClientEvent("plan.viewed", {
      domain: "movement",
      template_version: movementPlanTemplate.version,
      surface: "dashboard_plan_configurator",
      nav_context: navMode,
    });
    trackEvent("dashboard_beweging_plan_click", {
      surface: "plan_configurator_mount",
      nav_mode: navMode === "dashboard_view" ? "dashboard_view" : "cross_route",
    });
    clarityTag("plan_surface", "dashboard_configurator");
    clarityTag("dashboard_kompas_view", "stappenplan_embed");
  }, [navMode]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const cached = getCachedDailyLog("beweging");
        const [planRes, todayRes, weekRes, prefsRes] = await Promise.all([
          sessionId
            ? fetch("/api/intake/plan?domain=movement", {
                credentials: "include",
                cache: "no-store",
              })
            : Promise.resolve(null),
          fetch("/api/account/daily-log?domain=beweging", {
            credentials: "include",
          }),
          fetch("/api/account/daily-log?domain=beweging&range=7", {
            credentials: "include",
          }),
          fetch("/api/account/movement-prefs", { credentials: "include" }),
        ]);

        if (cancelled) {
          return;
        }

        if (planRes?.ok) {
          const planJson = (await planRes.json()) as {
            recoveryContext?: { rcvFeel: number | null };
          };
          setRcvFeel(planJson.recoveryContext?.rcvFeel ?? null);
        }

        const todayKeys: string[] = [];
        if (todayRes.ok) {
          const todayJson = (await todayRes.json()) as { keys: string[]; streak: number };
          todayKeys.push(...todayJson.keys);
          setCachedDailyLog("beweging", todayJson);
        } else if (cached) {
          todayKeys.push(...cached.keys);
        }

        let weekKeys: string[] = [];
        if (weekRes.ok) {
          const weekJson = (await weekRes.json()) as { keys?: string[] };
          weekKeys = weekJson.keys ?? [];
        }

        if (prefsRes.ok) {
          const prefsJson = (await prefsRes.json()) as MovementPlanProfile;
          setProfile(resolveEffectivePlanProfile(prefsJson, answers.MOV_STR));
          setProfileEditing(prefsJson.startPattern == null);
        }

        setLoggedStepIds(mergeLoggedStepIds(todayKeys, weekKeys));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, answers.MOV_STR]);

  const saveProfilePatch = useCallback(
    async (patch: Record<string, unknown>) => {
      setPrefsBusy(true);
      try {
        const response = await fetch("/api/account/movement-prefs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(patch),
        });
        if (!response.ok) {
          return;
        }
        const next = (await response.json()) as MovementPlanProfile & { ok: boolean };
        setProfile(resolveEffectivePlanProfile(next, answers.MOV_STR));
        trackEvent("movement_plan_profile_updated", {
          surface: "dashboard_plan_configurator",
        });
      } finally {
        setPrefsBusy(false);
      }
    },
    [answers.MOV_STR],
  );

  const renderStepRow = useCallback(
    (
      step: PlanStep,
      options?: { showRationale?: boolean; variant?: "primary" | "alternative" },
    ) => (
      <PlanStepReadOnlyRow
        key={`${step.id}-${options?.variant ?? "primary"}`}
        step={step}
        state={getStepState(step.id)}
      />
    ),
    [getStepState],
  );

  const handleLinkClick = useCallback((stepId: string, link: PlanStepLink) => {
    emitIntakeClientEvent("plan.step_link_clicked", {
      domain: "movement",
      step_id: stepId,
      link_kind: link.kind,
      surface: "dashboard_plan_configurator",
    });
  }, []);

  const handleBridgeItemClick = useCallback((item: NutrientBridgeItem) => {
    emitIntakeClientEvent("plan.step_link_clicked", {
      domain: "movement",
      step_id: item.id,
      link_kind: item.kind,
      surface: "nutrient_bridge",
    });
  }, []);

  return (
    <div className="w-full pb-8" style={{ ["--ac" as string]: accent }}>
      <header className="mb-4">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
          Jouw stappenplan · beweging
        </p>
        <h2 className="font-serif text-[22px] font-normal leading-tight text-[#F1EFE8]">
          {movementPlanTemplate.title}
        </h2>
      </header>

      <div className="space-y-3">
        {profileEditing ? (
          <MovementStartChoice
            onSaved={(prefs) => {
              setProfile(
                resolveEffectivePlanProfile({ ...profile, ...prefs }, answers.MOV_STR),
              );
              setProfileEditing(false);
            }}
            onSkip={() => setProfileEditing(false)}
          />
        ) : (
          <CockpitTile eyebrow="Jouw planprofiel">
            <div className="mt-2 space-y-3">
              <p className="text-[14px] leading-relaxed text-[#CDD7D0]">
                {effectiveProfile.startPattern
                  ? `Spoor: ${startPatternLabel(effectiveProfile.startPattern)}`
                  : "Kies je startspoor om je plan te personaliseren."}
                {sessionEntry
                  ? ` · Aanbevolen: ${sessionEntry.label}, ${sessionEntry.frequency}`
                  : null}
              </p>

              <div className="flex flex-wrap gap-2">
                {MOVEMENT_START_PATTERN_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    disabled={prefsBusy}
                    onClick={() => void saveProfilePatch({ startPattern: option.id })}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors disabled:opacity-60 ${
                      effectiveProfile.startPattern === option.id
                        ? "border-[color:var(--ac)]/60 bg-[color:var(--ac)]/15 text-[#F1EFE8]"
                        : "border-white/15 text-[#CDD7D0] hover:border-white/25"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {effectiveProfile.startPattern &&
              effectiveProfile.startPattern !== "dagelijks_ritme" ? (
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9FB0A6]">
                    Trainingsvorm
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {MOVEMENT_SPORT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        disabled={prefsBusy}
                        onClick={() => void saveProfilePatch({ preferredSport: option.id })}
                        className={`cursor-pointer rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors disabled:opacity-60 ${
                          effectiveProfile.preferredSport === option.id
                            ? "border-[color:var(--ac)]/60 bg-[color:var(--ac)]/15 text-[#F1EFE8]"
                            : "border-white/15 text-[#CDD7D0] hover:border-white/25"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {effectiveProfile.startPattern &&
              effectiveProfile.startPattern !== "dagelijks_ritme" ? (
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9FB0A6]">
                    Frequentie
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {MOVEMENT_FREQUENCY_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        disabled={prefsBusy}
                        onClick={() => void saveProfilePatch({ weeklyFrequency: option.id })}
                        className={`cursor-pointer rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors disabled:opacity-60 ${
                          effectiveProfile.weeklyFrequency === option.id
                            ? "border-[color:var(--ac)]/60 bg-[color:var(--ac)]/15 text-[#F1EFE8]"
                            : "border-white/15 text-[#CDD7D0] hover:border-white/25"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => setProfileEditing(true)}
                className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-medium text-[#9FB0A6]"
              >
                Wijzig startspoor of doel →
              </button>
            </div>
          </CockpitTile>
        )}

        {sessionEntry ? (
          <CockpitTile eyebrow="Aanbevolen programma">
            <h3 className="mt-1 font-serif text-[18px] text-[#F1EFE8]">{sessionEntry.label}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-[#CDD7D0]">{sessionEntry.goal}</p>
            <dl className="mt-3 grid gap-2 text-[12px] text-[#9FB0A6] sm:grid-cols-3">
              <div>
                <dt className="uppercase tracking-[0.08em]">Duur</dt>
                <dd className="mt-0.5 text-[#E7EDE8]">{sessionEntry.durationMin}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.08em]">Frequentie</dt>
                <dd className="mt-0.5 text-[#E7EDE8]">{sessionEntry.frequency}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.08em]">Intensiteit</dt>
                <dd className="mt-0.5 text-[#E7EDE8]">{sessionEntry.intensity}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[13px] leading-relaxed text-[#CDD7D0]">
              {sessionEntry.structure}
            </p>
            {sessionEntry.detailStatus === "coming_soon" ? (
              <p className="mt-2 text-[12px] text-[#9FB0A6]">
                Gedetailleerde sessie-opbouw volgt — je weekdoel staat al klaar.
              </p>
            ) : null}
          </CockpitTile>
        ) : null}

        <div className="rounded-2xl border border-[color:var(--ac)]/30 bg-[color:var(--ac)]/10 px-4 py-3">
          <p className="text-[13px] leading-relaxed text-[#E7EDE8]">
            Afvinken doe je in{" "}
            <Link
              href={buildDashboardVandaagHref("beweging")}
              className="font-semibold text-[color:var(--ac)] underline decoration-[color:var(--ac)]/40 underline-offset-2"
            >
              VANDAAG op je dashboard
            </Link>
            . Hier stel je je plan in en zie je je voortgang.
          </p>
        </div>
      </div>

      <section className="mt-6" aria-label="Planfases">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {movementPlanTemplate.phases.map((phase, index) => {
            const isActive = index === activePhaseIndex;
            const isLocked = index > activePhaseIndex;
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => setExpandedPhaseIds((prev) => new Set([...prev, phase.id]))}
                className={`shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                  isActive
                    ? "border-[color:var(--ac)]/50 bg-[color:var(--ac)]/15 text-[#F1EFE8]"
                    : isLocked
                      ? "border-white/10 text-[#7E8C82]"
                      : "border-white/15 text-[#CDD7D0]"
                }`}
              >
                {HORIZON_LABELS[phase.horizon]}
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {movementPlanTemplate.phases.map((phase, phaseIndex) => {
            if (!expandedPhaseIds.has(phase.id)) {
              return null;
            }
            const visibleSteps = selectVisibleSteps(phase, ctx);
            const isActive = phaseIndex === activePhaseIndex;
            const isLocked = phaseIndex > activePhaseIndex;

            return (
              <article
                key={phase.id}
                id={`phase-section-${phase.id}`}
                className="rounded-2xl border border-white/10 bg-[#131F1D]/90 p-5"
              >
                <header className="mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9FB0A6]">
                    {HORIZON_LABELS[phase.horizon]}
                    {isActive ? " · nu actief" : isLocked ? " · preview" : " · afgerond"}
                  </p>
                  <h3 className="mt-1 font-serif text-[20px] text-[#F1EFE8]">{phase.title}</h3>
                  {phase.intro?.body ? (
                    <p className="mt-2 text-[13px] leading-relaxed text-[#CDD7D0]">
                      {phase.intro.body}
                    </p>
                  ) : null}
                </header>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <MovementWeekCategoryPanel
                    phaseId={phase.id}
                    domain="movement"
                    templateVersion={movementPlanTemplate.version}
                    ctx={ctx}
                    visibleSteps={visibleSteps}
                    dailyRhythm={dailyRhythm}
                    nutrientBridgeItems={nutrientBridgeItems}
                    readOnly={!isActive}
                    recoveryHint={recoveryHint}
                    variant="cockpit"
                    getStepState={getStepState}
                    renderStepRow={renderStepRow}
                    onBridgeItemClick={handleBridgeItemClick}
                    onLinkClick={handleLinkClick}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="mt-6 rounded-2xl border border-white/10 bg-[#131F1D]/80 px-5 py-4">
        <h3 className="font-serif text-[18px] text-[#F1EFE8]">
          {movementPlanTemplate.mechanism.heading}
        </h3>
        {movementPlanTemplate.mechanism.body.split("\n\n").map((paragraph, index) => (
          <p
            key={`mechanism-${index}`}
            className="mt-3 text-[13px] leading-relaxed text-[#CDD7D0]"
          >
            {paragraph}
          </p>
        ))}
        <p className="mt-3 text-[12px] text-[#9FB0A6]">{movementPlanTemplate.mechanism.source}</p>
      </aside>

      <aside className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
        <h3 className="text-sm font-semibold text-[#F1EFE8]">
          {movementPlanTemplate.medicalBoundary.heading}
        </h3>
        {movementPlanTemplate.medicalBoundary.body.split("\n\n").map((paragraph, index) => (
          <p
            key={`medical-${index}`}
            className="mt-2 text-[13px] leading-relaxed text-[#CDD7D0]"
          >
            {paragraph}
          </p>
        ))}
      </aside>

      {loading ? (
        <p className="mt-4 text-sm text-[#9FB0A6]" aria-live="polite">
          Voortgang laden…
        </p>
      ) : null}
    </div>
  );
}
