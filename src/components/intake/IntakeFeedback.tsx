"use client";

import { useState } from "react";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import { saveIntakeFeedback } from "@/lib/intake-storage";
import { REVEAL_CARD_SHADOW, REVEAL_COPY } from "@/lib/results-reveal-copy";

type FeedbackChoice = "yes" | "partial" | "no" | null;

type IntakeFeedbackProps = {
  sessionId: string | null;
  variant?: "default" | "embedded" | "reveal-premium" | "reveal-light";
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
  const revealLight = variant === "reveal-light";

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

  function submitChoice() {
    if (choice === null) {
      return;
    }
    void submit(choice === "no" ? "negative" : "positive", comment.trim() !== "");
  }

  const followupFields = (
    <div className="flex flex-col gap-3">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, 500))}
        placeholder="Wil je iets toelichten? (optioneel)"
        rows={4}
        maxLength={500}
        className={
          revealLight
            ? "box-border w-full resize-y rounded-[10px] border border-[#e4e0da] bg-white p-3 text-[14px] text-[#1c1917] outline-none"
            : revealPremium
              ? "reveal-feedback-premium__textarea"
              : undefined
        }
        style={
          revealLight || revealPremium
            ? undefined
            : {
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
              }
        }
      />
      <button
        type="button"
        disabled={submitting}
        onClick={submitChoice}
        className={
          revealLight
            ? "min-h-[44px] cursor-pointer rounded-[10px] border-0 bg-[#5A8F6A] px-4 text-[14px] font-semibold text-[#0f1c10]"
            : revealPremium
              ? "reveal-feedback-premium__submit"
              : undefined
        }
        style={
          revealLight || revealPremium
            ? undefined
            : {
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
              }
        }
      >
        Verstuur feedback
      </button>
    </div>
  );

  if (revealLight) {
    if (submitted) {
      return (
        <div className="mx-auto w-full max-w-[600px] rounded-[28px] border border-[#e4e0da] bg-gradient-to-b from-[#fefdfb] to-white p-6 text-center shadow-[0_16px_48px_rgba(15,28,16,0.10)]">
          <p className="m-0 text-[15px] text-[#57534e]">
            Bedankt voor je feedback{" "}
            <span className="text-[#5A8F6A]" aria-hidden>
              ✓
            </span>
          </p>
        </div>
      );
    }

    return (
      <div className="w-full">
        <details
          className="reveal-feedback-disclosure reveal-feedback-disclosure--light"
          onToggle={(event) => {
            if ((event.currentTarget as HTMLDetailsElement).open) {
              trackEvent("reveal_feedback_opened");
            }
          }}
        >
          <summary className="reveal-feedback-disclosure__summary">
            <span>{REVEAL_COPY.feedbackEyebrow}</span>
            <span className="reveal-feedback-disclosure__meta">{REVEAL_COPY.feedbackMeta}</span>
          </summary>
          <div className="reveal-feedback-disclosure__body">
            <h2
              className="m-0 text-[20px] leading-tight text-[#1c1917]"
              style={{ fontFamily: "var(--f-serif, Georgia, serif)", fontWeight: 400 }}
            >
              {REVEAL_COPY.feedbackTitle}
            </h2>
            <p className="mb-4 mt-1.5 text-[13.5px] leading-relaxed text-[#57534e]">
              {REVEAL_COPY.feedbackSubtext}
            </p>
            {choice === null ? (
              <div role="group" aria-label="Feedbackkeuze" className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setChoice("yes")}
                  disabled={submitting}
                  className="min-h-[44px] flex-1 cursor-pointer rounded-[12px] border border-[rgba(90,143,106,0.4)] bg-[rgba(90,143,106,0.12)] px-3 text-[14px] font-semibold text-[#5A8F6A]"
                >
                  Ja, herkenbaar
                </button>
                <button
                  type="button"
                  onClick={() => setChoice("partial")}
                  disabled={submitting}
                  className="min-h-[44px] flex-1 cursor-pointer rounded-[12px] border border-[#e4e0da] bg-white px-3 text-[14px] font-semibold text-[#57534e]"
                >
                  Deels
                </button>
                <button
                  type="button"
                  onClick={() => setChoice("no")}
                  disabled={submitting}
                  className="min-h-[44px] flex-1 cursor-pointer rounded-[12px] border border-[#e4e0da] bg-white px-3 text-[14px] font-semibold text-[#57534e]"
                >
                  Niet echt
                </button>
              </div>
            ) : (
              followupFields
            )}
          </div>
        </details>
      </div>
    );
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
                onClick={() => setChoice("yes")}
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
                onClick={() => setChoice("no")}
                disabled={submitting}
                className="reveal-feedback-premium__pill"
              >
                Niet echt
              </button>
            </div>
          ) : (
            <div className="reveal-feedback-premium__followup">{followupFields}</div>
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
            onClick={() => setChoice("yes")}
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
            onClick={() => setChoice("no")}
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
        followupFields
      )}
    </div>
  );
}
