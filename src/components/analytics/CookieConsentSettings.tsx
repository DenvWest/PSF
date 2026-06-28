"use client";

type CookieConsentSettingsProps = {
  analyticsEnabled: boolean;
  onAnalyticsChange: (enabled: boolean) => void;
  onBack: () => void;
  onSave: () => void;
  busy: boolean;
};

function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition ${
        checked ? "bg-ps-green" : "bg-stone-300"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 translate-y-0.5 rounded-full bg-white shadow transition ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function CookieConsentSettings({
  analyticsEnabled,
  onAnalyticsChange,
  onBack,
  onSave,
  busy,
}: CookieConsentSettingsProps) {
  return (
    <div className="grid gap-5">
      <button
        type="button"
        onClick={onBack}
        disabled={busy}
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-stone-600 transition hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        ← Terug
      </button>

      <h2 id="cookie-settings-title" className="text-lg font-semibold text-stone-900">
        Cookie-instellingen
      </h2>

      <div className="grid gap-4">
        <article className="rounded-xl border border-stone-200 bg-stone-50/60 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Strikt noodzakelijk</h3>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">
                Nodig om de site te laten werken, zoals sessies en beveiliging. Deze cookies
                kunnen niet worden uitgeschakeld.
              </p>
            </div>
            <Toggle checked disabled label="Strikt noodzakelijk cookies" />
          </div>
        </article>

        <article className="rounded-xl border border-stone-200 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Analytisch</h3>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">
                Google Analytics en Microsoft Clarity helpen ons begrijpen hoe bezoekers de site
                gebruiken, zodat we navigatie en content kunnen verbeteren.
              </p>
            </div>
            <Toggle
              checked={analyticsEnabled}
              onChange={onAnalyticsChange}
              label="Analytische cookies"
            />
          </div>
        </article>
      </div>

      <div className="grid gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={onSave}
          aria-busy={busy}
          className="min-h-[44px] w-full rounded-lg bg-ps-green px-4 py-3 text-sm font-semibold text-white transition hover:bg-ps-green-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          Voorkeuren opslaan
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onBack}
          className="min-h-[44px] w-full rounded-lg border border-ps-green bg-white px-4 py-3 text-sm font-semibold text-ps-green transition hover:bg-ps-green-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          Terug
        </button>
      </div>
    </div>
  );
}
