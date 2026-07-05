"use client";

import { METHODOLOGY_CHAPTERS } from "@/data/methodology";
import { clarityTag } from "@/lib/clarity";

export default function MethodologyChapterPills() {
  return (
    <div className="mt-6">
      <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
        Op deze pagina
      </p>
      <nav aria-label="Op deze pagina" className="mt-3 max-w-xl">
        <ul className="divide-y divide-stone-400/25">
          {METHODOLOGY_CHAPTERS.map((chapter) => (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                onClick={() => clarityTag("page_section", chapter.id)}
                className="group flex items-baseline gap-4 border-l-2 border-transparent py-3 pl-4 transition hover:border-ps-green hover:bg-white/40"
              >
                <span className="shrink-0 font-serif text-sm tabular-nums text-stone-400">
                  {chapter.number}
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-stone-800 md:text-base">
                  {chapter.label}
                </span>
                <span
                  className="shrink-0 text-stone-400 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100"
                  aria-hidden
                >
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
