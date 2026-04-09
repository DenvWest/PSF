"use client";

import { useRef, useState } from "react";
import type { Symptom, SymptomId } from "@/data/intake-questions";
import { SYMPTOMS } from "@/data/intake-questions";

type IntakeSymptomsProps = {
  symptoms: SymptomId[];
  onToggle: (id: SymptomId) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function IntakeSymptoms({
  symptoms,
  onToggle,
  onNext,
  onBack,
}: IntakeSymptomsProps) {
  const isProcessing = useRef(false);
  const [pointerLocked, setPointerLocked] = useState(false);

  const hasSelection = symptoms.length > 0;

  const handleToggle = (id: SymptomId) => {
    if (isProcessing.current) {
      return;
    }
    isProcessing.current = true;
    setPointerLocked(true);
    onToggle(id);
    window.setTimeout(() => {
      isProcessing.current = false;
      setPointerLocked(false);
    }, 300);
  };

  return (
    <div className="px-6 pb-10">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 p-0 text-left"
        style={{
          background: "none",
          border: "none",
          color: "#999",
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        ← Terug
      </button>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[1.5px] text-[#999]">
        Stap 1 van 2
      </p>
      <h2
        className="mb-2 text-[26px] font-normal text-[#1a1a1a]"
        style={{ fontFamily: "var(--font-intake-heading), Georgia, serif" }}
      >
        Wat herken je?
      </h2>
      <p className="mb-8 text-[15px] leading-normal text-[#777]">
        Selecteer de symptomen die op jou van toepassing zijn.
      </p>

      <div className="mb-9 flex flex-col gap-3">
        {SYMPTOMS.map((s: Symptom) => {
          const active = symptoms.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleToggle(s.id)}
              className="flex cursor-pointer items-center gap-4 rounded-[14px] border-2 px-5 py-5 text-left transition-all duration-[250ms] ease-out"
              style={{
                background: active ? "#1a1a1a" : "white",
                color: active ? "white" : "#1a1a1a",
                borderColor: active ? "#1a1a1a" : "#e8e6e1",
                boxShadow: active ? "0 4px 20px rgba(0,0,0,0.12)" : "none",
                pointerEvents: pointerLocked ? "none" : "auto",
              }}
            >
              <span
                className="text-[28px]"
                style={{ filter: active ? "brightness(1.3)" : undefined }}
              >
                {s.icon}
              </span>
              <div>
                <div className="text-[17px] font-semibold">{s.label}</div>
                <div
                  className="mt-0.5 text-[13px]"
                  style={{ opacity: 0.7 }}
                >
                  {s.desc}
                </div>
              </div>
              {active && (
                <div className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white">
                  <span className="text-sm font-bold text-[#1a1a1a]">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => hasSelection && onNext()}
        disabled={!hasSelection}
        className="w-full rounded-[14px] border-none py-[18px] text-base font-semibold transition-all duration-300"
        style={{
          background: hasSelection ? "#1a1a1a" : "#ddd",
          color: hasSelection ? "white" : "#999",
          cursor: hasSelection ? "pointer" : "default",
          pointerEvents: pointerLocked ? "none" : "auto",
        }}
      >
        {hasSelection
          ? "Verder naar leefstijlcheck →"
          : "Selecteer minimaal 1 symptoom"}
      </button>
    </div>
  );
}
