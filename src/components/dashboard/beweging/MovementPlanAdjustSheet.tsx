"use client";

import {
  MOVEMENT_START_PATTERN_OPTIONS,
  startPatternLabel,
} from "@/lib/movement-prefs";
import { MOVEMENT_FREQUENCY_OPTIONS } from "@/data/movement/session-catalog";
import type { MovementTrainingLocation } from "@/data/movement/session-catalog";
import type { MovementPlanProfile } from "@/lib/movement-plan-profile";
import type { MovementWeeklyFrequency } from "@/data/movement/session-catalog";
import type { MovementStartPattern } from "@/lib/movement-prefs";

export type MovementPlanAdjustSheetProps = {
  open: boolean;
  profile: MovementPlanProfile;
  busy: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSave: (patch: {
    startPattern?: MovementStartPattern;
    trainingLocation?: MovementTrainingLocation;
    weeklyFrequency?: MovementWeeklyFrequency;
  }) => void;
};

const LOCATION_OPTIONS: { id: MovementTrainingLocation; label: string }[] = [
  { id: "thuis", label: "Thuis" },
  { id: "sportschool", label: "Sportschool" },
];

function ConfigRow({
  label,
  tag,
  children,
}: {
  label: string;
  tag: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9FB0A6]">
          {label}
        </p>
        <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.09em] text-[#7E8C82]">
          {tag}
        </span>
      </div>
      {children}
    </div>
  );
}

function ChipRow<T extends string>({
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

export default function MovementPlanAdjustSheet({
  open,
  profile,
  busy,
  onOpen,
  onClose,
  onSave,
}: MovementPlanAdjustSheetProps) {
  if (!open) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="w-full cursor-pointer rounded-xl border border-dashed border-white/20 bg-black/10 px-4 py-3 text-left text-[13px] font-medium text-[#CDD7D0] hover:border-white/30"
      >
        Plan aanpassen — spoor, locatie, frequentie
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-white/15 bg-black/25 px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9FB0A6]">
          Jouw route
        </p>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer border-none bg-transparent p-0 text-[12px] font-medium text-[#9FB0A6]"
        >
          Sluiten
        </button>
      </div>

      <div className="space-y-4">
        <ConfigRow label="Je spoor" tag="stuurt je programma">
          <ChipRow
            options={MOVEMENT_START_PATTERN_OPTIONS}
            value={profile.startPattern}
            disabled={busy}
            onSelect={(id) => onSave({ startPattern: id })}
          />
        </ConfigRow>

        {profile.startPattern && profile.startPattern !== "dagelijks_ritme" ? (
          <>
            <ConfigRow label="Waar train je" tag="stuurt je programma">
              <ChipRow
                options={LOCATION_OPTIONS}
                value={profile.trainingLocation}
                disabled={busy}
                onSelect={(id) => onSave({ trainingLocation: id })}
              />
            </ConfigRow>
            <ConfigRow label="Hoe vaak per week" tag="stuurt je dosis">
              <ChipRow
                options={MOVEMENT_FREQUENCY_OPTIONS}
                value={profile.weeklyFrequency}
                disabled={busy}
                onSelect={(id) => onSave({ weeklyFrequency: id })}
              />
            </ConfigRow>
          </>
        ) : null}

        <ConfigRow label="Wat doe je al" tag="kleurt alleen de uitleg">
          <p className="max-w-[68ch] text-[13px] leading-relaxed text-[#9FB0A6]">
            Je sporten kies je in de kaart hierboven. Ze veranderen nooit je programma.
          </p>
        </ConfigRow>
      </div>

      {profile.startPattern ? (
        <p className="mt-4 max-w-[68ch] text-[12px] leading-relaxed text-[#7E8C82]">
          Huidig spoor: {startPatternLabel(profile.startPattern).toLowerCase()}.
        </p>
      ) : null}
    </div>
  );
}
