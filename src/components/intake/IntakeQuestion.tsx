"use client";

import { useEffect, useRef, useState } from "react";
import {
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
  const [prevQuestionId, setPrevQuestionId] = useState(question.id);
  const [prevSavedOptionIndex, setPrevSavedOptionIndex] = useState(savedOptionIndex);
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);

  if (
    prevQuestionId !== question.id ||
    prevSavedOptionIndex !== savedOptionIndex
  ) {
    setPrevQuestionId(question.id);
    setPrevSavedOptionIndex(savedOptionIndex);
    setSelectedOption(savedOptionIndex !== undefined ? savedOptionIndex : null);
    setLocked(false);
  }

  const isFirstRender = useRef(true);
  useEffect(() => {
    isFirstRender.current = false;
  }, []);

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
  const questionNumber = String(currentIndex + 1).padStart(2, "0");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div
        className="fixed inset-x-0 top-0 z-50 h-[3px] bg-intake-divider"
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label="Intake voortgang"
      >
        <div
          className="h-full bg-intake-terra transition-[width] duration-300 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="w-full max-w-lg px-6 py-12">
        <div className="mb-2 flex items-center justify-center gap-2">
          <span className="text-[15px]" aria-hidden>
            {category.icon}
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-intake-ink-subtle">
            <span className="text-intake-terra">{questionNumber}</span>
            {" · "}
            {category.label}
          </p>
        </div>

        <p className="mb-8 text-center text-sm text-intake-ink-subtle">
          Vraag {currentIndex + 1} van {total}
        </p>

        <div
          key={currentIndex}
          className={`min-h-[400px] ${
            // eslint-disable-next-line react-hooks/refs -- skip inner fade-in on first mount; outer phase handles entry
            isFirstRender.current ? "" : "animate-[fadeIn_200ms_ease-out]"
          }`}
        >
          <h2
            className={`text-center font-serif text-2xl font-normal leading-snug text-intake-ink md:text-3xl ${question.subtitle ? "mb-4" : "mb-10"}`}
          >
            {question.question}
          </h2>
          {question.subtitle ? (
            <p className="mb-10 text-center text-base font-normal leading-relaxed text-intake-ink-muted md:text-lg">
              {question.subtitle}
            </p>
          ) : null}

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
                  className={[
                    "block w-full min-h-[44px] rounded-[14px] border px-5 py-4 text-left text-base font-medium leading-snug transition-all duration-200 ease-out",
                    isSelected
                      ? "border-intake-terra bg-intake-terra/15 text-intake-ink shadow-[inset_4px_0_0_var(--intake-terra)]"
                      : isHovered
                        ? "border-intake-card-border bg-intake-bg-elevated/90 text-intake-ink"
                        : "border-intake-card-border bg-intake-bg-elevated text-intake-ink-muted",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="border-none bg-transparent py-3 text-sm text-intake-ink-subtle transition-colors hover:text-intake-ink-muted disabled:cursor-default"
            style={{
              cursor: currentIndex > 0 ? "pointer" : "default",
              visibility: currentIndex > 0 ? "visible" : "hidden",
            }}
          >
            ← Terug
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!hasSelection || locked}
            className="min-h-[44px] rounded-[12px] border border-intake-card-border bg-transparent px-6 py-3 text-sm font-semibold text-intake-ink transition-all duration-200 hover:bg-intake-bg-elevated disabled:cursor-default disabled:opacity-30"
          >
            {isLastQuestion ? "Bekijk resultaten →" : "Volgende →"}
          </button>
        </div>
      </div>
    </div>
  );
}
