"use client";

import Link from "next/link";
import { useState } from "react";
import RevealCollapsiblePanel from "@/components/intake/RevealCollapsiblePanel";
import { DISCLAIMER_TEXTS } from "@/lib/disclaimer-text";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";
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
    <footer className="mt-2">
      <RevealCollapsiblePanel summary={REVEAL_COPY.trustSummary}>
        <p className="text-sm leading-relaxed text-intake-ink-muted">{DISCLAIMER_TEXTS.intake}</p>
        <p className="mt-3 text-sm text-intake-ink-muted">
          <Link
            href="/privacy"
            className="font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px]"
          >
            privacyverklaring
          </Link>
          {" · "}
          <Link
            href="/medische-disclaimer"
            className="font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px]"
          >
            medische disclaimer
          </Link>
        </p>
        {feedback ? (
          <p
            className={`mt-4 rounded-xl px-3 py-2.5 text-sm leading-snug ${
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
          <div className="mt-4 flex flex-col gap-2">
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
              className="min-h-11 cursor-pointer rounded-xl border border-intake-divider px-3 py-2 text-left text-sm text-intake-ink-muted transition-colors hover:border-intake-sage/35 hover:bg-intake-sage/5 disabled:opacity-60"
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
              className="min-h-11 cursor-pointer rounded-xl border border-red-400/25 px-3 py-2 text-left text-sm text-red-200/90 transition-colors hover:bg-red-950/20 disabled:opacity-60"
            >
              {busy ? "Bezig…" : "Alles verwijderen"}
            </button>
          </div>
        ) : null}
        {onRestart ? (
          <button
            type="button"
            onClick={onRestart}
            className="mt-3 min-h-11 cursor-pointer text-sm text-intake-ink-subtle underline decoration-intake-divider underline-offset-4 hover:text-intake-ink-muted"
          >
            Opnieuw beginnen
          </button>
        ) : null}
      </RevealCollapsiblePanel>

      <p className="mt-4 pb-2 text-center text-xs text-intake-ink-subtle">
        <Link
          href="/privacy"
          className="underline underline-offset-2 hover:text-intake-ink-muted"
        >
          Privacy
        </Link>
        {" · "}
        <Link
          href="/disclaimer"
          className="underline underline-offset-2 hover:text-intake-ink-muted"
        >
          Disclaimer
        </Link>
        {" · "}
        © 2026 PerfectSupplement
      </p>
    </footer>
  );
}
