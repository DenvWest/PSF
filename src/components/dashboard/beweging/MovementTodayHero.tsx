"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import * as Icons from "@/components/app/icons";
import { PILLAR } from "@/data/dashboard";
import { movementPlanTemplate } from "@/data/lifestyle-plans/movement";
import { clarityTag } from "@/lib/clarity";
import { invalidateDailyLogCache } from "@/lib/daily-log-client";
import { isPlanStepHidden, resolveActionKey } from "@/lib/day-model";
import { trackEvent, trackOnderbouwingLinkClick } from "@/lib/ga4";
import {
  buildAnchorWhySuffix,
  resolvePatternTrainingStepId,
  type MovementPrefs,
} from "@/lib/movement-prefs";
import {
  buildMovementRecoveryHint,
  buildMovementRecoveryInput,
} from "@/lib/movement-recovery-hint";
import {
  buildMedicalSafetyLine,
  buildMovementCheckinCta,
  buildTodayChoiceRecommendationLine,
  inferCompletedChoice,
  modalityLabelForChoice,
  resolveRcvFeelForRecoveryHint,
  resolveRecommendedTodayChoiceKind,
  resolveTodayChoiceOptions,
  shouldRecommendRestChoice,
  type TodayChoiceKind,
  type TodayChoiceOption,
} from "@/lib/movement-today-choices";
import { useDailyActionLog } from "@/lib/use-daily-action-log";
import { buildVandaagFollowUp, firstSentence } from "@/lib/vandaag-card-links";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import type { DashboardModel } from "@/types/dashboard";

const SURFACE = "kompas_beweging";

type StepAlternativeChoice = "herstel" | "matig" | "trainen";

type TrainingGateView = "question" | "advice";

type MovementTodayHeroProps = {
  model: DashboardModel;
  slot: WeekDaySlot | null;
  movementPrefs: MovementPrefs;
  onGoAgenda: () => void;
  onMakePriority: () => void;
  makePriorityBusy: boolean;
};

function stepRationale(stepId: string): string | null {
  const step = movementPlanTemplate.phases
    .flatMap((phase) => phase.steps)
    .find((entry) => entry.id === stepId);
  return step?.rationale?.body ?? null;
}

function trackStepChoice(choice: StepAlternativeChoice): void {
  trackEvent("dashboard_vandaag_step_alternative", {
    choice,
    domain: "beweging",
    surface: SURFACE,
  });
  clarityTag("dashboard_kompas_beweging", `step_alternative_${choice}`);
}

function trackTrainingGate(answer: "yes" | "no" | "proceed_anyway"): void {
  trackEvent("dashboard_vandaag_training_gate", {
    answer,
    domain: "beweging",
    surface: SURFACE,
  });
  clarityTag("dashboard_kompas_beweging", `training_gate_${answer}`);
}

function trackCheckinClick(mode: "pulse"): void {
  trackEvent("dashboard_beweging_checkin_click", {
    mode,
    surface: SURFACE,
  });
  clarityTag("dashboard_beweging_checkin", "click");
}

function choiceIcon(kind: TodayChoiceKind) {
  if (kind === "herstel") {
    return <Icons.Moon s={18} />;
  }
  if (kind === "matig") {
    return <Icons.Footprints s={18} />;
  }
  return <Icons.Activity s={18} />;
}

