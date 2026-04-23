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
      ? "bg-[#5A8F6A] text-white shadow-sm font-semibold"
      : "bg-white text-stone-600 border border-stone-200 hover:border-[#5A8F6A]/30 hover:text-[#5A8F6A] transition-all";

  return (
    <>
      {/* Desktop: vertical sticky sidebar */}
      <nav
        className="hidden md:flex flex-col gap-2 sticky top-24"
        aria-label="Filter supplementen op thema"
        role="group"
      >
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleFilter(tag)}
            aria-pressed={active === tag}
            className={`text-left rounded-full px-4 py-2 text-sm transition-all ${chipClass(tag)}`}
          >
            {tag === "alles" ? "Alles" : THEMA_LABELS[tag as ThemaTag]}
          </button>
        ))}
      </nav>

      {/* Mobile: horizontal scrollable chip row */}
      <nav
        className="flex md:hidden gap-2 overflow-x-auto pb-1 scrollbar-hide"
        aria-label="Filter supplementen op thema"
        role="group"
      >
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleFilter(tag)}
            aria-pressed={active === tag}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-sm transition-all ${chipClass(tag)}`}
          >
            {tag === "alles" ? "Alles" : THEMA_LABELS[tag as ThemaTag]}
          </button>
        ))}
      </nav>
    </>
  );
}
