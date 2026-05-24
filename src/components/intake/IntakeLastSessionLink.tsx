"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { INTAKE_RESULTS_HREF } from "@/lib/intake-return-link";
import {
  getLastSession,
  type IntakeSessionPayload,
} from "@/lib/intake-storage";

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
  const [lastSession, setLastSession] = useState<IntakeSessionPayload | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    void getLastSession().then((session) => {
      if (!cancelled) {
        setLastSession(session);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!lastSession) {
    return null;
  }

  const linkClass =
    theme === "dark"
      ? "text-[13px] text-white/35 underline decoration-white/15 underline-offset-[3px] transition hover:text-white/50"
      : "text-sm text-stone-500 underline decoration-stone-300 underline-offset-[3px] transition hover:text-stone-700";

  return (
    <Link
      href={INTAKE_RESULTS_HREF}
      className={className ? `${linkClass} ${className}` : linkClass}
    >
      Laatste meting: {formatSessionDate(lastSession.timestamp)} — bekijk
      resultaten →
    </Link>
  );
}
