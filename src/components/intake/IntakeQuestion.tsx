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
  const catColor = category.color;

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

  return (
    <>
      <div className="px-6 pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[1.5px] text-[#999]">
            Stap 2 van 2
          </p>
          <p className="text-[13px] text-[#bbb]">
            {currentIndex + 1} / {total}
          </p>
        </div>
        <ProgressDots
          categories={CATEGORIES}
          currentCatIndex={currentCatIndex >= 0 ? currentCatIndex : 0}
        />
      </div>

      <div className="px-6 pb-10">
        <button
          type="button"
          onClick={onBack}
          className="p-0 text-left"
          style={{
            marginBottom: 16,
            background: "none",
            border: "none",
            color: "#999",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          ← Terug
        </button>
        <div
          className="mb-5 inline-flex items-center gap-2 rounded-lg border px-3.5 py-1.5"
          style={{
            background: `${catColor}15`,
            borderColor: `${catColor}30`,
          }}
        >
          <span className="text-base">{category.icon}</span>
          <span
            className="text-[13px] font-semibold"
            style={{ color: catColor }}
          >
            {category.label}
          </span>
          <span className="text-[11px]" style={{ color: `${catColor}99` }}>
            — vraag {question.questionIndex} van 2
          </span>
        </div>

        <h2
          className="mb-8 text-2xl font-normal leading-snug text-[#1a1a1a]"
          style={{ fontFamily: "var(--font-intake-heading), Georgia, serif" }}
        >
          {question.question}
        </h2>

        <div
          style={{ pointerEvents: locked ? "none" : "auto" }}
          className="flex flex-col gap-2.5"
        >
          {question.options.map((opt, i) => {
            const isSelected = locked
              ? selectedOption === i
              : savedOptionIndex !== undefined && savedOptionIndex === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleClick(i)}
                className="block w-full rounded-[14px] border-2 px-5 py-[18px] text-left text-[15px] font-medium leading-snug transition-all duration-500 ease-out"
                style={{
                  background: isSelected ? catColor : "white",
                  color: isSelected ? "white" : "#1a1a1a",
                  borderColor: isSelected ? catColor : "#e8e6e1",
                  boxShadow: isSelected
                    ? `0 4px 16px ${catColor}33`
                    : "none",
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
