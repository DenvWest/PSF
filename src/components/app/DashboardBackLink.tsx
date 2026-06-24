"use client";

import Link from "next/link";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";

type DashboardBackLinkProps = {
  surface: "plan" | "account";
};

export default function DashboardBackLink({ surface }: DashboardBackLinkProps) {
  function handleClick() {
    clarityTag("dashboard_back", surface);
    trackEvent("dashboard_back_click", { surface });
  }

  return (
    <Link
      href="/dashboard"
      onClick={handleClick}
      aria-label="Terug naar dashboard"
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 text-[13px] font-medium text-white/75 no-underline transition hover:border-white/20 hover:bg-white/10 hover:text-white"
    >
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
      Dashboard
    </Link>
  );
}
