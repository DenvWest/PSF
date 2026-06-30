"use client";

import { Suspense } from "react";
import IntakeExit from "@/components/intake/IntakeExit";
import ExitButton from "@/components/app/ExitButton";

type IntakeInBoxExitProps = {
  className?: string;
  variant?: "on-dark" | "on-light";
};

export default function IntakeInBoxExit({
  className = "",
  variant = "on-dark",
}: IntakeInBoxExitProps) {
  return (
    <div className={`flex justify-end ${className}`.trim()}>
      <Suspense fallback={<ExitButton variant={variant} />}>
        <IntakeExit variant={variant} />
      </Suspense>
    </div>
  );
}
