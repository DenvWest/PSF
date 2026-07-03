"use client";

import { useEffect, useRef, useState } from "react";
import { clarityTag } from "@/lib/clarity";
import { MEASUREMENT_REMINDER_CONSENT_TEXT } from "@/lib/consent-texts";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";

type MeasurementReminderOptInProps = {
  sessionId: string;
};

function emailLooseOk(value: string): boolean {
  const t = value.trim();
  return t.includes("@") && t.includes(".");
}

export function MeasurementReminderOptIn({
  sessionId,
}: MeasurementReminderOptInProps) {
  const shownRef = useRef(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (shownRef.current) {
      return;
    }
    shownRef.current = true;
    trackEvent(GA4_EVENTS.REMEASURE_OPTIN_SHOWN);
    clarityTag("remeasure_optin", "shown");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!emailLooseOk(email)) {
      setErrorMessage("Vul een geldig e-mailadres in.");
      return;
    }

    if (!consent) {
      setErrorMessage("Geef toestemming om de herinnering per e-mail te ontvangen.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/intake/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          sessionId,
          website: "",
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Verzenden mislukt");
      }
      trackEvent(GA4_EVENTS.REMEASURE_OPTIN_SUBMITTED);
      clarityTag("remeasure_optin", "submitted");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Er ging iets mis. Probeer het opnieuw.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-intake-sage/30 bg-intake-sage/10 px-5 py-5">
        <p className="text-sm font-semibold text-[#1c1917]">
          Herinnering ingesteld — over 30 dagen ontvang je een mail om opnieuw te meten.
        </p>
      </div>
    );
  }

  return (
    <section
      className="rounded-2xl border border-[#e4e0da] bg-white px-5 py-5"
      aria-label="30-dagen hermeting opt-in"
    >
      <h2 className="mb-2 text-sm font-semibold text-[#1c1917]">
        Over 30 dagen meet je opnieuw — wij herinneren je eraan.
      </h2>
      <p className="mb-4 text-xs leading-relaxed text-[#57534e]">
        Zo zie je of je leefstijl-stappen effect hebben.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="je@email.nl"
            className="w-full rounded-[10px] border border-[#e4e0da] bg-[#faf9f7] px-4 py-3 text-sm text-[#1c1917] placeholder:text-[#a8a29e] focus:border-intake-terra focus:outline-none focus:ring-1 focus:ring-intake-terra"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex min-h-[44px] w-full shrink-0 cursor-pointer items-center justify-center rounded-[10px] border-none bg-intake-terra px-6 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Bezig..." : "Herinnering instellen"}
          </button>
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-[#57534e]">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-[#e4e0da] text-intake-sage focus:ring-intake-sage"
          />
          <span>{MEASUREMENT_REMINDER_CONSENT_TEXT.measurement_reminder}</span>
        </label>

        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />

        {errorMessage ? (
          <p className="text-xs text-red-600" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </form>
    </section>
  );
}
