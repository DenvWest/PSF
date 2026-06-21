"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ExitButton from "@/components/app/ExitButton";
import Wordmark from "@/components/app/Wordmark";
import DashboardUnlockPreview from "@/components/dashboard/unlock/DashboardUnlockPreview";
import {
  DASHBOARD_UNLOCK_CTA,
  DASHBOARD_UNLOCK_FAQ,
  DASHBOARD_UNLOCK_GAINS,
  DASHBOARD_UNLOCK_HERO,
  DASHBOARD_UNLOCK_LOSSES,
  DASHBOARD_UNLOCK_RECOGNITION,
  DASHBOARD_UNLOCK_ROUTE_ACCORDION,
  DASHBOARD_UNLOCK_SOCIAL_PROOF,
  DASHBOARD_UNLOCK_STEPS,
} from "@/data/dashboard-unlock";
import {
  DASHBOARD_UNLOCK_VARIANT_COOKIE,
  type DashboardUnlockVariant,
} from "@/lib/dashboard-unlock-variant";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";

type DashboardUnlockSqueezeProps = {
  variant: DashboardUnlockVariant;
  persistCookie: boolean;
};

function persistVariantCookie(variant: DashboardUnlockVariant) {
  const maxAge = 60 * 60 * 24 * 30;
  document.cookie = `${DASHBOARD_UNLOCK_VARIANT_COOKIE}=${variant}; path=/; max-age=${maxAge}; samesite=lax`;
}

