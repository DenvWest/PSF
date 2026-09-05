"use client";

import type { MouseEvent as ReactMouseEvent } from "react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import ArticleBackLink, {
  type ArticleSidebarBackLink,
} from "@/components/article/ArticleBackLink";
import { READING_COMPACT_ONLY_CLASS } from "@/lib/article-reading-columns";
import { parseReadingAnchorLinePx } from "@/lib/reading-metrics";
import type { ArticleTocItem } from "@/types/article-reading";

interface ArticleMobileReadingBarProps {
  back: ArticleSidebarBackLink;
  items: ArticleTocItem[];
  className?: string;
}

function scrollToHeading(id: string) {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.replaceState(null, "", `#${id}`);
  try {
    if (el && "focus" in el && typeof (el as HTMLElement).focus === "function") {
      (el as HTMLElement).focus({ preventScroll: true });
    }
  } catch {
    /* focus niet verplicht */
  }
}

/**
 * Sticky leesbalk voor telefoon en iPad: terug-icoon naast inhoudsopgave.
 * Direct kind van <article> zodat sticky de hele leeskolom meereist.
 */
export default function ArticleMobileReadingBar({
  back,
  items,
  className = "",
}: ArticleMobileReadingBarProps) {
  const labelId = useId();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);
  const rafRef = useRef<number | null>(null);
  const schedulingRef = useRef(false);

  const flush = useCallback(() => {
    schedulingRef.current = false;
    rafRef.current = null;
    if (ids.length === 0) return;
    const line = parseReadingAnchorLinePx() + 4;
    let winner: string | null = ids[0] ?? null;
    for (const id of ids) {
      const node = document.getElementById(id);
      if (!node) continue;
      if (node.getBoundingClientRect().top <= line) winner = id;
    }
    setActiveId(winner);
  }, [ids]);

  const schedule = useCallback(() => {
    if (typeof window === "undefined") return;
    if (schedulingRef.current) return;
    schedulingRef.current = true;
    rafRef.current = window.requestAnimationFrame(flush);
  }, [flush]);

  useEffect(() => {
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [schedule]);

  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  const handleNavClick = (e: ReactMouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    scrollToHeading(id);
    setOpen(false);
    if (detailsRef.current) detailsRef.current.open = false;
  };

  return (
    <nav
      aria-label="Artikel navigatie"
      className={`sticky top-[var(--sticky-toc-mobile-offset)] z-40 -mx-6 mb-8 border-b border-stone-200/80 bg-[color-mix(in_srgb,white_82%,var(--ps-bg))] shadow-[0_8px_28px_rgba(28,25,23,0.07)] backdrop-blur-xl lg:-mx-8 ${READING_COMPACT_ONLY_CLASS} ${className}`}
    >
      <div className="flex items-stretch">
        <div className="flex shrink-0 items-center pl-3 pr-1.5 md:pl-5 md:pr-2">
          <ArticleBackLink back={back} variant="icon" />
        </div>

        <div
          className="my-3 w-px shrink-0 self-stretch bg-stone-200/90"
          aria-hidden
        />

        {items.length > 0 ? (
          <details
            ref={detailsRef}
            open={open}
            onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
            className="group min-w-0 flex-1"
          >
            <summary
              aria-labelledby={labelId}
              className="flex cursor-pointer list-none items-center gap-3 px-3 py-2.5 outline-none select-none md:px-4 md:py-3 [&::-webkit-details-marker]:hidden focus-visible:bg-ps-green-light/35 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ps-green/40"
            >
              <span className="min-w-0 flex-1">
                <span
                  id={labelId}
                  className="block text-[0.62rem] font-medium uppercase tracking-[0.12em] text-stone-400 md:text-[0.66rem]"
                >
                  Inhoudsopgave
                </span>
                <span className="mt-0.5 block truncate text-[0.875rem] font-semibold tracking-tight text-stone-900 md:text-[0.9375rem]">
                  {activeItem?.label ?? "Op deze pagina"}
                </span>
              </span>
              <span
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100/90 text-stone-500 motion-safe:transition-transform motion-safe:duration-200 group-open:rotate-180"
                aria-hidden
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4 6 L8 10 L12 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </summary>
            <ul className="max-h-[min(58vh,28rem)] list-none overflow-y-auto border-t border-stone-100/90 bg-white/55 px-2 pb-3 pt-1.5 md:px-3">
              {items.map((item, index) => {
                const active = activeId === item.id;
                const n = String(index + 1).padStart(2, "0");
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => handleNavClick(e, item.id)}
                      className={`flex items-baseline gap-3 rounded-xl px-2.5 py-2.5 text-[0.875rem] leading-snug outline-none motion-safe:transition-[color,background-color] motion-safe:duration-150 md:px-3 md:text-[0.9375rem] focus-visible:ring-2 focus-visible:ring-ps-green/40 ${
                        item.depth === 3 ? "ml-5" : ""
                      } ${
                        active
                          ? "bg-ps-green-light/55 font-medium text-ps-green"
                          : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                      }`}
                    >
                      <span
                        className={`w-6 shrink-0 font-mono text-[0.68rem] tabular-nums tracking-wide md:text-[0.72rem] ${
                          active ? "text-ps-green/80" : "text-stone-300"
                        }`}
                        aria-hidden
                      >
                        {n}
                      </span>
                      <span className="min-w-0">{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </details>
        ) : (
          <p className="flex min-w-0 flex-1 items-center px-3 text-[0.875rem] font-semibold text-stone-800 md:px-4">
            {back.label}
          </p>
        )}
      </div>
    </nav>
  );
}
