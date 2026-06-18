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

type RevealFooterPanelProps = {
  sessionId: string | null;
  onRestart?: () => void;
  onConsentRevoked?: () => void;
};

export default function RevealFooterPanel({
  sessionId,
  onRestart,
  onConsentRevoked,
}: RevealFooterPanelProps) {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(
    null,
  );

  return (
    <footer style={{ marginTop: 8 }}>
      <p
        style={{
          fontSize: 12,
          lineHeight: 1.6,
          color: "rgba(255,255,255,0.22)",
          margin: "0 0 12px",
        }}
      >
        {DISCLAIMER_TEXTS.intake}
      </p>
      <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 16px" }}>
        <Link
          href="/privacy"
          style={{
            fontWeight: 500,
            color: "rgba(255,255,255,0.50)",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          privacyverklaring
        </Link>
        {" · "}
        <Link
          href="/medische-disclaimer"
          style={{
            fontWeight: 500,
            color: "rgba(255,255,255,0.50)",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          medische disclaimer
        </Link>
      </p>

      {feedback ? (
        <p
          style={{
            marginBottom: 16,
            borderRadius: 12,
            padding: "10px 12px",
            fontSize: 14,
            lineHeight: 1.45,
            border:
              feedback.kind === "success"
                ? "1px solid rgba(90,143,106,0.30)"
                : "1px solid rgba(248,113,113,0.30)",
            background:
              feedback.kind === "success"
                ? "rgba(90,143,106,0.10)"
                : "rgba(127,29,29,0.20)",
            color: feedback.kind === "success" ? "var(--text)" : "rgb(254,202,202)",
          }}
          role={feedback.kind === "error" ? "alert" : "status"}
        >
          {feedback.text}
        </p>
      ) : null}

      {sessionId && feedback?.kind !== "success" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
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
            style={{
              minHeight: 44,
              cursor: busy ? "default" : "pointer",
              borderRadius: 12,
              border: "1px solid var(--divider)",
              padding: "10px 12px",
              textAlign: "left",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-muted)",
              background: "transparent",
              fontFamily: "var(--f-sans)",
            }}
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
            style={{
              minHeight: 44,
              cursor: busy ? "default" : "pointer",
              borderRadius: 12,
              border: "1px solid rgba(248,113,113,0.25)",
              padding: "10px 12px",
              textAlign: "left",
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(254,202,202,0.90)",
              background: "transparent",
              fontFamily: "var(--f-sans)",
            }}
          >
            {busy ? "Bezig…" : "Alles verwijderen"}
          </button>
        </div>
      ) : null}

      {onRestart ? (
        <button
          type="button"
          onClick={onRestart}
          style={{
            minHeight: 44,
            cursor: "pointer",
            border: "none",
            background: "none",
            padding: 0,
            fontSize: 13,
            color: "var(--text-subtle)",
            textDecoration: "underline",
            textUnderlineOffset: 4,
            fontFamily: "var(--f-sans)",
          }}
        >
          Opnieuw beginnen
        </button>
      ) : null}

      <p
        style={{
          marginTop: 16,
          paddingBottom: 8,
          textAlign: "center",
          fontSize: 12,
          color: "var(--text-subtle)",
        }}
      >
        <Link
          href="/privacy"
          style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 2 }}
        >
          Privacy
        </Link>
        {" · "}
        <Link
          href="/disclaimer"
          style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 2 }}
        >
          Disclaimer
        </Link>
        {" · "}
        © 2026 PerfectSupplement
      </p>
    </footer>
  );
}
