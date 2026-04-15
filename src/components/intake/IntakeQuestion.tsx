"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
  const [selectedOption, setSelectedOption] = useState<number | null>(
    savedOptionIndex !== undefined ? savedOptionIndex : null,
  );
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);
  // Skip inner animation on first mount — the phase-level wrapper in page.tsx
  // already handles the entry animation for the symptoms→questions transition.
  // The inner animation should only fire on question-to-question transitions.
  const isFirstRender = useRef(true);
  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  // Take over the full screen: hide the layout header while questions are active.
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".intake-layout-header");
    if (header) header.style.display = "none";
    return () => {
      if (header) header.style.display = "";
    };
  }, []);

  // Reset / restore selection whenever the question changes.
  useEffect(() => {
    setSelectedOption(savedOptionIndex !== undefined ? savedOptionIndex : null);
    setLocked(false);
  }, [question.id, savedOptionIndex]);

  function handleOptionSelect(optionIndex: number) {
    if (locked) return;
    setSelectedOption(optionIndex);
  }

  function handleNext() {
    if (locked || selectedOption === null) return;
    const opt = question.options[selectedOption];
    if (!opt) return;
    setLocked(true);
    onAnswer(opt.value, selectedOption);
  }

  const progressPct = ((currentIndex + 1) / total) * 100;
  const isLastQuestion = currentIndex === total - 1;
  const hasSelection = selectedOption !== null;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Fixed progress bar — stays at very top */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "rgba(255,255,255,0.1)",
          zIndex: 50,
        }}
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label="Intake voortgang"
      >
        <div
          style={{
            height: "100%",
            width: `${progressPct}%`,
            background: "#C8956C",
            transition: "width 300ms ease",
          }}
        />
      </div>

      {/* Fixed subtle close button */}
      <Link
        href="/"
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 50,
          color: "rgba(255,255,255,0.35)",
          fontSize: 18,
          lineHeight: 1,
          textDecoration: "none",
          padding: "4px 8px",
        }}
        aria-label="Sluiten"
      >
        ✕
      </Link>

      {/* ── Single centered content block ─────────────── */}
      <div className="w-full max-w-lg px-6 py-12">
        {/* Category + counter */}
        <div className="mb-1 flex items-center justify-center gap-2">
          <span style={{ fontSize: 15 }} aria-hidden>
            {category.icon}
          </span>
          <span
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            {category.label}
          </span>
        </div>

        <p
          className="mb-8 text-center text-sm"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Vraag {currentIndex + 1} van {total}
        </p>

        {/* Question text + answer options — keyed so React remounts on question change,
            triggering the fadeIn animation. Skipped on first render because the outer
            phase wrapper already handles the entry animation. */}
        <div
          key={currentIndex}
          className={`min-h-[400px] ${isFirstRender.current ? "" : "animate-[fadeIn_200ms_ease-out]"}`}
        >
          {/* Question text */}
          <h2
            className="mb-10 text-center text-2xl font-normal leading-snug md:text-3xl"
            style={{
              fontFamily: "var(--font-intake-heading), Georgia, serif",
              color: "rgba(255,255,255,0.92)",
            }}
          >
            {question.question}
          </h2>

          {/* Answer options */}
          <div
            style={{ pointerEvents: locked ? "none" : "auto" }}
            className="flex flex-col gap-3"
          >
            {question.options.map((opt, i) => {
              const isSelected = selectedOption === i;
              const isHovered = !isSelected && hoveredOption === i;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleOptionSelect(i)}
                  onMouseEnter={() => setHoveredOption(i)}
                  onMouseLeave={() => setHoveredOption(null)}
                  className="block w-full rounded-[14px] px-5 py-4 text-left text-base font-medium leading-snug transition-all duration-200 ease-out"
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
                    boxShadow: isSelected ? "inset 4px 0 0 #C8956C" : "none",
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

        {/* Navigation — back button always takes up space to prevent layout shift */}
        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              fontSize: 14,
              cursor: currentIndex > 0 ? "pointer" : "default",
              padding: "12px 0",
              fontFamily: "inherit",
              visibility: currentIndex > 0 ? "visible" : "hidden",
            }}
          >
            ← Terug
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!hasSelection || locked}
            className="rounded-[12px] border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10 disabled:cursor-default disabled:opacity-30"
            style={{ background: "transparent", fontFamily: "inherit" }}
          >
            {isLastQuestion ? "Bekijk resultaten →" : "Volgende →"}
          </button>
        </div>
      </div>
    </div>
  );
}
