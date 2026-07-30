"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MovementPlanAdjustSheet from "@/components/dashboard/beweging/MovementPlanAdjustSheet";
import MovementPlanRoadmap from "@/components/dashboard/beweging/MovementPlanRoadmap";
import MovementProgramCard from "@/components/dashboard/beweging/MovementProgramCard";
import MovementSportLens from "@/components/dashboard/beweging/MovementSportLens";
import MovementStartChoice from "@/components/dashboard/beweging/MovementStartChoice";
import MovementWeekCategoryPanel from "@/components/intake/MovementWeekCategoryPanel";
import { movementPlanTemplate } from "@/data/lifestyle-plans/movement";
import { PILLAR } from "@/data/dashboard";
import {
  getMovementSessionCatalogEntry,
  resolveRecommendedSessionVariant,
} from "@/data/movement/session-catalog";
import type { DomainScores } from "@/lib/intake-engine";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import { getCachedDailyLog, setCachedDailyLog } from "@/lib/daily-log-client";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { trackEvent } from "@/lib/ga4";
import {
  buildPlanIntakeContext,
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
import { buildMovementPlanRoadmapView } from "@/lib/movement-plan-roadmap";
import {
  buildMovementRecoveryHint,
  buildMovementRecoveryInput,
} from "@/lib/movement-recovery-hint";
import { buildDashboardVandaagHref } from "@/lib/dashboard-url";
import type {
  PlanStep,
  PlanStepLink,
  PlanStepState,
  PlanProgress,
} from "@/types/lifestyle-plan";
import type { NutrientBridgeItem } from "@/lib/movement-nutrient-bridge";

export type MovementPlanDeepBodyProps = {
  scores: DomainScores;
  answers: Record<string, number>;
  sessionId: string | null;
  navMode?: "dashboard_view" | "intake_route";
  /** Lock 5: gedeelde route-positie uit daily-log (model.movementPlanProgress). */
  routeProgress?: PlanProgress | null;
  remeasureLine?: string | null;
  onOpenProgramma?: () => void;
};

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
  routeProgress = null,
  remeasureLine = null,
  onOpenProgramma,
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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [progHot, setProgHot] = useState(false);
  const viewedRef = useRef(false);

  const ctx = useMemo(
    () => buildPlanIntakeContext(scores, answers, "movement"),
    [scores, answers],
  );

  const currentPhaseId =
    routeProgress?.currentPhaseId ??
    movementPlanTemplate.phases[0]?.id ??
    "";

  const [openPhaseId, setOpenPhaseId] = useState("");
  const [trackedActivePhaseId, setTrackedActivePhaseId] = useState("");

  if (currentPhaseId !== trackedActivePhaseId) {
    setTrackedActivePhaseId(currentPhaseId);
    setOpenPhaseId(currentPhaseId);
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
        trainingLocation: effectiveProfile.trainingLocation,
        preferredSport: effectiveProfile.preferredSport,
      }),
    [effectiveProfile, answers.MOV_STR],
  );

  const sessionEntry = getMovementSessionCatalogEntry(recommendedVariant);

  const getStepState = useMemo(
    () => buildExecutionStepStateGetter(loggedStepIds),
    [loggedStepIds],
  );

  const roadmapView = useMemo(
    () =>
      buildMovementPlanRoadmapView({
        ctx,
        currentPhaseId,
        profile: effectiveProfile,
        getStepState,
        remeasureLine,
      }),
    [ctx, currentPhaseId, effectiveProfile, getStepState, remeasureLine],
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
        if ("trainingLocation" in patch) {
          setProgHot(true);
          trackEvent("movement_location_selected", {
            location: String(patch.trainingLocation),
            surface: "plan_sheet",
          });
          emitAccountClientEvent("movement.location_selected", {
            location: String(patch.trainingLocation),
            surface: "plan_sheet",
          });
          clarityTag("movement_location", String(patch.trainingLocation));
        }
        trackEvent("movement_plan_profile_updated", {
          surface: "dashboard_plan_configurator",
        });
      } finally {
        setPrefsBusy(false);
      }
    },
    [answers.MOV_STR],
  );

  const toggleSport = useCallback(
    (sportId: string) => {
      setProfile((current) => {
        const effective = resolveEffectivePlanProfile(current, answers.MOV_STR);
        const has = effective.sports.includes(sportId);
        const nextSports = has
          ? effective.sports.filter((id) => id !== sportId)
          : effective.sports.length >= 3
            ? effective.sports
            : [...effective.sports, sportId];
        void saveProfilePatch({ sports: nextSports });
        return { ...current, sports: nextSports };
      });
    },
    [answers.MOV_STR, saveProfilePatch],
  );

  const renderStepRow = useCallback(
    (step: PlanStep) => (
      <PlanStepReadOnlyRow key={step.id} step={step} state={getStepState(step.id)} />
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

  const handleOpenPhase = useCallback(
    (phaseId: string) => {
      if (phaseId === openPhaseId) {
        return;
      }
      setOpenPhaseId(phaseId);
      emitIntakeClientEvent("plan.phase_opened", {
        domain: "movement",
        phase_id: phaseId,
        is_active: phaseId === currentPhaseId,
        template_version: movementPlanTemplate.version,
      });
      clarityTag(
        "plan_phase_opened",
        phaseId === currentPhaseId ? "active" : "other_phase",
      );
    },
    [currentPhaseId, openPhaseId],
  );

  const renderPhaseBody = useCallback(
    (phaseId: string) => {
      const phase = movementPlanTemplate.phases.find(
        (entry) => entry.id === phaseId,
      );
      if (!phase) {
        return null;
      }
      return (
        <MovementWeekCategoryPanel
          phaseId={phase.id}
          domain="movement"
          templateVersion={movementPlanTemplate.version}
          ctx={ctx}
          visibleSteps={selectVisibleSteps(phase, ctx)}
          dailyRhythm={dailyRhythm}
          nutrientBridgeItems={nutrientBridgeItems}
          readOnly={phase.id !== currentPhaseId}
          recoveryHint={recoveryHint}
          variant="cockpit"
          getStepState={getStepState}
          renderStepRow={renderStepRow}
          onBridgeItemClick={handleBridgeItemClick}
          onLinkClick={handleLinkClick}
        />
      );
    },
    [
      ctx,
      currentPhaseId,
      dailyRhythm,
      getStepState,
      handleBridgeItemClick,
      handleLinkClick,
      nutrientBridgeItems,
      recoveryHint,
      renderStepRow,
    ],
  );

  return (
    <div className="@container w-full pb-8" style={{ ["--ac" as string]: accent }}>
      <div className="mx-auto w-full max-w-[1040px] @[1080px]:max-w-[1340px]">
        {profileEditing ? (
          <div className="mb-5">
            <MovementStartChoice
              onSaved={(prefs) => {
                setProfile(
                  resolveEffectivePlanProfile({ ...profile, ...prefs }, answers.MOV_STR),
                );
                setProfileEditing(false);
              }}
              onSkip={() => setProfileEditing(false)}
            />
          </div>
        ) : null}

        <MovementPlanRoadmap
          view={roadmapView}
          openPhaseId={openPhaseId}
          onOpenPhase={handleOpenPhase}
          vandaagHref={buildDashboardVandaagHref("beweging")}
          renderPhaseBody={renderPhaseBody}
          beforePhase={
            <>
              {sessionEntry ? (
                <MovementProgramCard
                  entry={sessionEntry}
                  sportUnchanged={!progHot}
                  onOpenProgramma={onOpenProgramma}
                />
              ) : null}
              <MovementSportLens
                sports={effectiveProfile.sports}
                busy={prefsBusy}
                onToggleSport={toggleSport}
              />
            </>
          }
          afterPhase={
            <>
              <MovementPlanAdjustSheet
                open={sheetOpen}
                profile={effectiveProfile}
                busy={prefsBusy}
                onOpen={() => setSheetOpen(true)}
                onClose={() => setSheetOpen(false)}
                onSave={(patch) => void saveProfilePatch(patch)}
              />
              {!profileEditing ? (
                <button
                  type="button"
                  onClick={() => setProfileEditing(true)}
                  className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-medium text-[#9FB0A6]"
                >
                  Wijzig startspoor of doel →
                </button>
              ) : null}
            </>
          }
          footer={
            <div className="space-y-3 pt-3">
              <aside className="rounded-2xl border border-white/10 bg-[#131F1D]/80 px-5 py-4">
                <h3 className="font-serif text-[18px] text-[#F1EFE8]">
                  {movementPlanTemplate.mechanism.heading}
                </h3>
                {movementPlanTemplate.mechanism.body
                  .split("\n\n")
                  .map((paragraph, index) => (
                    <p
                      key={`mechanism-${index}`}
                      className="mt-3 max-w-[68ch] text-[13px] leading-relaxed text-[#CDD7D0]"
                    >
                      {paragraph}
                    </p>
                  ))}
                <p className="mt-3 text-[12px] text-[#9FB0A6]">
                  {movementPlanTemplate.mechanism.source}
                </p>
              </aside>

              {loading ? (
                <p className="text-sm text-[#9FB0A6]" aria-live="polite">
                  Voortgang laden…
                </p>
              ) : null}
            </div>
          }
        />
      </div>
    </div>
  );
}
