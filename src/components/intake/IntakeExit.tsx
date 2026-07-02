"use client";

import { usePathname, useSearchParams } from "next/navigation";
import ExitButton from "@/components/app/ExitButton";

type IntakeExitProps = {
  variant?: "on-dark" | "on-light";
};

export default function IntakeExit({ variant = "on-dark" }: IntakeExitProps) {
  const params = useSearchParams();
  const pathname = usePathname();
  const fromDashboard = params.get("from") === "dashboard";
  const isStressCheckin = pathname === "/intake/stress";
  const href =
    fromDashboard && isStressCheckin
      ? "/dashboard?tab=vandaag&kompas=stress"
      : fromDashboard
        ? "/dashboard"
        : "/";

  return (
    <ExitButton
      href={href}
      label={href === "/dashboard" ? "Terug naar dashboard" : "Sluiten"}
      variant={variant}
    />
  );
}
