"use client";

import { clarityTag } from "@/lib/clarity";
import {
  deriveGoalMode,
  getSituationLabel,
  isDomainGoalDomain,
  type DomainGoalDomain,
  type GoalMode,
} from "@/lib/domain-goal";
import type { DomainGoalMap, DomainGoalSummary } from "@/lib/domain-goal-client";
import { trackEvent } from "@/lib/ga4";
import { buildKompasDomainRows } from "@/lib/kompas-home";
import { getNextVitalityBand, getVitalityBand } from "@/lib/vitality-gauge";
import type { DashboardData, DashboardModel, PillarId } from "@/types/dashboard";

type VoortgangRichtingBeatProps = {
  model: DashboardModel;
  data?: DashboardData;
  goals: DomainGoalMap | null;
  onScrollToOverTijd: () => void;
};

function pct(v: number): number {
  return 10 + 80 * (v / 100);
}

/**
 * Slice C (PLAN_EIGEN_IJKPUNT_DOEL_PER_DOMEIN.md §7): drie standen, geen
 * vierde, geen oordeel. Leunt op richting, niet op grootte (§11.1-lock —
 * geen drempelwoord als "betekenisvol"/"merkbaar").
 */
const GOAL_MODE_COPY: Record<GoalMode, string> = {
  verwerven: "Hier werk je nog aan deze cyclus.",
  behouden: "Dit gaat je inmiddels vanzelf af.",
  herpakken: "Dit ging deze cyclus terug.",
};

function buildIjkpuntLine(baseline: number, latest: number): string {
  if (latest === baseline) {
    return `Dit staat nog op ${latest}, net als bij je start.`;
  }
  return `Bij je start stond dit op ${baseline}, nu op ${latest}.`;
}

function resolvePriorityGoal(
  priorityId: PillarId,
  goals: DomainGoalMap | null,
): { domain: DomainGoalDomain; goal: DomainGoalSummary } | null {
  if (!isDomainGoalDomain(priorityId)) {
    return null;
  }
  const goal = goals?.[priorityId];
  return goal && goal.scores.length > 0 ? { domain: priorityId, goal } : null;
}

