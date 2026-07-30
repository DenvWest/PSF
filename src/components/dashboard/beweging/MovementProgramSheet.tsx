"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { SPORT_CATALOG } from "@/data/movement/sport-catalog";
import type {
  MovementSessionCatalogEntry,
  MovementTrainingLocation,
} from "@/data/movement/session-catalog";
import {
  MOVEMENT_TARGET_DAYS_MAX,
  MOVEMENT_TARGET_DAYS_MIN,
  MOVEMENT_TARGET_DAYS_PRESETS,
  MOVEMENT_TARGET_MINUTES_MAX,
  MOVEMENT_TARGET_MINUTES_MIN,
  MOVEMENT_TARGET_MINUTES_PRESETS,
  MOVEMENT_TARGET_STRENGTH_OPTIONS,
} from "@/data/movement/targets";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import {
  buildGuidelineLine,
  buildMovementTargetGap,
  resolveEffectiveMovementTarget,
  resolveMovementProgramDose,
  type MovementCurrent,
} from "@/lib/movement-target";
import type { MovementPlanProfile, MovementPlanProfilePatch } from "@/lib/movement-plan-profile";
import { MOVEMENT_START_PATTERN_OPTIONS } from "@/lib/movement-prefs";
import { buildMovementSportLens } from "@/lib/movement-sport-lens";

export type MovementProgramSheetProps = {
  open: boolean;
  onClose: () => void;
  entry: MovementSessionCatalogEntry;
  profile: MovementPlanProfile;
  current: MovementCurrent;
  checkinHref: string;
  busy: boolean;
  progHot: boolean;
  onSave: (patch: MovementPlanProfilePatch) => void;
  onToggleSport: (sportId: string) => void;
};

const LOCATION_OPTIONS: { id: MovementTrainingLocation; label: string }[] = [
  { id: "thuis", label: "Thuis" },
  { id: "sportschool", label: "Sportschool" },
];

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[12px] text-[#9FB0A6]">
      <span className="font-mono text-[9px] uppercase tracking-[0.09em] text-[#7E8C82]">
        {label}
      </span>
      <strong className="font-semibold text-[#F1EFE8]">{value}</strong>
    </span>
  );
}