function GainLossContrast() {
  return (
    <section aria-labelledby="gain-loss-heading" className="space-y-3">
      <h2 id="gain-loss-heading" className="sr-only">
        Met of zonder account
      </h2>
      <div className="grid gap-4 md:grid-cols-2 md:gap-5 lg:gap-6">
        <article className="rounded-2xl border border-[rgba(90,143,106,0.32)] bg-[rgba(90,143,106,0.08)] p-4 sm:p-5 lg:p-6">
          <h3 className="mb-3 text-sm font-semibold text-[var(--sage)]">
            {DASHBOARD_UNLOCK_GAINS.title}
          </h3>
          <ul className="space-y-2">
            {DASHBOARD_UNLOCK_GAINS.items.map((item) => (
              <li
                key={item}
                className="flex gap-2.5 text-[15px] leading-snug text-[var(--text)]"
              >
                <span className="shrink-0 text-[var(--sage)]" aria-hidden>
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-2xl border border-[rgba(200,149,108,0.25)] bg-[rgba(200,149,108,0.06)] p-4 sm:p-5 lg:p-6">
          <h3 className="mb-3 text-sm font-semibold text-[var(--terra)]">
            {DASHBOARD_UNLOCK_LOSSES.title}
          </h3>
          <ul className="space-y-2">
            {DASHBOARD_UNLOCK_LOSSES.items.map((item) => (
              <li
                key={item}
                className="flex gap-2.5 text-[15px] leading-snug text-[var(--text-muted)]"
              >
                <span className="shrink-0 text-[var(--terra)]" aria-hidden>
                  ✗
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
      <p className="text-sm text-[var(--text-subtle)]">
        {DASHBOARD_UNLOCK_LOSSES.closingLine}
      </p>
    </section>
  );
}

function UnlockSqueezeZone({
  variant,
  onCtaVisibleChange,
}: {
  variant: DashboardUnlockVariant;
  onCtaVisibleChange?: (visible: boolean) => void;
}) {
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ctaRef.current;
    if (!node || !onCtaVisibleChange) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        onCtaVisibleChange(entry?.isIntersecting ?? false);
      },
      { threshold: 0, rootMargin: "0px 0px -72px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [onCtaVisibleChange]);

  return (
    <section
      ref={ctaRef}
      aria-label="Begin met je dashboard"
      className="rounded-2xl border border-[rgba(90,143,106,0.24)] bg-gradient-to-b from-[rgba(33,56,31,0.95)] to-[rgba(26,46,26,0.98)] p-4 sm:p-5 md:p-6"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--sage)]">
        {DASHBOARD_UNLOCK_CTA.label}
      </p>
      <Link
        href={DASHBOARD_UNLOCK_CTA.primaryHref}
        onClick={() =>
          trackEvent(GA4_EVENTS.DASHBOARD_UNLOCK_CTA_CLICKED, {
            variant,
            placement: "primary",
          })
        }
        className="mt-4 flex min-h-[52px] w-full items-center justify-center rounded-[14px] bg-[var(--sage)] px-6 text-[15.5px] font-semibold text-[#0f1c10] no-underline transition hover:opacity-95"
      >
        {DASHBOARD_UNLOCK_CTA.primaryLabel}
      </Link>
      <p className="mt-4 text-center text-sm">
        <Link
          href={DASHBOARD_UNLOCK_CTA.secondaryHref}
          className="text-[var(--text-muted)] underline decoration-white/20 underline-offset-2 transition hover:text-[var(--text)] hover:decoration-white/40"
        >
          {DASHBOARD_UNLOCK_CTA.secondaryLabel}
        </Link>
      </p>
      <p className="mt-4 text-center text-xs leading-relaxed text-[var(--text-subtle)]">
        {DASHBOARD_UNLOCK_CTA.trustLine}
      </p>
    </section>
  );
}

function StickyCtaBar({
  visible,
  variant,
}: {
  visible: boolean;
  variant: DashboardUnlockVariant;
}) {
  if (visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#1a2e1a]/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] backdrop-blur md:hidden">
      <Link
        href={DASHBOARD_UNLOCK_CTA.primaryHref}
        onClick={() =>
          trackEvent(GA4_EVENTS.DASHBOARD_UNLOCK_CTA_CLICKED, {
            variant,
            placement: "sticky",
          })
        }
        className="flex min-h-[48px] w-full items-center justify-center rounded-[14px] bg-[var(--sage)] text-sm font-semibold text-[#0f1c10] no-underline"
      >
        {DASHBOARD_UNLOCK_CTA.primaryLabel}
      </Link>
    </div>
  );
}

function RecognitionSection() {
  return (
    <section aria-labelledby="recognition-heading" className="hidden xl:block">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
        {DASHBOARD_UNLOCK_RECOGNITION.sectionLabel}
      </p>
      <h2 id="recognition-heading" className="sr-only">
        Herkenningscitaten
      </h2>
      <ul className="mt-3 space-y-2">
        {DASHBOARD_UNLOCK_RECOGNITION.quotes.map((quote) => (
          <li
            key={quote}
            className="rounded-xl border border-[var(--panel-border)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm leading-snug text-[var(--text-muted)]"
          >
            &ldquo;{quote}&rdquo;
          </li>
        ))}
      </ul>
    </section>
  );
}

function SqueezeContent({
  variant,
}: {
  variant: DashboardUnlockVariant;
}) {
  const [primaryCtaVisible, setPrimaryCtaVisible] = useState(true);

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <Wordmark size={0.92} />
        <ExitButton href="/" />
      </div>

      <header className="mt-5 max-w-2xl sm:mt-8 lg:max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--sage)]">
          {DASHBOARD_UNLOCK_HERO.eyebrow}
        </p>
        <h1
          className="mt-2.5 text-[1.375rem] leading-[1.15] text-[var(--text)] sm:mt-3 sm:text-[clamp(1.625rem,4vw,2.5rem)]"
          style={{ fontFamily: "var(--f-serif)", fontWeight: 400 }}
        >
          {DASHBOARD_UNLOCK_HERO.title}
        </h1>
        <p className="mt-2.5 text-base leading-snug text-[var(--text)] sm:mt-3 sm:text-[17px]">
          {DASHBOARD_UNLOCK_HERO.lead}
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--text-muted)] sm:text-base">
          {DASHBOARD_UNLOCK_HERO.subtitle}
        </p>
      </header>

      <div className="mt-6 space-y-5 sm:mt-8 sm:space-y-8 lg:mt-10 lg:space-y-10">
        <GainLossContrast />

        <div className="flex flex-col gap-5 sm:gap-6 xl:grid xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] xl:items-start xl:gap-10">
          <div className="order-1 xl:order-2">
            <div className="flex flex-col gap-5 sm:gap-6">
              <UnlockSqueezeZone
                variant={variant}
                onCtaVisibleChange={setPrimaryCtaVisible}
              />
              <RecognitionSection />
            </div>
          </div>
          <div className="order-2 xl:order-1">
            <DashboardUnlockPreview />
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-[var(--text-subtle)] sm:mt-8 lg:mt-10">
        {DASHBOARD_UNLOCK_SOCIAL_PROOF.line}
      </p>

      <details className="group mt-8 rounded-2xl border border-[var(--panel-border)] bg-[rgba(255,255,255,0.03)]">
        <summary className="cursor-pointer list-none px-5 py-4 text-base font-semibold text-[var(--text)] marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-3">
            {DASHBOARD_UNLOCK_ROUTE_ACCORDION.title}
            <span className="text-[var(--text-subtle)] transition group-open:rotate-180">
              ▾
            </span>
          </span>
        </summary>
        <ol className="space-y-0 border-t border-[var(--divider)] px-5 pb-5 pt-2">
          {DASHBOARD_UNLOCK_STEPS.map((step, index) => (
            <li
              key={step.step}
              className={`relative border-l border-white/10 py-4 pl-6 ${
                index === DASHBOARD_UNLOCK_STEPS.length - 1
                  ? "border-l-transparent"
                  : ""
              }`}
            >
              <span
                aria-hidden
                className="absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[#1a2e1a] text-sm font-semibold text-[var(--text)]"
                style={{ fontFamily: "var(--f-serif)" }}
              >
                {step.step}
              </span>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h3 className="text-sm font-semibold text-[var(--text)]">
                  {step.title}
                </h3>
                <span className="rounded-full bg-white/8 px-2 py-0.5 text-[11px] text-[var(--text-subtle)]">
                  {step.timeLabel}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </details>

      <section aria-labelledby="unlock-faq-heading" className="mt-8">
        <h2
          id="unlock-faq-heading"
          className="mb-4 text-xl text-[var(--text)]"
          style={{ fontFamily: "var(--f-serif)" }}
        >
          Veelgestelde vragen
        </h2>
        <div className="space-y-3">
          {DASHBOARD_UNLOCK_FAQ.map((item) => (
            <details
              key={item.question}
              className="rounded-xl border border-[var(--panel-border)] bg-[rgba(255,255,255,0.03)]"
            >
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-[var(--text)] marker:content-none [&::-webkit-details-marker]:hidden">
                {item.question}
              </summary>
              <p className="border-t border-[var(--divider)] px-4 py-3 text-sm leading-relaxed text-[var(--text-muted)]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <footer className="mt-10 border-t border-[var(--divider)] pt-6 text-center">
        <p
          className="mx-auto max-w-lg text-xs leading-relaxed"
          style={{ color: "rgba(255,255,255,0.22)" }}
        >
          PerfectSupplement geeft adviezen op basis van leefstijl, geen medische
          diagnoses. Je gegevens zijn van jou — exporteer of verwijder ze wanneer
          je wilt.
        </p>
        <p className="mt-3 text-xs leading-relaxed text-[var(--text-subtle)]">
          <Link
            href="/privacy"
            className="underline decoration-white/20 underline-offset-2 hover:text-[var(--text-muted)]"
          >
            Privacy
          </Link>
          {" · "}
          <Link
            href="/medische-disclaimer"
            className="underline decoration-white/20 underline-offset-2 hover:text-[var(--text-muted)]"
          >
            Medische disclaimer
          </Link>
          {" · "}
          <Link
            href="/methodologie"
            className="underline decoration-white/20 underline-offset-2 hover:text-[var(--text-muted)]"
          >
            Methodologie
          </Link>
        </p>
      </footer>

      <StickyCtaBar visible={primaryCtaVisible} variant={variant} />
    </>
  );
}

export default function DashboardUnlockSqueeze({
  variant,
  persistCookie,
}: DashboardUnlockSqueezeProps) {
  useEffect(() => {
    if (persistCookie) {
      persistVariantCookie(variant);
    }
    trackEvent(GA4_EVENTS.DASHBOARD_UNLOCK_VIEWED, { variant });
  }, [persistCookie, variant]);

  if (variant === "b") {
    return (
      <div className="min-h-dvh overflow-x-hidden bg-[#f8f7f4] sm:px-6 sm:py-8">
        <div className="ps-dark mx-auto w-full max-w-6xl overflow-hidden shadow-[0_24px_64px_rgba(15,28,16,0.18)] sm:rounded-3xl">
          <main className="box-border w-full min-w-0 px-4 pb-28 pt-4 sm:px-8 sm:pb-10 sm:pt-6 lg:px-10">
            <SqueezeContent variant={variant} />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="ps-dark min-h-dvh w-full overflow-x-hidden">
      <main className="mx-auto box-border w-full min-w-0 max-w-6xl px-4 pb-28 pt-4 sm:px-8 sm:pb-10 sm:pt-6 lg:px-10">
        <SqueezeContent variant={variant} />
      </main>
    </div>
  );
}
