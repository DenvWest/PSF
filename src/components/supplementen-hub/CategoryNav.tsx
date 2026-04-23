"use client";

import type { ThemaTag } from "@/data/supplementen-hub/catalog";
import { useState } from "react";

type CategoryNavProps = {
  themas: ThemaTag[];
};

const THEMA_LABELS: Record<ThemaTag, string> = {
  slaap: "Slaap",
  stress: "Stress",
  energie: "Energie",
  herstel: "Herstel",
};

export default function CategoryNav({ themas }: CategoryNavProps) {
  const [active, setActive] = useState<ThemaTag | "alles">("alles");

  function handleFilter(tag: ThemaTag | "alles") {
    setActive(tag);

    const cards = document.querySelectorAll<HTMLElement>("[data-themas]");
    cards.forEach((card) => {
      if (tag === "alles") {
        card.classList.remove("hidden");
        return;
      }
      const cardThemas = card.dataset.themas?.split(" ") ?? [];
      if (cardThemas.includes(tag)) {
        card.classList.remove("hidden");
      } else {
        card.classList.add("hidden");
      }
    });
  }

  const allTags: (ThemaTag | "alles")[] = ["alles", ...themas];

  const chipClass = (tag: ThemaTag | "alles") =>
    tag === active
      ? "bg-[#5A8F6A] text-white"
      : "bg-stone-100 text-stone-600 hover:bg-stone-200";

  return (
    <>
      {/* Desktop: vertical sticky sidebar */}
      <nav
        className="hidden md:flex flex-col gap-1 sticky top-24"
        aria-label="Filter op thema"
      >
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleFilter(tag)}
            className={`text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors ${chipClass(tag)}`}
          >
            {tag === "alles" ? "Alles" : THEMA_LABELS[tag as ThemaTag]}
          </button>
        ))}
      </nav>

      {/* Mobile: horizontal scrollable chip row */}
      <nav
        className="flex md:hidden gap-2 overflow-x-auto pb-2 scrollbar-hide"
        aria-label="Filter op thema"
      >
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleFilter(tag)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${chipClass(tag)}`}
          >
            {tag === "alles" ? "Alles" : THEMA_LABELS[tag as ThemaTag]}
          </button>
        ))}
      </nav>
    </>
  );
}
