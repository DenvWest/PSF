"use client";

import Link from "next/link";

const THEMES = [
  {
    icon: "🌙",
    label: "Slaap",
    href: "/thema/slaap",
    bg: "bg-indigo-50 hover:bg-indigo-100",
  },
  {
    icon: "🧠",
    label: "Stress",
    href: "/thema/stress",
    bg: "bg-amber-50 hover:bg-amber-100",
  },
  {
    icon: "⚡",
    label: "Energie",
    href: "#energie",
    bg: "bg-emerald-50 hover:bg-emerald-100",
  },
  {
    icon: "🔄",
    label: "Herstel",
    href: "#herstel",
    bg: "bg-rose-50 hover:bg-rose-100",
  },
] as const;

export default function HeroThemeNav() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {THEMES.map(({ icon, label, href, bg }) => (
        <Link
          key={label}
          href={href}
          className="group flex flex-col items-center justify-center gap-1.5 w-20 h-20 rounded-2xl transition-colors duration-200 cursor-pointer ring-1 ring-stone-200/60 shadow-sm"
          aria-label={label}
        >
          <span
            className={`w-full h-full rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors duration-200 ${bg}`}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
              {icon}
            </span>
            <span className="text-[10px] font-medium text-stone-500 leading-none">
              {label}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
