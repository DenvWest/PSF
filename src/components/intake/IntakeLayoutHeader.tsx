"use client";

import { usePathname, useSearchParams } from "next/navigation";
import IntakeLayoutActions from "@/components/intake/IntakeLayoutActions";

export default function IntakeLayoutHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isPlanPage = pathname.startsWith("/intake/plan");
  const isResultsPage = searchParams.get("resultaten") === "true";

  if (isPlanPage || isResultsPage) {
    return null;
  }

  return (
    <div
      className="intake-layout-header flex w-full items-center justify-end px-6 pb-3 pt-5"
      style={{ boxSizing: "border-box" }}
    >
      <IntakeLayoutActions />
    </div>
  );
}
