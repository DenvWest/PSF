"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

type Theme = {
  id: string;
  label: string;
  tag: string;
  icon: string;
  bgClass: string;
  textClass: string;
  themaLink?: string;
};

const THEMES: Theme[] = [
  {
    id: "slaap",
    label: "Slaap",
    tag: "Slaap",
    icon: "🌙",
    bgClass: "bg-indigo-50",
    textClass: "text-indigo-600",
    themaLink: "/thema/slaap",
  },
  {
    id: "stress",
    label: "Stress",
    tag: "Stress",
    icon: "🧘",
    bgClass: "bg-amber-50",
    textClass: "text-amber-600",
  },
  {
    id: "energie",
    label: "Energie",
    tag: "Energie",
    icon: "⚡",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-600",
  },
  {
    id: "herstel",
    label: "Herstel",
    tag: "Herstel",
    icon: "🔄",
    bgClass: "bg-rose-50",
    textClass: "text-rose-600",
    themaLink: "/thema/herstel",
  },
];

export default function ThemeFilter() {
  const router = useRouter();

  const handleThemeClick = useCallback(
    (theme: Theme) => {
      if (theme.themaLink) {
        router.push(theme.themaLink);
        return;
      }

      const tagLower = theme.tag.toLowerCase();
      const cards = document.querySelectorAll<HTMLElement>("[data-tags]");
      for (const card of cards) {
        const tags = card.getAttribute("data-tags") ?? "";
        if (tags.toLowerCase().includes(tagLower)) {
          card.scrollIntoView({ behavior: "smooth", block: "center" });
          card.classList.add("ring-2", "ring-[#5A8F6A]", "ring-offset-2");
          setTimeout(() => {
            card.classList.remove("ring-2", "ring-[#5A8F6A]", "ring-offset-2");
          }, 1800);
          break;
        }
      }
    },
    [router],
  );

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-8 lg:p-10 shadow-sm">
      <p className="text-xs font-medium tracking-widest text-stone-400 uppercase mb-2">
        HERKENBAAR?
      </p>
      <h2 className="font-serif text-2xl text-stone-900 mb-1">
        Wat speelt er bij jou?
      </h2>
      <p className="text-stone-500 text-sm mb-6">
        Kies een thema — we laten je zien welk supplement het meest relevant is.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeClick(theme)}
            className="flex flex-col items-center gap-2 p-5 rounded-xl border border-stone-200 hover:border-[#5A8F6A] hover:bg-[#5A8F6A]/5 transition-all cursor-pointer group text-left"
            aria-label={`Filter op ${theme.label}`}
          >
            <span
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${theme.bgClass} ${theme.textClass}`}
              aria-hidden="true"
            >
              {theme.icon}
            </span>
            <span className="text-sm font-medium text-stone-700 group-hover:text-[#5A8F6A] transition-colors">
              {theme.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
