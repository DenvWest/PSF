"use client";

import { useState } from "react";
import { saveIntakeFeedback } from "@/lib/intake-storage";

type IntakeFeedbackProps = {
  sessionId: string | null;
};

export default function IntakeFeedback({ sessionId }: IntakeFeedbackProps) {
  const [rating, setRating] = useState<"positive" | "negative" | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (submitted) {
    return (
      <div
        className="mb-5 rounded-2xl px-6 py-8 text-center"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <p className="text-[15px]" style={{ color: "rgba(255,255,255,0.5)" }}>
          Bedankt voor je feedback{" "}
          <span style={{ color: "#5A8F6A" }} aria-hidden>
            ✓
          </span>
        </p>
      </div>
    );
  }

  return (
    <div
      className="mb-5 rounded-2xl px-6 py-7"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <p
        className="mb-5 text-center text-[15px] font-semibold"
        style={{ color: "rgba(255,255,255,0.7)" }}
      >
        Herken je jezelf in dit advies?
      </p>

      {rating === null ? (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setRating("positive")}
            className="flex-1 cursor-pointer rounded-[10px] py-3 text-sm font-semibold transition-colors"
            style={{
              background: "rgba(90,143,106,0.15)",
              border: "1px solid rgba(90,143,106,0.4)",
              color: "#5A8F6A",
              fontFamily: "inherit",
            }}
          >
            Ja, klopt
          </button>
          <button
            type="button"
            onClick={() => setRating("negative")}
            className="flex-1 cursor-pointer rounded-[10px] py-3 text-sm font-semibold transition-colors"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)",
              fontFamily: "inherit",
            }}
          >
            Niet helemaal
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            placeholder="Wil je iets toelichten? (optioneel)"
            rows={4}
            maxLength={500}
            className="box-border w-full resize-y rounded-[10px] px-3 py-2.5 text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.82)",
              fontFamily: "inherit",
            }}
          />
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              void (async () => {
                setSubmitting(true);
                await saveIntakeFeedback(
                  sessionId,
                  rating,
                  comment.trim() === "" ? null : comment.trim(),
                );
                setSubmitting(false);
                setSubmitted(true);
              })();
            }}
            className="cursor-pointer rounded-[10px] border-none py-3.5 text-sm font-semibold disabled:cursor-default disabled:opacity-60"
            style={{
              background: "#C8956C",
              color: "white",
              fontFamily: "inherit",
            }}
          >
            Verstuur feedback
          </button>
        </div>
      )}
    </div>
  );
}