export default function VoortgangRichtingBeat({
  model,
  data,
  goals,
  onScrollToOverTijd,
}: VoortgangRichtingBeatProps) {
  const rows = buildKompasDomainRows(model);
  const priorityRow = rows.find((row) => row.isPriority);

  if (!priorityRow) {
    return null;
  }

  const handleScrollToOverTijd = () => {
    trackEvent("dashboard_voortgang_hub_click", {
      destination: "over_tijd",
      surface: "richting_beat",
    });
    clarityTag("dashboard_voortgang", "over_tijd");
    onScrollToOverTijd();
  };

  const priorityGoal = resolvePriorityGoal(priorityRow.id, goals);

  if (priorityGoal) {
    const { domain, goal } = priorityGoal;
    const latest = goal.scores[goal.scores.length - 1].score;
    const previous = goal.scores.length >= 2 ? goal.scores[goal.scores.length - 2].score : null;
    const baseline = goal.scores[0].score;
    const mode = goal.mode ?? deriveGoalMode(latest, previous);
    const cycleDay = data?.cycleEvidence?.cycleDay ?? null;
    const eyebrow =
      cycleDay != null
        ? `Je doel · ${priorityRow.label} · dag ${cycleDay} van 30`
        : `Je doel · ${priorityRow.label}`;
    const heading = goal.ownWords || getSituationLabel(domain, goal.situationId);

    return (
      <section
        aria-labelledby="richting-beat-title"
        className="ps-dash-beat relative -mx-3 border-y border-black/10 py-[34px] sm:-mx-4 min-[1440px]:-mx-6 lg:py-[60px]"
      >
        <div className="relative px-3 sm:px-4 min-[1440px]:px-6">
          <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--sage-ink)]">
            {eyebrow}
          </p>
          <h2
            id="richting-beat-title"
            className="mt-3 font-serif text-[clamp(23px,6.2vw,30px)] leading-[1.14] text-balance text-[var(--text)]"
            style={{ fontFamily: "var(--f-serif)" }}
          >
            {heading}
          </h2>
          <p className="mt-3 max-w-[44ch] text-[15px] leading-[1.55] text-[var(--text-muted)] text-pretty">
            {GOAL_MODE_COPY[mode]}
          </p>
          {goal.scores.length >= 2 ? (
            <p className="mt-2 max-w-[44ch] text-[13.5px] leading-[1.5] text-[var(--text-muted)]">
              {buildIjkpuntLine(baseline, latest)}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleScrollToOverTijd}
            className="mt-5 inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center rounded-full bg-[var(--sage-ink)] px-5 text-[14.5px] font-semibold text-white transition hover:opacity-90 sm:w-auto"
          >
            Bekijk je lijn over tijd →
          </button>

          <p className="mt-3.5 max-w-[60ch] text-[11.5px] leading-normal text-[var(--text-subtle)] text-pretty">
            Dit is je eigen ijkpunt — geen doel dat je moet halen, wel een lijn met jezelf.
          </p>
        </div>
      </section>
    );
  }

  const score = Math.round(priorityRow.score);
  const delta = priorityRow.delta;
  const band = getVitalityBand(score);
  const nextBand = getNextVitalityBand(score);
  const target = nextBand ? nextBand.min : 100;
  const baseline =
    delta != null ? Math.min(100, Math.max(0, score - delta)) : null;
  const hasStart = baseline != null && Math.abs(score - baseline) >= 2;

  const pNow = pct(score);
  const pTarget = pct(target);
  const pStart = baseline != null ? pct(baseline) : null;

  const title = hasStart
    ? "Van waar je begon, naar waar dit heen kan."
    : "Waar je nu staat, en wat het volgende niveau vraagt.";

  const lede = hasStart
    ? `${priorityRow.label} is je focus in deze cyclus. Dit is de schaal waarop je dat afleest — geen doel dat je moet halen, wel het volgende leesniveau.`
    : `${priorityRow.label} is je focus in deze cyclus. Je hebt hier één meting — je hermeting maakt hier een lijn van.`;

  const fillLeft = hasStart && pStart != null ? pStart : 10;
  const fillWidth = Math.max(0, pNow - fillLeft);
  const dashLeft = pNow;
  const dashWidth = Math.max(0, pTarget - pNow);

  return (
    <section
      aria-labelledby="richting-beat-title"
      className="ps-dash-beat relative -mx-3 border-y border-black/10 py-[34px] sm:-mx-4 min-[1440px]:-mx-6 lg:py-[60px]"
    >
      <div className="relative px-3 sm:px-4 min-[1440px]:px-6">
        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--sage-ink)]">
          Waar dit heen loopt · {priorityRow.label}
        </p>
        <h2
          id="richting-beat-title"
          className="mt-3 font-serif text-[clamp(23px,6.2vw,30px)] leading-[1.14] text-balance text-[var(--text)]"
          style={{ fontFamily: "var(--f-serif)" }}
        >
          {title}
        </h2>
        <p className="mt-3 max-w-[44ch] text-[15px] leading-[1.55] text-[var(--text-muted)] text-pretty">
          {lede}
        </p>

        <div className="mt-6">
          <div className="relative mx-1.5 h-0.5 rounded-full bg-[rgba(22,40,26,0.14)]">
            <span
              className="absolute top-0 h-0.5 rounded-full bg-[var(--sage-ink)]"
              style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }}
            />
            <span
              className="absolute top-0 h-0 border-t-2 border-dashed border-[rgba(22,40,26,0.28)]"
              style={{ left: `${dashLeft}%`, width: `${dashWidth}%` }}
            />
            {hasStart && pStart != null ? (
              <span
                aria-hidden
                className="absolute top-1/2 h-[11px] w-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--sage-ink)] bg-[var(--bg)]"
                style={{ left: `${pStart}%` }}
              />
            ) : null}
            <span
              aria-hidden
              className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--sage-ink)]"
              style={{ left: `${pNow}%` }}
            />
            {nextBand ? (
              <span
                aria-hidden
                className="absolute top-1/2 h-[11px] w-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-[rgba(22,40,26,0.42)] bg-[var(--bg)]"
                style={{ left: `${pTarget}%` }}
              />
            ) : null}
          </div>

          <div className="relative mt-4 h-[74px]">
            {hasStart && pStart != null ? (
              <div className="absolute left-0 top-0 min-w-0">
                <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(22,40,26,0.50)]">
                  Bij je start
                </p>
                <p
                  className="mt-0.5 font-serif text-[22px] leading-[1.2] text-[var(--text)]"
                  style={{ fontFamily: "var(--f-serif)" }}
                >
                  {baseline}
                </p>
                <p className="mt-px text-[11.5px] text-[rgba(22,40,26,0.62)]">
                  {getVitalityBand(baseline!).label}
                </p>
              </div>
            ) : null}
            <div
              className="absolute top-0 min-w-0 whitespace-nowrap"
              style={{
                left: hasStart ? `${pNow}%` : "10%",
                transform: hasStart ? "translateX(-50%)" : "none",
              }}
            >
              <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(22,40,26,0.50)]">
                Nu
              </p>
              <p
                className="mt-0.5 font-serif text-[22px] leading-[1.2] text-[var(--text)]"
                style={{ fontFamily: "var(--f-serif)" }}
              >
                {score}
              </p>
              <p className="mt-px text-[11.5px] text-[rgba(22,40,26,0.62)]">
                {band.label}
              </p>
            </div>
            <div className="absolute right-0 top-0 min-w-0 text-right">
              <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(22,40,26,0.50)]">
                {nextBand ? "Volgend niveau" : "Nu al"}
              </p>
              <p
                className="mt-0.5 font-serif text-[22px] leading-[1.2] text-[var(--text)]"
                style={{ fontFamily: "var(--f-serif)" }}
              >
                {nextBand ? `vanaf ${target}` : band.label}
              </p>
              <p className="mt-px text-[11.5px] text-[rgba(22,40,26,0.62)]">
                {nextBand ? nextBand.label : "hoogste niveau"}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleScrollToOverTijd}
          className="mt-5 inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center rounded-full bg-[var(--sage-ink)] px-5 text-[14.5px] font-semibold text-white transition hover:opacity-90 sm:w-auto"
        >
          Bekijk je cijfers over tijd →
        </button>

        <p className="mt-3.5 max-w-[60ch] text-[11.5px] leading-normal text-[var(--text-subtle)] text-pretty">
          Deze niveaus zijn om af te lezen — geen doelen en geen oordeel. Waar
          jouw lijn loopt, hangt af van waar je nu staat.
        </p>
      </div>
    </section>
  );
}
