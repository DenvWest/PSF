"use client";

import { useRef, useState } from "react";
import {
  INTAKE_AGE_RANGE_OPTIONS,
  SYMPTOMS,
  type IntakeAgeRange,
  type Symptom,
  type SymptomId,
} from "@/data/intake-questions";

type IntakeSymptomsProps = {
  ageRange: IntakeAgeRange | null;
  onAgeRangeChange: (value: IntakeAgeRange) => void;
  symptoms: SymptomId[];
  onToggle: (id: SymptomId) => void;
  onNext: () => void;
  onBack: () => void;
  honeypotWebsite: string;
  onHoneypotWebsiteChange: (value: string) => void;
};

export default function IntakeSymptoms({
  ageRange,
  onAgeRangeChange,
  symptoms,
  onToggle,
  onNext,
  onBack,
  honeypotWebsite,
  onHoneypotWebsiteChange,
}: IntakeSymptomsProps) {
  const isProcessing = useRef(false);
  const [pointerLocked, setPointerLocked] = useState(false);

  const hasSelection = symptoms.length > 0;
  const canProceed = ageRange !== null && hasSelection;

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

  const verderLabel = canProceed
    ? "Verder naar leefstijlcheck →"
    : ageRange === null
      ? "Kies je leeftijdscategorie"
      : "Selecteer minimaal 1 symptoom";

  return (
    <div
      className="relative px-6 pb-10"
      style={{ maxWidth: 480, margin: "0 auto", boxSizing: "border-box", width: "100%" }}
    >
      <div
        className="absolute -left-[200vw] h-0 overflow-hidden opacity-0"
        aria-hidden
      >
        <label htmlFor="intake-website-hp">Website</label>
        <input
          id="intake-website-hp"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypotWebsite}
          onChange={(e) => onHoneypotWebsiteChange(e.target.value)}
        />
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mb-5 p-0 text-left"
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.4)",
          fontSize: 14,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        ← Terug
      </button>

      <p
        className="mb-2 text-xs font-semibold uppercase tracking-[1.5px]"
        style={{ color: "rgba(255,255,255,0.35)" }}
      >
        Stap 1 van 2
      </p>

      <h2
        className="mb-2 font-normal"
        style={{
          fontFamily: "var(--font-intake-heading), Georgia, serif",
          fontSize: 26,
          color: "rgba(255,255,255,0.92)",
        }}
      >
        Wat is je leeftijdscategorie?
      </h2>

      <div className="mb-8 grid grid-cols-2 gap-3">
        {INTAKE_AGE_RANGE_OPTIONS.map((opt) => {
          const active = ageRange === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onAgeRangeChange(opt)}
              className="cursor-pointer rounded-[14px] text-center font-semibold transition-all duration-[250ms] ease-out"
              style={{
                padding: "12px",
                fontSize: 14,
                background: active ? "#C8956C" : "rgba(255,255,255,0.07)",
                color: active ? "white" : "rgba(255,255,255,0.75)",
                border: active
                  ? "1px solid rgba(200,149,108,0.5)"
                  : "1px solid rgba(255,255,255,0.1)",
                boxShadow: active ? "0 4px 20px rgba(200,149,108,0.2)" : "none",
                fontFamily: "inherit",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <h2
        className="mb-2 font-normal"
        style={{
          fontFamily: "var(--font-intake-heading), Georgia, serif",
          fontSize: 26,
          color: "rgba(255,255,255,0.92)",
        }}
      >
        Wat herken je?
      </h2>

      <p
        className="mb-6"
        style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}
      >
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
              className="flex cursor-pointer items-center gap-4 rounded-[14px] px-5 py-5 text-left transition-all duration-[250ms] ease-out"
              style={{
                background: active
                  ? "rgba(200,149,108,0.18)"
                  : "rgba(255,255,255,0.07)",
                color: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.8)",
                border: active
                  ? "1px solid rgba(200,149,108,0.35)"
                  : "1px solid rgba(255,255,255,0.1)",
                boxShadow: active
                  ? "inset 4px 0 0 #C8956C"
                  : "none",
                pointerEvents: pointerLocked ? "none" : "auto",
                fontFamily: "inherit",
              }}
            >
              <span className="text-[28px]">{s.icon}</span>
              <div>
                <div className="text-[17px] font-semibold">{s.label}</div>
                <div
                  className="mt-0.5 text-[13px]"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {s.desc}
                </div>
              </div>
              {active && (
                <div
                  className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "#C8956C" }}
                >
                  <span className="text-sm font-bold text-white">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => canProceed && onNext()}
        disabled={!canProceed}
        className="w-full rounded-[14px] border-none py-[18px] text-base font-semibold transition-all duration-300"
        style={{
          background: canProceed ? "#C8956C" : "rgba(255,255,255,0.08)",
          color: canProceed ? "white" : "rgba(255,255,255,0.3)",
          cursor: canProceed ? "pointer" : "default",
          pointerEvents: pointerLocked ? "none" : "auto",
          boxShadow: canProceed ? "0 4px 20px rgba(200,149,108,0.25)" : "none",
          fontFamily: "inherit",
        }}
      >
        {verderLabel}
      </button>
    </div>
  );
}
