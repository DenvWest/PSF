"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { clarityTag } from "@/lib/clarity";
import { buildDashboardVandaagHref } from "@/lib/dashboard-url";
import { trackEvent } from "@/lib/ga4";
import type { PillarId } from "@/types/dashboard";

type DashboardBackLinkProps = {
  surface: "plan" | "account";
};

const backLinkClassName =
  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 text-[13px] font-medium text-white/75 no-underline transition hover:border-white/20 hover:bg-white/10 hover:text-white";

function BackIcon() {
  return (
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
  );
}

const VALID_KOMPAS = new Set<PillarId>([
  "slaap",
  "energie",
  "stress",
  "voeding",
  "beweging",
  "herstel",
  "verbinding",
]);

export default function DashboardBackLink({ surface }: DashboardBackLinkProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kompas = searchParams.get("kompas");
  const originDomain =
    kompas && VALID_KOMPAS.has(kompas as PillarId) ? (kompas as PillarId) : null;
  const href = buildDashboardVandaagHref(originDomain);

  function trackBackClick() {
    clarityTag("dashboard_back", surface);
    trackEvent("dashboard_back_click", {
      surface,
      origin_domain: originDomain ?? "none",
    });
  }

  if (surface === "plan") {
    return (
      <button
        type="button"
        onClick={() => {
          trackBackClick();
          router.replace(href);
        }}
        aria-label="Terug naar dashboard"
        className={backLinkClassName}
      >
        <BackIcon />
        Dashboard
      </button>
    );
  }

  return (
    <Link
      href={href}
      onClick={trackBackClick}
      aria-label="Terug naar dashboard"
      className={backLinkClassName}
    >
      <BackIcon />
      Dashboard
    </Link>
  );
}
