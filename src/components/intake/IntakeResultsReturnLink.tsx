"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  hasIntakeReturnParam,
  INTAKE_RESULTS_HREF,
} from "@/lib/intake-return-link";

export default function IntakeResultsReturnLink() {
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());

  if (!hasIntakeReturnParam(params)) {
    return null;
  }

  return (
    <nav aria-label="Terug naar intake-resultaten" className="mb-6">
      <Link
        href={INTAKE_RESULTS_HREF}
        className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 underline decoration-emerald-700/35 underline-offset-[3px] hover:decoration-emerald-700"
      >
        ← Terug naar je leefstijl-overzicht
      </Link>
    </nav>
  );
}
