"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HOMEPAGE_HERO } from "@/data/homepage";
import { CATEGORIES } from "@/data/intake-questions";
import {
  LEEFSTIJLCHECK_FOOTER_SLOT_ID,
} from "@/lib/leefstijlcheck-footer-slot";
import { useInBodyLeefstijlcheckCtaVisible } from "@/lib/use-in-body-leefstijlcheck-cta-visible";

const FOOTER_DOCK_MEDIA = "(min-width: 640px)";

function LeefstijlcheckPromoCard({
  widget,
  domainPreview,
  onDismiss,
}: {
  widget: (typeof HOMEPAGE_HERO)["widget"];
  domainPreview: typeof CATEGORIES;
  onDismiss: () => void;
}) {
  return (
    <div className="relative rounded-2xl bg-ps-green p-4 text-white shadow-[0_12px_40px_rgba(90,143,106,0.32)] sm:p-6">
      <button
        type="button"
        onClick={onDismiss}
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
        Doe de Leefstijlcheck — gratis →
      </Link>
    </div>
  );
}

export default function FloatingLeefstijlcheckCta() {
  const { widget } = HOMEPAGE_HERO;
  const domainPreview = CATEGORIES.slice(0, 4);
  const [dismissed, setDismissed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [footerDocked, setFooterDocked] = useState(false);
  const [canDockToFooter, setCanDockToFooter] = useState(false);
  const [footerSlot, setFooterSlot] = useState<HTMLElement | null>(null);
  const inBodyCtaVisible = useInBodyLeefstijlcheckCtaVisible();
  const isShown = revealed && !inBodyCtaVisible;
  const isDocked = isShown && footerDocked && canDockToFooter && footerSlot !== null;

  useEffect(() => {
    if (dismissed) return undefined;

    const root = document.documentElement;
    root.classList.add("has-floating-leefstijlcheck-cta");
    return () => root.classList.remove("has-floating-leefstijlcheck-cta");
  }, [dismissed]);

  useEffect(() => {
    if (dismissed) return;

    let hasRevealed = false;

    function onScroll() {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0 && window.scrollY / total >= 0.25) {
        reveal();
      }
    }

    function reveal() {
      if (hasRevealed) return;
      hasRevealed = true;
      setRevealed(true);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timeoutId);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    const timeoutId = setTimeout(reveal, 6000);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timeoutId);
    };
  }, [dismissed]);

  useEffect(() => {
    const media = window.matchMedia(FOOTER_DOCK_MEDIA);

    function syncCanDock() {
      setCanDockToFooter(media.matches);
    }

    syncCanDock();
    media.addEventListener("change", syncCanDock);

    return () => media.removeEventListener("change", syncCanDock);
  }, []);

  useEffect(() => {
    setFooterSlot(document.getElementById(LEEFSTIJLCHECK_FOOTER_SLOT_ID));
  }, []);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer || !canDockToFooter) {
      setFooterDocked(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setFooterDocked(entry.isIntersecting),
      { threshold: 0 },
    );

    observer.observe(footer);

    return () => observer.disconnect();
  }, [canDockToFooter]);

  useEffect(() => {
    const root = document.documentElement;
    if (isShown && !canDockToFooter) {
      root.classList.add("floating-cta-active");
      return () => root.classList.remove("floating-cta-active");
    }
    root.classList.remove("floating-cta-active");
    return undefined;
  }, [isShown, canDockToFooter]);

  if (dismissed) return null;

  const card = (
    <LeefstijlcheckPromoCard
      widget={widget}
      domainPreview={domainPreview}
      onDismiss={() => setDismissed(true)}
    />
  );

  if (isDocked) {
    return createPortal(
      <aside
        role="complementary"
        aria-label="Leefstijlcheck"
        className="sticky bottom-6 w-full transition-all duration-500 ease-out"
      >
        {card}
      </aside>,
      footerSlot,
    );
  }

  return (
    <aside
      role="complementary"
      aria-label="Leefstijlcheck"
      aria-hidden={!isShown}
      className={[
        "fixed z-40 transition-all duration-500 ease-out",
        "max-sm:inset-x-3 max-sm:bottom-3 max-sm:max-w-none",
        "sm:bottom-6 sm:right-6 sm:max-w-[360px]",
        isShown
          ? "pointer-events-auto translate-x-0 translate-y-0 opacity-100"
          : "pointer-events-none translate-x-6 translate-y-4 opacity-0 max-sm:translate-y-8",
      ].join(" ")}
    >
      {card}
    </aside>
  );
}
