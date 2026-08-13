"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import MovementProgramSheet from "@/components/dashboard/beweging/MovementProgramSheet";
import MovementStartChoice from "@/components/dashboard/beweging/MovementStartChoice";
import MovementTodayHero from "@/components/dashboard/beweging/MovementTodayHero";
import MovementWeekRhythm from "@/components/dashboard/beweging/MovementWeekRhythm";
import CockpitShell from "@/components/dashboard/cockpit/CockpitShell";
import {
  getMovementSessionCatalogEntry,
  resolveRecommendedSessionVariant,
} from "@/data/movement/session-catalog";
import { isPlanStepHidden } from "@/lib/day-model";
import { stripMovementRoutingParams } from "@/lib/dashboard-url";
import { buildMovementPositionLine } from "@/lib/movement-plan-roadmap";
import type { MovementPrefs } from "@/lib/movement-prefs";
import {
  buildProgramDoseLine,
  deriveMovementCurrent,
  resolveEffectiveMovementTarget,
  resolveMovementProgramDose,
} from "@/lib/movement-target";
import { useMovementPlanProfile } from "@/lib/use-movement-plan-profile";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import type { AccountPriorityPrefData, DashboardModel } from "@/types/dashboard";

/** Sage CTA in cockpit — PILLAR.beweging blijft terracotta voor nav-identiteit. */
const COCKPIT_CTA = "#5A8F6A";

export type MovementDoneState = {
  done: boolean;
  /** Voor de nutrient-bridge op de klaar-staat-footer — alleen na een krachtsessie. */
  isStrengthSession: boolean;
};

type MovementCockpitProps = {
  model: DashboardModel;
  slot: WeekDaySlot | null;
  onGoAgenda: () => void;
  onMakePriority: () => void;
  makePriorityBusy: boolean;
  /** Voor de klaar-staat-gate op de footer van BewegingScreen. */
  onDoneChange?: (state: MovementDoneState) => void;
  /** Doorgeef-naad naar het dashboard-model: de dagkeuze moet zonder herladen
   * op Mijn Dag aankomen. */
  onPrefUpdated?: (pref: AccountPriorityPrefData | null) => void;
};

