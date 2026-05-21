"use client";

import { useEffect, useState } from "react";
import { getLastSession, revokeIntakeConsent, deleteIntakeSession } from "@/lib/intake-storage";

const CONFIRM_ANON_MESSAGE =
  "Weet je het zeker? Je intake-antwoorden worden geanonimiseerd. Een anonieme sessie-id blijft bewaard voor statistiek.";

const CONFIRM_DELETE_MESSAGE =
  "Weet je het zeker? Je volledige intake-sessie wordt permanent verwijderd. Dit kan niet ongedaan worden gemaakt.";

const SUCCESS_ANON_MESSAGE =
  "Je toestemming is ingetrokken en je gegevens zijn geanonimiseerd.";

const SUCCESS_DELETE_MESSAGE =
  "Je intake-sessie is volledig verwijderd.";

type PrivacyRevokeConsentProps = {
  /** Ingesloten onder een bestaande sectie (geen extra kaart-rand). */
  embedded?: boolean;
};

export default function PrivacyRevokeConsent({
  embedded = false,
}: PrivacyRevokeConsentProps) {
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
    if (!window.confirm(CONFIRM_ANON_MESSAGE)) {
      return;
    }
    setBusy(true);
    setFeedback(null);
    const result = await revokeIntakeConsent();
    setBusy(false);
    if (result.ok) {
      setHasSession(false);
      setFeedback({ kind: "success", text: SUCCESS_ANON_MESSAGE });
      return;
    }
    setFeedback({ kind: "error", text: result.error });
  }

  async function handleDelete() {
    if (!window.confirm(CONFIRM_DELETE_MESSAGE)) {
      return;
    }
    setBusy(true);
    setFeedback(null);
    const result = await deleteIntakeSession();
    setBusy(false);
    if (result.ok) {
      setHasSession(false);
      setFeedback({ kind: "success", text: SUCCESS_DELETE_MESSAGE });
      return;
    }
    setFeedback({ kind: "error", text: result.error });
  }

  if (loading) {
    return null;
  }

  const inner = (
    <>
      <p className="mt-4 text-sm leading-relaxed text-stone-600">
        Heb je de leefstijlcheck ingevuld? Dan kun je hier je toestemming intrekken
        of je sessie volledig laten verwijderen. Bij intrekken worden je antwoorden
        geanonimiseerd; pending e-mails worden geannuleerd.
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
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            className="rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 shadow-sm transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={busy}
            onClick={() => void handleRevoke()}
          >
            {busy ? "Bezig…" : "Toestemming intrekken & anonimiseren"}
          </button>
          <button
            type="button"
            className="rounded-md border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-800 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={busy}
            onClick={() => void handleDelete()}
          >
            {busy ? "Bezig…" : "Alles verwijderen"}
          </button>
        </div>
      ) : !feedback ? (
        <p className="mt-4 text-sm text-stone-500">
          Er is geen actieve intake-sessie in deze browser.
        </p>
      ) : null}
    </>
  );

  if (embedded) {
    return (
      <div className="mt-6 border-t border-stone-200 pt-6">{inner}</div>
    );
  }

  return (
    <section className="mt-10 rounded-lg border border-stone-200 bg-stone-50 p-5">
      <h2 className="text-lg font-semibold text-stone-900">
        Intake & toestemming
      </h2>
      {inner}
    </section>
  );
}
