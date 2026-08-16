"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/account/AuthShell";
import ConnectionProfileResult, {
  type HighlightKind,
} from "@/components/connection-profile/ConnectionProfileResult";
import {
  CONNECTION_ACTIVITIES,
  CONNECTION_AGE_BANDS,
  CONNECTION_AVAILABILITY,
  CONNECTION_FORMS,
  CONNECTION_NOTE_MAX_LENGTH,
  CONNECTION_TOPICS,
  CONNECTION_TRAVEL_RADIUS,
  type ActivityId,
  type AvailabilityId,
  type ConnectionFormId,
  type TopicId,
} from "@/data/connection/vocabulary";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import { CONNECTION_PROFILE_CONSENT_TEXT } from "@/lib/consent-texts";
import type { ProfileContentItem } from "@/lib/connection-content";
import {
  isProfileUsable,
  resolveProfileHighlights,
} from "@/lib/connection-profile/highlights";
import {
  EMPTY_CONNECTION_PROFILE,
  type ConnectionProfile,
} from "@/lib/connection-profile/types";
import { trackEvent } from "@/lib/ga4";

/**
 * "Wat bij jou past" — de zesstapsflow uit
 * BESLUIT_CONNECTION_PROFILE_V1_2026-08.md §6 plus de vaste opbrengst.
 *
 * Twee toestanden, één adres: wie nog niets invulde krijgt de flow, wie al iets
 * invulde komt binnen op "Dit past bij jou" en kan per blok terug de flow in.
 * Dat is het verschil tussen een profiel dat ergens woont en een formulier dat
 * zijn opbrengst één keer laat zien en daarna weer een formulier is.
 *
 * Stap 2 ("waar zou je iemand mee kunnen helpen") is de enige aanname in het
 * hele ontwerp die niet uit bestaand bewijs volgt — vandaar
 * cprofile.step_completed per stap: dat is de meting die hem toetst.
 */

type ConnectionProfileScreenProps = {
  initialProfile: ConnectionProfile | null;
  initialContent: ProfileContentItem[];
  consentGranted: boolean;
  /** Deep-link vanaf het dashboard: direct bewerken in plaats van de uitkomst. */
  startInEdit: boolean;
};

type StepId = 1 | 2 | 3 | 4 | 5 | 6;

const LAST_STEP: StepId = 6;

const STEP_COPY: Record<StepId, { title: string; body: string; hint: string }> = {
  1: {
    title: "Waar gaat je aandacht naar uit?",
    body: "Waar je uit jezelf over leest, naar kijkt of mee bezig bent. Dit bepaalt wat wij je laten zien.",
    hint: "Kies er 3 tot 6.",
  },
  2: {
    title: "Waar zou je iemand mee kunnen helpen?",
    body: "Niet waar je de beste in bent — waar je genoeg van weet om iemand op weg te helpen. Dat is een lagere lat dan je denkt, en het is precies waar mensen elkaar op vinden.",
    hint: "Kies er 1 tot 4.",
  },
  3: {
    title: "Waar wil jij beter in worden?",
    body: "Iets waar je nog niet ver in bent, maar wel heen wilt.",
    hint: "Kies er 1 tot 3.",
  },
  4: {
    title: "Wat doe je al met enige regelmaat?",
    body: "Iets wat al in je week zit is het goedkoopste moment om iemand bij te vragen. Doe je nog niets vasts, dan is dat ook een antwoord.",
    hint: "Kies er hooguit 4. Overslaan mag.",
  },
  5: {
    title: "Hoe zie je contact het liefst?",
    body: "Dit bepaalt de vorm van wat we je voorstellen — niet met wie.",
    hint: "Kies minstens één vorm.",
  },
  6: {
    title: "Waar zoek je het?",
    body: "Grofmazig, en alleen wat nodig is: de eerste twee cijfers van je postcode, hoe ver je wilt gaan, en welke leeftijden je zoekt.",
    hint: "Alles op dit scherm is optioneel.",
  },
};

const MAX_INTERESTS = 6;
const MIN_INTERESTS = 3;
const MAX_BRENGEN = 4;
const MAX_ONTDEKKEN = 3;
const MAX_DOET = 4;

const CHIP_BASE =
  "cursor-pointer rounded-full border px-3.5 py-2 text-[13.5px] leading-snug transition disabled:cursor-not-allowed disabled:opacity-45";
