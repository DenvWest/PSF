"use client";

import { useState } from "react";

interface EmailGateFormProps {
  ctaText: string;
  privacyText: string;
  successMessage: string;
  themaSlug: string;
}

export function EmailGateForm({
  ctaText,
  privacyText,
  successMessage,
  themaSlug,
}: EmailGateFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit() {
    if (!email || !email.includes("@")) {
      setErrorMessage("Vul een geldig e-mailadres in.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/thema/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, thema: themaSlug }),
      });

      if (!response.ok) throw new Error("Verzenden mislukt");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Er ging iets mis. Probeer het opnieuw.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl bg-[#5A8F6A]/10 border border-[#5A8F6A]/20 p-6 text-center">
        <div className="text-2xl mb-2">✉️</div>
        <p className="text-[#5A8F6A] font-semibold text-base">{successMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="je@email.nl"
          className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#5A8F6A] focus:outline-none focus:ring-1 focus:ring-[#5A8F6A] transition-colors"
        />
        <button
          onClick={handleSubmit}
          disabled={status === "loading"}
          className="rounded-xl bg-[#5A8F6A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4a7a5a] disabled:opacity-60 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
        >
          {status === "loading" ? "Verzenden..." : ctaText}
        </button>
      </div>
      {errorMessage && (
        <p className="text-red-600 text-xs">{errorMessage}</p>
      )}
      <p className="text-xs text-stone-400">{privacyText}</p>
    </div>
  );
}
