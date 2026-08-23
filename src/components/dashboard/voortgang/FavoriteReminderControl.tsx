"use client";

import { useRef, useState } from "react";
import AgendaTimePopover from "@/components/dashboard/agenda/AgendaTimePopover";
import CookieConsentToggle from "@/components/analytics/cookie-consent/CookieConsentToggle";
import { deriveDefaultScheduledTime, isValidLocalTime } from "@/lib/account-priority-pref";
import { resolveNowPickerTime } from "@/lib/agenda-time-picker";
import {
  useVoortgangFavorites,
  type VoortgangFavoriteItem,
} from "@/lib/voortgang-favorites-context";

type FavoriteReminderControlProps = {
  item: VoortgangFavoriteItem;
  surface: string;
  compact?: boolean;
};

const INTERVAL_OPTIONS = [15, 30, 60, 120] as const;
const DEFAULT_END_TIME = "17:00";
const DEFAULT_INTERVAL_MINUTES = 60;

const TRIGGER =
  "inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-lg border border-white/10 bg-black/25 px-2.5 text-[12px] font-medium tabular-nums text-[#F1EFE8] transition-colors hover:border-white/25";
const CHIP =
  "inline-flex min-h-8 cursor-pointer items-center justify-center rounded-full border px-2.5 text-[11.5px] font-medium transition-colors";
const CHIP_ON = `${CHIP} border-[rgba(90,143,106,0.55)] bg-[rgba(90,143,106,0.2)] text-[#F1EFE8]`;
const CHIP_OFF = `${CHIP} border-white/10 bg-white/[0.03] text-[#9FB0A6] hover:border-white/25`;

/** Trigger-knop + AgendaTimePopover — dezelfde tijdkiezer als de agenda, los
 * van agenda_blocks. Vervangt een kaal `<input type="time">`, dat met
 * browser-eigen chrome rendert en niet met het donkere thema meekleurt. */
function TimeTriggerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (time: string) => void;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  function openPopover() {
    setDraft(value);
    setOpen(true);
  }

  function confirm() {
    onChange(draft);
    setOpen(false);
  }

  return (
    <span className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openPopover())}
        className={TRIGGER}
      >
        {value}
        <span aria-hidden className="text-[#9FB0A6]">
          ▾
        </span>
      </button>
      {open ? (
        <AgendaTimePopover
          draftTime={draft}
          isDark
          anchorRef={triggerRef}
          onDraftChange={setDraft}
          onConfirm={confirm}
          onNow={() => {
            onChange(resolveNowPickerTime());
            setOpen(false);
          }}
          onClear={() => setDraft(deriveDefaultScheduledTime("ochtend"))}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </span>
  );
}

/**
 * Tijdstip + aan/uit-melding op een al bewaarde leefstijlladder-keuze.
 *
 * Rendert `null` tenzij de actie al bij "Mijn keuze" staat — tijd/alert leven
 * op dezelfde `account_favorites`-rij als de keuze zelf, dus tonen vóór het
 * bewaren zou een tijd instellen de actie stiekem óók favoriet maken.
 *
 * Voorbereidend veld: er wordt hier nog niets verstuurd (geen Web Push, geen
 * wearable-uitlezing). "Herhaalt zich" zet een tijdvenster + interval (voor
 * doelen als "elk werkuur even staan"); zonder dat blijft het één tijdstip.
 */
export default function FavoriteReminderControl({
  item,
  surface,
}: FavoriteReminderControlProps) {
  const { items, isSaved, updateReminder } = useVoortgangFavorites();

  if (!isSaved(item.id)) {
    return null;
  }

  const current = items.find((row) => row.id === item.id) ?? item;
  const hasWindow = Boolean(current.reminderEndTime && current.reminderIntervalMinutes);
  const startTime = current.reminderStartTime ?? deriveDefaultScheduledTime("ochtend");

  function persist(patch: Partial<VoortgangFavoriteItem>) {
    updateReminder({ ...current, ...patch }, surface);
  }

  function setStartTime(time: string) {
    if (isValidLocalTime(time)) {
      persist({ reminderStartTime: time });
    }
  }

  function setEndTime(time: string) {
    if (isValidLocalTime(time)) {
      persist({ reminderEndTime: time });
    }
  }

  function toggleWindow() {
    if (hasWindow) {
      persist({ reminderEndTime: undefined, reminderIntervalMinutes: undefined });
      return;
    }
    persist({
      reminderStartTime: startTime,
      reminderEndTime: DEFAULT_END_TIME,
      reminderIntervalMinutes: DEFAULT_INTERVAL_MINUTES,
    });
  }

  function toggleAlert(checked: boolean) {
    const patch: Partial<VoortgangFavoriteItem> = { alertEnabled: checked };
    if (checked && !current.reminderStartTime) {
      patch.reminderStartTime = deriveDefaultScheduledTime("ochtend");
    }
    persist(patch);
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11.5px]">
      <TimeTriggerField label="Tijdstip" value={startTime} onChange={setStartTime} />

      <button
        type="button"
        aria-pressed={hasWindow}
        onClick={toggleWindow}
        className={hasWindow ? CHIP_ON : CHIP_OFF}
      >
        Herhaalt zich
      </button>

      {hasWindow ? (
        <>
          <span className="text-[#9FB0A6]">tot</span>
          <TimeTriggerField
            label="Eindtijd"
            value={current.reminderEndTime ?? DEFAULT_END_TIME}
            onChange={setEndTime}
          />
          <span className="text-[#9FB0A6]">elke</span>
          <div className="inline-flex gap-1">
            {INTERVAL_OPTIONS.map((minutes) => (
              <button
                key={minutes}
                type="button"
                aria-pressed={current.reminderIntervalMinutes === minutes}
                onClick={() => persist({ reminderIntervalMinutes: minutes })}
                className={current.reminderIntervalMinutes === minutes ? CHIP_ON : CHIP_OFF}
              >
                {minutes}m
              </button>
            ))}
          </div>
        </>
      ) : null}

      <span className="ml-0.5 flex items-center gap-1.5">
        <CookieConsentToggle
          checked={current.alertEnabled ?? false}
          onChange={toggleAlert}
          label="Melding aan/uit"
        />
        <span className="text-[#9FB0A6]">Melding</span>
      </span>
    </div>
  );
}
