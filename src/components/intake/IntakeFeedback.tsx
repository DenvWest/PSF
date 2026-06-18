"use client";

import { useState } from "react";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import { saveIntakeFeedback } from "@/lib/intake-storage";

type FeedbackChoice = "yes" | "partial" | "no" | null;

type IntakeFeedbackProps = {
  sessionId: string | null;
};

const pillBase = {
  flex: 1,
  minHeight: 44,
  cursor: "pointer",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "var(--f-sans)",
} as const;

export default function IntakeFeedback({ sessionId }: IntakeFeedbackProps) {
  const [choice, setChoice] = useState<FeedbackChoice>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(rating: "positive" | "negative", withComment: boolean) {
    setSubmitting(true);
    await saveIntakeFeedback(
      sessionId,
      rating,
      withComment && comment.trim() !== "" ? comment.trim() : null,
    );
    trackEvent(GA4_EVENTS.INTAKE_FEEDBACK_SUBMITTED, { rating });
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        style={{
          marginBottom: 20,
          borderRadius: 16,
          padding: "24px 20px",
          textAlign: "center",
          background: "var(--panel)",
          border: "1px solid var(--panel-border)",
        }}
      >
        <p style={{ fontSize: 16, color: "var(--text-muted)", margin: 0 }}>
          Bedankt voor je feedback{" "}
          <span style={{ color: "var(--sage)" }} aria-hidden>
            ✓
          </span>
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        marginBottom: 20,
        borderRadius: 16,
        padding: "24px 20px",
        background: "var(--panel)",
        border: "1px solid var(--panel-border)",
      }}
    >
      <p
        style={{
          margin: "0 0 16px",
          textAlign: "center",
          fontSize: 16,
          fontWeight: 600,
          color: "var(--text-muted)",
        }}
      >
        Herken je jezelf in dit advies?
      </p>

      {choice === null ? (
        <div role="group" aria-label="Feedbackkeuze" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            aria-pressed={choice === "yes"}
            onClick={() => {
              setChoice("yes");
              void submit("positive", false);
            }}
            disabled={submitting}
            style={{
              ...pillBase,
              border: "1px solid rgba(90,143,106,0.40)",
              background: "rgba(90,143,106,0.15)",
              color: "var(--sage)",
            }}
          >
            Ja, herkenbaar
          </button>
          <button
            type="button"
            aria-pressed={choice === "partial"}
            onClick={() => setChoice("partial")}
            disabled={submitting}
            style={{
              ...pillBase,
              border: "1px solid var(--panel-border)",
              background: "rgba(255,255,255,0.07)",
              color: "var(--text-muted)",
            }}
          >
            Deels
          </button>
          <button
            type="button"
            aria-pressed={choice === "no"}
            onClick={() => {
              setChoice("no");
              void submit("negative", false);
            }}
            disabled={submitting}
            style={{
              ...pillBase,
              border: "1px solid var(--panel-border)",
              background: "rgba(255,255,255,0.07)",
              color: "var(--text-muted)",
            }}
          >
            Niet echt
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            placeholder="Wil je iets toelichten? (optioneel)"
            rows={4}
            maxLength={500}
            style={{
              boxSizing: "border-box",
              width: "100%",
              resize: "vertical",
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 14,
              outline: "none",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid var(--panel-border)",
              color: "var(--text)",
              fontFamily: "var(--f-sans)",
            }}
          />
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              void submit(choice === "partial" ? "positive" : "negative", true);
            }}
            style={{
              minHeight: 44,
              cursor: submitting ? "default" : "pointer",
              borderRadius: 10,
              border: "none",
              padding: "12px 16px",
              fontSize: 14,
              fontWeight: 600,
              background: "var(--sage)",
              color: "#0f1c10",
              fontFamily: "var(--f-sans)",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            Verstuur feedback
          </button>
        </div>
      )}
    </div>
  );
}
