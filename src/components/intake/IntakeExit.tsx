"use client";

import { usePathname, useSearchParams } from "next/navigation";
import ExitButton from "@/components/app/ExitButton";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";

type IntakeExitProps = {
  variant?: "on-dark" | "on-light";
};

const VALID_KOMPAS_DOMAINS = new Set([
  "slaap",
  "energie",
  "stress",
  "voeding",
  "beweging",
  "herstel",
  "verbinding",
]);

export default function IntakeExit({ variant = "on-dark" }: IntakeExitProps) {
  const params = useSearchParams();
  const pathname = usePathname();
  const fromDashboard = params.get("from") === "dashboard";
  const kompasParam = params.get("kompas");
  const kompasFromParam =
    kompasParam && VALID_KOMPAS_DOMAINS.has(kompasParam) ? kompasParam : null;
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
  const href = fromDashboard ? "/dashboard?tab=vandaag" : "/";
  const targetLabel =
    href.startsWith("/dashboard") && kompasTarget ? `dashboard_${kompasTarget}` : href;

  return (
    <ExitButton
      href={href}
      onClick={() => {
        trackEvent("intake_exit_click", {
          target: targetLabel,
          origin_domain: kompasTarget ?? "none",
          from_dashboard: fromDashboard,
        });
        clarityTag("intake_exit", kompasTarget ?? (fromDashboard ? "dashboard" : "site"));
      }}
      label={href.startsWith("/dashboard") ? "Terug naar dashboard" : "Sluiten"}
      variant={variant}
    />
  );
}
