"use client";

import { useSearchParams } from "next/navigation";
import ExitButton from "@/components/app/ExitButton";

type IntakeExitProps = {
  variant?: "on-dark" | "on-light";
};

export default function IntakeExit({ variant = "on-dark" }: IntakeExitProps) {
  const params = useSearchParams();
  const href = params.get("from") === "dashboard" ? "/dashboard" : "/";

  return (
    <ExitButton
      href={href}
      label={href === "/dashboard" ? "Terug naar dashboard" : "Sluiten"}
      variant={variant}
    />
  );
}
