"use client";

import type { Category } from "@/data/intake-questions";

type ProgressDotsProps = {
  categories: readonly Category[];
  currentCatIndex: number;
};

export default function ProgressDots({
  categories,
  currentCatIndex,
}: ProgressDotsProps) {
  return (
    <div
      className="flex justify-center gap-1.5 py-4"
      role="presentation"
      aria-hidden="true"
    >
      {categories.map((cat, i) => (
        <div
          key={cat.id}
          className="h-1.5 rounded transition-all duration-300 ease-out"
          style={{
            width: i === currentCatIndex ? 24 : 6,
            background:
              i < currentCatIndex
                ? cat.color
                : i === currentCatIndex
                  ? cat.color
                  : "rgba(255,255,255,0.15)",
            opacity: i <= currentCatIndex ? 1 : 0.5,
          }}
        />
      ))}
    </div>
  );
}
