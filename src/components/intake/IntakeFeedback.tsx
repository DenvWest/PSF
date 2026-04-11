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
      <p className="m-0 text-center text-[15px] text-[#555]">
        Bedankt voor je feedback{" "}
        <span className="text-[#5A8F6A]" aria-hidden>
          {"\u2713"}
        </span>
      </p>
    );
  }

  return (
    <div className="mb-5">
      <p className="mb-4 text-[15px] font-semibold text-[#1a1a1a]">
        Herken je jezelf in dit advies?
      </p>
      {rating === null ? (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setRating("positive")}
            className="flex-1 cursor-pointer rounded-[10px] border-2 border-[#5A8F6A] bg-transparent py-3 text-sm font-semibold text-[#5A8F6A] transition-colors hover:bg-[#5A8F6A08]"
          >
            Ja, klopt
          </button>
          <button
            type="button"
            onClick={() => setRating("negative")}
            className="flex-1 cursor-pointer rounded-[10px] border-2 border-[#b8b5ae] bg-transparent py-3 text-sm font-semibold text-[#666] transition-colors hover:bg-[#00000006]"
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
            className="box-border w-full resize-y rounded-[10px] border border-[#e0ddd7] bg-white px-3 py-2.5 text-sm text-[#1a1a1a] outline-none placeholder:text-[#aaa] focus:border-[#C4873B]"
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
            className="cursor-pointer rounded-[10px] border-none bg-[#1a1a1a] py-3.5 text-sm font-semibold text-white disabled:cursor-default disabled:opacity-60"
          >
            Verstuur feedback
          </button>
        </div>
      )}
    </div>
  );
}
