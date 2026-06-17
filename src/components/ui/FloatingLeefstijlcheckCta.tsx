"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HOMEPAGE_HERO } from "@/data/homepage";
import { CATEGORIES } from "@/data/intake-questions";
import { getLastSession } from "@/lib/intake-storage";
import { resolvePrimaryMobileCta, type MobileCtaAction } from "@/lib/mobile-cta-state";
import { useInBodyLeefstijlcheckCtaVisible } from "@/lib/use-in-body-leefstijlcheck-cta-visible";

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

function MobileQuickCta({
  action,
  onDismiss,
}: {
  action: MobileCtaAction;
  onDismiss: () => void;
}) {
  return (
    <div className="relative rounded-xl border border-stone-200 bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
        aria-label="Sluit snelle actie"
      >
        <span aria-hidden className="text-lg leading-none">
          ×
        </span>
      </button>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
        Snelle actie
      </p>
      <Link
        href={action.href}
        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-ps-green px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ps-green-hover"
      >
        {action.label} →
      </Link>
    </div>
  );
}

type FloatingLeefstijlcheckCtaProps = {
  revealOnScroll?: boolean;
  scrollThreshold?: number;
  revealOnTimer?: boolean;
  revealAfterMs?: number;
  showOnAllScreens?: boolean;
};

export default function FloatingLeefstijlcheckCta({
  revealOnScroll = true,
  scrollThreshold = 0.25,
  revealOnTimer = true,
  revealAfterMs = 6000,
  showOnAllScreens = false,
}: FloatingLeefstijlcheckCtaProps = {}) {
  const { widget } = HOMEPAGE_HERO;
  const domainPreview = CATEGORIES.slice(0, 4);
  const [dismissed, setDismissed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasIntakeSession, setHasIntakeSession] = useState(false);
  const inBodyCtaVisible = useInBodyLeefstijlcheckCtaVisible();
  const isShown = revealed && !inBodyCtaVisible && (showOnAllScreens || isMobile);
  const primaryAction = resolvePrimaryMobileCta({
    isLoggedIn,
    hasIntakeSession,
  });

  useEffect(() => {
    const m = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void getLastSession().then((loaded) => {
      if (!cancelled) {
        setHasIntakeSession(Boolean(loaded?.session));
      }
    });

    void fetch("/api/account/status", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }
        return (await response.json()) as { loggedIn?: boolean };
      })
      .then((payload) => {
        if (!cancelled) {
          setIsLoggedIn(payload?.loggedIn === true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsLoggedIn(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (dismissed) return;

    let hasRevealed = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    function reveal() {
      if (hasRevealed) return;
      hasRevealed = true;
      setRevealed(true);
      if (revealOnScroll) {
        window.removeEventListener("scroll", onScroll);
      }
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    }

    function onScroll() {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0 && window.scrollY / total >= scrollThreshold) {
        reveal();
      }
    }

    if (revealOnScroll) {
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    if (revealOnTimer) {
      timeoutId = setTimeout(reveal, revealAfterMs);
    }

    return () => {
      if (revealOnScroll) {
        window.removeEventListener("scroll", onScroll);
      }
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, [dismissed, revealOnScroll, scrollThreshold, revealOnTimer, revealAfterMs]);

  useEffect(() => {
    const root = document.documentElement;
    if (isShown) {
      root.classList.add("floating-cta-active");
      return () => root.classList.remove("floating-cta-active");
    }
    root.classList.remove("floating-cta-active");
    return undefined;
  }, [isShown]);

  if (dismissed) return null;

  return (
    <aside
      role="complementary"
      aria-label="Leefstijlcheck"
      aria-hidden={!isShown}
      className={[
        "fixed z-40 transition-all duration-500 ease-out",
        showOnAllScreens
          ? "inset-x-3 bottom-3 max-w-none md:inset-x-auto md:right-6 md:bottom-6 md:max-w-sm"
          : "inset-x-3 bottom-3 max-w-none",
        isShown
          ? "pointer-events-auto translate-x-0 translate-y-0 opacity-100"
          : "pointer-events-none translate-y-8 opacity-0",
      ].join(" ")}
    >
      {isMobile ? (
        <MobileQuickCta
          action={primaryAction}
          onDismiss={() => setDismissed(true)}
        />
      ) : (
        <LeefstijlcheckPromoCard
          widget={widget}
          domainPreview={domainPreview}
          onDismiss={() => setDismissed(true)}
        />
      )}
    </aside>
  );
}
