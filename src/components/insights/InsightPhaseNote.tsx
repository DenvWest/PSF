"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/ga4";

type InsightPhaseNoteProps = {
  planPhase: 1 | 2 | 3;
};

export default function InsightPhaseNote({ planPhase }: InsightPhaseNoteProps) {
  return (
    <aside
      role="note"
      className="mt-10 border-t border-stone-200/80 pt-6 text-sm text-stone-600"
    >
      Hoort bij fase {planPhase} van het leefstijlplan. Waar sta jij?{" "}
      <Link
        href="/intake"
        onClick={() =>
          trackEvent("focus_area_click", { destination: "artikel_plan_fase" })
        }
        className="font-medium text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px] transition hover:decoration-[#5A8F6A]"
      >
        Doe de gratis Leefstijlcheck →
      </Link>
    </aside>
  );
}
