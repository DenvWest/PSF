"use client";

import Link from "next/link";
import { useState } from "react";
import { DISCLAIMER_TEXTS } from "@/lib/disclaimer-text";
import { revokeIntakeConsent, deleteIntakeSession } from "@/lib/intake-storage";

const REVOKE_CONFIRM =
  "Weet je het zeker? Je intake-antwoorden worden geanonimiseerd. Een anonieme sessie-id blijft bewaard voor statistiek.";

const DELETE_CONFIRM =
  "Weet je het zeker? Je volledige intake-sessie wordt permanent verwijderd. Dit kan niet ongedaan worden gemaakt.";

const REVOKE_SUCCESS =
  "Je toestemming is ingetrokken en je gegevens zijn geanonimiseerd.";

const DELETE_SUCCESS = "Je intake-sessie is volledig verwijderd.";

type ResultsRevealTrustProps = {
  sessionId: string | null;
  onRestart?: () => void;
  onConsentRevoked?: () => void;
};

export default function ResultsRevealTrust({
  sessionId,
  onRestart,
  onConsentRevoked,
}: ResultsRevealTrustProps) {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(
    null,
  );

  return (
    <footer className="mt-10 border-t border-intake-divider pt-6">
      <details className="group">
        <summary className="min-h-11 cursor-pointer list-none text-sm text-intake-ink-subtle [&::-webkit-details-marker]:hidden">
          <span className="underline decoration-intake-divider underline-offset-4 group-open:decoration-intake-sage">
            Jouw gegevens &amp; privacy
          </span>
        </summary>
        <div className="mt-4 max-w-[34ch] text-left text-xs leading-relaxed text-intake-ink-subtle">
          <p>{DISCLAIMER_TEXTS.intake}</p>
          <p className="mt-3">
            <Link href="/privacy" className="underline underline-offset-2 hover:text-intake-ink-muted">
              privacyverklaring
            </Link>
            {" · "}
            <Link
              href="/medische-disclaimer"
              className="underline underline-offset-2 hover:text-intake-ink-muted"
            >
              medische disclaimer
            </Link>
          </p>
          {feedback ? (
            <p
              className={`mt-4 rounded-xl px-3 py-2.5 text-[13px] leading-snug ${
                feedback.kind === "success"
                  ? "border border-intake-sage/30 bg-intake-sage/10 text-intake-ink"
                  : "border border-red-400/30 bg-red-950/20 text-red-200"
              }`}
              role={feedback.kind === "error" ? "alert" : "status"}
            >
              {feedback.text}
            </p>
          ) : null}
          {sessionId && feedback?.kind !== "success" ? (
            <div className="mt-4 flex flex-col items-start gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (!window.confirm(REVOKE_CONFIRM)) {
                    return;
                  }
                  void (async () => {
                    setBusy(true);
                    setFeedback(null);
                    const result = await revokeIntakeConsent();
                    setBusy(false);
                    if (result.ok) {
                      setFeedback({ kind: "success", text: REVOKE_SUCCESS });
                      window.setTimeout(() => onConsentRevoked?.(), 2800);
                      return;
                    }
                    setFeedback({ kind: "error", text: result.error });
                  })();
                }}
                className="min-h-11 cursor-pointer text-left text-[13px] text-intake-ink-muted underline decoration-intake-divider underline-offset-4 disabled:opacity-60"
              >
                {busy ? "Bezig…" : "Toestemming intrekken & anonimiseren"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (!window.confirm(DELETE_CONFIRM)) {
                    return;
                  }
                  void (async () => {
                    setBusy(true);
                    setFeedback(null);
                    const result = await deleteIntakeSession();
                    setBusy(false);
                    if (result.ok) {
                      setFeedback({ kind: "success", text: DELETE_SUCCESS });
                      window.setTimeout(() => onConsentRevoked?.(), 2800);
                      return;
                    }
                    setFeedback({ kind: "error", text: result.error });
                  })();
                }}
                className="min-h-11 cursor-pointer text-left text-[13px] text-red-200/80 underline decoration-red-400/25 underline-offset-4 disabled:opacity-60"
              >
                {busy ? "Bezig…" : "Alles verwijderen"}
              </button>
            </div>
          ) : null}
          {onRestart ? (
            <button
              type="button"
              onClick={onRestart}
              className="mt-3 min-h-11 cursor-pointer text-left text-[13px] text-intake-ink-subtle underline decoration-intake-divider underline-offset-4"
            >
              Opnieuw beginnen
            </button>
          ) : null}
        </div>
      </details>
      <p className="mt-6 text-center text-[11px] text-intake-ink-subtle">
        <Link href="/privacy" className="underline underline-offset-2 hover:text-intake-ink-muted">
          Privacy
        </Link>
        {" · "}
        <Link href="/disclaimer" className="underline underline-offset-2 hover:text-intake-ink-muted">
          Disclaimer
        </Link>
        {" · "}
        © 2026 PerfectSupplement
      </p>
    </footer>
  );
}
