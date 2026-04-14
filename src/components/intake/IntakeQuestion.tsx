"use client";

import { useEffect, useState } from "react";
import ProgressDots from "@/components/intake/ProgressDots";
import {
  CATEGORIES,
  type Category,
  type IntakeQuestion as IntakeQuestionType,
} from "@/data/intake-questions";

type IntakeQuestionProps = {
  question: IntakeQuestionType;
  category: Category;
  currentIndex: number;
  total: number;
  savedOptionIndex?: number;
  onAnswer: (value: number, optionIndex: number) => void;
  onBack: () => void;
};

export default function IntakeQuestion({
  question,
  category,
  currentIndex,
  total,
  savedOptionIndex,
  onAnswer,
  onBack,
}: IntakeQuestionProps) {
  const [locked, setLocked] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setLocked(false), 0);
    return () => window.clearTimeout(id);
  }, [question.id]);

  function handleClick(optionIndex: number) {
    if (locked) {
      return;
    }
    const opt = question.options[optionIndex];
    if (!opt) {
      return;
    }
    setLocked(true);
    setSelectedOption(optionIndex);
    window.setTimeout(() => {
      onAnswer(opt.value, optionIndex);
    }, 500);
  }

  const currentCatIndex = CATEGORIES.findIndex((c) => c.id === category.id);
  const progressPct = ((currentIndex + 1) / total) * 100;

  return (
    <>
      {/* Full-width progress bar */}
      <div
        style={{
          width: "100%",
          height: 3,
          background: "rgba(255,255,255,0.08)",
          position: "relative",
          overflow: "hidden",
        }}
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label="Intake voortgang"
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${progressPct}%`,
            background: "#C8956C",
            transition: "width 400ms ease",
          }}
        />
      </div>

      {/* Category label + global counter */}
      <div
        className="px-6 pt-4"
        style={{ maxWidth: 480, margin: "0 auto", boxSizing: "border-box", width: "100%" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base" aria-hidden>
              {category.icon}
            </span>
            <span
              className="text-xs font-semibold uppercase tracking-[1.5px]"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              {category.label}
            </span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
            Vraag {currentIndex + 1} van {total}
          </p>
        </div>
        <ProgressDots
          categories={CATEGORIES}
          currentCatIndex={currentCatIndex >= 0 ? currentCatIndex : 0}
        />
      </div>

      {/* Question + options */}
      <div
        className="px-6 pb-10"
        style={{ maxWidth: 480, margin: "0 auto", boxSizing: "border-box", width: "100%" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <button
            type="button"
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              fontSize: 14,
              cursor: "pointer",
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            ← Terug
          </button>
        </div>

        <h2
          className="font-normal leading-snug"
          style={{
            fontFamily: "var(--font-intake-heading), Georgia, serif",
            fontSize: "clamp(22px, 6vw, 28px)",
            color: "rgba(255,255,255,0.92)",
            marginBottom: 36,
            marginTop: 16,
          }}
        >
          {question.question}
        </h2>

        <div
          style={{ pointerEvents: locked ? "none" : "auto" }}
          className="flex flex-col gap-4"
        >
          {question.options.map((opt, i) => {
            const isSelected = locked
              ? selectedOption === i
              : savedOptionIndex !== undefined && savedOptionIndex === i;
            const isHovered = !isSelected && hoveredOption === i;

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleClick(i)}
                onMouseEnter={() => setHoveredOption(i)}
                onMouseLeave={() => setHoveredOption(null)}
                className="block w-full rounded-[14px] px-5 py-[18px] text-left text-[15px] font-medium leading-snug transition-all duration-200 ease-out"
                style={{
                  background: isSelected
                    ? "rgba(200,149,108,0.18)"
                    : isHovered
                      ? "rgba(255,255,255,0.11)"
                      : "rgba(255,255,255,0.07)",
                  color: isSelected
                    ? "rgba(255,255,255,0.95)"
                    : "rgba(255,255,255,0.8)",
                  border: isSelected
                    ? "1px solid rgba(200,149,108,0.35)"
                    : "1px solid rgba(255,255,255,0.1)",
                  boxShadow: isSelected
                    ? "inset 4px 0 0 #C8956C, 0 4px 16px rgba(200,149,108,0.1)"
                    : "none",
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
