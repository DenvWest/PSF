"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ExitButton from "@/components/app/ExitButton";
import { clarityTag } from "@/lib/clarity";
import { buildDashboardVandaagHref } from "@/lib/dashboard-url";
import { trackEvent } from "@/lib/ga4";
import type { PillarId } from "@/types/dashboard";

type IntakeExitProps = {
  variant?: "on-dark" | "on-light";
};

const VALID_KOMPAS_DOMAINS = new Set<PillarId>([
  "slaap",
  "energie",
  "stress",
  "voeding",
  "beweging",
  "herstel",
  "verbinding",
]);

function exitSurfaceClass(variant: "on-dark" | "on-light"): string {
  return variant === "on-light"
    ? "border-stone-200/90 bg-stone-50/95 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
    : "border-white/15 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white";
}

function ExitIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

export default function IntakeExit({ variant = "on-dark" }: IntakeExitProps) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const fromDashboard = params.get("from") === "dashboard";
  const kompasParam = params.get("kompas");
  const kompasFromParam =
    kompasParam && VALID_KOMPAS_DOMAINS.has(kompasParam as PillarId)
      ? (kompasParam as PillarId)
      : null;
  const kompasFromPath =
    pathname === "/intake/stress"
      ? "stress"
      : pathname === "/intake/slaap"
        ? "slaap"
        : pathname === "/intake/beweging"
          ? "beweging"
          : pathname === "/intake/voeding"
            ? "voeding"
            : null;
  const kompasTarget = kompasFromParam ?? kompasFromPath;
  const dashboardHref = buildDashboardVandaagHref(kompasTarget);
  const siteHref = "/";
  const targetLabel = fromDashboard
    ? kompasTarget
      ? `dashboard_${kompasTarget}`
      : dashboardHref
    : siteHref;

  function trackExitClick() {
    trackEvent("intake_exit_click", {
      target: targetLabel,
      origin_domain: kompasTarget ?? "none",
      from_dashboard: fromDashboard,
    });
    clarityTag("intake_exit", kompasTarget ?? (fromDashboard ? "dashboard" : "site"));
  }

  if (fromDashboard) {
    return (
      <button
        type="button"
        onClick={() => {
          trackExitClick();
          router.replace(dashboardHref);
        }}
        aria-label="Terug naar dashboard"
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition ${exitSurfaceClass(variant)}`}
      >
        <ExitIcon />
      </button>
    );
  }

  return (
    <ExitButton
      href={siteHref}
      onClick={trackExitClick}
      label="Sluiten"
      variant={variant}
    />
  );
}
