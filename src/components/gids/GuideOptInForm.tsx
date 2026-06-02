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

  if (status === "success") {
    return (
      <div className="rounded-xl bg-ps-green/10 border border-ps-green/20 p-6 text-center">
        <p className="text-ps-green font-semibold text-base">{successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="je@email.nl"
          className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-ps-green focus:outline-none focus:ring-1 focus:ring-ps-green transition-colors"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-xl bg-ps-green px-6 py-3 text-sm font-semibold text-white hover:bg-ps-green/90 disabled:opacity-60 transition-all whitespace-nowrap"
        >
          {status === "loading" ? "Verzenden..." : ctaText}
        </button>
      </div>

      <label className="flex items-start gap-3 cursor-pointer text-sm text-stone-600 leading-relaxed">
        <input
          type="checkbox"
          checked={marketing}
          onChange={(e) => setMarketing(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-stone-300 text-ps-green focus:ring-ps-green"
        />
        <span>{GUIDE_CONSENT_TEXT.guide_marketing_email}</span>
      </label>

      {errorMessage && (
        <p className="text-red-600 text-xs" role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
