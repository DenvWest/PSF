import Link from "next/link";
import type { KennisbankTheme } from "@/data/kennisbank";
import { getAllThemes, getTermsByTheme, themeLabels } from "@/data/kennisbank";

interface KennisbankThemaTabsProps {
  activeTheme: KennisbankTheme;
}

export default function KennisbankThemaTabs({ activeTheme }: KennisbankThemaTabsProps) {
  return (
    <nav aria-label="Thema's" className="border-b border-stone-200/60">
      <div
        className="grid grid-cols-2 gap-px bg-stone-200/35 p-px lg:grid-cols-4"
        role="tablist"
      >
        {getAllThemes().map((theme) => {
          const config = themeLabels[theme];
          const count = getTermsByTheme(theme).length;
          const isActive = theme === activeTheme;

          return (
            <Link
              key={theme}
              href={`/kennisbank/${theme}`}
              role="tab"
              aria-selected={isActive}
              className={`relative flex min-h-[4.75rem] flex-col items-center justify-center bg-white px-2.5 py-3.5 text-center transition lg:min-h-[5.25rem] lg:px-4 ${
                isActive
                  ? "text-stone-900"
                  : "text-stone-500 hover:bg-stone-50/90 hover:text-stone-700"
              }`}
            >
              <span
                className={`block max-w-[11rem] text-[0.8125rem] font-medium leading-snug lg:max-w-none lg:text-sm lg:leading-tight ${
                  isActive ? "" : ""
                }`}
              >
                {config.title}
              </span>
              <span
                className={`mt-1 block text-[0.6875rem] tabular-nums lg:text-xs ${
                  isActive ? "text-stone-500" : "text-stone-400"
                }`}
              >
                {count} {count === 1 ? "begrip" : "begrippen"}
              </span>
              {isActive ? (
                <span
                  className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-stone-900 lg:inset-x-5"
                  aria-hidden
                />
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
