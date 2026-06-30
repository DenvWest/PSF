"use client";

import type { CSSProperties, ReactNode } from "react";

export type ResultsRevealShellVariant = "fullscreen" | "embedded-card";

type ResultsRevealShellProps = {
  children: ReactNode;
  variant?: ResultsRevealShellVariant;
  brandStyle?: CSSProperties;
};

export default function ResultsRevealShell({
  children,
  variant = "fullscreen",
  brandStyle,
}: ResultsRevealShellProps) {
  const embedded = variant === "embedded-card";

  return (
    <div
      className={
        embedded
          ? "min-h-dvh bg-[#f8f7f4] px-4 py-6 sm:px-6"
          : "ps-dash-surface-kompas min-h-dvh w-full"
      }
      style={brandStyle}
    >
      <div
        className={
          embedded
            ? "ps-dark mx-auto w-full max-w-[480px] rounded-3xl shadow-[0_24px_64px_rgba(15,28,16,0.18)] lg:max-w-[600px]"
            : "mx-auto w-full max-w-[600px]"
        }
      >
        <main className="box-border w-full px-4 pb-10 pt-2 lg:px-7">{children}</main>
      </div>
    </div>
  );
}
