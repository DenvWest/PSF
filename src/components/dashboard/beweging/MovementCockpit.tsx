"use client";

import { useState } from "react";
import { Sparkline } from "@/components/app/primitives";
import MovementJourneyRail from "@/components/dashboard/beweging/MovementJourneyRail";
import MovementStartChoice from "@/components/dashboard/beweging/MovementStartChoice";
import MovementTodayHero from "@/components/dashboard/beweging/MovementTodayHero";
import CockpitShell from "@/components/dashboard/cockpit/CockpitShell";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { isPlanStepHidden } from "@/lib/day-model";
import { formatLastMeasured } from "@/lib/betekenis-motor";
import { buildDomainTrendRow } from "@/lib/leefstijllijn";
import type { KompasDeepView } from "@/lib/dashboard-url";
import type { MovementPrefs } from "@/lib/movement-prefs";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import type { DashboardModel } from "@/types/dashboard";

/** Sage CTA in cockpit — PILLAR.beweging blijft terracotta voor nav-identiteit. */
const COCKPIT_CTA = "#5A8F6A";

const RING_SIZE = 128;
const RING_RADIUS = 54;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

type MovementCockpitProps = {
  model: DashboardModel;
  slot: WeekDaySlot | null;
  deepView?: KompasDeepView;
  onGoAgenda: () => void;
  onMakePriority: () => void;
  makePriorityBusy: boolean;
  onOpenPlan?: () => void;
};

export default function MovementCockpit({
  model,
  slot,
  deepView = "cockpit",
  onGoAgenda,
  onMakePriority,
  makePriorityBusy,
  onOpenPlan,
}: MovementCockpitProps) {
  const isPlanView = deepView === "stappenplan";
  const score = Math.round(model.scores.beweging ?? 0);
  const dashOffset = RING_CIRC * (1 - Math.min(100, Math.max(0, score)) / 100);

  const trendRow = buildDomainTrendRow(model, "beweging");
  const hasTrend = trendRow.trend.length >= 2;

  // Prefs-override zodat de hero direct de nieuwe keuze gebruikt zonder
  // model-herbouw; sessie-skip blokkeert de dagstap niet permanent.
  const [prefsOverride, setPrefsOverride] = useState<MovementPrefs | null>(null);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [skippedSession, setSkippedSession] = useState(false);
  const movementPrefs = prefsOverride ?? model.movementPrefs;

  const activeOwnStep = Boolean(
    slot &&
      slot.isToday &&
      slot.domain === "beweging" &&
      !isPlanStepHidden(model, slot),
  );
  const showStartChoice =
    activeOwnStep &&
    (choiceOpen || (movementPrefs.startPattern == null && !skippedSession));

  return (
    <CockpitShell
      accent={COCKPIT_CTA}
      ariaLabel="Beweeg-cockpit"
      embedded
    >
      {/* DOM-volgorde = mobiele stack (hero eerst). lg: Hero full-width →
          Waar je staat (score+trend, één readout-rij) → Jouw route full-width.
          Deze week + meetmoment leven in de inspector-zone (CockpitFrame). */}
      <div className="grid gap-2.5 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-3">
        {/* VANDAAG — verborgen op stappenplan-diepte (afvinken via tabbar) */}
        <div className={`lg:col-span-2 lg:col-start-1 lg:row-start-1 ${isPlanView ? "hidden" : ""}`}>
          {showStartChoice ? (
            <MovementStartChoice
              onSaved={(prefs) => {
                setPrefsOverride(prefs);
                setChoiceOpen(false);
              }}
              onSkip={() => {
                setSkippedSession(true);
                setChoiceOpen(false);
              }}
            />
          ) : (
            <MovementTodayHero
              model={model}
              slot={slot}
              movementPrefs={movementPrefs}
              onGoAgenda={onGoAgenda}
              onMakePriority={onMakePriority}
              makePriorityBusy={makePriorityBusy}
            />
          )}
        </div>

        {isPlanView ? (
          <div className="lg:col-start-2 lg:row-start-1">
            <CockpitTile eyebrow="Jouw stappenplan">
              <p className="mt-2 text-[13px] leading-relaxed text-[#CDD7D0] text-pretty">
                Stel hier je spoor, doel en fases in. Afvinken blijft in VANDAAG — via
                de tabbar onderaan.
              </p>
            </CockpitTile>
          </div>
        ) : null}

        {/* WAAR JE STAAT — score + trend in één readout-rij, Future You-narratief */}
        <div
          className={
            isPlanView ? "lg:col-start-1 lg:row-start-1" : "lg:col-span-2 lg:col-start-1 lg:row-start-2"
          }
        >
          <CockpitTile eyebrow="Waar je staat" ariaLabel="Waar je staat">
            <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5 min-[1440px]:gap-6">
              <div className="flex shrink-0 flex-col items-center text-center">
                <svg
                  viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
                  className="h-[92px] w-[92px] min-[1440px]:h-[112px] min-[1440px]:w-[112px]"
                  role="img"
                  aria-label={`Beweegscore: ${score} van de 100`}
                >
                  <circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RING_RADIUS}
                    fill="none"
                    stroke="#22302E"
                    strokeWidth="11"
                  />
                  <circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RING_RADIUS}
                    fill="none"
                    stroke="var(--ac)"
                    strokeWidth="11"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRC}
                    strokeDashoffset={dashOffset}
                    transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                  />
                  <text
                    x={RING_SIZE / 2}
                    y={RING_SIZE / 2 - 2}
                    textAnchor="middle"
                    fill="#F1EFE8"
                    fontSize="34"
                    className="font-serif"
                  >
                    {score}
                  </text>
                  <text
                    x={RING_SIZE / 2}
                    y={RING_SIZE / 2 + 18}
                    textAnchor="middle"
                    fill="#8B9A96"
                    fontSize="9"
                    letterSpacing="1"
                  >
                    VAN DE 100
                  </text>
                </svg>
                <p className="mt-1 font-serif text-[14px] text-[#F1EFE8]">Beweging</p>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[10.5px] text-[#7E8C82]">
                  {formatLastMeasured(model.date)} — verandert bij je hermeting
                </span>
              </div>

              <div className="min-w-0 flex-1">
                {hasTrend ? (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9FB0A6]">
                        Je trend
                      </span>
                      {trendRow.baselineScore != null ? (
                        <span className="text-[12px] tabular-nums text-[#7E8C82]">
                          Begin {trendRow.baselineScore} · nu {score}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2">
                      <Sparkline data={trendRow.trend} color="var(--ac)" h={36} />
                    </div>
                  </>
                ) : (
                  <p className="text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
                    Nog te vroeg voor een lijn — na je eerste hermeting zie je
                    ’m bewegen.
                  </p>
                )}
                <p className="mt-3 text-[13px] leading-relaxed text-[#9FB0A6] text-pretty lg:line-clamp-2">
                  Elke week die je vasthoudt telt mee voor de versie van jou
                  die straks nog gewoon zelf de trap op komt — dat is wat deze
                  score langzaam opbouwt.
                </p>
              </div>
            </div>
          </CockpitTile>
        </div>

        {/* JOUW ROUTE — verborgen op stappenplan (fase-explorer staat in plan-body) */}
        {!isPlanView ? (
          <div className="lg:col-span-2 lg:col-start-1 lg:row-start-3">
            <MovementJourneyRail
              model={model}
              movementPrefs={movementPrefs}
              onChangeStartPattern={
                activeOwnStep ? () => setChoiceOpen(true) : undefined
              }
              onOpenPlan={onOpenPlan}
            />
          </div>
        ) : null}
      </div>
    </CockpitShell>
  );
}
