"use client";

import { useState } from "react";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import { saveIntakeFeedback } from "@/lib/intake-storage";
import { REVEAL_CARD_SHADOW, REVEAL_COPY } from "@/lib/results-reveal-copy";

type FeedbackChoice = "yes" | "partial" | "no" | null;

type IntakeFeedbackProps = {
  sessionId: string | null;
  variant?: "default" | "embedded" | "reveal-premium";
};

const pillBase = {
  flex: 1,
  cursor: "pointer",
  borderRadius: 10,
  fontWeight: 600,
  fontFamily: "var(--f-sans)",
} as const;

export default function IntakeFeedback({
  sessionId,
  variant = "default",
}: IntakeFeedbackProps) {
  const [choice, setChoice] = useState<FeedbackChoice>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const embedded = variant === "embedded";
  const revealPremium = variant === "reveal-premium";

  const cardStyle = revealPremium
    ? undefined
    : embedded
      ? {
          marginBottom: 0,
          borderRadius: 24,
          padding: "20px 18px",
          background: "var(--panel)",
          border: "1px solid var(--panel-border)",
          boxShadow: REVEAL_CARD_SHADOW,
        }
      : {
          marginBottom: 20,
          borderRadius: 16,
          padding: "24px 20px",
          background: "var(--panel)",
          border: "1px solid var(--panel-border)",
        };

  const questionStyle = embedded
    ? {
        margin: "0 0 14px",
        textAlign: "left" as const,
        fontSize: 15,
        fontWeight: 600,
        color: "var(--text-muted)",
      }
    : {
        margin: "0 0 16px",
        textAlign: "center" as const,
        fontSize: 16,
        fontWeight: 600,
        color: "var(--text-muted)",
      };

  const pillStyle = embedded
    ? { ...pillBase, minHeight: 42, fontSize: 13 }
    : { ...pillBase, minHeight: 44, fontSize: 14 };

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

  if (revealPremium) {
    if (submitted) {
      return (
        <div className="reveal-feedback-premium reveal-feedback-premium--success reveal-premium-panel mx-auto w-full max-w-[680px]">
          <div className="reveal-feedback-premium__inner reveal-premium-panel__inner">
            <p className="reveal-feedback-premium__success">
              Bedankt voor je feedback{" "}
              <span className="reveal-feedback-premium__success-mark" aria-hidden>
                ✓
              </span>
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="reveal-feedback-premium reveal-premium-panel mx-auto w-full max-w-[680px]">
        <div className="reveal-feedback-premium__inner reveal-premium-panel__inner">
          <div className="reveal-premium-panel__top">
            <span className="reveal-premium-panel__badge">{REVEAL_COPY.feedbackBadge}</span>
            <span className="reveal-premium-panel__meta">{REVEAL_COPY.feedbackMeta}</span>
          </div>

          <div className="reveal-feedback-premium__intro">
            <p className="reveal-premium-panel__eyebrow">{REVEAL_COPY.feedbackEyebrow}</p>
            <h2 className="reveal-feedback-premium__title">{REVEAL_COPY.feedbackTitle}</h2>
            <p className="reveal-feedback-premium__subtext">{REVEAL_COPY.feedbackSubtext}</p>
          </div>

          {choice === null ? (
            <div
              role="group"
              aria-label="Feedbackkeuze"
              className="reveal-feedback-premium__pills"
            >
              <button
                type="button"
                aria-pressed={choice === "yes"}
                onClick={() => {
                  setChoice("yes");
                  void submit("positive", false);
                }}
                disabled={submitting}
                className="reveal-feedback-premium__pill reveal-feedback-premium__pill--yes"
              >
                Ja, herkenbaar
              </button>
              <button
                type="button"
                aria-pressed={choice === "partial"}
                onClick={() => setChoice("partial")}
                disabled={submitting}
                className="reveal-feedback-premium__pill"
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
                className="reveal-feedback-premium__pill"
              >
                Niet echt
              </button>
            </div>
          ) : (
            <div className="reveal-feedback-premium__followup">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                placeholder="Wil je iets toelichten? (optioneel)"
                rows={4}
                maxLength={500}
                className="reveal-feedback-premium__textarea"
              />
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  void submit(choice === "partial" ? "positive" : "negative", true);
                }}
                className="reveal-feedback-premium__submit"
              >
                Verstuur feedback
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div
        style={{
          ...cardStyle,
          textAlign: "center",
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
    <div style={cardStyle}>
      <p style={questionStyle}>Herken je jezelf in dit advies?</p>

      {choice === null ? (
        <div
          role="group"
          aria-label="Feedbackkeuze"
          style={{ display: "flex", gap: embedded ? 8 : 10, flexWrap: "wrap" }}
        >
          <button
            type="button"
            aria-pressed={choice === "yes"}
            onClick={() => {
              setChoice("yes");
              void submit("positive", false);
            }}
            disabled={submitting}
            style={{
              ...pillStyle,
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
              ...pillStyle,
              border: "1px solid var(--panel-border)",
              background: "rgba(15,28,16,0.04)",
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
              ...pillStyle,
              border: "1px solid var(--panel-border)",
              background: "rgba(15,28,16,0.04)",
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
              background: "rgba(15,28,16,0.04)",
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
