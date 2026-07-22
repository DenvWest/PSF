"use client";

import { useState } from "react";
import * as Icons from "@/components/app/icons";
import { Sparkline } from "@/components/app/primitives";
import MovementJourneyRail from "@/components/dashboard/beweging/MovementJourneyRail";
import MovementStartChoice from "@/components/dashboard/beweging/MovementStartChoice";
import MovementTodayHero from "@/components/dashboard/beweging/MovementTodayHero";
import CockpitShell from "@/components/dashboard/cockpit/CockpitShell";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { PILLAR } from "@/data/dashboard";
import { isPlanStepHidden } from "@/lib/day-model";
import { formatLastMeasured } from "@/lib/betekenis-motor";
import { buildDomainTrendRow } from "@/lib/leefstijllijn";
import type { KompasDeepView } from "@/lib/dashboard-url";
import type { MovementPrefs } from "@/lib/movement-prefs";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import type { DashboardModel } from "@/types/dashboard";

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
  onRemeasure: () => void;
  remeasure: { dueDate: string; daysUntil: number } | null;
  onOpenPlan?: () => void;
};

function remeasureCopy(daysUntil: number): string {
  if (daysUntil <= 0) {
    return "Je hermeting staat klaar.";
  }
  if (daysUntil <= 7) {
    return "Over een paar dagen zie je je lijn bewegen.";
  }
  if (daysUntil <= 10) {
    return "Over ~1 week zie je je lijn bewegen.";
  }
  return `Over ~${Math.round(daysUntil / 7)} weken zie je je lijn bewegen.`;
}

export default function MovementCockpit({
  model,
  slot,
  deepView = "cockpit",
  onGoAgenda,
  onMakePriority,
  makePriorityBusy,
  onRemeasure,
  remeasure,
  onOpenPlan,
}: MovementCockpitProps) {
  const isPlanView = deepView === "stappenplan";
  const accent = PILLAR.beweging.color;
  const score = Math.round(model.scores.beweging ?? 0);
  const dashOffset = RING_CIRC * (1 - Math.min(100, Math.max(0, score)) / 100);

  const trendRow = buildDomainTrendRow(model, "beweging");
  const hasTrend = trendRow.trend.length >= 2;
  const remeasureDue = remeasure != null && remeasure.daysUntil <= 0;

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
    <CockpitShell accent={accent} ariaLabel="Beweeg-cockpit">
      {/* DOM-volgorde = mobiele stack (hero eerst). lg-plaatsing zet score
          links en de route hoog zodat het first viewport-werk zonder scroll
          zichtbaar is. */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-4">
        {/* VANDAAG — verborgen op stappenplan-diepte (afvinken via tabbar) */}
        <div className={`lg:col-start-2 lg:row-start-1 ${isPlanView ? "hidden" : ""}`}>
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

        {/* WAAR JE STAAT — echte beweegscore + narratieve Future You-regel */}
        <div className="lg:col-start-1 lg:row-start-1">
          <CockpitTile
            eyebrow="Waar je staat"
            ariaLabel="Waar je staat"
            className="flex h-full flex-col items-center text-center"
          >
            <div className="relative my-2">
              <svg
                viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
                className="h-[124px] w-[124px]"
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
            </div>
            <p className="font-serif text-[16px] text-[#F1EFE8]">Beweging</p>
            <p className="mt-2 max-w-[34ch] text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
              Elke week die je vasthoudt telt mee voor de versie van jou die
              straks nog gewoon zelf de trap op komt — dat is wat deze score
              langzaam opbouwt.
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[10.5px] text-[#7E8C82]">
              {formatLastMeasured(model.date)} — verandert bij je hermeting
            </span>
          </CockpitTile>
        </div>

        {/* JE TREND — echte leefstijllijn (mobiel ná score, desktop links onder score) */}
        <div className="lg:col-start-1 lg:row-start-2">
          <CockpitTile
            eyebrow="Je trend"
            ariaLabel="Je trend"
            aside={
              hasTrend && trendRow.baselineScore != null ? (
                <span className="text-[12px] tabular-nums text-[#7E8C82]">
                  Begin {trendRow.baselineScore} · nu {score}
                </span>
              ) : null
            }
          >
            {hasTrend ? (
              <>
                <div className="mt-3">
                  <Sparkline data={trendRow.trend} color="var(--ac)" h={36} />
                </div>
                <p className="mt-3 text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
                  Elke stip is een investering die je terugziet bij je volgende
                  meetmoment — niet vandaag, wel over weken.
                </p>
              </>
            ) : (
              <p className="mt-3 text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
                Nog te vroeg voor een lijn — na je eerste hermeting zie je ’m
                bewegen.
              </p>
            )}
          </CockpitTile>
        </div>

        {/* JOUW ROUTE — verborgen op stappenplan (fase-explorer staat in plan-body) */}
        {!isPlanView ? (
          <div className="lg:col-start-2 lg:row-start-2">
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

        {/* JE VOLGENDE MEETMOMENT — forward-pointer */}
        <div className={isPlanView ? "lg:col-start-2 lg:row-start-2" : "lg:col-start-2 lg:row-start-3"}>
          <CockpitTile eyebrow="Je volgende meetmoment" ariaLabel="Je volgende meetmoment">
            <p className="mt-2 font-serif text-[17px] leading-snug text-[#F1EFE8] text-pretty">
              {remeasure ? remeasureCopy(remeasure.daysUntil) : "Blijf even bouwen — het meetmoment komt vanzelf."}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
              Niet elke dag een cijfer — dat is bewust. De payoff komt bij je
              hermeting, als je terugkijkt op wat er veranderde.
            </p>
            {remeasureDue ? (
              <button
                type="button"
                onClick={onRemeasure}
                className="mt-3 inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl border-none bg-[color:var(--ac)] px-4 text-[14px] font-semibold text-[#0f1c10]"
              >
                Doe de hermeting <Icons.ArrowRight s={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onRemeasure}
                className="mt-3 inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[13px] font-semibold text-[color:var(--ac)]"
              >
                Zo werkt je hermeting <Icons.ArrowRight s={14} />
              </button>
            )}
          </CockpitTile>
        </div>
      </div>
    </CockpitShell>
  );
}