function ChoiceCard({
  option,
  recommended,
  onSelect,
}: {
  option: TodayChoiceOption;
  recommended: boolean;
  onSelect: (kind: TodayChoiceKind) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.kind)}
      className={
        recommended
          ? "flex w-full cursor-pointer items-center gap-3 rounded-xl border border-[color:var(--ac)]/50 bg-[color:var(--ac)]/10 p-3 text-left transition-colors"
          : "flex w-full cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/25 p-3 text-left transition-colors hover:border-white/20"
      }
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[color:var(--ac)]">
        {choiceIcon(option.kind)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-serif text-[15px] text-[#F1EFE8]">{option.label}</span>
          {recommended ? (
            <span className="rounded-full bg-[color:var(--ac)]/20 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[color:var(--ac)]">
              Aanbevolen
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block truncate text-[12.5px] leading-snug text-[#9FB0A6] text-pretty">
          {option.title} · {option.durationLabel}
        </span>
      </span>
      <Icons.ChevronRight s={16} style={{ color: "#7E8C82", flexShrink: 0 }} />
    </button>
  );
}

export default function MovementTodayHero({
  model,
  slot,
  movementPrefs,
  onGoAgenda,
  onMakePriority,
  makePriorityBusy,
}: MovementTodayHeroProps) {
  const shownRef = useRef(false);
  const [selectedKind, setSelectedKind] = useState<TodayChoiceKind | null>(null);
  const [freshChoice, setFreshChoice] = useState(false);
  const [trainingGateView, setTrainingGateView] = useState<TrainingGateView>("question");
  const [trainingGateCleared, setTrainingGateCleared] = useState(false);
  const [logHydrated, setLogHydrated] = useState(false);
  const [noTimeActive, setNoTimeActive] = useState(false);

  const isOwnStep = Boolean(slot && slot.isToday && slot.domain === "beweging");
  const hidden = slot ? isPlanStepHidden(model, slot) : true;
  const active = isOwnStep && !hidden && slot != null;
  const dayStepId = active && slot ? resolveActionKey(model, slot) : "";
  // Trainen-slot volgt het startpatroon; fallback = day-model-stap (SSOT).
  const trainingStepId = dayStepId
    ? resolvePatternTrainingStepId(
        model.domainScores,
        model.answers ?? {},
        movementPrefs.startPattern,
        dayStepId,
        Object.fromEntries(
          Object.entries(model.movementPlanProgress?.steps ?? {}).map(
            ([id, entry]) => [id, { state: entry.state }],
          ),
        ),
      )
    : "";

  const rcvFeelForHint = resolveRcvFeelForRecoveryHint(
    model.movementRcvFeel,
    model.movementRcvFeelAt,
  );

  const recovery = buildMovementRecoveryHint(
    buildMovementRecoveryInput(
      model.domainScores,
      model.answers ?? {},
      rcvFeelForHint,
    ),
  );
  const restRecommended = shouldRecommendRestChoice(recovery);
  const recommendedKind = resolveRecommendedTodayChoiceKind(rcvFeelForHint, recovery);
  const recommendationLine = buildTodayChoiceRecommendationLine(
    recommendedKind,
    recovery,
    rcvFeelForHint,
  );
  const medicalSafetyLine = buildMedicalSafetyLine(recovery);
  const checkinCta = buildMovementCheckinCta({
    rcvFeelAt: model.movementRcvFeelAt,
    restRecommended,
  });

  const choiceOptions = useMemo(
    () =>
      trainingStepId
        ? resolveTodayChoiceOptions(trainingStepId, movementPrefs.startPattern)
        : [],
    [trainingStepId, movementPrefs.startPattern],
  );

  const activeChoice = selectedKind
    ? choiceOptions.find((option) => option.kind === selectedKind) ?? null
    : null;

  const showTrainingGate =
    selectedKind === "trainen" && !trainingGateCleared && activeChoice != null;

  const logActionKey =
    activeChoice && (!showTrainingGate || trainingGateCleared) ? activeChoice.stepId : null;

  const { done, loaded, busy, toggle } = useDailyActionLog({
    domain: "beweging",
    actionKey: logActionKey,
    enabled: active && logActionKey != null,
    surface: SURFACE,
    clarityScope: "kompas_beweging_hero",
    forceUnchecked: freshChoice,
    onToggled: () => setFreshChoice(false),
  });

  useEffect(() => {
    if (!active || choiceOptions.length === 0) {
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(
          `/api/account/daily-log?domain=${encodeURIComponent("beweging")}`,
          { credentials: "include" },
        );
        if (!response.ok || cancelled) {
          return;
        }
        const state = (await response.json()) as { keys: string[] };
        const completed = inferCompletedChoice(state.keys, choiceOptions);
        if (completed) {
          setSelectedKind(completed);
          setFreshChoice(false);
          if (completed === "trainen") {
            setTrainingGateCleared(true);
          }
        }
      } finally {
        if (!cancelled) {
          setLogHydrated(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [active, choiceOptions]);

  useEffect(() => {
    if (shownRef.current || !active) {
      return;
    }
    shownRef.current = true;
    trackEvent("dashboard_vandaag_card_shown", {
      has_active_habit: Boolean(model.activeHabit),
      priority: model.priority.id,
      rest_recommended: restRecommended,
      recommended_choice: recommendedKind ?? "none",
      surface: SURFACE,
      user_chosen: model.priorityIsUserChosen,
    });
    clarityTag("dashboard_kompas_beweging", "hero_shown");
  }, [
    active,
    model.activeHabit,
    model.priority.id,
    model.priorityIsUserChosen,
    restRecommended,
    recommendedKind,
  ]);

  const followUp = buildVandaagFollowUp("beweging");

  const selectChoice = (kind: TodayChoiceKind) => {
    invalidateDailyLogCache("beweging");
    trackStepChoice(kind);
    setNoTimeActive(false);
    setFreshChoice(true);
    setSelectedKind(kind);
    if (kind === "trainen") {
      setTrainingGateView("question");
      setTrainingGateCleared(false);
      return;
    }
    setTrainingGateCleared(true);
  };

  const resetChoice = () => {
    invalidateDailyLogCache("beweging");
    trackEvent("dashboard_vandaag_step_alternative", {
      choice: "wijzig_keuze",
      domain: "beweging",
      surface: SURFACE,
    });
    clarityTag("dashboard_kompas_beweging", "step_alternative_wijzig_keuze");
    setSelectedKind(null);
    setFreshChoice(false);
    setNoTimeActive(false);
    setTrainingGateView("question");
    setTrainingGateCleared(false);
  };

  /**
   * Geen tijd? — wissel naar de lichtere keuze van vandaag (kort/rust):
   * herstel wanneer de recovery-hint een rustdag promoot, anders van
   * trainen → matig en van matig → herstel. Zelfde daily-log-keys.
   */
  const selectNoTime = (fromKind: TodayChoiceKind) => {
    const lighterKind: TodayChoiceKind =
      recovery?.promoteRustdagStep || fromKind === "matig" ? "herstel" : "matig";
    trackEvent("dashboard_vandaag_step_alternative", {
      choice: "geen_tijd",
      from: fromKind,
      to: lighterKind,
      domain: "beweging",
      surface: SURFACE,
    });
    clarityTag("dashboard_kompas_beweging", "step_alternative_geen_tijd");
    selectChoice(lighterKind);
    setNoTimeActive(true);
  };

  const choiceFooter = (
    <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-stretch">
      {checkinCta ? (
        <Link
          href={checkinCta.href}
          onClick={() => trackCheckinClick("pulse")}
          className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[color:var(--ac)]/50 bg-[color:var(--ac)]/10 px-4 text-[14px] font-semibold text-[#E7EDE8] no-underline transition-colors hover:border-[color:var(--ac)]/70"
        >
          {checkinCta.label}
        </Link>
      ) : null}
      <button
        type="button"
        onClick={onGoAgenda}
        className={
          checkinCta
            ? "inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-transparent px-4 text-[14px] font-semibold text-[#E7EDE8]"
            : "inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-transparent px-4 text-[14px] font-semibold text-[#E7EDE8]"
        }
      >
        Open Mijn Dag <Icons.ArrowRight s={15} />
      </button>
    </div>
  );

  if (!active) {
    const otherLabel = slot ? PILLAR[slot.domain].label.toLowerCase() : null;
    return (
      <section
        aria-label="Vandaag — beweging"
        className="rounded-2xl border border-[color:var(--ac)]/40 bg-black/25 p-5"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ac)]">
          Vandaag
        </p>
        <h3 className="mt-2 font-serif text-[21px] leading-snug text-[#F1EFE8] text-pretty">
          {otherLabel
            ? `Vandaag ligt je stap bij ${otherLabel}.`
            : "Nog geen stap gepland voor vandaag."}
        </h3>
        <p className="mt-2 text-[14px] leading-relaxed text-[#9FB0A6] text-pretty">
          Wil je dat beweging je dagelijkse stap wordt? Dan zetten we ’m bovenaan
          in je Mijn Dag — één actie per dag, geen zeven lijstjes.
        </p>
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            disabled={makePriorityBusy}
            onClick={onMakePriority}
            className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-[color:var(--ac)] px-4 text-[14px] font-semibold text-[#0f1c10] transition-opacity disabled:opacity-60"
          >
            Maak beweging mijn prioriteit
          </button>
          <button
            type="button"
            onClick={onGoAgenda}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-transparent px-4 text-[14px] font-semibold text-[#E7EDE8]"
          >
            Open Mijn Dag <Icons.ArrowRight s={15} />
          </button>
        </div>
      </section>
    );
  }

  const shellClass =
    "relative overflow-hidden rounded-2xl border border-[color:var(--ac)]/45 bg-black/25 p-4";

  if (!logHydrated) {
    return (
      <section aria-label="Vandaag — beweging" className={shellClass}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ac)]">
          Vandaag · kies wat past
        </p>
        <p className="mt-3 text-[14px] text-[#9FB0A6]">Even laden…</p>
      </section>
    );
  }

  if (showTrainingGate && activeChoice) {
    return (
      <section aria-label="Vandaag — beweging" className={shellClass}>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-30 blur-[80px]"
          style={{ background: "var(--ac)" }}
        />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ac)]">
            Vandaag · trainen
          </p>
          {trainingGateView === "question" ? (
            <>
              <h3 className="mt-1.5 font-serif text-[20px] leading-snug text-[#F1EFE8] text-pretty">
                Heb je gisteren zwaar getraind?
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[#CDD7D0] text-pretty">
                Eén eerlijke check — daarna stellen we je training voor vandaag voor.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    trackTrainingGate("yes");
                    setTrainingGateView("advice");
                  }}
                  className="min-h-11 cursor-pointer rounded-xl border border-white/15 bg-black/25 px-4 text-[14px] font-semibold text-[#E7EDE8]"
                >
                  Ja
                </button>
                <button
                  type="button"
                  onClick={() => {
                    trackTrainingGate("no");
                    setTrainingGateCleared(true);
                  }}
                  className="min-h-11 cursor-pointer rounded-xl border-none bg-[color:var(--ac)] px-4 text-[14px] font-semibold text-[#0f1c10]"
                >
                  Nee
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="mt-1.5 font-serif text-[20px] leading-snug text-[#F1EFE8] text-pretty">
                Herstel telt ook mee
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[#CDD7D0] text-pretty">
                Na zware training is rust of matig bewegen vaak slimmer. Kies wat
                vandaag klopt — of ga bewust door als je je fit voelt.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => selectChoice("herstel")}
                  className="min-h-11 cursor-pointer rounded-xl border border-[color:var(--ac)]/50 bg-[color:var(--ac)]/10 px-4 text-left text-[14px] font-semibold text-[#E7EDE8]"
                >
                  Kies herstel
                </button>
                <button
                  type="button"
                  onClick={() => selectChoice("matig")}
                  className="min-h-11 cursor-pointer rounded-xl border border-white/15 bg-black/25 px-4 text-left text-[14px] font-semibold text-[#E7EDE8]"
                >
                  Kies matig bewegen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    trackTrainingGate("proceed_anyway");
                    setTrainingGateCleared(true);
                  }}
                  className="min-h-11 cursor-pointer rounded-xl border-none bg-[color:var(--ac)] px-4 text-[14px] font-semibold text-[#0f1c10]"
                >
                  Toch trainen
                </button>
              </div>
            </>
          )}
          <button
            type="button"
            onClick={resetChoice}
            className="mt-4 cursor-pointer border-none bg-transparent p-0 text-[13px] font-medium text-[#9FB0A6]"
          >
            Wijzig keuze
          </button>
        </div>
      </section>
    );
  }

  if (activeChoice && trainingGateCleared) {
    const supportingLine = firstSentence(
      stepRationale(activeChoice.stepId) ?? slot?.rationale ?? "",
    );
    // Anker kleurt alleen de waarom-copy (§5a) — nooit een score.
    const anchorSuffix = buildAnchorWhySuffix(movementPrefs.anchor);
    const modality = modalityLabelForChoice(activeChoice.kind, activeChoice.stepId);

    return (
      <section aria-label="Vandaag — beweging" className={shellClass}>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-30 blur-[80px]"
          style={{ background: "var(--ac)" }}
        />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ac)]">
            Vandaag · {modality.toLowerCase()}
          </p>
          <h3 className="mt-1.5 font-serif text-[20px] leading-snug text-[#F1EFE8] text-pretty">
            {activeChoice.title}
          </h3>
          {noTimeActive && !done ? (
            <p className="mt-2 text-[13px] font-medium text-[color:var(--ac)]">
              Drukke dag? Dit telt volledig mee.
            </p>
          ) : null}
          {supportingLine || anchorSuffix ? (
            <p className="mt-2 text-[14px] leading-relaxed text-[#CDD7D0] text-pretty">
              {supportingLine}
              {supportingLine && anchorSuffix ? " " : ""}
              {anchorSuffix}
            </p>
          ) : null}
          <p className="mt-2 inline-flex items-center gap-1 text-[12px] text-[#9FB0A6]">
            <Icons.Clock s={12} /> {activeChoice.durationLabel}
          </p>

          <button
            type="button"
            aria-label={done ? "Actie afgevinkt voor vandaag" : "Markeer als gedaan vandaag"}
            aria-pressed={done}
            disabled={!loaded || busy}
            onClick={() => void toggle()}
            className="mt-4 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-none px-4 text-[15px] font-semibold transition-opacity disabled:opacity-60"
            style={{
              background: done ? "rgba(90,143,106,0.22)" : "var(--ac)",
              color: done ? "#E7EDE8" : "#0f1c10",
            }}
          >
            {done ? (
              <>
                <Icons.Check s={16} /> Gedaan
              </>
            ) : (
              "Markeer als gedaan"
            )}
          </button>

          {done ? (
            <p className="mt-3 text-center text-[13px] text-[#9FB0A6]">
              Morgen kies je opnieuw wat past.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <button
                type="button"
                onClick={resetChoice}
                className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-medium text-[#9FB0A6]"
              >
                Wijzig keuze
              </button>
              {activeChoice.kind !== "herstel" && !noTimeActive ? (
                <button
                  type="button"
                  onClick={() => selectNoTime(activeChoice.kind)}
                  className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-medium text-[#9FB0A6]"
                >
                  Geen tijd vandaag?
                </button>
              ) : null}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            {slot ? (
              <Link
                href={slot.evidenceHref}
                onClick={() => {
                  trackOnderbouwingLinkClick({ surface: "kompas_home", domain: "beweging" });
                  clarityTag("onderbouwing_link", "kompas_beweging");
                }}
                className="inline-flex items-center gap-1 text-[13px] font-medium text-[#9FB0A6] no-underline"
              >
                {activeChoice.whyLinkLabel} <Icons.ArrowRight s={13} />
              </Link>
            ) : null}
            {done ? (
              <Link
                href={followUp.href}
                className="inline-flex items-center gap-1 text-[13px] font-medium text-[color:var(--ac)] no-underline"
              >
                {followUp.label} <Icons.ArrowRight s={13} />
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Vandaag — beweging" className={shellClass}>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-30 blur-[80px]"
        style={{ background: "var(--ac)" }}
      />
      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ac)]">
          Vandaag · kies wat past
        </p>
        <h3 className="mt-1.5 font-serif text-[20px] leading-snug text-[#F1EFE8] text-pretty">
          {recommendationLine ?? "Kies één richting voor vandaag."}
        </h3>

        {medicalSafetyLine ? (
          <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-[13px] leading-relaxed text-[#F1EFE8] text-pretty">
            {medicalSafetyLine}
          </p>
        ) : null}

        <div className="mt-3 flex flex-col gap-2">
          {choiceOptions.map((option) => (
            <ChoiceCard
              key={option.kind}
              option={option}
              recommended={recommendedKind === option.kind}
              onSelect={selectChoice}
            />
          ))}
        </div>

        {choiceFooter}
      </div>
    </section>
  );
}