const CHIP_ON = "border-[var(--sage)] bg-[var(--sage)]/[0.22] text-[var(--text)]";
const CHIP_OFF =
  "border-[var(--panel-border)] bg-[var(--panel)] text-[var(--text-muted)] hover:text-[var(--text)]";

function toggleValue<T extends string>(values: T[], value: T, max: number): T[] {
  if (values.includes(value)) {
    return values.filter((item) => item !== value);
  }
  if (values.length >= max) {
    return values;
  }
  return [...values, value];
}

function Chips<T extends string>({
  options,
  selected,
  max,
  onToggle,
}: {
  options: readonly { id: T; label: string }[];
  selected: T[];
  max: number;
  onToggle: (id: T) => void;
}) {
  const atMax = selected.length >= max;
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const on = selected.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={on}
            disabled={!on && atMax}
            onClick={() => onToggle(option.id)}
            className={`${CHIP_BASE} ${on ? CHIP_ON : CHIP_OFF}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="m-0 text-[13px] font-medium text-[var(--text)]">{label}</p>
      {children}
    </div>
  );
}

export default function ConnectionProfileScreen({
  initialProfile,
  initialContent,
  consentGranted,
  startInEdit,
}: ConnectionProfileScreenProps) {
  const router = useRouter();
  const hasProfile = initialProfile != null && isProfileUsable(initialProfile);

  const [mode, setMode] = useState<"flow" | "result">(
    hasProfile && !startInEdit ? "result" : "flow",
  );
  const [step, setStep] = useState<StepId>(1);
  const [draft, setDraft] = useState<ConnectionProfile>(
    initialProfile ?? EMPTY_CONNECTION_PROFILE,
  );
  const [saved, setSaved] = useState<ConnectionProfile | null>(
    hasProfile ? initialProfile : null,
  );
  const [content, setContent] = useState<ProfileContentItem[]>(initialContent);
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removeConfirm, setRemoveConfirm] = useState(false);
  const [removing, setRemoving] = useState(false);

  const highlights = useMemo(
    () => (saved && isProfileUsable(saved) ? resolveProfileHighlights(saved) : null),
    [saved],
  );

  const patch = (next: Partial<ConnectionProfile>) =>
    setDraft((current) => ({ ...current, ...next }));

  const canAdvance =
    step === 1
      ? draft.interests.length >= MIN_INTERESTS
      : step === 2
        ? draft.brengen.length >= 1
        : step === 3
          ? draft.ontdekken.length >= 1
          : step === 5
            ? draft.vorm.length >= 1
            : true;

  const needsConsent = !consentGranted && !consent;

  function trackStepCompleted(completed: StepId) {
    trackEvent("cprofile_step_completed", { step: completed });
    emitAccountClientEvent("cprofile.step_completed", { step: completed });
    clarityTag("cprofile_step", String(completed));
  }

  function goNext() {
    if (!canAdvance) {
      return;
    }
    trackStepCompleted(step);
    setStep((current) => (current === LAST_STEP ? current : ((current + 1) as StepId)));
  }

  function goBack() {
    setError(null);
    if (step === 1) {
      if (saved) {
        setMode("result");
      }
      return;
    }
    setStep((current) => (current - 1) as StepId);
  }

  async function handleSave() {
    if (saving || needsConsent) {
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/account/connection-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: draft, consent: true }),
      });

      if (!response.ok) {
        setError("Kon je keuzes niet opslaan. Probeer het opnieuw.");
        return;
      }

      const data = (await response.json()) as {
        profile?: ConnectionProfile;
        content?: ProfileContentItem[];
      };
      const savedProfile = data.profile ?? draft;

      trackStepCompleted(LAST_STEP);
      trackEvent("cprofile_completed", {
        n_interest: savedProfile.interests.length,
        n_brengen: savedProfile.brengen.length,
        n_ontdekken: savedProfile.ontdekken.length,
      });
      clarityTag("cprofile", "completed");

      setDraft(savedProfile);
      setSaved(savedProfile);
      setContent(data.content ?? []);
      setMode("result");
      setStep(1);
      // Het dashboard leest hetzelfde profiel; zonder refresh toont de tegel de
      // vorige keuzes tot de volgende harde navigatie.
      router.refresh();
    } catch {
      setError("Kon je keuzes niet opslaan. Probeer het opnieuw.");
    } finally {
      setSaving(false);
    }
  }

  /**
   * `connection_profile_storage` moet los intrekbaar zijn zonder de
   * leefstijlcheck te raken (§7 maatregel 4). Intrekken zonder wissen zou een
   * toestemming zijn die niets terugdraait, dus dit doet beide.
   */
  async function handleRemove() {
    if (!removeConfirm) {
      setRemoveConfirm(true);
      setError(null);
      return;
    }
    if (removing) {
      return;
    }
    setRemoving(true);
    setError(null);

    try {
      const response = await fetch("/api/account/connection-profile", {
        method: "DELETE",
      });
      if (!response.ok) {
        setError("Kon je keuzes niet verwijderen. Probeer het opnieuw.");
        setRemoveConfirm(false);
        return;
      }
      trackEvent("cprofile_deleted", { surface: "wat_bij_jou_past" });
      clarityTag("cprofile", "deleted");
      router.push("/dashboard");
    } catch {
      setError("Kon je keuzes niet verwijderen. Probeer het opnieuw.");
      setRemoveConfirm(false);
    } finally {
      setRemoving(false);
    }
  }

  function handleHighlightClick(kind: HighlightKind) {
    trackEvent("cprofile_highlight_click", { kind });
    emitAccountClientEvent("cprofile.highlight_clicked", { kind });
    clarityTag("cprofile_highlight", kind);
  }

  if (mode === "result" && saved && highlights) {
    return (
      <AuthShell exitHref="/dashboard" maxWidth="min(94vw, 1024px)">
        <ConnectionProfileResult
          profile={saved}
          highlights={highlights}
          content={content}
          onEdit={(target) => {
            setDraft(saved);
            setStep(target);
            setMode("flow");
          }}
          onHighlightClick={handleHighlightClick}
          onRemove={() => void handleRemove()}
          removeConfirm={removeConfirm}
          removing={removing}
        />
        {error ? (
          <p role="alert" className="m-0 text-[13.5px] leading-relaxed text-[var(--terra)]">
            {error}
          </p>
        ) : null}
      </AuthShell>
    );
  }

  const copy = STEP_COPY[step];

  return (
    <AuthShell exitHref="/dashboard" maxWidth="min(94vw, 640px)">
      <div
        className="h-[3px] w-full overflow-hidden rounded-full bg-[var(--divider)]"
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={LAST_STEP}
        aria-label="Voortgang"
      >
        <div
          className="h-full bg-[var(--sage)] transition-[width] duration-300 ease-out"
          style={{ width: `${(step / LAST_STEP) * 100}%` }}
        />
      </div>

      <header className="flex flex-col gap-2">
        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--sage)]">
          Wat bij jou past · stap {step} van {LAST_STEP}
        </p>
        <h1 className="m-0 font-serif text-[26px] leading-[1.18] text-[var(--text)]">
          {copy.title}
        </h1>
        <p className="m-0 max-w-[56ch] text-[14px] leading-relaxed text-[var(--text-muted)]">
          {copy.body}
        </p>
        <p className="m-0 text-[12.5px] text-[var(--text-subtle)]">{copy.hint}</p>
      </header>

      {step === 1 ? (
        <Chips<TopicId>
          options={CONNECTION_TOPICS}
          selected={draft.interests}
          max={MAX_INTERESTS}
          onToggle={(id) =>
            patch({ interests: toggleValue(draft.interests, id, MAX_INTERESTS) })
          }
        />
      ) : null}

      {step === 2 ? (
        <Chips<TopicId>
          options={CONNECTION_TOPICS}
          selected={draft.brengen}
          max={MAX_BRENGEN}
          onToggle={(id) => patch({ brengen: toggleValue(draft.brengen, id, MAX_BRENGEN) })}
        />
      ) : null}

      {step === 3 ? (
        <Chips<TopicId>
          options={CONNECTION_TOPICS}
          selected={draft.ontdekken}
          max={MAX_ONTDEKKEN}
          onToggle={(id) =>
            patch({ ontdekken: toggleValue(draft.ontdekken, id, MAX_ONTDEKKEN) })
          }
        />
      ) : null}

      {step === 4 ? (
        <Chips<ActivityId>
          options={CONNECTION_ACTIVITIES}
          selected={draft.doet}
          max={MAX_DOET}
          onToggle={(id) => patch({ doet: toggleValue(draft.doet, id, MAX_DOET) })}
        />
      ) : null}

      {step === 5 ? (
        <div className="flex flex-col gap-5">
          <Field label="Hoe zie je contact het liefst?">
            <Chips<ConnectionFormId>
              options={CONNECTION_FORMS}
              selected={draft.vorm}
              max={CONNECTION_FORMS.length}
              onToggle={(id) =>
                patch({ vorm: toggleValue(draft.vorm, id, CONNECTION_FORMS.length) })
              }
            />
          </Field>
          <Field label="Wanneer kan het?">
            <Chips<AvailabilityId>
              options={CONNECTION_AVAILABILITY}
              selected={draft.beschikbaarheid}
              max={CONNECTION_AVAILABILITY.length}
              onToggle={(id) =>
                patch({
                  beschikbaarheid: toggleValue(
                    draft.beschikbaarheid,
                    id,
                    CONNECTION_AVAILABILITY.length,
                  ),
                })
              }
            />
          </Field>
        </div>
      ) : null}

      {step === 6 ? (
        <div className="flex flex-col gap-5">
          <Field label="Eerste twee cijfers van je postcode">
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={draft.areaPc2 ?? ""}
              onChange={(event) =>
                patch({ areaPc2: event.target.value.replace(/\D/g, "").slice(0, 2) || null })
              }
              placeholder="35"
              aria-label="Eerste twee cijfers van je postcode"
              className="w-24 rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] px-3 py-2.5 text-[15px] text-[var(--text)]"
            />
          </Field>

          <Field label="Hoe ver wil je gaan?">
            <div className="flex flex-wrap gap-2">
              {CONNECTION_TRAVEL_RADIUS.map((option) => {
                const on = draft.travelRadius === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => patch({ travelRadius: on ? null : option.id })}
                    className={`${CHIP_BASE} ${on ? CHIP_ON : CHIP_OFF}`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Welke leeftijden zoek je?">
            <div className="flex flex-wrap gap-2">
              {CONNECTION_AGE_BANDS.map((option) => {
                const isOptOut = option.id === "zeg_ik_liever_niet";
                const on = isOptOut ? draft.ageBand === null : draft.ageBand === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      if (option.id === "zeg_ik_liever_niet" || on) {
                        patch({ ageBand: null });
                        return;
                      }
                      patch({ ageBand: option.id });
                    }}
                    className={`${CHIP_BASE} ${on ? CHIP_ON : CHIP_OFF}`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Waar wil je mee aan de slag? (optioneel)">
            <textarea
              value={draft.note ?? ""}
              maxLength={CONNECTION_NOTE_MAX_LENGTH}
              rows={3}
              onChange={(event) => patch({ note: event.target.value || null })}
              placeholder="Eén zin voor jezelf. Niemand anders ziet dit."
              className="w-full resize-none rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] px-3 py-2.5 text-[14px] leading-relaxed text-[var(--text)]"
            />
            <p className="m-0 text-[11.5px] text-[var(--text-subtle)]">
              {(draft.note ?? "").length} / {CONNECTION_NOTE_MAX_LENGTH} tekens
            </p>
          </Field>

          {!consentGranted ? (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-4">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--sage)]"
              />
              <span className="text-[12.5px] leading-relaxed text-[var(--text-muted)]">
                {CONNECTION_PROFILE_CONSENT_TEXT.connection_profile_storage}
              </span>
            </label>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="m-0 text-[13.5px] leading-relaxed text-[var(--terra)]">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 1 && !saved}
          className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-[13.5px] text-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Terug
        </button>

        <div className="flex items-center gap-3">
          {/* Wie bijwerkt hoeft niet opnieuw door alle zes de stappen. Op de
              laatste stap zou dit dezelfde knop twee keer zijn. */}
          {saved && step !== LAST_STEP ? (
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || needsConsent || draft.interests.length < MIN_INTERESTS}
              className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-[13.5px] font-semibold text-[var(--sage)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Bewaren en terug
            </button>
          ) : null}

          {step === LAST_STEP ? (
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || needsConsent}
              className="min-h-11 cursor-pointer rounded-xl border-none bg-[var(--sage)] px-5 py-2.5 text-[14px] font-semibold text-[#0f1c10] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Bezig met bewaren…" : "Bewaren"}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={!canAdvance}
              className="min-h-11 cursor-pointer rounded-xl border-none bg-[var(--sage)] px-5 py-2.5 text-[14px] font-semibold text-[#0f1c10] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Verder
            </button>
          )}
        </div>
      </div>
    </AuthShell>
  );
}
