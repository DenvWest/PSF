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
      role="progressbar"
      aria-valuenow={currentCatIndex + 1}
      aria-valuemin={1}
      aria-valuemax={categories.length}
      aria-label="Voortgang per categorie"
    >
      {categories.map((cat, i) => (
        <div
          key={cat.id}
          className="h-2 rounded transition-all duration-300 ease-out"
          style={{
            width: i === currentCatIndex ? 28 : 8,
            background:
              i < currentCatIndex
                ? cat.color
                : i === currentCatIndex
                  ? cat.color
                  : "#ddd",
            opacity: i <= currentCatIndex ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  );
}
