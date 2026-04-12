"use client";

import { useEffect, useState } from "react";
import { getLastSession, revokeIntakeConsent } from "@/lib/intake-storage";

const CONFIRM_MESSAGE =
  "Weet je het zeker? Je intakegegevens worden op de server geanonimiseerd en je toestemmingen worden ingetrokken. Dit kun je niet ongedaan maken.";

export default function PrivacyRevokeConsent() {
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    void getLastSession().then((s) => {
      setHasSession(s != null);
      setLoading(false);
    });
  }, []);

  async function handleRevoke() {
    if (!window.confirm(CONFIRM_MESSAGE)) {
      return;
    }
    setBusy(true);
    setFeedback(null);
    const result = await revokeIntakeConsent();
    setBusy(false);
    if (result.ok) {
      setHasSession(false);
      setFeedback({
        kind: "success",
        text: "Je gegevens zijn geanonimiseerd en je toestemming is ingetrokken.",
      });
      return;
    }
    setFeedback({ kind: "error", text: result.error });
  }

  if (loading) {
    return null;
  }

  return (
    <section className="mt-10 rounded-lg border border-stone-200 bg-stone-50 p-5">
      <h2 className="text-lg font-semibold text-stone-900">
        Intake & toestemming
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">
        Heb je eerder de leefstijlcheck ingevuld? Dan kun je hier je toestemming
        voor de verwerking van die gegevens intrekken. Je antwoorden worden op de
        server geanonimiseerd.
      </p>

      {feedback ? (
        <p
          className={`mt-4 text-sm font-medium ${
            feedback.kind === "success" ? "text-emerald-800" : "text-red-800"
          }`}
          role={feedback.kind === "error" ? "alert" : "status"}
        >
          {feedback.text}
        </p>
      ) : null}

      {hasSession ? (
        <button
          type="button"
          className="mt-4 rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 shadow-sm transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={busy}
          onClick={() => void handleRevoke()}
        >
          {busy ? "Bezig…" : "Toestemming intrekken"}
        </button>
      ) : !feedback ? (
        <p className="mt-4 text-sm text-stone-500">
          Er is geen actieve intake-sessie in deze browser.
        </p>
      ) : null}
    </section>
  );
}
