"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

export type ResultsRevealShellVariant = "fullscreen-dark" | "embedded-card";

type ResultsRevealShellProps = {
  children: ReactNode;
  variant?: ResultsRevealShellVariant;
  closeHref?: string;
  brandStyle?: CSSProperties;
};

export default function ResultsRevealShell({
  children,
  variant = "fullscreen-dark",
  closeHref = "/",
  brandStyle,
}: ResultsRevealShellProps) {
  const embedded = variant === "embedded-card";

  return (
    <div
      className={embedded ? "min-h-dvh bg-[#f8f7f4] px-4 py-6 sm:px-6" : "ps-dark min-h-dvh"}
      style={brandStyle}
    >
      <Link
        href={closeHref}
        className={
          embedded
            ? "fixed right-4 top-4 z-50 px-1 py-1 text-[13px] text-stone-500 no-underline transition-colors hover:text-stone-800"
            : "fixed right-4 top-4 z-50 px-1 py-1 text-[13px] text-intake-ink-subtle no-underline transition-colors hover:text-intake-ink"
        }
        aria-label="Sluiten"
      >
        ✕ Sluiten
      </Link>

      <div
        className={
          embedded
            ? "ps-dark mx-auto w-full max-w-[480px] rounded-3xl shadow-[0_24px_64px_rgba(15,28,16,0.18)] lg:max-w-[720px]"
            : "mx-auto w-full max-w-[480px] lg:max-w-[720px]"
        }
      >
        <main className="box-border w-full px-6 pb-10 pt-8">{children}</main>
      </div>
    </div>
  );
}
