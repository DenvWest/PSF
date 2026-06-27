"use client";

import { useCallback, useEffect, useRef } from "react";

type IntakeSliderProps = {
  /** Labels per discrete stop (links → rechts). */
  labels: string[];
  /** Huidige stop-index. */
  value: number;
  onChange: (index: number) => void;
  minLabel?: string;
  maxLabel?: string;
  ariaLabel?: string;
};

export default function IntakeSlider({
  labels,
  value,
  onChange,
  minLabel = "Nooit",
  maxLabel = "Vaak",
  ariaLabel = "Sleep om je antwoord te kiezen",
}: IntakeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const lastIndexRef = useRef(value);

  const maxIndex = Math.max(0, labels.length - 1);
  const safeValue = Math.min(Math.max(0, value), maxIndex);
  const fraction = maxIndex === 0 ? 0 : safeValue / maxIndex;
  const pct = fraction * 100;

  const indexFromClientX = useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track) {
        return safeValue;
      }
      const rect = track.getBoundingClientRect();
      if (rect.width === 0) {
        return safeValue;
      }
      const ratio = (clientX - rect.left) / rect.width;
      return Math.min(maxIndex, Math.max(0, Math.round(ratio * maxIndex)));
    },
    [maxIndex, safeValue],
  );

  const commit = useCallback(
    (next: number) => {
      if (next !== lastIndexRef.current) {
        lastIndexRef.current = next;
        onChange(next);
      }
    },
    [onChange],
  );

  useEffect(() => {
    lastIndexRef.current = safeValue;
  }, [safeValue]);

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      if (!draggingRef.current) {
        return;
      }
      event.preventDefault();
      commit(indexFromClientX(event.clientX));
    };
    const handleUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener("pointermove", handleMove, { passive: false });
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [commit, indexFromClientX]);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    commit(indexFromClientX(event.clientX));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    let next: number | null = null;
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowDown":
        next = safeValue - 1;
        break;
      case "ArrowRight":
      case "ArrowUp":
        next = safeValue + 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = maxIndex;
        break;
      default:
        return;
    }
    event.preventDefault();
    commit(Math.min(maxIndex, Math.max(0, next)));
  }

  return (
    <div className="select-none">
      <div className="mb-9 text-center">
        <span className="font-serif text-2xl font-normal text-intake-ink transition-opacity duration-150">
          {labels[safeValue]}
        </span>
      </div>

      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        className="relative flex h-11 cursor-pointer items-center px-1 touch-none"
      >
        <div className="relative h-1.5 w-full rounded-full bg-white/10">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-intake-sage transition-[width] duration-100 ease-out"
            style={{ width: `${pct}%` }}
          />
          {labels.map((_, i) => (
            <span
              key={i}
              aria-hidden
              className="absolute top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25"
              style={{ left: `${maxIndex === 0 ? 0 : (i / maxIndex) * 100}%` }}
            />
          ))}
          <div
            role="slider"
            tabIndex={0}
            aria-label={ariaLabel}
            aria-valuemin={0}
            aria-valuemax={maxIndex}
            aria-valuenow={safeValue}
            aria-valuetext={labels[safeValue]}
            onKeyDown={handleKeyDown}
            className="absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-intake-sage bg-intake-bg shadow-[0_0_0_6px_rgba(90,143,106,0.18)] outline-none transition-[left] duration-100 ease-out focus-visible:shadow-[0_0_0_8px_rgba(90,143,106,0.32)]"
            style={{ left: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between px-1 text-xs font-semibold uppercase tracking-[0.14em] text-intake-ink-subtle">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