export default function MovementCockpit({
  model,
  slot,
  onGoAgenda,
  onMakePriority,
  makePriorityBusy,
  onDoneChange,
  onPrefUpdated,
}: MovementCockpitProps) {
  // Prefs-override zodat de hero direct de nieuwe keuze gebruikt zonder
  // model-herbouw; sessie-skip blokkeert de dagstap niet permanent.
  const [prefsOverride, setPrefsOverride] = useState<MovementPrefs | null>(null);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [skippedSession, setSkippedSession] = useState(false);
  const searchParams = useSearchParams();
  // R0c-deeplink vanaf het readout-blok: `open=programma` opent de sheet direct
  // bij aankomst. `focus` is bewust leesbaar-niet-sturend — hij preselecteert
  // hier niets (F1a-freeze, BESLUIT_BEWEGING L10).
  const [sheetOpen, setSheetOpen] = useState(() => searchParams.get("open") === "programma");
  const [weekRefreshKey, setWeekRefreshKey] = useState(0);
  const movementPrefs = prefsOverride ?? model.movementPrefs;

  useEffect(() => {
    if (searchParams.get("open") !== "programma" && !searchParams.has("focus")) {
      return;
    }
    stripMovementRoutingParams();
    // Alleen bij mount consumeren — searchParams zelf niet in de deps, anders
    // vuurt dit elke keer opnieuw zodra de strip de URL (en dus de hook) update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const movStr = model.answers?.MOV_STR;
  const { profile, prefsBusy, saveProfilePatch, toggleSport, applyKnownPatch } =
    useMovementPlanProfile(movStr);

  const movementCurrent = useMemo(
    () => deriveMovementCurrent(model.answers ?? {}),
    [model.answers],
  );

  const recommendedVariant = useMemo(
    () =>
      resolveRecommendedSessionVariant({
        startPattern: profile.startPattern,
        movStr,
        trainingLocation: profile.trainingLocation,
        preferredSport: profile.preferredSport,
      }),
    [profile.startPattern, profile.trainingLocation, profile.preferredSport, movStr],
  );
  const sessionEntry = getMovementSessionCatalogEntry(recommendedVariant);
  const isStrengthSession = sessionEntry?.id.startsWith("kracht") ?? false;

  // Jouw opgeslagen dosis — niet de catalogusfrequentie (§B rij 1: dit is de
  // data-naad die de lus programma↔vandaag dood liet voelen).
  const effectiveTarget = resolveEffectiveMovementTarget(
    {
      minutes: profile.targetMinutes,
      days: profile.targetDays,
      strength: profile.targetStrength,
    },
    movementCurrent,
  );
  const dose = resolveMovementProgramDose(effectiveTarget);
  const programSummary = sessionEntry
    ? {
        label: `Je programma · ${sessionEntry.label}${dose ? ` · ${buildProgramDoseLine(dose)}` : `, ${sessionEntry.frequency}`}`,
        onOpen: () => setSheetOpen(true),
      }
    : null;

  const activeOwnStep = Boolean(
    slot &&
      slot.isToday &&
      slot.domain === "beweging" &&
      !isPlanStepHidden(model, slot),
  );
  const showProgramSetup =
    activeOwnStep && movementPrefs.startPattern == null && !skippedSession;

  const positionLine = model.movementPlanProgress
    ? buildMovementPositionLine({
        currentPhaseId: model.movementPlanProgress.currentPhaseId,
        startedAt: model.movementPlanProgress.startedAt,
      })
    : null;

  // Stabiele referentie: zonder useCallback krijgt de hero hieronder elke
  // render een nieuwe functie, en die staat in haar eigen effect-deps — dat
  // zou het effect (en dus deze callback) op elke render laten vuren.
  const handleHeroStateChange = useCallback(
    (state: { done: boolean }) => {
      onDoneChange?.({ done: state.done, isStrengthSession });
    },
    [onDoneChange, isStrengthSession],
  );

  return (
    <CockpitShell accent={COCKPIT_CTA} ariaLabel="Beweeg-cockpit" embedded>
      <div className="@container mx-auto w-full max-w-[1040px] @[1080px]:max-w-[1340px]">
        <div className="flex flex-col gap-3">
          <MovementTodayHero
            model={model}
            slot={slot}
            movementPrefs={movementPrefs}
            movementCurrentSource={movementCurrent.source}
            programSummary={programSummary}
            onGoAgenda={onGoAgenda}
            onMakePriority={onMakePriority}
            makePriorityBusy={makePriorityBusy}
            onStateChange={handleHeroStateChange}
            onLogToggled={() => setWeekRefreshKey((key) => key + 1)}
            onPrefUpdated={onPrefUpdated}
          />

          {positionLine ? (
            <p className="px-1 text-[12.5px] leading-relaxed text-[#9FB0A6]">{positionLine}</p>
          ) : null}

          {movementPrefs.startPattern != null ? (
            <MovementWeekRhythm
              startPattern={movementPrefs.startPattern}
              refreshKey={weekRefreshKey}
            />
          ) : null}

          {showProgramSetup ? (
            choiceOpen ? (
              <MovementStartChoice
                onSaved={(prefs) => {
                  setPrefsOverride(prefs);
                  applyKnownPatch(prefs);
                  setChoiceOpen(false);
                }}
                onSkip={() => {
                  setSkippedSession(true);
                  setChoiceOpen(false);
                }}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-white/15 bg-black/10 px-4 py-3.5">
                <p className="text-[13px] leading-relaxed text-[#CDD7D0]">
                  Klopt dit voor jou? We stelden dit voor op je beweegscore. Zeg wat je wil en
                  het voorstel past zich aan.
                </p>
                <button
                  type="button"
                  onClick={() => setChoiceOpen(true)}
                  className="mt-3 flex w-full cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3.5 py-2.5 text-left text-[13px] font-medium text-[#E7EDE8]"
                >
                  Stel je programma in (30 sec)
                  <span className="text-[#7E8C82]">›</span>
                </button>
              </div>
            )
          ) : null}
        </div>
      </div>

      {sessionEntry ? (
        <MovementProgramSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          entry={sessionEntry}
          profile={profile}
          current={movementCurrent}
          busy={prefsBusy}
          onSave={(patch) => void saveProfilePatch(patch)}
          onToggleSport={toggleSport}
        />
      ) : null}
    </CockpitShell>
  );
}
