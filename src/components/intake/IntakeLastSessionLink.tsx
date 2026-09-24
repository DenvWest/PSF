"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { INTAKE_RESULTS_HREF } from "@/lib/intake-return-link";
import { getLastSession, latestMeasurementAt } from "@/lib/intake-storage";

type IntakeLastSessionLinkProps = {
  theme?: "light" | "dark";
  className?: string;
};

function formatSessionDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function IntakeLastSessionLink({
  theme = "light",
  className,
}: IntakeLastSessionLinkProps) {
  const [measuredAt, setMeasuredAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getLastSession().then((loaded) => {
      if (!cancelled) {
        setMeasuredAt(
          loaded?.session
            ? latestMeasurementAt(
                loaded.session.timestamp,
                loaded.latestNutritionLogAt,
              )
            : null,
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const linkClass =
    theme === "dark"
      ? "text-[13px] text-white/35 underline decoration-white/15 underline-offset-[3px] transition hover:text-white/50"
      : "text-sm text-stone-500 underline decoration-stone-300 underline-offset-[3px] transition hover:text-stone-700";

  return (
    <div
      className={className ? `min-h-[1.5rem] ${className}` : "min-h-[1.5rem]"}
      aria-hidden={measuredAt !== null ? undefined : true}
    >
      {measuredAt !== null ? (
        <Link href={INTAKE_RESULTS_HREF} className={linkClass}>
          Laatste meting: {formatSessionDate(measuredAt)} — bekijk
          resultaten →
        </Link>
      ) : null}
    </div>
  );
}
