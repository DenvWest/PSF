"use client";

import Link from "next/link";
import { useState } from "react";
import { GUIDE_CONSENT_TEXT } from "@/lib/consent-texts";
import type { GuideThema } from "@/types/guide-opt-in";

type GuideOptInFormVariant = "default" | "intake";

interface GuideOptInFormProps {
  themaSlug: GuideThema;
  ctaText: string;
  successMessage: string;
  /** Direct PDF na succes (intake-resultaten). */
  pdfPath?: string | null;
  variant?: GuideOptInFormVariant;
  /** Intake: marketing al achtergelaten — geen dubbele checkbox. */
  skipMarketingConsent?: boolean;
}

function emailLooseOk(value: string): boolean {
  const t = value.trim();
  return t.includes("@") && t.includes(".");
}

export function GuideOptInForm({
  themaSlug,
  ctaText,
  successMessage,
  pdfPath = null,
  variant = "default",
  skipMarketingConsent = false,
}: GuideOptInFormProps) {
  const [email, setEmail] = useState("");
  const [marketing, setMarketing] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!emailLooseOk(email)) {
      setErrorMessage("Vul een geldig e-mailadres in.");
      return;
    }

    if (!skipMarketingConsent && !marketing) {
      setErrorMessage(
        "Geef toestemming om de gids en tips per e-mail te ontvangen.",
      );
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/gids/opt-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          thema: themaSlug,
          marketingConsent: true,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Verzenden mislukt");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Er ging iets mis. Probeer het opnieuw.",
      );
    }
  }

  const isIntake = variant === "intake";

  if (status === "success") {
    return (
      <div
        className={
          isIntake
            ? "rounded-xl border border-intake-sage/30 bg-intake-sage/10 p-5 text-center"
            : "rounded-xl border border-ps-green/20 bg-ps-green/10 p-6 text-center"
        }
      >
        <p
          className={
            isIntake
              ? "text-sm font-semibold text-intake-ink"
              : "text-base font-semibold text-ps-green"
          }
        >
          {successMessage}
        </p>
        {pdfPath ? (
          <Link
            href={pdfPath}
            target="_blank"
            rel="noopener noreferrer"
            className={
              isIntake
                ? "mt-3 inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-intake-terra px-5 py-2.5 text-sm font-bold text-white no-underline transition-opacity hover:opacity-90"
                : "mt-3 inline-flex rounded-xl bg-ps-green px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-ps-green/90"
            }
          >
            Open de PDF →
          </Link>
        ) : null}
      </div>
    );
  }

  const inputClass = isIntake
    ? "flex-1 rounded-[10px] border border-intake-card-border bg-intake-bg px-4 py-3 text-sm text-intake-ink placeholder:text-intake-ink-subtle focus:border-intake-terra focus:outline-none focus:ring-1 focus:ring-intake-terra"
    : "flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-ps-green focus:outline-none focus:ring-1 focus:ring-ps-green";

  const buttonClass = isIntake
    ? "inline-flex min-h-[44px] w-full shrink-0 cursor-pointer items-center justify-center rounded-[10px] border-none bg-intake-terra px-6 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    : "whitespace-nowrap rounded-xl bg-ps-green px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-ps-green/90 disabled:opacity-60";

  const consentClass = isIntake
    ? "flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-intake-ink-muted"
    : "flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-stone-600";

  const checkboxClass = isIntake
    ? "mt-0.5 h-4 w-4 rounded border-intake-card-border text-intake-sage focus:ring-intake-sage"
    : "mt-1 h-4 w-4 rounded border-stone-300 text-ps-green focus:ring-ps-green";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className={isIntake ? "flex flex-col gap-3" : "flex flex-col gap-3 sm:flex-row"}>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="je@email.nl"
          className={inputClass}
        />
        <button type="submit" disabled={status === "loading"} className={buttonClass}>
          {status === "loading" ? "Verzenden..." : ctaText}
        </button>
      </div>

      {!skipMarketingConsent ? (
        <label className={consentClass}>
          <input
            type="checkbox"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            className={checkboxClass}
          />
          <span>{GUIDE_CONSENT_TEXT.guide_marketing_email}</span>
        </label>
      ) : null}

      {errorMessage ? (
        <p
          className={isIntake ? "text-xs text-red-300" : "text-xs text-red-600"}
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