function ChipRow<T extends string | number>({
  options,
  value,
  disabled,
  onSelect,
}: {
  options: readonly { id: T; label: string }[];
  value: T | null;
  disabled: boolean;
  onSelect: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          disabled={disabled}
          aria-pressed={value === option.id}
          onClick={() => onSelect(option.id)}
          className={`cursor-pointer rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors disabled:opacity-60 ${
            value === option.id
              ? "border-[color:var(--ac)]/60 bg-[color:var(--ac)]/15 text-[#F1EFE8]"
              : "border-white/15 text-[#CDD7D0] hover:border-white/25"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Vier presets + "anders" — nooit een lange rij losse knoppen voor een open getal. */
function PresetRow({
  unit,
  presets,
  value,
  min,
  max,
  disabled,
  onCommit,
}: {
  unit: string;
  presets: readonly number[];
  value: number | null;
  min: number;
  max: number;
  disabled: boolean;
  onCommit: (value: number) => void;
}) {
  const isPreset = value !== null && presets.includes(value);
  const [customOpen, setCustomOpen] = useState(value !== null && !isPreset);
  const [draft, setDraft] = useState(value !== null && !isPreset ? String(value) : "");
  const [trackedValue, setTrackedValue] = useState(value);
  if (value !== trackedValue) {
    setTrackedValue(value);
    if (value !== null && !isPreset) {
      setCustomOpen(true);
      setDraft(String(value));
    }
  }

  const commitDraft = () => {
    const parsed = Math.round(Number(draft));
    if (!Number.isFinite(parsed)) {
      return;
    }
    onCommit(Math.min(max, Math.max(min, parsed)));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            disabled={disabled}
            aria-pressed={!customOpen && value === preset}
            onClick={() => {
              setCustomOpen(false);
              onCommit(preset);
            }}
            className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              !customOpen && value === preset
                ? "border-[color:var(--ac)]/60 bg-[color:var(--ac)]/15 text-[#F1EFE8]"
                : "border-white/15 text-[#CDD7D0] hover:border-white/25"
            }`}
          >
            {preset} {unit}
          </button>
        ))}
        <button
          type="button"
          disabled={disabled}
          aria-pressed={customOpen}
          onClick={() => setCustomOpen(true)}
          className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            customOpen
              ? "border-[color:var(--ac)]/60 bg-[color:var(--ac)]/15 text-[#F1EFE8]"
              : "border-white/15 text-[#CDD7D0] hover:border-white/25"
          }`}
        >
          Anders
        </button>
      </div>
      {customOpen ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            value={draft}
            disabled={disabled}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                commitDraft();
              }
            }}
            placeholder={`${min}–${max}`}
            className="w-24 rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-[13px] text-[#F1EFE8] outline-none focus:border-[color:var(--ac)]/60"
            aria-label={`Eigen waarde in ${unit}`}
          />
          <span className="text-[12px] text-[#7E8C82]">{unit}</span>
          <button
            type="button"
            disabled={disabled || draft.trim() === ""}
            onClick={commitDraft}
            className="cursor-pointer rounded-lg border border-white/15 px-3 py-1.5 text-[12px] font-semibold text-[#CDD7D0] hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Zet
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function MovementProgramSheet({
  open,
  onClose,
  entry,
  profile,
  current,
  checkinHref,
  busy,
  progHot,
  onSave,
  onToggleSport,
}: MovementProgramSheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const [sportsOpen, setSportsOpen] = useState(false);
  const [variantOpen, setVariantOpen] = useState(false);
  const openedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      openedRef.current = false;
      return;
    }
    if (!openedRef.current) {
      openedRef.current = true;
      trackEvent("dashboard_beweging_programma_open", { from: "kompas_beweging" });
      emitAccountClientEvent("dashboard.beweging_programma_open", { from: "kompas_beweging" });
      clarityTag("dashboard_kompas_view", "programma_sheet");
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const exercises = entry.exercises ?? [];
  const rawTarget = {
    minutes: profile.targetMinutes,
    days: profile.targetDays,
    strength: profile.targetStrength,
  };
  const effectiveTarget = resolveEffectiveMovementTarget(rawTarget, current);
  const suggestedTarget = resolveEffectiveMovementTarget(
    { minutes: null, days: null, strength: null },
    current,
  );
  const dose = resolveMovementProgramDose(effectiveTarget);
  const gap = buildMovementTargetGap(effectiveTarget, current);
  const guideline = buildGuidelineLine(effectiveTarget);
  const lens = buildMovementSportLens(profile.sports);

  return (
    <div className="fixed inset-0 z-[100]" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Sluit je programma"
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed bottom-0 left-0 right-0 flex max-h-[88vh] flex-col rounded-t-2xl border border-white/10 bg-[#0F1917] shadow-2xl outline-none md:bottom-auto md:left-auto md:right-0 md:top-0 md:h-dvh md:max-h-none md:w-[440px] md:rounded-none md:rounded-l-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
              Jouw programma
            </p>
            <h2 id={titleId} className="mt-1 font-serif text-[19px] text-[#F1EFE8]">
              {entry.label}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-9 shrink-0 cursor-pointer items-center rounded-lg border-none bg-transparent px-2 text-[18px] leading-none text-[#9FB0A6] transition-colors hover:text-[#F1EFE8]"
            aria-label="Sluiten"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto px-5 py-5">
          <div>
            <p className="max-w-[68ch] text-[13px] leading-relaxed text-[#CDD7D0]">
              {entry.goal}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <InfoChip label="Duur" value={entry.durationMin} />
              <InfoChip label="Frequentie" value={entry.frequency} />
              <InfoChip label="Intensiteit" value={entry.intensity} />
              <span
                className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.09em] ${
                  progHot
                    ? "border-[#79B98C]/50 bg-[#5A8F6A]/12 text-[#79B98C]"
                    : "border-white/10 text-[#9FB0A6]"
                }`}
              >
                {progHot ? "programma bijgewerkt" : "ongewijzigd door je sport"}
              </span>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9FB0A6]">
              Wat je doet
            </p>
            {entry.detailStatus === "coming_soon" ? (
              <div className="rounded-xl border border-dashed border-white/15 bg-black/10 px-4 py-3.5">
                <p className="text-[13px] leading-relaxed text-[#CDD7D0]">
                  De oefeningen per stap volgen nog voor dit programma — geen lijst tonen we
                  liever niet dan een verzonnen.
                </p>
                <p className="mt-2 max-w-[68ch] text-[12px] leading-relaxed text-[#9FB0A6]">
                  Voor nu geldt de algemene opbouw: {entry.structure}
                </p>
              </div>
            ) : exercises.length > 0 ? (
              <ol className="space-y-2.5">
                {exercises.map((exercise) => (
                  <li
                    key={exercise.name}
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-serif text-[15px] text-[#F1EFE8]">{exercise.name}</p>
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-[#9FB0A6]">
                        {exercise.reps}
                      </span>
                    </div>
                    <p className="mt-1.5 max-w-[68ch] text-[12.5px] leading-relaxed text-[#9FB0A6]">
                      {exercise.cue}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="max-w-[68ch] text-[13px] leading-relaxed text-[#CDD7D0]">
                {entry.structure}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-white/15 bg-black/25 px-4 py-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9FB0A6]">
              Jouw doel
            </p>
            {current.source === "beweegcheck" ? (
              <p className="mb-3 max-w-[68ch] text-[12.5px] leading-relaxed text-[#9FB0A6]">
                Uit je beweegcheck:{" "}
                {current.moderateLabel ? (
                  <>
                    matig <strong className="text-[#F1EFE8]">{current.moderateLabel}</strong>
                    {current.vigorousLabel ? ", " : ""}
                  </>
                ) : null}
                {current.vigorousLabel ? (
                  <>
                    intensief <strong className="text-[#F1EFE8]">{current.vigorousLabel}</strong>
                  </>
                ) : null}
                {current.strengthLabel ? (
                  <>
                    {" · "}kracht <strong className="text-[#F1EFE8]">{current.strengthLabel}</strong>
                  </>
                ) : null}
                .
              </p>
            ) : (
              <p className="mb-3 max-w-[68ch] text-[12.5px] leading-relaxed text-[#9FB0A6]">
                {current.source === "basischeck"
                  ? "Je basischeck kent je frequentie, niet je minuten."
                  : "Nog geen beweegcheck gedaan."}{" "}
                <Link
                  href={checkinHref}
                  className="font-semibold text-[color:var(--ac)] underline decoration-[color:var(--ac)]/40 underline-offset-2"
                >
                  Doe de beweegcheck →
                </Link>
              </p>
            )}

            <p className="mb-3 max-w-[68ch] text-[12px] leading-relaxed text-[#7E8C82]">
              Startadvies: ongeveer {suggestedTarget.minutes} min per week over{" "}
              {suggestedTarget.days} dagen
              {suggestedTarget.strength ? `, ${suggestedTarget.strength}× kracht` : ""}. Zet
              hieronder je eigen doel.
            </p>

            <div className="space-y-4">
              <div>
                <p className="mb-1.5 text-[11px] font-medium text-[#9FB0A6]">Minuten per week</p>
                <PresetRow
                  unit="min"
                  presets={MOVEMENT_TARGET_MINUTES_PRESETS}
                  value={profile.targetMinutes}
                  min={MOVEMENT_TARGET_MINUTES_MIN}
                  max={MOVEMENT_TARGET_MINUTES_MAX}
                  disabled={busy}
                  onCommit={(value) => onSave({ targetMinutes: value })}
                />
              </div>
              <div>
                <p className="mb-1.5 text-[11px] font-medium text-[#9FB0A6]">Op hoeveel dagen</p>
                <PresetRow
                  unit="dagen"
                  presets={MOVEMENT_TARGET_DAYS_PRESETS}
                  value={profile.targetDays}
                  min={MOVEMENT_TARGET_DAYS_MIN}
                  max={MOVEMENT_TARGET_DAYS_MAX}
                  disabled={busy}
                  onCommit={(value) => onSave({ targetDays: value })}
                />
              </div>
              <div>
                <p className="mb-1.5 text-[11px] font-medium text-[#9FB0A6]">
                  Krachtsessies per week
                </p>
                <ChipRow
                  options={MOVEMENT_TARGET_STRENGTH_OPTIONS}
                  value={profile.targetStrength}
                  disabled={busy}
                  onSelect={(id) => onSave({ targetStrength: id })}
                />
              </div>
            </div>

            {dose ? (
              <div className="mt-3 rounded-lg border border-white/10 bg-black/25 px-3 py-2.5">
                <p className="text-[12.5px] leading-relaxed text-[#CDD7D0]">
                  <strong className="font-semibold text-[#F1EFE8]">
                    {dose.sessionsPerWeek}× per week, ongeveer {dose.minutesPerSession} minuten
                  </strong>
                  {dose.strengthSessions > 0
                    ? `, waarvan ${dose.strengthSessions}× kracht.`
                    : "."}
                </p>
                {gap.minutesDelta !== null && gap.minutesDelta !== 0 ? (
                  <p className="mt-1 text-[12px] leading-relaxed text-[#9FB0A6]">
                    {gap.minutesDelta > 0 ? `+${gap.minutesDelta}` : gap.minutesDelta} minuten
                    t.o.v. je beweegcheck.
                  </p>
                ) : null}
              </div>
            ) : null}

            {guideline ? (
              <p className="mt-2 max-w-[68ch] text-[11px] leading-relaxed text-[#7E8C82]">
                {guideline}
              </p>
            ) : null}
          </div>

          <div>
            <button
              type="button"
              onClick={() => setSportsOpen((v) => !v)}
              aria-expanded={sportsOpen}
              className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-left"
            >
              <span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9FB0A6]">
                  Wat je verder doet
                </span>
                <span className="mt-1 block text-[13px] text-[#F1EFE8]">
                  {profile.sports.length > 0
                    ? profile.sports
                        .map((id) => SPORT_CATALOG.find((s) => s.id === id)?.label ?? id)
                        .join(", ")
                    : "Nog geen sport gekoppeld"}
                </span>
              </span>
              <span className="text-[#7E8C82]">{sportsOpen ? "▴" : "▾"}</span>
            </button>
            {sportsOpen ? (
              <div className="mt-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3.5">
                <p className="mb-2 text-[12px] leading-relaxed text-[#9FB0A6]">{lens.headline}</p>
                <div className="flex flex-wrap gap-2">
                  {SPORT_CATALOG.map((sport) => {
                    const selected = profile.sports.includes(sport.id);
                    const atMax = profile.sports.length >= 3 && !selected;
                    return (
                      <button
                        key={sport.id}
                        type="button"
                        disabled={busy || atMax}
                        onClick={() => onToggleSport(sport.id)}
                        className={`cursor-pointer rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                          selected
                            ? "border-[color:var(--ac)]/60 bg-[color:var(--ac)]/15 text-[#F1EFE8]"
                            : "border-white/15 text-[#CDD7D0] hover:border-white/25"
                        }`}
                      >
                        {sport.label}
                        {sport.status === "beta" ? " · beta" : ""}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 max-w-[68ch] text-[11px] leading-relaxed text-[#7E8C82]">
                  Dit telt mee in je weekbalans op Beweging. Maximaal drie sporten.
                </p>
              </div>
            ) : null}
          </div>

          <div>
            <button
              type="button"
              onClick={() => setVariantOpen((v) => !v)}
              aria-expanded={variantOpen}
              className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-medium text-[#9FB0A6] underline decoration-white/20 underline-offset-3"
            >
              ▸ Een andere vorm proberen{variantOpen ? " ▴" : ""}
            </button>
            {variantOpen ? (
              <div className="mt-3 space-y-4 rounded-xl border border-white/10 bg-black/20 px-4 py-4">
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9FB0A6]">
                    Je spoor
                  </p>
                  <ChipRow
                    options={MOVEMENT_START_PATTERN_OPTIONS}
                    value={profile.startPattern}
                    disabled={busy}
                    onSelect={(id) => onSave({ startPattern: id })}
                  />
                </div>
                {profile.startPattern && profile.startPattern !== "dagelijks_ritme" ? (
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9FB0A6]">
                      Waar train je
                    </p>
                    <ChipRow
                      options={LOCATION_OPTIONS}
                      value={profile.trainingLocation}
                      disabled={busy}
                      onSelect={(id) => onSave({ trainingLocation: id })}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}
