"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/lib/ga4";
import { getLastSession } from "@/lib/intake-storage";
import { resolvePrimaryMobileCta } from "@/lib/mobile-cta-state";

const mainLinks = [
  { href: "/supplementen", label: "Supplementen" },
  { href: "/inzichten", label: "Inzichten" },
  { href: "/gidsen", label: "Gidsen" },
];

const mobileMenuLinks = [
  { href: "/supplementen", label: "Supplementen" },
  { href: "/inzichten", label: "Inzichten" },
  { href: "/gidsen", label: "Gidsen" },
];

type HeaderClientProps = {
  accountLinkHref: string;
  accountLinkLabel: string;
};

export default function HeaderClient({
  accountLinkHref,
  accountLinkLabel,
}: HeaderClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasIntakeSession, setHasIntakeSession] = useState(false);
  const isLoggedIn = accountLinkLabel === "Dashboard";

  useEffect(() => {
    let cancelled = false;
    void getLastSession().then((loaded) => {
      if (!cancelled) {
        setHasIntakeSession(Boolean(loaded?.session));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const primaryMobileAction = useMemo(
    () =>
      resolvePrimaryMobileCta({
        isLoggedIn,
        hasIntakeSession,
      }),
    [isLoggedIn, hasIntakeSession],
  );
  const secondaryMobileAction = isLoggedIn
    ? { href: "/intake", label: "Doe de gratis check" }
    : { href: "/account/login", label: "Inloggen" };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-stone-200/60 bg-[var(--ps-bg)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/icon.png"
                alt="PerfectSupplement logo"
                width={34}
                height={34}
                className="h-8 w-8 rounded-lg md:h-[34px] md:w-[34px]"
                priority
              />
              <span className="text-lg font-semibold tracking-tight text-stone-900">
                Perfect<span className="text-stone-800">Supplement</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-7 md:flex">
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={
                    link.href === "/inzichten"
                      ? () =>
                          trackEvent("inzichten_hub_nav_click", {
                            source: "header",
                          })
                      : undefined
                  }
                  className="text-sm font-medium text-stone-500 transition hover:text-stone-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={accountLinkHref}
              className="hidden rounded-lg border border-stone-200 px-3.5 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 hover:text-stone-900 md:inline-flex"
            >
              {accountLinkLabel}
            </Link>
            <Link
              href="/intake"
              className="hidden rounded-lg bg-ps-green px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-ps-green-hover md:inline-flex"
            >
              Doe de gratis check →
            </Link>

            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-stone-500 transition hover:border-stone-200 hover:bg-stone-50 hover:text-stone-900 md:hidden"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-50 transition ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black/20 backdrop-blur-[1px] transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0"}`}
        />

        <aside
          className={`absolute right-0 top-0 h-full w-full max-w-sm border-l border-stone-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              aria-label="Naar home"
              className="inline-flex items-center gap-2"
            >
              <Image
                src="/icon.png"
                alt="PerfectSupplement logo"
                width={24}
                height={24}
                className="h-6 w-6 rounded-md"
              />
              <span className="text-sm font-semibold text-stone-900">
                PerfectSupplement
              </span>
            </Link>
            <button
              type="button"
              aria-label="Sluit menu"
              onClick={() => setMenuOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-stone-500 transition hover:border-stone-200 hover:bg-stone-50 hover:text-stone-900"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div className="flex h-[calc(100%-81px)] flex-col justify-between overflow-y-auto px-6 py-6">
            <nav className="space-y-1">
              <Link
                href={primaryMobileAction.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-2xl bg-ps-green px-4 py-3 text-base font-semibold text-white transition hover:bg-ps-green-hover"
              >
                {primaryMobileAction.label} →
              </Link>
              {mobileMenuLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    if (link.href === "/inzichten") {
                      trackEvent("inzichten_hub_nav_click", {
                        source: "header",
                      });
                    }
                    setMenuOpen(false);
                  }}
                  className="block rounded-2xl px-4 py-3 text-base font-medium text-stone-800 transition hover:bg-stone-50 hover:text-stone-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-8 border-t border-stone-200 pt-5">
              <Link
                href={secondaryMobileAction.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-2xl bg-ps-green/10 px-4 py-3 text-base font-semibold text-ps-green transition hover:bg-ps-green/15"
              >
                {secondaryMobileAction.label}
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
