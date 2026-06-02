"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HOMEPAGE_HERO } from "@/data/homepage";
import { CATEGORIES } from "@/data/intake-questions";

export default function FloatingLeefstijlcheckCta() {
  const { widget } = HOMEPAGE_HERO;
  const domainPreview = CATEGORIES.slice(0, 4);
  const [dismissed, setDismissed] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let hasRevealed = false;

    function reveal() {
      if (hasRevealed) return;
      hasRevealed = true;
      setRevealed(true);
      window.removeEventListener("scroll", onScroll);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    }

    function onScroll() {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0 && window.scrollY / total >= 0.25) {
        reveal();
      }
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    timeoutId = setTimeout(reveal, 6000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <aside
      role="complementary"
      aria-label="Leefstijlcheck"
      className={[
        "fixed z-40 transition-all duration-500 ease-out",
        "max-sm:inset-x-3 max-sm:bottom-3 max-sm:max-w-none",
        "sm:bottom-6 sm:right-6 sm:max-w-[360px]",
        revealed
          ? "pointer-events-auto translate-x-0 translate-y-0 opacity-100"
          : "pointer-events-none translate-x-6 translate-y-4 opacity-0 max-sm:translate-y-8",
      ].join(" ")}
    >
      <div className="relative rounded-2xl bg-ps-green p-4 text-white shadow-[0_12px_40px_rgba(90,143,106,0.32)] sm:p-6">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:ring-2 focus-visible:ring-white/50"
          aria-label="Sluit Leefstijlcheck-promo"
        >
          <span aria-hidden className="text-xl leading-none">
            ×
          </span>
        </button>

        <p className="pr-10 text-[11px] font-semibold uppercase tracking-widest text-white/80">
          {widget.eyebrow}
        </p>
        <h2 className="mt-1.5 pr-8 font-serif text-lg leading-tight text-white sm:mt-2 sm:text-2xl">
          {widget.title}
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-white/90 sm:mt-2 sm:text-sm">
          {widget.body}
        </p>

        <ul
          className="mt-4 hidden flex-wrap gap-2 sm:flex"
          aria-label="Domeinen in de check"
        >
          {domainPreview.map((category) => (
            <li key={category.id} className="list-none">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white">
                <span aria-hidden>{category.icon}</span>
                {category.label}
              </span>
            </li>
          ))}
          <li className="list-none">
            <span className="inline-flex rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white">
              +2 meer
            </span>
          </li>
        </ul>

        <Link
          href="/intake"
          className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-ps-green shadow-sm transition hover:bg-stone-50 sm:mt-6"
        >
          {widget.cta}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </aside>
  );
}
