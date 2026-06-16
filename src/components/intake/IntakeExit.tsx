"use client";

import { useSearchParams } from "next/navigation";
import ExitButton from "@/components/app/ExitButton";

export default function IntakeExit() {
  const params = useSearchParams();
  const href = params.get("from") === "dashboard" ? "/dashboard" : "/";

  return (
    <ExitButton
      href={href}
      label={href === "/dashboard" ? "Terug naar dashboard" : "Sluiten"}
    />
  );
}
