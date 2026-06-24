"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import DashboardBackLink from "@/components/app/DashboardBackLink";
import IntakeExit from "@/components/intake/IntakeExit";

function IntakeLayoutActionsInner() {
  const pathname = usePathname();
  const showDashboardBack = pathname.startsWith("/intake/plan");

  return (
    <div className="flex items-center gap-2">
      {showDashboardBack ? <DashboardBackLink surface="plan" /> : null}
      <IntakeExit />
    </div>
  );
}

export default function IntakeLayoutActions() {
  return (
    <Suspense fallback={<IntakeExit />}>
      <IntakeLayoutActionsInner />
    </Suspense>
  );
}
