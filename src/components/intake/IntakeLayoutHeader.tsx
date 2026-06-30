"use client";

import { usePathname } from "next/navigation";
import IntakeLayoutActions from "@/components/intake/IntakeLayoutActions";

export default function IntakeLayoutHeader() {
  const pathname = usePathname();
  const isPlanPage = pathname.startsWith("/intake/plan");
  const isMainIntake = pathname === "/intake";

  if (isPlanPage || isMainIntake) {
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
